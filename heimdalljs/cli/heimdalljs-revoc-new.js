#!/usr/bin/env node
const {program} = require("commander");
const fs = require("fs/promises");
const {RevocationRegistry} = require("../src/revocation.js");
const {merklePoseidon} = require("../src/crypto/poseidon.js");
const {signPoseidon} = require("../circomlib/eddsa.js");
const {writeFilesRevocation, } = require("./util");

program.option("-s, --secretKey <Path>", "Path to the secret key of the issuer")
    .option("-d, --destination <Path>", "Path for storing the revocation files",
        "./")
    .option("-g, --git <Token>", "Commits and pushes to git (if inside of a repro)");

program.action((options) => {
    createNewRegistry(options).then(res => {
        writeFilesRevocation(res, options.destination).then(res => {
            if (options.git) {
                //TODO: implement initiation of a new tree in the repo?
            }
        });
    }).catch(console.log);
});

program.parse(process.argv);

async function createNewRegistry(options) {
    try {
        let sk;
        if (typeof options.secretKey !== "undefined")
                sk = await fs.readFile(options.secretKey, "utf8");
        let r = new RevocationRegistry(sk, merklePoseidon, (sk, msg) => signPoseidon(sk, BigInt(msg)));
        return Promise.resolve(r);
    } catch (err) {
        return Promise.reject(err);
    }
}
