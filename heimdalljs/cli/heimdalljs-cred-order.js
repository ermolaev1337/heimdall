#!/usr/bin/env node
const {program} = require("commander");
const {Credential} = require("../src/credential.js");
const fs = require("fs/promises");
const { utils } = require("ffjavascript");
const {stringifyBigInts } = utils;
const seedrandom = require('seedrandom');
const {newKey, getPublicKey} = require("../src/crypto/key.js");
const {merklePoseidon} = require("../src/crypto/poseidon.js");
const {signPoseidon} = require("../circomlib/eddsa.js");
const { symlinkSync } = require("fs");

program
    .requiredOption("-p, --publicKey <Path>", "Path to the public key of the holder")
    .requiredOption("-s, --secretKey <Path>", "Path to the secret key of the issuer")
    .requiredOption("-wid, --warehouse_id <String>", "Warehouse ID", "warehouse_id_1")
    .option("-d, --destination <Path>", "Path for storing the credential",
        "./order_vc.json");

program.action((options) => {
    generateCredential().then( (res) => {
          fs.writeFile(options.destination, JSON.stringify(stringifyBigInts(res))).catch(console.log);
        }
    ).catch(console.log);
});
program.parse(process.argv);

async function generateCredential() {
    try {
        const options = program.opts();
        let exp = new Date().getTime() + (Number(365) * 864e5 ); // 1 year expiration
        // Generate attributes
        let attr = [];
        // Order ID
        let order_id = newKey();
        attr.push(order_id); 
        // WarehouseID
        let warehouse_id = options.warehouse_id;
        attr.push(warehouse_id); 
        //Time to Warehouse
        let TtW = new Date().getTime() + (Number(1) * 864e5 );
        attr.push(TtW.toString()); 
        // Time to Delivery
        let TtD = new Date().getTime() + (Number(7) * 864e5 );
        attr.push(TtD.toString()); 
        
        attr.push("","","","")
        console.log(attr);
    
        let publicKey = await fs.readFile(options.publicKey,  "utf8");
        let secretKey = await fs.readFile(options.secretKey, "utf8");
        secretKey = secretKey.split("\n")[0];
        let cred = new Credential(
            attr, //JSON.parse(attr),
            attr[0], //options.id,
            JSON.parse(publicKey),
            exp,
            "order",
            "0",
            "", // registry
            secretKey,
            merklePoseidon,
            signPoseidon,
            getPublicKey
        );
        return Promise.resolve(cred);
    } catch (err) {
        return Promise.reject(err);
    }
}