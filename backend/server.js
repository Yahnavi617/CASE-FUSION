const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const {
    computeLeads,
    parseCSV,
    buildEntityMap
} = require('../scoring-engine/scoringEngine');

const app = express();

app.use(cors());
app.use(express.json());


// =====================================================
// STORAGE SETUP
// =====================================================

const STORAGE_DIR = path.join(__dirname, 'storage');
const CASES_DIR = path.join(STORAGE_DIR, 'cases');

fs.mkdirSync(CASES_DIR, {
    recursive: true
});


// =====================================================
// MULTER UPLOAD CONFIG
// =====================================================

const upload = multer({

    storage: multer.memoryStorage(),

    limits: {
        fileSize: 10 * 1024 * 1024
    },

    fileFilter: (req, file, cb) => {

        if (
            path.extname(file.originalname).toLowerCase() !== '.csv'
        ) {
            return cb(
                new Error('Only CSV files are allowed')
            );
        }

        cb(null, true);
    }

});


// =====================================================
// HELPER — CREATE CASE ID
// =====================================================

function generateCaseId() {

    const date = new Date()
        .toISOString()
        .slice(0, 10)
        .replace(/-/g, '');

    const random =
        Math.floor(1000 + Math.random() * 9000);

    return `CASE-${date}-${random}`;
}


// =====================================================
// CSV VALIDATION
// =====================================================

function validateCSV(
    buffer,
    requiredColumns,
    fileName
) {

    // -----------------------------------------------
    // CHECK BUFFER
    // -----------------------------------------------

    if (!buffer || !Buffer.isBuffer(buffer)) {

        throw new Error(
            `${fileName} was not received correctly`
        );

    }


    // -----------------------------------------------
    // READ FILE
    // -----------------------------------------------

    const content =
        buffer.toString('utf8').trim();


    // -----------------------------------------------
    // EMPTY FILE
    // -----------------------------------------------

    if (!content) {

        throw new Error(
            `${fileName} is empty`
        );

    }


    // -----------------------------------------------
    // SPLIT LINES
    // -----------------------------------------------

    const lines =
        content.split(/\r?\n/);


    // -----------------------------------------------
    // HEADER + DATA REQUIRED
    // -----------------------------------------------

    if (lines.length < 2) {

        throw new Error(
            `${fileName} must contain a header and at least one data row`
        );

    }


    // -----------------------------------------------
    // READ HEADERS
    // -----------------------------------------------

    const headers =
        lines[0]
            .split(',')
            .map(h => h.trim());


    // -----------------------------------------------
    // CHECK REQUIRED COLUMNS
    // -----------------------------------------------

    const missingColumns =
        requiredColumns.filter(
            column => !headers.includes(column)
        );


    if (missingColumns.length > 0) {

        throw new Error(
            `${fileName} is missing required columns: ${missingColumns.join(', ')}`
        );

    }


    // -----------------------------------------------
    // CHECK ROW COLUMN COUNT
    // -----------------------------------------------

    for (
        let i = 1;
        i < lines.length;
        i++
    ) {

        if (!lines[i].trim()) {
            continue;
        }

        const values =
            lines[i].split(',');

        if (
            values.length !== headers.length
        ) {

            throw new Error(
                `${fileName} has invalid data on row ${i + 1}: expected ${headers.length} columns but found ${values.length}`
            );

        }

    }


    return true;
}


// =====================================================
// HEALTH CHECK
// =====================================================

app.get('/', (req, res) => {

    res.json({

        message:
            'CASEFUSION Backend is running'

    });

});


// =====================================================
// CREATE NEW CASE + UPLOAD CSV FILES
// =====================================================

