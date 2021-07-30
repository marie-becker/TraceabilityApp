const express = require('express');
const axios = require("axios");
const router = express.Router();


// Specific URLs to save time and data
const urlFields = 'https://hbrs.atlassian.net/rest/api/latest/search?maxResults=-1&fields=issuetype, project, priority, status, components, summary, description, assignee, reporter';
const urlKeys = 'https://hbrs.atlassian.net/rest/api/latest/search?maxResults=-1&fields=none';

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
    res.send(issues.sort((a,b) => a.key.localeCompare(b.key)));
    console.log("worked");
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

async function getReqByPage(url, startAt) {
    return new Promise(function(resolve){
        axios.get(`${url}&startAt=${startAt}`, config)
            .then((res) => {
                ///console.log(res.data);
                return resolve(res.data);
            })
            .catch(error => console.log(error));
    })
}

module.exports = router;
