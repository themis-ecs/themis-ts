import { Engine } from '@babylonjs/core';
import { ProviderDefinition } from 'themis-ts';

class EngineProvider {
  private readonly engine: Engine;

  constructor() {
    const canvas = document.createElement('canvas');
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.id = 'gameCanvas';
    document.body.appendChild(canvas);

    this.engine = new Engine(canvas, true);
  }

  public get(): Engine {
    return this.engine;
  }
}

const PROVIDER_INSTANCE = new EngineProvider();

export const ENGINE_PROVIDER: ProviderDefinition = {
  provide: Engine,
  useFactory: () => PROVIDER_INSTANCE.get()
};
