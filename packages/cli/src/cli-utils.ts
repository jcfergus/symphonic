import { Command } from "commander";

const applyCommonOptions = (program: Command) => {
  return program
    .option('-f, --config-file <configFile>', 'specify the path to the config file', 'symphonic.yml')
    .option('-I, --no-interactive', 'don\'t run in interactive mode', false)
}

export { applyCommonOptions };
