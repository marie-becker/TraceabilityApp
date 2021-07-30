const neo4j = require('neo4j-driver');
const express = require('express');
const router = express.Router();

const driver = neo4j.driver('bolt://10.20.107.223:8687', neo4j.auth.basic("neo4j", "abc"))
const session = driver.session()

router.get('/classList', async function (req, res) {
    let nodes = []
    let singleNodes = []

    //Get all files that are connected to a requirement
    await session.readTransaction(txc => {
        return txc.run('MATCH(n:File)-[r]->(m:Requirement) return n.filename as filename, n.lastcommit as lastcommit, r, m.key as target');

    }).then(async (r) => {
        r.records.forEach(no => {
            if (nodes.length !== 0) {
                let i;
                i = nodes.findIndex(e => e.filename === no.get('filename'));
                //console.log(nodes[i])
                if (i !== undefined && i !== -1) nodes[i].requirements.push(no.get('target'));
                else {
                    nodes.push({
                        filename: no.get('filename'),
                        lastcommit: no.get('lastcommit'),
                        //type: no.get('r'),
                        requirements: [no.get('target')]
                    });
                }
            } else {
                nodes.push({
                    filename: no.get('filename'),
                    lastcommit: no.get('lastcommit'),
                    //type: no.get('r'),
                    requirements: [no.get('target')]
                });
            }
        })

        // Get all Files
        await session.readTransaction(txc => {
            return txc.run('MATCH(n:File) return n.filename as filename, n.lastcommit as lastcommit');

        }).then((s) => {

            s.records.forEach(so => {
                singleNodes.push({
                    filename: so.get('filename'),
                    lastcommit: so.get('lastcommit'),
                    requirements: []
                });
            })
        });

        // Merge arrays to get list of all files, wether they have requirements or not
        let allNodes = mergeArrays(singleNodes, nodes)

        res.send(allNodes);
    }).catch((error) => {
        console.log(error);
        //session.close();
    });
});


//Get list of requirements and the classes they are implemented in
router.get('/reqList', async function (req, res) {
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
    }).catch((error) => {
        console.log(error);
        //session.close();
    });
});

router.post('/postNodes', async function (req, res) {
    let keys = req.body.keys
    let count = 0;
    for (const k of keys) {
        await session.run(`MERGE (n:Requirement {key: '${k}'})`)
            .then(() => {
                count++;
            })
            .catch((error) => console.log(error));
    }
    res.send(count + "/" + req.body.keys.length);
});

router.post('/addTrace', function (req, res) {
    session.run(
        `MATCH(a:File),(b:Requirement)
        WHERE a.filename = '${req.body.filename}' AND b.key = '${req.body.key}'
        MERGE (a)-[r:implements]->(b)
        RETURN type(r)`)
        .then(() => res.send("OK"))
        .catch((error) => console.log(error));
})

router.post('/deleteTrace', function (req, res) {
    session.run(
        `MATCH (n:File{filename: '${req.body.filename}'})-[r:implements]-(m:Requirement{key:'${req.body.key}'})
        DELETE r`
    )
        .then(() => res.send("OK"))
        .catch((error) => console.log(error));
})

router.get('/getRequirements', async function (req, res) {
    let nodes = [];
    await session.readTransaction(txc => {
        return txc.run('MATCH(n:Requirement) return n.key as key');
    })
        .then(r => {
            r.records.forEach(no => {
                nodes.push(no.get('key'))
            })
            res.send(nodes);
        })
        .catch(error => res.send(error))
});

router.post('/deleteReqs', async function (req, res) {
    let requirements = req.body;

    // let difference = arr1.filter(x => !arr2.includes(x));

    for(const r of requirements){
        await session.run(`MATCH (n:Requirement {key: '${r}'}) DELETE n`);
    }
    res.send("ok");

});

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


module.exports = router;
