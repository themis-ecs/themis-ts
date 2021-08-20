import { Component, ComponentType } from './component';
import { Entity } from './entity';

export type BlueprintDefinition = {
  name: string;
  components: Array<BlueprintComponentDefinition>;
  initialize?: BluePrintInitializer;
};

export type BlueprintComponentDefinition = {
  type: ComponentType<any>;
  component?: Component;
};

export type BluePrintInitializer = (entity: Entity) => void;
