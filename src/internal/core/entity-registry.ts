import { Entity, EntityFactory } from './entity';
import { EventRegistry } from './event-registry';
import { EntityDeleteEvent } from '../../public/event';

/**
 * @internal
 */
export class EntityRegistry {
  private entityIdCounter = 0;
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

  public setEntityFactory(entityFactory: EntityFactory): void {
    this.entityFactory = entityFactory;
  }

  public createEntityId(): number {
    const entityId = this.recyclableEntities.pop();
    if (entityId !== undefined) {
      return entityId;
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

  public registerAlias(entityId: number, alias: string): void {
    this.entityIdToAliasMap[entityId] = alias;
    this.aliasToEntityIdMap[alias] = entityId;
  }

  public update(): void {
    let entityId = this.deletedEntities.pop();
    while (entityId !== undefined) {
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
      entityId = this.deletedEntities.pop();
    }
  }
}
