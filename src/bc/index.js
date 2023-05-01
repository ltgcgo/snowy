"use strict";

var createEvent = function (type, data, opt) {
	var result;
	if (self.MessageEvent) {
		switch (type) {
			case "message": {
				result = new MessageEvent(type, {
					data,
					source: opt?.source,
					ports: opt?.ports
				});
				break;
			};
			default: {
				result = new Event(type);
			};
		};
	} else {
		result = document.createEvent("Event");
		result.initEvent(type, false, false);
		if (opt) {
			if (type == "message") {
				if (opt.source) {
					Object.defineProperty(result, "source", {value: opt.source});
				};
				if (opt.ports?.length) {
					Object.defineProperty(result, "ports", {value: opt.ports});
				};
			};
		};
	};
	result.data = data;
	return result;
};

if (!self.BroadcastChannel) {
	console.info(`[Snowy] Snowy is enabled. Path: ${self.SNOWY_PATH || "/snowy.js"}`);
	var msgPort;
	var openedBc = [];
	var openedId = {};
	var bcConstructor = function (channelId) {
		var upThis = this;
		// Forbid non-constructor call
		if (!(this?.constructor == bcConstructor)) {
			throw(new TypeError(`Illegal constructor`));
		};
		openedBc.push(this);
		if (!openedId[channelId]?.constructor) {
			openedId[channelId] = [];
		};
		openedId[channelId].push(this);
		// Private fields
		var instanceId = Math.floor(Math.random() * 281474976710656);
		var blockedId = new Set(); // Prevents loopback
		var nextId = 0;
		var cachedMsg = [];
		var untouched = true;
		var closed = false;
		// Define calls
		this.close = function () {
			var indexOf = openedBc.indexOf(upThis);
			if (indexOf > -1) {
				upThis.postMessage({t: "d", c: channelId, i: instanceId});
				openedBc.splice(indexOf, 1);
				if (openedId[channelId]?.constructor) {
					indexOf = openedId[channelId].indexOf(upThis);
					if (indexOf > -1) {
						openedId[channelId].splice(indexOf, 1);
					};
				};
				if (!openedId[channelId].length) {
					delete openedId[channelId];
				};
				console.debug(`[Snowy] BroadcastChannel closed.`);
				closed = true;
			} else {
				console.debug(`[Snowy] BroadcastChannel already closed.`);
			};
		};
		this.postMessage = function (message) {
			if (msgPort) {
				msgPort.postMessage({
					t: "m",
					c: channelId,
					i: instanceId,
					m: nextId,
					d: message
				});
				nextId ++;
			} else {
				cachedMsg.push(message);
				console.debug(`[Snowy] Message is cached.`)
			};
		};
		this.flush = function () {
			// This function should only be called when msgPort is online
			if (msgPort) {
				if (untouched) {
					msgPort.postMessage({t: "r", c: channelId, i: instanceId});
					while (cachedMsg.length) {
						var currentCache = cachedMsg.shift();
						upThis.postMessage(currentCache);
					};
					untouched = false;
					console.debug(`[Snowy] All cached messages are flushed away.`);
				};
			} else {
				throw(new Error("Tried to flush when the ports are not ready"));
			};
		};
		this.receiveMessage = function (sourcedMsg) {
			// The real demuxer
		};
		// Polyfill needed EventTarget calls, since Chrome 5 doesn't support its inheritance
		var listeners = {};
		this.dispatchEvent = function (ev) {
			Object.defineProperty(ev, "target", {value: upThis});
			Object.defineProperty(ev, "currentTarget", {value: upThis});
			if (listeners[ev.type]?.length) {
				var array = listeners[ev.type];
				for (var index = 0; index < array.length; index ++) {
					if (array[index]?.constructor == Function) {
						array[index].call(upThis, ev);
					};
				};
			};
			if (upThis[`on${ev.type}`] && upThis[`on${ev.type}`].constructor == Function) {
				upThis[`on${ev.type}`].call(upThis, ev);
			};
		};
		this.addEventListener = function (type, listener) {
			if (!listeners[type]?.constructor) {
				listeners[type] = [];
			};
			var indexOf = listeners[type].indexOf(listener);
			if (indexOf == -1) {
				listeners[type].push(listener);
			};
		};
		this.removeEventListener = function (type, listener) {
			if (listeners[type]?.length) {
				var indexOf = listeners[type].indexOf(listener);
				if (indexOf > -1) {
					listeners[type].splice(indexOf, 1);
				};
			};
			if (!listeners[type]?.length && listeners[type].constructor) {
				delete listeners[type];
			};
		};
	};
	self.BroadcastChannel = bcConstructor;
	var portStart = function () {
		if (msgPort) {
			// Register the message routing demuxer
			msgPort.addEventListener("message", function (ev) {
				var msgCxt = ev.data;
			});
			// Flush all cached messages
			for (var index = 0; index < openedBc.length; index ++) {
				openedBc[index].flush();
			};
		} else {
			throw(new Error("Message port isn't yet ready"));
		};
		console.info(`[Snowy] Snowy is active.`);
	};
	var swStart = function () {
		if (!msgPort) {
			var sw = new SharedWorker(self.SNOWY_PATH || "/snowy.js");
			msgPort = sw.port;
			msgPort.start();
			msgPort.postMessage({t: "k"});
			portStart();
		};
	};
	if (navigator.serviceWorker && navigator.serviceWorker.register) {
		// Use global service worker
		navigator.serviceWorker.register(self.SNOWY_PATH || "/snowy.js").then(function (registration) {
			console.debug(`[Snowy] Snowy is utilizing a global Service Worker.`);
			msgPort = registration.active || registration.installing || registration.waiting;
			msgPort.postMessage({t: "k"});
			msgPort.addEventListener("statechange", function () {
				msgPort.postMessage({t: "k"});
			});
			portStart();
		}).catch(function (error) {
			console.debug(`[Snowy] Service Worker registration failed. Utilizing a global Shared Worker instead.\n\t${error}`);
			swStart();
		});
	} else {
		// Use global shared worker
		console.debug(`[Snowy] Snowy is utilizing a global Shared Worker.`);
		swStart();
	};
} else {
	console.info(`[Snowy] Snowy is disabled.`);
};
