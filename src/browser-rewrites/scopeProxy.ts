import Pademelon = require('../browser-module');

function generateScopeProxy(pademelonInstance: Pademelon) {
    return new Proxy(pademelonInstance.modifiedWindow, {
        has() {
            return true;
        },
    });
}

export { generateScopeProxy };
