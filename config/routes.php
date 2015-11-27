<?php
$this->get('/', 'App\Controllers\HomeController:index');
$this->get('/rsvp', 'App\Controllers\HomeController:rsvp');