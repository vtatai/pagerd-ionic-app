import * as messaging from "messaging";
import { PDUI } from "./ui.js";

let ui = new PDUI();

ui.updateUI("disconnected");

//var fakeData = [
//{"title":"Prod Configuration Manager Listener for Kafka service is down","details":"Since 5:39PM"},
//{"title":"Elevated HTTP 500 status","details":"Since 5:39PM"}
//];
//ui.updateUI("loaded", fakeData);

//setInterval(function() {
    //console.log("PagerD running - Connectivity status=" + messaging.peerSocket.readyState +
        //" Connected? " + (messaging.peerSocket.readyState == messaging.peerSocket.OPEN ? "YES" : "no"));
//}, 3000);

messaging.peerSocket.onopen = function() {
    ui.updateUI("loading");
}

messaging.peerSocket.onmessage = function(evt) {
    let st = evt.data["status"];
    console.log("Received status from companion " + st);
    if (st == "missing_config") {
        ui.updateUI("missing_config");
    } else if (st == "ok") {
        ui.updateUI("loaded", evt.data["incidents"]);
    }
}

messaging.peerSocket.onerror = function(err) {
    ui.updateUI("error");
}
