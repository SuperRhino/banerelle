var keyMirror = require('keyMirror');

var ENV = (
    'dev'
    //'production'
);

var isProd     = true,
    apiVersion = 'v1',
    apiHost    = 'http://banerelle.com/api',
    siteRoot   = 'http://banerelle.com';

switch (ENV) {
    case 'dev':
        isProd   = false;
        apiHost  = 'http://dev.banerelle.com/api';
        siteRoot = 'http://dev.banerelle.com';
        break;
}

export var Config = {
  ENV: ENV,
  api_root: apiHost+'/',
  site_root: siteRoot+'/',

  Storage: keyMirror({
    ACCESS_TOKEN: null,
  }),
};
