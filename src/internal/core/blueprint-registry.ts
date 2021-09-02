import { ComponentSet } from './component-set';
import { Component, ComponentType } from '../../public/component';
import { ComponentMapper } from './component-mapper';
import { BluePrintInitializer } from '../../public/blueprint';
import { Entity } from './entity';

/**
 * @internal
 */
export type BlueprintComponentConfiguration = {
  componentSets: Array<ComponentSet>;
  componentMapperConfigurations: Array<BlueprintComponentMapperConfiguration>;
  initialize?: BluePrintInitializer;
};

/**
 * @internal
 */
export type BlueprintComponentMapperConfiguration = {
  componentType: ComponentType<Component>;
  component: Component | undefined;
  mapper: ComponentMapper<Component>;
};

/**
 * @internal
 */
export class BlueprintRegistry {
  private readonly blueprintMap: { [blueprintName: string]: BlueprintComponentConfiguration };

  constructor() {
    this.blueprintMap = {};
  }

  public registerBlueprint(blueprintName: string, configuration: BlueprintComponentConfiguration): void {
    this.blueprintMap[blueprintName] = configuration;
  }

  public applyBlueprint(entity: Entity, blueprintName: string): void {
    const configuration = this.blueprintMap[blueprintName];
    configuration.componentSets.forEach((componentSet) => componentSet.add(entity.getEntityId()));
    configuration.componentMapperConfigurations.forEach((it) => {
      const component = new it.componentType();
      Object.assign(component, it.component);
      it.mapper.addComponent(entity.getEntityId(), component, true);
    });
    configuration.initialize?.(entity);
  }
}
