import { getDefaultConfig } from './defaultConfig';

// Closure to hold the APIs if and when available
let configProvided = false;
const { assign, freeze } = Object;
let PROVIDED_IMPL = getDefaultConfig();

function resolveServiceApiProps(serviceAPI = {}) {
    const serviceApiMap = {
        getPathPrefix: serviceAPI.getPathPrefix,
        getToken: serviceAPI.getToken,
        getLocalizationService: serviceAPI.getLocalizationService,
        iconSvgTemplates: serviceAPI.iconSvgTemplates,
        getOneConfig:
            serviceAPI.getInitializer && serviceAPI.getInitializer('oneConfig'),
    };
    return Object.keys(serviceApiMap).reduce((seed, prop) => {
        if (serviceApiMap[prop] !== undefined) {
            seed[prop] = serviceApiMap[prop];
        }
        return seed;
    }, {});
}

export default function configProviderService(serviceAPI) {
    if (!configProvided) {
        PROVIDED_IMPL = freeze(
            assign({}, PROVIDED_IMPL, resolveServiceApiProps(serviceAPI))
        );
        configProvided = true;
    } else {
        throw new Error(
            'ConfigProvider can only be set once at initilization time'
        );
    }

    return { name: 'lightning-config-provider' };
}

export function getPathPrefix() {
    return (
        (PROVIDED_IMPL &&
            PROVIDED_IMPL.getPathPrefix &&
            PROVIDED_IMPL.getPathPrefix()) ||
        ''
    );
}

export function getToken(name) {
    return (
        PROVIDED_IMPL && PROVIDED_IMPL.getToken && PROVIDED_IMPL.getToken(name)
    );
}

export function getLocalizationService() {
    return (
        PROVIDED_IMPL &&
        PROVIDED_IMPL.getLocalizationService &&
        PROVIDED_IMPL.getLocalizationService()
    );
}

export function getIconSvgTemplates() {
    return PROVIDED_IMPL && PROVIDED_IMPL.iconSvgTemplates;
}

export function getOneConfig() {
    return (
        (PROVIDED_IMPL && PROVIDED_IMPL.getOneConfig) || {
            densitySetting: '',
        }
    );
}
