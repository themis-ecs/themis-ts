import { ComponentBase, ComponentType } from '../../public/component';
import { BitVector } from './bit-vector';
import { ComponentMapper } from './component-mapper';
import { ComponentQuery, ComponentQueryIdentity } from './component-query';
import { ComponentQueryBuilder } from './component-query-builder';
import { BlueprintDefinition } from '../../public/blueprint';
import { BlueprintComponentConfiguration } from './blueprint-registry';
import { EventRegistry } from './event-registry';
import { EntityDeleteEvent } from '../../public/event';
import { COMPONENT_METADATA, ComponentMetadata } from '../di/metadata';

/**
 * @internal
 */
export class ComponentRegistry {
  private static readonly INITIAL_COMPONENT_CAPACITY = 32;
  private static readonly componentTypeMap: { [componentName: string]: ComponentType<ComponentBase> } = {};

  private readonly componentIdentityMap: { [componentName: string]: number };
  private readonly entityCompositionMap: { [entityId: number]: BitVector };
  private readonly componentMapperMap: {
    [componentId: number]: ComponentMapper<ComponentBase>;
  };
  private readonly componentQueries: Map<ComponentQueryIdentity, ComponentQuery>;
  private componentIdCounter: number;
  private readonly eventRegistry: EventRegistry;

  constructor(eventRegistry: EventRegistry) {
    this.componentIdentityMap = {};
    this.entityCompositionMap = {};
    this.componentMapperMap = {};
    this.componentQueries = new Map<ComponentQueryIdentity, ComponentQuery>();
    this.componentIdCounter = 0;
    this.eventRegistry = eventRegistry;
    this.eventRegistry.registerListener(EntityDeleteEvent, (event) => {
      this.processEntityDelete(event.getEntityId());
    });
  }

  public static registerComponent(component: ComponentType<ComponentBase>, componentName?: string): void {
    this.componentTypeMap[componentName || component.name] = component;
  }

  public static getComponentType(componentName: string): ComponentType<ComponentBase> {
    return this.componentTypeMap[componentName];
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
    const componentMetadata: ComponentMetadata = Reflect.getMetadata(COMPONENT_METADATA, componentType);
    return componentMetadata?.id || componentType.name;
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
    this.componentQueries.set(identity, componentQuery);
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

  public addComponent<T extends ComponentBase>(entityId: number, component: T): void {
    const componentType = Object.getPrototypeOf(component).constructor;
    const mapper = this.getComponentMapper(componentType);
    mapper.addComponent(entityId, component);
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

  public getBlueprintConfiguration(blueprint: BlueprintDefinition): BlueprintComponentConfiguration {
    const blueprintConfiguration: BlueprintComponentConfiguration = {
      componentMapperConfigurations: [],
      componentQueries: []
    };

    const composition = new BitVector();
    blueprint.components
      .map((component) => this.getComponentId(component.type))
      .forEach((componentId) => {
        composition.set(componentId);
      });
    this.componentQueries.forEach((componentQuery) => {
      if (componentQuery.isInterested(composition)) {
        blueprintConfiguration.componentQueries.push(componentQuery);
      }
    });

    blueprint.components.forEach((it) => {
      blueprintConfiguration.componentMapperConfigurations.push({
        mapper: this.getComponentMapper(it.type) as ComponentMapper<ComponentBase>,
        componentType: it.type,
        component: it.component
      });
    });

    return blueprintConfiguration;
  }

  public applyBlueprint(entityId: number, configuration: BlueprintComponentConfiguration): void {
    configuration.componentQueries.forEach((query) => query.add(entityId));
    configuration.componentMapperConfigurations.forEach((it) => {
      const component = new it.componentType();
      Object.assign(component, it.component);
      it.mapper.addComponent(entityId, component);
      this.getEntityComposition(entityId).set(it.mapper.getComponentId());
    });
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