app.post(
    '/api/cases',

    upload.fields([

        {
            name: 'cdr',
            maxCount: 1
        },

        {
            name: 'bank',
            maxCount: 1
        },

        {
            name: 'social',
            maxCount: 1
        },

        {
            name: 'entities',
            maxCount: 1
        }

    ]),

    (req, res) => {

        try {

            // =========================================
            // CHECK FILES
            // =========================================

            if (!req.files) {

                return res.status(400).json({

                    success: false,

                    message:
                        'No files uploaded'

                });

            }


            const cdrFile =
                req.files.cdr?.[0];

            const bankFile =
                req.files.bank?.[0];

            const socialFile =
                req.files.social?.[0];
            const entitiesFile =
                req.files.entities?.[0];


            // =========================================
            // THREE FILES REQUIRED
            // =========================================

            if (
                !cdrFile ||
                !bankFile ||
                !socialFile ||
                !entitiesFile
            ) {

                return res.status(400).json({
                    success: false,
                    message: 'Four files are required: CDR, Bank, Social and Entities CSV'
                });

            }


            // =========================================
            // VALIDATE CDR
            // =========================================

            validateCSV(

                cdrFile.buffer,

                [
                    'timestamp',
                    'caller',
                    'receiver'
                ],

                'CDR.csv'

            );


            // =========================================
            // VALIDATE BANK
            // =========================================

            validateCSV(

                bankFile.buffer,

                [
                    'timestamp',
                    'from_account',
                    'to_account',
                    'amount'
                ],

                'Bank.csv'

            );


            // =========================================
            // VALIDATE SOCIAL
            // =========================================

            validateCSV(

                socialFile.buffer,

                [
                    'timestamp',
                    'handle',
                    'device_id'
                ],

                'Social.csv'

            );

            // =========================================
            // VALIDATE ENTITIES
            // =========================================

            validateCSV(
                entitiesFile.buffer,
                [
                    'entity_id',
                    'label',
                    'phone',
                    'account',
                    'handle',
                    'known_suspect'
                ],
                'Entities.csv'
            );

            // =========================================
            // CREATE CASE
            // =========================================

            const caseId =
                generateCaseId();

            const caseDir =
                path.join(
                    CASES_DIR,
                    caseId
                );


            fs.mkdirSync(
                caseDir,
                {
                    recursive: true
                }
            );


            // =========================================
            // SAVE FILES
            // =========================================

            fs.writeFileSync(

                path.join(
                    caseDir,
                    'CDR.csv'
                ),

                cdrFile.buffer

            );


            fs.writeFileSync(

                path.join(
                    caseDir,
                    'Bank.csv'
                ),

                bankFile.buffer

            );


            fs.writeFileSync(

                path.join(
                    caseDir,
                    'Social.csv'
                ),
                socialFile.buffer

            );

            fs.writeFileSync(
                path.join(caseDir, 'Entities.csv'),
                entitiesFile.buffer
            );


            // =========================================
            // CASE METADATA
            // =========================================

            const caseInfo = {

                caseId,

                name:
                    req.body.caseName ||
                    'Untitled Investigation',

                createdAt:
                    new Date().toISOString(),

                status:
                    'uploaded',

                files: {
                    cdr: 'CDR.csv',
                    bank: 'Bank.csv',
                    social: 'Social.csv',
                    entities: 'Entities.csv'

                }

            };


            fs.writeFileSync(

                path.join(
                    caseDir,
                    'case.json'
                ),

                JSON.stringify(
                    caseInfo,
                    null,
                    2
                )

            );


            // =========================================
            // RESPONSE
            // =========================================

            return res.status(201).json({

                success: true,

                message:
                    'Case created successfully',

                case: caseInfo

            });

        }

        catch (error) {

            console.error(
                'Case creation error:',
                error
            );


            // Validation errors
            if (
                error.message.includes(
                    'missing required columns'
                ) ||
                error.message.includes(
                    'invalid data'
                ) ||
                error.message.includes(
                    'is empty'
                ) ||
                error.message.includes(
                    'must contain'
                )
            ) {

                return res.status(422).json({

                    success: false,

                    message:
                        error.message

                });

            }


            return res.status(500).json({

                success: false,

                message:
                    error.message

            });

        }

    }

);


app.post(
    '/api/cases/:caseId/analyze',
    (req, res) => {

        try {

            const {
                caseId
            } = req.params;


            // -----------------------------------------
            // FIND CASE
            // -----------------------------------------

            const caseDir =
                path.join(
                    CASES_DIR,
                    caseId
                );


            if (!fs.existsSync(caseDir)) {

                return res.status(404).json({

                    success: false,

                    message:
                        'Case not found'

                });

            }

            const cdrPath =
                path.join(
                    caseDir,
                    'CDR.csv'
                );

            const bankPath =
                path.join(
                    caseDir,
                    'Bank.csv'
                );

            const socialPath =
                path.join(
                    caseDir,
                    'Social.csv'
                );

            const entitiesPath =
                path.join(
                    caseDir,
                    'Entities.csv'
                );

            if (
                !fs.existsSync(cdrPath) ||
                !fs.existsSync(bankPath) ||
                !fs.existsSync(socialPath) ||
                !fs.existsSync(entitiesPath)
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        'Required case CSV files are missing'

                });

            }


            // -----------------------------------------
            // READ CSV DATA
            // -----------------------------------------

            const cdrRows =
                parseCSV(cdrPath);

            const bankRows =
                parseCSV(bankPath);

            const socialRows =
                parseCSV(socialPath);

            const entityRows =
                parseCSV(entitiesPath);

            const entityMap =
                buildEntityMap(entityRows);

            const leads =
                computeLeads({

                    cdrRows,

                    bankRows,

                    socialRows,

                    entityMap

                });


            // -----------------------------------------
            // SAVE RESULTS
            // -----------------------------------------

            const results = {

                caseId,

                analyzedAt:
                    new Date().toISOString(),

                count:
                    leads.length,

                leads

            };


            fs.writeFileSync(

                path.join(
                    caseDir,
                    'results.json'
                ),

                JSON.stringify(
                    results,
                    null,
                    2
                )

            );


            // -----------------------------------------
            // UPDATE CASE STATUS
            // -----------------------------------------

            const caseInfoPath =
                path.join(
                    caseDir,
                    'case.json'
                );


            if (
                fs.existsSync(
                    caseInfoPath
                )
            ) {

                const caseInfo =
                    JSON.parse(
                        fs.readFileSync(
                            caseInfoPath,
                            'utf8'
                        )
                    );


                caseInfo.status =
                    'analyzed';

                caseInfo.analyzedAt =
                    results.analyzedAt;


                fs.writeFileSync(

                    caseInfoPath,

                    JSON.stringify(
                        caseInfo,
                        null,
                        2
                    )

                );

            }


            // -----------------------------------------
            // RESPONSE
            // -----------------------------------------

            return res.json({

                success: true,

                message:
                    'Case analyzed successfully',

                caseId,

                count:
                    leads.length,

                leads

            });

        }

        catch (error) {

            console.error(
                'Case analysis error:',
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    'Failedto analyze case'

            });

        }

    }

);


