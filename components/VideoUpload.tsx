import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUpload,
  faSpinner,
  faTimes,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import { Progress } from "@/components/ui/progress";

export default function VideoUpload({ onUpload }: VideoUploadProps) {
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [transcription, setTranscription] = useState<string>("");
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [progress, setProgress] = useState(0);

  // ... existing handlers

  if (!videoPreview) {
    return (
      <div className="max-w-3xl mx-auto">
        <label className="group relative block w-full aspect-video rounded-2xl border-2 border-dashed border-gray-600 hover:border-blue-500 transition-colors">
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="bg-blue-500/10 rounded-full p-4 mb-4 group-hover:bg-blue-500/20 transition-colors">
              <FontAwesomeIcon
                icon={faUpload}
                className="text-2xl text-blue-400"
              />
            </div>
            <p className="text-lg font-medium text-gray-400 group-hover:text-gray-300">
              Drop your video here or click to browse
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Supports MP4, MOV, AVI (max 500MB)
            </p>
          </div>
          <input
            type="file"
            accept="video/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </label>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto bg-gray-800/30 rounded-2xl backdrop-blur-sm border border-gray-700">
      <div className="grid lg:grid-cols-2 gap-6 p-6">
        {/* Video Preview Section */}
        <div className="space-y-6">
          <div className="aspect-video bg-black rounded-lg overflow-hidden">
            <video
              src={videoPreview}
              className="w-full h-full"
              controls
              controlsList="nodownload"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleDelete}
              className="flex-1 px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
            >
              Remove Video
            </button>
            <label className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-lg cursor-pointer transition-colors">
              Change Video
              <input
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Transcription Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">
              Video Transcription
            </h2>
            {!transcription && !isTranscribing && (
              <button
                onClick={handleTranscribe}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Start Transcription
              </button>
            )}
          </div>

          {isTranscribing && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-gray-400 text-center">
                Transcribing your video... {progress}%
              </p>
            </div>
          )}

          {errorMessage && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
              {errorMessage}
            </div>
          )}

          <div className="relative">
            <textarea
              value={transcription}
              onChange={(e) => setTranscription(e.target.value)}
              className="w-full h-[400px] p-4 bg-gray-900/50 text-gray-200 rounded-lg border border-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              placeholder={
                isTranscribing
                  ? "Transcribing your video..."
                  : "Your transcription will appear here..."
              }
              disabled={isTranscribing}
            />
          </div>

          {transcription && (
            <div className="flex justify-end">
              <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                Generate Subtitles
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
