import Pademelon = require('../../../worker-browser-module');
import { rewriteGetterSetter } from '../../rewriteGetterSetter';

function rewriteWorkerResponse(pademelonInstance: Pademelon): void {
    rewriteGetterSetter(self.Response.prototype, 'url', {
        rewriteGetter: (returnValue: string) => {
            if (returnValue) {
                returnValue = pademelonInstance.unrewriteUrl(returnValue).url;
            }
            return returnValue;
        }
    });
}

export { rewriteWorkerResponse };
