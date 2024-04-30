const {stringifyBigInts} = require("../util");
const {WarehouseIDs, PresentationTypes, Presentation} = require("./presentation");
const fs = require("fs/promises");

class OrderPresentation extends Presentation {
    constructor(
        cred,
        expiration,
        revocationLeaves,
        challenge,
        sk,
        issuerPK,
        signatureGenerator,
        treeGenerator,
        index
    ) {
        super(
            cred,
            expiration,
            revocationLeaves,
            challenge,
            sk,
            issuerPK,
            signatureGenerator,
            treeGenerator);
        this.type = PresentationTypes.order;
        // console.log("W_ID: ", this.type);
        let tree = treeGenerator(cred.attributes);
        let proof = tree.generateProof(index);
        this.privateInput.lemma = proof.lemma;
        this.privateInput.path = proof.path;
        this.output.content = {
            attribute: cred.attributes[index]
        };
    }
}

module.exports = {OrderPresentation};