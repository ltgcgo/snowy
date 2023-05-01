"use strict";

/* {
	t: String, // Type. k for keepalive, c for close, m for message, r for subscribing to channel, d for unsubscribing.
	c: String, // Channel ID.
	i: Number, // A random instance ID.
	m: Number, // An incrementing message ID, resets to 0 when greater than 2 ** 32 - 1.
	d: data
} */

var idToTab = {};
var idInTab = {};

var isIdInTab = function (id, tab) {};

var smsgDemuxer = function (smsg) {};

addEventListener("connect", function (ev) {
	// Shared Worker
	var smsg = ev.data;
	console.info("SharedWorker", ev);
});
addEventListener("message", function (ev) {
	// Service Worker
	var smsg = ev.data;
	console.info("ServiceWorker", ev);
});

console.info(`[Snowy] Worker is now active.`);
