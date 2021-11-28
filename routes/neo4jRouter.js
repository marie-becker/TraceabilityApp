const neo4j = require('neo4j-driver');
const express = require('express');
const config = require("../config");
const router = express.Router();

const driver = neo4j.driver(config.neo4j.bolt, neo4j.auth.basic(config.neo4j.username, config.neo4j.password))

//Get list of classes (filename, lastcommit, path) | Architecture
router.get('/classList', async function (req, res) {
    const session = driver.session();
    let classes = [];
    await session.readTransaction(txc => {
        return txc.run('MATCH(n:File) return n.filename as filename,n.path as path, n.lastcommit as lastcommit');
    }).then((r) => {
        r.records.forEach(no => {
            classes.push({
                filename: no.get('filename'),
                lastcommit: no.get('lastcommit'),
                path: no.get('path')
            });
        })
        res.send(classes);
        session.close();
    }).catch((error) => {
        console.log(error);
        session.close();
    });
});

//Post Jira issues to Neo4j
router.post('/jiraToNeo4j', async function (req, res) {
    const session = driver.session();
    let issues = req.body.issues
    let count = 0;
    for (const issue of issues) {
            await session.run(`MERGE (n:Requirement {key: '${issue.key}', summary: '${issue.summary}', review: 'false'})`)
            .then(() => {
                count++;
            })
            .catch((error) => console.log(error));
    }
    res.send(count + "/" + req.body.issues.length);
    await session.close();
});

//Add Trace between Class and Jira issue | Requirements | Architecture | Review
router.post('/addTrace', async function (req, res) {
    const session = driver.session();
    await session.run(
        `MATCH(a:File),(b:Requirement)
        WHERE a.filename = '${req.body.filename}' AND b.key = '${req.body.key}'
        MERGE (a)-[r:implements]->(b)`)
        .then(() => {
            res.sendStatus(200);
            session.close();
        } )
        .catch((error) => {
            console.log(error)
            session.close();
        });
})

//Delete Trace between Class and Jira issue | Requirements | Architecture | Review
router.post('/deleteTrace', async function (req, res) {
    const session = driver.session();
    session.run(
        `MATCH (n:File{filename: '${req.body.filename}'})-[r:implements]-(m:Requirement{key:'${req.body.key}'})
        DELETE r`
    )
        .then(() => {
            res.send("OK")
            session.close();
        })
        .catch((error) => {
            console.log(error)
            session.close();
        });
})

//Get list of issues | Architecture
router.post('/availableIssues', async function (req, res) {
    const session = driver.session();
    let nodes = [];
    await session.readTransaction(txc => {
        return txc.run(`MATCH(n:Requirement) 
        WHERE NOT (n)-[:implements]-(:File{filename:'${req.body.file.filename}', lastcommit : '${req.body.file.lastcommit}', path:'${req.body.file.path}'}) 
        return n.key as key, n.summary as summary`);
    })
        .then(r => {
            r.records.forEach(no => {
                nodes.push({key: no.get('key'), summary: no.get('summary')});
            })
            session.close();
            res.send(nodes);
        })
        .catch(error => {
            res.send(error)
            session.close();
        })
});

//Delete Jira issue from neo4j
router.post('/deleteReqs', async function (req, res) {
    const session = driver.session();
    let requirements = req.body;

    // let difference = arr1.filter(x => !arr2.includes(x));

    for (const r of requirements) {
        await session.run(`MATCH (n:Requirement {key: '${r}'}) DELETE n`);
    }
    res.send("ok");
    await session.close();

});

//Get list of classes, that implement a certain jira issue (by issue key) | Requirements | Review
router.get('/classes/:key', async function (req, res) {
    const session = driver.session();
    let nodes = [];
    await session.readTransaction(txc => {
        return txc.run(`MATCH(n:File)-[r]->(m:Requirement{key:'${req.params.key}'}) return n.filename as filename`);
    })
        .then(r => {
            r.records.forEach(no => {
                nodes.push(no.get('filename'));
            })
            res.send(nodes);
            session.close();
        })
        .catch(error => {
            res.send(error)
            session.close();
        })
})

