import Pademelon = require('../../browser-module');
import { rewriteGetterSetter } from '../rewriteGetterSetter';

type urlPropsType = 'host' | 'hostname' | 'origin' | 'pathname' | 'port';

function rewriteAnchorUrlAttr(pademelonInstance: Pademelon, urlProp: urlPropsType) {
    let hookAfterSetter;
    if (urlProp !== 'origin') {
        // origin is read-only
        hookAfterSetter = function (this: HTMLAnchorElement, setValue: string) {
            try {
                const url = new URL(this.href); // url already unrewritten by HTMLElementsAttribute.ts
                url[urlProp] = setValue;
                this.href = url.href;
            } catch (e) {}
        };
    }
    rewriteGetterSetter(HTMLAnchorElement.prototype, urlProp, {
        rewriteGetter(this: HTMLAnchorElement, returnValue: string) {
            try {
                return new URL(pademelonInstance.unrewriteUrl(this.href).url)[urlProp];
            } catch (e) {
                return returnValue;
            }
        },
        preventCallToSetter: true,
        hookAfterSetter
    });
}

function rewriteAnchorElementProto(pademelonInstance: Pademelon): void {
    const urlProps: urlPropsType[] = ['host', 'hostname', 'origin', 'pathname', 'port'];
    urlProps.forEach((prop) => rewriteAnchorUrlAttr(pademelonInstance, prop));
}

export { rewriteAnchorElementProto };
