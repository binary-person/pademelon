/**
 * 'intercepting properties' is to be carried out in the following format:
 * in 'describe':
 * three sets of 'it'
 * 1. have two sets of expect statements. The first testing
 *    the globalObj and the second testing the interceptedObject
 * 2. same thing as above but after modification to globalObj
 * 3. same thing as above but after modification to interceptedObject
 *
 * goal here is to make sure the behavior of both objects are the same.
 * *test format exception for testing setters
 *
 *
 * 'mirror properties'
 * in 'describe':
 * two sets of 'it'
 * 1. do modification to globalObj and check for sameness
 * 2. do modification to interceptedObj and check for sameness
 *
 * these are general guidelines. there may be test sets that don't follow this
 * format
 */

import { interceptObject } from './interceptObject';

type anyObjType = { [key: string]: any };

describe('interceptObject', () => {
    // globalObj represents window
    // interceptedObj represents pademelonInstance.modifiedWindow
    describe('intercepting properties', () => {
        const globalObj: anyObjType = {};

        describe('immutable value', () => {
            Object.defineProperty(globalObj, 'immutableValue', {
                value: 'unmodifiedValue'
            });
            const modifiedProperties = {};
            Object.defineProperty(modifiedProperties, 'immutableValue', {
                value: 'modifiedValue'
            });
            const interceptedObj = interceptObject(globalObj, modifiedProperties);

            it('globalObj holds unmodifiedValue and interceptedObj holds modifiedValue', () => {
                expect(globalObj.immutableValue).toEqual('unmodifiedValue');
                expect(interceptedObj.immutableValue).toEqual('modifiedValue');
            });
            it('after modifying globalObj, throws error, and globalObj holds unmodifiedValue and interceptedObject holds modifiedValue', () => {
                expect(() => (globalObj.immutableValue = 'something else')).toThrowError(
                    'Cannot assign to read only property'
                );

                expect(globalObj.immutableValue).toEqual('unmodifiedValue');
                expect(interceptedObj.immutableValue).toEqual('modifiedValue');
            });
            it('after modifying interceptedObj, throws error, and globalObj holds unmodifiedValue and interceptedObject holds modifiedValue', () => {
                expect(() => (interceptedObj.immutableValue = 'something else')).toThrowError(
                    'trap returned falsish for property'
                );

                expect(globalObj.immutableValue).toEqual('unmodifiedValue');
                expect(interceptedObj.immutableValue).toEqual('modifiedValue');
            });
        });
        describe('mutable value', () => {
            globalObj.mutableValue = 'unmodifiedValue';
            const interceptedObj = interceptObject(globalObj, {
                mutableValue: 'modifiedValue'
            });

            it('globalObj holds unmodifiedValue and interceptedObj holds modifiedValue', () => {
                expect(globalObj.mutableValue).toEqual('unmodifiedValue');
                expect(interceptedObj.mutableValue).toEqual('modifiedValue');
            });
            it('after modifying globalObj, globalObj holds change globalObj and interceptedObject holds modifiedValue', () => {
                globalObj.mutableValue = 'change globalObj';

                expect(globalObj.mutableValue).toEqual('change globalObj');
                expect(interceptedObj.mutableValue).toEqual('modifiedValue');
            });
            it('after modifying interceptedObj, globalObj holds change globalObj and interceptedObject holds change interceptedObj', () => {
                interceptedObj.mutableValue = 'change interceptedObj';

                expect(globalObj.mutableValue).toEqual('change globalObj');
                expect(interceptedObj.mutableValue).toEqual('change interceptedObj');
            });
        });
        describe('intercepting getter', () => {
            Object.defineProperty(globalObj, 'immutableGetter', {
                get() {
                    return 'unmodifiedValue';
                }
            });
            const interceptedObj = interceptObject(globalObj, {
                get immutableGetter() {
                    return 'modifiedValue';
                }
            });

            it('globalObj gets unmodifiedValue and interceptedObj gets modifiedValue', () => {
                expect(globalObj.immutableGetter).toEqual('unmodifiedValue');
                expect(interceptedObj.immutableGetter).toEqual('modifiedValue');
            });
            it('after modifying globalObj, throws error, and globalObj holds unmodifiedValue and interceptedObject holds modifiedValue', () => {
                expect(() => (globalObj.immutableGetter = 'something else')).toThrowError('which has only a getter');

                expect(globalObj.immutableGetter).toEqual('unmodifiedValue');
                expect(interceptedObj.immutableGetter).toEqual('modifiedValue');
            });
            it('after modifying interceptedObj, throws error, and globalObj holds unmodifiedValue and interceptedObject holds modifiedValue', () => {
                expect(() => (interceptedObj.immutableGetter = 'something else')).toThrowError(
                    'trap returned falsish for property'
                );

                expect(globalObj.immutableGetter).toEqual('unmodifiedValue');
                expect(interceptedObj.immutableGetter).toEqual('modifiedValue');
            });
        });
        describe('intercepting setter', () => {
            const originalSetter = jest.fn();
            const interceptedSetter = jest.fn();
            Object.defineProperty(globalObj, 'immutableSetter', {
                set: originalSetter
            });
            const modifiedProperties = {};
            Object.defineProperty(modifiedProperties, 'immutableSetter', {
                set: interceptedSetter
            });
            const interceptedObj = interceptObject(globalObj, modifiedProperties);

            it('globalObj setter gets called with setGlobalObj and interceptedObj never gets called', () => {
                globalObj.immutableSetter = 'setGlobalObj';

                expect(originalSetter).toHaveBeenCalledWith('setGlobalObj');
                expect(interceptedSetter).toHaveBeenCalledTimes(0);
            });
            it('globalObj never gets called and interceptedObj gets called with setInterceptedObj', () => {
                interceptedObj.immutableSetter = 'setInterceptedObj';

                expect(originalSetter).toHaveBeenCalledTimes(1); // one from the previous test
                expect(interceptedSetter).toHaveBeenCalledWith('setInterceptedObj');
            });
        });
        describe('intercepting getOwnPropertyDescriptor', () => {
            // gopd = get own property descriptor
            // for this test, we're just going to
            // have globalObj to be a mutable value and
            // interceptedGopd to be an immutable value

            const globalGopd: PropertyDescriptor = {
                writable: true,
                value: 'global',

                configurable: false,
                enumerable: false
            };
            const interceptedGopd: PropertyDescriptor = {
                writable: false,
                value: 'intercept',

                configurable: false,
                enumerable: false
            };

            Object.defineProperty(globalObj, 'gopd', globalGopd);
            const modifiedProperties = {};
            Object.defineProperty(modifiedProperties, 'gopd', interceptedGopd);
            const interceptedObj = interceptObject(globalObj, modifiedProperties);

            it('globalObj holds global and interceptedObj holds intercept', () => {
                expect(globalObj.gopd).toEqual('global');
                expect(interceptedObj.gopd).toEqual('intercept');
            });
            it('after modifying globalObj, globalObj holds changedglobal and interceptedObject holds intercept', () => {
                globalObj.gopd = 'changedglobal';

                expect(globalObj.gopd).toEqual('changedglobal');
                expect(interceptedObj.gopd).toEqual('intercept');
            });
            it('after modifying interceptedObj, throws error, and globalObj holds changedglobal and interceptedObject holds intercept', () => {
                expect(() => (interceptedObj.gopd = 'changedintercept')).toThrowError(
                    'trap returned falsish for property'
                );

                expect(globalObj.gopd).toEqual('changedglobal');
                expect(interceptedObj.gopd).toEqual('intercept');
            });
            it('descriptors should match previously defined descriptors', () => {
                globalObj.gopd = 'global'; // change back to original value

                expect(globalGopd).toStrictEqual(Object.getOwnPropertyDescriptor(globalObj, 'gopd'));
                expect(interceptedGopd).toStrictEqual(Object.getOwnPropertyDescriptor(interceptedObj, 'gopd'));
            });
        });
    });
    describe('mirroring properties', () => {
        const globalObj: anyObjType = {};
        const interceptedObj = interceptObject(globalObj, {});

        describe('mutable values', () => {
            it('should mutate both when mutating globalObj', () => {
                globalObj.mutateValue = 'mutate globalObj';

                expect(globalObj.mutateValue).toEqual('mutate globalObj');
                expect(interceptedObj.mutateValue).toEqual('mutate globalObj');
            });
            it('should mutate both when mutating interceptedObj', () => {
                interceptedObj.mutateValue = 'mutate interceptedObj';

                expect(globalObj.mutateValue).toEqual('mutate interceptedObj');
                expect(interceptedObj.mutateValue).toEqual('mutate interceptedObj');
            });
        });
        describe('immutable values', () => {
            Object.defineProperty(globalObj, 'immutableValue', {
                writable: false,
                value: 'immutable'
            });

            it('should throw error and not mutate both when mutating globalObj', () => {
                expect(() => (globalObj.immutableValue = 'immutated globalObj')).toThrowError(
                    'Cannot assign to read only property'
                );

                expect(globalObj.immutableValue).toEqual('immutable');
                expect(interceptedObj.immutableValue).toEqual('immutable');
            });
            it('should throw error and not mutate both when mutating interceptedObj', () => {
                expect(() => (interceptedObj.immutableValue = 'immutated interceptedObj')).toThrowError(
                    'trap returned falsish for property'
                );

                expect(globalObj.immutableValue).toEqual('immutable');
                expect(interceptedObj.immutableValue).toEqual('immutable');
            });
        });
        describe('defineProperty', () => {
            it('should have same descriptor for both when defineProperty on globalObj', () => {
                const descriptor: PropertyDescriptor = {
                    writable: false,
                    configurable: true,
                    enumerable: false,
                    value: 'value'
                };
                Object.defineProperty(globalObj, 'defineProperty_globalObj', descriptor);

                expect(Object.getOwnPropertyDescriptor(globalObj, 'defineProperty_globalObj')).toStrictEqual(
                    descriptor
                );
                expect(Object.getOwnPropertyDescriptor(interceptedObj, 'defineProperty_globalObj')).toStrictEqual(
                    descriptor
                );
            });
            it('should have same descriptor for both when defineProperty on interceptedObject', () => {
                const descriptor: PropertyDescriptor = {
                    writable: false,
                    configurable: true,
                    enumerable: false,
                    value: 'value2'
                };
                Object.defineProperty(globalObj, 'defineProperty_interceptedObj', descriptor);

                expect(Object.getOwnPropertyDescriptor(globalObj, 'defineProperty_interceptedObj')).toStrictEqual(
                    descriptor
                );
                expect(Object.getOwnPropertyDescriptor(interceptedObj, 'defineProperty_interceptedObj')).toStrictEqual(
                    descriptor
                );
            });
        });
        describe('bind function', () => {
            globalObj.func = function () {
                return this;
            };
            globalObj.func.testValue = 'test123';
            globalObj.func.setValue = function (value: string) {
                this.testValue = value;
            };
            interceptedObj.funcIntercept = function () {
                return this;
            };

            it('should bind property function', () => {
                expect(globalObj.func()).toStrictEqual(globalObj);
                expect(interceptedObj.func()).toStrictEqual(globalObj);
            });
            it('should bind function on interceptedObject', () => {
                expect(globalObj.funcIntercept()).toStrictEqual(globalObj);
                expect(interceptedObj.funcIntercept()).toStrictEqual(globalObj);
            });
            it('two binded functions should be equal', () => {
                expect(globalObj.func).toBe(globalObj.func);
                expect(interceptedObj.func).toBe(interceptedObj.func);

                expect(globalObj.funcIntercept).toBe(globalObj.funcIntercept);
                expect(interceptedObj.funcIntercept).toBe(interceptedObj.funcIntercept);
            });
            it('should work with func.call', () => {
                const thisObj = {
                    some: 'property'
                };

                expect(globalObj.func.call(thisObj)).toBe(thisObj);
                expect(globalObj.funcIntercept.call(thisObj)).toBe(thisObj);

                expect(interceptedObj.func.call(thisObj)).toBe(thisObj);
                expect(interceptedObj.funcIntercept.call(thisObj)).toBe(thisObj);
            });
            it('should work with func.propFunc.call', () => {
                const thisObj = {
                    some: 'property'
                };
                globalObj.funcIntercept.propFunc = function () {
                    return this;
                };
                interceptedObj.func.propFunc = function () {
                    return this;
                };
                interceptedObj.funcIntercept.testValue = '123';

                expect(globalObj.func.propFunc.call(thisObj)).toBe(thisObj);
                expect(globalObj.funcIntercept.propFunc.call(thisObj)).toBe(thisObj);

                expect(interceptedObj.func.propFunc.call(thisObj)).toBe(thisObj);
                expect(interceptedObj.funcIntercept.propFunc.call(thisObj)).toBe(thisObj);
            });
            it('should return this when func.propFunc()', () => {
                expect(globalObj.func.propFunc()).toBe(globalObj.func);
                expect(globalObj.funcIntercept.propFunc()).toBe(globalObj.funcIntercept);

                expect(interceptedObj.func.propFunc()).toBe(globalObj.func);
                expect(interceptedObj.funcIntercept.propFunc()).toBe(globalObj.funcIntercept);
            });
            it('two binded function properties should be equal', () => {
                expect(globalObj.func.propFunc).toBe(globalObj.func.propFunc);
                expect(interceptedObj.func.propFunc).toBe(interceptedObj.func.propFunc);

                expect(globalObj.funcIntercept.propFunc).toBe(globalObj.funcIntercept.propFunc);
                expect(interceptedObj.funcIntercept.propFunc).toBe(interceptedObj.funcIntercept.propFunc);
            });
            it('should work with func.bind', () => {
                const thisObj = {
                    some: 'property'
                };

                expect(globalObj.func.bind(thisObj)()).toStrictEqual(thisObj);
                expect(globalObj.funcIntercept.bind(thisObj)()).toStrictEqual(thisObj);

                expect(interceptedObj.func.bind(thisObj)()).toStrictEqual(thisObj);
                expect(interceptedObj.funcIntercept.bind(thisObj)()).toStrictEqual(thisObj);
            });
            it('should work with Function.prototype.call.call', () => {
                const thisObj = {
                    some: 'otherproperty'
                };

                expect(Function.prototype.call.call(globalObj.func, thisObj)).toBe(thisObj);
                expect(Function.prototype.call.call(globalObj.funcIntercept, thisObj)).toBe(thisObj);

                expect(Function.prototype.call.call(interceptedObj.func, thisObj)).toBe(thisObj);
                expect(Function.prototype.call.call(interceptedObj.funcIntercept, thisObj)).toBe(thisObj);
            });
            it('should mirror function properties of function', () => {
                expect(globalObj.func.testValue).toEqual('test123');
                expect(interceptedObj.func.testValue).toEqual('test123');
            });
            it('should mirror function property changes', () => {
                globalObj.func.propChangeTestGlobal = 'change globalObj';
                interceptedObj.func.propChangeTestIntercept = 'change interceptedObj';

                expect(globalObj.func.propChangeTestGlobal).toEqual('change globalObj');
                expect(interceptedObj.func.propChangeTestGlobal).toEqual('change globalObj');

                expect(globalObj.func.propChangeTestIntercept).toEqual('change interceptedObj');
                expect(interceptedObj.func.propChangeTestIntercept).toEqual('change interceptedObj');
            });
            it('property should be called with "this" binded properly', () => {
                globalObj.func.setValue('set from globalObj');

                expect(globalObj.func.testValue).toEqual('set from globalObj');
                expect(interceptedObj.func.testValue).toEqual('set from globalObj');

                globalObj.func.setValue('set from interceptedObj');

                expect(globalObj.func.testValue).toEqual('set from interceptedObj');
                expect(interceptedObj.func.testValue).toEqual('set from interceptedObj');
            });
            it('should inherit with __proto__', () => {
                interceptedObj.funcProto = Object.create(interceptedObj.func);

                expect(globalObj.funcProto.testValue).toEqual('set from interceptedObj');
                expect(interceptedObj.funcProto.testValue).toEqual('set from interceptedObj');

                interceptedObj.func.testValue = 23;

                expect(globalObj.funcProto.testValue).toEqual(23);
                expect(interceptedObj.funcProto.testValue).toEqual(23);
            });
        });
        describe('__proto__ inheritance', () => {
            interceptedObj.protoParent = {
                parentValue: 123
            };
            interceptedObj.protoChild = Object.create(interceptedObj.protoParent);

            it('should inherit correctly', () => {
                expect(globalObj.protoChild.parentValue).toEqual(123);
                expect(interceptedObj.protoChild.parentValue).toEqual(123);
            });
        });
        describe('es5 classes', () => {
            globalObj.ES5ClassGlobal = function (inputNumber: number) {
                this.currentNumber = inputNumber;
            };
            globalObj.ES5ClassGlobal.prototype = {
                add(addValue: number) {
                    return this.currentNumber + addValue;
                }
            };

            interceptedObj.ES5ClassIntercept = function (inputNumber: number) {
                this.currentNumber = inputNumber;
            };
            interceptedObj.ES5ClassIntercept.prototype = {
                add(addValue: number) {
                    return this.currentNumber + addValue;
                }
            };

            it('should run prototype method correctly using es5 class created through globalObj', () => {
                expect(new globalObj.ES5ClassGlobal(3).add(3)).toEqual(6);
                expect(new interceptedObj.ES5ClassGlobal(4).add(3)).toEqual(7);
            });
            it('should run prototype method correctly using es5 class created through interceptedObj', () => {
                expect(new globalObj.ES5ClassIntercept(5).add(3)).toEqual(8);
                expect(new interceptedObj.ES5ClassIntercept(6).add(3)).toEqual(9);
            });
        });
        describe('Object.keys', () => {
            it('should be same for both', () => {
                expect(Object.keys(globalObj)).toEqual(Object.keys(interceptedObj));
            });
        });
    });
});
