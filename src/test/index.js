"use strict";

import {} from "../bc/index.js";

self.testChannel = new BroadcastChannel("cc.ltgc.snowy:PublicChannel");
testChannel.addEventListener("message", function (ev) {
	console.info(ev);
});
