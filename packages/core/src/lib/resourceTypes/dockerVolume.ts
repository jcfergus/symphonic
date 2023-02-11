import debug from 'debug';
import DockerBaseResource from './dockerBase';

const dbg = debug('symphonic:core:resources:docker:volume');

export default class DockerVolumeResource extends DockerBaseResource {
  public static readonly type: 'dockerVolume' = 'dockerVolume';
  public type: 'dockerVolume' = DockerVolumeResource.type;

  public volumeName: string;
  public failIfExists = false;

  get objectName(): string {
    if (this.generalConfiguration.namespace) {
      return `${this.generalConfiguration.namespace}_${this.volumeName}`;
    }
    return this.volumeName;
  }

  public create = async (): Promise<void> => {
    const exists = await this.checkIfVolumeExists();

    if (exists && this.failIfExists) {
      this.created = false;
      this.setAndEmitError(new Error(
        `Docker volume ${this.objectName} already exists and 'failIfExists' is set.`
      ));
    }

    if (!exists) {
      this.created = await this.createVolume();
    } else {
      this.created = false;
      dbg(`Volume ${this.objectName} already exists - using existing volume.`);
    }
  };

  public destroy = async (): Promise<void> => {
    dbg(`Destroying docker volume resource ${this.objectName}.`);
    (await this.checkIfVolumeExists()) && (await this.deleteVolume());
    this.emit("destroyed", this.status);
  };

  /**
   * Checks to see if the volume specified in this resource already exists.
   */
  public checkIfVolumeExists = async (): Promise<boolean> => {
    try {
      const volume = await this.dockerConnection.getVolume(this.objectName);
      const volumeData = await volume.inspect();
      return !!volumeData?.Name;
    } catch (e) {
      dbg("Volume doesn't exist");
      return false;
    }
  };

  /**
   * Creates the volume specified in this resource.
   */
  public createVolume = async (): Promise<boolean> => {
    try {
      await this.dockerConnection.createVolume({ Name: this.objectName });
      const volume = await this.dockerConnection.getVolume(this.objectName);
      const volumeDetail = await volume.inspect();
      dbg(`Created volume: ${JSON.stringify(volumeDetail)}`);
      return !!volumeDetail?.Name;
    } catch (e) {
      dbg(`Error creating volume: ${e.toString()}`);
    }
    return false;
  };

  /**
   * Deletes the volume specified in this resource.
   */
  public deleteVolume = async (): Promise<boolean> => {
    try {
      const result = await this.dockerConnection.getVolume(this.objectName);
      result.remove();
      return true;
    } catch (e) {
      dbg(`Error deleting network: ${e.toString()}`);
      return false;
    }
  };
}
