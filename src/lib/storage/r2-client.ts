import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";

// Initialize R2 client (S3-compatible)
const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
  },
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME || "";
const PUBLIC_URL = process.env.R2_PUBLIC_URL || "";

/**
 * Upload a file to R2
 */
export async function uploadToR2(params: {
  key: string;
  body: Buffer | Uint8Array | string;
  contentType: string;
  metadata?: Record<string, string>;
}): Promise<string> {
  const { key, body, contentType, metadata } = params;

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: body,
    ContentType: contentType,
    Metadata: metadata,
  });

  await r2Client.send(command);

  return `${PUBLIC_URL}/${key}`;
}

/**
 * Upload large file to R2 with multipart upload
 */
export async function uploadLargeFileToR2(params: {
  key: string;
  body: Buffer;
  contentType: string;
  metadata?: Record<string, string>;
}): Promise<string> {
  const { key, body, contentType, metadata } = params;

  const upload = new Upload({
    client: r2Client,
    params: {
      Bucket: BUCKET_NAME,
      Key: key,
      Body: body,
      ContentType: contentType,
      Metadata: metadata,
    },
  });

  await upload.done();

  return `${PUBLIC_URL}/${key}`;
}

/**
 * Upload debate audio to R2
 */
export async function uploadDebateAudio(debateId: string, audioBuffer: Buffer): Promise<string> {
  const key = `debates/${debateId}/audio.mp3`;

  return await uploadLargeFileToR2({
    key,
    body: audioBuffer,
    contentType: "audio/mpeg",
    metadata: {
      debateId,
      uploadedAt: new Date().toISOString(),
    },
  });
}

/**
 * Upload persona avatar to R2
 */
export async function uploadPersonaAvatar(personaId: string, imageBuffer: Buffer): Promise<string> {
  const key = `avatars/${personaId}.jpg`;

  return await uploadToR2({
    key,
    body: imageBuffer,
    contentType: "image/jpeg",
    metadata: {
      personaId,
      uploadedAt: new Date().toISOString(),
    },
  });
}

/**
 * Download a file from R2
 */
export async function downloadFromR2(key: string): Promise<Buffer> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  const response = await r2Client.send(command);

  if (!response.Body) {
    throw new Error(`File not found: ${key}`);
  }

  const chunks: Uint8Array[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for await (const chunk of response.Body as any) {
    chunks.push(chunk);
  }

  return Buffer.concat(chunks);
}

/**
 * Delete a file from R2
 */
export async function deleteFromR2(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  await r2Client.send(command);
}

/**
 * Delete debate audio from R2
 */
export async function deleteDebateAudio(debateId: string): Promise<void> {
  const key = `debates/${debateId}/audio.mp3`;
  await deleteFromR2(key);
}

/**
 * Delete persona avatar from R2
 */
export async function deletePersonaAvatar(personaId: string): Promise<void> {
  const key = `avatars/${personaId}.jpg`;
  await deleteFromR2(key);
}

/**
 * Generate a fallback avatar with initials
 */
export function generateInitialsAvatar(name: string): string {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Generate SVG with initials
  const svg = `
    <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="200" fill="#4F46E5"/>
      <text x="100" y="100" font-family="Arial, sans-serif" font-size="80" fill="white" text-anchor="middle" dy=".3em">${initials}</text>
    </svg>
  `.trim();

  // Return as data URL
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}
