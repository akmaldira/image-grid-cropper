export interface GridLine {
  position: number; // normalized 0-1
}

export interface CropResult {
  canvas: HTMLCanvasElement;
  cellNumber: number;
  width: number;
  height: number;
}

export interface DragState {
  isDragging: boolean;
  dragType: "vertical" | "horizontal" | null;
  dragIndex: number;
}
