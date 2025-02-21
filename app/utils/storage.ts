import { Storage } from '@google-cloud/storage'
import fs from "fs"
import path from "path"

export async function uploadToGCS(file: File): Promise<string> {
  // Initialize Google Cloud Storage
  const storage = new Storage({
    projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
    credentials: JSON.parse(process.env.GOOGLE_CLOUD_CREDENTIALS || '{}')
  })

  const bucketName = process.env.GOOGLE_CLOUD_BUCKET_NAME || ''
  const bucket = storage.bucket(bucketName)
  
  // Save file to temporary location
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  const tempFilePath = path.join('/tmp', file.name)
  fs.writeFileSync(tempFilePath, buffer)

  try {
    // Generate unique filename
    const fileName = `videos/${Date.now()}-${file.name}`
    
    // Upload file to Google Cloud Storage
    await bucket.upload(tempFilePath, {
      destination: fileName,
      metadata: {
        contentType: file.type,
      },
    })

    // Get public URL
    const publicUrl = `https://storage.googleapis.com/${bucketName}/${fileName}`
    return publicUrl
  } finally {
    // Clean up temporary file
    fs.unlinkSync(tempFilePath)
  }
}