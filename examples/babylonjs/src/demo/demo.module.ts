import { Module } from 'themis-ts';
import { DemoSystem } from './system/demo.system';
import { BabylonjsModule } from '../babylonjs/babylonjs.module';

@Module({
  systems: [DemoSystem],
  providers: [],
  imports: [BabylonjsModule],
  exports: []
})
export class DemoModule {}
