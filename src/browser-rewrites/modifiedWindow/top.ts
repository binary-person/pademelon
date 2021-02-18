import { generateModifiedWindow } from '.';
import Pademelon = require('../../browser-module');

function modifiedTop(pademelonInstance: Pademelon, modifiedWindow: object, targetWindow: Window): void {
    Object.defineProperty(modifiedWindow, 'top', {
        enumerable: true,
        get() {
            return generateModifiedWindow(pademelonInstance, targetWindow.top);
        }
    });
}

export { modifiedTop };
