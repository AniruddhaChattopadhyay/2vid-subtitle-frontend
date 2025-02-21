import { type NextRequest, NextResponse } from "next/server"
import { exec } from "child_process"
import { promisify } from "util"
import fs from "fs"
import path from "path"
import { Storage } from '@google-cloud/storage'
import { uploadToGCS } from "../../utils/storage"

const execAsync = promisify(exec)

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const video = formData.get("video") as File
  const transcription = formData.get("transcription") as string

  if (!video || !transcription) {
    return NextResponse.json({ error: "Video and transcription are required" }, { status: 400 })
  }

  try {
    const videoUrl = await uploadToGCS(video)
    return NextResponse.json({ url: videoUrl })
  } catch (error) {
    console.error('Error processing video:', error)
    return NextResponse.json({ error: 'Failed to process video' }, { status: 500 })
  }
   
}



