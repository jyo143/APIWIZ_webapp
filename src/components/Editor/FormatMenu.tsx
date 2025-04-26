import React, { useRef, useEffect } from "react";
import { Droplet, PaintBucket } from "lucide-react";

interface FormatMenuProps {
  position: { top: number; left: number } | null;
  onClose: () => void;
  onFormat: (format: string, value?: string) => void;
  onMention: () => void;
}

const FormatMenu: React.FC<FormatMenuProps> = ({
  position,
  onClose,
  onFormat,
  onMention,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const colors = [
    { label: "Red", value: "#ea384c" },
    { label: "Blue", value: "#0EA5E9" },
    { label: "Green", value: "#22C55E" },
    { label: "Purple", value: "#9b87f5" },
    { label: "Orange", value: "#F97316" },
  ];

  const highlightColors = [
    { label: "Yellow", value: "#fef7cd" },
    { label: "Green", value: "#F2FCE2" },
    { label: "Blue", value: "#D3E4FD" },
    { label: "Pink", value: "#FFDEE2" },
    { label: "Orange", value: "#FEC6A1" },
  ];

  if (!position) return null;

  return (
    <div
      ref={menuRef}
      className="absolute z-10 bg-white shadow-lg rounded-md border border-gray-200 py-1 animate-scale-in w-48"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      <div className="px-2 py-1 text-xs text-gray-500 border-b border-gray-100">
        Basic Formatting
      </div>
      <button
        className="px-3 py-1.5 text-sm hover:bg-gray-100 w-full text-left flex items-center gap-2"
        onClick={() => onFormat("bold")}
      >
        <span className="font-bold">B</span> Bold
      </button>
      <button
        className="px-3 py-1.5 text-sm hover:bg-gray-100 w-full text-left flex items-center gap-2"
        onClick={() => onFormat("italic")}
      >
        <span className="italic">I</span> Italic
      </button>
      <button
        className="px-3 py-1.5 text-sm hover:bg-gray-100 w-full text-left flex items-center gap-2"
        onClick={() => onFormat("underline")}
      >
        <span className="underline">U</span> Underline
      </button>
      <button
        className="px-3 py-1.5 text-sm hover:bg-gray-100 w-full text-left flex items-center gap-2"
        onClick={() => onFormat("strikethrough")}
      >
        <span className="line-through">S</span> Strikethrough
      </button>

      <div className="border-t border-gray-100 mt-1">
        <div className="px-2 py-1 text-xs text-gray-500 border-b border-gray-100 flex items-center gap-1"></div>
        <div className="p-2 grid grid-cols-5 gap-1">
          {colors.map((color) => (
            <button
              key={color.value}
              className="w-6 h-6 rounded hover:scale-110 transition-transform flex items-center justify-center"
              style={{ backgroundColor: color.value }}
              onClick={() => onFormat("color", color.value)}
              title={color.label}
            >
              <Droplet className="w-4 h-4 text-white/70" />
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-100">
        <div className="px-2 py-1 text-xs text-gray-500 border-b border-gray-100 flex items-center gap-1">
          <PaintBucket className="w-3 h-3" /> Fill Color
        </div>
        <div className="p-2 grid grid-cols-5 gap-1">
          {highlightColors.map((color) => (
            <button
              key={color.value}
              className="w-6 h-6 rounded hover:scale-110 transition-transform"
              style={{ backgroundColor: color.value }}
              onClick={() => onFormat("highlight", color.value)}
              title={color.label}
            >
              <PaintBucket className="w-4 h-4 text-gray-400/50" />
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-100">
        <button
          className="px-3 py-1.5 text-sm hover:bg-gray-100 w-full text-left flex items-center gap-2"
          onClick={() => onMention()}
        >
          @ Mention
        </button>
      </div>
    </div>
  );
};

export default FormatMenu;
