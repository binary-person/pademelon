import { fakeToString } from './fakeToString';
import { objRewriteType } from './rewriteFunction';

type rewriteGetterReturnFunc = (returnValue: any) => any;
type rewriteSetterFunc = (setValue: any) => void;

/**
 *
 * @param obj - property's object to rewrite
 * @param prop - property to rewrite
 * @param rewriteGetter - original getter function will be called first, then its return value
 * will be intercepted by rewriteGetter and rewriteGetter's return value will be passed onto the
 * caller. If originalGetter doesn't exist, nothing will happen. If !rewriteGetter, the original
 * getter will be used instead
 * @param rewriteSetter - rewriteSetter will be called with setValue passed as a param. rewriteSetter's
 * return value will be passed onto the original setter. If originalSetter doesn't exist, nothing will
 * happen. If !rewriteSetter, the original setter will be used instead
 */
function rewriteGetterSetter(
    obj: objRewriteType,
    prop: string,
    rewriteGetter?: rewriteGetterReturnFunc,
    rewriteSetter?: rewriteSetterFunc,
) {
    if (!rewriteGetter && !rewriteSetter) {
        throw new Error('At least one of the getter setter rewrites must be set');
    }
    const propDescriptor = Object.getOwnPropertyDescriptor(obj, prop);
    if (!propDescriptor) {
        throw new Error('prop descriptor not defined. Is this a valid object?');
    }
    if (!propDescriptor.configurable) {
        throw new Error('target prop not configurable');
    }
    if (!propDescriptor.get && !propDescriptor.set) {
        throw new Error('target prop does not have a getter nor a setter');
    }
    if (rewriteGetter && propDescriptor.get) {
        const originalGetter = propDescriptor.get;
        propDescriptor.get = function () {
            return rewriteGetter.call(this, originalGetter.call(this));
        };
        fakeToString(propDescriptor.get, prop);
    }
    if (rewriteSetter && propDescriptor.set) {
        const originalSetter = propDescriptor.set;
        propDescriptor.set = function (value: any) {
            originalSetter.call(this, rewriteSetter.call(this, value));
        };
        fakeToString(propDescriptor.set, prop);
    }
    Object.defineProperty(obj, prop, propDescriptor);
}

export { rewriteGetterSetter };
