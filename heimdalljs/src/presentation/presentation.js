const path = require("path");
const fs = require("fs");
const snarkjs = require("snarkjs");
const {performance} = require("perf_hooks");
const {MAX_LEAF_SIZE} = require('../revocation');
const {META_SIZE} = require('../credential');
const {exit} = require("process");

class Presentation {
    type
    privateInput
    output
    proof
    publicSignals

    /**
     * Generates the meta part of a presentation
     * @param expiration {Number}
     * @param cred {{signature: {S: string, R8: [string, string], pk: [string, string]}, root: string, attributes}}
     * @param revocationTree {MerkleTree}
     * @param challenge {string}
     * @param sk {string}
     * @param issuerPK {boolean}
     * @param signatureGenerator {Function}
     * @param treeGenerator {Function}
     */
    constructor(
        cred,
        expiration,
        revocationTree,
        challenge,
        sk,
        issuerPK,
        signatureGenerator,
        treeGenerator
    ) {
        if (new.target === Presentation) {
            throw new TypeError("Cannot construct Presentation instances directly");
        }
        let tree = treeGenerator(cred.attributes);
        let proofMeta = tree.generateProof(0);
        this.privateInput = {};
        this.privateInput.pathMeta = proofMeta.path;
        this.privateInput.lemmaMeta = proofMeta.lemma;
        this.privateInput.meta = [];
        this.privateInput.expiration = expiration;
        // Only numbers get in the circuit, if string, then hashed
        for (let i = 0; i < META_SIZE; i++) {
            let attr = cred.attributes[i];
            if (Number.isInteger(attr) || /^\d+$/.test(attr)) {
                this.privateInput.meta.push(attr);
            } else {
                this.privateInput.meta.push(tree.data[i]);
            }
        }
        this.privateInput.signatureMeta = [cred.signature.R8[0], cred.signature.R8[1], cred.signature.S];
        this.privateInput.issuerPK = [cred.signature.pk[0], cred.signature.pk[1]];
        let positionRevocationTree = Math.floor(cred.attributes[0] / Number(MAX_LEAF_SIZE)); // Leaf 4898
        let proofRevocation = revocationTree.generateProof(positionRevocationTree);
        this.privateInput.pathRevocation = proofRevocation.path;
        this.privateInput.lemmaRevocation = proofRevocation.lemma;
        this.privateInput.revocationLeaf = revocationTree.leaves[positionRevocationTree];
        this.privateInput.challenge = challenge;
        if (typeof sk !== 'undefined') {
            let signChallenge = signatureGenerator(sk, BigInt(challenge));
            this.privateInput.signChallenge = [signChallenge.R8[0], signChallenge.R8[1], signChallenge.S];
        }
        this.output = {};
        this.output.meta = {
            type: cred.attributes[1],
            revocationRegistry: cred.attributes[4],
        };
        if (issuerPK) {
            this.output.meta.issuerPK = cred.signature.pk;
        }
        this.output.content = {};
    }

    static restore(presentation) {
        let pres = Object.create(this.prototype);
        pres.type = presentation.type;
        pres.privateInput = presentation.privateInput;
        pres.output = presentation.output;
        pres.proof = presentation.proof;
        pres.publicSignals = presentation.publicSignals;
        return pres;
    }

    async generate() {
        let root = path.join(require.main.paths[0].split("node_modules")[0].slice(0, -1), "../");
        //let root = path.join(require.main.paths[0].split("node_modules")[0].slice(0, -1));
        let t0 = performance.now();
        const {proof, publicSignals} = await snarkjs.groth16.fullProve(
            this.privateInput,
            path.join(root, "zkp", this.type, this.type === "range" ? "circuit.wasm" : "test.attributePresentation.wasm"),
            path.join(root, "zkp", this.type, this.type === "range" ? "circuit_final.zkey" : "test.attributePresentation.final.zkey")
        );
        let t1 = performance.now();

        this.proof = proof;
        this.publicSignals = publicSignals;

        let res = await this.verifyProof();
        // Overwriting private input
        this.privateInput = {};

        if (res === true) {
            return Promise.resolve(true);
        } else {
            return Promise.resolve(false);
        }
    }

