import DockerBaseResource from "./dockerBase";

import debug from 'debug';
import ResourceStatus from "../utilities/resourceStatus";

const dbg = debug("symphonic:core:resources:docker:network");

export default class DockerNetworkResource extends DockerBaseResource {
  public static readonly type: 'dockerNetwork' = 'dockerNetwork';
  public type: 'dockerNetwork' = DockerNetworkResource.type;

  public networkName: string;
  public failIfExists: boolean;

  get objectName(): string {
    if (this.generalConfiguration.namespace) {
      return `${this.generalConfiguration.namespace}_${this.networkName}`;
    }
    return this.networkName;
  }

  public create = async (): Promise<ResourceStatus> => {
    const exists = await this.checkIfNetworkExists();

    if (exists && this.failIfExists) {
      this.created = false;
      this.ready = false;
      throw new Error(
        `Docker network ${this.objectName} already exists and 'failIfExists' is set.`
      );
    }

    if (!exists) {
      this.created = await this.createNetwork();
      this.ready = true;
    } else {
      dbg(`Network ${this.objectName} already exists - using existing network.`);
      this.created = false;
      this.ready = true;
    }

    return this.status;
  }

  public checkIfNetworkExists = async (): Promise<boolean> => {
    try {
      const network = await this.dockerConnection.getNetwork(this.networkName);
      const networkData = await network.inspect();
      return !!networkData?.Name;
    } catch (e) {
      dbg("Network doesn't exist.");
      return false;
    }
  }

  public createNetwork = async (): Promise<boolean> => {
    try {
      await this.dockerConnection.createNetwork({ name: this.networkName });
      const network = await this.dockerConnection.getNetwork(this.networkName);
      const networkDetail = await network.inspect();
      dbg(`Created network: ${JSON.stringify(networkDetail)}`);
      return !!networkDetail?.Name;
    } catch (e) {
      dbg(`Error creating network: ${e.toString()}`);
    }
    return false;
  }

  public deleteNetwork = async (): Promise<boolean> => {
    try {
      const result = await this.dockerConnection.getVolume(this.networkName);
      result.remove();
      return true;
    } catch (e) {
      dbg(`Error deleting network: ${e.toString()}`);
      return false;
    }
  }
}
