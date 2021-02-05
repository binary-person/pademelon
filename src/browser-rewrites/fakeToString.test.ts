import { fakeToString } from './fakeToString';

describe('fakeToString', () => {
    const func = () => undefined;
    fakeToString(func, 'func');
    it("rewrites target function's toString to return native code with function name", () => {
        expect(func.toString()).toEqual('function func() { [native code] }');
    });
    it("protects against using other function's toString.call(fakedFunction)", () => {
        expect(Function.toString.call(func)).toEqual('function func() { [native code] }');
    });
    it("should not break other function's toString", () => {
        expect(Function.toString()).toEqual('function Function() { [native code] }');
    });
});
