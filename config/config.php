<?php
// Load Env Config
(new Dotenv\Dotenv('../'))->load();

$env = strtolower(getenv('ENV'));
$assets = json_decode(file_get_contents('../asset-manifest.json'), true);
$host = 'http://banerelle.com/';
switch ($env) {
    case 'dev':
        $assets = array_combine(array_keys($assets), array_keys($assets));
        $host = 'http://dev.banerelle.com/';
        break;
}

$isProd = ($env === 'prod');
$container = new Slim\Container([
    'settings' => [
        'env' => $env,
        'base_path' => realpath(__DIR__.'/../'),
        'host' => $host,

        'app.name'        => 'Banerelle — The start of something awesome',
        'app.description' => 'WWW hub for all things Pasto-Bane! #pastobane #banerelle',
        'app.keywords'    => 'ryan pastorelle,shayna bane,wedding,ryan shayna wedding,shayna ryan wedding,banerelle wedding',

        'app.urls.assets' => '/build',
        'app.paths.js'    => '/build/js',
        'app.paths.css'   => '/build/css',
        'app.assets'      => $assets,

        'app.paths.upload_path' => '/public/uploads',
        'app.paths.upload_dir'  => '/uploads',

        'hashids.salt'       => 'NfDPDtGEHmzC7WPHfv6N73WxzUKbbyE2',
        'hashids.min-length' => 3,

        'db.host'    => getenv('DB_HOST'),
        'db.name'    => getenv('DB_NAME'),
        'db.user'    => getenv('DB_USER'),
        'db.pass'    => getenv('DB_PASS'),
        'db.charset' => 'utf8',

        'ga.tracking_id' => $isProd ? 'UA-67735723-4' : null,
    ],
]);

return $container;
