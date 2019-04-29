export function PDAPI(apiToken, teamId, email) {
    this.apiToken = apiToken;
    this.teamId = teamId;
    this.email = email;
};

const STRING_LIMIT = 100;

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
                //console.log("Assign " + JSON.stringify(incident));
                var transformed = {
                    "title": limitString(incident["title"]),
                    "priority": incident["urgency"],
                    "status": incident["status"],
                    "id": incident["id"]
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

function limitString(str) {
    return str.length > STRING_LIMIT ? str.substring(0, STRING_LIMIT) : str;
}

PDAPI.prototype.ack = function(incidentId) {
    this.updateStatus(incidentId, "acknowledged");
}

PDAPI.prototype.resolve = function(incidentId) {
    this.updateStatus(incidentId, "resolved");
}

PDAPI.prototype.updateStatus = function(incidentId, newStatus) {
    var self = this;
    return new Promise(function(resolve, reject) {
        var body = JSON.stringify({
            "incident": {
                "type": "incident_reference",
                "status": newStatus
            }
        });
        const request = new Request("https://api.pagerduty.com/incidents/" + incidentId, 
            {
                headers: {
                    "Authorization": "Token token=" + self.apiToken,
                    "Accept": "application/vnd.pagerduty+json;version=2",
                    "Content-Type": "application/json",
                    "From": self.email
                },
                method: "PUT",
                body: body
            }
        );
        fetch(request).then(function(response) {
            console.log("Got response from server:", response);
            return response.json();
        }).then(function(json) {
            //console.log("Got JSON response from server:" + JSON.stringify(json));
        }).catch(function (error) {
            console.log("Fetching failed: " + JSON.stringify(error));
            reject(error);
        });
    });
}
