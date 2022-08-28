/**
 * @internal
 */
import { SystemType } from '../../public/system';
import { ModuleClass } from '../../public/module';

export class SystemRegistry {
  private readonly moduleScopes = new Map<ModuleClass, SystemType<unknown>[]>();
  private readonly globalScope: SystemType<unknown>[] = [];

  public registerModuleScope(module: ModuleClass, systems: SystemType<unknown>[]) {
    this.moduleScopes.set(module, systems.slice());
  }

  public registerGlobalScope(systems: SystemType<unknown>[]) {
    this.globalScope.push(...systems.slice());
  }

  public getSystems<T = unknown>(module?: ModuleClass): ReadonlyArray<SystemType<T>> {
    if (!module) {
      return this.globalScope;
    }
    return this.moduleScopes.get(module) || [];
  }
}
