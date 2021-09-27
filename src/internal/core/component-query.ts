import { BitVector } from './bit-vector';
import { Component, ComponentType } from '../../public/component';

/**
 * @internal
 */
export type ComponentQueryIdentity = {
  all: ReadonlyArray<ComponentType<Component>>;
  any: ReadonlyArray<ComponentType<Component>>;
  none: ReadonlyArray<ComponentType<Component>>;
};

/**
 * @internal
 */
export class ComponentQuery {
  private activeEntities: number[] = [];

  private readonly entities = new BitVector();
  private readonly entityAddListeners: ((entityId: number) => void)[] = [];
  private readonly entityRemoveListeners: ((entityId: number) => void)[] = [];
  private readonly entitiesAdded = new BitVector();
  private readonly entitiesRemoved = new BitVector();

  private modified = false;

  constructor(
    private readonly all: BitVector | null,
    private readonly any: BitVector | null,
    private readonly none: BitVector | null
  ) {}

  public onEntityAdd(callback: (entityId: number) => void): void {
    this.entityAddListeners.push(callback);
  }

  public onEntityRemove(callback: (entityId: number) => void): void {
    this.entityRemoveListeners.push(callback);
  }

  public onCompositionChange(entityId: number, entityComposition: BitVector, entityDelete = false): void {
    if (this.isInterested(entityComposition) && !entityDelete) {
      if (this.entities.get(entityId)) {
        return;
      }
      this.entities.set(entityId);
      this.entitiesAdded.set(entityId);
      this.entitiesRemoved.clear(entityId);
      this.modified = true;
    } else if (this.entities.get(entityId)) {
      this.entities.clear(entityId);
      this.entitiesRemoved.set(entityId);
      this.entitiesAdded.clear(entityId);
      this.modified = true;
    }
  }

  public add(entityId: number): void {
    this.entities.set(entityId);
    this.entitiesAdded.set(entityId);
    this.modified = true;
  }

  public isInterested(entityComposition: BitVector): boolean {
    if (this.all && !entityComposition.containsAll(this.all)) {
      return false;
    }
    if (this.none && !entityComposition.containsNone(this.none)) {
      return false;
    }
    return !(this.any && !entityComposition.containsAny(this.any));
  }

  public processModifications(): void {
    if (this.modified) {
      this.activeEntities = this.entities.getBits();
      this.entitiesAdded.getBits().forEach((entity) => this.entityAddListeners.forEach((listener) => listener(entity)));
      this.entitiesAdded.reset();
      this.entitiesRemoved
        .getBits()
        .forEach((entity) => this.entityRemoveListeners.forEach((listener) => listener(entity)));
      this.entitiesRemoved.reset();
    }
    this.modified = false;
  }

  public getActiveEntities(): number[] {
    return this.activeEntities;
  }
}
