import BaseResource from "./base";

import debug from 'debug';
import ResourceStatus from "../utilities/resourceStatus";
const log = debug("symphonic:core:resources:docker:run");

export default class DockerRunResource extends BaseResource {
  public static readonly type: 'dockerRun' = 'dockerRun';
  public type: 'dockerRun' = DockerRunResource.type;

  public containerName: string;

  public run = async (): Promise<ResourceStatus> => {
    log("Starting docker run resource.");

    return;
  }
};
