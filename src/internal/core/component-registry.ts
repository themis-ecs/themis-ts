import { ComponentBase, ComponentType } from '../../public/component';
import { BitVector } from './bit-vector';
import { ComponentMapper } from './component-mapper';
import { ComponentQuery, ComponentQueryIdentity } from './component-query';
import { ComponentQueryBuilder } from './component-query-builder';
import { BlueprintDefinition, BluePrintInitializer } from '../../public/blueprint';
import { EventRegistry } from './event-registry';
import { EntityDeleteEvent } from '../../public/event';
import { NOOP } from './noop';
import { Entity } from '../../public/entity';

/**
 * @internal
 */
type BlueprintComponentConfiguration = {
  composition: BitVector;
  componentQueries: Array<ComponentQuery>;
  componentMapperConfigurations: Array<
    BlueprintComponentMapperConfiguration<ComponentBase, ComponentType<ComponentBase>>
  >;
  initialize: BluePrintInitializer;
};

/**
 * @internal
 */
type BlueprintComponentMapperConfiguration<T extends ComponentBase, U extends ComponentType<T>> = {
  component: U;
  args: ConstructorParameters<U>;
  mapper: ComponentMapper<T>;
};

/**
 * @internal
 */
export class ComponentRegistry {
  private static readonly INITIAL_COMPONENT_CAPACITY = 32;

  private readonly blueprintMap: { [blueprintName: string]: BlueprintComponentConfiguration };
  private readonly componentIdentityMap: { [componentName: string]: number };
  private readonly entityCompositionMap: BitVector[];
  private readonly componentMapperMap: ComponentMapper<ComponentBase>[];
  private readonly componentQueries: Map<ComponentQueryIdentity, ComponentQuery>;
  private componentIdCounter: number;
  private readonly eventRegistry: EventRegistry;

  constructor(eventRegistry: EventRegistry) {
    this.blueprintMap = {};
    this.componentIdentityMap = {};
    this.entityCompositionMap = [];
    this.componentMapperMap = [];
    this.componentQueries = new Map<ComponentQueryIdentity, ComponentQuery>();
    this.componentIdCounter = 0;
    this.eventRegistry = eventRegistry;
    this.eventRegistry.registerListener(EntityDeleteEvent, (event) => {
      this.processEntityDelete(event.getEntityId());
    });
  }

  public update(): void {
    this.componentQueries.forEach((componentQuery) => componentQuery.processModifications());
    for (const componentId in this.componentMapperMap) {
      this.componentMapperMap[componentId].processModifications();
    }
  }

  public getComponentId(componentType: ComponentType<ComponentBase>): number {
    const componentName = this.getComponentName(componentType);
    let id = this.componentIdentityMap[componentName];
    if (id == null) {
      id = this.componentIdCounter++;
      this.componentIdentityMap[componentName] = id;
    }
    return id;
  }

  public getComponentName(componentType: ComponentType<ComponentBase>): string {
    return componentType.name;
  }

  public getComponentQuery(componentQueryBuilder: ComponentQueryBuilder): ComponentQuery {
    const identity = componentQueryBuilder.getIdentity();
    let componentQuery = this.componentQueries.get(identity);
    if (componentQuery) {
      return componentQuery;
    }
    componentQuery = componentQueryBuilder.build(ComponentRegistry.INITIAL_COMPONENT_CAPACITY, (component) =>
      this.getComponentId(component)
    );
    this.entityCompositionMap.forEach((composition, entityId) =>
      componentQuery?.onCompositionChange(entityId, composition)
    );
    this.componentQueries.set(identity, componentQuery);
    Object.values(this.blueprintMap).forEach((blueprint) => {
      if (componentQuery?.isInterested(blueprint.composition)) {
        blueprint.componentQueries.push(componentQuery);
      }
    });
    return componentQuery;
  }

