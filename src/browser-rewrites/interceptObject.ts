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

function hasProperty(obj: any, prop: string | number | symbol) {
    return Object.prototype.hasOwnProperty.call(obj, prop);
}

function interceptObject(
    targetObject: any,
    modifiedProperties: modifiedPropertiesType,
    parentObject?: any,
    parentProxyObject?: any
): any {
    const bindCache: bindCacheType = Object.create(null);

    // tslint:disable-next-line
    const carbonCopy = typeof targetObject === 'function' ? function () {} : {};
    Object.setPrototypeOf(carbonCopy, targetObject);

    const proxyObject = new Proxy(carbonCopy, {
        getPrototypeOf: () => Reflect.getPrototypeOf(targetObject),
        setPrototypeOf: (_target, prop) => Reflect.setPrototypeOf(targetObject, prop),
        construct: (_target, argArray, newTarget) => Reflect.construct(targetObject, argArray, newTarget),
        isExtensible: () => Reflect.isExtensible(targetObject),
        preventExtensions: () => Reflect.preventExtensions(targetObject),
        defineProperty: (_target, prop, descriptor) => Reflect.defineProperty(targetObject, prop, descriptor),
        has: (_target, prop) => Reflect.has(targetObject, prop),
        ownKeys: () => Reflect.ownKeys(targetObject),
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
            receiver = receiver === proxyObject ? targetObject : receiver;
            if (hasProperty(modifiedProperties, prop)) {
                return Reflect.get(modifiedProperties, prop, receiver);
            } else {
                const value = Reflect.get(targetObject, prop, receiver);
                if (typeof value === 'function') {
                    if (!(prop in bindCache) || bindCache[prop].originalFunc !== value) {
                        bindCache[prop] = {
                            originalFunc: value,
                            bindedFunc: interceptObject(value, {}, targetObject, proxyObject)
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
