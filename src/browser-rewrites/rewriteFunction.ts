import { fakeToString } from './fakeToString';

type rewriteFuncParams = (originalFunc: (...args: any[]) => void, ...args: any[]) => any[] | void;
type rewriteReturnParams = (originalFunc: (...args: any[]) => void, originalReturnValue: any, ...args: any[]) => any;
type objRewriteType = { [key: string]: any };

/**
 *
 * @param obj - property's object to rewrite
 * @param prop - property to rewrite
 * @param useNew - whether the target rewritten function should be called with 'new'
 * @param interceptArgs - interceptArgs gets executed and its array return value will be used to replace
 * the args that will be passed on to the original function. If undefined or falsy, the original args
 * will be used instead
 * @param interceptReturn - after the function call, its return value will be passed to interceptReturn
 * to rewrite the return value along with original args. this parameter is optional
 */
function rewriteFunction(
    obj: objRewriteType,
    prop: string,
    useNew: boolean,
    interceptArgs: rewriteFuncParams,
    interceptReturn?: rewriteReturnParams,
) {
    if (typeof obj[prop] === 'function') {
        const originalFunc = obj[prop];
        obj[prop] = function (...args: any[]) {
            args = interceptArgs.call(this, originalFunc.bind(this), ...args) || args;
            let returnValue: any;
            if (useNew) {
                returnValue = new originalFunc(...args);
            } else {
                returnValue = originalFunc.apply(this, args);
            }
            if (typeof interceptReturn === 'function') {
                return interceptReturn.call(this, originalFunc.bind(this), returnValue, ...args);
            } else {
                return returnValue;
            }
        };
        Object.defineProperties(obj[prop], Object.getOwnPropertyDescriptors(originalFunc));
        fakeToString(obj[prop], prop);
    }
}

export { rewriteFunction, objRewriteType };
