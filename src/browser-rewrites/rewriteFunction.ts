import { interceptObject } from './interceptObject';

// primarily handles type issues
function toBindOrNotToBind<F, T>(isConstructor: boolean, func: F, thisArg: T) {
    if (!isConstructor && typeof func === 'function') {
        return func.bind(thisArg);
    }
    return func;
}

/**
 *
 * @param obj - property's object to rewrite
 * @param prop - property to rewrite
 * @param interceptArgs - interceptArgs gets executed and its array return value will be used to replace
 * the args that will be passed on to the original function.
 * @param interceptReturn - after the function call, its return value will be passed to interceptReturn
 * to rewrite the return value along with original args. this parameter is optional
 * @param hookAfterCall - gets called after everything but before the actual return (quite frankly
 * impossible to do unless one uses setTimeout)
 */
function rewriteFunction<A extends any[], R, F extends ((...args: A) => R) | { new (...args: A): R }>(
    func: F,
    {
        interceptArgs,
        interceptReturn,
        hookAfterCall
    }: {
        interceptArgs?: (originalFunc: F, ...args: A) => Readonly<A>;
        interceptReturn?: (originalFunc: F, originalReturnValue: R, ...args: A) => R;
        hookAfterCall?: (originalFunc: F, returnValue: R, ...args: A) => void;
    }
): F {
    if (typeof func !== 'function') {
        throw new TypeError(func + ' is not a function');
    }
    if (!interceptArgs && !interceptReturn && !hookAfterCall) {
        throw new TypeError('At least one of the functions must be defined');
    }
    const originalFunc = func;

    return interceptObject(originalFunc, {
        rewriteArgs(args: A, isConstructor) {
            return interceptArgs
                ? interceptArgs.call(this, toBindOrNotToBind(isConstructor, originalFunc, this), ...args)
                : args;
        },
        rewriteReturn(returnValue: R, args: A, isConstructor) {
            if (interceptReturn)
                returnValue = interceptReturn.call(
                    this,
                    toBindOrNotToBind(isConstructor, originalFunc, this),
                    returnValue,
                    ...args
                );
            if (hookAfterCall)
                hookAfterCall(toBindOrNotToBind(isConstructor, originalFunc, this), returnValue, ...args);
            return returnValue;
        }
    });
}

export { rewriteFunction };
