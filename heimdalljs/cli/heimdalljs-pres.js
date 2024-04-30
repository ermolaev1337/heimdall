#!/usr/bin/env node
const {program} = require("commander");

program.command("delegation", "Generate a delegation presentation")
    .command("attribute", "Generate a delegation presentation")
    .command("mult-attribute", "Generate a delegation presentation")
    .command("polygon", "Generate a polygon presentation")
    .command("range", "Generate a range presentation")
    .command("order", "Generate a selective disclosure presentation");

program.action(() => {
    program.help();
});

program.parse(process.argv);
