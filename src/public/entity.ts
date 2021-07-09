import { Component, ComponentType } from '@public/component';

export interface Entity {
  getEntityId(): number;
  addComponent(...components: Component[]): Entity;
  getComponent<T extends Component>(componentType: ComponentType<T>): T;
  removeComponent(...componentTypes: ComponentType<any>[]): Entity;
  delete(): void;
  setAlias(alias: string): Entity;
}
