export default class DockerConfiguration {
  socketPath?: string;
  host?: string;
  port?: string;
  protocol?: "ssh" | "http" | "https";
  ca?: string | Buffer;
  cert?: string | Buffer;
  key?: string | Buffer;
}
