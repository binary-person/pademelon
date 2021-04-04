import Pademelon = require('../../browser-module');
import { typeToMod } from '../../mod';
import { rewriteFunction } from '../rewriteFunction';

function rewriteWorker(pademelonInstance: Pademelon): void {
    if (window.Worker)
        // jest's jsdom tester doesn't have Worker
        window.Worker = rewriteFunction(window.Worker, {
            interceptArgs(_, url: string, options?: object) {
                url = url.toString();
                const currentOrigin = pademelonInstance.modifiedWindow.location.origin;
                let urlOrigin = null;

                try {
                    urlOrigin = new URL(url).origin;
                } catch (e) {}
                if (urlOrigin && urlOrigin !== currentOrigin) {
                    throw new DOMException(
                        `Failed to construct 'Worker': Script at '${url}' cannot be accessed from origin '${currentOrigin}'.`
                    );
                }

                return [pademelonInstance.rewriteUrl(url, undefined, typeToMod('webworker')), options] as const;
            }
        });
}

export { rewriteWorker };
