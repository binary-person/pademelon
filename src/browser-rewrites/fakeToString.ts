type anyFunc = (...args: any[]) => any;

const nativeFunctionPrefix = 'function ';
const nativeFunctionSuffix = '() { [native code] }';

const toStringFunc = () => {
    return nativeFunctionPrefix + 'toString' + nativeFunctionSuffix;
};
toStringFunc.toString = toStringFunc;
toStringFunc.toString.toString = toStringFunc.toString;

function fakeToString(func: anyFunc, funcName = ''): anyFunc {
    func.toString = () => {
        return nativeFunctionPrefix + funcName + nativeFunctionSuffix;
    };
    func.toString.toString = toStringFunc;
    return func;
}

const funcProto = Function.prototype;
const originalToString = funcProto.toString;
funcProto.toString = function () {
    if (this.toString === toStringFunc) {
        return this.toString();
    } else if (this.toString.toString === toStringFunc && this.toString !== funcProto.toString) {
        return this.toString();
    } else {
        return originalToString.call(this);
    }
};
funcProto.toString.toString = toStringFunc;

export { fakeToString };
