import { type NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"
import ffmpeg from 'fluent-ffmpeg'
import { join } from 'path'
import { tmpdir } from 'os'
import { writeFile, readFile, unlink } from 'fs/promises'
import { uploadToGCS } from "../../utils/storage"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})


export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const video = formData.get("video") as File
  
  if (!video) {
    return NextResponse.json({ error: "No video file provided" }, { status: 400 })
  }

  try {
    // Save video to temp file
    const videoBuffer = Buffer.from(await video.arrayBuffer())
    const inputPath = join(tmpdir(), 'input.mp4')
    const outputPath = join(tmpdir(), 'output.mp3')
    await writeFile(inputPath, videoBuffer)

    // Convert video to audio
    await new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .toFormat('mp3')
        .audioFrequency(16000)
        .on('end', resolve)
        .on('error', reject)
        .save(outputPath)
    })

    // Create file for OpenAI API
    const audioFile = await readFile(outputPath)
    const audioUrl = await uploadToGCS(video)
    const transcription = await openai.audio.transcriptions.create({
      file: new File([audioFile], 'audio.mp3', { type: 'audio/mp3' }),
      model: "whisper-1",
    })

     // Clean up temporary files
     await Promise.all([
      unlink(inputPath),
      unlink(outputPath)
    ]).catch(console.error)

    return NextResponse.json({ transcription: transcription.text, audioFilePath: audioUrl })
  } catch (error) {
    console.error("Error processing video:", error)
    return NextResponse.json({ error: "Error processing video" }, { status: 500 })
  }
}