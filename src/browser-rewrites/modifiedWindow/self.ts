import { generateModifiedWindow } from '.';
import Pademelon = require('../../browser-module');

function modifiedSelf(pademelonInstance: Pademelon, modifiedWindow: object, targetWindow: Window) {
    Object.defineProperty(modifiedWindow, 'self', {
        enumerable: true,
        get() {
            return generateModifiedWindow(pademelonInstance, targetWindow.self);
        }
    });
}

export { modifiedSelf };
