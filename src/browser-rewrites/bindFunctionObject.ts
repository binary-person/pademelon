/**
 * functions intercepted and returned by Proxy are not properly
 * binded, and thus, cause an Invocation error. Binding the function
 * works but does not do a good job of copying its properties over
 * (like Date.now, for example), but one cannot simply copy over the
 * properties to the binded function like this:
 * Object.defineProperties(bindedFunc, Object.getOwnPropertyDescriptors(targetObject[prop]));
 * because then code running bindedFunc.prototype = {} cannot set their
 * objects (since its being set on the binded func copy, not the actual one).
 * This solves the issues by proxying the function, and intercepting and
 * redirecting the getter and setter property calls appropriately
 */

function bindFunctionObject(bindThis: any, targetFunction: (...args: any[]) => any) {
    const bindedFunc = targetFunction.bind(bindThis);
    return new Proxy(bindedFunc, {
        has(_target, prop) {
            return prop in targetFunction;
        },
        get(_target, prop) {
            return targetFunction[prop];
        },
        set(_target, prop, value) {
            const targetSetterDesc = Object.getOwnPropertyDescriptor(targetFunction, prop);
            if (!targetSetterDesc || targetSetterDesc.writable) {
                targetFunction[prop] = value;
                return true;
            }
            return false;
        }
    });
}

export { bindFunctionObject };
