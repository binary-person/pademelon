/**
 * @jest-environment jsdom
 */

import { generateModifiedWindow } from '.';
import Pademelon = require('../../browser-module');

describe('modifiedRecursiveWindow', () => {
    const pademelonInstance = new Pademelon({
        hostname: 'localhost',
        pathnamePrefix: '/prefix/',
        windowProp: 'pademelonInstance',
        useHttp: true
    });
    const modifiedWindow = generateModifiedWindow(pademelonInstance);

    it('should have window recursion', () => {
        expect(modifiedWindow.window).toBe(modifiedWindow);
        expect(modifiedWindow.window).toBe(modifiedWindow.window.window);
    });
});
