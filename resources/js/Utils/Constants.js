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
        apiHost  = 'http://localhost:8888/api';
        siteRoot = 'http://localhost:8888';
        break;
}

export var Config = {
  ENV: ENV,
  api_root: apiHost+'/',
  site_root: siteRoot+'/'
};
