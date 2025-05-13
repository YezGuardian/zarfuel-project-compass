import * as React from "react"
import { useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { Button, ButtonProps } from "@/components/ui/button"
import { Upload } from "lucide-react"

export interface UploadButtonProps extends React.HTMLAttributes<HTMLDivElement> {
  onFileSelected: (file: File) => void;
  accept?: string;
  children?: React.ReactNode;
  maxSizeMB?: number;
  className?: string;
  buttonText?: string;
  buttonProps?: ButtonProps;
}

const UploadButton = React.forwardRef<HTMLDivElement, UploadButtonProps>(
  ({ onFileSelected, accept = "*", maxSizeMB = 20, className, buttonText = "Select File", buttonProps, ...props }, ref) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [error, setError] = useState<string | null>(null);
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setError(null);
      
      if (!e.target.files || e.target.files.length === 0) {
        return;
      }
      
      const file = e.target.files[0];
      
      // Check file size
      if (maxSizeMB > 0) {
        const maxSizeBytes = maxSizeMB * 1024 * 1024;
        if (file.size > maxSizeBytes) {
          setError(`File size exceeds ${maxSizeMB}MB limit (${(file.size / (1024 * 1024)).toFixed(2)}MB)`);
          return;
        }
      }
      
      onFileSelected(file);
    };
    
    const triggerFileInput = () => {
      fileInputRef.current?.click();
    };
    
    return (
      <div ref={ref} className={cn("flex flex-col items-start gap-2", className)} {...props}>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept={accept}
          className="hidden"
        />
        <Button 
          type="button" 
          onClick={triggerFileInput}
          {...buttonProps}
        >
          <Upload className="mr-2 h-4 w-4" />
          {buttonText}
        </Button>
        {error && (
          <p className="text-sm font-medium text-destructive">{error}</p>
        )}
      </div>
    );
  }
);

UploadButton.displayName = "UploadButton";

export { UploadButton }; 