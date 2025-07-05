import React from "react";
import { CropResult } from "../types";

interface CropResultsProps {
  results: CropResult[];
  cols: number;
}

export const CropResults: React.FC<CropResultsProps> = ({ results, cols }) => {
  const downloadCanvas = (canvas: HTMLCanvasElement, filename: string) => {
    const link = document.createElement("a");
    link.download = filename;
    link.href = canvas.toDataURL();
    link.click();
  };

  if (results.length === 0) return null;

  return (
    <div
      className="grid gap-4 mt-8 p-5 rounded-lg"
      style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
    >
      {results.map((result, index) => (
        <div key={index} className="text-center p-4 rounded-lg shadow-sm">
          <p className="text-xs text-gray-600 mb-2">
            Cell {result.cellNumber} ({result.width}x{result.height}px)
          </p>
          <canvas
            ref={(canvas) => {
              if (canvas && result.canvas) {
                const ctx = canvas.getContext("2d");
                if (ctx) {
                  canvas.width = result.canvas.width;
                  canvas.height = result.canvas.height;
                  ctx.drawImage(result.canvas, 0, 0);
                }
              }
            }}
            className="border border-gray-300 rounded"
            style={{ maxWidth: "100%", height: "auto" }}
          />
          <button
            onClick={() =>
              downloadCanvas(result.canvas, `crop_${result.cellNumber}.png`)
            }
            className="mt-2 px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors"
          >
            Download
          </button>
        </div>
      ))}
    </div>
  );
};
