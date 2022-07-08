import { OnUpdate, System, World } from 'themis-ts';
import { ArcRotateCamera, Engine, Scene, Vector3 } from '@babylonjs/core';
import { SceneChangedEvent } from './scene-changed.event';

@System()
export class SceneSystem implements OnUpdate {
  private scene!: Scene;

  constructor(private readonly world: World, private readonly engine: Engine) {
    this.setScene(new Scene(this.engine));
  }

  setScene(scene: Scene): void {
    this.scene = scene;
    new ArcRotateCamera('Camera', Math.PI / 2, Math.PI / 2, 2, Vector3.Zero(), scene);
    this.world.submit(SceneChangedEvent, new SceneChangedEvent(scene));
  }

  update(): void {
    this.scene.render();
  }
}
