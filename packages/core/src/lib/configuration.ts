import 'reflect-metadata';
import * as YAML from 'yaml';

import { plainToClassFromExist, Type } from 'class-transformer';
import { DepGraph } from 'dependency-graph';

import GeneralConfiguration from './generalConfiguration';
import EnvironmentConfiguration from './environmentConfiguration';
import ResourceConfiguration, { resourceSubTypeDiscriminator } from "./resourceConfiguration";
import BaseResource from './resourceTypes/base';
import debug from 'debug';

const dbg = debug("symphonic:core:configuration");

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
    dbg("constructor()")
    try {
      this.parsedConfig = YAML.parse(configData);
      plainToClassFromExist(this, this.parsedConfig);
    } catch (e) {
      console.log('Failed to parse configuration file.', e);
    }

    this.addConfigurationToNodes();

    return this;
  }

  public addConfigurationToNodes() {
    dbg("addConfigurationToNodes()");

    for (const resource of this.resources) {
      dbg(`Adding configuration to ${resource.name}`);
      resource.configuration = this.general;
    }
  }

  public getResourceByName(resourceName: string) {
    return this.resources.find((n) => n.name === resourceName);
  }
}

export default SymphonicConfiguration;
