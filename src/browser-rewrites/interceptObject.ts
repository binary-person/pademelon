/**
 * used to rewrite properties that are configurable: false.
 * This is intended to be a wrapper for Proxy because it
 * doesn't allow one to return a changed property for configurable: false
 * properties
 */

type modifiedPropertiesType = { [modifyProperty: string]: any };
type bindCacheType = {
    [prop: string]: {
        originalFunc: () => void;
        bindedFunc: () => void;
    };
};
// a workaround for prettier and weird ide coloration
type mergeObj<A, B> = A & B;

const primitives = [Boolean, Number, String, BigInt, Symbol, Object] as const;
// Proxy: do not bind because it doesn't need to and the simple constructor check by checking
// the existence of a prototype property fails only with Proxy
const otherDoNotBindFuncs = [Proxy] as const;

// store a reference to toString because rewriteWindowFunction will overwrite Function, resulting
// in an infinite loop of referencing its own prototype property
const funcToString = Function.prototype.toString;

function doNotBindFunction(func: () => void): boolean {
    // needed in order to pass test262 unit tests
    if (func === Error || func instanceof Error || func.prototype instanceof Error) return true;

    // primitives don't care if they aren't binded to the window object, and also,
    // avoid binding them to pass test262 unit tests
    if (primitives.includes(func as any)) return true;

    if (otherDoNotBindFuncs.includes(func as any)) return true;

    // avoid binding because we need it to bind to the proxy object, not the real object,
    // as when the obj.func.call(obj) gets run, func's proxy apply trap can properly handle it
    // (which won't if we don't bind)
    // also, avoid caching a reference to otherDoNotBindFuncs because Function.prototype.call will
    // get modified and we want to grab the latest copy
    if (Function.prototype.call === func || Function.prototype.bind === func || Function.prototype.apply === func)
        return true;

    // the only reason we want to bind functions is some native functions on the window object
    // don't like it when they are called with the 'this' not binded to a window.
    // if we were to extend the binding to other functions created by the page's js,
    // we will create all sorts of problems
    if (!/\{\s+\[native code\]/.test(funcToString.call(func))) return true;

    return false;
}

function hasProperty(obj: any, prop: string | number | symbol) {
    return Object.prototype.hasOwnProperty.call(obj, prop);
}

function isEmptyObj(obj: any): boolean {
    return Object.keys(Object.getOwnPropertyDescriptors(obj)).length === 0;
}

function interceptObject<A extends any[], R, T extends (((...args: A) => R) & { new (...args: A): R }) | object>(
    targetObject: T,
    {
        modifiedProperties = {},
        parentObject,
        parentProxyObject,
        getHook = () => undefined,
        rewriteArgs,
        rewriteReturn,
        rewriteThis,
        useOriginalTarget = isEmptyObj(modifiedProperties)
    }: {
        modifiedProperties?: modifiedPropertiesType;
        parentObject?: any;
        parentProxyObject?: any;
        getHook?: (prop: string | number | symbol) => void;
        rewriteArgs?: (args: A, isConstructor: boolean) => A;
        rewriteReturn?: (returnValue: R, args: A, isConstructor: boolean) => R;
        rewriteThis?: (thisArg: any) => any;
        useOriginalTarget?: boolean;
    } = {}
): mergeObj<typeof modifiedProperties, T> {
    if (useOriginalTarget && !isEmptyObj(modifiedProperties)) {
        throw new TypeError('Cannot use original target and have a non-empty modifiedProperties');
    }

    const bindCache: bindCacheType = Object.create(null);

    /* eslint-disable @typescript-eslint/no-empty-function */
    const carbonCopy =
        typeof targetObject === 'function' ? (hasProperty(targetObject, 'prototype') ? function () {} : () => {}) : {};
    Object.setPrototypeOf(carbonCopy, targetObject);
    /* eslint-enable @typescript-eslint/no-empty-function */

    const proxyObject: any = new Proxy(useOriginalTarget ? targetObject : carbonCopy, {
        getPrototypeOf: () => Reflect.getPrototypeOf(targetObject),
        setPrototypeOf: (_target, prop) => Reflect.setPrototypeOf(targetObject, prop),
        isExtensible: () => Reflect.isExtensible(targetObject),
        preventExtensions: () => Reflect.preventExtensions(targetObject),
        defineProperty: (_target, prop, descriptor) => Reflect.defineProperty(targetObject, prop, descriptor),
        ownKeys: () => Reflect.ownKeys(targetObject),
        has: (_target, prop) => {
            getHook(prop);
            Reflect.getOwnPropertyDescriptor(proxyObject, prop);
            return Reflect.has(targetObject, prop);
        },
        construct: (_target, argArray, newTarget) => {
            const returnValue = Reflect.construct(
                targetObject as () => void,
                rewriteArgs ? rewriteArgs.call(undefined, argArray, true) : argArray,
                newTarget
            );
            if (rewriteReturn) return rewriteReturn.call(undefined, returnValue, argArray, true);
            return returnValue;
        },
        apply: (_target, thisArg, argArray) => {
            thisArg =
                parentObject && (!(thisArg || parentProxyObject) || thisArg === parentProxyObject)
                    ? parentObject
                    : thisArg;
            thisArg = rewriteThis ? rewriteThis(thisArg) : thisArg;
            const returnValue = Reflect.apply(
                targetObject as () => void,
                thisArg,
                rewriteArgs ? rewriteArgs.call(thisArg, argArray, false) : argArray
            );
            if (rewriteReturn) return rewriteReturn.call(thisArg, returnValue, argArray, false);
            return returnValue;
        },
        deleteProperty: (_target, prop: string) => {
            if (hasProperty(bindCache, prop)) {
                delete bindCache[prop];
            }
            if (hasProperty(carbonCopy, prop)) {
                Reflect.deleteProperty(carbonCopy, prop);
            }
            return Reflect.deleteProperty(targetObject, prop);
        },
        getOwnPropertyDescriptor(_target, prop) {
            if (useOriginalTarget) return Reflect.getOwnPropertyDescriptor(targetObject, prop);

            let desc: PropertyDescriptor | undefined;
            if (hasProperty(modifiedProperties, prop)) {
                desc = Reflect.getOwnPropertyDescriptor(modifiedProperties, prop);
            } else {
                desc = Reflect.getOwnPropertyDescriptor(targetObject, prop);
            }
            if (!desc) {
                return;
            }
            Reflect.defineProperty(carbonCopy, prop, desc);
            return Reflect.getOwnPropertyDescriptor(carbonCopy, prop);
        },
        get(_target: any, prop: string, receiver: any) {
            if (useOriginalTarget) return Reflect.get(targetObject, prop, receiver);

            getHook(prop);
            receiver = receiver === proxyObject ? targetObject : receiver;
            if (hasProperty(modifiedProperties, prop)) {
                return Reflect.get(modifiedProperties, prop, receiver);
            } else {
                let value = Reflect.get(targetObject, prop, receiver);

                if (typeof value === 'function' && !doNotBindFunction(value)) {
                    if (!(prop in bindCache) || bindCache[prop].originalFunc !== value) {
                        bindCache[prop] = {
                            originalFunc: value,
                            bindedFunc: interceptObject(value, {
                                parentObject: rewriteArgs || rewriteReturn ? proxyObject : targetObject,
                                parentProxyObject: proxyObject,
                                useOriginalTarget: false
                            })
                        };
                    }

                    value = bindCache[prop].bindedFunc;
                } else if (prop in bindCache) {
                    delete bindCache[prop];
                }

                const originalDesc = Reflect.getOwnPropertyDescriptor(targetObject, prop);
                if (originalDesc && !originalDesc.configurable && originalDesc.writable) {
                    Reflect.set(carbonCopy, prop, value);
                }
                return value;
            }
        },
        set(_target: any, prop: string, value, receiver: any) {
            if (useOriginalTarget) Reflect.set(targetObject, prop, value, receiver);

            receiver = receiver === proxyObject ? targetObject : receiver;
            if (hasProperty(modifiedProperties, prop)) {
                return Reflect.set(modifiedProperties, prop, value);
            }
            return Reflect.set(targetObject, prop, value);
        }
    });
    // force cache all of non-configurable objects and add them to carbonCopy
    const descs = Object.assign(
        Object.getOwnPropertyDescriptors(targetObject),
        Object.getOwnPropertyDescriptors(modifiedProperties)
    );
    for (const eachProp in descs) {
        if (descs[eachProp] && !descs[eachProp].configurable && descs[eachProp].value) {
            const value = Reflect.get(proxyObject, eachProp);
            descs[eachProp].value = value;
            Reflect.defineProperty(carbonCopy, eachProp, descs[eachProp]);
        }
    }
    return proxyObject;
}

export { interceptObject };
