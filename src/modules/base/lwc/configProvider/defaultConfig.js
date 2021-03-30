import localizationService from './defaultLocalizationConfig';

function createStandAloneConfig() {
    return {
        getLocalizationService() {
            return localizationService;
        },
        getPathPrefix() {
            return ''; // @sfdc.playground path-prefix DO-NOT-REMOVE-COMMENT
        },
        getToken() {
            return undefined; // @sfdc.playground token DO-NOT-REMOVE-COMMENT
        },
        getOneConfig() {
            return {
                densitySetting: ''
            };
        }
    };
}

export function getDefaultConfig() {
    return createStandAloneConfig();
}
