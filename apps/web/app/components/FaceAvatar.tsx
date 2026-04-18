"use client";

import { UserIcon } from "lucide-react";
import { useState } from "react";

interface Props {
  imageUrl: string;
  bbox: number[];       // [x1, y1, x2, y2] in original image pixels
  imgWidth: number;     // original image width
  imgHeight: number;    // original image height
  size?: number;        // avatar display size in px
  alt?: string;
}

/**
 * Renders a circular face avatar by cropping the source image to the face bbox.
 * Uses CSS object-fit/object-position for efficient client-side cropping.
 */
export default function FaceAvatar({ imageUrl, bbox, imgWidth, imgHeight, size = 80, alt }: Props) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div
        className="face-avatar-placeholder"
        style={{ width: size, height: size }}
      >
        <UserIcon className="h-7 w-7 text-(--text-muted)" aria-hidden="true" />
      </div>
    );
  }

  // bbox = [x1, y1, x2, y2]
  const [x1, y1, x2, y2] = bbox;
  const faceW = x2 - x1;
  const faceH = y2 - y1;
  const faceCenterX = x1 + faceW / 2;
  const faceCenterY = y1 + faceH / 2;

  // Make a square crop around the face center (use the larger dimension + padding)
  const faceSize = Math.max(faceW, faceH);
  const padding = faceSize * 0.3; // 30% padding around face
  const cropSize = faceSize + padding * 2;

  // Scale: how much to scale the image so the crop fills the avatar
  const scale = size / cropSize;
  const scaledW = imgWidth * scale;
  const scaledH = imgHeight * scale;

  // Position: offset so the face center is at the avatar center
  const offsetX = -(faceCenterX * scale - size / 2);
  const offsetY = -(faceCenterY * scale - size / 2);

  return (
    <div
      className="face-avatar"
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        overflow: "hidden",
        position: "relative",
        flexShrink: 0,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrl}
        alt={alt ?? "Face"}
        onError={() => setError(true)}
        style={{
          position: "absolute",
          width: scaledW,
          height: scaledH,
          left: offsetX,
          top: offsetY,
          maxWidth: "none",
        }}
        loading="lazy"
      />
    </div>
  );
}
