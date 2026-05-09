import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
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

export function createStorageKey(filename) {
  return `${Date.now()}-${sanitizeFilename(filename)}`;
}

export async function createPresignedUpload({ filename, contentType }) {
  const key = createStorageKey(filename);
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
  });
  const url = await getSignedUrl(s3, command, { expiresIn: 900 });
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

export async function deleteFile(url) {
  const key = url.split(`/${BUCKET}/`)[1];
  if (!key) {
    console.warn(`deleteFile: could not extract key from URL: ${url}`);
    return;
  }
  await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
}
