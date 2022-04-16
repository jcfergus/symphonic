import debug from 'debug';
import ResourceStatus from '../utilities/resourceStatus';
import DockerBaseResource from './dockerBase';

const dbg = debug('symphonic:core:resources:docker:volume');

export default class DockerVolumeResource extends DockerBaseResource {
  public static readonly type: 'dockerVolume' = 'dockerVolume';
  public type: 'dockerVolume' = DockerVolumeResource.type;

  public volumeName: string;
  public failIfExists = false;

  public create = async (): Promise<ResourceStatus> => {
    const exists = await this.checkIfVolumeExists();

    if (exists && this.failIfExists) {
      this.created = false;
      this.ready = false;
      throw new Error(
        `Docker volume ${this.volumeName} already exists and 'failIfExists' is set.`
      );
    }

    if (!exists) {
      this.created = await this.createVolume();
      this.ready = true;
    } else {
      this.created = false;
      this.ready = true;
      dbg(`Volume ${this.volumeName} already exists - using existing volume.`);
    }

    return this.status;
  };

  public destroy = async (): Promise<ResourceStatus> => {
    dbg(`Destroying docker volume resource ${this.volumeName}.`);
    (await this.checkIfVolumeExists()) && (await this.deleteVolume());

    return { destroyed: true }; // We're assuming if it doesn't exist, it's destroyed.
  };

  /**
   * Checks to see if the volume specified in this resource already exists.
   */
  public checkIfVolumeExists = async (): Promise<boolean> => {
    try {
      const volume = await this.dockerConnection.getVolume(this.volumeName);
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
      await this.dockerConnection.createVolume({ name: this.volumeName });
      const volume = await this.dockerConnection.getVolume(this.volumeName);
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
      const result = await this.dockerConnection.getVolume(this.volumeName);
      result.remove();
      return true;
    } catch (e) {
      dbg(`Error deleting network: ${e.toString()}`);
      return false;
    }
  };
}
