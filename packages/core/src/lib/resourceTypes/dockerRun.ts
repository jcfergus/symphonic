import debug from 'debug';
import * as log from 'signale';
import { Container, EndpointsConfig, RestartPolicy } from "dockerode";

import DockerBaseResource from './dockerBase';
import DockerConfiguration from "../dockerConfiguration";
import SymphonicConfiguration from "../configuration";
import GeneralConfiguration from "../generalConfiguration";

const dbg = debug('symphonic:core:resources:docker:run');

export default class DockerRunResource extends DockerBaseResource {
  public static readonly type: 'dockerRun' = 'dockerRun';
  public type: 'dockerRun' = DockerRunResource.type;

  public containerName: string;
  public failIfExists: boolean;
  public image: string;
  public command: string[];
  public remove: boolean = false;
  public restartPolicy?: 'always' | 'unless-stopped' | 'on-failure';
  public networkDisabled: boolean = false;
  public hostname?: string;
  public networkMode?: 'bridge' | 'host' | 'none';
  public network?: string;
  public args?: string;
  public links: Array<string>;
  public volumes?: Array<string>;
  public env?: Array<string>;
  public ports?: Array<string>;

  get portBindings(): { [index: string]: Array<{ HostPort: string }> } {
    return Object.fromEntries(
      this.ports
        .map((p) => p.split(':'))
        .map((q) => [`${q[1]}/tcp`, [{ HostIp: '', HostPort: q[0] }]])
    );
  }

  get exposedPorts(): { [index: string]: {} } {
    return Object.fromEntries(
      this.ports.map((p) => p.split(':')).map((q) => [`${q[1]}/tcp`, {}])
    );
  }

  get objectName(): string {
    if (this.generalConfiguration.namespace) {
      return `${this.generalConfiguration.namespace}_${this.containerName}`;
    }

    return this.containerName;
  }

  constructor(resourceConfiguration?: Partial<DockerRunResource>,
              dockerConfiguration?: Partial<DockerConfiguration>,
              generalConfiguration?: Partial<GeneralConfiguration>) {
    super();
    Object.assign(this, resourceConfiguration);
    this.dockerConfiguration = dockerConfiguration;
    this.generalConfiguration = generalConfiguration;
  }


  public create = async (): Promise<void> => {
    const exists = await this.checkIfContainerExists();

    if (exists && this.failIfExists) {
      this.created = false;
      this.emit('error', new Error(
        `Docker container ${this.objectName} already exists and 'failIfExists' is set.`
      ));
    }

    if (!exists) {
      this.created = await this.createContainer();
      this.emit("created", this.status);
      this.emit("running", this.status);
    } else {
      dbg(
        `Container ${this.objectName} already exists - using existing container.`
      );
      this.created = false;
      this.emit("running", this.status);
    }
  };

  public start = async (): Promise<void> => {
    dbg('Starting docker run resource.');
    try {
      this.running = !!(await this.startContainer());
    } catch (e) {
      dbg(`Error starting docker run resource: ${e.toString()}`);
      this.emit('error', e);
    }

    if (this.running) {
      this.emit('running', this.status);
    }
  };

  public checkIfContainerExists = async (): Promise<boolean> => {
    try {
      const container = await this.dockerConnection.getContainer(
        this.objectName
      );
      const containerData = await container.inspect();
      return !!containerData?.Name;
    } catch (e) {
      dbg("Container doesn't exist.");
      return false;
    }
  };

  /**
   * Creates the container specified in this resource.
   */
  public createContainer = async (): Promise<boolean> => {
    try {
      const restartPolicy: RestartPolicy = this.restartPolicy
        ? { Name: this.restartPolicy }
        : undefined;

      const endpointsConfig: EndpointsConfig = {
        [this.network]: {}
      }

      const containerConfig = {
        name: this.objectName,
        Name: this.objectName,
        Image: this.image,
        AttachStdin: false,
        AttachStdout: false,
        AttachStderr: false,
        Tty: false,
        OpenStdin: false,
        StdinOnce: false,
        Env: this.env,
        Cmd: this.command,
        Hostname: this.hostname,
        NetworkDisabled: this.networkDisabled,
        NetworkMode: this.network || this.networkMode,
        ExposedPorts: this.exposedPorts,
        HostConfig: {
          RestartPolicy: restartPolicy,
          AutoRemove: this.remove,
          Binds: this.volumes,
          Links: this.links,
          PortBindings: this.portBindings,
        },
        NetworkingConfig: {
          EndpointsConfig: endpointsConfig
        },
      };

      dbg(`Container config: ${JSON.stringify(containerConfig)}`);

      await this.dockerConnection.createContainer(containerConfig);
      const container: Container = await this.dockerConnection.getContainer(
        this.objectName
      );
      const containerDetail = await container.inspect();
      dbg(`Created container: ${JSON.stringify(containerDetail)}`);
      return !!containerDetail?.Name;
    } catch (e) {
      log.error(`Error creating container: ${e.toString()}`);
    }
    return false;
  };

  public startContainer = async (): Promise<boolean> => {
    try {
      dbg(`Starting container ${this.name}.`);
      const container = await this.dockerConnection.getContainer(
        this.objectName
      );
      const containerDetail = await container.inspect();
      if (containerDetail.State?.Status === 'running') {
        log.warn(`Container ${this.name} is already running.`);
      } else {
        container.attach({stream: true, stdout: true, stderr: true}, (err, stream) => {
          // Split the duplex logstream into distinct WritableStreams for stdout and
          // stderr.
          container.modem.demuxStream(stream, this.stdout, this.stderr);

          // Now actually start the container.
          container.start({}, (err, data) => {
            return true;
          });
        })
      }
    } catch (e) {
      dbg(`Failed to start container ${this.name}: ${e.toString()}`);
      return false;
    }
  };
}
