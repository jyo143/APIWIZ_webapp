import React, { useEffect, useRef } from "react";
import { Droplet, PaintBucket } from "lucide-react";

interface ColorOption {
  label: string;
  value: string;
}

interface ToolbarColorPickerProps {
  type: "text" | "highlight";
  colors: ColorOption[];
  position: { top: number; left: number };
  onSelect: (colorValue: string) => void;
  onClose: () => void;
}

const ToolbarColorPicker: React.FC<ToolbarColorPickerProps> = ({
  type,
  colors,
  position,
  onSelect,
  onClose,
}) => {
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const handleSelect = (colorValue: string) => {
    onSelect(colorValue);
    onClose();
  };

  return (
    <div
      ref={pickerRef}
      className="absolute z-20 mt-1 w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none p-2 animate-scale-in" // Added animation
      style={{ top: `${position.top}px`, left: `${position.left}px` }}
      role="menu"
      aria-orientation="vertical"
      aria-labelledby={
        type === "text" ? "text-color-button" : "highlight-color-button"
      }
    >
      <div className="grid grid-cols-5 gap-1">
        {colors.map((color) => (
          <button
            key={color.value}
            title={color.label}
            onClick={() => handleSelect(color.value)}
            className="w-6 h-6 rounded border border-gray-200 hover:scale-110 hover:border-gray-400 transition-transform focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500"
            style={{ backgroundColor: color.value }}
            aria-label={color.label}
          ></button>
        ))}
        <button
          title={type === "text" ? "Remove Text Color" : "Remove Highlight"}
          onClick={() =>
            handleSelect(type === "text" ? "inherit" : "transparent")
          }
          className="w-6 h-6 rounded border border-gray-200 hover:border-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 flex items-center justify-center text-gray-500 bg-gray-100"
          aria-label={
            type === "text" ? "Remove Text Color" : "Remove Highlight"
          }
        >
          <div className="w-4 h-px bg-red-500 transform rotate-45 absolute"></div>
          <div className="w-4 h-px bg-red-500 transform -rotate-45 absolute"></div>
        </button>
      </div>
    </div>
  );
};

export default ToolbarColorPicker;
