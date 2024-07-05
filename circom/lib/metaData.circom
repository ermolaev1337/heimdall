include "./circomlib/circuits/eddsaposeidon.circom";
include "./circomlib/circuits/poseidon.circom";
include "./merkleproof.circom";
include "./circomlib/circuits/comparators.circom";

template CheckMetaDataIntegrity(depth) {
    signal input path[depth];
    signal input lemma[depth + 2];
    signal input meta[8];
    signal input signature[3];
    signal input issuerPK[2];


    signal output id;
    signal output type;
    signal output holderPK[2];
    signal output revocationRegistry;
    signal output expiration;
    signal output delegatable;
    signal output credentialRoot;

    component hash[5]; 
    for (var i = 0; i < 5; i++) {
            hash[i] = Poseidon(1);
    }

    component eddsaVerify = EdDSAPoseidonVerifier();
    eddsaVerify.enabled <== 1;
    eddsaVerify.Ax <== issuerPK[0];
    eddsaVerify.Ay <== issuerPK[1];
    eddsaVerify.R8x <== signature[0];
    eddsaVerify.R8y <== signature[1];
    eddsaVerify.S <== signature[2];
    eddsaVerify.M <== lemma[depth + 1];

    component merkleTree = MerkleTree(3); //depth 3 == 2**3 = 8 leaves

    hash[0].inputs[0] <== meta[0];
    merkleTree.data[0] <== hash[0].out; 

    merkleTree.data[1] <== meta[1];

    hash[1].inputs[0] <== meta[2];
    merkleTree.data[2] <== hash[1].out;

    hash[2].inputs[0] <== meta[3];
    merkleTree.data[3] <== hash[2].out;

    merkleTree.data[4] <== meta[4];

    hash[3].inputs[0] <== meta[5];
    merkleTree.data[5] <== hash[3].out;

    hash[4].inputs[0] <== meta[6];
    merkleTree.data[6] <== hash[4].out;
    
    merkleTree.data[7] <== 19014214495641488759237505126948346942972912379615652741039992445865937985820; 

    component merkleProofMeta = MerkleProof(depth - 3);
    merkleProofMeta.lemma[0] <== merkleTree.root;
    merkleProofMeta.lemma[depth - 3 + 1] <== lemma[depth + 1];
    for (var i = 0; i < depth - 3; i++) {
        merkleProofMeta.path[i] <== path[3 + i];
        merkleProofMeta.lemma[i + 1] <== lemma[3 + i + 1];
    }

    id <== meta[0];
    type <== meta[1];
    holderPK[0] <== meta[2];
    holderPK[1] <== meta[3];
    revocationRegistry <== meta[4];
    expiration <== meta[5];
    delegatable <== meta[6];
    credentialRoot <== lemma[depth + 1];
}

template CheckExpiration() {
    signal input expirationCredential;
    signal input expirationPresentation;

    component le = LessEqThan(64);
    le.in[0] <== expirationPresentation;
    le.in[1] <== expirationCredential;
    1 === le.out;
}

template Link() {
    signal input pk[2];
    signal input challenge;

    signal output out;

    component hash = Poseidon(3);
	hash.inputs[0] <== challenge;	
	hash.inputs[1] <== pk[0];
	hash.inputs[2] <== pk[1];	
	out <== hash.out;
}

template CheckHolderBinding() {
    signal input signChallenge[3];
    signal input challenge;
    signal input holderPK[2];

    component eddsaVerify = EdDSAPoseidonVerifier();
    eddsaVerify.enabled <== 1;
    eddsaVerify.Ax <== holderPK[0];
    eddsaVerify.Ay <== holderPK[1];
    eddsaVerify.R8x <== signChallenge[0];
    eddsaVerify.R8y <== signChallenge[1];
    eddsaVerify.S <== signChallenge[2];
    eddsaVerify.M <== challenge;
}