import { ComponentQuery } from './component-query';
import { ComponentBase, ComponentType } from '../../public/component';
import { ComponentMapper } from './component-mapper';
import { BluePrintInitializer } from '../../public/blueprint';

/**
 * @internal
 */
export type BlueprintComponentConfiguration = {
  componentQueries: Array<ComponentQuery>;
  componentMapperConfigurations: Array<
    BlueprintComponentMapperConfiguration<ComponentBase, ComponentType<ComponentBase>>
  >;
  initialize: BluePrintInitializer;
};

/**
 * @internal
 */
export type BlueprintComponentMapperConfiguration<T extends ComponentBase, U extends ComponentType<T>> = {
  component: U;
  args: ConstructorParameters<U>;
  mapper: ComponentMapper<T>;
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

  public getBlueprint(blueprintName: string): BlueprintComponentConfiguration {
    return this.blueprintMap[blueprintName];
  }
}
