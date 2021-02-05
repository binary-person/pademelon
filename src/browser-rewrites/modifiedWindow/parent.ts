import { generateModifiedWindow } from '.';
import Pademelon = require('../../browser-module');

function modifiedParent(pademelonInstance: Pademelon, modifiedWindow: object, targetWindow: Window) {
    Object.defineProperty(modifiedWindow, 'parent', {
        enumerable: true,
        get() {
            return generateModifiedWindow(pademelonInstance, targetWindow.parent);
        }
    });
}

export { modifiedParent };
