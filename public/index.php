<?php
function main()
{
    //    error_reporting(E_ALL);
    date_default_timezone_set('UTC');
    require '../vendor/autoload.php';
    $app = new Core\Application(realpath(__DIR__.'/../'));
    $app->run();
}
main();