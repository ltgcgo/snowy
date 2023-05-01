"use strict";

/* {
	t: String, // Type. k for keepalive, c for close, m for message, r for subscribing to channel, d for unsubscribing.
	c: String, // Channel ID.
	i: Number, // A random instance ID.
	m: Number, // An incrementing message ID, resets to 0 when greater than 2 ** 32 - 1.
	d: data
} */

var maxOffline = 25000;

var activeTabs = [];
var chToTab = {};

var subTabToCh = function (channel, tab) {
	if (!chToTab[channel]?.constructor) {
		chToTab[channel] = [];
	};
	if (chToTab[channel].indexOf(tab) < 0) {
		chToTab[channel].push(tab);
	};
	if (!tab.ch?.constructor) {
		tab.ch = [];
	};
	if (tab.ch.indexOf(channel) < 0) {
		tab.ch.push(channel);
	};
	console.debug(`[Snowy] Subscribed tab to channel ${channel}.`);
};
var unsubTabToCh = function (channel, tab) {
	if (chToTab[channel]?.constructor) {
		var ctabidx = chToTab[channel].indexOf(tab);
		if (ctabidx > -1) {
			chToTab[channel].splice(ctabidx, 1);
		};
		if (!chToTab[channel].length) {
			delete chToTab[channel];
		};
	};
	if (tab?.ch?.constructor) {
		var ctabidx = tab.ch.indexOf(channel);
		if (ctabidx > -1) {
			tab.ch.splice(ctabidx, 1);
		};
	};
	console.debug(`[Snowy] Unsubscribed tab from channel ${channel}.`);
};
var smsgDemuxer = function (smsg) {};

addEventListener("connect", function (ev) {
	// Shared Worker
	//console.info("SharedWorkerConnect", ev);
	var msrc = ev.source;
	msrc.postMessage({t: "swc"});
	msrc.onmessage = function (ev) {
		var smsg = ev.data;
		var reportMsg = true;
		switch (smsg.t) {
			case "k": {
				// Keepalive
				var tabId = activeTabs.indexOf(msrc);
				if (tabId < 0) {
					activeTabs.push(msrc);
				};
				msrc.lastKa = Date.now();
				//console.info(msrc);
				while (smsg?.c?.length) {
					var cid = smsg.c.pop();
					subTabToCh(cid, msrc);
				};
				reportMsg = false;
				break;
			};
			case "m": {
				// Broadcast message
				for (var i1 = 0; i1 < chToTab[smsg.c]?.length || 0; i1 ++) {
					chToTab[smsg.c][i1].postMessage(smsg);
				};
				break;
			};
			case "r": {
				// Register instance with channel
				subTabToCh(smsg.c, msrc);
				break;
			};
			case "d": {
				// Unregister instance with channel
				unsubTabToCh(smsg.c, msrc);
				break;
			};
			default: {
				console.error(`[Snowy] Unknown message type "${smsg.t}"`);
			};
		};
		if (reportMsg) {
			console.info("SharedWorkerMessage", smsg);
		};
	};
});

setInterval(function () {
	// Keepalive monitorer
	for (var index = activeTabs.length - 1; index >= 0; index --) {
		var ptr = activeTabs[index];
		ptr.postMessage({t: "k"});
		var ct = Date.now();
		if (ptr.lastKa + maxOffline < ct) {
			ptr.postMessage({t: "c"});
			if (ptr?.ch?.constructor) {
				for (var i0 = 0; i0 < ptr.ch.length; i0 ++) {
					unsubTabToCh(ptr.ch[i0], ptr);
				};
			};
			activeTabs.splice(index, 1);
			console.info(`[Snowy] Stopped one tab.`);
		};
	};
}, 10000);

console.info(`[Snowy] Worker is now active.`);
