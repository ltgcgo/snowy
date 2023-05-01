# snowy
❄️ The `BroadcastChannel` polyfill for Firefox 29+ and Chrome 5+.

## Usage
Place `snowy.js` under the root directory of your site, then run `bc.js` in your web page to start the polyfill. If you do not want to place `snowy.js` under the root directory, feel free to set `self.SNOWY_PATH` to where `snowy.js` resides.

Polyfill will not be active if `BroadcastChannel` is already in the browser.
