import { Entity } from './entity';
import { BlueprintDefinition } from './blueprint';
import { Event, EventErrorCallback, EventListener, EventType } from './event';

/**
 * The world is part of the main API of themis-ecs. It is the place, where your systems, your components and
 * your entities live in. You can use this object to create new entities, register and use blueprints, register
 * and submit events and most importantly: you use the update method to let time pass in your world.
 */
export abstract class World {
  /**
   * Get an entity by alias. You can set an alias for an entity via the Entity object.
   * @see Entity
   * @param alias the alias of your entity
   */
  abstract getEntity(alias: string): Entity;

  /**
   * Get an entity by it's id. The id is managed by themis internally, you can get the id via the Entity object
   * @see Entity
   * @param entityId the id of the entity
   */
  abstract getEntity(entityId: number): Entity;

  /**
   * Create a new and totally blank entity
   * @see Entity
   */
  abstract createEntity(): Entity;

  /**
   * Create a new entity which is based on a blueprint. You can learn more about blueprints in the documentation.
   * @see registerBlueprint
   * @param blueprint
   */
  abstract createEntity(blueprint: string): Entity;

  /**
   * Register a new blueprint. This can then be used to create new entities based on the given BlueprintDefinition
   * @see createEntity
   * @param blueprint
   */
  abstract registerBlueprint(blueprint: BlueprintDefinition): void;

  /**
   * Register an EventListener. If the given event occurs, all registered listeners be called after all Systems
   * have done their updated. All event calls are queued and performed in the order they were called. If an error
   * occurs, you can handle the error via the given error callback.
   * @param eventType
   * @param listener
   * @param errorCallback
   */
  abstract registerListener<T extends Event>(
    eventType: EventType<T>,
    listener: EventListener<T>,
    errorCallback?: EventErrorCallback<T>
  ): void;

  /**
   * Submit the given event. All EventListeners will be informed about this call after all systems have updated.
   * If you don't want your event to be queued, you can set the instant parameter to true, this will result in your
   * event being processed directly in this call.
   * @param eventType
   * @param event
   * @param instant
   */
  abstract submit<T extends Event>(eventType: EventType<T>, event: T, instant?: boolean): void;

  /**
   * You can use this method to inject the dependencies which were configured during world building into any
   * arbitrary object. See the documentation about dependency injection in the world builder for more details.
   * @see WorldBuilder
   * @param object
   */
  abstract inject(object: unknown): void;
}
