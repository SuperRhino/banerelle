var argv = require('yargs').argv;

var utils = {
  isProduction: function () {
    return argv.production;
  },

  getBowerPackage: function () {
    var pkg;
    try {
      pkg = require('../bower.json');
    } catch (e) { /* pass */ }

    return pkg;
  },

  getNpmPackage: function () {
    var pkg;
    try {
      pkg = require('../package.json');
    } catch (e) { /* pass */ }

    return pkg;
  },

  getBowerDependencies: function () {
    return Object.keys(utils.getBowerPackage().dependencies) || [];
  },

  getNpmDependencies: function () {
    return Object.keys(utils.getNpmPackage().dependencies) || [];
  },

};

module.exports = utils;
