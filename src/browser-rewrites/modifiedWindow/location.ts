import Pademelon = require('../../browser-module');
import { interceptObject } from '../interceptObject';

function modifiedLocation(pademelonInstance: Pademelon, modifiedWindow: object) {
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
                return new URL(pademelonInstance.unrewriteUrl(window.location.href).url)[typedEachProp];
            },
            set(value) {
                // non refresh triggering props
                if (typedEachProp === 'hash' || typedEachProp === 'search') {
                    window.location[typedEachProp] = value;
                } else {
                    let unrewrittenUrl: URL;
                    if (typedEachProp === 'href') {
                        unrewrittenUrl = new URL(value, pademelonInstance.unrewriteUrl().url);
                    } else {
                        unrewrittenUrl = new URL(pademelonInstance.unrewriteUrl().url);
                        unrewrittenUrl[typedEachProp] = value;
                    }
                    window.location.href = pademelonInstance.rewriteUrl(unrewrittenUrl.href);
                }
            }
        });
    }
    Object.defineProperties(modifiedLocationProps, {
        assign: {
            enumerable: true,
            value: (url: string) => window.location.assign(pademelonInstance.rewriteUrl(url))
        },
        replace: {
            enumerable: true,
            value: (url: string) => window.location.replace(pademelonInstance.rewriteUrl(url))
        },
        toString: {
            enumerable: true,
            value: () => modifiedLocationProps.href
        }
    });

    const locationObj = interceptObject(window.location, modifiedLocationProps);

    // handle page code running window.location's setter like this: window.location = "newlocation"
    Object.defineProperty(modifiedWindow, 'location', {
        enumerable: true,
        get() {
            return locationObj;
        },
        set(value) {
            window.location.href = pademelonInstance.rewriteUrl(value.toString());
        }
    });
}

export { modifiedLocation };
