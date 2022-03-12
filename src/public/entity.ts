import { ComponentBase, ComponentType } from './component';

export interface Entity {
  getEntityId(): number;
  addComponent(...components: ComponentBase[]): this;
  getComponent<T extends ComponentBase>(componentType: ComponentType<T>): T;
  removeComponent(...componentTypes: ComponentType<ComponentBase>[]): this;
  delete(): void;
  setAlias(alias: string): this;
}
