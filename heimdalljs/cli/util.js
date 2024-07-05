const got = require("got");
const {merklePoseidon} = require("../src/crypto/poseidon");
const fs = require("fs/promises");
const path = require("path");
const {stringifyBigInts} = require("../src/util");
const {exec, execSync} = require("child_process");
const MAX_POLYGON_SIZE = 4; //50;

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

const getRevocationRoot = async (isLocalRoot = true, source = "/app/test-revoc/revocation_root.json") => {
    initRepo();
    let rootObject;
    if (isLocalRoot) {
        rootObject = await fs.readFile(source, "utf8");
        await fs.writeFile(`./revocation-root-${Math.floor(Math.random() * 100)}.json`, rootObject);
        rootObject = JSON.parse(rootObject);
    } else {
        const uri = source + "/revocation_root.json";
        let response = await got(uri);
        rootObject = JSON.parse(response.body);
    }
    return Promise.resolve(rootObject);
};

const getRevocationTree = async (isLocalTree = true, source = "/app/test-revoc/revocation_registry.json") => {
    initRepo();
    try {
        let registryObject;
        if (isLocalTree) {
            registryObject = await fs.readFile(source, "utf8");
            await fs.writeFile(`./revocation-tree-${Math.floor(Math.random() * 100)}.json`, registryObject);
            registryObject = JSON.parse(registryObject);
        } else {
            const uri = source + "/revocation_registry.json";
            let response = await got(uri);
            registryObject = JSON.parse(response.body);
        }
        let revocationTree = merklePoseidon([], registryObject.tree);
        return Promise.resolve(revocationTree);
    } catch (err) {
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

const handleError = (error, stdout, stderr) => {
    if (error) {
        console.error(`error: ${error.message}`);
    }
    if (stderr) {
        console.error(`stderr: ${stderr}`);
    }
    console.log(`stdout: ${stdout}`);
};

const initRepo = () => {
    execSync(`
    rm -rf /app/test-revoc &&
    cd /app &&
    git -C test-revoc pull || git clone https://github.com/ermolaev1337/test-revoc.git
    `, handleError);
};

const updateTree = (token) => {
    let reg = "/app/test-revoc/revocation_registry.json";
    let roo = "/app/test-revoc/revocation_root.json";
    const username = 'ermolaev1337';
    const repoUrl = `https://${username}:${token}@github.com/ermolaev1337/test-revoc.git`;
    execSync(`
    cd /app/test-revoc &&
    git config --global user.email "heimdall@uni.lu" &&
    git config --global user.name "Heimdall" &&
    git add ${reg} ${roo} &&
    git commit -m 'Update revocation registry' &&
    git push ${repoUrl}
    `, handleError);
};

const writeFilesRevocation = async (reg, destination) => {
    reg.tree.leaves = stringifyBigInts(reg.tree.leaves);
    reg.tree.data = stringifyBigInts(reg.tree.data);
    if (typeof reg.signature !== "undefined") {
        reg.signature = stringifyBigInts(reg.signature);
        await fs.writeFile(path.join(destination, "revocation_signature.json"), JSON.stringify(reg.signature))
            .catch(console.log);
    }
    await fs.writeFile(path.join(destination, "revocation_registry.json"), JSON.stringify(reg)).catch(console.log);
    await fs.writeFile(path.join(destination, "revocation_root.json"), JSON.stringify(reg.tree.root))
        .catch(console.log);

    return Promise.resolve(true);
};

module.exports = {
    parsePolygon, getRevocationTree, getSecretKey, writeFilesRevocation, pushGitRevocation, updateTree,
    getRevocationRoot, initRepo, MAX_POLYGON_SIZE
};