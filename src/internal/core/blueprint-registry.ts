import { ComponentQuery } from './component-query';
import { ComponentBase, ComponentType } from '../../public/component';
import { ComponentMapper } from './component-mapper';
import { BlueprintDefinition, BluePrintInitializer } from '../../public/blueprint';

/**
 * @internal
 */
export type BlueprintComponentConfiguration = {
  componentQueries: Array<ComponentQuery>;
  componentMapperConfigurations: Array<BlueprintComponentMapperConfiguration>;
  initialize?: BluePrintInitializer;
};

/**
 * @internal
 */
export type BlueprintComponentMapperConfiguration = {
  componentType: ComponentType<ComponentBase>;
  component: ComponentBase | undefined;
  mapper: ComponentMapper<ComponentBase>;
};

/**
 * @internal
 */
export class BlueprintRegistry {
  private blueprintMap: { [blueprintName: string]: BlueprintComponentConfiguration };
  private readonly blueprintDefinitions: BlueprintDefinition[] = [];

  constructor() {
    this.blueprintMap = {};
  }

  public registerBlueprint(blueprintName: string, configuration: BlueprintComponentConfiguration): void {
    this.blueprintMap[blueprintName] = configuration;
  }

  public getBlueprint(blueprintName: string): BlueprintComponentConfiguration {
    return this.blueprintMap[blueprintName];
  }

  public registerBlueprintDefinition(definition: BlueprintDefinition): void {
    this.blueprintDefinitions.push(definition);
  }

  public getBlueprintDefinitions(): BlueprintDefinition[] {
    return this.blueprintDefinitions;
  }

  public resetBlueprints(): void {
    this.blueprintMap = {};
  }
}
