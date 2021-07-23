import { Component, ComponentType } from './component';

export interface Entity {
  getEntityId(): number;
  addComponent(...components: Component[]): this;
  getComponent<T extends Component>(componentType: ComponentType<T>): T;
  removeComponent(...componentTypes: ComponentType<any>[]): this;
  delete(): void;
  setAlias(alias: string): this;
}
