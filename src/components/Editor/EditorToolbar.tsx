import React, { useRef, useState } from "react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Type, // Icon for Text Color
  PaintBucket, // Icon for Fill/Highlight Color
  AlignLeft,
  AlignCenter,
  AlignRight,
  ListOrdered,
  List,
  IndentDecrease,
  IndentIncrease,
  Heading,
  ChevronDown,
} from "lucide-react";
import ToolbarColorPicker from "./ToolbarColorPicker";

interface ToolbarProps {
  // Ensure onFormatText can accept the optional value
  onFormatText: (format: string, value?: string) => void;
  onAlignText: (alignment: string) => void;
  onListFormat: (listType: string) => void;
  onIndent: (direction: "increase" | "decrease") => void;
  onHeadingChange: () => void;
  onFontSizeChange: (size: string) => void;
  onFontFamilyChange: (font: string) => void;
  activeFormats: Set<string>;
  fontSize: string;
  fontFamily: string;
  currentTextColor: string | null;
  currentHighlightColor: string | null;
}

const textColors = [
  { label: "Default", value: "inherit" },
  { label: "Black", value: "#000000" },
  { label: "Red", value: "#E03131" },
  { label: "Blue", value: "#1C7ED6" },
  { label: "Green", value: "#2F9E44" },
  { label: "Orange", value: "#F76707" },
  { label: "Purple", value: "#7048E8" },
  { label: "Gray", value: "#868E96" },
  { label: "Pink", value: "#D6336C" },
  { label: "Teal", value: "#087F5B" },
];

const highlightColors = [
  { label: "Yellow", value: "#FFF3BF" },
  { label: "Green", value: "#E0F2D1" },
  { label: "Orange", value: "#F76707" },
  { label: "Purple", value: "#7048E8" },
  { label: "Gray", value: "#868E96" },
  { label: "Pink", value: "#D6336C" },
  { label: "Teal", value: "#087F5B" },
];

