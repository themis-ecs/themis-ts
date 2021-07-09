import { Entity, EntityFactory } from './entity';

/**
 * @internal
 */
export class EntityRegistry {
  private entityIdCounter: number = 0;
  private deletedEntities: number[] = [];
  private recyclableEntities: number[] = [];
  private entities: { [entityId: number]: Entity } = {};
  private entityFactory!: EntityFactory;
  private entityDeleteListeners: ((entityId: number) => void)[] = [];
  private aliasToEntityIdMap: { [alias: string]: number } = {};
  private entityIdToAliasMap: { [entityId: number]: string } = {};

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

  public onEntityDelete(callback: (entityId: number) => void): void {
    this.entityDeleteListeners.push(callback);
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
      const entity = this.deletedEntities.pop()!;
      try {
        this.entityDeleteListeners.forEach((listener) => listener(entity));
      } finally {
        this.recyclableEntities.push(entity);
        const alias = this.entityIdToAliasMap[entity];
        if (alias) {
          delete this.entityIdToAliasMap[entity];
          delete this.aliasToEntityIdMap[alias];
        }
      }
    }
  }
}
