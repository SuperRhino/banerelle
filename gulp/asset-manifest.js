var fs = require('fs');
var utils = require('./utils');

var manifestFile = __dirname+'/../asset-manifest.json';
var assetManifest = require(manifestFile);

module.exports = {
  update: function (sourceFile, outputFile) {
    if (! utils.isProduction()) return;

    assetManifest[sourceFile] = outputFile;

    fs.writeFileSync(manifestFile, JSON.stringify(assetManifest, null, 2));
  },
}
