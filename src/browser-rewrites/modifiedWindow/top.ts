import { generateModifiedWindow } from '.';
import Pademelon = require('../../browser-module');

function modifiedTop(
    pademelonInstance: Pademelon,
    modifiedProperties: object,
    targetWindow: Window,
    modifiedWindow: Window
): void {
    const top =
        targetWindow === targetWindow.top
            ? modifiedWindow
            : generateModifiedWindow(pademelonInstance, targetWindow.top);
    Object.defineProperty(modifiedProperties, 'top', {
        enumerable: true,
        value: top
    });
}

export { modifiedTop };
