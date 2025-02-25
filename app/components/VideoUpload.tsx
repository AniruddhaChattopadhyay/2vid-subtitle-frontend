"use client";

import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUpload,
  faSpinner,
  faCheck,
  faPalette,
  faFont,
  faGripLines,
  faTextHeight,
} from "@fortawesome/free-solid-svg-icons";
import React from "react";
import { ChromePicker, ColorResult } from "react-color";
import Draggable from "react-draggable";
import SubtitleCustomizer from "./SubtitleCustomizer";

interface VideoUploadProps {
  onUpload: (
    file: File,
    setTranscription: (text: string) => void,
    setIsTranscribing: (value: boolean) => void,
    setAudioUrl: (url: string) => void
  ) => void;
}

export type SubtitleColors = {
  line1: {
    text: string;
    background: string;
  };
  line2: {
    text: string;
    background: string;
  };
};

export type SubtitleFont =
  | "Arial"
  | "Helvetica"
  | "Times New Roman"
  | "Roboto"
  | "Open Sans";
export type SubtitlePosition = { x: number; y: number };

export default function VideoUpload({ onUpload }: VideoUploadProps) {
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [transcription, setTranscription] = useState("");
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [isGeneratingSubtitles, setIsGeneratingSubtitles] = useState(false);
  const [audioUrl, setAudioUrl] = useState("");
  const [subtitledVideoUrl, setSubtitledVideoUrl] = useState<string | null>(
    null
  );
  const [subtitleColors, setSubtitleColors] = useState<SubtitleColors>({
    line1: {
      text: "#FFFFFF",
      background: "#A855F7",
    },
    line2: {
      text: "#FFFFFF",
      background: "#7C3AED",
    },
  });
  const [activeColorPicker, setActiveColorPicker] = useState<string | null>(
    null
  );
  const [subtitlePosition, setSubtitlePosition] = useState<SubtitlePosition>({
    x: 0,
    y: 0,
  });
  const [subtitleFont, setSubtitleFont] = useState<SubtitleFont>("Arial");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [subtitleSize, setSubtitleSize] = useState<number>(5);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Clean up previous video URL if it exists
      if (videoPreview) {
        URL.revokeObjectURL(videoPreview);
      }
      if (subtitledVideoUrl) {
        setSubtitledVideoUrl(null);
      }

      // Reset states for new video
      setTranscription("");
      setIsTranscribing(false);
      setIsGeneratingSubtitles(false);
      setAudioUrl("");

      // Create a URL for the new video preview
      const previewUrl = URL.createObjectURL(file);
      setVideoPreview(previewUrl);
      setCurrentFile(file);

      // Reset subtitle position to center
      setSubtitlePosition({ x: 0, y: 0 });

      // Start the transcription process
      onUpload(file, setTranscription, setIsTranscribing, setAudioUrl);
    }
  };

  const handleGenerateSubtitles = async () => {
    if (!currentFile || !transcription || !audioUrl || isGeneratingSubtitles) {
      return;
    }

    setIsGeneratingSubtitles(true);
    console.log("Generating subtitles...", transcription);

    try {
      console.log("Generating subtitles...");
      // Get video element dimensions for calculating relative position
      const videoElement = document.querySelector("video");
      const videoRect = videoElement?.getBoundingClientRect();

      // Calculate relative position (0-1 range)
      const relativePosition = {
        x: videoRect
          ? (subtitlePosition.x - videoRect.left) / videoRect.width
          : 0.5,
        y: videoRect
          ? Math.min(
              1,
              Math.max(
                0,
                (subtitlePosition.y + videoRect.height / 2) / videoRect.height
              )
            )
          : 0.5,
      };

      // Debug log
      console.log(
        "Subtitle Position Y (relative to draggable parent):",
        subtitlePosition.y
      );
      console.log("Video Rect Top (from top of viewport):", videoRect?.top);
      console.log("Video Rect Height:", videoRect?.height);
      console.log("Relative Position Y:", relativePosition.y);

      // Additional debug logs for window and element positions
      console.log("window.scrollY:", window.scrollY);
      if (videoElement) {
        console.log(
          "videoElement.offsetTop (relative to offsetParent):",
          videoElement.offsetTop
        );
        console.log(
          "videoElement.clientTop (border width):",
          videoElement.clientTop
        );
      } else {
        console.log("videoElement is null");
      }

      const formData = new FormData();
      formData.append("video", currentFile);
      formData.append("transcription", transcription);
      formData.append("audioUrl", audioUrl);
      formData.append("subtitleColors", JSON.stringify(subtitleColors));
      formData.append("subtitleFont", subtitleFont);
      formData.append("subtitlePosition", JSON.stringify(relativePosition));
      formData.append("subtitleSize", subtitleSize.toString());

      const response = await fetch("/api/add-subtitles", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate subtitles");
      }

      if (data.subtitledVideoUrl) {
        setSubtitledVideoUrl(data.subtitledVideoUrl);
      }
    } catch (error) {
      console.error("Error generating subtitles:", error);
      // You might want to show an error message to the user here
    } finally {
      setIsGeneratingSubtitles(false);
    }
  };

  const getActiveColor = () => {
    switch (activeColorPicker) {
      case "line1-text":
        return subtitleColors.line1.text;
      case "line1-bg":
        return subtitleColors.line1.background;
      case "line2-text":
        return subtitleColors.line2.text;
      case "line2-bg":
        return subtitleColors.line2.background;
      default:
        return "#FFFFFF";
    }
  };

  const handleColorChange = (color: ColorResult) => {
    switch (activeColorPicker) {
      case "line1-text":
        setSubtitleColors({
          ...subtitleColors,
          line1: { ...subtitleColors.line1, text: color.hex },
        });
        break;
      case "line1-bg":
        setSubtitleColors({
          ...subtitleColors,
          line1: { ...subtitleColors.line1, background: color.hex },
        });
        break;
      case "line2-text":
        setSubtitleColors({
          ...subtitleColors,
          line2: { ...subtitleColors.line2, text: color.hex },
        });
        break;
      case "line2-bg":
        setSubtitleColors({
          ...subtitleColors,
          line2: { ...subtitleColors.line2, background: color.hex },
        });
        break;
    }
  };

  const handleRemoveVideo = () => {
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
    }
    setVideoPreview(null);
    setCurrentFile(null);
    setTranscription("");
    setIsTranscribing(false);
    setIsGeneratingSubtitles(false);
    setAudioUrl("");
    setSubtitledVideoUrl(null);
    setSubtitlePosition({ x: 0, y: 0 });
  };

  // Clean up the URL when component unmounts or video changes
  useEffect(() => {
    return () => {
      if (videoPreview) {
        URL.revokeObjectURL(videoPreview);
      }
    };
  }, [videoPreview]);

  if (!videoPreview) {
    return (
      <div className="flex flex-col items-center justify-center mt-8 md:mt-20 px-4">
        <div className="w-full max-w-xl">
          <div className="bg-[#0B1120]/80 rounded-2xl p-6 md:p-8 backdrop-blur-sm border border-gray-800/50">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="mb-4">
                <FontAwesomeIcon
                  icon={faUpload}
                  className="text-2xl md:text-3xl text-gray-400"
                />
              </div>
              <h2 className="text-lg md:text-xl font-semibold text-white mb-2">
                Upload Video
              </h2>
              <p className="text-gray-400 text-xs md:text-sm mb-6">
                Choose a video to add subtitles
              </p>

              <label className="cursor-pointer">
                <div className="px-4 py-2 md:px-6 md:py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm md:text-base">
                  Select Video
                </div>
                <input
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Top section with video and customization */}
      <div className="bg-gray-800/30 rounded-2xl backdrop-blur-sm border border-gray-700">
        <div className="grid md:grid-cols-2 gap-6 p-4 md:p-6">
          {/* Left side - Video Preview Section */}
          <div className="space-y-4 md:space-y-6">
            <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
              <video
                key={videoPreview}
                src={subtitledVideoUrl || videoPreview}
                className="w-full h-full"
                controls
                controlsList="nodownload"
              />

              {!subtitledVideoUrl && (
                <Draggable
                  position={subtitlePosition}
                  onDrag={(e, data) =>
                    setSubtitlePosition({ x: data.x, y: data.y })
                  }
                  bounds="parent"
                >
                  <div
                    className="cursor-move space-y-1"
                    style={{
                      position: "absolute",
                      left: "50%",
                      top: "50%",
                      transform: "translate(-50%, -50%)",
                      zIndex: 50,
                    }}
                  >
                    <div
                      className="px-3 py-1 md:px-4 md:py-1.5 rounded-full font-medium whitespace-nowrap"
                      style={{
                        color: subtitleColors.line1.text,
                        backgroundColor: subtitleColors.line1.background,
                        fontFamily: subtitleFont,
                        fontSize: `${subtitleSize}px`,
                      }}
                    >
                      <p>done in</p>
                    </div>
                    <div
                      className="px-3 py-1 md:px-4 md:py-1.5 rounded-full font-medium whitespace-nowrap"
                      style={{
                        color: subtitleColors.line2.text,
                        backgroundColor: subtitleColors.line2.background,
                        fontFamily: subtitleFont,
                        fontSize: `${subtitleSize}px`,
                      }}
                    >
                      <p>days. AI</p>
                    </div>
                  </div>
                </Draggable>
              )}

              {/* Position Guide */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ zIndex: 40 }}
              >
                {/* <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-gray-500 text-sm bg-black/50 px-3 py-1 rounded-full">
                    Drag subtitles to position them
                  </div>
                </div> */}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleRemoveVideo}
                className="px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
              >
                Remove Video
              </button>
              <label className="flex items-center justify-center px-4 py-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-lg cursor-pointer transition-colors">
                Change Video
                <input
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </div>

            {/* Subtitle Customizer - Mobile Friendly */}
            <div className="block md:hidden">
              <div className="bg-gray-900/90 backdrop-blur-sm rounded-lg border border-gray-700/50 p-4">
                <div className="space-y-4">
                  {/* Size Control */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <FontAwesomeIcon
                          icon={faTextHeight}
                          className="text-gray-400"
                        />
                        <span className="text-sm text-gray-400">Size</span>
                      </div>
                      <span className="text-sm text-gray-400">
                        {subtitleSize}px
                      </span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="32"
                      step="0.5"
                      value={subtitleSize}
                      onChange={(e) => setSubtitleSize(Number(e.target.value))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  {/* Mobile Subtitle Customizer */}
                  <SubtitleCustomizer
                    subtitleColors={subtitleColors}
                    subtitleFont={subtitleFont}
                    subtitlePosition={subtitlePosition}
                    onColorChange={(color, type) => {
                      switch (type) {
                        case "line1-text":
                          setSubtitleColors({
                            ...subtitleColors,
                            line1: { ...subtitleColors.line1, text: color.hex },
                          });
                          break;
                        case "line1-bg":
                          setSubtitleColors({
                            ...subtitleColors,
                            line1: {
                              ...subtitleColors.line1,
                              background: color.hex,
                            },
                          });
                          break;
                        case "line2-text":
                          setSubtitleColors({
                            ...subtitleColors,
                            line2: { ...subtitleColors.line2, text: color.hex },
                          });
                          break;
                        case "line2-bg":
                          setSubtitleColors({
                            ...subtitleColors,
                            line2: {
                              ...subtitleColors.line2,
                              background: color.hex,
                            },
                          });
                          break;
                      }
                    }}
                    onFontChange={setSubtitleFont}
                    onPositionChange={setSubtitlePosition}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Controls Section */}
          <div className="space-y-4 md:space-y-6">
            {/* Desktop Subtitle Customizer */}
            <div className="hidden md:block">
              <div className="bg-gray-900/90 backdrop-blur-sm rounded-lg border border-gray-700/50 p-4">
                <div className="space-y-4">
                  {/* Size Control */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <FontAwesomeIcon
                          icon={faTextHeight}
                          className="text-gray-400"
                        />
                        <span className="text-sm text-gray-400">Size</span>
                      </div>
                      <span className="text-sm text-gray-400">
                        {subtitleSize}px
                      </span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="32"
                      step="0.5"
                      value={subtitleSize}
                      onChange={(e) => setSubtitleSize(Number(e.target.value))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  {/* Desktop Subtitle Customizer */}
                  <SubtitleCustomizer
                    subtitleColors={subtitleColors}
                    subtitleFont={subtitleFont}
                    subtitlePosition={subtitlePosition}
                    onColorChange={(color, type) => {
                      switch (type) {
                        case "line1-text":
                          setSubtitleColors({
                            ...subtitleColors,
                            line1: { ...subtitleColors.line1, text: color.hex },
                          });
                          break;
                        case "line1-bg":
                          setSubtitleColors({
                            ...subtitleColors,
                            line1: {
                              ...subtitleColors.line1,
                              background: color.hex,
                            },
                          });
                          break;
                        case "line2-text":
                          setSubtitleColors({
                            ...subtitleColors,
                            line2: { ...subtitleColors.line2, text: color.hex },
                          });
                          break;
                        case "line2-bg":
                          setSubtitleColors({
                            ...subtitleColors,
                            line2: {
                              ...subtitleColors.line2,
                              background: color.hex,
                            },
                          });
                          break;
                      }
                    }}
                    onFontChange={setSubtitleFont}
                    onPositionChange={setSubtitlePosition}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full-width Transcription Section */}
      <div className="bg-gray-800/30 rounded-2xl backdrop-blur-sm border border-gray-700">
        <div className="p-4 md:p-6">
          <div className="bg-gray-900/50 rounded-lg border border-gray-700/50 p-4 md:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 md:mb-6 gap-3">
              <h3 className="text-xl md:text-2xl font-semibold text-white">
                Video Transcription
              </h3>
              {!transcription && !isTranscribing && (
                <button
                  onClick={() =>
                    onUpload(
                      currentFile!,
                      setTranscription,
                      setIsTranscribing,
                      setAudioUrl
                    )
                  }
                  className="px-4 py-2 md:px-6 md:py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm md:text-base"
                >
                  Start Transcription
                </button>
              )}
            </div>

            {isTranscribing && (
              <div className="flex items-center justify-center space-x-2 text-gray-400 mb-4">
                <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                <span>Transcribing...</span>
              </div>
            )}

            <textarea
              value={transcription}
              onChange={(e) => setTranscription(e.target.value)}
              className="w-full h-[250px] md:h-[300px] lg:h-[400px] p-4 md:p-6 bg-[#0B1120] text-gray-200 rounded-lg border border-gray-800 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-base md:text-lg"
              placeholder="Transcription will appear here..."
              disabled={isTranscribing}
            />

            {/* Generate Button - Mobile Friendly */}
            {transcription && !isTranscribing && (
              <div className="flex justify-end mt-4 md:mt-6">
                <button
                  onClick={handleGenerateSubtitles}
                  disabled={isGeneratingSubtitles}
                  className={`px-4 py-2 md:px-8 md:py-3 text-white rounded-lg transition-colors flex items-center gap-2 text-sm md:text-lg ${
                    isGeneratingSubtitles
                      ? "bg-[#22C55E]/50 cursor-not-allowed"
                      : "bg-[#22C55E] hover:bg-[#16A34A]"
                  }`}
                >
                  {isGeneratingSubtitles ? (
                    <>
                      <div className="flex items-center gap-2 md:gap-3">
                        <div className="animate-spin rounded-full h-4 w-4 md:h-5 md:w-5 border-b-2 border-white" />
                        <span>Generating...</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faCheck} />
                      Generate Subtitles
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
