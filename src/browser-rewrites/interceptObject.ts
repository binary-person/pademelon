/**
 * used to rewrite properties that are configurable: false.
 * This is intended to be a wrapper for Proxy because it
 * doesn't allow one to return a changed property for configurable: false
 * properties
 */

type modifiedPropertiesType = { [modifyProperty: string]: any };

function interceptObject(targetObject: any, modifiedProperties: modifiedPropertiesType) {
    // force "any" type on targetObject to get webpack to stop screaming about
    // "Element implicitly has an 'any' type because expression of type 'string | number | symbol' can't be used to index type '{}'."
    return new Proxy(Object.create(targetObject), {
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
            const descriptor = Object.getOwnPropertyDescriptor(targetObject, prop);
            if (descriptor) {
                // Proxy throws error if targetObject's configurable and Proxy's target configurable are different
                descriptor.configurable = true;
            }
            return descriptor;
        },
        get(_target: any, prop: string) {
            if (prop in modifiedProperties) {
                return modifiedProperties[prop];
            } else {
                if (typeof targetObject[prop] === 'function') {
                    const bindedFunc = targetObject[prop].bind(targetObject);
                    // copy all static methods to handle function objects like Date
                    Object.defineProperties(bindedFunc, Object.getOwnPropertyDescriptors(targetObject[prop]));
                    return bindedFunc;
                }
                return targetObject[prop];
            }
        },
        set(_target: any, prop: string, value) {
            try {
                if (prop in modifiedProperties) {
                    modifiedProperties[prop] = value;
                } else {
                    targetObject[prop] = value;
                }
            } catch (e) {
                if (e instanceof TypeError && e.message.includes('read only')) {
                    return false;
                } else {
                    throw e;
                }
            }
            return true;
        }
    });
}

export { interceptObject };
