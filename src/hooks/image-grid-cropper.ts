import { useCallback, useRef, useState } from "react";
import { CropResult, DragState, GridLine } from "../types";

export const useImageGridCropper = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [cols, setCols] = useState(3);
  const [rows, setRows] = useState(3);
  const [verticalLines, setVerticalLines] = useState<GridLine[]>([]);
  const [horizontalLines, setHorizontalLines] = useState<GridLine[]>([]);
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    dragType: null,
    dragIndex: -1,
  });
  const [cropResults, setCropResults] = useState<CropResult[]>([]);

  const initializeGrid = useCallback(() => {
    const newVerticalLines: GridLine[] = [];
    const newHorizontalLines: GridLine[] = [];

    for (let i = 1; i < cols; i++) {
      newVerticalLines.push({ position: i / cols });
    }

    for (let i = 1; i < rows; i++) {
      newHorizontalLines.push({ position: i / rows });
    }

    setVerticalLines(newVerticalLines);
    setHorizontalLines(newHorizontalLines);
  }, [cols, rows]);

  const resetGrid = useCallback(() => {
    initializeGrid();
  }, [initializeGrid]);

  const handleImageUpload = useCallback((file: File | null) => {
    setFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setImage(img);
      };
      img.src = e.target?.result as string;
    };
    if (file) {
      reader.readAsDataURL(file);
    } else {
      setImage(null);
      setCropResults([]);
      setDragState({
        isDragging: false,
        dragType: null,
        dragIndex: -1,
      });
      setRows(3);
      setCols(3);
    }
  }, []);

  const updateGridSize = useCallback(
    (newCols: number, newRows: number) => {
      if (newCols >= 1 && newCols <= 10 && newCols !== cols) {
        setCols(newCols);
      }
      if (newRows >= 1 && newRows <= 10 && newRows !== rows) {
        setRows(newRows);
      }
    },
    [cols, rows]
  );

  const getMousePos = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height),
    };
  }, []);

  const findNearestLine = useCallback(
    (mousePos: { x: number; y: number }) => {
      const canvas = canvasRef.current;
      if (!canvas) return null;

      const { width, height } = canvas;
      const dragThreshold = 10;

      // Check vertical lines
      for (let i = 0; i < verticalLines.length; i++) {
        const lineX = verticalLines[i].position * width;
        if (Math.abs(mousePos.x - lineX) < dragThreshold) {
          return { type: "vertical" as const, index: i };
        }
      }

      // Check horizontal lines
      for (let i = 0; i < horizontalLines.length; i++) {
        const lineY = horizontalLines[i].position * height;
        if (Math.abs(mousePos.y - lineY) < dragThreshold) {
          return { type: "horizontal" as const, index: i };
        }
      }

      return null;
    },
    [verticalLines, horizontalLines]
  );

  const updateLinePosition = useCallback(
    (mousePos: { x: number; y: number }) => {
      const canvas = canvasRef.current;
      if (!canvas || !dragState.isDragging) return;

      const { width, height } = canvas;

      if (dragState.dragType === "vertical") {
        let newX = mousePos.x / width;

        const prevX =
          dragState.dragIndex > 0
            ? verticalLines[dragState.dragIndex - 1]?.position || 0
            : 0;
        const nextX =
          dragState.dragIndex < verticalLines.length - 1
            ? verticalLines[dragState.dragIndex + 1]?.position || 1
            : 1;

        newX = Math.max(prevX + 0.05, Math.min(nextX - 0.05, newX));

        const newVerticalLines = [...verticalLines];
        newVerticalLines[dragState.dragIndex] = { position: newX };
        setVerticalLines(newVerticalLines);
      } else if (dragState.dragType === "horizontal") {
        let newY = mousePos.y / height;

        const prevY =
          dragState.dragIndex > 0
            ? horizontalLines[dragState.dragIndex - 1]?.position || 0
            : 0;
        const nextY =
          dragState.dragIndex < horizontalLines.length - 1
            ? horizontalLines[dragState.dragIndex + 1]?.position || 1
            : 1;

        newY = Math.max(prevY + 0.05, Math.min(nextY - 0.05, newY));

        const newHorizontalLines = [...horizontalLines];
        newHorizontalLines[dragState.dragIndex] = { position: newY };
        setHorizontalLines(newHorizontalLines);
      }
    },
    [dragState, verticalLines, horizontalLines]
  );

  const cropImage = useCallback(() => {
    if (!image) return;

    const xPositions = [
      0,
      ...verticalLines.map((l) => l.position * image.width),
      image.width,
    ];
    const yPositions = [
      0,
      ...horizontalLines.map((l) => l.position * image.height),
      image.height,
    ];

    const results: CropResult[] = [];

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const srcX = xPositions[col];
        const srcY = yPositions[row];
        const cellWidth = xPositions[col + 1] - srcX;
        const cellHeight = yPositions[row + 1] - srcY;

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (ctx) {
          canvas.width = cellWidth;
          canvas.height = cellHeight;

          ctx.drawImage(
            image,
            srcX,
            srcY,
            cellWidth,
            cellHeight,
            0,
            0,
            cellWidth,
            cellHeight
          );

          const cellNumber = row * cols + col + 1;
          results.push({
            canvas,
            cellNumber,
            width: Math.round(cellWidth),
            height: Math.round(cellHeight),
          });
        }
      }
    }

    setCropResults(results);
  }, [image, verticalLines, horizontalLines, rows, cols]);

  return {
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
    findNearestLine,
    updateLinePosition,
    cropImage,
  };
};
