import { Component } from '@public/component';
import { BitVector } from '@internal/bit-vector';

/**
 * @internal
 */
export class ComponentMapper<T extends Component> {
  private readonly components: { [entityId: number]: T } = {};
  private readonly cachedDeletions = new BitVector();

  constructor(
    private readonly addComponentCallback: (entityId: number, blueprintAdd: boolean) => void,
    private readonly removeComponentCallback: (entityId: number, entityDelete: boolean) => void
  ) {}

  public addComponent(entityId: number, component: T, blueprintAdd = false): void {
    this.components[entityId] = component;
    this.addComponentCallback(entityId, blueprintAdd);
    this.cachedDeletions.clear(entityId);
  }

  public removeComponent(entityId: number, entityDelete = false): void {
    this.removeComponentCallback(entityId, entityDelete);
    this.cachedDeletions.set(entityId);
  }

  public processModifications() {
    this.cachedDeletions.getBits().forEach((entity) => {
      delete this.components[entity];
    });
    this.cachedDeletions.reset();
  }

  public getComponent(entityId: number): T {
    return this.components[entityId];
  }
}
