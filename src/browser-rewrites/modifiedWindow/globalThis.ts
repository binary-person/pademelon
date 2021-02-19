import Pademelon = require('../../browser-module');

function modifiedGlobalThis(pademelonInstance: Pademelon, modifiedWindow: object): void {
    if (window.globalThis)
        Object.defineProperty(modifiedWindow, 'globalThis', {
            enumerable: true,
            get() {
                return pademelonInstance.modifiedWindow;
            }
        });
}

export { modifiedGlobalThis };
