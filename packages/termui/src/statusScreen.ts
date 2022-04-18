import { ScreenBuffer } from 'terminal-kit';
import { ResourceStatus } from '@symphonic/core';

export default class SymphonicTermUiStatusScreen {
  private _buffer: ScreenBuffer;
  private _parent: ScreenBuffer;
  private _statuses: Record<string, ResourceStatus>;

  constructor(
    parent: ScreenBuffer,
    resourceStatuses: Record<string, ResourceStatus>
  ) {
    this._parent = parent;

    this._statuses = resourceStatuses;

    this._buffer = new ScreenBuffer({
      dst: this._parent,
      height: this._parent.height - 1,
      x: 0,
      y: 0,
    });
  }

  public render = () => {
    this._buffer.clear();

    const totalResources = Object.keys(this._statuses)?.length;

    if (totalResources < 1) {
      this._buffer.put({ x: 2, y: 6, wrap: false }, 'No Resources Configured')
        .blueBright;
      this._buffer.draw({ delta: true });
      return;
    } else {
      const counter = 0;
      const rowsOfResources = this._buffer.height - 5;
      const columnsOfResources = Math.ceil(totalResources / rowsOfResources);
      const columnWidth = Math.floor(
        (this._buffer.width - 4) / columnsOfResources
      );

      for (const resource in this._statuses) {
        this._buffer.put({
          x: 2 + columnWidth * Math.floor(counter / rowsOfResources),
          y: 4 + (counter % rowsOfResources),
        },
        "^b^+%s^-: %s", resource, this._statuses[resource]);
      }

      this._buffer.draw();
    }
  };
}
