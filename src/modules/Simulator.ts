import JulianDate from "./JulianDate";
import { PerformanceCounter } from "./PerformanceCounter";
import { Satellite } from "./Satellite";
import * as config from "../assets/config.json";
import { CanvasInstructions } from "./@types/CanvasInstructions";

type ViewerLayers = {
  [index in "background" | "foreground"]: {
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
  };
};
type Config = {
  width: number;
  height: number;
  intervalId: number | null;
  scale: number;
  interval: number;
  draw: {
    date: boolean;
    fps: boolean;
    tps: boolean;
    positions: boolean;
  };
};
export class Simulator {
  private layers: ViewerLayers;
  public performanceCounter: PerformanceCounter;

  public readonly config: Config = {
    width: 0,
    height: 0,
    interval: 1,
    intervalId: null,
    scale: 0.0001,
    draw: {
      date: true,
      fps: true,
      tps: true,
      positions: true,
    },
  };

  private satellites: Satellite[] = [];
  private _currentDate: Date = new Date();
  private _currentJulianDate: JulianDate = new JulianDate(this._currentDate);

  public get currentDate() {
    return this._currentDate;
  }

  public set currentDate(value: Date) {
    this._currentDate = value;
    this._currentJulianDate = new JulianDate(value);
  }

  public get currentJulianDate() {
    return this._currentJulianDate;
  }

  constructor(fg: HTMLCanvasElement, bg: HTMLCanvasElement) {
    this.performanceCounter = new PerformanceCounter();
    this.layers = {
      background: {
        canvas: bg,
        context: bg.getContext("2d")!,
      },
      foreground: {
        canvas: fg,
        context: fg.getContext("2d")!,
      },
    };
  }

  public get running() {
    return this.config.intervalId != null;
  }

  init(initialScale: number) {
    this.resize();
    // bind UI

    // build data
    for (const obj of config.bodies) {
      const satellite = new Satellite(
        obj.name,
        obj.color,
        obj.diameter,
        obj.spinsClockwise,
        obj.telemetry,
        obj.rates,
        initialScale
      );

      satellite.update(
        this.currentJulianDate,
        { width: this.config.width, height: this.config.height },
        100
      );
      // console.log(satellite.name, satellite._canvasInfo);
      this.satellites.push(satellite);
    }

    console.log("background", this.config.width, this.config.height);
    // render Sun at center

    this.drawSun();
    console.log("init");
  }

  update() {
    this.currentDate = new Date(
      this.currentDate.getTime() + 1000 * this.config.interval
    );

    // update satellite positions
    for (const satellite of this.satellites) {
      satellite.update(
        this.currentJulianDate,
        { width: this.config.width, height: this.config.height },
        100
      );
    }
  }

  render() {
    const ctx = this.layers.foreground.context;
    ctx.clearRect(0, 0, this.config.width, this.config.height);

    const foreground = {
      ctx: ctx,
      size: { width: this.config.width, height: this.config.height },
      scale: this.config.scale,
    };

    const infoX = 10;
    let infoY = CANVAS_DEFAULTS.lineIncrement;

    // draw info
    if (this.config.draw.fps) {
      this.drawText(
        foreground,
        `FPS: ${this.performanceCounter.FPS.average}`,
        infoX,
        infoY
      );
      infoY += CANVAS_DEFAULTS.lineIncrement;
    }
    if (this.config.draw.tps) {
      this.drawText(
        foreground,
        `TPS: ${this.performanceCounter.TPS.average}`,
        infoX,
        infoY
      );
      infoY += CANVAS_DEFAULTS.lineIncrement;
    }
    if (this.config.draw.date) {
      this.drawText(
        foreground,
        `Date: ${this.currentDate.toLocaleString()}`,
        infoX,
        infoY
      );
      infoY += CANVAS_DEFAULTS.lineIncrement;
    }

    for (const satellite of this.satellites) {
      // draw planets on foreground
      satellite.draw(foreground);

      if (this.config.draw.positions) {
        this.drawText(
          foreground,
          `${satellite.name}: (${satellite._canvasInfo.x.toFixed(
            2
          )}, ${satellite._canvasInfo.y.toFixed(
            2
          )}) (${satellite.position!.xGen.toFixed(
            2
          )}, ${satellite.position!.yGen.toFixed(2)})`,
          infoX,
          infoY
        );
        infoY += CANVAS_DEFAULTS.lineIncrement;
      }
    }
  }

  resize() {
    console.log("resize");
    const { width, height } =
      this.layers.background.canvas.parentElement!.getBoundingClientRect()!;

    this.config.width = width;
    this.config.height = height;

    this.layers.background.canvas.width = width;
    this.layers.background.canvas.height = height;

    this.layers.foreground.canvas.width = width;
    this.layers.foreground.canvas.height = height;
  }

  run() {
    if (this.config.intervalId) return;

    console.log("run");
    this.drawSun();
    this.performanceCounter.update(this.config.interval);
    this.config.intervalId = window.setInterval(() => {
      if (!this.config.intervalId) return;

      this.update();
      if (this.performanceCounter.update(1000 / 30)) {
        window.requestAnimationFrame(() => {
          this.render();
        });
      }
    }, 1);
  }

  pause() {
    if (!this.config.intervalId) return;

    window.clearInterval(this.config.intervalId);
    this.config.intervalId = null;
  }

  setSpeed(value: "up" | "down") {
    const MIN = 1,
      MAX = 60 * 60 * 24;

    let v = this.config.interval;
    if (value === "up") {
      v *= 2;
    } else if (value === "down") {
      v /= 2;
    } else return;

    if (v > MAX) v = MAX;

    if (v < MIN) v = MIN;

    console.log("set speed", value, v);
    this.config.interval = v;
  }

  private drawText(
    c: CanvasInstructions,
    text: string,
    x: number,
    y: number
  ): void {
    c.ctx.font = CANVAS_DEFAULTS.font;

    c.ctx.textAlign = CANVAS_DEFAULTS.textAlign;
    c.ctx.fillStyle = CANVAS_DEFAULTS.fontColor;
    c.ctx.fillText(text, x, y);
  }

  drawSun() {
    const ctx = this.layers.background.context;

    ctx.beginPath();
    ctx.arc(this.config.width / 2, this.config.height / 2, 10, 0, 2 * Math.PI);
    ctx.fillStyle = "yellow";
    ctx.fill();
    ctx.closePath();
  }
}

const CANVAS_DEFAULTS = {
  font: "14px Arial",
  fontColor: "white",
  textAlign: "left" as CanvasTextAlign,
  lineIncrement: 14,
};
