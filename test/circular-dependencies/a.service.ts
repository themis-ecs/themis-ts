import { forwardRef, Inject, Injectable } from '../../src';
import { ServiceB } from './b.service';

@Injectable()
export class ServiceA {
  public value = 0;

  constructor(@Inject(forwardRef(() => ServiceB)) public serviceB: ServiceB) {}
}