// =====================================================
// GET CASE DETAILS
// =====================================================

app.get(
    '/api/cases/:caseId',
    (req, res) => {

        try {

            const {
                caseId
            } = req.params;


            const caseDir =
                path.join(
                    CASES_DIR,
                    caseId
                );

            const caseFile =
                path.join(
                    caseDir,
                    'case.json'
                );


            if (!fs.existsSync(caseFile)) {

                return res.status(404).json({

                    success: false,

                    message:
                        'Case not found'

                });

            }


            const caseInfo =
                JSON.parse(
                    fs.readFileSync(
                        caseFile,
                        'utf8'
                    )
                );


            const resultsFile =
                path.join(
                    caseDir,
                    'results.json'
                );


            let leadCount = 0;


            if (
                fs.existsSync(resultsFile)
            ) {

                const results =
                    JSON.parse(
                        fs.readFileSync(
                            resultsFile,
                            'utf8'
                        )
                    );


                if (
                    Array.isArray(
                        results.leads
                    )
                ) {

                    leadCount =
                        results.leads.length;

                }

            }


            return res.json({

                success: true,

                case: {

                    caseId:
                        caseInfo.caseId,

                    name:
                        caseInfo.name,

                    status:
                        caseInfo.status,

                    createdAt:
                        caseInfo.createdAt,

                    analyzedAt:
                        caseInfo.analyzedAt ||
                        null,

                    files:
                        caseInfo.files,

                    leadCount

                }

            });

        }

        catch (error) {

            console.error(
                'Get case error:',
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    'Failed to fetch case details'

            });

        }

    }

);


// =====================================================
// GET ALL CASES
// =====================================================

app.get(
    '/api/cases',
    (req, res) => {

        try {

            const caseFolders =
                fs.readdirSync(
                    CASES_DIR
                );


            const cases = [];


            caseFolders.forEach(
                caseId => {

                    const caseDir =
                        path.join(
                            CASES_DIR,
                            caseId
                        );

                    const caseFile =
                        path.join(
                            caseDir,
                            'case.json'
                        );


                    if (
                        !fs.existsSync(
                            caseFile
                        )
                    ) {

                        return;

                    }


                    const caseInfo =
                        JSON.parse(
                            fs.readFileSync(
                                caseFile,
                                'utf8'
                            )
                        );


                    const resultsFile =
                        path.join(
                            caseDir,
                            'results.json'
                        );


                    let leadCount = 0;


                    if (
                        fs.existsSync(
                            resultsFile
                        )
                    ) {

                        const results =
                            JSON.parse(
                                fs.readFileSync(
                                    resultsFile,
                                    'utf8'
                                )
                            );


                        if (
                            Array.isArray(
                                results.leads
                            )
                        ) {

                            leadCount =
                                results.leads.length;

                        }

                    }


                    cases.push({

                        caseId:
                            caseInfo.caseId,

                        name:
                            caseInfo.name,

                        status:
                            caseInfo.status,

                        createdAt:
                            caseInfo.createdAt,

                        analyzedAt:
                            caseInfo.analyzedAt ||
                            null,

                        leadCount

                    });

                }
            );


            // Latest first
            cases.sort(
                (a, b) =>
                    new Date(b.createdAt) -
                    new Date(a.createdAt)
            );


            return res.json({

                success: true,

                count:
                    cases.length,

                cases

            });

        }

        catch (error) {

            console.error(
                'Get all cases error:',
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    'Failed to fetch cases'

            });

        }

    }

);
// =====================================================
// GET NETWORK GRAPH FOR SPECIFIC CASE
// =====================================================

