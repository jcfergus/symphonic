
export default class ResourceStatus {
  created?: boolean;
  ready?: boolean;
  running?: boolean;
  destroyed?: boolean;

  exitCode?: number;
  error?: boolean;
  errorMessage?: string;
}
