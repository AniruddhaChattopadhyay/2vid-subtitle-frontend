import React from "react";
import { ChromePicker } from "react-color";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPalette,
  faFont,
  faGripLines,
  faTextHeight,
} from "@fortawesome/free-solid-svg-icons";
import type {
  SubtitleColors,
  SubtitleFont,
  SubtitlePosition,
} from "./VideoUpload";

interface SubtitleCustomizerProps {
  subtitleColors: SubtitleColors;
  subtitleFont: SubtitleFont;
  subtitlePosition: SubtitlePosition;
  onColorChange: (color: any, type: string) => void;
  onFontChange: (font: SubtitleFont) => void;
  onPositionChange: (position: SubtitlePosition) => void;
}

export default function SubtitleCustomizer({
  subtitleColors,
  subtitleFont,
  subtitlePosition,
  onColorChange,
  onFontChange,
  onPositionChange,
}: SubtitleCustomizerProps) {
  const [activeColorPicker, setActiveColorPicker] = React.useState<
    string | null
  >(null);

  return (
    <div className="bg-gray-900/90 backdrop-blur-sm rounded-lg border border-gray-700/50 p-3 md:p-4">
      <div className="space-y-4 md:space-y-6">
        {/* Color Settings */}
        <div>
          <div className="flex items-center gap-2 mb-3 md:mb-4">
            <FontAwesomeIcon icon={faPalette} className="text-gray-400" />
            <h3 className="text-xs md:text-sm font-medium text-gray-400">
              Colors
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-2 md:gap-4">
            {/* Line 1 Colors */}
            <div className="space-y-1 md:space-y-2">
              <span className="text-xs md:text-sm text-gray-300">Line 1</span>
              <div className="flex gap-1 md:gap-2">
                <button
                  onClick={() => setActiveColorPicker("line1-text")}
                  className="flex-1 h-6 md:h-8 rounded border border-gray-600 flex items-center justify-center gap-1 md:gap-2"
                  style={{ backgroundColor: subtitleColors.line1.text }}
                >
                  <span className="text-[10px] md:text-xs">Text</span>
                </button>
                <button
                  onClick={() => setActiveColorPicker("line1-bg")}
                  className="flex-1 h-6 md:h-8 rounded border border-gray-600 flex items-center justify-center gap-1 md:gap-2"
                  style={{ backgroundColor: subtitleColors.line1.background }}
                >
                  <span className="text-[10px] md:text-xs">Background</span>
                </button>
              </div>
            </div>

            {/* Line 2 Colors */}
            <div className="space-y-1 md:space-y-2">
              <span className="text-xs md:text-sm text-gray-300">Line 2</span>
              <div className="flex gap-1 md:gap-2">
                <button
                  onClick={() => setActiveColorPicker("line2-text")}
                  className="flex-1 h-6 md:h-8 rounded border border-gray-600 flex items-center justify-center gap-1 md:gap-2"
                  style={{ backgroundColor: subtitleColors.line2.text }}
                >
                  <span className="text-[10px] md:text-xs">Text</span>
                </button>
                <button
                  onClick={() => setActiveColorPicker("line2-bg")}
                  className="flex-1 h-6 md:h-8 rounded border border-gray-600 flex items-center justify-center gap-1 md:gap-2"
                  style={{ backgroundColor: subtitleColors.line2.background }}
                >
                  <span className="text-[10px] md:text-xs">Background</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Font Settings */}
        <div>
          <div className="flex items-center gap-2 mb-3 md:mb-4">
            <FontAwesomeIcon icon={faFont} className="text-gray-400" />
            <h3 className="text-xs md:text-sm font-medium text-gray-400">
              Font
            </h3>
          </div>
          <select
            value={subtitleFont}
            onChange={(e) => onFontChange(e.target.value as SubtitleFont)}
            className="w-full bg-gray-800 text-gray-300 text-xs md:text-sm rounded border border-gray-700 px-2 py-1.5 md:px-3 md:py-2"
          >
            <option value="Arial">Arial</option>
            <option value="Helvetica">Helvetica</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Roboto">Roboto</option>
            <option value="Open Sans">Open Sans</option>
          </select>
        </div>

        {/* Position Settings */}
        <div>
          <div className="flex items-center gap-2 mb-3 md:mb-4">
            <FontAwesomeIcon icon={faGripLines} className="text-gray-400" />
            <h3 className="text-xs md:text-sm font-medium text-gray-400">
              Position
            </h3>
          </div>
          <p className="text-[10px] md:text-xs text-gray-400 mb-1 md:mb-2">
            Drag the subtitles to position them
          </p>
        </div>
      </div>

      {/* Color Picker Popup */}
      {activeColorPicker && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setActiveColorPicker(null)}
          />
          <div className="relative bg-gray-900 p-3 md:p-4 rounded-lg shadow-xl max-w-full">
            <ChromePicker
              color={
                activeColorPicker.includes("line1")
                  ? activeColorPicker.includes("text")
                    ? subtitleColors.line1.text
                    : subtitleColors.line1.background
                  : activeColorPicker.includes("text")
                  ? subtitleColors.line2.text
                  : subtitleColors.line2.background
              }
              onChange={(color) => onColorChange(color, activeColorPicker)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