app.get(
    '/api/cases/:caseId/network',
    (req, res) => {

        try {

            const { caseId } = req.params;

            // -----------------------------------------
            // FIND CASE
            // -----------------------------------------

            const caseDir = path.join(
                CASES_DIR,
                caseId
            );

            if (!fs.existsSync(caseDir)) {

                return res.status(404).json({

                    success: false,

                    message: 'Case not found'

                });

            }

            // -----------------------------------------
            // CSV PATHS
            // -----------------------------------------

            const cdrPath = path.join(
                caseDir,
                'CDR.csv'
            );

            const bankPath = path.join(
                caseDir,
                'Bank.csv'
            );

            const socialPath = path.join(
                caseDir,
                'Social.csv'
            );

            const entitiesPath = path.join(
                caseDir,
                'Entities.csv'
            );

            if (
                !fs.existsSync(cdrPath) ||
                !fs.existsSync(bankPath) ||
                !fs.existsSync(socialPath) ||
                !fs.existsSync(entitiesPath)
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        'Required case CSV files are missing'

                });

            }

            // -----------------------------------------
            // READ DATA
            // -----------------------------------------

            const cdrRows = parseCSV(cdrPath);
            const bankRows = parseCSV(bankPath);
            const socialRows = parseCSV(socialPath);
            const entityRows = parseCSV(entitiesPath);

            const entityMap =
                buildEntityMap(entityRows);

            const entityIds =
                Object.keys(entityMap);

            // -----------------------------------------
            // LOOKUP MAPS
            // -----------------------------------------

            const accountToId = {};
            const phoneToId = {};
            const handleToId = {};

            entityIds.forEach(id => {

                const entity = entityMap[id];

                if (entity.account) {
                    accountToId[entity.account] = id;
                }

                if (entity.phone) {
                    phoneToId[entity.phone] = id;
                }

                if (entity.handle) {
                    handleToId[entity.handle] = id;
                }

            });

            // -----------------------------------------
            // NODES
            // -----------------------------------------

            const nodes = entityIds.map(id => {

                const entity = entityMap[id];

                return {

                    id,

                    label: entity.label,

                    type: 'entity',

                    knownSuspect:
                        entity.knownSuspect

                };

            });

            // -----------------------------------------
            // EDGES
            // -----------------------------------------

            const edges = [];

            const edgeKeys = new Set();

            function addEdge(
                source,
                target,
                type,
                label
            ) {

                if (
                    !source ||
                    !target ||
                    source === target
                ) {
                    return;
                }

                const key = [
                    source,
                    target,
                    type
                ].sort().join('|');

                if (edgeKeys.has(key)) {
                    return;
                }

                edgeKeys.add(key);

                edges.push({

                    id:
                        `edge-${edges.length + 1}`,

                    source,

                    target,

                    type,

                    label

                });

            }

            // -----------------------------------------
            // BANK CONNECTIONS
            // -----------------------------------------

            bankRows.forEach(transaction => {

                const fromId =
                    accountToId[
                        transaction.from_account
                    ];

                const toId =
                    accountToId[
                        transaction.to_account
                    ];

                if (fromId && toId) {

                    addEdge(
                        fromId,
                        toId,
                        'financial',
                        'Bank transaction'
                    );

                }

            });

            // -----------------------------------------
            // CDR CONNECTIONS
            // -----------------------------------------

            cdrRows.forEach(call => {

                const callerId =
                    phoneToId[
                        call.caller
                    ];

                const receiverId =
                    phoneToId[
                        call.receiver
                    ];

                if (
                    callerId &&
                    receiverId
                ) {

                    addEdge(
                        callerId,
                        receiverId,
                        'communication',
                        'Phone call'
                    );

                }

            });

            // -----------------------------------------
            // SHARED DEVICE CONNECTIONS
            // -----------------------------------------

            const deviceToIds = {};

            socialRows.forEach(social => {

                const entityId =
                    handleToId[
                        social.handle
                    ];

                if (!entityId) {
                    return;
                }

                if (!deviceToIds[social.device_id]) {

                    deviceToIds[
                        social.device_id
                    ] = [];

                }

                if (
                    !deviceToIds[
                        social.device_id
                    ].includes(entityId)
                ) {

                    deviceToIds[
                        social.device_id
                    ].push(entityId);

                }

            });

            Object.entries(deviceToIds)
                .forEach(
                    ([deviceId, ids]) => {

                        for (
                            let i = 0;
                            i < ids.length;
                            i++
                        ) {

                            for (
                                let j = i + 1;
                                j < ids.length;
                                j++
                            ) {

                                addEdge(
                                    ids[i],
                                    ids[j],
                                    'device',
                                    `Shared device ${deviceId}`
                                );

                            }

                        }

                    }
                );

            // -----------------------------------------
            // RESPONSE
            // -----------------------------------------

            return res.json({

                success: true,

                caseId,

                nodes,

                edges

            });

        }

        catch (error) {

            console.error(
                'Network graph error:',
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    'Failed to build network graph'

            });

        }

    }

);


