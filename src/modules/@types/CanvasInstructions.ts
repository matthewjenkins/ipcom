export type CanvasInstructions = {
  ctx: CanvasRenderingContext2D;
  /** Canvas max width / height */
  size: { width: number; height: number };
  /** Object draw/render scale */
  scale: number;
};
