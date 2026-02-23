// @ts-nocheck
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

// Lazy — S3 client is created only when a function is actually called (not at build time)
function getS3Client() {
  if (
    !process.env.S3_REGION ||
    !process.env.S3_ACCESS_KEY_ID ||
    !process.env.S3_SECRET_ACCESS_KEY
  ) {
    throw new Error("AWS credentials missing. Set S3_REGION, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY in environment variables.");
  }
  return new S3Client({
    region: process.env.S3_REGION,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    },
  });
}

export async function uploadFileToS3(file: Buffer, fileName: string, contentType: string) {
  const s3Client = getS3Client();
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: fileName,
    Body: file,
    ContentType: contentType,
  };

  await s3Client.send(new PutObjectCommand(params));

  return `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.S3_REGION}.amazonaws.com/${fileName}`;
}

export async function deleteFileFromS3(fileUrl: string) {
  const s3Client = getS3Client();
  const key = fileUrl.split("/").pop();
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key,
  };
  return s3Client.send(new DeleteObjectCommand(params));
}