// =====================================================
// GET CROSS-CASE CONNECTIONS
// =====================================================

app.get(
    '/api/cases/:caseId/cross-case',
    (req, res) => {

        try {

            const { caseId } = req.params;

            const currentCaseDir = path.join(
                CASES_DIR,
                caseId
            );

            if (!fs.existsSync(currentCaseDir)) {

                return res.status(404).json({
                    success: false,
                    message: 'Case not found'
                });

            }

            const currentEntitiesPath =
                path.join(
                    currentCaseDir,
                    'Entities.csv'
                );

            if (!fs.existsSync(currentEntitiesPath)) {

                return res.status(400).json({
                    success: false,
                    message:
                        'Current case entities file is missing'
                });

            }

            const currentEntities =
                parseCSV(currentEntitiesPath);

            const connections = [];

            /*
             * Normalize values so that:
             * +91 98765 43210
             * 9876543210
             * are treated as the same identifier.
             */

            function normalize(value) {

                if (
                    value === undefined ||
                    value === null
                ) {
                    return '';
                }

                return String(value)
                    .trim()
                    .toLowerCase()
                    .replace(/[\s\-()]/g, '');

            }

            /*
             * Build identifiers for the current case.
             */

            const currentIdentifiers = [];

            currentEntities.forEach(
                (entity) => {

                    const identifiers = [
                        {
                            type: 'PHONE',
                            value:
                                normalize(
                                    entity.phone
                                )
                        },
                        {
                            type: 'ACCOUNT',
                            value:
                                normalize(
                                    entity.account
                                )
                        },
                        {
                            type: 'HANDLE',
                            value:
                                normalize(
                                    entity.handle
                                )
                        },
                        {
                            type: 'DEVICE',
                            value:
                                normalize(
                                    entity.device_id
                                )
                        },
                        {
                            type: 'IP',
                            value:
                                normalize(
                                    entity.ip
                                )
                        },
                    ];

                    identifiers.forEach(
                        (identifier) => {

                            if (
                                identifier.value
                            ) {

                                currentIdentifiers.push({

                                    entityId:
                                        entity.id ||
                                        entity.entity_id ||
                                        entity.name ||
                                        'Unknown',

                                    entityName:
                                        entity.label ||
                                        entity.name ||
                                        entity.id ||
                                        'Unknown',

                                    ...identifier

                                });

                            }

                        }
                    );

                }
            );

            /*
             * Scan every other case.
             */

            const caseFolders =
                fs.readdirSync(
                    CASES_DIR
                );

            caseFolders.forEach(
                (otherCaseId) => {

                    if (
                        otherCaseId === caseId
                    ) {
                        return;
                    }

                    const otherCaseDir =
                        path.join(
                            CASES_DIR,
                            otherCaseId
                        );

                    const otherCaseFile =
                        path.join(
                            otherCaseDir,
                            'case.json'
                        );

                    const otherEntitiesFile =
                        path.join(
                            otherCaseDir,
                            'Entities.csv'
                        );

                    if (
                        !fs.existsSync(
                            otherCaseFile
                        ) ||
                        !fs.existsSync(
                            otherEntitiesFile
                        )
                    ) {
                        return;
                    }

                    const otherCase =
                        JSON.parse(
                            fs.readFileSync(
                                otherCaseFile,
                                'utf8'
                            )
                        );

                    const otherEntities =
                        parseCSV(
                            otherEntitiesFile
                        );

                    otherEntities.forEach(
                        (otherEntity) => {

                            const otherIdentifiers = [
                                {
                                    type: 'PHONE',
                                    value:
                                        normalize(
                                            otherEntity.phone
                                        )
                                },
                                {
                                    type: 'ACCOUNT',
                                    value:
                                        normalize(
                                            otherEntity.account
                                        )
                                },
                                {
                                    type: 'HANDLE',
                                    value:
                                        normalize(
                                            otherEntity.handle
                                        )
                                },
                                {
                                    type: 'DEVICE',
                                    value:
                                        normalize(
                                            otherEntity.device_id
                                        )
                                },
                                {
                                    type: 'IP',
                                    value:
                                        normalize(
                                            otherEntity.ip
                                        )
                                },
                            ];

                            otherIdentifiers.forEach(
                                (otherIdentifier) => {

                                    if (
                                        !otherIdentifier.value
                                    ) {
                                        return;
                                    }

                                    currentIdentifiers.forEach(
                                        (currentIdentifier) => {

                                            if (
                                                currentIdentifier.type !==
                                                otherIdentifier.type
                                            ) {
                                                return;
                                            }

                                            if (
                                                currentIdentifier.value !==
                                                otherIdentifier.value
                                            ) {
                                                return;
                                            }

                                            const connectionKey =
                                                [
                                                    caseId,
                                                    otherCaseId,
                                                    currentIdentifier.type,
                                                    currentIdentifier.value,
                                                ].join('|');

                                            const alreadyExists =
                                                connections.some(
                                                    (item) =>
                                                        item.connectionKey ===
                                                        connectionKey
                                                );

                                            if (
                                                alreadyExists
                                            ) {
                                                return;
                                            }

                                            connections.push({

                                                id:
                                                    `CROSS-${connections.length + 1}`,

                                                connectionKey,

                                                caseA:
                                                    caseId,

                                                caseB:
                                                    otherCaseId,

                                                caseAName:
                                                    'Current Investigation',

                                                caseBName:
                                                    otherCase.name ||
                                                    otherCaseId,

                                                entityA:
                                                    currentIdentifier.entityName,

                                                entityB:
                                                    otherEntity.label ||
                                                    otherEntity.name ||
                                                    otherEntity.id ||
                                                    'Unknown',

                                                connection:
                                                    `Shared ${currentIdentifier.type}`,

                                                identifier:
                                                    currentIdentifier.value,

                                                strength:
                                                    currentIdentifier.type ===
                                                    'DEVICE'
                                                        ? 'High'
                                                        : currentIdentifier.type ===
                                                          'ACCOUNT'
                                                        ? 'High'
                                                        : 'Medium',

                                                sources: [
                                                    currentIdentifier.type
                                                ],

                                                reason:
                                                    `Both investigations contain the same ${currentIdentifier.type.toLowerCase()} identifier.`,

                                                firstObserved:
                                                    otherCase.createdAt ||
                                                    null,

                                            });

                                        }
                                    );

                                }
                            );

                        }
                    );

                }
            );

            return res.json({

                success: true,

                caseId,

                count:
                    connections.length,

                connections

            });

        }

        catch (error) {

            console.error(
                'Cross-case analysis error:',
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    'Failed to build cross-case connections'

            });

        }

    }

);

