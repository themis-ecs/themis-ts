import '@babylonjs/core/Debug/debugLayer';
import '@babylonjs/inspector';
import '@babylonjs/loaders/glTF';
import { Module } from 'themis-ts';
import { InspectorSystem } from './system/inspector.system';
import { CameraSystem } from './system/camera.system';
import { BabylonjsService } from './service/babylonjs.service';
import { SceneService } from './service/scene.service';
import { Scene } from '@babylonjs/core';
import { RenderSystem } from './system/render.system';

@Module({
  systems: [InspectorSystem, CameraSystem, RenderSystem],
  providers: [BabylonjsService, SceneService],
  imports: [],
  exports: [BabylonjsService, SceneService]
})
export class BabylonjsModule {
  constructor(private babylonjsService: BabylonjsService, private sceneService: SceneService) {}

  init(): void {
    const scene = new Scene(this.babylonjsService.getEngine());
    this.sceneService.setScene(scene);
  }
}
