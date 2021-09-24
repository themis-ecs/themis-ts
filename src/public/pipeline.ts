import { System } from './system';
import { NOOP } from '../internal/core/noop';

export interface Pipeline {
  update(dt: number): void;
}

export type SetupCallback = (pipeline: Pipeline) => void;

export type PipelineDefinition = {
  id: string;
  setupCallback: SetupCallback;
  systems: Array<System>;
};

export class PipelineDefinitionBuilder {
  private readonly _id: string;
  private _setupCallback: SetupCallback = NOOP;
  private _systems: Array<System> = [];

  constructor(id: string) {
    this._id = id;
  }

  public setup(setupCallback: SetupCallback): this {
    this._setupCallback = setupCallback;
    return this;
  }

  public systems(...systems: System[]): this {
    this._systems = systems;
    return this;
  }

  /**
   * @internal
   */
  public build(): PipelineDefinition {
    return { id: this._id, systems: this._systems, setupCallback: this._setupCallback };
  }
}

export function Pipeline(id: string): PipelineDefinitionBuilder {
  return new PipelineDefinitionBuilder(id);
}
