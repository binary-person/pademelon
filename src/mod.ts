import { allowedModRegex } from './rewriters/UrlRewriter';

type modTypes = 'javascript' | 'stylesheet' | 'webworker' | 'serviceworker' | 'static' | 'api';

const TYPE_TO_MOD: { [mod in modTypes]: string } = {
    javascript: 'js_',
    stylesheet: 'cs_',
    webworker: 'ww_',
    serviceworker: 'sw_',
    static: 'st_',
    api: 'ap_',
};

Object.keys(TYPE_TO_MOD).forEach((eachMod) => {
    const typedMod = eachMod as modTypes; // get typescript to shush about incompatibility of eachMod: string and modTypes
    if (!allowedModRegex.test(TYPE_TO_MOD[typedMod])) {
        throw new Error(
            'Invalid mod in mod.ts file. Please file an issue and include ' +
                'the following information: TYPE_TO_MOD[' +
                eachMod +
                '] = ' +
                TYPE_TO_MOD[typedMod] +
                ' violates the regex ' +
                allowedModRegex,
        );
    }
});

function typeToMod(type: modTypes): string {
    if (type in TYPE_TO_MOD) {
        return TYPE_TO_MOD[type];
    }
    return '';
}

export { typeToMod, modTypes };
