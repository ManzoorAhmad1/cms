// @ts-nocheck
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

// Lazy — S3 client is created only when a function is actually called (not at build time)
function getS3Client() {
  if (
    !process.env.AWS_REGION ||
    !process.env.AWS_ACCESS_KEY_ID ||
    !process.env.AWS_SECRET_ACCESS_KEY
  ) {
    throw new Error("AWS credentials missing. Set AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY in environment variables.");
  }
  return new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });
}

export async function uploadFileToS3(file: Buffer, fileName: string, contentType: string) {
  const s3Client = getS3Client();
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: fileName,
    Body: file,
    ContentType: contentType,
  };

  await s3Client.send(new PutObjectCommand(params));

  return `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
}

export async function deleteFileFromS3(fileUrl: string) {
  const s3Client = getS3Client();
  const key = fileUrl.split("/").pop();
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: key,
  };
  return s3Client.send(new DeleteObjectCommand(params));
}
