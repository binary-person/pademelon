import Pademelon = require('../../../worker-browser-module');
import { rewriteFunction } from '../../rewriteFunction';
import { rewriteGetterSetter } from '../../rewriteGetterSetter';

function rewriteWorkerWorkerLocationProto(pademelonInstance: Pademelon): void {
    const rewrittenLocation = new URL(pademelonInstance.unrewriteUrl().url);
    const propertiesToRewrite = [
        'hash',
        'host',
        'hostname',
        'href',
        'origin',
        'pathname',
        'port',
        'protocol',
        'search'
    ] as const;
    for (const eachProperty of propertiesToRewrite) {
        rewriteGetterSetter(self.WorkerLocation.prototype, eachProperty, {
            rewriteGetter() {
                return rewrittenLocation[eachProperty];
            }
        });
    }
    self.WorkerLocation.prototype.toString = rewriteFunction(self.WorkerLocation.prototype.toString, {
        interceptReturn() {
            return rewrittenLocation.href;
        }
    });
}

export { rewriteWorkerWorkerLocationProto };
