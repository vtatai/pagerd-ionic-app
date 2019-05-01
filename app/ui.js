import { INCIDENT_COUNT } from "../common/globals.js";
import * as messaging from "messaging";
import document from "document";

export function PDUI() {
    this.statusText = document.getElementById("statusText");
    this.statusArea = document.getElementById("statusArea");
    this.scroll = document.getElementById("scroll");

    this.tiles = [];
    for (let i = 0; i < INCIDENT_COUNT; i++) {
        let tile = document.getElementById(`incident-${i}`);
        if (tile) {
            this.tiles.push(tile);
        }
    }
    let refreshB = this.statusArea.getElementById("refreshButton");
    refreshB.onactivate = function(evt) {
        console.log("Triggering refresh");
        sendCommand("refresh");
    };
}

PDUI.prototype.hideStatus = function() {
    console.log("Hide status");
    this.statusText.text = "";
    this.statusArea.style.display = "none";
    this.scroll.value = 1;
}

PDUI.prototype.showStatus = function(text) {
    console.log("Show status " + text);
    this.statusText.text = text;
    this.statusArea.style.display = "inline";
    this.scroll.value = 0;
}

PDUI.prototype.updateUI = function(state, incidents) {
  if (state === "loaded") {
      if (incidents.length == 0) {
          this.clearIncidentList();
          this.showStatus("No incidents!");
      } else {
          this.hideStatus();
          this.updateIncidentList(incidents);
      }
  } else {
      if (state === "loading") {
          this.showStatus("Loading incidents...");
      } else if (state === "disconnected") {
          this.showStatus("Please check connection to phone and Fitbit App");
      } else if (state === "error") {
          this.showStatus("Unexpected error!");
      }
  }
}

PDUI.prototype.clearIncidentList = function() {
    for (let i = 0; i < INCIDENT_COUNT; i++) {
        let tile = this.tiles[i];
        if (!tile) {
            continue;
        }
        tile.style.display = "none";
    }
}

PDUI.prototype.updateIncidentList = function(incidents) {
    for (let i = 0; i < INCIDENT_COUNT; i++) {
        let tile = this.tiles[i];
        if (!tile) {
            continue;
        }

        const incident = incidents[i];
        if (!incident) {
            tile.style.display = "none";
            continue;
        }

        tile.style.display = "inline";
        tile.getElementById("title").text = incident.title;
        tile.getElementById("priority").text = "Priority: " + incident.priority;
        tile.getElementById("status").text = "Status: " + incident.status;
        let incidentId = incident.id;
        tile.getElementById("btn-ack").onactivate = function(evt) {
            console.log("Sending ack for " + i + "," + incidentId);
            sendCommand("ack", incidentId);
        }
        tile.getElementById("btn-resolve").onactivate = function(evt) {
            sendCommand("resolve", incidentId);
        }
    }
}

function sendCommand(command, incidentId) {
    if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
        console.log("Sending command: " + command);
        var data = {
            command: command,
            incidentId: incidentId
        };
        messaging.peerSocket.send(data);
    } else {
        console.log("Not connected to companion");
    }
}
