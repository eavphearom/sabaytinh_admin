import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ImagePlus,
  UploadCloud,
  X,
} from "lucide-react";
import { useDropzone } from "react-dropzone";

export default function ImageUpload({
  label = "Image",
  existingImage = null,
  onChange,
  error,
  maxSize = 5 * 1024 * 1024,
}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [removed, setRemoved] = useState(false);

  const localPreview = useMemo(() => {
    if (!selectedFile) return null;
    return URL.createObjectURL(selectedFile);
  }, [selectedFile]);

  useEffect(() => {
    return () => {
      if (localPreview) {
        URL.revokeObjectURL(localPreview);
      }
    };
  }, [localPreview]);

  const preview = localPreview || (!removed ? existingImage : null);

  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setSelectedFile(file);
    setRemoved(false);
    onChange?.(file);
  };

  const removeImage = (event) => {
    event.stopPropagation();

    setSelectedFile(null);
    setRemoved(true);
    onChange?.(null);
  };

  const { getRootProps, getInputProps, isDragActive, fileRejections } =
    useDropzone({
      onDrop,
      accept: {
        "image/*": [".jpg", ".jpeg", ".png", ".webp"],
      },
      maxFiles: 1,
      maxSize,
    });

  return (
    <div className="w-full">
      {label && (
        <label className="mb-2 block text-sm font-semibold text-[#03152B]">
          {label}
        </label>
      )}

      <div
        {...getRootProps()}
        className={`group relative overflow-hidden rounded-lg border border-dashed p-4 transition ${
          isDragActive
            ? "border-[#F97316] bg-[#FFF7ED]"
            : "border-[#CBD5E1] bg-[#F8FAFD] hover:border-[#F97316] hover:bg-[#F4F8FF]"
        }`}
      >
        <input {...getInputProps()} />

        {preview ? (
          <div className="grid cursor-pointer gap-4 sm:grid-cols-[128px_1fr] sm:items-center">
            <div className="relative overflow-hidden rounded-lg border border-[#D7DFEA] bg-white">
              <img
                src={preview}
                alt="Banner preview"
                className="h-29 w-full object-cover"
              />

              <button
                type="button"
                onClick={removeImage}
                className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-[#03152B]/80 text-white shadow-sm transition hover:bg-[#03152B]"
                aria-label="Remove image"
              >
                <X size={14} />
              </button>
            </div>

            <div className="text-left">
              <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-[#DCFCE7] px-2.5 py-0 text-xs font-semibold text-[#15803D]">
                <CheckCircle2 size={13} />
                {selectedFile ? "Image selected" : "Current image"}
              </div>

              <p className="truncate text-sm font-semibold text-[#03152B]">
                {selectedFile ? selectedFile.name : "Existing banner image"}
              </p>

              <p className="mt-1 text-xs text-[#64748B]">
                Click or drop a new file to replace this image.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex cursor-pointer flex-col items-center justify-center py-0 text-center">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#F97316] shadow-sm ring-1 ring-[#FED7AA]">
              {isDragActive ? (
                <ImagePlus size={22} />
              ) : (
                <UploadCloud size={22} />
              )}
            </div>

            <p className="text-sm font-semibold text-[#03152B]">
              {isDragActive ? "Drop image here" : "Upload banner image"}
            </p>

            <p className="mt-1 text-sm text-[#64748B]">
              Drag and drop or click to browse
            </p>

            <p className="mt-2 text-xs font-medium text-[#8A98AA]">
              JPG, PNG, WEBP up to {Math.round(maxSize / 1024 / 1024)}MB
            </p>
          </div>
        )}
      </div>

      {fileRejections.length > 0 && (
        <p className="mt-2 flex items-center gap-1.5 text-sm text-red-500">
          <AlertCircle size={15} />
          Image was rejected. Check file type or size.
        </p>
      )}

      {error && (
        <p className="mt-2 flex items-center gap-1.5 text-sm text-red-500">
          <AlertCircle size={15} />
          {error}
        </p>
      )}
    </div>
  );
}
