import GeneralConfiguration from "../generalConfiguration";
import ResourceStatus from "../utilities/resourceStatus";
import ResourceConfiguration from "../resourceConfiguration";

export default abstract class BaseResource {
  public name: string;
  public description?: string;
  public prettifier?: string;
  public needs?: Array<string>;

  public dependencies: Array<ResourceConfiguration> = [];

  public generalConfiguration!: GeneralConfiguration;

  private _created: boolean;
  private _ready: boolean;
  private _running: boolean;
  private _destroyed: boolean;

  constructor() {}

  get objectName(): string {
    if (this.generalConfiguration.namespace) {
      return `${this.generalConfiguration.namespace}_${this.name}`
    }
    return this.name;
  }

  get status(): ResourceStatus {
    return new ResourceStatus({
      created: this._created,
      ready: this._ready,
      running: this._running,
      destroyed: this._destroyed,
    });
  }

  set created(isCreated: boolean) {
    this._created = isCreated;
  }

  set ready(isReady: boolean) {
    this._ready = isReady;
  }

  set running(isRunning: boolean) {
    this._running = isRunning;
  }

  set destroyed(isDestroyed: boolean) {
    this._destroyed = isDestroyed;
  }

  set configuration(configuration: GeneralConfiguration) {
    this.generalConfiguration = configuration;
  }

  /**
   * These base functions don't do anything but set the lifecycle to the correct state,
   * so that if an extended resource doesn't implement a particular function the state
   * will be updated correctly regardless.
   */
  public create = async (): Promise<ResourceStatus> => {
    this._ready = true;
    return this.status;
  };

  public run = async (): Promise<ResourceStatus> => {
    this._running = true;
    return this.status;
  }

  public restart = async(): Promise<ResourceStatus> => {
    return this.status;
  }

  public stop = async (): Promise<ResourceStatus> => {
    this._running = false;
    return this.status;
  }

  public destroy = async (): Promise<ResourceStatus> => {
    this._destroyed = true;
    return this.status;
  }
}
