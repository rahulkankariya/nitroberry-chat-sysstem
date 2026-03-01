"use client";
import { useState, useRef } from "react";
import { Send, Mic, Square, Trash2, Paperclip, Image, FileText, Film } from "lucide-react";
import { useVoiceRecorder } from "../../hooks/useVoiceRecorder";
import { notify } from "@/app/utils/toast";

interface Props {
  onSend: (content: string) => void;
  onSendVoice: (blob: Blob) => void;
  onSendFile: (file: File, type: "image" | "video" | "file") => void;
  placeholder: string;
}

export default function MessageInput({ onSend, onSendVoice, onSendFile, placeholder }: Props) {
  const [input, setInput] = useState("");
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  // Track allowed types to dynamically update the file picker "accept" attribute
  const [fileAccept, setFileAccept] = useState("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isRecording, duration, startRecording, stopRecording } = useVoiceRecorder();

  // --- Trigger File Picker based on Category ---
  const triggerPicker = (type: "image" | "video" | "doc") => {
    if (!fileInputRef.current) return;

    if (type === "image") {
      setFileAccept(".png, .jpg, .jpeg");
    } else if (type === "video") {
      setFileAccept(".mp4");
    } else if (type === "doc") {
      setFileAccept(".pdf, .docx, .txt");
    }

    // Small timeout ensures the 'accept' state updates before the OS dialog opens
    setTimeout(() => {
      fileInputRef.current?.click();
      setShowAttachMenu(false);
    }, 0);
  };

  // --- File Handling Logic ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileName = file.name.toLowerCase();
    
    const isImg = /\.(jpe?g|png)$/i.test(fileName);
    const isVid = /\.(mp4)$/i.test(fileName);
    const isDoc = /\.(pdf|docx|txt)$/i.test(fileName);

    if (isImg) {
      onSendFile(file, "image");
    } else if (isVid) {
      onSendFile(file, "video");
    } else if (isDoc) {
      onSendFile(file, "file");
    } else {
      notify.error("Format not allowed. Use JPEG, PNG, MP4, PDF, DOCX, or TXT.");
      
    }
    
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleAction = () => {
    if (!input.trim()) return;
    onSend(input);
    setInput("");
  };

  const handleVoiceToggle = async () => {
    if (isRecording) {
      if (duration < 1) {
        await stopRecording();
        // console.log("Stop")
        notify.error("Message too short");
      
        return;
      }
      const blob = await stopRecording();
      if (blob) onSendVoice(blob);
    } else {
      await startRecording();
    }
  };

  const handleCancelRecording = async () => {
    await stopRecording();
    // console.log("Recording discarded")
   notify.error("Recording discarded");
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="p-4 border-t border-app-border bg-app-bg flex gap-2 items-center relative">
      
      {/* Dynamic Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept={fileAccept} // This strictly filters the files shown in the browser dialog
      />

      {isRecording && (
        <button onClick={handleCancelRecording} className="text-rose-500 p-2">
          <Trash2 size={22} />
        </button>
      )}

      {!isRecording && (
        <div className="relative">
          <button 
            onClick={() => setShowAttachMenu(!showAttachMenu)}
            className={`p-2 transition-colors ${showAttachMenu ? "text-app-accent" : "text-app-text/60 hover:text-app-accent"}`}
          >
            <Paperclip size={22} className={showAttachMenu ? "rotate-45" : ""} />
          </button>

          {showAttachMenu && (
            <div className="absolute bottom-14 left-0 bg-app-bg border border-app-border rounded-2xl shadow-xl p-2 flex flex-col gap-1 min-w-40 animate-in slide-in-from-bottom-2 z-50">
              <button 
                onClick={() => triggerPicker("image")}
                className="flex items-center gap-3 px-3 py-2 hover:bg-app-text/5 rounded-xl text-sm"
              >
                <Image size={18} className="text-blue-500" /> Images 
              </button>
              <button 
                onClick={() => triggerPicker("video")}
                className="flex items-center gap-3 px-3 py-2 hover:bg-app-text/5 rounded-xl text-sm"
              >
                <Film size={18} className="text-orange-500" /> Video 
              </button>
              <button 
                onClick={() => triggerPicker("doc")}
                className="flex items-center gap-3 px-3 py-2 hover:bg-app-text/5 rounded-xl text-sm"
              >
                <FileText size={18} className="text-orange-500" /> Docs 
              </button>
            </div>
          )}
        </div>
      )}

      <div className="flex-1 relative flex items-center">
        {isRecording ? (
          <div className="flex-1 flex items-center gap-4 bg-rose-50 rounded-full px-4 py-2 border border-rose-200">
            <span className="text-sm font-mono text-orange-500 animate-pulse flex items-center gap-2">
              <span className="h-2 w-2 bg-orange-500 rounded-full" />
              {formatTime(duration)}
            </span>
            <div className="flex-1 flex items-center justify-center text-orange-400 text-xs italic">
              Recording Voice...
            </div>
          </div>
        ) : (
          <input
            className="w-full bg-app-text/5 border border-app-border rounded-full px-5 py-2.5 text-sm focus:outline-none focus:border-app-accent text-app-text transition-all"
            placeholder={placeholder}
            value={input}
            onChange={(e) => {
                setInput(e.target.value);
                if(showAttachMenu) setShowAttachMenu(false);
            }}
            onKeyDown={(e) => e.key === "Enter" && handleAction()}
          />
        )}
      </div>

      <button
        onClick={input.trim() ? handleAction : handleVoiceToggle}
        className={`p-3 rounded-full transition-all active:scale-90 shadow-sm ${
          isRecording 
            ? "bg-rose-500 text-white animate-pulse" 
            : "bg-app-accent text-black"
        }`}
      >
        {input.trim() ? <Send size={20} /> : isRecording ? <Square size={20} fill="currentColor" /> : <Mic size={20} />}
      </button>
    </div>
  );
}