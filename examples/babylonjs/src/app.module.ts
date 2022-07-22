import { Module, Pipeline } from 'themis-ts';
import { BabylonjsModule } from './babylonjs/babylonjs.module';
import { DemoModule } from './demo/demo.module';
import { BabylonjsService } from './babylonjs/service/babylonjs.service';

@Module({
  systems: [],
  providers: [],
  imports: [BabylonjsModule, DemoModule],
  exports: []
})
export class AppModule {
  constructor(private readonly babylonjsService: BabylonjsService) {}

  init(pipeline: Pipeline): void {
    this.babylonjsService.getEngine().runRenderLoop(() => {
      pipeline.update(this.babylonjsService.getEngine().getDeltaTime());
    });
  }
}
