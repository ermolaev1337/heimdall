const {
    prepareTestFolder,
    prepareTestCircomFile,
    compileCircuit,
    getSnarkjsInfo,
    writeInputJsonFile,
    exec,
    readOutputJsonFile,
    logger,
    getConfig,
} = require("./util/helper");
const chai = require('chai');
expect = chai.expect;

const config = getConfig('attributePresentation');
console.debug('config >>', JSON.stringify(config, null, 2));

const attributePresentation = async (inputJsonFile, testCaseMarker) => {
    const {
        pathToTestFolder,
        testFileName,
        generateWitnessFile,
        wasmFile,
        wtnsFile,
        zkeyFinalFile,
        proofFile
    } = config;

    const pathToInputJsonFile = `${pathToTestFolder}/${testCaseMarker + testFileName}.input.json`;
    const pathToOutputJsonFile = `${pathToTestFolder}/${testCaseMarker + testFileName}.output.json`;
    console.debug('pathToInputJsonFile >> ', pathToInputJsonFile);
    console.debug('pathToOutputJsonFile >> ', pathToOutputJsonFile);

    await writeInputJsonFile(pathToInputJsonFile, inputJsonFile);

    await exec(`node ${generateWitnessFile} ${wasmFile} ${pathToInputJsonFile} ${wtnsFile}`).then(logger);
    await exec(`snarkjs groth16 prove ${zkeyFinalFile} ${wtnsFile} ${proofFile} ${pathToOutputJsonFile}`).then(logger);

    return await readOutputJsonFile(pathToOutputJsonFile);
};


describe('attributePresentation.circom template', async function () {
    const {
        pathToTestFolder,
        pathToCircomFile,
        zkeyFinalFile,
        pathToCircomTestFile,
        r1csFile,
        powerOfTauFile,
        zkeyInitialFile,
        fileName,
        verificationKeyFile
    } = config;

    before(async function () {
        await prepareTestFolder(pathToTestFolder);

        // const appendixCircuit = `\ncomponent main = AttributePresentation(4,13);`; The line is already there
        const appendixCircuit = '';
        await prepareTestCircomFile(pathToCircomFile, pathToCircomTestFile, appendixCircuit);

        await compileCircuit(pathToCircomTestFile, pathToTestFolder);
        await getSnarkjsInfo(r1csFile);

        await exec(`snarkjs zkey new ${r1csFile} ${powerOfTauFile} ${zkeyInitialFile}`).then(logger);
        await exec(`snarkjs zkey contribute ${zkeyInitialFile} ${zkeyFinalFile} --name="${fileName}" -e="random"`).then(logger);
        await exec(`snarkjs zkey export verificationkey ${zkeyFinalFile} ${verificationKeyFile}`).then(logger);
    });

    describe('AttributePresentation(4,13)', () => {


        it('Success test', async function () {
            const inputJsonFile = {
                pathMeta: [0, 0, 0, 0],
                lemmaMeta: [
                    4399448175216069540601318067672093140126261681248932114216490899879290176676n.toString(),
                    6936141895847827773039820306011898011976769516186037164536571405943971461449n.toString(),
                    10977980966834643138728730053226485292633849451273876782504771219740619389015n.toString(),
                    16626825921844844347951972969019702592820744432015503832460242637914752440967n.toString(),
                    16782511366933298090103848882196475461816553022971256482094853522595370383041n.toString(),
                    236135212018011276992864746968556994522096571858344104238605976023221562252n.toString()
                ],
                meta: [
                    '1234501',
                    6936141895847827773039820306011898011976769516186037164536571405943971461449n.toString(),
                    '13655875959156446041003686450727543277577607343640957596198614440905192406953',
                    '418345881136734657821536929192100652128513241165040801294274854880593629315',
                    2709480763505578374265785946171450970079473123863887847949961070331954626384n.toString(),
                    '1696683841621',
                    '0',
                    19014214495641488759237505126948346942972912379615652741039992445865937985820n.toString()
                ],
                expiration: '1696683841621',
                signatureMeta: [
                    '3735243045137383460209614972310498798806465637395790817827249825996692931608',
                    '3773153273391957069411780464504562064654019567093896260457263337441563355463',
                    '353197061716641118547002692193674362349711973158250846557355271379278933872'
                ],
                issuerPK: [
                    '4643259722160863894017222732038903736516965842816039081564323609562274366098',
                    '16525374212653837622881411417931955478254733897688458811072534400359914775645'
                ],
                pathRevocation: [
                    0, 1, 0, 0, 0, 1,
                    0, 0, 1, 1, 0, 0,
                    1
                ],
                lemmaRevocation: [
                    '15166994417731503543822836390427671538511444589633480329223617875361059048402',
                    '19014214495641488759237505126948346942972912379615652741039992445865937985820',
                    '10447686833432518214645507207530993719569269870494442919228205482093666444588',
                    '2186774891605521484511138647132707263205739024356090574223746683689524510919',
                    '6624528458765032300068640025753348171674863396263322163275160878496476761795',
                    '17621094343163687115133447910975434564869602694443155644084608475290066932181',
                    '21545791430054675679721663567345713395464273214026699272957697111075114407152',
                    '792508374812064496349952600148548816899123600522533230070209098983274365937',
                    '19099089739310512670052334354801295180468996808740953306205199022348496584760',
                    '1343295825314773980905176364810862207662071643483131058898955641727916222615',
                    '16899046943457659513232595988635409932880678645111808262227296196974010078534',
                    '4978389689432283653287395535267662892150042177938506928108984372770188067714',
                    '9761894086225021818188968785206790816885919715075386907160173350566467311501',
                    '17359243402716423847856211256034368828021432180374173712507781441869535986826',
                    '17251388444894072717477473574274222593987938315536802709728703916958893405064'
                ],
                revocationLeaf: '51422017416287688817342786954917203280710495801049370729644032',
                challenge: 1234,
                signChallenge: [
                    12243097771010616781290173970357380624543480859300372151596642622338342068677n.toString(),
                    7158243247130698738365721829221899672161681700413447673359275795322723226276n.toString(),
                    2046753221435243869622188326951147017772334889085503967106516336790136313561n.toString()
                ],
                lemma: [
                    17239002221223401420981429812936542253273189731769780993527026392913274359324n.toString(),
                    7897455098709435471743123610469418433859410994224203327265906221033213188649n.toString(),
                    18184097897423869067954609159781338801020426781287644174362324290770548021379n.toString(),
                    8735605506218874116533953108258172404700028069131132322529542658956691562536n.toString(),
                    11980947845101757389327312569993623785342031585125149796192790453476386313964n.toString(),
                    236135212018011276992864746968556994522096571858344104238605976023221562252n.toString()
                ],
                path: [0, 0, 0, 1]
            };

            const outputJsonFile = await attributePresentation(inputJsonFile, "successful-");

            const expectedOutputJsonFile = [
                "6936141895847827773039820306011898011976769516186037164536571405943971461449",
                "17251388444894072717477473574274222593987938315536802709728703916958893405064",
                "2709480763505578374265785946171450970079473123863887847949961070331954626384",
                "1",
                "16480984838845883908278887403998730505458370097797273028422755199897309800407",
                "0",
                "17239002221223401420981429812936542253273189731769780993527026392913274359324",
                "1234",
                "1696683841621",
                "4643259722160863894017222732038903736516965842816039081564323609562274366098",
                "16525374212653837622881411417931955478254733897688458811072534400359914775645",
            ];
            expect(expectedOutputJsonFile).to.deep.equal(outputJsonFile);
        });

    });
});