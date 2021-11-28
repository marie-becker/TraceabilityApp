const config = {
    jira: {
        baseUrl: '', //probably something like https://BLABLA.atlassian.net
        headers: {
            headers: {
                'Authorization': 'Basic TOKEN' //Jira API Token
            }
        }
    },
    neo4j: {
        bolt: '', //bolt://xx.xx.xxx.xxx:xxxx
        username: '',
        password: ''
    }
}
module.exports = config;
