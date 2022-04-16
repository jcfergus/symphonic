export default class DockerConfiguration {
  socketPath?: string;
  host?: string;
  port?: string;
  protocol?: string;
  ca?: string | Buffer;
  cert?: string | Buffer;
  key?: string | Buffer;
}
