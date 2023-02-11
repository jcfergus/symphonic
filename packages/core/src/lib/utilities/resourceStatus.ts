
export enum ResourceState {
  NEW,
  CREATED,
  RUNNING,
  STOPPED,
  DESTROYED
}

export default class ResourceStatus {
  state: ResourceState;

  created?: boolean;
  ready?: boolean;
  running?: boolean;
  destroyed?: boolean;

  error?: Error | undefined;

  constructor(data: Partial<ResourceStatus>) {
    Object.assign(this, data);
  }

  get statusText() {
    if (this.error) { return 'ERROR' }
    if (this.destroyed) { return 'DESTROYED' }
    if (this.running) { return 'RUNNING' }
    if (this.ready) { return 'READY' }
    if (this.created) { return 'CREATED' }
  }
}
