import { Injector } from '../../public/injector';
import { Container } from './container';
import { Module } from './module';
import { Identifier } from '../../public/decorator';

export class PublicInjector implements Injector {
  constructor(private container: Container, private module?: Module) {}

  inject(instance: unknown): void {
    this.container.inject(instance, this.module);
  }

  resolve<T>(identifier: Identifier<T>): T | undefined {
    return this.container.resolve(identifier, this.module);
  }
}
