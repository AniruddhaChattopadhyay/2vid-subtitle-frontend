import VideoUploader from "@/components/VideoUploader"

export default function Home() {
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Video Subtitle Generator</h1>
      <VideoUploader />
    </main>
  )
}

