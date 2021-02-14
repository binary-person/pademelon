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

const primitives = [Boolean, Number, String, BigInt, Symbol, Object];

function doNotBindFunction(func: any): boolean {
    if (func === Error || func instanceof Error || func.prototype instanceof Error) return true;
    // primitives don't care if they aren't binded to the window object, and also,
    // avoid binding them to pass test262 unit tests
    if (primitives.includes(func)) return true;
    // the only reason we want to bind functions is some native functions on the window object
    // don't like it when they are called with the 'this' not binded to a window.
    // if we were to extend the binding to other functions created by the page's js,
    // we will create all sorts of problems
    if (!/\{\s+\[native code\]/.test(Function.prototype.toString.call(func))) return true;
    return false;
}

function hasProperty(obj: any, prop: string | number | symbol) {
    return Object.prototype.hasOwnProperty.call(obj, prop);
}

function interceptObject(
    targetObject: any,
    modifiedProperties: modifiedPropertiesType,
    {
        parentObject,
        parentProxyObject,
        getHook
    }: { parentObject?: any; parentProxyObject?: any; getHook?: (prop: string | number | symbol) => void } = {}
): any {
    const bindCache: bindCacheType = Object.create(null);

    // tslint:disable
    const carbonCopy = typeof targetObject === 'function' ? function () {} : {};
    if (!hasProperty(targetObject, 'prototype')) Reflect.deleteProperty(targetObject, 'prototype');
    Object.setPrototypeOf(carbonCopy, targetObject);
    // tslint:enable

    const proxyObject: any = new Proxy(carbonCopy, {
        getPrototypeOf: () => Reflect.getPrototypeOf(targetObject),
        setPrototypeOf: (_target, prop) => Reflect.setPrototypeOf(targetObject, prop),
        construct: (_target, argArray, newTarget) => Reflect.construct(targetObject, argArray, newTarget),
        isExtensible: () => Reflect.isExtensible(targetObject),
        preventExtensions: () => Reflect.preventExtensions(targetObject),
        defineProperty: (_target, prop, descriptor) => Reflect.defineProperty(targetObject, prop, descriptor),
        ownKeys: () => Reflect.ownKeys(targetObject),
        has: (_target, prop) => {
            if (typeof getHook === 'function') getHook(prop);
            return Reflect.has(targetObject, prop);
        },
        apply: (_target, thisArg, argArray) => {
            return Reflect.apply(
                targetObject,
                parentObject && (!(thisArg || parentProxyObject) || thisArg === parentProxyObject)
                    ? parentObject
                    : thisArg,
                argArray
            );
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
            return desc;
        },
        get(_target: any, prop: string, receiver: any) {
            if (typeof getHook === 'function') getHook(prop);
            receiver = receiver === proxyObject ? targetObject : receiver;
            if (hasProperty(modifiedProperties, prop)) {
                return Reflect.get(modifiedProperties, prop, receiver);
            } else {
                const value = Reflect.get(targetObject, prop, receiver);

                if (typeof value === 'function' && !doNotBindFunction(value)) {
                    if (!(prop in bindCache) || bindCache[prop].originalFunc !== value) {
                        bindCache[prop] = {
                            originalFunc: value,
                            bindedFunc: interceptObject(
                                value,
                                {},
                                {
                                    parentObject: targetObject,
                                    parentProxyObject: proxyObject
                                }
                            )
                        };
                    }
                    return bindCache[prop].bindedFunc;
                } else if (prop in bindCache) {
                    delete bindCache[prop];
                }
                return value;
            }
        },
        set(_target: any, prop: string, value, receiver: any) {
            receiver = receiver === proxyObject ? targetObject : receiver;
            if (hasProperty(modifiedProperties, prop)) {
                return Reflect.set(modifiedProperties, prop, value);
            }
            return Reflect.set(targetObject, prop, value);
        }
    });
    return proxyObject;
}

export { interceptObject };
