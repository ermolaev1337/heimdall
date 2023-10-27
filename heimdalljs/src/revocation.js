const REVOC_TREE_DEPTH = 13;
const MAX_LEAF_SIZE = 252n;

class RevocationRegistry {
    tree
    signatureGenerator = () => {}
    constructor(sk, merkleTreeGenerator, signatureGenerator, old = undefined) {
        if (typeof old === "undefined") {
            let leaves = new Array(Math.pow(2, REVOC_TREE_DEPTH)).fill(0n);
            this.tree = merkleTreeGenerator(leaves);
        } else {
            this.tree = merkleTreeGenerator([], old);
        }
        if (typeof sk !== "undefined") {
            this.signature = signatureGenerator(sk.toString(), this.tree.root.toString());
        }
    }

    /**
     * Toggls revocation for given id
     * @param id
     */
    update = (id, sk = undefined) => {
        console.debug('update() id >> ', id);
        const threshold = 2n ** BigInt(REVOC_TREE_DEPTH) * MAX_LEAF_SIZE;
        console.debug('update() threshold >> ', threshold);
        if (BigInt(id) >= threshold) throw "Id not in the tree";

        let indexLeaf = BigInt(id) / MAX_LEAF_SIZE;
        console.debug('update() indexLeaf >> ', indexLeaf);
        let indexBit = BigInt(id) % MAX_LEAF_SIZE;
        console.debug('update() indexBit >> ', indexBit);

        const comparator = (BigInt(this.tree.leaves[indexLeaf]) / 2n ** indexBit) % 2n;
        console.debug('update() comparator >> ', comparator);
        if (comparator === 1n) {
            const newValue = BigInt(this.tree.leaves[indexLeaf]) - 2n ** indexBit;
            console.debug('update() newValue >> ', newValue);
            this.tree.update(indexLeaf, newValue);
        } else {
            const newValue = BigInt(this.tree.leaves[indexLeaf]) + 2n ** indexBit;
            console.debug('update() newValue >> ', newValue);
            this.tree.update(indexLeaf, newValue);
        }
        if (typeof sk !== "undefined")
            this.signature = this.signatureGenerator(sk.toString(), this.tree.root.toString());
    }

    get leaves() {
        return this.tree.leaves;
    }

    /**
     * Returns if id is revoked
     * @param index
     * @returns {boolean}
     */
    getRevoked(id) {
        if (BigInt(id) >= 2n ** BigInt(REVOC_TREE_DEPTH) * MAX_LEAF_SIZE) throw "Id not in the tree";
        let positionTree = BigInt(id) / MAX_LEAF_SIZE;
        console.debug('getRevoked() positionTree >> ', positionTree);
        let positionLeaf = BigInt(id) % MAX_LEAF_SIZE;
        console.debug('getRevoked() positionLeaf >> ', positionLeaf);
        return (BigInt(this.tree.leaves[positionTree]) / 2n ** positionLeaf) % 2n === 1n;
    }
}

module.exports = {RevocationRegistry, REVOC_TREE_DEPTH, MAX_LEAF_SIZE};