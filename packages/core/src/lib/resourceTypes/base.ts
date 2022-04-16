import GeneralConfiguration from "../generalConfiguration";
import ResourceStatus from "../utilities/resourceStatus";

export default abstract class BaseResource {
  public name: string;
  public description?: string;
  public prettifier?: string;
  public needs?: Array<string>;

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
    return {
      created: this._created,
      ready: this._ready,
      running: this._running,
      destroyed: this._destroyed,
    }
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

  public create = async (): Promise<ResourceStatus> => {
    this._ready = true;
    return this.status;
  };

  public run?: () => Promise<ResourceStatus>;
  public restart?: () => Promise<ResourceStatus>;
  public stop?: () => Promise<ResourceStatus>;
  public destroy?: () => Promise<ResourceStatus>;
}
