import Pademelon = require('../../browser-module');

function modifiedRecursiveWindow(pademelonInstance: Pademelon, modifiedWindow: object): void {
    Object.defineProperty(modifiedWindow, 'window', {
        enumerable: true,
        get() {
            return pademelonInstance.modifiedWindow;
        }
    });
}

export { modifiedRecursiveWindow };
