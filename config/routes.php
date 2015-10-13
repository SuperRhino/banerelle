<?php
$app = \Core\Application::getInstance();

$app->get('/', 'HomeController:index');