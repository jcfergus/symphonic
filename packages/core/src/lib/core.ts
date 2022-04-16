import SymphonicConfiguration from './configuration';
import * as fs from 'fs';

import * as log from 'signale';

import debug from 'debug';
import { DepGraph } from 'dependency-graph';
import ResourceConfiguration from './resourceConfiguration';

const dbg = debug('symphonic:core:app');

export default class Symphonic {
  public configuration: SymphonicConfiguration;
  public dependencies: DepGraph<ResourceConfiguration>;

  constructor({
    configurationFile,
    configurationData,
    configuration,
  }: {
    configurationFile?: string;
    configurationData?: string | Buffer;
    configuration?: SymphonicConfiguration;
  }) {
    let configData;
    if (configurationFile) {
      configData = fs.readFileSync(configurationFile, 'utf-8');
      dbg(`Loaded config data from ${configurationFile}`);
    }

    if (configurationData) {
      configData = configurationData.toString();
    }

    if (configuration) {
      this.configuration = configuration;
    } else {
      this.configuration = new SymphonicConfiguration(configData);
      dbg(`Parsed config file.`);
    }

    this.calculateDependencies();
  }

  public calculateDependencies() {
    dbg('calculateDependencies()');
    this.dependencies = new DepGraph<ResourceConfiguration>();

    // Create nodes.
    this.configuration.resources.forEach((resource) => {
      this.dependencies.addNode(resource.name, resource);
    });

    // Add dependencies.
    this.configuration.resources.forEach((resource) => {
      resource.needs?.forEach((dependency: string) => {
        dbg(resource.name, ' => ', dependency);
        this.dependencies.addDependency(resource.name, dependency);
      });
    });
  }

  public start = async () => {
    dbg(`start()`);
    const order = this.dependencies.overallOrder();

    dbg(`Start order: ${JSON.stringify(order)}`);

    await this.createResources(order);

    log.success(`Starting resources.`);

  };

  private startResources = async (resourceNames: Array<string>) => {
    log.pending(`Starting all resources.`);

    for ( let i = 0; i < resourceNames.length; i++ ) {
      const resourceConfiguration = this.configuration.getResourceByName(resourceNames[i]);

      if (typeof resourceConfiguration.run === "function") {
        dbg(`Starting resource ${resourceNames[i]}.`);
        if (resourceConfiguration) {

        }
      } else {
        dbg(`No "run" action defined for resource ${resourceNames[i]}`);
      }
    }

    log.success("Started all resources.");
  }

  private createResources = async (resourceNames: Array<string>) => {
    log.pending(`Creating resources.`);

    for ( let i = 0; i < resourceNames.length; i++ ) {
      // Find the actual object for this node.
      const resourceConfiguration = this.configuration.getResourceByName(resourceNames[i]);

      if (typeof resourceConfiguration.create === "function") {
        dbg(`Creating resource ${resourceNames[i]}.`);
        let createResult = await resourceConfiguration.create();

        if (!createResult.ready) {
          dbg(`Create failed for resource ${resourceNames[i]}.`);
          return;
        }
        log.success(`Resource ${resourceNames[i]} is ready.`)
      } else {
        dbg(`No create step defined for resource ${resourceNames[i]}`);
      }
    }

    log.success(`All resources created.`);
  }
}
