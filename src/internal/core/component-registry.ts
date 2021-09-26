import { Component, ComponentType } from '../../public/component';
import { BitVector } from './bit-vector';
import { ComponentMapper } from './component-mapper';
import { ComponentQuery } from './component-query';
import { ComponentQueryBuilder } from './component-query-builder';
import { BlueprintDefinition } from '../../public/blueprint';
import { BlueprintComponentConfiguration } from './blueprint-registry';
import { EventRegistry } from './event-registry';
import { ComponentAddEvent, ComponentRemoveEvent, EntityDeleteEvent } from '../../public/event';

/**
 * @internal
 */
export class ComponentRegistry {
  private static readonly INITIAL_COMPONENT_CAPACITY = 32;

  private readonly componentIdentityMap: Map<ComponentType<Component>, number>;
  private readonly entityCompositionMap: { [entityId: number]: BitVector };
  private readonly componentMapperMap: {
    [componentId: number]: ComponentMapper<Component>;
  };
  private readonly componentQueries: Array<ComponentQuery>;
  private componentIdCounter: number;
  private readonly eventRegistry: EventRegistry;

  constructor(eventRegistry: EventRegistry) {
    this.componentIdentityMap = new Map<ComponentType<Component>, number>();
    this.entityCompositionMap = {};
    this.componentMapperMap = {};
    this.componentQueries = [];
    this.componentIdCounter = 0;
    this.eventRegistry = eventRegistry;
    this.eventRegistry.registerListener(EntityDeleteEvent, (event) => {
      this.processEntityDelete(event.getEntityId());
    });
    this.eventRegistry.registerListener(ComponentAddEvent, (event) => {
      this.onComponentAdd(event.getEntityId(), event.getComponentId(), event.isBlueprintAdd());
    });
    this.eventRegistry.registerListener(ComponentRemoveEvent, (event) => {
      this.onComponentRemove(event.getEntityId(), event.getComponentId(), event.isEntityDelete());
    });
  }

  public update(): void {
    for (const componentQuery of this.componentQueries) {
      componentQuery.processModifications();
    }
    for (const componentId in this.componentMapperMap) {
      this.componentMapperMap[componentId].processModifications();
    }
  }

  public getComponentId(componentType: ComponentType<Component>): number {
    let id = this.componentIdentityMap.get(componentType);
    if (id == null) {
      id = this.componentIdCounter++;
      this.componentIdentityMap.set(componentType, id);
    }
    return id;
  }

  public createComponentSet(componentQueryBuilder: ComponentQueryBuilder): ComponentQuery {
    const componentQuery = componentQueryBuilder.build(ComponentRegistry.INITIAL_COMPONENT_CAPACITY, (component) =>
      this.getComponentId(component)
    );
    this.componentQueries.push(componentQuery);
    return componentQuery;
  }

  public getComponentMapper<T extends Component>(componentType: ComponentType<T>): ComponentMapper<T> {
    const componentId = this.getComponentId(componentType);
    if (!this.componentMapperMap[componentId]) {
      this.componentMapperMap[componentId] = this.createComponentMapper(componentId, componentType);
    }
    return this.componentMapperMap[componentId] as ComponentMapper<T>;
  }

  public processEntityDelete(entity: number): void {
    const composition = this.getEntityComposition(entity);
    const componentIds = composition.getBits();
    componentIds.forEach((componentId) => {
      this.componentMapperMap[componentId].removeComponent(entity, true);
    });
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
        mapper: this.getComponentMapper(it.type) as ComponentMapper<Component>,
        componentType: it.type,
        component: it.component
      });
    });

    return blueprintConfiguration;
  }

  private getEntityComposition(entityId: number): BitVector {
    if (!this.entityCompositionMap[entityId]) {
      this.entityCompositionMap[entityId] = new BitVector(ComponentRegistry.INITIAL_COMPONENT_CAPACITY);
    }
    return this.entityCompositionMap[entityId];
  }

  private createComponentMapper<T extends Component>(
    componentId: number,
    componentType: ComponentType<T>
  ): ComponentMapper<T> {
    return new ComponentMapper(this.eventRegistry, componentId, componentType);
  }

  private onComponentAdd(entityId: number, componentId: number, blueprintAdd: boolean): void {
    const composition = this.getEntityComposition(entityId);
    composition.set(componentId);
    if (blueprintAdd) {
      return;
    }
    for (const componentSet of this.componentQueries) {
      componentSet.onCompositionChange(entityId, composition);
    }
  }

  private onComponentRemove(entityId: number, componentId: number, entityDelete: boolean): void {
    const composition = this.getEntityComposition(entityId);
    composition.clear(componentId);
    for (const componentSet of this.componentQueries) {
      componentSet.onCompositionChange(entityId, composition, entityDelete);
    }
  }
}
