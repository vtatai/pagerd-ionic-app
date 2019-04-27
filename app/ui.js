import { ALERT_COUNT } from "../common/globals.js";
import document from "document";

export function PDUI() {
  this.alertList = document.getElementById("alertList");
  this.statusText = document.getElementById("status");

  this.tiles = [];
  for (let i = 0; i < ALERT_COUNT; i++) {
    let tile = document.getElementById(`alert-${i}`);
    if (tile) {
      this.tiles.push(tile);
    }
  }
}

PDUI.prototype.updateUI = function(state, alerts) {
  if (state === "loaded") {
    this.alertList.style.display = "inline";
    this.statusText.text = "";

    this.updateAlertList(alerts);
  } else {
    this.alertList.style.display = "none";

    if (state === "loading") {
      this.statusText.text = "Loading alerts ...";
    } else if (state === "disconnected") {
      this.statusText.text = "Please check connection to phone and Fitbit App"
    } else if (state === "error") {
      this.statusText.text = "Something terrible happened.";
    }
  }
}

PDUI.prototype.updateAlertList = function(alerts) {
  for (let i = 0; i < ALERT_COUNT; i++) {
    let tile = this.tiles[i];
    if (!tile) {
      continue;
    }

    const alert = alerts[i];
    if (!alert) {
      tile.style.display = "none";
      continue;
    }

    tile.style.display = "inline";
    tile.getElementById("title").text = alert.title;
    tile.getElementById("details").text = alert.details;
  }
}
