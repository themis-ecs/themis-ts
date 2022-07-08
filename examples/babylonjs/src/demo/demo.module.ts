import { Module } from 'themis-ts';
import { BabylonjsModule } from '../babylonjs/babylonjs.module';
import { DemoSystem } from './demo.system';

@Module({
  systems: [DemoSystem],
  providers: [],
  imports: [BabylonjsModule],
  exports: []
})
export class DemoModule {}
