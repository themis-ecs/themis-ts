import { ServiceA } from './a.service';
import { forwardRef, Inject, Injectable } from '../../src';

@Injectable()
export class ServiceB {
  public value = 0;

  constructor(@Inject(forwardRef(() => ServiceA)) public serviceA: ServiceA) {}
}
