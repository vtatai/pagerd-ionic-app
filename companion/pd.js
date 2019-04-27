export function PDAPI(apiToken, teamId) {
    this.apiToken = apiToken;
    this.teamId = teamId;
};

PDAPI.prototype.incidents = function() {
    var self = this;
    return new Promise(function(resolve, reject) {
        const request = new Request("https://api.pagerduty.com/incidents?limit=20&statuses[]=triggered&statuses[]=acknowledged&team_ids[]=" + self.teamId, 
            {
                headers: {
                    "Authorization": "Token token=" + self.apiToken,
                    "Accept": "application/vnd.pagerduty+json;version=2"}
            }
        );
        console.log("Sending request: " + request);
        fetch(request).then(function(response) {
            console.log("Got response from server:", response);
            return response.json();
        }).then(function(json) {
            //console.log("Got JSON response from server:" + JSON.stringify(json));

            var rawIncidents = json["incidents"];
            var incidents = [];

            rawIncidents.forEach( (incident) => {
                var assignees = [];
                console.log("Assign " + JSON.stringify(incident));
                var transformed = {
                    "title": incident["title"],
                    "details": incident["title"],
                    "urgency": incident["urgency"],
                    "status": incident["status"]
                };
                incidents.push(transformed);
            });
            resolve(incidents);
        }).catch(function (error) {
            console.log("Fetching failed: " + JSON.stringify(error));
            reject(error);
        });
    });
}
