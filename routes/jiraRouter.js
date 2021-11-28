const express = require('express');
const axios = require("axios");
const con = require("../config");
const router = express.Router();


// Specific URLs to save time and data
const urlFields = con.jira.baseUrl+'/rest/api/latest/search?jql=project=priotool&maxResults=-1&fields=issuetype, project, priority, status, components, summary, description, assignee, reporter';
const urlIssue = con.jira.baseUrl+'/rest/api/latest/issue/'
const fields = '?fields=issuetype, project, priority, status, components, summary, description, assignee, reporter';
const keysAndSummary = con.jira.baseUrl+'/rest/api/latest/search?jql=project=priotool&maxResults=-1&fields=summary';

const config = con.jira.headers;

// Get complete list of requirements
router.get('/allIssues', async function (req, res) {
    let issues = [];
    let startAt = 0;
    let response = await getReqByPage(urlFields, startAt);
    let maxResults = response.maxResults;
    let total = response.total;
    while (total > 0) {
        response = await getReqByPage(urlFields, startAt);
        issues = issues.concat(response.issues);
        total -= maxResults;
        startAt += maxResults;
    }
    res.send(issues.sort((a, b) => a.key.slice(a.key.length - 4).localeCompare(b.key.slice(b.key.length - 4))));
})

// Get list of requirements with key and summary as attributes (to store them in neo4j)
router.get('/keysAndSummary', async function (req, res) {
    let issues = [];
    let startAt = 0;
    let response = await getReqByPage(keysAndSummary, startAt);
    let maxResults = response.maxResults;
    let total = response.total;
    while (total > 0) {
        response = await getReqByPage(keysAndSummary, startAt);
        response.issues.forEach(k => {
            issues.push({key: k.key, summary: k.fields.summary});
        })
        total -= maxResults;
        startAt += maxResults;
    }
    res.send(issues);
})

// Get detailed requirement by key
router.get('/byKey/:key', function (req, res) {
    axios.get(`${urlIssue}${req.params.key}${fields}`, config)
        .then((r) => {
            res.send(r.data);
        })
})

// Helper method for Pagination
async function getReqByPage(url, startAt) {
    return new Promise(function (resolve) {
        axios.get(`${url}&startAt=${startAt}`, config)
            .then((res) => {
                return resolve(res.data);
            }).catch(error => console.log(error));
    })
}

module.exports = router;
