import { generateModifiedWindow } from '.';
import Pademelon = require('../../browser-module');

function modifiedParent(pademelonInstance: Pademelon, modifiedWindow: object, targetWindow: Window): void {
    const parent =
        targetWindow === targetWindow.parent
            ? pademelonInstance.modifiedWindow
            : generateModifiedWindow(pademelonInstance, targetWindow.parent);
    Object.defineProperty(modifiedWindow, 'parent', {
        enumerable: true,
        get() {
            return parent;
        }
    });
}

export { modifiedParent };
