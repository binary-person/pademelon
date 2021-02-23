import { generateModifiedWindow } from '.';
import Pademelon = require('../../browser-module');

function modifiedParent(
    pademelonInstance: Pademelon,
    modifiedProperties: object,
    targetWindow: Window,
    modifiedWindow: Window
): void {
    const parent =
        targetWindow === targetWindow.parent
            ? modifiedWindow
            : generateModifiedWindow(pademelonInstance, targetWindow.parent);
    Object.defineProperty(modifiedProperties, 'parent', {
        enumerable: true,
        value: parent
    });
}

export { modifiedParent };
