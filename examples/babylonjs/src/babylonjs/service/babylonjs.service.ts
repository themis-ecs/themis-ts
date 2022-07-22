import { Injectable } from 'themis-ts';
import { Engine } from '@babylonjs/core';

@Injectable({
  providedIn: 'root'
})
export class BabylonjsService {
  private readonly engine: Engine;
  private readonly canvas: HTMLCanvasElement;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.id = 'gameCanvas';
    document.body.appendChild(this.canvas);

    this.engine = new Engine(this.canvas, true);
  }

  public getEngine(): Engine {
    return this.engine;
  }

  public getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }
}
