"use strict";(function(){addEventListener("connect",function(s){s.source.postMessage({t:"swc"}),s.source.onmessage=function(n){var e=n.data;switch(console.info("SharedWorkerMessage",e),e.t){case"k":break;case"r":break;case"m":break;default:console.error('[Snowy] Unknown message type "'.concat(e.t,'"'))}}});console.info("[Snowy] Worker is now active.");})();
