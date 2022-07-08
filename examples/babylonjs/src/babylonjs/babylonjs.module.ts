import '@babylonjs/core/Debug/debugLayer';
import '@babylonjs/inspector';
import '@babylonjs/loaders/glTF';
import { Module } from 'themis-ts';
import { ENGINE_PROVIDER } from './engine.provider';
import { Engine } from '@babylonjs/core';
import { SceneSystem } from './scene.system';
import { InspectorSystem } from './inspector.system';

@Module({
  systems: [InspectorSystem, SceneSystem],
  providers: [ENGINE_PROVIDER],
  imports: [],
  exports: [Engine]
})
export class BabylonjsModule {}
