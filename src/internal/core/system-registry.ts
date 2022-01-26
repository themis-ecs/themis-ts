import { ThemisWorld } from './world';
import { System } from '../../public/system';

/**
 * @internal
 */
export class SystemRegistry {
  private readonly systems: Array<System> = [];

  public registerSystem(...systems: System[]) {
    this.systems.push(...systems);
  }

  public initSystems(world: ThemisWorld): void {
    this.systems.forEach((system) => world.inject(system));
    this.systems.forEach((system) => system.init(world));
  }
}
