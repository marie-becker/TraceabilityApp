const neo4j = require('neo4j-driver');
const express = require('express');
const router = express.Router();

const driver = neo4j.driver('bolt://10.20.107.223:8687', neo4j.auth.basic("neo4j", "abc"))
let session;

router.get('/classList', async function (req, res) {
    await openSession();
    let nodes = []
    let singleNodes = []

    //Get all files that are connected to a requirement
    await session.readTransaction(txc => {
        return txc.run('MATCH(n:File)-[r]->(m:Requirement) return n.filename as filename,n.path as path, n.lastcommit as lastcommit, r, m.key as key, m.summary as summary');

    }).then(async (r) => {
        r.records.forEach(no => {
            if (nodes.length !== 0) {
                let i;
                i = nodes.findIndex(e => e.filename === no.get('filename'));
                if (i !== undefined && i !== -1) nodes[i].requirements.push({
                    key: no.get('key'),
                    summary: no.get('summary')
                });
                else {
                    nodes.push({
                        filename: no.get('filename'),
                        lastcommit: no.get('lastcommit'),
                        path: no.get('path'),
                        requirements: [{key: no.get('key'), summary: no.get('summary')}]
                    });
                }
            } else {
                nodes.push({
                    filename: no.get('filename'),
                    lastcommit: no.get('lastcommit'),
                    path: no.get('path'),
                    requirements: [{key: no.get('key'), summary: no.get('summary')}]
                });
            }
        })

        // Get all Files
        await session.readTransaction(txc => {
            return txc.run('MATCH(n:File) return n.filename as filename, n.lastcommit as lastcommit, n.path as path');

        }).then((s) => {

            s.records.forEach(so => {
                singleNodes.push({
                    filename: so.get('filename'),
                    lastcommit: so.get('lastcommit'),
                    path: so.get('path'),
                    requirements: []
                });
            })
            session.close();
        });

        // Merge arrays to get list of all files, wether they have requirements or not
        let allNodes = mergeArrays(singleNodes, nodes)

        res.send(allNodes);
    }).catch((error) => {
        console.log(error);
        session.close();
    });
});

//Get list of requirements and the classes they are implemented in
router.get('/reqList', async function (req, res) {
    await openSession();
    let nodes = []

    await session.readTransaction(txc => {
        return txc.run('MATCH(n:Requirement)<-[r]-(m:File) return n.key as key, m.filename as filename');

    }).then(async (r) => {
        r.records.forEach(no => {
            if (nodes.length !== 0) {
                let i;
                i = nodes.findIndex(e => e.key === no.get('key'));
                if (i !== undefined && i !== -1) nodes[i].classes.push(no.get('filename'));
                else {
                    nodes.push({
                        key: no.get('key'),
                        classes: [no.get('filename')],
                    });
                }
            } else {
                nodes.push({
                    key: no.get('key'),
                    classes: [no.get('filename')],
                });
            }
        })
        res.send(nodes);
        await session.close();
    }).catch((error) => {
        console.log(error);
        session.close();
    });
});

//Post Jira issues to Neo4j
router.post('/postNodes', async function (req, res) {
    await openSession();
    let issues = req.body.issues
    let count = 0;
    for (const issue of issues) {
        await session.run(`MERGE (n:Requirement {key: '${issue.key}', summary: '${issue.summary}', review: 'false'})`)//TODO add summary
            .then(() => {
                count++;
            })
            .catch((error) => console.log(error));
    }
    res.send(count + "/" + req.body.issues.length);
    await session.close();
});

//Add Trace between Class and Jira issue
router.post('/addTrace', async function (req, res) {
    await openSession();
    await session.run(
        `MATCH(a:File),(b:Requirement)
        WHERE a.filename = '${req.body.filename}' AND b.key = '${req.body.key}'
        MERGE (a)-[r:implements]->(b)
        RETURN type(r)`)
        .then(() => {
            res.sendStatus(200);
            session.close();
        } )
        .catch((error) => {
            console.log(error)
            session.close();
        });
})

//Delete Trace between Class and Jira issue
router.post('/deleteTrace', async function (req, res) {
    await openSession();
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

//Get List of issue-keys of Jira issues
router.get('/getRequirements', async function (req, res) {
    await openSession();
    let nodes = [];
    await session.readTransaction(txc => {
        return txc.run('MATCH(n:Requirement) return n.key as key, n.summary as summary');
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
    await openSession();
    let requirements = req.body;

    // let difference = arr1.filter(x => !arr2.includes(x));

    for (const r of requirements) {
        await session.run(`MATCH (n:Requirement {key: '${r}'}) DELETE n`);
    }
    res.send("ok");
    session.close();

});

//Get list of classes, that implement a certain jira issue (by issue key)
router.get('/getClass/:key', async function (req, res) {
    await openSession();
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

//Get list of filenames of all Classes in neo4j
router.get('/getAllClasses', async function (req, res) {
    await openSession();
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

// Get all issues that are linked to a file
router.get('/getIssuesOfClass/:filename', async function (req, res) {
    await openSession();
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

// Get list of issues that have no relationships to software classes
router.get('/getNonTraceableIssues', async function (req, res) {
    await openSession();
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

// Get list of issues that do have relationships to software classes
router.get('/getTraceableIssues', async function (req, res) {
    await openSession();
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

// Get list of issues that need to be reviewed
router.get('/getReviewableIssues', async function (req, res) {
    await openSession();
    let issues = [];
    await session.readTransaction(txc => {
        return txc.run("MATCH(n:Requirement) WHERE n.review = 'true' return n.key as key, n.summary as summary, n.review as review");
    }).then(r => {
        r.records.forEach(no => {
            issues.push({key: no.get('key'), summary: no.get('summary'), review: no.get('review')})
        })
        res.send(issues);
        session.close();
    }).catch(error => {
        console.log(error);
        session.close();
    })
})

router.post('/finishReview', async function(req, res) {
    await driver.session().readTransaction(txc => {
        return txc.run(`MATCH(n:Requirement) WHERE n.key = '${req.body.key}' SET n.review = 'false'`);
    }).then(r => {
        res.send("Ok");
        session.close();
    }).catch(error => {
        console.log(error);
        session.close();
    })
})



function mergeArrays(arr1, arr2) {
    arr1.forEach(e => {
        arr2.forEach(f => {
            if (e.filename === f.filename) {
                e.requirements = f.requirements;
            }
        })
    })
    return arr1;
}

function openSession(){
    session = driver.session()
}


module.exports = router;
