import { Injector } from '../../public/injector';
import { Container } from './container';
import { Identifier } from '../../public/decorator';
import { ModuleClass } from '../../public/module';

export class PublicInjector implements Injector {
  constructor(private container: Container, private module?: ModuleClass) {}

  inject(instance: unknown): void {
    this.container.inject(instance, this.module);
  }

  resolve<T>(identifier: Identifier<T>): T | undefined {
    return this.container.resolve(identifier, this.module);
  }
}
