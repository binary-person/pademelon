import { fakeToString } from './fakeToString';

type rewriteGetterReturnFunc = (returnValue: any) => any;
type rewriteSetterFunc = (setValue: any) => any;
type hookAfterGetterFunc = (returnValue: any, modifiedReturnValue: any) => void;
type hookAfterSetterFunc = (setterValue: any, modifiedSetterValue: any) => void;
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
 * @param hookAfterGetter - executed after call to original getter
 * @param hookAfterSetter - executed after call to original setter
 * @param preventCallToGetter
 * @param preventCallToSetter
 */
function rewriteGetterSetter<T extends object, K extends keyof T>(
    obj: T,
    prop: K,
    {
        rewriteGetter,
        rewriteSetter,
        hookAfterGetter,
        hookAfterSetter,
        preventCallToGetter,
        preventCallToSetter
    }: {
        rewriteGetter?: rewriteGetterReturnFunc;
        rewriteSetter?: rewriteSetterFunc;
        hookAfterGetter?: hookAfterGetterFunc;
        hookAfterSetter?: hookAfterSetterFunc;
        preventCallToGetter?: boolean;
        preventCallToSetter?: boolean;
    }
): void {
    if (
        !rewriteGetter &&
        !rewriteSetter &&
        !hookAfterGetter &&
        !hookAfterSetter &&
        preventCallToGetter === undefined &&
        preventCallToSetter === undefined
    ) {
        throw new TypeError('At least one of rewrites or hooks or flags must be set');
    }
    const propDescriptor = Object.getOwnPropertyDescriptor(obj, prop);
    if (!propDescriptor) {
        throw new TypeError('prop descriptor not defined. Is this a valid object?');
    }
    if (!propDescriptor.configurable) {
        throw new TypeError('target prop not configurable');
    }
    if (!propDescriptor.get && !propDescriptor.set) {
        throw new TypeError('target prop does not have a getter nor a setter');
    }

    if (propDescriptor.get && (rewriteGetter || hookAfterGetter)) {
        const originalGetter = propDescriptor.get;
        propDescriptor.get = function () {
            const originalReturnValue = originalGetter.call(this);
            const modifiedReturnValue = rewriteGetter
                ? preventCallToGetter
                    ? undefined
                    : rewriteGetter.call(this, originalReturnValue)
                : originalReturnValue;
            if (hookAfterGetter) hookAfterGetter.call(this, originalReturnValue, modifiedReturnValue);
            return modifiedReturnValue;
        };
        fakeToString(propDescriptor.get, prop.toString());
    }
    if (propDescriptor.set && (rewriteSetter || hookAfterSetter)) {
        const originalSetter = propDescriptor.set;
        propDescriptor.set = function (value: any) {
            const modifiedValue = rewriteSetter ? rewriteSetter.call(this, value) : value;
            if (!preventCallToSetter) originalSetter.call(this, modifiedValue);
            if (hookAfterSetter) hookAfterSetter.call(this, value, modifiedValue);
        };
        fakeToString(propDescriptor.set, prop.toString());
    }
    Object.defineProperty(obj, prop, propDescriptor);
}

export { rewriteGetterSetter };
