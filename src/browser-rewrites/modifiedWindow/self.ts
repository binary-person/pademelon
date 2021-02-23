import { generateModifiedWindow } from '.';
import Pademelon = require('../../browser-module');

function modifiedSelf(
    pademelonInstance: Pademelon,
    modifiedProperties: object,
    targetWindow: Window,
    modifiedWindow: Window
): void {
    const self =
        targetWindow === targetWindow.self
            ? modifiedWindow
            : generateModifiedWindow(pademelonInstance, targetWindow.self);
    Object.defineProperty(modifiedProperties, 'self', {
        enumerable: true,
        value: self
    });
}

export { modifiedSelf };
