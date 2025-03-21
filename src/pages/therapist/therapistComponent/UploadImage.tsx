import { useRef } from "react";
import { Input } from "antd";

interface UploadImageProps {
  imageUrl: string | undefined;
  onImageChange: (url: string) => void;
  handleFileUpload: (file: File) => Promise<string | null>;
  setIsUploading: (isUploading: boolean) => void;
  isUploading: boolean;
  placeholderText: string | undefined;
}

const UploadImage: React.FC<UploadImageProps> = ({
  imageUrl,
  onImageChange,
  handleFileUpload,
  setIsUploading,
  isUploading,
  placeholderText,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const url = await handleFileUpload(file);
    if (url) {
      onImageChange(url);
    }
    setIsUploading(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <div
          className={`w-32 h-32 bg-gray-200 flex items-center justify-center overflow-hidden cursor-pointer relative rounded-full`}
          onClick={handleClick}
        >
          {isUploading ? (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          ) : null}
          {imageUrl ? (
            <img src={imageUrl} alt="Image" className="w-full h-full object-cover" />
          ) : (
            <span className="text-4xl text-gray-400">{placeholderText}</span>
          )}
          <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <span className="text-white text-xs">Change Photo</span>
          </div>
        </div>
      </div>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
      />
      <Input
        size="large"
        style={{ borderColor: "#d9d9d9", borderRadius: "8px" }}
        placeholder="Enter image URL"
        value={imageUrl}
        onChange={(e) => onImageChange(e.target.value)}
      />
    </div>
  );
};

export default UploadImage;