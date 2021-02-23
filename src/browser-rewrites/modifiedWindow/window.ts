import Pademelon = require('../../browser-module');

function modifiedRecursiveWindow(
    _: Pademelon,
    modifiedProperties: object,
    _targetWindow: Window,
    modifiedWindow: Window
): void {
    Object.defineProperty(modifiedProperties, 'window', {
        enumerable: true,
        value: modifiedWindow
    });
}

export { modifiedRecursiveWindow };
