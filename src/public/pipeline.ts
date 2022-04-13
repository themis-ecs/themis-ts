import { System } from './system';
import { NOOP } from '../internal/core/noop';
import { Class } from './decorator';

export interface Pipeline<T = number> {
  update(o: T): void;
}

export type SetupCallback<T> = (pipeline: Pipeline<T>) => void;

export type SystemDefinition<T> = System<T> | Class<System<T>>;

export type PipelineDefinition<T> = {
  id: string;
  setupCallback: SetupCallback<T>;
  systems: Array<SystemDefinition<T>>;
};

export class PipelineDefinitionBuilder<T> {
  private readonly _id: string;
  private _setupCallback: SetupCallback<T> = NOOP;
  private _systems: Array<SystemDefinition<T>> = [];

  constructor(id: string) {
    this._id = id;
  }

  public setup(setupCallback: SetupCallback<T>): this {
    this._setupCallback = setupCallback;
    return this;
  }

  public systems(...systems: SystemDefinition<T>[]): this {
    this._systems.push(...systems);
    return this;
  }

  /**
   * @internal
   */
  public build(): PipelineDefinition<T> {
    return { id: this._id, systems: this._systems, setupCallback: this._setupCallback };
  }
}

export function Pipeline<T = number>(id: string): PipelineDefinitionBuilder<T> {
  return new PipelineDefinitionBuilder(id);
}
