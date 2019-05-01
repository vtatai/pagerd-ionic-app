import { me } from "companion"
import * as messaging from "messaging";
import { settingsStorage } from "settings";

import { INCIDENT_COUNT } from "../common/globals.js";
import { PDAPI } from "./pd.js"

const MILLISECONDS_PER_MINUTE = 1000 * 60
me.wakeInterval = 15 * MILLISECONDS_PER_MINUTE

settingsStorage.onchange = evt => {
    console.log("Settings onchange received: " + evt);
    sendIncidentsToDevice();
};

//setInterval(function() {
    //console.log("PD (" + me.buildId + ") running - Connectivity status=" + messaging.peerSocket.readyState + 
        //" Connected? " + (messaging.peerSocket.readyState == messaging.peerSocket.OPEN ? "YES" : "no"));
//}, 10000);

messaging.peerSocket.onopen = () => {
    console.log("Companion socket open");
    sendIncidentsToDevice();
};

messaging.peerSocket.onerror = () => {
    console.log("Connection error: " + err.code + " - " + err.message);
};

messaging.peerSocket.onmessage = function(evt) {
    if (evt.data["command"] == "ack") {
        let pdApi = createPDAPI();
        pdApi.ack(evt.data["incidentId"]).then(function(response) {
            console.log("ACK successfull!");
            sendIncidentsToDevice();
        }).catch(function (e) {
            console.log("error " + e); 
        });
    } else if (evt.data["command"] == "resolve") {
        let pdApi = createPDAPI();
        pdApi.resolve(evt.data["incidentId"]).then(function(response) {
            console.log("Resolve result: " + JSON.stringify(response));
            sendIncidentsToDevice();
        }).catch(function (e) {
            console.log("error " + e); 
        });
    } else if (evt.data["command"] == "refresh") {
        sendIncidentsToDevice();
    } else {
        console.log("Unrecognized message from device: " + JSON.stringify(evt.data));
    }
}

function sendIncidentsToDevice() {
    let pdApi = createPDAPI();
    pdApi.incidents().then(function(incidents) {
        let incidentsLimited = incidents.slice(0, INCIDENT_COUNT);
        if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
            console.log("Sending incidents: " + JSON.stringify(incidents));
            messaging.peerSocket.send(incidentsLimited);
        }
    }).catch(function (e) {
        console.log("error " + e); 
    });
}

function createPDAPI() {
    let apiTokenJson = settingsStorage.getItem("apiToken");
    let teamIdJson = settingsStorage.getItem("teamId");
    let emailJson = settingsStorage.getItem("email");
    if (!apiTokenJson || !teamIdJson || !emailJson) {
        throw "Application has invalid configuration";
    }
    let apiToken = JSON.parse(apiTokenJson).name;
    let teamId = JSON.parse(teamIdJson).name;
    let email = JSON.parse(emailJson).name;
    return new PDAPI(apiToken, teamId, email);
}
