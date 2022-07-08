import { System, World } from 'themis-ts';
import { KeyboardEventTypes, Scene } from '@babylonjs/core';
import { SceneChangedEvent } from './scene-changed.event';

@System()
export class InspectorSystem {
  private scene?: Scene;

  constructor(world: World) {
    world.registerListener(SceneChangedEvent, (event) => {
      this.scene = event.scene;

      event.scene.onKeyboardObservable.add((kbInfo) => {
        switch (kbInfo.type) {
          case KeyboardEventTypes.KEYDOWN:
            if (kbInfo.event.key === 'i') {
              this.toggleInspector();
            }
            break;
        }
      });
    });
  }

  toggleInspector(): void {
    if (this.scene?.debugLayer.isVisible()) {
      this.scene.debugLayer.hide();
    } else {
      this.scene?.debugLayer.show();
    }
  }
}
