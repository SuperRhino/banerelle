<?php
$this->get('/', 'App\Controllers\HomeController:index');
$this->get('/rsvp', 'App\Controllers\HomeController:rsvp');

$this->post('/api/login', 'App\Controllers\Api\AccountController:login');