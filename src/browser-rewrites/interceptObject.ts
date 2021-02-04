/**
 * used to rewrite properties that are configurable: false.
 * This is intended to be a wrapper for Proxy because it
 * doesn't allow one to return a changed property for configurable: false
 * properties
 */

import { bindFunctionObject } from './bindFunctionObject';

type modifiedPropertiesType = { [modifyProperty: string]: any };

function isPropWritable(obj: any, propToWrite: any): boolean {
    const desc = Object.getOwnPropertyDescriptor(obj, propToWrite);
    if (!desc || desc.set || desc.writable) {
        return true;
    }
    return false;
}

function interceptObject(targetObject: any, modifiedProperties: modifiedPropertiesType) {
    // force "any" type on targetObject to get webpack to stop screaming about
    // "Element implicitly has an 'any' type because expression of type 'string | number | symbol' can't be used to index type '{}'."
    const carbonCopy = Object.create(targetObject);
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
        deleteProperty: function (_target, property) {
            return delete targetObject[property];
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
                    return bindFunctionObject(targetObject, targetObject[prop]);
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

export { interceptObject, isPropWritable };
