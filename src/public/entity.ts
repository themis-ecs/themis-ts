import { ComponentBase, ComponentType } from './component';

export interface Entity {
  getEntityId(): number;
  addComponent<T extends ComponentType<ComponentBase>>(component: T, ...args: ConstructorParameters<T>): this;
  addComponents<T extends ComponentBase>(...components: ComponentType<T>[]): this;
  getComponent<T extends ComponentBase>(component: ComponentType<T>): T;
  removeComponent(...component: ComponentType<ComponentBase>[]): this;
  delete(): void;
  setAlias(alias: string): this;
}