//Get list of filenames of all Classes in neo4j | Requirements | Review
router.get('/allClassNames', async function (req, res) {
    const session = driver.session();
    let nodes = [];
    await session.readTransaction(txc => {
        return txc.run('MATCH(n:File) return n.filename as filename');
    }).then(r => {
        r.records.forEach(no => {
            nodes.push(no.get('filename'));
        })
        session.close();
        res.send(nodes);
    }).catch(error => {
        res.send(error);
        session.close();
    });
})

// Get all issues that are linked to a file | Software Architecture
router.get('/issuesOfClass/:filename', async function (req, res) {
    const session = driver.session();
    let issues = [];
    await session.readTransaction(txc => {
        return txc.run(`MATCH(n:File{filename: '${req.params.filename}'})-[r:implements]->(m:Requirement) return m.key as key, m.summary as summary`);
    }).then(r => {
        r.records.forEach(no => {
            issues.push({key: no.get('key'), summary: no.get('summary')})
        })
        res.send(issues);
        session.close();
    }).catch(error => {
        console.log(error);
        session.close();
    })
})

// Get list of issues that have no relationships to software classes | Overview
router.get('/nonTraceableIssues', async function (req, res) {
    const session = driver.session();
    let issues = [];
    await session.readTransaction(txc => {
        return txc.run('MATCH(n:Requirement) WHERE NOT ()-[:implements]-(n) return n.key as key, n.summary as summary');
    }).then(r => {
        r.records.forEach(no => {
            issues.push({key: no.get('key'), summary: no.get('summary')})
        })
        res.send(issues);
        session.close();
    }).catch(error => {
        console.log(error);
        session.close();
    })
})

// Get list of issues that do have relationships to software classes | Overview
router.get('/traceableIssues', async function (req, res) {
    const session = driver.session();
    let issues = [];
    await session.readTransaction(txc => {
        return txc.run('MATCH(n:Requirement) WHERE ()-[:implements]-(n) return n.key as key, n.summary as summary');
    }).then(r => {
        r.records.forEach(no => {
            issues.push({key: no.get('key'), summary: no.get('summary')})
        })
        res.send(issues);
        session.close();
    }).catch(error => {
        console.log(error);
        session.close();
    })
})

// Get list of issues that need to be reviewed | Overview | Review Requirements
router.get('/reviewableIssues', async function (req, res) {
    const session = driver.session();
    let issues = [];
    await session.readTransaction(txc => {
        return txc.run("MATCH(n:Requirement) WHERE n.review = 'true' return n.key as key, n.summary as summary");
    }).then(r => {
        r.records.forEach(no => {
            issues.push({key: no.get('key'), summary: no.get('summary')})
        })
        res.send(issues);
        session.close();
    }).catch(error => {
        console.log(error);
        session.close();
    })
})

// Set the review attribute of a certain requirement (by key) to false | Review Requirements
router.post('/finishReview', async function(req, res) {
    const session = driver.session();
    await session.readTransaction(txc => {
        return txc.run(`MATCH(n:Requirement) WHERE n.key = '${req.body.key}' SET n.review = 'false'`);
    }).then(() => {
        res.send("Ok");
        session.close();
    }).catch(error => {
        console.log(error);
        session.close();
    })
})

// set the review attribute of every requirement to false | Review Requirements
router.get('/setIssuesToFalse', async function (req, res){
    const session = driver.session();
    await session.readTransaction(txc => {
        return txc.run("MATCH(n:Requirement) WHERE n.review = 'true' SET n.review = 'false'");
    }).then(() => {
        res.send("OK");
        session.close();
    }).catch(error => {
        console.log(error);
        session.close();
    })
})


module.exports = router;
