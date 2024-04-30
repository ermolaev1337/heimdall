pragma circom 2.1.0;
include "./metaData.circom";
include "./contentData.circom";

template OrderPresentation(depth) {
	/*
	*  Inputs
	*/
	// Meta
	signal input pathMeta[depth];
	signal input lemmaMeta[depth + 2];
	signal input meta[8]; //Fixed Size of meta attributes in each credential
	signal input signatureMeta[3];
	signal input signChallenge[3];
	signal input issuerPK[2];
	// Content
	signal  input lemma[depth + 2];
	/*
	* Public Inputs
	*/
	// Meta
	signal input challenge; //7
	signal input expiration; //8
	signal output type; // 0
	signal output linkBack; //4
	signal output delegatable; //5
	// Content
	signal output out_issuerPK[2];
	signal input path[depth]; //9
	signal output out_challenge; //7
	signal output out_expiration; //7
	signal output attributeHash; //6

	/*
	* Meta calculations
	*/
	// Begin – Check Meta Integrity
	component checkMetaDataIntegrity = CheckMetaDataIntegrity(depth);

	checkMetaDataIntegrity.lemma[0] <== lemmaMeta[0];
	checkMetaDataIntegrity.lemma[depth + 1] <== lemmaMeta[depth + 1];
	checkMetaDataIntegrity.issuerPK[0] <== issuerPK[0];
	checkMetaDataIntegrity.issuerPK[1] <== issuerPK[1];

	checkMetaDataIntegrity.signature[0] <== signatureMeta[0];
	checkMetaDataIntegrity.signature[1] <== signatureMeta[1];
	checkMetaDataIntegrity.signature[2] <== signatureMeta[2];

	for(var i = 0; i < 8; i++) {
		checkMetaDataIntegrity.meta[i] <== meta[i];
	}

	for(var i = 0; i < depth; i++) {
		checkMetaDataIntegrity.path[i] <== pathMeta[i];
		checkMetaDataIntegrity.lemma[i + 1] <== lemmaMeta[i + 1];
	}
	// End – Check Meta Integrity

	// Begin – Check expiration
	component checkExpiration = CheckExpiration();
	checkExpiration.expirationCredential <== checkMetaDataIntegrity.expiration;
	checkExpiration.expirationPresentation <== expiration;
	// End – Check expiration

	//Begin - Link Back
	component getLinkBack = Link();
	getLinkBack.challenge <== challenge;
	getLinkBack.pk[0] <== checkMetaDataIntegrity.issuerPK[0];
	getLinkBack.pk[1] <== checkMetaDataIntegrity.issuerPK[1];
	// End - Link Back

	/*
	* Content calculations
	*/
	component checkAttribute = CheckAttribute(depth);

	checkAttribute.lemma[0] <== lemma[0];
	checkAttribute.lemma[depth + 1] <== lemma[depth + 1];
	for (var i = 0; i < depth; i++) {
		checkAttribute.path[i] <== path[i];
		checkAttribute.lemma[i + 1] <== lemma[i + 1];
	}	
	checkAttribute.credentialRoot <== checkMetaDataIntegrity.credentialRoot;

	// Outputs
	type <== checkMetaDataIntegrity.type;
	linkBack <== getLinkBack.out;
	delegatable <== checkMetaDataIntegrity.delegatable;
	out_issuerPK[0] <== issuerPK[0];
	out_issuerPK[1] <== issuerPK[1];
	out_challenge <== challenge;
	out_expiration <== expiration;
	attributeHash <== checkAttribute.attribute;
}

component main = OrderPresentation(4);
