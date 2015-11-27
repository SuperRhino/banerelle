<?php
// Load Env Config
(new Dotenv\Dotenv('../'))->load();

$container = new Slim\Container([
    'settings' => [
        'env' => strtolower(getenv('ENV')),
        'base_path' => realpath(__DIR__.'/../'),

        'app.name'        => 'Banerelle — The start of something awesome',
        'app.description' => 'www hub for all things Pasto-Bane! #pastobane #banerelle',
        'app.keywords'    => 'ryan pastorelle,shayna bane',

        'app.urls.assets' => '/build',
        'app.paths.js'    => '/build/js',
        'app.paths.css'   => '/build/css',
        'app.assets'      => json_decode(file_get_contents('../asset-manifest.json'), true),

        'db.host'    => getenv('DB_HOST'),
        'db.name'    => getenv('DB_NAME'),
        'db.user'    => getenv('DB_USER'),
        'db.pass'    => getenv('DB_PASS'),
        'db.charset' => 'utf8',

        'ga.tracking_id' => 'UA-67735723-4',
    ],
]);

return $container;