import JulianDate from "../JulianDate";
import { CanvasInstructions } from "./CanvasInstructions";

export default interface ICanvasObject {
  /** render the object on a canvas */
  draw(c: CanvasInstructions): void;

  /** update the object position */
  update(
    /** julian date to calculate against */
    jdate: JulianDate,
    /** the canvas max width / height */
    canvasSize: { width: number; height: number },
    /** the scale to draw the object at */
    scale: number
  ): void;
}
