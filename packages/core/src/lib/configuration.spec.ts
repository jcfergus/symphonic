import { readFileSync } from 'fs';
import SymphonicConfiguration from "./configuration";

describe('configuration parser', () => {
  it('should correctly parse an example configuration', () => {
    const file = readFileSync(`${__dirname}/__fixtures__/fiveable.yml`);
    const config = new SymphonicConfiguration(file.toString());
    console.log(config);

    config.calculateDependencies();
    console.log(config.dependencies.entryNodes());
    expect(config).not.toBeNull();

  });
});
