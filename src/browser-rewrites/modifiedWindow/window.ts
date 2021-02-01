import Pademelon = require('../../browser-module');

function modifiedRecursiveWindow(pademelonInstance: Pademelon, modifiedWindow: object) {
    Object.defineProperty(modifiedWindow, 'window', {
        get() {
            return pademelonInstance.modifiedWindow;
        }
    });
}

export { modifiedRecursiveWindow };
