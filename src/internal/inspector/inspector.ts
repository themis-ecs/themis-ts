import { System } from '../../public/system';
import { ComponentAddEvent, ComponentRemoveEvent, EntityCreateEvent, EntityDeleteEvent } from '../../public/event';
import { Component, ComponentType } from '../../public/component';

export class ThemisInspector extends System {
  private container: HTMLElement;
  private table!: HTMLTableElement;
  private tableHeadRow!: HTMLTableRowElement;
  private componentIdToColumnMap: { [componentId: number]: number } = {};
  private entityIdToRowMap: { [entityId: number]: number } = {};

  constructor(container: HTMLElement) {
    super();
    this.container = container;
  }

  registerListeners() {
    this.table = document.createElement('table');
    this.tableHeadRow = this.table.createTHead().insertRow();
    this.container.appendChild(this.table);

    this.getWorld().registerListener(EntityCreateEvent, (event) => {
      this.onEntityCreate(event.getEntityId());
    });
    this.getWorld().registerListener(EntityDeleteEvent, (event) => {
      this.onEntityDelete(event.getEntityId());
    });
    this.getWorld().registerListener(ComponentAddEvent, (event) => {
      this.onComponentAdd(event.getEntityId(), event.getComponentType(), event.getComponentId(), event.getComponent());
    });
    this.getWorld().registerListener(ComponentRemoveEvent, (event) => {
      this.onComponentRemove(event.getComponentId(), event.getComponentType(), event.getComponentId());
    });
  }

  onInit(): void {}

  onEntityCreate(entityId: number): void {
    if (this.entityIdToRowMap[entityId] === undefined) {
      const row = this.table.insertRow();
      this.entityIdToRowMap[entityId] = row.rowIndex;
    }
  }

  onEntityDelete(entityId: number): void {}

  onComponentAdd(entityId: number, componentType: ComponentType<any>, componentId: number, component: Component) {
    if (this.componentIdToColumnMap[componentId] === undefined) {
      const cell = this.tableHeadRow.insertCell();
      this.componentIdToColumnMap[componentId] = cell.cellIndex;
      cell.appendChild(document.createTextNode(componentType.name));
    }
    const row = this.table.rows.item(this.entityIdToRowMap[entityId]);
    const cell = row!.cells.item(this.componentIdToColumnMap[componentId]);
    cell!.textContent = 'x';
  }

  onComponentRemove(entityId: number, componentType: ComponentType<any>, componentId: number) {}

  onUpdate(dt: number): void {}
}
