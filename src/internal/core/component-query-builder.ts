import { ComponentBase, ComponentQueryDefinition, ComponentType } from '../../public/component';
import { BitVector } from './bit-vector';
import { ComponentQuery, ComponentQueryIdentity } from './component-query';

/**
 * @internal
 */
export class ComponentQueryBuilder implements ComponentQueryDefinition {
  private readonly all: Array<ComponentType<ComponentBase>> = [];
  private readonly any: Array<ComponentType<ComponentBase>> = [];
  private readonly none: Array<ComponentType<ComponentBase>> = [];

  public containingAll(...components: Array<ComponentType<ComponentBase>>): ComponentQueryBuilder {
    this.all.push(...components);
    return this;
  }

  public containingAny(...components: Array<ComponentType<ComponentBase>>): ComponentQueryBuilder {
    this.any.push(...components);
    return this;
  }

  public containingNone(...components: Array<ComponentType<ComponentBase>>): ComponentQueryBuilder {
    this.none.push(...components);
    return this;
  }

  public getIdentity(): ComponentQueryIdentity {
    return {
      all: this.all,
      any: this.any,
      none: this.none
    };
  }

  public build(
    capacity: number,
    resolveComponentId: (component: ComponentType<ComponentBase>) => number
  ): ComponentQuery {
    let allVector: BitVector | null = null;
    let anyVector: BitVector | null = null;
    let noneVector: BitVector | null = null;
    if (this.all.length > 0) {
      allVector = new BitVector(capacity);
      for (const component of this.all) {
        allVector.set(resolveComponentId(component));
      }
    }
    if (this.any.length > 0) {
      anyVector = new BitVector(capacity);
      for (const component of this.any) {
        anyVector.set(resolveComponentId(component));
      }
    }
    if (this.none.length > 0) {
      noneVector = new BitVector(capacity);
      for (const component of this.none) {
        noneVector.set(resolveComponentId(component));
      }
    }
    return new ComponentQuery(allVector, anyVector, noneVector);
  }
}
