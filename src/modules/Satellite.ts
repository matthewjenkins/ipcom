import IBodyTelemetry from "./@types/IBodyTelemetry";
import ICanvasObject from "./@types/ICanvasObject";
import JulianDate from "./JulianDate";
import { CanvasInstructions } from "./@types/CanvasInstructions";
import { IBodyPositionInfo } from "./@types/IBodyPositionInfo";

export class Satellite implements ICanvasObject {
  public readonly _canvasInfo: {
    diameter: number;
    x: number;
    y: number;
  };

  public name: string;
  public color: string;
  public diameter: number;
  public roateClockwise: boolean;
  public telemetry: IBodyTelemetry;
  public rates: IBodyTelemetry;
  public position: IBodyPositionInfo | null = null;

  constructor(
    name: string,
    color: string,
    radius: number,
    rotateClockwise: boolean,
    telemetry: IBodyTelemetry,
    rates: IBodyTelemetry,
    initialScale: number
  ) {
    this.name = name;
    this.color = color;
    this.diameter = radius;
    this.roateClockwise = rotateClockwise;
    this.telemetry = telemetry;
    this.rates = rates;

    this._canvasInfo = {
      diameter: this.getCanvasDiameter(initialScale),
      x: 0,
      y: 0,
    };
  }

  draw(c: CanvasInstructions): void {
    // draw planet
    c.ctx.fillStyle = this.color;
    c.ctx.beginPath();
    // c.ctx.arc(
    //   this._canvasInfo!.x,
    //   this._canvasInfo!.y,
    //   this._canvasInfo.diameter,
    //   0,
    //   2 * Math.PI,
    //   true
    // );
    c.ctx.arc(this._canvasInfo.x, this._canvasInfo.y, 4, 0, 2 * Math.PI, true);
    c.ctx.fill();
    c.ctx.closePath();
    c.ctx.lineWidth = 1;
    c.ctx.strokeStyle = this.color;
    c.ctx.stroke();
  }

  update(
    jdate: JulianDate,
    canvasSize: { width: number; height: number },
    scale: number
  ): void {
    function translateToCanvasPosition(position: IBodyPositionInfo): {
      x: number;
      y: number;
    } {
      const x = canvasSize.width / 2 + position.xGen * scale;
      const y = canvasSize.height / 2 - position.yGen * scale;

      return { x, y };
    }

    this.position = this.getPlotData(jdate.specialT, this);

    const pos = translateToCanvasPosition(this.position);

    this._canvasInfo.x = pos.x;
    this._canvasInfo.y = pos.y;
  }

