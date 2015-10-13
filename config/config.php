<?php

return [
    'db.connection' => [
        'host'      => 'localhost',
        'database'  => 'banerelle',
        'username'  => 'banerelle',
        'password'  => getenv('DB_PASS'),
        'charset'   => 'utf8',
    ],
];