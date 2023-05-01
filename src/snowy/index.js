"use strict";

/* {
	t: String, // Type. k for keepalive, c for close, m for message, r for subscribing to channel, d for unsubscribing.
	c: String, // Channel ID.
	i: Number, // A random instance ID.
	m: Number, // An incrementing message ID, resets to 0 when greater than 2 ** 32 - 1.
	d: data
} */

//var activeTabs = new Set();
var idToTab = {};
var idInTab = {};

var isIdInTab = function (id, tab) {};

var smsgDemuxer = function (smsg) {};

addEventListener("connect", function (ev) {
	// Shared Worker
	//console.info("SharedWorkerConnect", ev);
	ev.source.postMessage({t: "swc"});
	//activeTabs.add(ev.source);
	ev.source.onmessage = function (ev) {
		var smsg = ev.data;
		console.info("SharedWorkerMessage", smsg);
		switch (smsg.t) {
			case "k": {
				// Keepalive
				break;
			};
			case "r": {
				break;
			};
			case "m": {
				break;
			};
			default: {
				console.error(`[Snowy] Unknown message type "${smsg.t}"`);
			};
		};
	};
});
/* addEventListener("message", function (ev) {
	// Service Worker
	var smsg = ev.data;
	console.info("ServiceWorker", ev);
}); */

console.info(`[Snowy] Worker is now active.`);