    async verifyProof() {
        let root = path.join(require.main.paths[0].split("node_modules")[0].slice(0, -1), "../");
        //let root = path.join(require.main.paths[0].split("node_modules")[0].slice(0, -1));
        // const vKey = JSON.parse(fs.readFileSync(path.join(root, "zkp", this.type, "test.attributePresentation.verification.key.json")));
        const vKey = JSON.parse(fs.readFileSync(path.join(root, "zkp", this.type, this.type === "range" ? "verification_key.json" : "test.attributePresentation.verification.key.json")));

        let res = await snarkjs.groth16.verify(vKey, this.publicSignals, this.proof).catch(err => console.error(err));
        if (res === true) {
            return Promise.resolve(true);
        } else {
            return Promise.reject(false);
        }
    }

    async generateMult(nAttrs) {
        if (nAttrs > 4) {
            console.error("That many attributes not supported\n");
            exit(1);
        }
        let root = path.join(require.main.paths[0].split("node_modules")[0].slice(0, -1), "../");
        //let root = path.join(require.main.paths[0].split("node_modules")[0].slice(0, -1));
        let t0 = performance.now();
        const {proof, publicSignals} = await snarkjs.groth16.fullProve(
            this.privateInput,
            path.join(root, "zkp", "mult-attributes", "test.multipleAttributePresentation" + nAttrs + ".wasm"),
            path.join(root, "zkp", "mult-attributes", "test.multipleAttributePresentation" + nAttrs + ".final.zkey")
        );
        let t1 = performance.now();

        this.proof = proof;
        this.publicSignals = publicSignals;

        let res = await this.verifyMultProof(nAttrs);
        // Overwriting private input
        this.privateInput = {};

        if (res === true) {
            return Promise.resolve(true);
        } else {
            return Promise.resolve(false);
        }
    }

    async verifyMultProof(nAttrs) {
        // Multiple cases per number of attributes
        let root = path.join(require.main.paths[0].split("node_modules")[0].slice(0, -1), "../");
        //let root = path.join(require.main.paths[0].split("node_modules")[0].slice(0, -1));
        const vKey = JSON.parse(fs.readFileSync(path.join(root, "zkp", "mult-attributes", "test.multipleAttributePresentation" + nAttrs + ".verification.key.json")));

        let res = await snarkjs.groth16.verify(vKey, this.publicSignals, this.proof).catch(err => console.error(err));
        if (res === true) {
            return Promise.resolve(true);
        } else {
            return Promise.reject(false);
        }
    }

    /**
     * Verifies the meta attributes from the proof
     * @param typeIndex {Number}
     * @param revocationRootIndex {Number}
     * @param revokedIndex {Number}
     * @param revocationRegistryHashIndex
     * @param linkBackIndex {Number}
     * @param delegatableIndex {Number}
     * @param challengeIndex {Number}
     * @param expirationIndex {Number}
     * @param hasher {Function}
     * @returns {Promise<boolean>}
     */
    async verifyMeta(
        typeIndex,
        revocationRootIndex,
        revocationRegistryHashIndex,
        revokedIndex,
        linkBackIndex,
        delegatableIndex,
        challengeIndex,
        expirationIndex,
        hasher
    ) {
        /** Public Signals
         type
         revocationRoot
         revocationRegistry
         revoked
         linkBack
         delegatable
         attributeHash
         challenge
         expiration
         * [
         '6936141895847827773039820306011898011976769516186037164536571405943971461449',
         '15166994417731503543822836390427671538511444589633480329223617875361059048402',
         '2709480763505578374265785946171450970079473123863887847949961070331954626384',
         '0',
         '16480984838845883908278887403998730505458370097797273028422755199897309800407',
         '0',
         '17239002221223401420981429812936542253273189731769780993527026392913274359324',
         '1234',
         '1696606287033'
         ]
         */
            // console.debug("---START verifyMeta()---")
            // Checks if meta type hash from public signal is the same like in public input
        const hashedType = hasher([this.output.meta.type]).toString();
        // console.debug("hashedType", hashedType);
        // console.debug("this.publicSignals[typeIndex]", this.publicSignals[typeIndex]);
        let res = hashedType === this.publicSignals[typeIndex];
        // console.debug("res", res)
        // Reads revocation root from public signal
        // console.debug("this.output.meta.revocationRoot", this.output.meta.revocationRoot);
        // console.debug("this.publicSignals[revocationRootIndex]", this.publicSignals[revocationRootIndex]);

        this.output.meta.revocationRoot = this.publicSignals[revocationRootIndex];
        // Where is the revocation root?
        // console.debug("BigInt(this.revocationRoot", BigInt(this.revocationRoot))
        // console.debug("BigInt(this.output.meta.revocationRoot)", BigInt(this.output.meta.revocationRoot))
        res &&= BigInt(this.revocationRoot) === BigInt(this.output.meta.revocationRoot)
        // console.debug("res", res)
        // Checks if revocationRegistry of public input corresponds to hash of public signals
        const hashedRevocationRegistry = hasher([this.output.meta.revocationRegistry]).toString()
        // console.debug("hashedRevocationRegistry", hashedRevocationRegistry)
        // console.debug("this.publicSignals[revocationRegistryHashIndex]", this.publicSignals[revocationRegistryHashIndex])
        res &&= hashedRevocationRegistry === this.publicSignals[revocationRegistryHashIndex];
        // console.debug("res", res)
        this.output.meta.revoked = Number(this.publicSignals[revokedIndex]) === 1;
        this.output.meta.delegatable = Number(this.publicSignals[delegatableIndex]) === 1;
        this.output.meta.linkBack = this.publicSignals[linkBackIndex];
        this.output.meta.challenge = this.publicSignals[challengeIndex];
        this.output.meta.expiration = this.publicSignals[expirationIndex];
        if (typeof this.output.meta.issuerPK !== "undefined") {
            // console.debug(" this.output.meta.issuerPK !== \"undefined\"")
            res &&= hasher([
                this.output.meta.challenge,
                this.output.meta.issuerPK[0],
                this.output.meta.issuerPK[1]
            ]).toString() === this.output.meta.linkBack;
        }
        // console.debug("---END verifyMeta()---")
        return Promise.resolve(res);
    }

