import { Command } from "commander";

(async () => {
  const program = new Command();
  program
    .name("symphonic-cli")
    .description("Orchestration for your development environment.")
    .version('0.0.1')
    .command('start', 'start the environment')
    .command('destroy', 'destroy the environment')
    .command('status', 'show the current status of all components');

  program.parse(process.argv);

})();
