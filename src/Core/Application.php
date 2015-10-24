<?php
namespace Core;


use Aura\Sql\ExtendedPdo;
use Aura\SqlQuery\QueryFactory;
use Dotenv\Dotenv;
use Slim\Route;
use Slim\Slim;

/**
 * Core Application
 * @property array                       settings
 * @property \Aura\Sql\ExtendedPdo       db
 * @property \Aura\SqlQuery\QueryFactory query
 * @property \Slim\View                  view
 * @package Core
 */
class Application extends Slim {

    /**
     * The basePath to use for the application
     * @var string
     */
    public $basePath;

    /**
     * Lazy DB connection
     * @var  \Aura\Sql\ExtendedPdo
     */
    public $db;

    /**
     * @var  \Aura\SqlQuery\QueryFactory
     */
    public $query;

    /**
     * @param $basePath
     */
    public function __construct($basePath)
    {
        $this->basePath = rtrim($basePath, '/');

        $dotenv = new Dotenv($this->basePath);
        $dotenv->load();

        $config = $this->loadConfigFile('config') ?: [];
        parent::__construct($config);

        $this->loadRoutes();
        $this->setupServices();
        //$this->setupErrorHandler();
        //$this->setupNotFound();

    }

    public function isProd()
    {
        return ($this->config('ENV') === 'prod');
    }

    public function getCurrentUser()
    {}

    /**
     * Override the default behavior to use our own callable parsing.
     * @author @dhrrgn
     * @param $args
     * @return Route
     */
    protected function mapRoute($args)
    {
        $pattern  = array_shift($args);
        $callable = array_pop($args);
        $callable = $this->getRouteClosure($callable);
        if (substr($pattern, -1) !== '/') {
            $pattern .= '/';
        }
        $route = new Route($pattern, $callable, $this->settings['routes.case_sensitive']);
        $this->router->map($route);
        if (count($args) > 0) {
            $route->setMiddleware($args);
        }
        return $route;
    }

    private function loadRoutes()
    {
        $routes = $this->loadConfigFile('routes');
        if (! $routes) {
            throw new \RuntimeException('Missing routes file.');
        }
    }

    private function setupServices()
    {
        $this->db = new ExtendedPdo(
            'mysql:host='.$this->config('db.host').';dbname='.$this->config('db.name'),
            $this->config('db.user'),
            $this->config('db.pass')
        );
        $this->query = new QueryFactory('mysql');
    }

    private function loadConfigFile($file)
    {
        $file = $this->basePath.'/config/'.$file.'.php';
        return is_file($file) ? require($file) : false;
    }

    /**
     * Generates a closure for the given definition.
     * @param $callable
     * @return callable
     */
    private function getRouteClosure($callable)
    {
        if (! is_string($callable)) {
            return $callable;
        }
        list($controller, $method) = $this->parseRouteCallable($callable);
        return function () use ($controller, $method) {
            $class = $this->settings['routes.controller_namespace'].$controller;
            $refClass  = new \ReflectionClass($class);
            $refMethod = $refClass->getMethod($method);
            return $refMethod->invokeArgs($refClass->newInstance($this), func_get_args());
        };
    }
    /**
     * Parses the route definition string (i.e. 'HomeController:index')
     * @param $callable
     * @return array
     */
    private function parseRouteCallable($callable)
    {
        return explode(':', $callable);
    }
}