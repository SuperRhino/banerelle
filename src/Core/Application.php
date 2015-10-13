<?php
namespace Core;

use Slim\Slim;

class Application extends Slim {

    /**
     * @var string The basePath to use for the application
     */
    public $basePath;

    /**
     * @param $basePath
     */
    public function __construct($basePath)
    {
        $this->basePath = rtrim($basePath, '/');

        $config = $this->loadConfigFile('config') ?: [];
        parent::__construct($config);

        $this->loadRoutes();
        $this->setupServices();
        //$this->setupErrorHandler();
        //$this->setupNotFound();

    }

    public function getCurrentUser()
    {}

    private function loadRoutes()
    {
        $routes = $this->loadConfigFile('routes');
        if (! $routes) {
            throw new \RuntimeException('Missing routes file.');
        }
    }

    private function setupServices()
    {
        //$this->db = new ExtendedPdo(
        //    'mysql:host=localhost;dbname=banerelle',
        //    'banerelle',
        //    ''
        //);
        //$this->query = new QueryFactory('mysql');
    }

    private function loadConfigFile($file)
    {
        $file = $this->basePath.'/config/'.$file.'.php';
        return is_file($file) ? require($file) : false;
    }

}