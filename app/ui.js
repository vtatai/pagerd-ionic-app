import { INCIDENT_COUNT } from "../common/globals.js";
import * as messaging from "messaging";
import document from "document";

export function PDUI() {
  this.incidentList = document.getElementById("incidentList");
  this.statusText = document.getElementById("status");

  this.tiles = [];
  for (let i = 0; i < INCIDENT_COUNT; i++) {
    let tile = document.getElementById(`incident-${i}`);
    if (tile) {
      this.tiles.push(tile);
    }
  }
}

PDUI.prototype.updateUI = function(state, incidents) {
  if (state === "loaded") {
      this.incidentList.style.display = "inline";
      if (incidents.length == 0) {
          this.clearIncidentList();
          this.statusText.text = "No incidents!";
      } else {
          this.statusText.text = "";
          this.updateIncidentList(incidents);
      }
  } else {
      this.incidentList.style.display = "none";

      if (state === "loading") {
          this.statusText.text = "Loading incidents ...";
      } else if (state === "disconnected") {
          this.statusText.text = "Please check connection to phone and Fitbit App"
      } else if (state === "error") {
          this.statusText.text = "Something terrible happened.";
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
        var data = {
            command: command,
            incidentId: incidentId
        };
        messaging.peerSocket.send(data);
    } else {
        console.log("Not connected to companion");
    }
}
