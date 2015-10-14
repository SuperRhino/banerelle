<?php

return [

    'routes.case_sensitive'       => true,
    'routes.controller_namespace' => '\\App\\Controllers\\',

    'db.connection' => [
        'host'      => 'localhost',
        'database'  => 'banerelle',
        'username'  => 'banerelle',
        'password'  => getenv('DB_PASS'),
        'charset'   => 'utf8',
    ],
];