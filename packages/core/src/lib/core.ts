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

    // Add dependencies to the dependency tree.
    this.configuration.resources.forEach((resource) => {
      resource.needs?.forEach((dependency: string) => {
        this.dependencies.addDependency(resource.name, dependency);
        // Also attach the resource objects to their parent for easy access.  (Currently specifically
        // for aggregate resource, but may be useful elsewhere too.)
        resource.dependencies.push(this.configuration.getResourceByName(dependency));
      });
    });
  }

  public start = async () => {
    dbg(`start()`);
    const order = this.dependencies.overallOrder();

    dbg(`Start order: ${JSON.stringify(order)}`);
    await this.createResources(order);

    log.pending(`Starting resources.`);
    await this.startResources(order);

  };

  public destroy = async () => {
    dbg(`destroy()`);

    // We want to destroy in reverse order of create.
    const order = this.dependencies.overallOrder().reverse();

    dbg(`Destroy order: ${JSON.stringify(order)}`);

    await this.destroyResources(order);

    log.success(`Destroyed resources.`);
  }

  private startResources = async (resourceNames: Array<string>) => {
    log.pending(`Starting all resources.`);

    for ( const resourceName of resourceNames ) {
      const resourceConfiguration = this.configuration.getResourceByName(resourceName);

      dbg(`Starting resource ${resourceName}.`);
      dbg(`Needs: ${resourceConfiguration.needs?.join(",")}`)

      if (resourceConfiguration.needs?.length > 0) {
        for (const dependency of resourceConfiguration.dependencies) {

          dbg(`Dependency status: ${JSON.stringify(dependency.status)}`);

          if (!dependency.status.running) {
            log.warn(`Expected ${resourceName} to be running but it isn't.`) // XXX
          }
        }
      }

      await resourceConfiguration.run();
    }

    log.success("Started all resources.");
  }

  private destroyResources = async (resourceNames: Array<string>) => {
    log.pending(`Destroying resources.`);

    for (const resourceName of resourceNames ) {
      const resourceConfiguration = this.configuration.getResourceByName(resourceName);

      if (typeof resourceConfiguration.destroy === "function") {
        dbg(`Destroying resource ${resourceName}.`);

        let destroyResult = await resourceConfiguration.destroy();
      }
    }
  }

  private createResources = async (resourceNames: Array<string>) => {
    log.pending(`Creating resources.`);

    for ( const resourceName of resourceNames ) {
      // Find the actual object for this node.
      const resourceConfiguration = this.configuration.getResourceByName(resourceName);

      if (typeof resourceConfiguration.create === "function") {
        dbg(`Creating resource ${resourceName}.`);
        let createResult = await resourceConfiguration.create();

        if (!createResult.ready) {
          dbg(`Create failed for resource ${resourceName}.`);
          return;
        }
        log.success(`Resource ${resourceName} is ready.`)
      } else {
        dbg(`No create step defined for resource ${resourceName}`);
      }
    }

    log.success(`All resources created.`);
  }
}
