// @ts-nocheck
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

if (!process.env.AWS_REGION || !process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY || !process.env.AWS_S3_BUCKET_NAME) {
  throw new Error("AWS credentials missing inside .env.local");
}

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export async function uploadFileToS3(file: Buffer, fileName: string, contentType: string) {
  const fileBuffer = file;
  const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: fileName,
      Body: fileBuffer,
      ContentType: contentType,
  };

  const command = new PutObjectCommand(params);
  await s3Client.send(command);
  
  // Return the public URL based on region
  return `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
}

export async function deleteFileFromS3(fileUrl: string) {
  const key = fileUrl.split("/").pop(); // Simple extraction assuming path format
  const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key,
  };
  const command = new DeleteObjectCommand(params);
  return s3Client.send(command);
}