// =====================================================
// GET LEADS FOR SPECIFIC CASE
// =====================================================

app.get(
    '/api/cases/:caseId/leads',
    (req, res) => {

        try {

            const {
                caseId
            } = req.params;


            const caseDir =
                path.join(
                    CASES_DIR,
                    caseId
                );

            const resultsPath =
                path.join(
                    caseDir,
                    'results.json'
                );


            if (
                !fs.existsSync(caseDir)
            ) {

                return res.status(404).json({

                    success: false,

                    message:
                        'Case not found'

                });

            }


            if (
                !fs.existsSync(resultsPath)
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        'Case has not been analyzed yet'

                });

            }


            const results =
                JSON.parse(
                    fs.readFileSync(
                        resultsPath,
                        'utf8'
                    )
                );


            return res.json({

                success: true,

                caseId,

                count:
                    results.leads.length,

                leads:
                    results.leads

            });

        }

        catch (error) {

            console.error(
                'Case leads error:',
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    'Failed to fetch case leads'

            });

        }

    }

);


// =====================================================
// GET WHY FOR SPECIFIC CASE LEAD
// =====================================================

app.get(
    '/api/cases/:caseId/leads/:leadId/why',
    (req, res) => {

        try {

            const {
                caseId,
                leadId
            } = req.params;


            const caseDir =
                path.join(
                    CASES_DIR,
                    caseId
                );

            const resultsPath =
                path.join(
                    caseDir,
                    'results.json'
                );


            if (
                !fs.existsSync(caseDir)
            ) {

                return res.status(404).json({

                    success: false,

                    message:
                        'Case not found'

                });

            }


            if (
                !fs.existsSync(resultsPath)
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        'Case has not been analyzed yet'

                });

            }


            const results =
                JSON.parse(
                    fs.readFileSync(
                        resultsPath,
                        'utf8'
                    )
                );


            const lead =
                results.leads.find(
                    l => l.id === leadId
                );


            if (!lead) {

                return res.status(404).json({

                    success: false,

                    message:
                        'Lead not found in this case'

                });

            }


            return res.json({

                success: true,

                caseId,

                id:
                    lead.id,

                label:
                    lead.label,

                priority:
                    lead.score,

                signals:
                    lead.signals,

                reasons:
                    lead.reasons

            });

        }

        catch (error) {

            console.error(
                'Case lead explanation error:',
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    'Failed to fetch lead explanation'

            });

        }

    }

);


// =====================================================
// EXISTING GLOBAL LEADS
// =====================================================

const dataPath =
    path.join(
        __dirname,
        '../data'
    );


const cdrRows =
    parseCSV(
        path.join(
            dataPath,
            'CDR.csv'
        )
    );


const bankRows =
    parseCSV(
        path.join(
            dataPath,
            'Bank.csv'
        )
    );


const socialRows =
    parseCSV(
        path.join(
            dataPath,
            'Social.csv'
        )
    );


// =====================================================
// GET GLOBAL LEADS
// =====================================================

