import { ThemisWorld } from './world';
import { ComponentBase, ComponentType } from '../../public/component';
import { Entity as IEntity } from '../../public/entity';

/**
 * @internal
 */
export class ThemisEntity implements IEntity {
  constructor(private readonly world: ThemisWorld, private readonly entityId: number) {}

  public getEntityId(): number {
    return this.entityId;
  }

  public getWorld(): ThemisWorld {
    return this.world;
  }

  public addComponents<T extends ComponentBase>(...components: ComponentType<T>[]): this {
    components.forEach((component) => {
      this.addComponent(component);
    });
    return this;
  }

  public addComponent<T extends ComponentType<ComponentBase>>(component: T, ...args: ConstructorParameters<T>): this {
    this.world.addComponent(this.entityId, component, ...args);
    return this;
  }

  public getComponent<T extends ComponentBase>(componentType: ComponentType<T>): T {
    return this.world.getComponent(this.entityId, componentType);
  }

  public removeComponent(...componentTypes: ComponentType<ComponentBase>[]): this {
    componentTypes.forEach((componentType) => {
      this.world.removeComponent(this.entityId, componentType);
    });
    return this;
  }

  public delete(): void {
    this.world.deleteEntityById(this.entityId);
  }

  public setAlias(alias: string): this {
    this.getWorld().registerAlias(this.entityId, alias);
    return this;
  }
}
