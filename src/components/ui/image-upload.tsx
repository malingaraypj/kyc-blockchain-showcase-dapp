"use client";

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { uploadToIPFS, getIPFSUrl } from '@/lib/ipfs';
import { toast } from 'sonner';

interface ImageUploadProps {
  value?: string;
  onChange: (ipfsHash: string) => void;
  label?: string;
  accept?: string;
}

export function ImageUpload({ value, onChange, label = "Upload Image", accept = "image/*" }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(value ? getIPFSUrl(value) : null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setUploading(true);
    try {
      // Create local preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to IPFS
      const result = await uploadToIPFS(file, file.name);
      onChange(result.ipfsHash);
      toast.success('Image uploaded to IPFS successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image. Please check your Pinata configuration.');
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading}
      />
      
      {preview ? (
        <div className="relative group">
          <div className="relative rounded-lg overflow-hidden border-2 border-border bg-muted aspect-video">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-contain"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleRemove}
                className="gap-2"
              >
                <X className="w-4 h-4" />
                Remove
              </Button>
            </div>
          </div>
          {value && (
            <p className="text-xs text-muted-foreground mt-1 font-mono break-all">
              IPFS: {value}
            </p>
          )}
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full h-32 border-dashed border-2 hover:border-primary transition-colors"
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="text-sm">Uploading to IPFS...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="w-6 h-6 text-muted-foreground" />
              <span className="text-sm font-medium">{label}</span>
              <span className="text-xs text-muted-foreground">PNG, JPG up to 10MB</span>
            </div>
          )}
        </Button>
      )}
    </div>
  );
}

interface ImageViewerProps {
  ipfsHash: string;
  alt?: string;
  className?: string;
}

export function ImageViewer({ ipfsHash, alt = "Image", className = "" }: ImageViewerProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  if (!ipfsHash) {
    return (
      <div className={`flex items-center justify-center bg-muted rounded-lg aspect-video ${className}`}>
        <div className="text-center">
          <ImageIcon className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No image uploaded</p>
        </div>
      </div>
    );
  }

  const imageUrl = getIPFSUrl(ipfsHash);

  return (
    <div className={`relative rounded-lg overflow-hidden border border-border bg-muted aspect-video ${className}`}>
      {loading && !error && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      )}
      {error ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <ImageIcon className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Failed to load image</p>
            <p className="text-xs text-muted-foreground mt-1 font-mono break-all px-4">
              {ipfsHash}
            </p>
          </div>
        </div>
      ) : (
        <img
          src={imageUrl}
          alt={alt}
          className="w-full h-full object-contain"
          onLoad={() => setLoading(false)}
          onError={() => {
            setLoading(false);
            setError(true);
          }}
        />
      )}
    </div>
  );
}