  private getComponentMapper<T extends ComponentBase>(componentType: ComponentType<T>): ComponentMapper<T> {
    const componentId = this.getComponentId(componentType);
    const componentName = this.getComponentName(componentType);
    if (!this.componentMapperMap[componentId]) {
      this.componentMapperMap[componentId] = ComponentRegistry.createComponentMapper(componentId, componentName);
    }
    return this.componentMapperMap[componentId] as ComponentMapper<T>;
  }

  public addComponent<T extends ComponentType<ComponentBase>>(
    entityId: number,
    component: T,
    ...args: ConstructorParameters<T>
  ): void {
    const componentInstance = new component(...args);
    const mapper = this.getComponentMapper(component);
    mapper.addComponent(entityId, componentInstance);
    const composition = this.getEntityComposition(entityId);
    composition.set(mapper.getComponentId());
    this.componentQueries.forEach((componentQuery) => componentQuery.onCompositionChange(entityId, composition));
  }

  public removeComponent<T extends ComponentBase>(entityId: number, component: ComponentType<T>): void {
    const mapper = this.getComponentMapper(component);
    mapper.removeComponent(entityId);
    const composition = this.getEntityComposition(entityId);
    composition.clear(mapper.getComponentId());
    this.componentQueries.forEach((componentQuery) => componentQuery.onCompositionChange(entityId, composition));
  }

  public getComponent<T extends ComponentBase>(entityId: number, component: ComponentType<T>): T {
    return this.getComponentMapper(component).getComponent(entityId);
  }

  public processEntityDelete(entity: number): void {
    const composition = this.getEntityComposition(entity);
    const componentIds = composition.getBits();
    componentIds.forEach((componentId) => {
      this.componentMapperMap[componentId].removeComponent(entity);
    });
    this.componentQueries.forEach((query) => query.remove(entity));
    composition.reset();
  }

  public registerBlueprint(blueprint: BlueprintDefinition): void {
    const blueprintConfiguration: BlueprintComponentConfiguration = {
      composition: new BitVector(),
      componentMapperConfigurations: [],
      componentQueries: [],
      initialize: blueprint.initializer ? blueprint.initializer : NOOP
    };

    blueprint.components
      .map((componentConfig) => this.getComponentId(componentConfig.component))
      .forEach((componentId) => {
        blueprintConfiguration.composition.set(componentId);
      });
    this.componentQueries.forEach((componentQuery) => {
      if (componentQuery.isInterested(blueprintConfiguration.composition)) {
        blueprintConfiguration.componentQueries.push(componentQuery);
      }
    });

    blueprint.components.forEach((componentConfig) => {
      blueprintConfiguration.componentMapperConfigurations.push({
        mapper: this.getComponentMapper(componentConfig.component) as ComponentMapper<ComponentBase>,
        component: componentConfig.component,
        args: componentConfig.args
      });
    });

    this.blueprintMap[blueprint.name] = blueprintConfiguration;
  }

  public applyBlueprint(entity: Entity, blueprintName: string): void {
    const configuration = this.blueprintMap[blueprintName];
    if (!configuration) {
      return;
    }
    const entityId = entity.getEntityId();
    configuration.componentQueries.forEach((query) => query.add(entityId));
    configuration.componentMapperConfigurations.forEach((config) => {
      const mapper = config.mapper;
      const component = new config.component(...config.args);
      mapper.addComponent(entityId, component);
      this.getEntityComposition(entityId).set(mapper.getComponentId());
    });
    configuration.initialize(entity);
  }

  private getEntityComposition(entityId: number): BitVector {
    if (!this.entityCompositionMap[entityId]) {
      this.entityCompositionMap[entityId] = new BitVector(ComponentRegistry.INITIAL_COMPONENT_CAPACITY);
    }
    return this.entityCompositionMap[entityId];
  }

  private static createComponentMapper<T extends ComponentBase>(
    componentId: number,
    componentName: string
  ): ComponentMapper<T> {
    return new ComponentMapper(componentId, componentName);
  }
}
