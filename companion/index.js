import { me } from "companion"
import * as messaging from "messaging";
import { settingsStorage } from "settings";

import { PDAPI } from "./pd.js"

const MILLISECONDS_PER_MINUTE = 1000 * 60
me.wakeInterval = 15 * MILLISECONDS_PER_MINUTE

settingsStorage.onchange = evt => {
    console.log("Settings onchange received: " + evt);
    sendIncidentsToTracker();
};

setInterval(function() {
    console.log("PD (" + me.buildId + ") running - Connectivity status=" + messaging.peerSocket.readyState + 
        " Connected? " + (messaging.peerSocket.readyState == messaging.peerSocket.OPEN ? "YES" : "no"));
}, 10000);

messaging.peerSocket.onopen = () => {
    console.log("Companion socket open");
    sendIncidentsToTracker();
};

messaging.peerSocket.onerror = () => {
    console.log("Connection error: " + err.code + " - " + err.message);
};

function sendIncidentsToTracker() {
    let apiTokenJson = settingsStorage.getItem("apiToken");
    let teamIdJson = settingsStorage.getItem("teamId");
    if (!apiTokenJson || !teamIdJson) {
        return;
    }
    var apiToken = JSON.parse(apiTokenJson).name;
    var teamId = JSON.parse(teamIdJson).name;
    console.log(`Settings for apiToken ${apiToken} and teamId ${teamId}`);
    var pdApi = new PDAPI(apiToken, teamId);
    pdApi.incidents().then(function(incidents) {
        if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
            console.log("Sending incidents: " + JSON.stringify(incidents));
            messaging.peerSocket.send(incidents);
        }
    }).catch(function (e) {
        console.log("error " + e); 
    });
}
