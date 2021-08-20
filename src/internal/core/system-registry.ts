import { System } from '../../public/system';

/**
 * @internal
 */
export class SystemRegistry {
  constructor(private readonly systems: System[]) {}

  public update(dt: number): void {
    for (const system of this.systems) {
      system.update(dt);
    }
  }
}