  private getPlotData(TGen: number, body: Satellite): IBodyPositionInfo {
    function toRadians(deg: number): number {
      return deg * (Math.PI / 180);
    }
    //--------------------------------------------------------------------------------------------
    //1.
    //ORBIT SIZE
    //AU (CONSTANT = DOESN'T CHANGE)
    let aGen = body.telemetry.a + body.rates.a * TGen;
    //2.
    //ORBIT SHAPE
    //ECCENTRICITY (CONSTANT = DOESN'T CHANGE)
    let eGen = body.telemetry.e + body.rates.e * TGen;
    //--------------------------------------------------------------------------------------------
    //3.
    //ORBIT ORIENTATION
    //ORBITAL INCLINATION (CONSTANT = DOESN'T CHANGE)
    let iGen = body.telemetry.i + body.rates.i * TGen;
    iGen = iGen % 360;
    //4.
    //ORBIT ORIENTATION
    //LONG OF ASCENDING NODE (CONSTANT = DOESN'T CHANGE)
    let WGen =
      body.telemetry.longitudeOfAscendingNode +
      body.rates.longitudeOfAscendingNode * TGen;
    WGen = WGen % 360;
    //5.
    //ORBIT ORIENTATION
    //LONGITUDE OF THE PERIHELION
    let wGen =
      body.telemetry.longitudeOfPerihelion +
      body.rates.longitudeOfPerihelion * TGen;
    wGen = wGen % 360;
    if (wGen < 0) {
      wGen = 360 + wGen;
    }
    //--------------------------------------------------------------------------------------------
    //6.
    //ORBIT POSITION
    //MEAN LONGITUDE (DYNAMIC = CHANGES OVER TIME)
    let LGen = body.telemetry.meanLongitude + body.rates.meanLongitude * TGen;
    LGen = LGen % 360;
    if (LGen < 0) {
      LGen = 360 + LGen;
    }

    //MEAN ANOMALY --> Use this to determine Perihelion (0 degrees = Perihelion of planet)
    let MGen = LGen - wGen;
    if (MGen < 0) {
      MGen = 360 + MGen;
    }

    //ECCENTRIC ANOMALY
    let EGen = this.eccentricityAnnon(eGen, MGen, 6);

    //ARGUMENT OF TRUE ANOMALY
    let trueAnomalyArgGen =
      Math.sqrt((1 + eGen) / (1 - eGen)) * Math.tan(toRadians(EGen) / 2);

    //TRUE ANOMALY (DYNAMIC = CHANGES OVER TIME)
    let K = Math.PI / 180.0; //Radian converter variable
    var nGen;
    if (trueAnomalyArgGen < 0) {
      nGen = 2 * (Math.atan(trueAnomalyArgGen) / K + 180); //ATAN = ARCTAN = INVERSE TAN
    } else {
      nGen = 2 * (Math.atan(trueAnomalyArgGen) / K);
    }
    //--------------------------------------------------------------------------------------------
    //CALCULATE diameter VECTOR
    let rGen = aGen * (1 - eGen * Math.cos(toRadians(EGen)));

    //TAKEN FROM: http://www.stargazing.net/kepler/ellipse.html
    //CREDIT: Keith Burnett
    //Used to determine Heliocentric Ecliptic Coordinates
    let xGen =
      rGen *
      (Math.cos(toRadians(WGen)) * Math.cos(toRadians(nGen + wGen - WGen)) -
        Math.sin(toRadians(WGen)) *
          Math.sin(toRadians(nGen + wGen - WGen)) *
          Math.cos(toRadians(iGen)));
    let yGen =
      rGen *
      (Math.sin(toRadians(WGen)) * Math.cos(toRadians(nGen + wGen - WGen)) +
        Math.cos(toRadians(WGen)) *
          Math.sin(toRadians(nGen + wGen - WGen)) *
          Math.cos(toRadians(iGen)));
    let zGen =
      rGen *
      (Math.sin(toRadians(nGen + wGen - WGen)) * Math.sin(toRadians(iGen)));

    return {
      aGen: aGen,
      eGen: eGen,
      iGen: iGen,
      LGen: LGen,
      wGen: wGen,
      WGen: WGen,
      MGen: MGen,
      EGen: EGen,
      nGen: nGen,
      xGen: xGen,
      yGen: yGen,
      zGen: zGen,
      rGen: rGen,
    };
  }

  private eccentricityAnnon(ec: number, m: number, dp: number): number {
    // arguments:
    // ec=eccentricity, m=mean anomaly,
    // dp=number of decimal places

    const K = Math.PI / 180.0;
    var maxIter = 30;
    var i = 0;
    var delta = Math.pow(10, -dp);
    var E;
    var F;

    m = m / 360.0;
    m = 2.0 * Math.PI * (m - Math.floor(m));

    if (ec < 0.8) E = m;
    else E = Math.PI;

    F = E - ec * Math.sin(m) - m;

    while (Math.abs(F) > delta && i < maxIter) {
      E = E - F / (1.0 - ec * Math.cos(E));
      F = E - ec * Math.sin(E) - m;
      i = i + 1;
    }

    E = E / K;

    return Math.round(E * Math.pow(10, dp)) / Math.pow(10, dp);
  }

  public refresh(scale: number): void {
    this._canvasInfo.diameter = this.getCanvasDiameter(scale);
  }

  private getCanvasDiameter(scale: number): number {
    const MIN_DIAMETER = 1;

    let d = 3 + 0.5 * (this.diameter * scale);

    if (d < MIN_DIAMETER) d = MIN_DIAMETER;

    return d;
  }
}
