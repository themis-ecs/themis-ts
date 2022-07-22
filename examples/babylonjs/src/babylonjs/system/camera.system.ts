import { OnInit, System, World } from 'themis-ts';
import { CameraComponent } from '../component/camera.component';
import { ArcRotateCamera, Vector3 } from '@babylonjs/core';
import { SceneService } from '../service/scene.service';
import { BabylonjsService } from '../service/babylonjs.service';

@System()
export class CameraSystem implements OnInit {
  constructor(private world: World, private sceneService: SceneService, private babylonjsService: BabylonjsService) {}

  init(): void {
    const cameraEntity = this.world.createEntity();
    cameraEntity.addComponent(CameraComponent);
    cameraEntity.setAlias('camera');

    this.sceneService.getScene$().subscribe((scene) => {
      const camera = new ArcRotateCamera('Camera', Math.PI / 2, Math.PI / 2, 2, Vector3.Zero(), scene);
      camera.attachControl(this.babylonjsService.getCanvas(), true);
      this.world.getEntity('camera').getComponent(CameraComponent).camera = camera;
    });
  }
}
