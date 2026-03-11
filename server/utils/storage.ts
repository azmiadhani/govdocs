import { mkdir, writeFile, unlink } from 'fs/promises'
import { join, basename } from 'path'

export function getUploadPath(): string {
  return process.env.STORAGE_PATH || join(process.cwd(), 'uploads')
}

export function sanitizeFilename(original: string): string {
  const ext = original.split('.').pop()?.toLowerCase() || 'pdf'
  const timestamp = Date.now()
  const random = Math.random().toString(36).slice(2, 8)
  return `${timestamp}-${random}.${ext}`
}

export function buildLocalPath(filename: string): string {
  return join(getUploadPath(), basename(filename))
}

export async function saveFile(buffer: Buffer, filename: string): Promise<string> {
  if (useS3()) {
    return saveToS3(buffer, filename)
  }
  return saveToLocal(buffer, filename)
}

export async function deleteFile(filePath: string): Promise<void> {
  if (useS3()) {
    await deleteFromS3(filePath)
  } else {
    try {
      await unlink(filePath)
    } catch {
      // File may already be missing
    }
  }
}

// ─── Local Storage ───────────────────────────────────────────────────────────

async function saveToLocal(buffer: Buffer, filename: string): Promise<string> {
  const uploadDir = getUploadPath()
  await mkdir(uploadDir, { recursive: true })
  const filePath = buildLocalPath(filename)
  await writeFile(filePath, buffer)
  return filePath
}

// ─── S3 Storage ──────────────────────────────────────────────────────────────

function useS3(): boolean {
  return !!(process.env.AWS_BUCKET && process.env.AWS_ACCESS_KEY)
}

async function saveToS3(buffer: Buffer, filename: string): Promise<string> {
  const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3')

  const client = new S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY!,
      secretAccessKey: process.env.AWS_SECRET_KEY!,
    },
  })

  const key = `documents/${filename}`
  await client.send(
    new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET!,
      Key: key,
      Body: buffer,
      ContentType: 'application/pdf',
    }),
  )

  return `s3://${process.env.AWS_BUCKET}/${key}`
}

async function deleteFromS3(s3Path: string): Promise<void> {
  const { S3Client, DeleteObjectCommand } = await import('@aws-sdk/client-s3')

  // s3Path format: s3://bucket/key
  const withoutScheme = s3Path.replace('s3://', '')
  const slashIdx = withoutScheme.indexOf('/')
  const bucket = withoutScheme.slice(0, slashIdx)
  const key = withoutScheme.slice(slashIdx + 1)

  const client = new S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY!,
      secretAccessKey: process.env.AWS_SECRET_KEY!,
    },
  })

  await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }))
}
