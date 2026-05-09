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
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY || "minioadmin",
    secretAccessKey: process.env.S3_SECRET_KEY || "minioadmin",
  },
});

const BUCKET = process.env.S3_BUCKET || "cocobeach";

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

export function createStorageKey(filename) {
  return createStorageKeyWithPrefix(filename, "");
}

export function createStorageKeyWithPrefix(filename, prefix = "") {
  return `${prefix}${Date.now()}-${sanitizeFilename(filename)}`;
}

export async function createPresignedUpload({ filename, contentType }) {
  const key = createStorageKeyWithPrefix(filename, "");
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
  });
  let url = await getSignedUrl(s3, command, { expiresIn: 900 });

  // Rewrite the internal S3 endpoint to the public URL so browsers can PUT directly,
  // bypassing the app-server (and its HTTP proxy timeout).
  const internalBase = (
    process.env.S3_ENDPOINT || "http://localhost:9100"
  ).replace(/\/$/, "");
  const publicBase = (process.env.S3_PUBLIC_URL || internalBase).replace(
    /\/$/,
    "",
  );
  if (internalBase !== publicBase && url.startsWith(internalBase)) {
    url = publicBase + url.slice(internalBase.length);
  }

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
