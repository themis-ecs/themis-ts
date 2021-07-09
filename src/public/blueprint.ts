import { Component, ComponentType } from './component';

export type Blueprint = {
  name: string;
  components: Array<BlueprintComponentDefinition>;
};

export type BlueprintComponentDefinition = {
  type: ComponentType<any>;
  component?: Component;
};
