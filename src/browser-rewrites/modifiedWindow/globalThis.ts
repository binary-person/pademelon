import Pademelon = require('../../browser-module');

function modifiedGlobalThis(
    _pademelonInstance: Pademelon,
    modifiedProperties: object,
    _targetWindow: Window,
    modifiedWindow: Window
): void {
    if (window.globalThis)
        Object.defineProperty(modifiedProperties, 'globalThis', {
            enumerable: true,
            value: modifiedWindow
        });
}

export { modifiedGlobalThis };
