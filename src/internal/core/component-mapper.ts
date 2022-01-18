import { ComponentBase } from '../../public/component';
import { BitVector } from './bit-vector';
import { ComponentMapperSerialization, ComponentSerializer } from './serialization';

/**
 * @internal
 */
export class ComponentMapper<T extends ComponentBase> {
  private components: { [entityId: number]: T } = {};
  private cachedDeletions = new BitVector();
  private readonly componentId: number;
  private readonly componentName: string;
  private readonly serializer: ComponentSerializer<T, unknown>;

  constructor(componentId: number, componentName: string, serializer: ComponentSerializer<T, unknown>) {
    this.componentId = componentId;
    this.componentName = componentName;
    this.serializer = serializer;
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

  public static fromSerialization(
    serialization: ComponentMapperSerialization,
    serializer: ComponentSerializer<ComponentBase, unknown>
  ): ComponentMapper<ComponentBase> {
    const mapper = new ComponentMapper(serialization.componentId, serialization.componentName, serializer);

    Object.keys(serialization.components).forEach((entityId: string) => {
      const serializedComponent = serialization.components[Number(entityId)];
      mapper.components[Number(entityId)] = serializer.deserialize(serializedComponent);
    });

    mapper.cachedDeletions = BitVector.from(...serialization.cachedDeletions);
    return mapper;
  }

  public getSerialization(): ComponentMapperSerialization {
    const serializedComponents: { [entityId: number]: unknown } = {};
    Object.keys(this.components).forEach((entityId) => {
      serializedComponents[Number(entityId)] = this.serializer.serialize(this.components[Number(entityId)]);
    });

    return {
      components: serializedComponents,
      cachedDeletions: this.cachedDeletions.getBits(),
      componentId: this.componentId,
      componentName: this.componentName
    };
  }
}
