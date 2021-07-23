import { System } from '../public/system';
import { ThemisWorld } from './world';
import { ComponentRegistry } from './component-registry';
// import { EntityRegistry } from './entity-registry';
// import { SystemRegistry } from './system-registry';
// import { EventRegistry } from './event-registry';

export class ThemisInspector extends System {
  private container: HTMLElement;
  private componentRegistry!: ComponentRegistry;
  private table!: HTMLTableElement;
  // private entityRegistry!: EntityRegistry;
  // private systemRegistry!: SystemRegistry;
  // private eventRegistry!: EventRegistry;

  constructor(container: HTMLElement) {
    super();
    this.container = container;
  }

  init(world: ThemisWorld) {
    this.componentRegistry = world.getComponentRegistry();
    // this.entityRegistry = world.getEntityRegistry();
    // this.systemRegistry = world.getSystemRegistry();
    // this.eventRegistry = world.getEventRegistry();
    super.init(world);
  }

  onInit(): void {
    this.table = document.createElement('table');
    this.container.appendChild(this.table);
  }

  onUpdate(dt: number): void {
    this.table.remove();
    this.table = document.createElement('table');
    this.table.style.border = '1px solid black';
    this.container.appendChild(this.table);
    this.updateTableHead();
    this.updateTableRows();
  }

  private updateTableHead() {
    const componentIdentityMap = this.componentRegistry.getComponentIdentityMap();
    const thead = this.table.createTHead();
    const row = thead.insertRow();
    const th = document.createElement('th');
    th.style.textAlign = 'center';
    th.style.border = '1px solid black';
    const text = document.createTextNode(`Entity ID`);
    th.appendChild(text);
    row.appendChild(th);
    componentIdentityMap.forEach((componentId, componentType) => {
      const th = document.createElement('th');
      th.style.textAlign = 'center';
      th.style.border = '1px solid black';
      const text = document.createTextNode(`[${componentId}]${componentType.name}`);
      th.appendChild(text);
      row.appendChild(th);
    });
  }

  private updateTableRows() {
    const entityCompositionMap = this.componentRegistry.getEntityCompositionMap();
    const componentIdentityMap = this.componentRegistry.getComponentIdentityMap();
    for (let entityId in entityCompositionMap) {
      const entityComposition = entityCompositionMap[entityId];
      const componentIds = entityComposition.getBits();
      const row = this.table.insertRow();
      const cell = row.insertCell();
      cell.style.textAlign = 'center';
      cell.style.border = '1px solid black';
      const text = document.createTextNode(`${entityId}`);
      cell.appendChild(text);
      componentIdentityMap.forEach((componentId) => {
        const cell = row.insertCell();
        cell.style.textAlign = 'center';
        cell.style.border = '1px solid black';
        const text = document.createTextNode(componentIds[componentId] === undefined ? '' : 'x');
        cell.appendChild(text);
      });
    }
  }
}
