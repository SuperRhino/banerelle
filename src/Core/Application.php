<?php
namespace Core;


use Aura\Sql\ExtendedPdo;
use Aura\SqlQuery\QueryFactory;
use Core\Http\Exception as HttpException;
use Interop\Container\ContainerInterface;
use Slim\App;

/**
 * Core Application
 * @property-read array                         envData
 * @property-read \Aura\Sql\ExtendedPdo         db
 * @property-read \Aura\SqlQuery\QueryFactory   query
 * @property-read \Slim\Views\Twig              view
 */
class Application extends App {

    /**
     * The environment data used for all template rendering
     * @var array
     */
    public $envData;

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
     * @param ContainerInterface|array $container
     */
    public function __construct($container = [])
    {
        parent::__construct($container);
        $this->getContainer()['app'] = function () { return $this; };

        $this->setupServices();
        $this->setupEnvData();
        $this->loadRoutes();
        $this->setupNotFound();
        $this->setupErrorHandler();
    }

    /**
     * Gets a setting or returns the default.
     * @param $key
     * @param null $default
     * @return null
     */
    public function getSetting($key, $default = null)
    {
        if (! isset($this->settings[$key])) {
            return $default;
        }
        return $this->settings[$key];
    }

    public function isProd()
    {
        return ($this->getSetting('ENV') === 'prod');
    }

    public function getCurrentUser()
    {}

    private function setupEnvData()
    {
        $this->envData = [
            'app_name' => $this->getSetting('app.name'),
            'ga_tracking_id' => $this->getSetting('ga.tracking_id'),
            'assets' => $this->getSetting('app.assets'),
            'js_build_path' => $this->getSetting('app.paths.js'),
            'css_build_path' => $this->getSetting('app.paths.css'),
        ];
    }

    /**
     * Load the routes file
     */
    private function loadRoutes()
    {
        $routes = $this->loadConfigFile('routes');
        if (! $routes) {
            throw new \RuntimeException('Missing routes file.');
        }
    }

    /**
     * Service Definitions
     */
    private function setupServices()
    {
        $container = $this->getContainer();

        $container['view'] = function ($c) {
            $view = new \Slim\Views\Twig($c['settings']['base_path'].'/resources/templates');
            $view->addExtension(new \Slim\Views\TwigExtension(
                $c['router'],
                $c['request']->getUri()
            ));
            return $view;
        };

        $container['db'] = function ($c) {
            return new ExtendedPdo(
                'mysql:host='.$this->getSetting('db.host').';dbname='.$this->getSetting('db.name'),
                $this->getSetting('db.user'),
                $this->getSetting('db.pass')
            );
        };

        $container['query'] = function ($c) {
            return new QueryFactory('mysql');
        };

        // $container['ga'] = function ($c) {
        //     return new Core\Analytics\Google($c['settings']['ga.tracking_id'], http_host());
        // };
    }

    private function setupNotFound()
    {
        $container = $this->getContainer();
        //Override the default Not Found Handler
        $container['notFoundHandler'] = function ($c) {
            return function ($request, $response) use ($c) {
                return $c['view']
                    ->render($c['response'], 'errors/404.html', $this->getErrorTemplateData())
                    ->withStatus(404);
            };
        };
    }

    private function setupErrorHandler()
    {
        $container = $this->getContainer();
        $c['errorHandler'] = function ($c) {
            return function ($request, $response, \Exception $exception) use ($c) {
                if ($e instanceof HttpException) {
                    if ($e->getStatusCode() === 404) {
                        return $this->notFound();
                    }
                    return $c['view']
                                ->render($c['response'], 'errors/http-error.html', $this->getErrorTemplateData([
                                    'code' => $e->getStatusCode(),
                                    'message' => $e->getMessage(),
                                ]))
                                ->withStatus($e->getStatusCode());
                } else {
                    return $c['view']
                                ->render($c['response'], 'errors/500.html', $this->getErrorTemplateData())
                                ->withStatus(500);
                }
            };
        };
    }

    /**
     * Gets template data for error handling pages
     * @return array template data
     */
    private function getErrorTemplateData()
    {
        return [
          'env'  => $this->envData,
          'meta' => [
              'title' => $this->getSetting('app.name'),
          ],
        ];
    }

    /**
     * Load a config file.
     * @param $file
     * @return bool|mixed
     */
    private function loadConfigFile($file)
    {
        $file = $this->getSetting('base_path').'/config/'.$file.'.php';
        return is_file($file) ? require($file) : false;
    }
}