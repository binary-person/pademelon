import Pademelon = require('../../browser-module');
import { fakeToString } from '../fakeToString';
import { interceptObject } from '../interceptObject';

function modifiedLocation(pademelonInstance: Pademelon, modifiedWindow: object, targetWindow: Window) {
    const modifiedLocationProps: any = {};
    const getterSetterUrlProps = ['hash', 'host', 'hostname', 'href', 'pathname', 'port', 'protocol', 'search'];

    for (const eachProp of getterSetterUrlProps) {
        const typedEachProp = eachProp as
            | 'hash'
            | 'host'
            | 'hostname'
            | 'href'
            | 'pathname'
            | 'port'
            | 'protocol'
            | 'search';
        Object.defineProperty(modifiedLocationProps, eachProp, {
            get() {
                return new URL(pademelonInstance.unrewriteUrl(targetWindow.location.href).url)[typedEachProp];
            },
            set(value) {
                // non refresh triggering props
                if (typedEachProp === 'hash' || typedEachProp === 'search') {
                    targetWindow.location[typedEachProp] = value;
                } else {
                    let unrewrittenUrl: URL;
                    if (typedEachProp === 'href') {
                        unrewrittenUrl = new URL(value, pademelonInstance.unrewriteUrl().url);
                    } else {
                        unrewrittenUrl = new URL(pademelonInstance.unrewriteUrl().url);
                        unrewrittenUrl[typedEachProp] = value;
                    }
                    targetWindow.location.href = pademelonInstance.rewriteUrl(unrewrittenUrl.href);
                }
            }
        });
    }
    Object.defineProperties(modifiedLocationProps, {
        assign: {
            enumerable: true,
            value: fakeToString(
                (url: string) => targetWindow.location.assign(pademelonInstance.rewriteUrl(url)),
                'assign'
            )
        },
        replace: {
            enumerable: true,
            value: fakeToString(
                (url: string) => targetWindow.location.replace(pademelonInstance.rewriteUrl(url)),
                'replace'
            )
        },
        toString: {
            enumerable: true,
            value: () => modifiedLocationProps.href
        }
    });

    const locationObj = interceptObject(targetWindow.location, { modifiedProperties: modifiedLocationProps });

    // handle page code running targetWindow.location's setter like this: targetWindow.location = "newlocation"
    Object.defineProperty(modifiedWindow, 'location', {
        enumerable: true,
        get() {
            return locationObj;
        },
        set(value) {
            targetWindow.location.href = pademelonInstance.rewriteUrl(value.toString());
        }
    });
}

export { modifiedLocation };
