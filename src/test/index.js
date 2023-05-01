"use strict";

import {} from "../bc/index.js";

self.testChannel = new BroadcastChannel("cc.ltgc.snowy:PublicChannel");
testChannel.addEventListener("message", function (ev) {
	console.info(ev);
});
for (var i = 1; i <= 8; i ++) {
	testChannel.postMessage(`Test message #${i}!`);
};
