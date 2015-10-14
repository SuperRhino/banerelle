<?php

return [

    'routes.case_sensitive'       => true,
    'routes.controller_namespace' => '\\App\\Controllers\\',

    'db.host'    => 'localhost',
    'db.name'    => 'banerelle',
    'db.user'    => 'banerelle',
    'db.pass'    => getenv('DB_PASS'),
    'db.charset' => 'utf8',
];