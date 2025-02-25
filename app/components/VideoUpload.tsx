"use client";

import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrash,
  faUpload,
  faClosed,
  faClosedCaptioning,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";

interface VideoUploadProps {
  onUpload: (
    file: File,
    setTranscription: (text: string) => void,
    setIsTranscribing: (value: boolean) => void
  ) => void;
}

export default function VideoUpload({ onUpload }: VideoUploadProps) {
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [transcription, setTranscription] = useState<string>("");
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [currentFile, setCurrentFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setVideoPreview(previewUrl);
      setCurrentFile(file);
      setTranscription(""); // Reset transcription on new upload
    }
  };

  const handleDelete = () => {
    setVideoPreview(null);
    setTranscription("");
    setCurrentFile(null);
  };

  const handleTranscribe = async () => {
    if (!currentFile) return;
    onUpload(currentFile, setTranscription, setIsTranscribing);
  };

  if (videoPreview) {
    return (
      <div className="w-full max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Left Column - Video & Subtitles */}
          <div>
            <div className="bg-[#0B1120] rounded-2xl">
              {/* Header */}
              <div className="flex items-center justify-between px-6 pt-6 pb-4">
                <h2 className="text-lg font-medium text-white">
                  Subtitle Video
                </h2>
                <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white">
                  <FontAwesomeIcon icon={faPlus} />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex px-6 mb-6">
                <button className="mr-8 text-white font-medium border-b-2 border-white pb-2">
                  Subtitles
                </button>
                <button className="mr-8 text-gray-500 hover:text-gray-300 pb-2">
                  Styles
                </button>
                <button className="text-gray-500 hover:text-gray-300 pb-2">
                  Options
                </button>
              </div>

              {/* Video Player */}
              <div className="px-6 pb-6">
                <div className="aspect-video bg-black rounded-lg overflow-hidden">
                  <video
                    src={videoPreview}
                    className="w-full h-full"
                    controls
                    controlsList="nodownload nofullscreen noremoteplayback"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="px-6 pb-6 flex gap-3">
                <button
                  onClick={handleDelete}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-[#F43F5E] text-white rounded-xl transition-colors hover:bg-[#FB7185]"
                >
                  <FontAwesomeIcon icon={faTrash} className="text-lg" />
                  Delete
                </button>
                <label className="flex items-center justify-center gap-2 px-6 py-3 bg-[#3B82F6] text-white rounded-xl cursor-pointer transition-colors hover:bg-[#60A5FA]">
                  <FontAwesomeIcon icon={faUpload} className="text-lg" />
                  Upload Another
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Right Column - Editor */}
          <div className="bg-[#0B1120] rounded-2xl p-6">
            <h2 className="text-2xl font-semibold text-white mb-6">
              Edit Transcription
            </h2>
            <div className="relative">
              <textarea
                value={transcription}
                onChange={(e) => setTranscription(e.target.value)}
                className="w-full h-[600px] p-6 rounded-2xl bg-[#1E293B] text-gray-100 border-0 resize-none focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-colors text-base leading-relaxed"
                placeholder={
                  isTranscribing
                    ? "Transcribing..."
                    : "Transcription will appear here..."
                }
              />
              {!transcription && !isTranscribing && (
                <button
                  onClick={handleTranscribe}
                  className="absolute top-4 right-4 flex items-center gap-2 px-6 py-2.5 bg-[#8B5CF6] text-white rounded-xl transition-colors hover:bg-[#A78BFA]"
                >
                  <FontAwesomeIcon icon={faClosedCaptioning} />
                  Transcribe
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Initial upload state
  return (
    <div className="w-full max-w-md">
      <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-700 rounded-xl bg-[#1E293B] hover:bg-[#1E293B]/80 transition-colors">
        <div className="mb-4 text-4xl text-gray-400">+</div>
        <h3 className="text-lg font-medium mb-2 text-white">Upload Video</h3>
        <p className="text-sm text-gray-400 mb-6 text-center">
          Choose a video to add subtitles
        </p>
        <label className="px-5 py-2.5 bg-[#2196F3] hover:bg-[#42A5F5] text-white rounded-lg cursor-pointer transition-colors">
          Select Video
          <input
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      </div>
    </div>
  );
}
