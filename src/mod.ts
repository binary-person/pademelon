import { allowedModRegex } from './rewriters/UrlRewriter';

type modTypes = 'html' | 'javascript' | 'stylesheet' | 'webworker' | 'serviceworker' | 'raw' | 'api';

const TYPE_TO_MOD: { [mod in modTypes]: string } = {
    html: '',
    javascript: 'js_',
    stylesheet: 'cs_',
    webworker: 'ww_',
    serviceworker: 'sw_',
    raw: 'rw_',
    api: 'ap_'
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
                allowedModRegex
        );
    }
});

function typeToMod(type?: modTypes): string {
    if (type && type in TYPE_TO_MOD) {
        return TYPE_TO_MOD[type];
    }
    return '';
}
function modToType(mod?: string): modTypes {
    for (const eachType in TYPE_TO_MOD) {
        if (TYPE_TO_MOD[eachType as modTypes] === mod) {
            return eachType as modTypes;
        }
    }
    return 'raw';
}

export { typeToMod, modToType, modTypes };
