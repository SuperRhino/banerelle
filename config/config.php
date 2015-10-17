<?php

return [

    'routes.case_sensitive'       => true,
    'routes.controller_namespace' => '\\App\\Controllers\\',

    'templates.path' => $this->basePath.'/templates',
    'view'           => '\\Slim\\View',

    'db.host'    => 'localhost',
    'db.name'    => 'banerelle',
    'db.user'    => 'banerelle',
    'db.pass'    => getenv('DB_PASS'),
    'db.charset' => 'utf8',
];