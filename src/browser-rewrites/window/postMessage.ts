import Pademelon = require('../../browser-module');
import { rewriteFunction } from '../rewriteFunction';

function rewritePostMessage(pademelonInstance: Pademelon): void {
    window.postMessage = rewriteFunction(window.postMessage, {
        interceptArgs(_, message: any, targetOrigin: string, transfer?: any) {
            const selfOrigin = pademelonInstance.modifiedWindow.location.origin;
            try {
                if (targetOrigin === '*' || selfOrigin === new URL(targetOrigin).origin) {
                    // replicate behavior of a real postMessage function: refuse to postMessage if targetOrigin != selfOrigin
                    return [{ pademelonOrigin: targetOrigin, message }, window.location.origin, transfer] as const;
                } else {
                    return [null, (null as unknown) as string] as const; // dirty hack for disregarding postMessage call
                }
            } catch (e) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                if (e.message !== "Failed to construct 'URL': Invalid URL") throw e;
                return [null, (null as unknown) as string] as const;
            }
        }
    });
}

export { rewritePostMessage };
