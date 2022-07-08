import { System, World } from 'themis-ts';
import { SceneChangedEvent } from '../babylonjs/scene-changed.event';
import { HemisphericLight, MeshBuilder, Scene, Vector3 } from '@babylonjs/core';

@System()
export class DemoSystem {
  constructor(world: World) {
    world.registerListener(SceneChangedEvent, (event) => this.onSceneChange(event.scene));
  }

  onSceneChange(scene: Scene): void {
    new HemisphericLight('light1', new Vector3(1, 1, 0), scene);
    MeshBuilder.CreateSphere('sphere', { diameter: 1 }, scene);
  }
}
