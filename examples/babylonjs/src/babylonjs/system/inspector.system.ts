import { OnInit, System } from 'themis-ts';
import { KeyboardEventTypes, Scene } from '@babylonjs/core';
import { SceneService } from '../service/scene.service';

@System()
export class InspectorSystem implements OnInit {
  constructor(private sceneService: SceneService) {}

  init(): void {
    this.sceneService.getScene$().subscribe((scene) => {
      scene.onKeyboardObservable.add((kbInfo) => {
        switch (kbInfo.type) {
          case KeyboardEventTypes.KEYDOWN:
            if (kbInfo.event.key === 'i') {
              this.toggleInspector(scene);
            }
            break;
        }
      });
    });
  }

  toggleInspector(scene: Scene): void {
    if (scene.debugLayer.isVisible()) {
      scene.debugLayer.hide();
    } else {
      scene.debugLayer.show();
    }
  }
}