app.get(
    '/api/leads',
    (req, res) => {

        try {

            const leads =
                computeLeads({

                    cdrRows,

                    bankRows,

                    socialRows,

                    entityMap

                });


            return res.json({

                success: true,

                count:
                    leads.length,

                leads

            });

        }

        catch (error) {

            console.error(
                'Global leads error:',
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    'Failed to calculate leads'

            });

        }

    }

);


// =====================================================
// WHY GLOBAL LEAD
// =====================================================

app.get(
    '/api/leads/:id/why',
    (req, res) => {

        try {

            const leads =
                computeLeads({

                    cdrRows,

                    bankRows,

                    socialRows,

                    entityMap

                });


            const lead =
                leads.find(
                    l =>
                        l.id ===
                        req.params.id
                );


            if (!lead) {

                return res.status(404).json({

                    success: false,

                    message:
                        'Lead not found'

                });

            }


            return res.json({

                success: true,

                id:
                    lead.id,

                label:
                    lead.label,

                priority:
                    lead.score,

                signals:
                    lead.signals,

                reasons:
                    lead.reasons

            });

        }

        catch (error) {

            console.error(
                'Why lead error:',
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    'Failed to fetch lead explanation'

            });

        }

    }

);

// =====================================================
// EVIDENCE VAULT
// =====================================================

function buildEvidenceFromCase(
    caseId,
    caseInfo,
    caseDir
) {

    const evidence = [];

    const entitiesPath =
        path.join(
            caseDir,
            'Entities.csv'
        );

    let entities = [];

    if (
        fs.existsSync(
            entitiesPath
        )
    ) {
        entities =
            parseCSV(
                entitiesPath
            );
    }

    function findEntity(
        source,
        row
    ) {

        if (!entities.length) {
            return 'Unknown';
        }

        let match = null;

        if (source === 'Bank') {

            match =
                entities.find(
                    entity =>
                        entity.account &&
                        (
                            entity.account ===
                                row.from_account ||
                            entity.account ===
                                row.to_account
                        )
                );

        }

        if (source === 'CDR') {

            match =
                entities.find(
                    entity =>
                        entity.phone &&
                        (
                            entity.phone ===
                                row.caller ||
                            entity.phone ===
                                row.receiver
                        )
                );

        }

        if (source === 'Social') {

            match =
                entities.find(
                    entity =>
                        entity.handle &&
                        entity.handle ===
                            row.handle
                );

        }

        return (
            match?.label ||
            match?.entity_id ||
            'Unknown'
        );
    }

let verificationStatuses = {};

const verificationPath =
    path.join(
        caseDir,
        'evidence-status.json'
    );

if (
    fs.existsSync(
        verificationPath
    )
) {

    verificationStatuses =
        JSON.parse(
            fs.readFileSync(
                verificationPath,
                'utf8'
            )
        );

}
    function createEvidence(
        source,
        type,
        row,
        index,
        detailTitle
    ) {

        const sourceCode =
            source
                .substring(0, 3)
                .toUpperCase();

        const evidenceId =
            `EV-${caseId}-${sourceCode}-${String(
                index + 1
            ).padStart(4, '0')}`;

        const timestamp =
            row.timestamp ||
            null;

        const relatedEntity =
            findEntity(
                source,
                row
            );

        const rawPreview =
            Object.entries(row)
                .map(
                    ([key, value]) =>
                        `${key.toUpperCase()}: ${value}`
                )
                .join('\n');

        return {

            evidenceId,

            source,

            type,

            detailTitle,

            relatedEntity,

            caseId,

            caseName:
                caseInfo.name,

            timestamp,

            status:
    verificationStatuses[evidenceId]?.status ||
    'Pending Review',

            description:
                `${type} evidence collected from the ${source} source.`,

            rawPreview,

        };
    }


    // -----------------------------------------
    // BANK
    // -----------------------------------------

    const bankPath =
        path.join(
            caseDir,
            'Bank.csv'
        );

    if (
        fs.existsSync(bankPath)
    ) {

        const rows =
            parseCSV(bankPath);

        rows.forEach(
            (row, index) => {

                evidence.push(
                    createEvidence(
                        'Bank',
                        'Wire Transfer',
                        row,
                        index,
                        'Wire Transfer Record'
                    )
                );

            }
        );

    }


    // -----------------------------------------
    // CDR
    // -----------------------------------------

    const cdrPath =
        path.join(
            caseDir,
            'CDR.csv'
        );

    if (
        fs.existsSync(cdrPath)
    ) {

        const rows =
            parseCSV(cdrPath);

        rows.forEach(
            (row, index) => {

                evidence.push(
                    createEvidence(
                        'CDR',
                        'Call Log',
                        row,
                        index,
                        'Call Log Record'
                    )
                );

            }
        );

    }


    // -----------------------------------------
    // SOCIAL
    // -----------------------------------------

    const socialPath =
        path.join(
            caseDir,
            'Social.csv'
        );

    if (
        fs.existsSync(socialPath)
    ) {

        const rows =
            parseCSV(socialPath);

        rows.forEach(
            (row, index) => {

                evidence.push(
                    createEvidence(
                        'Social',
                        'Post Extracted',
                        row,
                        index,
                        'Social Post Record'
                    )
                );

            }
        );

    }


    return evidence;
}


