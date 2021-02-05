/**
 * used to rewrite properties that are configurable: false.
 * This is intended to be a wrapper for Proxy because it
 * doesn't allow one to return a changed property for configurable: false
 * properties
 */

import { bindFunctionObject } from './bindFunctionObject';

type modifiedPropertiesType = { [modifyProperty: string]: any };
type bindCacheType = {
    [prop: string]: {
        originalFunc: () => void;
        bindedFunc: () => void;
    };
};

function isPropWritable(obj: any, propToWrite: any): boolean {
    const desc = Object.getOwnPropertyDescriptor(obj, propToWrite);
    if (!desc || desc.set || desc.writable) {
        return true;
    }
    return false;
}

function interceptObject(targetObject: any, modifiedProperties: modifiedPropertiesType, proxyTarget?: any) {
    const bindCache: bindCacheType = Object.create(null);
    const carbonCopy = proxyTarget ? proxyTarget : Object.create(targetObject);
    return new Proxy(carbonCopy, {
        isExtensible: function (_target) {
            return Object.isExtensible(targetObject);
        },
        preventExtensions: function (_target) {
            return Object.preventExtensions(targetObject);
        },
        defineProperty: function (_target, property, descriptor) {
            return Object.defineProperty(targetObject, property, descriptor);
        },
        has: function (_target, prop) {
            return prop in targetObject;
        },
        deleteProperty: function (_target, prop: string) {
            if (prop in bindCache) {
                delete bindCache[prop];
            }
            if (carbonCopy.hasOwnProperty(prop)) {
                delete carbonCopy[prop];
            }
            return delete targetObject[prop];
        },
        ownKeys: function (_target) {
            return Reflect.ownKeys(targetObject);
        },
        getOwnPropertyDescriptor: function (_target, prop) {
            let desc: PropertyDescriptor | undefined;
            if (modifiedProperties.hasOwnProperty(prop)) {
                desc = Object.getOwnPropertyDescriptor(modifiedProperties, prop);
            } else {
                desc = Object.getOwnPropertyDescriptor(targetObject, prop);
            }
            if (!desc) {
                return;
            }
            Object.defineProperty(carbonCopy, prop, desc);
            return desc;
        },
        get(_target: any, prop: string) {
            if (modifiedProperties.hasOwnProperty(prop)) {
                return modifiedProperties[prop];
            } else {
                if (typeof targetObject[prop] === 'function') {
                    if (!(prop in bindCache) || bindCache[prop].originalFunc !== targetObject[prop]) {
                        bindCache[prop] = {
                            originalFunc: targetObject[prop],
                            bindedFunc: bindFunctionObject(targetObject, targetObject[prop])
                        };
                    }
                    return bindCache[prop].bindedFunc;
                } else if (prop in bindCache) {
                    delete bindCache[prop];
                }
                return targetObject[prop];
            }
        },
        set(_target: any, prop: string, value) {
            if (modifiedProperties.hasOwnProperty(prop)) {
                if (!isPropWritable(modifiedProperties, prop)) return false;
                modifiedProperties[prop] = value;
                return true;
            }
            if (!isPropWritable(targetObject, prop)) return false;
            targetObject[prop] = value;
            return true;
        }
    });
}

export { interceptObject };
