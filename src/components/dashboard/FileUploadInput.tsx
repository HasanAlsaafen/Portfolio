import { useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { useApi } from "../../hooks/useApi";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

interface FileUploadInputProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  endpoint: "image" | "cv";
  accept: string;
  disabled?: boolean;
  previewImage?: boolean;
}

export default function FileUploadInput({
  label,
  value,
  onChange,
  endpoint,
  accept,
  disabled = false,
  previewImage = false,
}: FileUploadInputProps) {
  const { request } = useApi();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append(endpoint, file);
      const response = await request(`${API_URL}/upload/${endpoint}`, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Upload failed. Please try again.");
      const data = await response.json();
      if (data.url) onChange(data.url);
    } catch (err: any) {
      setError(err.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-1">
      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</label>
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder="https:// or upload a file"
          className={`flex-1 min-w-0 bg-secondary/50 border border-border px-4 py-3 outline-none transition-colors text-sm ${
            disabled ? "opacity-70 cursor-not-allowed" : "focus:border-primary"
          }`}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || uploading}
          className="shrink-0 px-4 bg-secondary border border-border text-text hover:border-primary hover:text-primary transition-colors disabled:opacity-50 flex items-center gap-2 text-sm font-semibold"
        >
          <FontAwesomeIcon icon={uploading ? faSpinner : faUpload} spin={uploading} />
          {uploading ? "Uploading..." : "Upload"}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          disabled={disabled}
          className="hidden"
        />
      </div>
      {error && <p className="text-xs text-error">{error}</p>}
      {previewImage && value && (
        <div className="w-16 h-16 border border-border overflow-hidden">
          <img src={value} alt="Preview" className="w-full h-full object-cover" />
        </div>
      )}
    </div>
  );
}
