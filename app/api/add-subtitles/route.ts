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
  const audioUrl = formData.get("audioUrl") as String
  const transcription = formData.get("transcription") as string
  console.log(video)
  console.log(audioUrl)
  console.log(transcription)


  if (!video || !transcription) {
    return NextResponse.json({ error: "Video and transcription are required" }, { status: 400 })
  }

  try {
    const videoUrl = await uploadToGCS(video,"video")
    const aiResponse = await fetch(`${process.env.AI_BACKEND_URL}/subtitle`!, {
    method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        video_url: videoUrl,
        audio_url: audioUrl,
        script: transcription
      }),
       // Add these options to handle SSL issues
       cache: 'no-store',
       // @ts-ignore - Next.js types don't include this option but it's valid
       rejectUnauthorized: false

    })
    if (!aiResponse.ok) {
      throw new Error('AI backend request failed')
    }

    const aiData = await aiResponse.json()
    console.log(aiData)
    return NextResponse.json({ subtitledVideoUrl: aiData.video_link})
  } catch (error) {
    console.error('Error processing video:', error)
    return NextResponse.json({ error: 'Failed to process video' }, { status: 500 })
  }
   
}



