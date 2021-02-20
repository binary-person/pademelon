import { generateModifiedWindow } from '.';
import Pademelon = require('../../browser-module');

function modifiedSelf(pademelonInstance: Pademelon, modifiedWindow: object, targetWindow: Window): void {
    const self =
        targetWindow === targetWindow.self
            ? pademelonInstance.modifiedWindow
            : generateModifiedWindow(pademelonInstance, targetWindow.self);
    Object.defineProperty(modifiedWindow, 'self', {
        enumerable: true,
        get() {
            return self;
        }
    });
}

export { modifiedSelf };
