import { Component, ComponentType } from '@public/component';
import { BitVector } from '@internal/bit-vector';
import { ComponentMapper } from '@internal/component-mapper';
import { ComponentSet } from '@internal/component-set';
import { ComponentSetBuilder } from '@public/component-set-builder';
import { Blueprint } from '@public/blueprint';
import { BlueprintComponentConfiguration } from '@internal/blueprint-registry';

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

  constructor() {
    this.componentIdentityMap = new Map<ComponentType<any>, number>();
    this.entityCompositionMap = {};
    this.componentMapperMap = {};
    this.componentSets = [];
    this.componentIdCounter = 0;
  }

  public update(): void {
    for (const componentSet of this.componentSets) {
      componentSet.processModifications();
    }
    for (let componentId in this.componentMapperMap) {
      this.componentMapperMap[componentId].processModifications();
    }
  }

  public getComponentId(component: ComponentType<any>): number {
    let id = this.componentIdentityMap.get(component);
    if (id == null) {
      id = this.componentIdCounter++;
      this.componentIdentityMap.set(component, id);
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

  public getComponentMapper<T extends Component>(component: ComponentType<T>): ComponentMapper<T> {
    const componentId = this.getComponentId(component);
    if (!this.componentMapperMap[componentId]) {
      this.componentMapperMap[componentId] = this.createComponentMapper(componentId);
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

  public getBlueprintConfiguration(blueprint: Blueprint): BlueprintComponentConfiguration {
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

  private createComponentMapper(componentId: number): ComponentMapper<any> {
    return new ComponentMapper(
      (entityId: number, blueprintAdd: boolean) => {
        const composition = this.getEntityComposition(entityId);
        composition.set(componentId);
        if (blueprintAdd) {
          return;
        }
        for (const componentSet of this.componentSets) {
          componentSet.onCompositionChange(entityId, composition);
        }
      },
      (entityId: number, entityDelete) => {
        const composition = this.getEntityComposition(entityId);
        composition.clear(componentId);
        for (const componentSet of this.componentSets) {
          componentSet.onCompositionChange(entityId, composition, entityDelete);
        }
      }
    );
  }
}
