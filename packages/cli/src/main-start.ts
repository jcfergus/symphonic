import { Command } from "commander";
import * as log from 'signale';
import { applyCommonOptions } from "./cli-utils";
import Symphonic from "@symphonic/core";

import debug from 'debug';

const dbg = debug("symphonic:cli:start");

(async () => {
  dbg("In main-start");
  let program = new Command();
  program
    .name("symphonic-cli-start")
    .description("Start your symphonic environment.")
    .version('0.0.1')

  program = applyCommonOptions(program);
  program.parse(process.argv);

  try {
    log.pending(`Reading configuration from: ${program.opts().configFile}`);

    const app = new Symphonic({ configurationFile: program.opts().configFile });

    log.success(`Parsed configuration from ${program.opts().configFile}`);
    log.pending(`Starting symphonic application.`);

    await app.start();

  } catch (e) {
    log.error("Error initialising Symphonic: ", e);
  }
})();
