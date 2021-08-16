const express = require('express');
const axios = require("axios");
const router = express.Router();


// Specific URLs to save time and data
const urlFields = 'https://hbrs.atlassian.net/rest/api/latest/search?maxResults=-1&fields=issuetype, project, priority, status, components, summary, description, assignee, reporter';
const urlKeys = 'https://hbrs.atlassian.net/rest/api/latest/search?maxResults=-1&fields=none';
const urlIssue = 'https://hbrs.atlassian.net/rest/api/latest/issue/'
const fields = '?fields=issuetype, project, priority, status, components, summary, description, assignee, reporter';
const keysAndSummary = 'https://hbrs.atlassian.net/rest/api/latest/search?maxResults=-1&fields=summary';

const config = {
    headers: {
        'Authorization': 'Basic bWFyaWUuYmVja2VyQHNtYWlsLmluZi5oLWJycy5kZTp4MXFkRWtOZlBxeFc1MlY1c2ZIUURCQTA=',
    }
};

// Get complete list of requirements
router.get('/', async function (req, res) {
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
    res.send(issues.sort((a,b) => a.key.slice(a.key.length-4).localeCompare(b.key.slice(b.key.length-4))));
})

// Get issues keys of all requirements
router.get('/keys', async function (req, res) {
    let keys = [];
    let startAt = 0;
    let response = await getReqByPage(urlKeys, startAt);
    let maxResults = response.maxResults;
    let total = response.total;
    while (total > 0) {
        response = await getReqByPage(urlKeys, startAt);
        response.issues.forEach(k => {
            keys.push(k.key);
        })
        total -= maxResults;
        startAt += maxResults;
    }
    res.send(keys);
});

router.get('/keysAndSummary', async function (req, res){
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

router.get('/byKey/:key', function (req, res) {
    axios.get(`${urlIssue}${req.params.key}${fields}`, config)
        .then((r) => {
            res.send(r.data);
        })
})

async function getReqByPage(url, startAt) {
    return new Promise(function(resolve){
        axios.get(`${url}&startAt=${startAt}`, config)
            .then((res) => {
                return resolve(res.data);
            })
            .catch(error => console.log(error));
    })
}

module.exports = router;
