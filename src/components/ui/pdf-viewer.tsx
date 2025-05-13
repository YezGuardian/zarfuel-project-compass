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

  useEffect(() => {
    // Process the URL based on its type
    if (fileUrl) {
      if (fileUrl.includes('drive.google.com')) {
        // Extract Google Drive file ID
        const fileId = extractDriveFileId(fileUrl);
        if (fileId) {
          // Use Google Drive viewer embed URL
          setEmbeddedUrl(`https://drive.google.com/file/d/${fileId}/preview`);
        } else {
          // Fallback if we can't extract the ID
          setEmbeddedUrl(fileUrl);
        }
      } else {
        // Regular URL
        setEmbeddedUrl(fileUrl);
      }
    }
  }, [fileUrl]);

  const handleDownload = () => {
    // Open file in new tab or download directly
    window.open(fileUrl, '_blank');
  };

  const zoomIn = () => setScale(prev => Math.min(prev + 0.1, 2));
  const zoomOut = () => setScale(prev => Math.max(prev - 0.1, 0.5));
  const rotate = () => setRotation(prev => (prev + 90) % 360);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{fileName}</DialogTitle>
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
          <a 
            href={fileUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            download={fileName}
          >
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </a>
        </div>
        <div className="flex-1 overflow-auto">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}
          
          {/* Use iframe for viewing documents */}
          <iframe
            src={embeddedUrl}
            title={fileName}
            className="w-full h-full border-0"
            style={fileUrl.includes('drive.google.com') ? {} : { 
              transform: `scale(${scale}) rotate(${rotation}deg)`,
              transformOrigin: 'center center'
            }}
            onLoad={() => setLoading(false)}
            allow="autoplay"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PDFViewer; 