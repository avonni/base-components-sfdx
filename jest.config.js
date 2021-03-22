const { jestConfig } = require('lwc-services/lib/config/jestConfig');

module.exports = {
    ...jestConfig,
    moduleNameMapper: {},
    setupFiles: ['jest-canvas-mock']
};
