import { Simulator } from "./modules/Simulator";
import "./style.css";
import "./icons";

const fg = document.querySelector<HTMLCanvasElement>("#fg")!;
const bg = document.querySelector<HTMLCanvasElement>("#bg")!;

const simulator = new Simulator(fg, bg);
simulator.init(0.0001);

(window as any).simulator = simulator;

(() => {
  const onClick = (
    el: string,
    listener: (this: HTMLElement, ev: MouseEvent) => any
  ): void => {
    document
      .querySelector<HTMLElement>(el)!
      .addEventListener("click", listener);
  };

  onClick("#run", (event) => {
    const el = event.currentTarget as HTMLElement;
    const icon = el.querySelector("svg") as SVGElement;

    if (simulator.running) {
      simulator.pause();
      icon.classList.remove("fa-pause");
      icon.classList.add("fa-play");
    } else {
      simulator.run();
      icon.classList.remove("fa-play");
      icon.classList.add("fa-pause");
    }
  });

  onClick("#speedDec", () => {
    simulator.setSpeed("down");
  });

  onClick("#speedInc", () => {
    simulator.setSpeed("up");
  });

  window.addEventListener("resize", () => {
    simulator.resize();
  });

  simulator.resize();

  window.setInterval(() => {
    function timeConversion(millisec: number): string {
      const seconds = millisec / 1000;

      const minutes = millisec / (1000 * 60);

      const hours = millisec / (1000 * 60 * 60);

      const days = millisec / (1000 * 60 * 60 * 24);

      if (seconds < 60) {
        return seconds.toFixed(2) + " Sec";
      } else if (minutes < 60) {
        return minutes.toFixed(2) + " Min";
      } else if (hours < 24) {
        return hours.toFixed(2) + " Hrs";
      } else {
        return days.toFixed(2) + " Days";
      }
    }

    const el = document.querySelector("#speed") as HTMLElement;
    if (simulator.running) {
      const tps = simulator.performanceCounter.TPS.average;
      const speed = simulator.config.interval * tps;

      simulator.performanceCounter;
      el.innerText = `${timeConversion(speed * 1000)}/sec`;
    } else {
      el.innerText = "";
    }
  }, 100);
})();
