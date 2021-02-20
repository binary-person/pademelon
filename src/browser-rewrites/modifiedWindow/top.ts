import { generateModifiedWindow } from '.';
import Pademelon = require('../../browser-module');

function modifiedTop(pademelonInstance: Pademelon, modifiedWindow: object, targetWindow: Window): void {
    const top =
        targetWindow === targetWindow.top
            ? pademelonInstance.modifiedWindow
            : generateModifiedWindow(pademelonInstance, targetWindow.top);
    Object.defineProperty(modifiedWindow, 'top', {
        enumerable: true,
        get() {
            return top;
        }
    });
}

export { modifiedTop };
