import * as Docker from "dockerode";

import BaseResource from "./base";
import DockerConfiguration from "../dockerConfiguration";
import GeneralConfiguration from "../generalConfiguration";

import debug from 'debug';

const log = debug("symphonic:core:resources:docker:base");

export default abstract class DockerBaseResource extends BaseResource {
  public dockerConfiguration: DockerConfiguration;

  private _dockerConnection: Docker;

  set configuration(configuration: GeneralConfiguration) {
    this.dockerConfiguration = configuration.dockerConfiguration;
    this.generalConfiguration = configuration;
  }

  get dockerConnection() {
    if (!this._dockerConnection) {
      this._dockerConnection = new Docker(this.dockerConfiguration);
    }
    return this._dockerConnection;
  }

}
