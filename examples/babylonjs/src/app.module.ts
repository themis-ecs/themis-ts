import { Module, Pipeline } from 'themis-ts';
import { BabylonjsModule } from './babylonjs/babylonjs.module';
import { Engine } from '@babylonjs/core';
import { DemoModule } from './demo/demo.module';

@Module({
  systems: [],
  providers: [],
  imports: [BabylonjsModule, DemoModule],
  exports: []
})
export class AppModule {
  constructor(private readonly engine: Engine) {}

  init(pipeline: Pipeline): void {
    this.engine.runRenderLoop(() => {
      pipeline.update(this.engine.getDeltaTime());
    });
  }
}
