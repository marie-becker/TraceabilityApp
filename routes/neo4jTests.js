const neo4j = require('neo4j-driver');
const express = require('express');
const router = express.Router();

const driver = neo4j.driver('bolt://10.20.107.223:8687', neo4j.auth.basic("neo4j", "abc"))
const session = driver.session()
module.exports = router;

//Add Trace between Class and Test
router.post('/addTraceToFile', function (req, res) {
    session.run(
        `MATCH(a:File),(b:Test)
        WHERE a.filename = '${req.body.filename}' AND b.testname = '${req.body.testname}'
        MERGE (b)-[r:tests]->(a)
        RETURN type(r)`)
        .then(() => res.send("OK"))
        .catch((error) => console.log(error));
})

router.post('/addTraceToReq', function (req, res) {
    session.run(
        `MATCH(a:Requirement),(b:Test)
        WHERE a.key = '${req.body.key}' AND b.testname = '${req.body.testname}'
        MERGE (b)-[r:tests]->(a)
        RETURN type(r)`)
        .then(() => res.send("OK"))
        .catch((error) => console.log(error));
})

//Delete Trace between Class and Jira issue
router.post('/deleteTrace', function (req, res) {
    session.run(
        `MATCH (n:Test{testname: '${req.body.testname}'})-[r:tests]-(m:File{filename:'${req.body.filename}'})
        DELETE r`
    )
        .then(() => res.send("OK"))
        .catch((error) => console.log(error));
})
