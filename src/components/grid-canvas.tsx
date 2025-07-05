import React, { useEffect } from "react";
import { GridLine } from "../types";

interface GridCanvasProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  image: HTMLImageElement | null;
  verticalLines: GridLine[];
  horizontalLines: GridLine[];
  cols: number;
  rows: number;
  onMouseDown: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  onMouseMove: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  onMouseUp: () => void;
  onMouseLeave: () => void;
  onTouchStart?: (e: React.TouchEvent<HTMLCanvasElement>) => void;
  onTouchMove?: (e: React.TouchEvent<HTMLCanvasElement>) => void;
  onTouchEnd?: () => void;
  cursor: string;
  gridColor: string;
}

export const GridCanvas: React.FC<GridCanvasProps> = ({
  canvasRef,
  image,
  verticalLines,
  horizontalLines,
  cols,
  rows,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onMouseLeave,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  cursor,
  gridColor,
}) => {
  const drawGrid = React.useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Calculate canvas size
    const maxWidth = 800;
    const maxHeight = 600;

    let { width, height } = image;

    if (width > maxWidth || height > maxHeight) {
      const ratio = Math.min(maxWidth / width, maxHeight / height);
      width *= ratio;
      height *= ratio;
    }

    canvas.width = width;
    canvas.height = height;

    // Draw image
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(image, 0, 0, width, height);

    // Draw vertical lines
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);

    verticalLines.forEach((line) => {
      const x = line.position * width;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    });

    // Draw horizontal lines
    horizontalLines.forEach((line) => {
      const y = line.position * height;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    });

    // Draw handles
    ctx.setLineDash([]);
    ctx.fillStyle = gridColor;

    // Vertical line handles
    verticalLines.forEach((line) => {
      const x = line.position * width;
      ctx.beginPath();
      ctx.arc(x, height / 2, 6, 0, 2 * Math.PI);
      ctx.fill();
    });

    // Horizontal line handles
    horizontalLines.forEach((line) => {
      const y = line.position * height;
      ctx.beginPath();
      ctx.arc(width / 2, y, 6, 0, 2 * Math.PI);
      ctx.fill();
    });

    // Draw cell numbers
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1;
    ctx.font = "14px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const xPositions = [
      0,
      ...verticalLines.map((l) => l.position * width),
      width,
    ];
    const yPositions = [
      0,
      ...horizontalLines.map((l) => l.position * height),
      height,
    ];

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = (xPositions[col] + xPositions[col + 1]) / 2;
        const y = (yPositions[row] + yPositions[row + 1]) / 2;
        const cellNumber = row * cols + col + 1;

        ctx.strokeText(cellNumber.toString(), x, y);
        ctx.fillText(cellNumber.toString(), x, y);
      }
    }
  }, [image, verticalLines, horizontalLines, cols, rows, canvasRef, gridColor]);

  useEffect(() => {
    drawGrid();
  }, [drawGrid]);

  return (
    <canvas
      ref={canvasRef}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      style={{
        cursor,
        border: "2px solid #ddd",
        borderRadius: "8px",
        maxWidth: "100%",
        height: "auto",
        backgroundImage: `
          linear-gradient(45deg, #f3f4f6 25%, transparent 25%), 
          linear-gradient(-45deg, #f3f4f6 25%, transparent 25%), 
          linear-gradient(45deg, transparent 75%, #f3f4f6 75%), 
          linear-gradient(-45deg, transparent 75%, #f3f4f6 75%)
        `,
        backgroundSize: "20px 20px",
        backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
        touchAction: "none", // Prevent default touch behaviors like scrolling
      }}
    />
  );
};
