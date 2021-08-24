import { Component, ComponentType } from '../../public/component';
import { BitVector } from './bit-vector';
import { ComponentMapper } from './component-mapper';
import { ComponentSet } from './component-set';
import { ComponentSetBuilder } from './component-set-builder';
import { BlueprintDefinition } from '../../public/blueprint';
import { BlueprintComponentConfiguration } from './blueprint-registry';
import { EventRegistry } from './event-registry';
import { ComponentAddEvent, ComponentRemoveEvent, EntityDeleteEvent } from '../../public/event';

/**
 * @internal
 */
export class ComponentRegistry {
  private static readonly INITIAL_COMPONENT_CAPACITY = 32;

  private readonly componentIdentityMap: Map<ComponentType<any>, number>;
  private readonly entityCompositionMap: { [entityId: number]: BitVector };
  private readonly componentMapperMap: {
    [componentId: number]: ComponentMapper<any>;
  };
  private readonly componentSets: Array<ComponentSet>;
  private componentIdCounter: number;
  private readonly eventRegistry: EventRegistry;

  constructor(eventRegistry: EventRegistry) {
    this.componentIdentityMap = new Map<ComponentType<any>, number>();
    this.entityCompositionMap = {};
    this.componentMapperMap = {};
    this.componentSets = [];
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
    for (const componentSet of this.componentSets) {
      componentSet.processModifications();
    }
    for (let componentId in this.componentMapperMap) {
      this.componentMapperMap[componentId].processModifications();
    }
  }

  public getComponentId(componentType: ComponentType<any>): number {
    let id = this.componentIdentityMap.get(componentType);
    if (id == null) {
      id = this.componentIdCounter++;
      this.componentIdentityMap.set(componentType, id);
    }
    return id;
  }

  public createComponentSet(componentSetBuilder: ComponentSetBuilder): ComponentSet {
    let componentSet = componentSetBuilder.build(ComponentRegistry.INITIAL_COMPONENT_CAPACITY, (component) =>
      this.getComponentId(component)
    );
    this.componentSets.push(componentSet);
    return componentSet;
  }

  public getComponentMapper<T extends Component>(componentType: ComponentType<T>): ComponentMapper<T> {
    const componentId = this.getComponentId(componentType);
    if (!this.componentMapperMap[componentId]) {
      this.componentMapperMap[componentId] = this.createComponentMapper(componentId, componentType);
    }
    return this.componentMapperMap[componentId];
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
      componentSets: []
    };

    const composition = new BitVector();
    blueprint.components
      .map((component) => this.getComponentId(component.type))
      .forEach((componentId) => {
        composition.set(componentId);
      });
    this.componentSets.forEach((componentSet) => {
      if (componentSet.isInterested(composition)) {
        blueprintConfiguration.componentSets.push(componentSet);
      }
    });

    blueprint.components.forEach((it) => {
      blueprintConfiguration.componentMapperConfigurations.push({
        mapper: this.getComponentMapper(it.type) as ComponentMapper<any>,
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

  private createComponentMapper(componentId: number, componentType: ComponentType<any>): ComponentMapper<any> {
    return new ComponentMapper(this.eventRegistry, componentId, componentType);
  }

  private onComponentAdd(entityId: number, componentId: number, blueprintAdd: boolean): void {
    const composition = this.getEntityComposition(entityId);
    composition.set(componentId);
    if (blueprintAdd) {
      return;
    }
    for (const componentSet of this.componentSets) {
      componentSet.onCompositionChange(entityId, composition);
    }
  }

  private onComponentRemove(entityId: number, componentId: number, entityDelete: boolean): void {
    const composition = this.getEntityComposition(entityId);
    composition.clear(componentId);
    for (const componentSet of this.componentSets) {
      componentSet.onCompositionChange(entityId, composition, entityDelete);
    }
  }

  public getComponentIdentityMap(): ReadonlyMap<ComponentType<any>, number> {
    return this.componentIdentityMap;
  }

  public getEntityCompositionMap(): { [entityId: number]: BitVector } {
    return this.entityCompositionMap;
  }
}
