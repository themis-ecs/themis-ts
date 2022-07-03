import { Module } from '../../src';
import { ServiceA } from './a.service';
import { ServiceB } from './b.service';

@Module({
  providers: [ServiceA, ServiceB]
})
export class TestModule {}
