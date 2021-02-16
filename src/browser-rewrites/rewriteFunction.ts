import { interceptObject } from './interceptObject';

type rewriteFuncParams = (originalFunc: (...args: any[]) => void, ...args: any[]) => any[];
type rewriteReturnParams = (originalFunc: (...args: any[]) => void, originalReturnValue: any, ...args: any[]) => any;
type hookAfterCallFunc = (originalFunc: (...args: any[]) => void, returnValue: any, ...args: any[]) => void;
type objRewriteType = { [key: string]: any };

/**
 *
 * @param obj - property's object to rewrite
 * @param prop - property to rewrite
 * @param useNew - whether the target rewritten function should be called with 'new'
 * @param interceptArgs - interceptArgs gets executed and its array return value will be used to replace
 * the args that will be passed on to the original function.
 * @param interceptReturn - after the function call, its return value will be passed to interceptReturn
 * to rewrite the return value along with original args. this parameter is optional
 * @param hookAfterCall - gets called after everything
 */
function rewriteFunction(
    obj: objRewriteType,
    prop: string,
    useNew: boolean,
    {
        interceptArgs,
        interceptReturn,
        hookAfterCall
    }: {
        interceptArgs?: rewriteFuncParams;
        interceptReturn?: rewriteReturnParams;
        hookAfterCall?: hookAfterCallFunc;
    }
) {
    if (typeof obj[prop] !== 'function') {
        throw new TypeError(obj + '[' + prop + '] is not a function');
    }
    if (!interceptArgs && !interceptReturn && !hookAfterCall) {
        throw new TypeError('At least one of the functions must be defined');
    }
    const originalFunc = obj[prop];

    obj[prop] = interceptObject(originalFunc, {
        rewriteArgs(args) {
            return interceptArgs ? interceptArgs.call(this, originalFunc.bind(this), ...args) : args;
        },
        rewriteReturn(returnValue, args) {
            if (interceptReturn) return interceptReturn.call(this, originalFunc.bind(this), returnValue, ...args);
            return returnValue;
        },
        parentObject: obj
    });
}

export { rewriteFunction, objRewriteType };
