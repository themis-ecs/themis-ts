import { System } from './system';
import { NOOP } from '../internal/core/noop';

export interface Pipeline {
  update(dt: number): void;
}

export type UpdateCallback = (pipeline: Pipeline) => void;

export type PipelineDefinition = {
  id: string;
  updateCallback: UpdateCallback;
  systems: Array<System>;
};

export class PipelineDefinitionBuilder {
  private readonly _id: string;
  private _updateCallback: UpdateCallback = NOOP;
  private _systems: Array<System> = [];

  constructor(id: string) {
    this._id = id;
  }

  public update(updateCallback: UpdateCallback): this {
    this._updateCallback = updateCallback;
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
    return { id: this._id, systems: this._systems, updateCallback: this._updateCallback };
  }
}

export function Pipeline(id: string): PipelineDefinitionBuilder {
  return new PipelineDefinitionBuilder(id);
}