// =====================================================
// GET ALL EVIDENCE
// =====================================================

app.get(
    '/api/evidence',
    (req, res) => {

        try {

            const caseFilter =
                req.query.caseId ||
                null;

            const sourceFilter =
                req.query.source ||
                null;

            const allEvidence = [];

            const caseFolders =
                fs.readdirSync(
                    CASES_DIR
                );

            caseFolders.forEach(
                caseId => {

                    if (
                        caseFilter &&
                        caseId !== caseFilter
                    ) {
                        return;
                    }

                    const caseDir =
                        path.join(
                            CASES_DIR,
                            caseId
                        );

                    const caseFile =
                        path.join(
                            caseDir,
                            'case.json'
                        );

                    if (
                        !fs.existsSync(
                            caseFile
                        )
                    ) {
                        return;
                    }

                    const caseInfo =
                        JSON.parse(
                            fs.readFileSync(
                                caseFile,
                                'utf8'
                            )
                        );

                    const caseEvidence =
                        buildEvidenceFromCase(
                            caseId,
                            caseInfo,
                            caseDir
                        );

                    caseEvidence.forEach(
                        item => {

                            if (
                                sourceFilter &&
                                item.source !==
                                    sourceFilter
                            ) {
                                return;
                            }

                            allEvidence.push(
                                item
                            );

                        }
                    );

                }
            );


            allEvidence.sort(
                (a, b) =>
                    new Date(
                        b.timestamp || 0
                    ) -
                    new Date(
                        a.timestamp || 0
                    )
            );


            return res.json({

                success: true,

                count:
                    allEvidence.length,

                evidence:
                    allEvidence

            });

        }

        catch (error) {

            console.error(
                'Evidence fetch error:',
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    'Failed to fetch evidence'

            });

        }

    }

);


// =====================================================
// VERIFY EVIDENCE
// =====================================================

app.post(
    '/api/evidence/:evidenceId/verify',
    (req, res) => {

        try {

            const {
                evidenceId
            } = req.params;

            const caseFolders =
                fs.readdirSync(
                    CASES_DIR
                );

            let foundEvidence = null;

            caseFolders.some(
                caseId => {

                    const caseDir =
                        path.join(
                            CASES_DIR,
                            caseId
                        );

                    const caseFile =
                        path.join(
                            caseDir,
                            'case.json'
                        );

                    if (
                        !fs.existsSync(
                            caseFile
                        )
                    ) {
                        return false;
                    }

                    const caseInfo =
                        JSON.parse(
                            fs.readFileSync(
                                caseFile,
                                'utf8'
                            )
                        );

                    const caseEvidence =
                        buildEvidenceFromCase(
                            caseId,
                            caseInfo,
                            caseDir
                        );

                    const match =
                        caseEvidence.find(
                            item =>
                                item.evidenceId ===
                                evidenceId
                        );

                    if (!match) {
                        return false;
                    }

                    foundEvidence = match;

                    const verificationPath =
                        path.join(
                            caseDir,
                            'evidence-status.json'
                        );

                    let statuses = {};

                    if (
                        fs.existsSync(
                            verificationPath
                        )
                    ) {

                        statuses =
                            JSON.parse(
                                fs.readFileSync(
                                    verificationPath,
                                    'utf8'
                                )
                            );

                    }

                    statuses[
                        evidenceId
                    ] = {
                        status:
                            'Verified',

                        verifiedAt:
                            new Date().toISOString(),
                    };

                    fs.writeFileSync(
                        verificationPath,
                        JSON.stringify(
                            statuses,
                            null,
                            2
                        )
                    );

                    foundEvidence = {
                        ...foundEvidence,
                        status: 'Verified',
                        verifiedAt:
                            statuses[
                                evidenceId
                            ].verifiedAt,
                    };

                    return true;

                }
            );


            if (!foundEvidence) {

                return res.status(404).json({

                    success: false,

                    message:
                        'Evidence not found'

                });

            }


            return res.json({

                success: true,

                evidence:
                    foundEvidence

            });

        }

        catch (error) {

            console.error(
                'Evidence verification error:',
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    'Failed to verify evidence'

            });

        }

    }

);
// =====================================================
// ERROR HANDLER
// =====================================================

app.use(
    (error, req, res, next) => {

        console.error('GLOBAL ERROR:', error);

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
);


// =====================================================
// START SERVER
// =====================================================

const PORT = 5000;


app.listen(
    PORT,
    () => {

        console.log(
            `CASEFUSION Backend running on http://localhost:${PORT}`
        );

    }
);