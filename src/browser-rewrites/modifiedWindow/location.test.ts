/**
 * @jest-environment jsdom
 */

import { generateModifiedWindow } from '.';
import Pademelon = require('../../browser-module');

const defaultLocationUrl = 'http://localhost/prefix/https://proxiedsite.com/';

describe('modifiedLocation and modifiedDocument', () => {
    let locationState = new URL(defaultLocationUrl);
    Object.defineProperty(window, 'location', { value: {} });
    Object.defineProperties(window.location, {
        href: {
            get() {
                return locationState.href;
            },
            set(value: string) {
                locationState = new URL(value, locationState.href);
            }
        },
        pathname: {
            get() {
                return locationState.pathname;
            },
            set(value: string) {
                locationState.pathname = value;
            }
        },
        assign: {
            value(url: string) {
                window.location.href = url;
            }
        },
        replace: {
            value(url: string) {
                window.location.href = url;
            }
        },
        toString: {
            value() {
                return;
            }
        }
    });
    beforeEach(() => {
        window.location.href = 'http://localhost/prefix/https://proxiedsite.com/';
    });
    afterEach(() => {
        window.location.href = 'http://localhost/prefix/https://proxiedsite.com/';
    });

    const pademelonInstance = new Pademelon({
        hostname: 'localhost',
        pathnamePrefix: '/prefix/',
        windowProp: 'pademelonInstance',
        useHttp: true
    });
    const modifiedWindow = generateModifiedWindow(pademelonInstance);

    it("should rewrite document.location's href getter", () => {
        expect(modifiedWindow.document.location.href).toEqual('https://proxiedsite.com/');
    });
    it('should rewrite href getter', () => {
        expect(modifiedWindow.location.href).toEqual('https://proxiedsite.com/');
    });
    it('should rewrite href setter', () => {
        modifiedWindow.location.href = '/asset.png';
        expect(window.location.href).toEqual('http://localhost/prefix/https://proxiedsite.com/asset.png');
    });
    it('should rewrite assign', () => {
        modifiedWindow.location.assign('/asset.png');
        expect(window.location.href).toEqual('http://localhost/prefix/https://proxiedsite.com/asset.png');
    });
    it('should rewrite replace', () => {
        modifiedWindow.location.assign('/asset.png');
        expect(window.location.href).toEqual('http://localhost/prefix/https://proxiedsite.com/asset.png');
    });
    it('should rewrite toString', () => {
        expect(modifiedWindow.location.toString()).toEqual('https://proxiedsite.com/');
    });
});
