"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Download, FileText, X, ZoomIn, ZoomOut, RotateCw } from "lucide-react";
import { extractDriveFileId, getDriveViewerUrl } from "@/integrations/google/drive-api";

interface PDFViewerProps {
  fileUrl: string;
  fileName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ fileUrl, fileName, open, onOpenChange }) => {
  const [loading, setLoading] = useState(true);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [embeddedUrl, setEmbeddedUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Process the URL based on its type
    try {
      if (fileUrl) {
        const url = String(fileUrl); // Ensure fileUrl is a string
        if (url.indexOf('drive.google.com') !== -1) {
          // Extract Google Drive file ID
          const fileId = extractDriveFileId(url);
          if (fileId) {
            // Use Google Drive viewer embed URL
            setEmbeddedUrl(`https://drive.google.com/file/d/${fileId}/preview`);
          } else {
            // Fallback if we can't extract the ID
            setEmbeddedUrl(url);
          }
        } else {
          // Regular URL
          setEmbeddedUrl(url);
        }
        setError(null);
      } else {
        setError("No file URL provided");
        setEmbeddedUrl("");
      }
    } catch (err) {
      console.error("Error processing file URL:", err);
      setError("Error loading document. Please try again.");
      setEmbeddedUrl("");
    }
  }, [fileUrl]);

  const handleDownload = () => {
    // Open file in new tab or download directly
    if (fileUrl) {
      window.open(fileUrl, '_blank');
    }
  };

  const zoomIn = () => setScale(prev => Math.min(prev + 0.1, 2));
  const zoomOut = () => setScale(prev => Math.max(prev - 0.1, 0.5));
  const rotate = () => setRotation(prev => (prev + 90) % 360);

  // Safely check if a string includes a substring
  const safeIncludes = (str: string | null | undefined, substring: string): boolean => {
    if (!str || typeof str !== 'string') return false;
    return str.includes(substring);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{fileName || "Document"}</DialogTitle>
        </DialogHeader>
        <div className="flex justify-between items-center mb-2 gap-2">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={zoomIn}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={zoomOut}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={rotate}>
              <RotateCw className="h-4 w-4" />
            </Button>
          </div>
          {fileUrl && (
            <a 
              href={fileUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              download={fileName || "document"}
            >
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </a>
          )}
        </div>
        <div className="flex-1 overflow-auto">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}
          
          {error && (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center p-4 bg-red-50 rounded-md text-red-600">
                <p>{error}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2" 
                  onClick={() => onOpenChange(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
          
          {!error && embeddedUrl && (
            <iframe
              src={embeddedUrl}
              title={fileName || "Document"}
              className="w-full h-full border-0"
              style={safeIncludes(fileUrl, 'drive.google.com') ? {} : { 
                transform: `scale(${scale}) rotate(${rotation}deg)`,
                transformOrigin: 'center center'
              }}
              onLoad={() => setLoading(false)}
              allow="autoplay"
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PDFViewer; 