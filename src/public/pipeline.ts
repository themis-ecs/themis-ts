import { System } from './system';
import { NOOP } from '../internal/core/noop';
import { NoArgsClass } from './decorator';

export interface Pipeline<T> {
  update(o: T): void;
}

export type SetupCallback<T> = (pipeline: Pipeline<T>) => void;

export type SystemDefinition = System<unknown> | NoArgsClass<System>;

export type PipelineDefinition<T> = {
  id: string;
  setupCallback: SetupCallback<T>;
  systems: Array<System<T>>;
};

export class PipelineDefinitionBuilder<T> {
  private readonly _id: string;
  private _setupCallback: SetupCallback<T> = NOOP;
  private _systems: Array<System<T>> = [];

  constructor(id: string) {
    this._id = id;
  }

  public setup(setupCallback: SetupCallback<T>): this {
    this._setupCallback = setupCallback;
    return this;
  }

  public systems(...systems: SystemDefinition[]): this {
    this._systems = systems.map((system) => {
      if (typeof system === 'function') {
        return new system();
      }
      return system;
    });
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
