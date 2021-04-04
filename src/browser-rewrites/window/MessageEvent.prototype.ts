import Pademelon = require('../../browser-module');
import { rewriteGetterSetter } from '../rewriteGetterSetter';

function rewriteMessageEventProto(_pademelonInstance: Pademelon): void {
    let bypassDataRewrite = false;
    rewriteGetterSetter(MessageEvent.prototype, 'origin', {
        rewriteGetter(this: MessageEvent, returnValue: string) {
            bypassDataRewrite = true;
            if (typeof this.data === 'object' && 'pademelonOrigin' in this.data) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                returnValue = this.data.pademelonOrigin;
            } else {
                // only warn if message is not from a Worker (which in that case, origin is === '' anyway)
                if (!(this.target instanceof Worker))
                    console.warn(
                        'origin getter: cannot find pademelonOrigin in\n',
                        this.data,
                        '\nPlease file a report titled "postMessage message does not contain pademelonOrigin". This means that things may not work as expected'
                    );
            }
            bypassDataRewrite = false;
            return returnValue;
        }
    });
    rewriteGetterSetter(MessageEvent.prototype, 'data', {
        rewriteGetter(this: MessageEvent, returnValue: any) {
            if (bypassDataRewrite) return returnValue;
            if (typeof returnValue === 'object' && 'pademelonOrigin' in returnValue) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                return returnValue.message;
            } else {
                if (!(this.target instanceof Worker))
                    console.warn(
                        'data getter: cannot find pademelonOrigin in\n',
                        returnValue,
                        '\nPlease file a report titled "postMessage message does not contain pademelonOrigin". This means that things may not work as expected'
                    );
                return returnValue;
            }
        }
    });
}

export { rewriteMessageEventProto };
