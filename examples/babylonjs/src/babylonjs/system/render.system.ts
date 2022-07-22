import { OnUpdate, System } from 'themis-ts';
import { SceneService } from '../service/scene.service';
import { Scene } from '@babylonjs/core';

@System()
export class RenderSystem implements OnUpdate {
  private scene?: Scene;

  constructor(private sceneService: SceneService) {
    this.sceneService.getScene$().subscribe((scene) => (this.scene = scene));
  }

  update(): void {
    this.scene?.render();
  }
}
