const config = {
    jira: {
        headers: {
            'Authorization': 'Basic TOKEN' //Jira API Token
        }
    },
    neo4j: {
        bolt: 'bolt://xx.xx.xxx.xxx:xxxx',
        username: '',
        password: ''
    }
}
module.exports = config;
