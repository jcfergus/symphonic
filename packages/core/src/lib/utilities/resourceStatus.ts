
export default class ResourceStatus {

  created?: boolean;
  ready?: boolean;
  running?: boolean;
  destroyed?: boolean;

  exitCode?: number;
  error?: boolean;
  errorMessage?: string;

  constructor(data: Record<string, boolean>) {
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
