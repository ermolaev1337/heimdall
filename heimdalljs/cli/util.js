const got = require("got");
const {merklePoseidon} = require("../src/crypto/poseidon");
const fs = require("fs/promises");
const path = require("path");
const {stringifyBigInts} = require("../src/util");
const { exec, execSync} = require("child_process");
require('dotenv').config()
const MAX_POLYGON_SIZE = 50;

const getSecretKey = async (secretKeyPath) => {
    try {
        let secretKey;
        if (typeof secretKeyPath !== "undefined") {
            secretKey = await fs.readFile(secretKeyPath, "utf8");
            secretKey = secretKey.split("\n")[0];
        }
        return Promise.resolve(secretKey);
    } catch (err) {
        return Promise.reject(err);
    }
};

const parsePolygon = (polygon) => {
    let vertx = new Array(MAX_POLYGON_SIZE).fill(Math.floor(polygon[polygon.length - 1][0] * (10 ** 7)));
    let verty = new Array(MAX_POLYGON_SIZE).fill(Math.floor(polygon[polygon.length - 1][1] * (10 ** 7)));
    for (let i = 0; i < polygon.length; i++) {
        vertx[i] = Math.floor(polygon[i][0] * (10 ** 7));
        verty[i] = Math.floor(polygon[i][1] * (10 ** 7));
    }
    return {vertx: vertx, verty: verty};
};

const getRevocationRoot = async (source) => {
    let response = await got(source + "/revocation_root.json").catch(err => {return Promise.reject(err);});
    return Promise.resolve(JSON.parse(response.body));
};

const getRevocationTree = async (treeName, source) => {
    try {
        console.log("Treename:", treeName);
        console.log(source);
        let registryObject;
        if (typeof treeName !== "undefined") {
            registryObject = await fs.readFile(treeName, "utf8");
            console.log("Tree");
            registryObject = JSON.parse(registryObject);
        } else {
            let response = await got(source + "/revocation_registry.json");
            registryObject = JSON.parse(response.body);
        }
        let revocationTree = merklePoseidon([], registryObject.tree);
        return Promise.resolve(revocationTree);
    } catch(err) {
        return Promise.reject(err);
    }
};

const pushGitRevocation = (destination) => {
    let reg = path.join(destination, "revocation_registry.json");
    let roo = path.join(destination, "revocation_root.json");
    let sig = path.join(destination, "revocation_signature.json");
    exec(`git pull && git add ${reg} ${roo} ${sig} && git commit -m "creating revocation registry" && git push`,
        (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
    });
};

function pushRevocationGitHttps(destination) {
    let reg = path.join(destination, "revocation_registry.json");
    let roo = path.join(destination, "revocation_root.json");
    //let sig = path.join(destination, "revocation_signature.json");
    
    // Define authentication 
    const repoUrl = 'https://github.com/ivabe/heimdall.git';
    const username = 'ivabe';
    const token = process.env.GITHUB_TOKEN;
    const remote_name = "revoc_remote";
    const branch = "revoc_tree";
    
    exec(`git config --global user.email \"heimdalljs@heimdall.agent\" && git config --global user.name \"heimdalljs\"`);

    // Set the credentials in the git url
    const authenticatedRepoUrl = repoUrl.replace('https://', `https://${username}:${token}@`);
    exec(`git remote add ${remote_name} ${authenticatedRepoUrl}`);
    execSync(`git checkout ${branch}`, (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
    });

    exec("git add " +  `${reg} ${roo}` + " && git commit -m 'creating revocation registry'"
        + ` && git push -u ${remote_name} ${branch}`, (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
    });
}

const writeFilesRevocation = async (reg, destination) => {
    reg.tree.leaves = stringifyBigInts(reg.tree.leaves);
    reg.tree.data = stringifyBigInts(reg.tree.data);
    if(typeof reg.signature !== "undefined") {
        reg.signature = stringifyBigInts(reg.signature);
        await fs.writeFile(path.join(destination, "revocation_signature.json"), JSON.stringify(reg.signature))
            .catch(console.log);
    }
    await fs.writeFile(path.join(destination, "revocation_registry.json"), JSON.stringify(reg)).catch(console.log);
    await fs.writeFile(path.join(destination, "revocation_root.json"), JSON.stringify(reg.tree.root))
        .catch(console.log);

    return Promise.resolve(true);
};

module.exports = {parsePolygon, getRevocationTree, getSecretKey, writeFilesRevocation, pushGitRevocation, pushRevocationGitHttps,
    getRevocationRoot};