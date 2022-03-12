import { ComponentBase } from '../../public/component';
import { BitVector } from './bit-vector';

/**
 * @internal
 */
export class ComponentMapper<T extends ComponentBase> {
  private components: { [entityId: number]: T } = {};
  private cachedDeletions = new BitVector();
  private readonly componentId: number;
  private readonly componentName: string;

  constructor(componentId: number, componentName: string) {
    this.componentId = componentId;
    this.componentName = componentName;
  }

  public addComponent(entityId: number, component: T): void {
    this.components[entityId] = component;
    this.cachedDeletions.clear(entityId);
  }

  public removeComponent(entityId: number): void {
    this.cachedDeletions.set(entityId);
  }

  public processModifications(): void {
    this.cachedDeletions.getBits().forEach((entity) => {
      delete this.components[entity];
    });
    this.cachedDeletions.reset();
  }

  public getComponent(entityId: number): T {
    return this.components[entityId];
  }

  public getComponentName(): string {
    return this.componentName;
  }

  public getComponentId(): number {
    return this.componentId;
  }
}