    /**
     * Verifies the meta attributes from the proof
     * @param typeIndex {Number}
     * @param revocationRootIndex {Number}
     * @param revokedIndex {Number}
     * @param revocationRegistryHashIndex
     * @param linkBackIndex {Number}
     * @param delegatableIndex {Number}
     * @param challengeIndex {Number}
     * @param expirationIndex {Number}
     * @param hasher {Function}
     * @returns {Promise<boolean>}
     */
    async verifyMultMeta(
        typeIndex,
        revocationRootIndex,
        revocationRegistryHashIndex,
        revokedIndex,
        linkBackIndex,
        delegatableIndex,
        challengeIndex,
        expirationIndex,
        hasher
    ) {
        /** Public Signals
         type
         revocationRoot
         revocationRegistry
         revoked
         linkBack
         delegatable
         challenge
         expiration
         attributeHash[# attrs]
         * [
         '6936141895847827773039820306011898011976769516186037164536571405943971461449',
         '15093063772197360439942670764347374738539884999170539844715519374005555450641',
         '9037940188198198671970800601490910088551427182609940173326074139244911486789',
         '0',
         '16480984838845883908278887403998730505458370097797273028422755199897309800407',
         '0',
         '1234',
         '1699108544456'
         '506091454650568783913867607798865803589405944288788850564754505122530534451',
         '3682517034118067363988451114871104117228742174037622396838237067437565515056',
         ... (2) or more attributes if necessary
         ]
         */
            // Checks if meta type hash from public signal is the same like in public input
        let res = hasher([this.output.meta.type]).toString() === this.publicSignals[typeIndex];
        // Reads revocation root from public signal
        this.output.meta.revocationRoot = this.publicSignals[revocationRootIndex];
        // Where is the revocation root?
        res &&= BigInt(this.revocationRoot) === BigInt(this.output.meta.revocationRoot)
        // Checks if revocationRegistry of public input corresponds to hash of public signals
        res &&= hasher([this.output.meta.revocationRegistry]).toString() ===
            this.publicSignals[revocationRegistryHashIndex];
        this.output.meta.revoked = Number(this.publicSignals[revokedIndex]) === 1;
        this.output.meta.delegatable = Number(this.publicSignals[delegatableIndex]) === 1;
        this.output.meta.linkBack = this.publicSignals[linkBackIndex];
        this.output.meta.challenge = this.publicSignals[challengeIndex];
        this.output.meta.expiration = this.publicSignals[expirationIndex];
        if (typeof this.output.meta.issuerPK !== "undefined") {
            res &&= hasher([
                this.output.meta.challenge,
                this.output.meta.issuerPK[0],
                this.output.meta.issuerPK[1]
            ]).toString() === this.output.meta.linkBack;
        }
        return Promise.resolve(res);
    }
}

const PresentationTypes = Object.freeze({
    "delegation": "delegation",
    "attribute": "attribute",
    "polygon": "polygon",
    "range": "range"
});

module.exports = {Presentation, PresentationTypes};