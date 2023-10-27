#!/usr/bin/env node
const {program} = require("commander");
const fs = require("fs/promises");
const {RevocationRegistry} = require("../src/revocation.js");
const {merklePoseidon} = require("../src/crypto/poseidon.js");
const {signPoseidon} = require("../circomlib/eddsa.js");
const path = require("path");
const {writeFilesRevocation, pushGitRevocation, pushRevocationGitHttps, initTree, updateTree} = require("./util");


program.arguments("<index>")
    .option("-s, --secretKey <Path>", "Path to the secret key of the issuer")
    .option("-d, --destination <Path>", "Path for storing the revocation file",
        "/test-revoc/")
    .option("-g, --git", "Commits and pushes to git (if inside of a repro)");

const updateRegistry = async (index, options) => {
    try {
        initTree();
        let sk;
        if (typeof options.secretKey !== "undefined")
            sk = await fs.readFile(options.secretKey, "utf8");
        const treePath = path.join(options.destination, "revocation_registry.json");
        let registry = await fs.readFile(treePath, "utf8");
        let r = new RevocationRegistry(
            sk,
            merklePoseidon,
            (s, m) => signPoseidon(s, BigInt(m)),
            JSON.parse(registry).tree
        );
        r.update(index);
        return Promise.resolve(r);
    } catch (err) {
        return Promise.reject(err);
    }
};

program.action((index, options) => {
    updateRegistry(index, options).then(res => {
        writeFilesRevocation(res, options.destination).then(res => {
            if (options.git) {
                updateTree();
            }
        });
    }).catch(console.log);
});

program.parse(process.argv);

