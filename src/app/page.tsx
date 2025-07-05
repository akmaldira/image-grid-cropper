"use client";

import { ColorPicker } from "@/components/color-picker";
import FileUploadBox from "@/components/file-upload-box";
import {
  FileInput,
  FileUploader,
  FileUploaderContent,
} from "@/components/file-uploader";
import { GridCanvas } from "@/components/grid-canvas";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useImageGridCropper } from "@/hooks/image-grid-cropper";
import JSZip from "jszip";
import { Paperclip, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function Home() {
  const [gridColor, setGridColor] = useState("#00ff04");
  const {
    canvasRef,
    image,
    file,
    cols,
    rows,
    verticalLines,
    horizontalLines,
    dragState,
    cropResults,
    setDragState,
    initializeGrid,
    resetGrid,
    handleImageUpload,
    updateGridSize,
    getMousePos,
    getTouchPos,
    findNearestLine,
    updateLinePosition,
    cropImage,
  } = useImageGridCropper();

  const [cursor, setCursor] = useState("crosshair");

  useEffect(() => {
    initializeGrid();
  }, [initializeGrid]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!image) return;

    const mousePos = getMousePos(e);
    const nearestLine = findNearestLine(mousePos);

    if (nearestLine) {
      setDragState({
        isDragging: true,
        dragType: nearestLine.type,
        dragIndex: nearestLine.index,
      });
      setCursor(nearestLine.type === "vertical" ? "ew-resize" : "ns-resize");
      e.preventDefault();
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!image) return;

    const mousePos = getMousePos(e);

    if (dragState.isDragging) {
      updateLinePosition(mousePos);
    } else {
      const nearestLine = findNearestLine(mousePos);
      if (nearestLine) {
        setCursor(nearestLine.type === "vertical" ? "ew-resize" : "ns-resize");
      } else {
        setCursor("crosshair");
      }
    }
  };

  const handleMouseUp = () => {
    setDragState({
      isDragging: false,
      dragType: null,
      dragIndex: -1,
    });
    setCursor("crosshair");
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!image) return;

    const touchPos = getTouchPos(e);
    const nearestLine = findNearestLine(touchPos);

    if (nearestLine) {
      setDragState({
        isDragging: true,
        dragType: nearestLine.type,
        dragIndex: nearestLine.index,
      });
      setCursor(nearestLine.type === "vertical" ? "ew-resize" : "ns-resize");
      e.preventDefault();
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!image) return;

    const touchPos = getTouchPos(e);

    if (dragState.isDragging) {
      updateLinePosition(touchPos);
      e.preventDefault();
    }
  };

  const handleTouchEnd = () => {
    setDragState({
      isDragging: false,
      dragType: null,
      dragIndex: -1,
    });
    setCursor("crosshair");
  };

  const downloadCanvas = (canvas: HTMLCanvasElement, filename: string) => {
    const link = document.createElement("a");
    link.download = filename;
    link.href = canvas.toDataURL();
    link.click();
  };

  const dropZoneConfig = {
    maxFiles: 1,
    maxSize: 1024 * 1024 * 50,
    multiple: false,
  };

  // const downloadAll = () => {
  //   cropResults.forEach((result) => {
  //     downloadCanvas(result.canvas, `crop_${result.cellNumber}.png`);
  //   });
  // };

  const downloadZip = async () => {
    try {
      const zip = new JSZip();

      // Add each cropped image to the zip
      cropResults.forEach((result, index) => {
        // Convert data URL to blob
        const dataURL = result.canvas.toDataURL("image/png");
        const base64Data = dataURL.split(",")[1]; // Remove data:image/png;base64, prefix

        // Add file to zip
        zip.file(`crop_${result.cellNumber || index + 1}.png`, base64Data, {
          base64: true,
        });
      });

      // Generate zip file
      const content = await zip.generateAsync({ type: "blob" });

      // Create download link
      const url = window.URL.createObjectURL(content);
      const link = document.createElement("a");
      link.href = url;
      link.download = `cropped_images_${new Date()
        .toISOString()
        .slice(0, 10)}.zip`;

      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error("Error creating zip file. Please try again.");
      console.error("Error creating zip file:", error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 rounded-xl shadow-lg">
      <h1 className="text-3xl font-bold text-center mb-8">
        🖼️ Image Grid Cropper
      </h1>
      <div className="bg-blue-50 p-4 rounded-lg mb-6 border-l-4 border-blue-500">
        <h3 className="text-lg font-semibold text-blue-700 mb-2">
          How to use:
        </h3>
        <p className="text-blue-600">
          1. Upload an image and set the number of rows/columns
          <br />
          2. Drag the grid lines to adjust cell positions
          <br />
          3. Click &quot;Crop Image&quot; to generate the pieces
        </p>
      </div>
      <div className="flex flex-col items-center mt-20 w-full">
        <FileUploader
          value={file ? [file] : []}
          onValueChange={(files) => {
            if (files && files.length > 0) {
              console.log("HANDLE IMAGE UPLOAD");
              handleImageUpload(files[0]);
            } else {
              console.log("HANDLE IMAGE UPLOAD NULL");
              handleImageUpload(null);
            }
          }}
          dropzoneOptions={dropZoneConfig}
          className="relative bg-background rounded-lg p-2"
        >
          <FileInput className="outline-dashed outline-1 outline-white">
            <div className="flex items-center justify-center flex-col pt-3 pb-4 w-full ">
              <FileUploadBox />
            </div>
          </FileInput>
          <FileUploaderContent>
            {file && (
              <div className="flex items-center gap-2 bg-muted py-1 px-4 rounded-md w-full justify-between">
                <div className="flex items-center gap-2">
                  <Paperclip className="h-4 w-4 stroke-current" />
                  <span className="text-sm">{file?.name}</span>
                </div>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => handleImageUpload(null)}
                >
                  <X className="h-4 w-4 stroke-current" />
                </Button>
              </div>
            )}
          </FileUploaderContent>
        </FileUploader>
        <div className="flex flex-wrap gap-6 mb-8 items-end mt-4">
          <div className="flex flex-col">
            <Label className="font-semibold mb-2">Columns:</Label>
            <Select
              value={cols.toString()}
              onValueChange={(value) =>
                updateGridSize(parseInt(value) || 1, rows)
              }
              disabled={!image}
            >
              <SelectTrigger className="w-20">
                <SelectValue placeholder="Select a columns" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1</SelectItem>
                <SelectItem value="2">2</SelectItem>
                <SelectItem value="3">3</SelectItem>
                <SelectItem value="4">4</SelectItem>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="6">6</SelectItem>
                <SelectItem value="7">7</SelectItem>
                <SelectItem value="8">8</SelectItem>
                <SelectItem value="9">9</SelectItem>
                <SelectItem value="10">10</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col">
            <Label className="font-semibold mb-2">Rows:</Label>
            <Select
              value={rows.toString()}
              onValueChange={(value) =>
                updateGridSize(cols, parseInt(value) || 1)
              }
              disabled={!image}
            >
              <SelectTrigger className="w-20">
                <SelectValue placeholder="Select a rows" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1</SelectItem>
                <SelectItem value="2">2</SelectItem>
                <SelectItem value="3">3</SelectItem>
                <SelectItem value="4">4</SelectItem>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="6">6</SelectItem>
                <SelectItem value="7">7</SelectItem>
                <SelectItem value="8">8</SelectItem>
                <SelectItem value="9">9</SelectItem>
                <SelectItem value="10">10</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col">
            <Label className="font-semibold mb-2">Grid Color:</Label>
            <ColorPicker
              value={gridColor}
              onChange={(e) => {
                if (typeof e === "string") {
                  setGridColor(e);
                }
              }}
              onBlur={() => {}}
              disabled={!image}
            />
          </div>

          <Button
            onClick={() => {
              cropImage();
              setTimeout(() => {
                document.getElementById("crop-results")?.scrollIntoView({
                  behavior: "smooth",
                });
              }, 100);
            }}
            disabled={!image}
          >
            {cropResults.length > 0 ? "Re-Crop Image" : "Crop Image"}
          </Button>

          <Button onClick={resetGrid} disabled={!image} variant="outline">
            Reset Grid Position
          </Button>
        </div>
      </div>
      <div className="flex justify-center mb-10">
        {image && (
          <GridCanvas
            canvasRef={canvasRef as React.RefObject<HTMLCanvasElement>}
            image={image}
            verticalLines={verticalLines}
            horizontalLines={horizontalLines}
            cols={cols}
            rows={rows}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            cursor={cursor}
            gridColor={gridColor}
          />
        )}
      </div>
      {cropResults.length > 0 && (
        <div>
          <h2
            className="text-center pt-10 text-2xl font-bold"
            id="crop-results"
          >
            Crop Results
          </h2>
          <div className="flex justify-center mt-6">
            <Button
              onClick={() => {
                downloadZip();
              }}
            >
              Download Zip
            </Button>
          </div>
          <div
            className="grid gap-4 p-5 rounded-lg"
            style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
          >
            {cropResults.map((result, index) => (
              <div
                key={index}
                className="text-center p-4 rounded-lg shadow-sm flex items-center justify-center flex-col"
              >
                <p className="text-xs mb-2">
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
                  style={{
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
                  }}
                />
                <button
                  onClick={() =>
                    downloadCanvas(
                      result.canvas,
                      `crop_${result.cellNumber}.png`
                    )
                  }
                  className="cursor-pointer mt-2 px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors"
                >
                  Download
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
