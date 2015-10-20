<?php
$app = \Core\Application::getInstance();

$app->get('/', 'HomeController:index');
$app->get('/rsvp', 'HomeController:rsvp');