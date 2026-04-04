"use client";

import { useState, useCallback, useEffect } from "react";
import Cropper, { type Area } from "react-easy-crop";
import "react-easy-crop/react-easy-crop.css";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getCroppedSquareJpegBlob } from "@/lib/image-crop-square";
import { Loader2 } from "lucide-react";

type SquareImageCropDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Object URL or remote URL of the image to crop */
  imageSrc: string | null;
  title?: string;
  onApply: (blob: Blob) => void | Promise<void>;
};

export function SquareImageCropDialog({
  open,
  onOpenChange,
  imageSrc,
  title = "Crop photo (square)",
  onApply,
}: SquareImageCropDialogProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
  }, [imageSrc]);

  const onCropComplete = useCallback((_area: Area, areaPixels: Area) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  const handleOpenChange = (next: boolean) => {
    onOpenChange(next);
  };

  const handleApply = async () => {
    if (!imageSrc || !croppedAreaPixels || applying) return;
    setApplying(true);
    try {
      const blob = await getCroppedSquareJpegBlob(imageSrc, croppedAreaPixels);
      await onApply(blob);
    } finally {
      setApplying(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg gap-4 sm:max-w-[min(100vw-2rem,28rem)]">
        <DialogHeader>
          <DialogTitle className="font-playfair-display" style={{ color: "var(--primary-blue)" }}>
            {title}
          </DialogTitle>
          <DialogDescription className="font-general text-sm">
            Drag to reposition and use the slider to zoom. The preview frame is square, matching your profile grid.
          </DialogDescription>
        </DialogHeader>

        {imageSrc ? (
          <div className="space-y-3" key={imageSrc}>
            <div
              className="relative mx-auto w-full max-w-[min(100%,320px)] overflow-hidden rounded-xl bg-black"
              style={{ aspectRatio: "1", touchAction: "none" }}
            >
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="rect"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>
            <div className="space-y-1.5 px-1">
              <label htmlFor="crop-zoom" className="text-xs font-medium text-muted-foreground font-general">
                Zoom
              </label>
              <input
                id="crop-zoom"
                type="range"
                min={1}
                max={3}
                step={0.02}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full h-2 accent-[var(--primary-blue)] cursor-pointer"
              />
            </div>
          </div>
        ) : null}

        <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" disabled={applying} onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!imageSrc || !croppedAreaPixels || applying}
            onClick={() => void handleApply()}
            className="text-white"
            style={{ backgroundColor: "var(--primary-blue)" }}
          >
            {applying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Applying…
              </>
            ) : (
              "Use this crop"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
