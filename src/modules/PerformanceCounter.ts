export class PerformanceCounter {
  FPS: Counter;
  TPS: Counter;

  private now: number = Date.now();
  private then: number = Date.now();
  private delta: number = 0;

  constructor() {
    this.FPS = {
      count: 0,
      delta: 0,
      now: Date.now(),
      then: Date.now(),
      average: 0,
    };
    this.TPS = {
      count: 0,
      delta: 0,
      now: Date.now(),
      then: Date.now(),
      average: 0,
    };
  }
  update = (interval: number): boolean => {
    let value = false;
    this.now = Date.now();
    this.delta = this.now - this.then;

    // Run this code based on desired rendering rate
    if (this.delta > interval) {
      this.then = this.now - (this.delta % interval);

      // Keep track of FPS
      this.FPS.count++;
      this.FPS.now = Date.now();
      this.FPS.delta = this.FPS.now - this.FPS.then;
      if (this.FPS.delta > 1000) {
        // Update frame rate every second
        this.FPS.average = this.FPS.count;
        this.FPS.count = 0;
        this.FPS.then = this.FPS.now - (this.FPS.delta % 1000);
      }

      value = true;
    }

    // Keep track of TPS
    this.TPS.count++;
    this.TPS.now = Date.now();
    this.TPS.delta = this.TPS.now - this.TPS.then;
    if (this.TPS.delta > 1000) {
      // Update frame rate every second
      this.TPS.average = this.TPS.count;
      this.TPS.count = 0;
      this.TPS.then = this.TPS.now - (this.TPS.delta % 1000);
    }

    return value;
  };
}

type Counter = {
  then: number;
  now: number;
  delta: number;
  count: number;
  average: number;
};
