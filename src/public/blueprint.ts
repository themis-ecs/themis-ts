import { ComponentBase, ComponentType } from './component';
import { Entity } from './entity';
import { NOOP } from '../internal/core/noop';

export type ComponentWithConstructorArgs<T extends ComponentType<ComponentBase>> = {
  component: T;
  args: ConstructorParameters<T>;
};

export type BluePrintInitializer = (entity: Entity) => void;

export type BlueprintDefinition = {
  name: string;
  components: Array<ComponentWithConstructorArgs<ComponentType<ComponentBase>>>;
  initializer: BluePrintInitializer;
};

export class BlueprintBuilder {
  private readonly definition: BlueprintDefinition;

  constructor(name: string) {
    this.definition = {
      name,
      components: [],
      initializer: NOOP
    };
  }

  public component<T extends ComponentType<ComponentBase>>(component: T, ...args: ConstructorParameters<T>): this {
    this.definition.components.push({
      component,
      args
    });
    return this;
  }

  public initialize(initializer: BluePrintInitializer): this {
    this.definition.initializer = initializer;
    return this;
  }

  /**
   * @internal
   */
  public build(): BlueprintDefinition {
    return this.definition;
  }
}

export type Blueprint = BlueprintBuilder;

export function Blueprint(name: string): Blueprint {
  return new BlueprintBuilder(name);
}
