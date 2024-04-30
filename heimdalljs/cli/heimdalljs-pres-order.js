#!/usr/bin/env node
const {program} = require("commander");
const fs = require("fs/promises");
const {poseidonHash} = require("../src/crypto/poseidon.js");
const {OrderPresentation} = require("../src/presentation/order.js");
const {stringifyBigInts} = require("../src/util.js");
const {getSecretKey, getRevocationTree} = require("./util.js");
const {merklePoseidon} = require("../src/crypto/poseidon.js");
const {signPoseidon} = require("../circomlib/eddsa.js");

program.arguments("<index>")
    .option("-d, --destination <Path>", "Path for storing the revocation file",
        "./order_pres.json")
    .option("--credential <Path>", "Path to the credential", "./credential.json")
    .option("-e, --expiration <Number>", "Expiration time in days")
    .option("-c, --challenge <Number>", "Challenge from the verifier")
    .option("-s, --secretKey <Number>", "Secret key of the holder")
    .option("-i, --issuerPK", "Show public key of issuer");

const generatePresentationAttribute = async (index, options) => {
    try {
        let credential = JSON.parse(await fs.readFile(options.credential, "utf8"));

        let expiration = new Date().getTime() + options.expiration * 864e5;

        if (expiration > Number(credential.attributes[5]))
            return Promise.reject("Expiration of the presentation cannot be after the credentials");
        let secretKey = await getSecretKey(options.secretKey);
        let presentation = new OrderPresentation(
            credential,
            expiration,
            "",
            options.challenge,
            secretKey,
            options.issuerPK,
            signPoseidon,
            merklePoseidon,
            Number(index)
        );
        await presentation.generate();
        console.log("Order VC Proof END\n\n");
        return Promise.resolve(presentation);
    } catch (err) {
        return Promise.reject(err);
    }
};

program.action((index, options) => {
    generatePresentationAttribute(index, options).then(res => {
        fs.writeFile(options.destination, JSON.stringify(stringifyBigInts(res)))
            .then(() => {process.exit();})
            .catch(console.log);
    }).catch(console.log);
});

program.parse(process.argv);