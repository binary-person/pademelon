import Pademelon = require('../../browser-module');

function modifiedRecursiveWindow(pademelonInstance: Pademelon, modifiedWindow: object) {
    Object.defineProperty(modifiedWindow, 'window', {
        enumerable: true,
        get() {
            return pademelonInstance.modifiedWindow;
        }
    });
}

export { modifiedRecursiveWindow };
