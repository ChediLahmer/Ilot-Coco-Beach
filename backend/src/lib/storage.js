import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
  region: process.env.S3_REGION || "us-east-1",
  endpoint: process.env.S3_ENDPOINT || "http://localhost:9100",
  forcePathStyle: true,
  // Keep PutObject free of the SDK's default CRC32 checksum (added in >= 3.729)
  // for maximum MinIO compatibility — matches the behavior that has worked in
  // production before the SDK bump.
  requestChecksumCalculation: "WHEN_REQUIRED",
  responseChecksumValidation: "WHEN_REQUIRED",
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY || "minioadmin",
    secretAccessKey: process.env.S3_SECRET_KEY || "minioadmin",
  },
});

// Presigned upload URLs must be signed for the PUBLIC host the browser connects
// to (SigV4 signs the Host header), so use a client pointed at S3_PUBLIC_URL.
const s3Presign = new S3Client({
  region: process.env.S3_REGION || "us-east-1",
  endpoint:
    process.env.S3_PUBLIC_URL ||
    process.env.S3_ENDPOINT ||
    "http://localhost:9100",
  forcePathStyle: true,
  // AWS SDK v3 (>= 3.729) adds a default CRC32 checksum to PutObject. For a
  // browser-issued presigned PUT that would sign x-amz-sdk-checksum-algorithm /
  // x-amz-checksum-crc32 headers the browser cannot reproduce, causing
  // SignatureDoesNotMatch. WHEN_REQUIRED disables it (PutObject doesn't need it).
  requestChecksumCalculation: "WHEN_REQUIRED",
  responseChecksumValidation: "WHEN_REQUIRED",
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY || "minioadmin",
    secretAccessKey: process.env.S3_SECRET_KEY || "minioadmin",
  },
});

const BUCKET = process.env.S3_BUCKET || "cocobeach";

function getS3Metadata() {
  return {
    CacheControl: "public, max-age=31536000, immutable",
    Metadata: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
      "Access-Control-Allow-Headers": "Range, Content-Type",
    },
  };
}

function sanitizeFilename(filename) {
  return filename
    .replace(/^.*[\\/]/, "")
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/^\.+/, "_");
}

export function buildPublicUrl(key) {
  const baseUrl = process.env.S3_PUBLIC_URL || "http://localhost:9100";
  return `${baseUrl}/${BUCKET}/${key}`;
}

export function extractStorageKeyFromUrl(url) {
  try {
    const parsed = new URL(url);
    const marker = `/${BUCKET}/`;
    const idx = parsed.pathname.indexOf(marker);
    if (idx === -1) return null;
    return decodeURIComponent(parsed.pathname.slice(idx + marker.length));
  } catch {
    return null;
  }
}

// A media URL still under the "incoming/" prefix has not been processed yet
// (e.g. a freshly uploaded video awaiting background transcode). Matches both
// raw storage URLs and proxy-wrapped URLs (where the path is URL-encoded).
export function isIncomingUrl(url) {
  if (typeof url !== "string") return false;
  return url.includes("/incoming/") || url.includes("%2Fincoming%2F");
}

export function createStorageKey(filename) {
  return createStorageKeyWithPrefix(filename, "");
}

export function createStorageKeyWithPrefix(filename, prefix = "") {
  return `${prefix}${Date.now()}-${sanitizeFilename(filename)}`;
}

export async function createPresignedUpload({ filename, contentType }) {
  // Land presigned uploads under incoming/ so the background job can transcode
  // and promote them; the URL stays "processing" until promotion completes.
  const key = createStorageKeyWithPrefix(filename, "incoming/");
  // Only ContentType is signed: the browser PUT sends nothing else, so adding
  // Cache-Control / x-amz-meta-* here would break the SigV4 signature.
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
  });
  const url = await getSignedUrl(s3Presign, command, { expiresIn: 900 });
  return { key, url, publicUrl: buildPublicUrl(key) };
}

export async function findExistingByHash(hash) {
  const key = `dedup/${hash}`;
  try {
    const head = await s3.send(
      new HeadObjectCommand({ Bucket: BUCKET, Key: key }),
    );
    const realKey = head.Metadata?.["original-key"];
    if (realKey) return buildPublicUrl(realKey);
    return null;
  } catch {
    return null;
  }
}

export async function uploadFile(buffer, filename, contentType, hash) {
  const key = createStorageKey(filename);
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      ...getS3Metadata(),
    }),
  );

  if (hash) {
    await s3
      .send(
        new PutObjectCommand({
          Bucket: BUCKET,
          Key: `dedup/${hash}`,
          Body: "",
          Metadata: { "original-key": key },
        }),
      )
      .catch(() => {});
  }

  return buildPublicUrl(key);
}

export async function writeDedupMarker(hash, key) {
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: `dedup/${hash}`,
      Body: "",
      Metadata: { "original-key": key },
    }),
  );
}

export async function uploadBufferToKey(key, buffer, contentType) {
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      ...getS3Metadata(),
    }),
  );
}

export async function headObject(key) {
  return s3.send(new HeadObjectCommand({ Bucket: BUCKET, Key: key }));
}

export async function listObjects(prefix) {
  const objects = [];
  let ContinuationToken;
  try {
    do {
      const res = await s3.send(
        new ListObjectsV2Command({
          Bucket: BUCKET,
          Prefix: prefix,
          ContinuationToken,
        }),
      );
      objects.push(...(res.Contents || []));
      ContinuationToken = res.IsTruncated
        ? res.NextContinuationToken
        : undefined;
    } while (ContinuationToken);
  } catch (error) {
    if (error?.name === "NoSuchKey" || error?.Code === "NoSuchKey") {
      return [];
    }
    throw error;
  }
  return objects;
}

export async function getObjectBuffer(key) {
  const res = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }));
  const chunks = [];
  for await (const chunk of res.Body) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

export async function getObjectStream(key, range) {
  return s3.send(
    new GetObjectCommand({
      Bucket: BUCKET,
      Key: key,
      ...(range ? { Range: range } : {}),
    }),
  );
}

export async function deleteObjectKey(key) {
  await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
}

export async function deleteFile(url) {
  const key = extractStorageKeyFromUrl(url);
  if (!key) {
    console.warn(`deleteFile: could not extract key from URL: ${url}`);
    return;
  }
  await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
}
