import { WorldBuilder } from 'themis-ts';
import { AppModule } from './app.module';

new WorldBuilder().module(AppModule).build();
