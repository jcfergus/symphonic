import 'reflect-metadata';
import * as YAML from 'yaml';

import { plainToClassFromExist, Type } from 'class-transformer';
import { DepGraph } from 'dependency-graph';

import GeneralConfiguration from './generalConfiguration';
import EnvironmentConfiguration from './environmentConfiguration';
import ResourceConfiguration, { resourceSubTypeDiscriminator } from "./resourceConfiguration";
import BaseResource from './resourceTypes/base';
import AggregateResource from './resourceTypes/aggregate';
import DockerNetworkResource from './resourceTypes/dockerNetwork';
import DockerRunResource from './resourceTypes/dockerRun';
import NpmScriptResource from './resourceTypes/npmScript';
import ShellCommandResource from './resourceTypes/shellCommand';
import DockerVolumeResource from './resourceTypes/dockerVolume';
import NodemonResource from './resourceTypes/nodemon';
import debug from 'debug';

const log = debug("symphonic:core:configuration");

export class SymphonicConfiguration {
  @Type(() => GeneralConfiguration)
  general: GeneralConfiguration;

  dependencies?: DepGraph<BaseResource>;
  parsedConfig?: any;

  prettifiers: Map<string, string>;

  @Type(() => EnvironmentConfiguration)
  environments: Map<string, EnvironmentConfiguration>;

  @Type(() => BaseResource, {
    keepDiscriminatorProperty: true,
    discriminator: {
      property: "type",
      subTypes: resourceSubTypeDiscriminator
    }
  })
  resources: Array<ResourceConfiguration>;

  constructor(configData: string) {
    log("constructor()")
    try {
      this.parsedConfig = YAML.parse(configData);
      return plainToClassFromExist(this, this.parsedConfig);
    } catch (e) {
      console.log('Failed to parse configuration file.', e);
    }

    this.addConfigurationToNodes();
  }

  public addConfigurationToNodes() {
    log("addConfigurationToNodes()");

    this.resources.forEach((resource) => {
      resource.configuration = this.general;
    })
  }

  public getResourceByName(resourceName: string) {
    return this.resources.find((n) => n.name === resourceName);
  }
}

export default SymphonicConfiguration;
