import { Entity, EntityFactory } from './entity';
import { EventRegistry } from './event-registry';
import { EntityDeleteEvent } from '../public/event';

/**
 * @internal
 */
export class EntityRegistry {
  private entityIdCounter: number = 0;
  private deletedEntities: number[] = [];
  private recyclableEntities: number[] = [];
  private entities: { [entityId: number]: Entity } = {};
  private entityFactory!: EntityFactory;
  private aliasToEntityIdMap: { [alias: string]: number } = {};
  private entityIdToAliasMap: { [entityId: number]: string } = {};
  private readonly eventRegistry: EventRegistry;

  constructor(eventRegistry: EventRegistry) {
    this.eventRegistry = eventRegistry;
  }

  public setEntityFactory(entityFactory: EntityFactory) {
    this.entityFactory = entityFactory;
  }

  public createEntityId(): number {
    if (this.recyclableEntities.length !== 0) {
      return this.recyclableEntities.pop()!;
    }
    return this.entityIdCounter++;
  }

  public deleteEntityById(entityId: number): void {
    this.deletedEntities.push(entityId);
  }

  public getEntity(entityId: number): Entity {
    let entity = this.entities[entityId];
    if (entity) {
      return entity;
    }
    entity = this.entityFactory.build(entityId);
    this.entities[entityId] = entity;
    return entity;
  }

  public getEntityByAlias(alias: string): Entity {
    return this.getEntity(this.aliasToEntityIdMap[alias]);
  }

  public registerAlias(entityId: number, alias: string) {
    this.entityIdToAliasMap[entityId] = alias;
    this.aliasToEntityIdMap[alias] = entityId;
  }

  public update(): void {
    while (this.deletedEntities.length !== 0) {
      const entityId = this.deletedEntities.pop()!;
      try {
        this.eventRegistry.submit(EntityDeleteEvent, new EntityDeleteEvent(entityId), true);
      } finally {
        this.recyclableEntities.push(entityId);
        const alias = this.entityIdToAliasMap[entityId];
        if (alias) {
          delete this.entityIdToAliasMap[entityId];
          delete this.aliasToEntityIdMap[alias];
        }
      }
    }
  }
}
