import { OnInit, System } from 'themis-ts';
import { HemisphericLight, MeshBuilder, Scene, Vector3 } from '@babylonjs/core';
import { SceneService } from '../../babylonjs/service/scene.service';

@System()
export class DemoSystem implements OnInit {
  constructor(private sceneService: SceneService) {}

  init(): void {
    this.sceneService.getScene$().subscribe((scene) => this.onSceneChange(scene));
  }

  onSceneChange(scene: Scene): void {
    new HemisphericLight('light1', new Vector3(1, 1, 0), scene);
    MeshBuilder.CreateSphere('sphere', { diameter: 1 }, scene);
  }
}
