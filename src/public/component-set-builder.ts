import { ComponentSet } from '@internal/component-set';
import { ComponentType } from '@public/component';
import { BitVector } from '@internal/bit-vector';

export class ComponentSetBuilder {
  private readonly all: Array<ComponentType<any>> = [];
  private readonly any: Array<ComponentType<any>> = [];
  private readonly none: Array<ComponentType<any>> = [];

  public containingAll(...components: Array<ComponentType<any>>): ComponentSetBuilder {
    this.all.push(...components);
    return this;
  }

  public containingAny(...components: Array<ComponentType<any>>): ComponentSetBuilder {
    this.any.push(...components);
    return this;
  }

  public containingNone(...components: Array<ComponentType<any>>): ComponentSetBuilder {
    this.none.push(...components);
    return this;
  }

  public build(capacity: number, resolveComponentId: (component: ComponentType<any>) => number): ComponentSet {
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
    return new ComponentSet(allVector, anyVector, noneVector);
  }
}
