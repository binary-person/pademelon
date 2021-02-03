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
 * others not testing set value functions will
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
    // describe('mirroring properties', () => {
    //     const globalObj: anyObjType = {};
    //     const interceptedObj = interceptObject(globalObj, {});

    //     describe('mutable values', () => {
    //         it('should mutate both when mutating globalObj', () => {
    //             globalObj.mutableValue = 'mutate globalObj';

    //             expect(globalObj.mutateValue).toEqual('mutate globalObj');
    //             expect(interceptedObj.mutateValue).toEqual('mutate globalObj');
    //         });
    //         it('should mutate both when mutating interceptedObj', () => {
    //             interceptedObj.mutableValue = 'mutate interceptedObj';

    //             expect(globalObj.mutateValue).toEqual('mutate interceptedObj');
    //             expect(interceptedObj.mutateValue).toEqual('mutate interceptedObj');
    //         });
    //     });
    // });
});