const EditorToolbar: React.FC<ToolbarProps> = ({
  onFormatText,
  onAlignText,
  onListFormat,
  onIndent,
  onHeadingChange,
  onFontSizeChange,
  onFontFamilyChange,
  activeFormats,
  fontSize,
  fontFamily,
  currentTextColor,
  currentHighlightColor,
}) => {
  const isActive = (format: string) => activeFormats.has(format);
  const [openPicker, setOpenPicker] = useState<"text" | "highlight" | null>(
    null
  );
  const [pickerPosition, setPickerPosition] = useState<{
    top: number;
    left: number;
  }>({ top: 0, left: 0 });

  const textColorButtonRef = useRef<HTMLButtonElement>(null);
  const highlightColorButtonRef = useRef<HTMLButtonElement>(null);

  const handleColorClick = (type: "text" | "highlight") => {
    setOpenPicker(type);
    const buttonRef =
      type === "text" ? textColorButtonRef : highlightColorButtonRef;
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPickerPosition({
        top: rect.bottom + 10,
        left: rect.left,
      });
    }
  };
  const handleOpenPicker = (type: "text" | "highlight") => {
    const buttonRef =
      type === "text" ? textColorButtonRef : highlightColorButtonRef;
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPickerPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
      });
      setOpenPicker((prev) => (prev === type ? null : type));
    }
  };

  const handleColorSelect = (
    type: "text" | "highlight",
    colorValue: string
  ) => {
    const command = type === "text" ? "color" : "highlight";
    onFormatText(command, colorValue);
  };

  const toolbarButton = (
    action: () => void,
    icon: React.ReactNode,
    label: string,
    format?: string,
    disabled?: boolean,
    ref?: React.RefObject<HTMLButtonElement>,
    id?: string
  ) => (
    <button
      id={id}
      ref={ref}
      onClick={action}
      className={`p-1.5 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed ${
        format && isActive(format) ? "bg-gray-200" : "bg-transparent"
      } ${
        (id === "text-color-button" && openPicker === "text") ||
        (id === "highlight-color-button" && openPicker === "highlight")
          ? "bg-gray-200"
          : ""
      }`}
      title={label}
      aria-label={label}
      aria-haspopup={id?.includes("color-button") ? "true" : undefined}
      aria-expanded={
        id?.includes("color-button")
          ? openPicker === (id === "text-color-button" ? "text" : "highlight")
          : undefined
      }
      disabled={disabled}
    >
      {icon}
    </button>
  );
  const Divider = () => (
    <div className="h-5 w-px bg-gray-300 mx-1" aria-hidden="true" />
  );

  const isDefaultColor = (
    color: string | null,
    type: "text" | "highlight"
  ): boolean => {
    if (!color) return true;
    const lowerColor = color.toLowerCase().replace(/\s/g, "");

    if (type === "text") {
      return ["inherit", "rgb(0,0,0)", "#000000"].includes(lowerColor);
    } else {
      return ["transparent", "rgba(0,0,0,0)"].includes(lowerColor);
    }
  };

  return (
    <div className="flex flex-wrap items-center bg-gray-50 border-b border-gray-300 px-2 py-1 gap-x-1">
      <div className="relative">
        <select
          className="appearance-none bg-transparent pl-2 pr-6 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white border border-gray-300 rounded hover:bg-gray-100"
          value={fontFamily}
          onChange={(e) => onFontFamilyChange(e.target.value)}
          title="Font Family"
          aria-label="Font Family"
        >
          <option value="Arial">Arial</option>
          <option value="Times New Roman">Times New Roman</option>
          <option value="Courier New">Courier New</option>
          <option value="Verdana">Verdana</option>
          <option value="Georgia">Georgia</option>
          <option value="Gill Sans">Gill Sans</option>
          <option value="Helvetica">Helvetica</option>
          <option value="Palatino">Palatino</option>
        </select>
        <ChevronDown
          size={16}
          className="absolute right-1.5 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none"
        />
      </div>
      <div className="relative">
        <select
          className="appearance-none bg-transparent pl-2 pr-6 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white border border-gray-300 rounded hover:bg-gray-100"
          value={fontSize}
          onChange={(e) => onFontSizeChange(e.target.value)}
          title="Font Size"
          aria-label="Font Size"
        >
          <option value="11">11</option>
          <option value="12">12</option>
          <option value="14">14</option>
          <option value="16">16</option>
          <option value="18">18</option>
          <option value="20">20</option>
          <option value="24">24</option>
          <option value="28">28</option>
          <option value="32">32</option>
          <option value="36">36</option>
          <option value="48">48</option>
          <option value="60">60</option>
          <option value="72">72</option>
          <option value="96">96</option>
        </select>
        <ChevronDown
          size={16}
          className="absolute right-1.5 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none"
        />
      </div>

      <Divider />

      <div className="flex items-center gap-x-0.5">
        {toolbarButton(
          () => onFormatText("bold"),
          <Bold size={18} />,
          "Bold (Ctrl+B)",
          "bold"
        )}
        {toolbarButton(
          () => onFormatText("italic"),
          <Italic size={18} />,
          "Italic (Ctrl+I)",
          "italic"
        )}
        {toolbarButton(
          () => onFormatText("underline"),
          <Underline size={18} />,
          "Underline (Ctrl+U)",
          "underline"
        )}
        {toolbarButton(
          () => onFormatText("strikethrough"),
          <Strikethrough size={18} />,
          "Strikethrough",
          "strikethrough"
        )}
      </div>

      <Divider />
      <div className="flex items-center gap-x-0.5">
        <button
          id="text-color-button"
          ref={textColorButtonRef}
          onClick={() => handleOpenPicker("text")}
          className={`relative p-1.5 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed ${
            openPicker === "text" ? "bg-gray-200" : "bg-transparent"
          }`}
          title="Text Color"
          aria-label="Text Color"
          aria-haspopup="true"
          aria-expanded={openPicker === "text"}
        >
          <Type size={18} />
          {!isDefaultColor(currentTextColor, "text") && (
            <div
              className="absolute bottom-[2px] left-[4px] right-[4px] h-[3px] rounded-sm pointer-events-none"
              style={{ backgroundColor: currentTextColor || "transparent" }}
            />
          )}
        </button>

        <button
          id="highlight-color-button"
          ref={highlightColorButtonRef}
          onClick={() => handleOpenPicker("highlight")}
          className={`relative p-1.5 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed ${
            openPicker === "highlight" ? "bg-gray-200" : "bg-transparent"
          }`}
          title="Fill Color / Highlight"
          aria-label="Fill Color / Highlight"
          aria-haspopup="true"
          aria-expanded={openPicker === "highlight"}
        >
          <PaintBucket size={18} />
          {!isDefaultColor(currentHighlightColor, "highlight") && (
            <div
              className="absolute bottom-[2px] left-[4px] right-[4px] h-[3px] rounded-sm pointer-events-none"
              style={{
                backgroundColor: currentHighlightColor || "transparent",
              }}
            />
          )}
        </button>
      </div>
      {openPicker === "text" && (
        <ToolbarColorPicker
          type="text"
          colors={textColors}
          position={pickerPosition}
          onSelect={(color) => handleColorSelect("text", color)}
          onClose={() => setOpenPicker(null)}
        />
      )}
      {openPicker === "highlight" && (
        <ToolbarColorPicker
          type="highlight"
          colors={highlightColors}
          position={pickerPosition}
          onSelect={(color) => handleColorSelect("highlight", color)}
          onClose={() => setOpenPicker(null)}
        />
      )}

      <Divider />
      <div className="flex items-center gap-x-0.5">
        {toolbarButton(
          () => onAlignText("left"),
          <AlignLeft size={18} />,
          "Align Left",
          "align-left"
        )}
        {toolbarButton(
          () => onAlignText("center"),
          <AlignCenter size={18} />,
          "Align Center",
          "align-center"
        )}
        {toolbarButton(
          () => onAlignText("right"),
          <AlignRight size={18} />,
          "Align Right",
          "align-right"
        )}
      </div>

      <Divider />
      <div className="flex items-center gap-x-0.5">
        {toolbarButton(
          () => onListFormat("ordered"),
          <ListOrdered size={18} />,
          "Numbered List",
          "ordered-list"
        )}
        {toolbarButton(
          () => onListFormat("unordered"),
          <List size={18} />,
          "Bulleted List",
          "unordered-list"
        )}
      </div>

      <Divider />
      <div className="flex items-center gap-x-0.5">
        {toolbarButton(
          () => onIndent("decrease"),
          <IndentDecrease size={18} />,
          "Decrease Indent"
        )}
        {toolbarButton(
          () => onIndent("increase"),
          <IndentIncrease size={18} />,
          "Increase Indent"
        )}
      </div>
    </div>
  );
};

export default EditorToolbar;
