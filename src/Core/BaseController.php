<?php
namespace Core;

use Slim\Container;

/**
 * Class BaseController
 * @property Application    app
 * @property array          metadata
 * @package Core
 */
class BaseController {

    /**
     * @var Container
     */
    protected $container;

    /**
     * @var Application
     */
    protected $app;

    /**
     * @var array
     */
    protected $metadata;

    /**
     * @param Container $container
     */
    public function __construct(Container $container)
    {
        $this->container = $container;
        $this->app = $container['app'];

        $this->metadata = [
            'title' => $this->app->getSetting('app.name'),
            'description' => $this->app->getSetting('app.description'),
            'keywords' => $this->app->getSetting('app.keywords'),
        ];
    }

    /**
     * Generate a Response object for the given {$template}
     * @param string $template
     * @param array $data
     * @return \Psr\Http\Message\ResponseInterface
     */
    protected function view($template, $data = [])
    {
        try {
            // @SLIM3
            return $this->container->view->render($this->container->response, $template, $this->getTemplateData($data));
        } catch (\Twig_Error $e) {
            $this->app->notFound();
        }
    }

    /**
     * @param $metadata
     */
    protected function setMetadata($metadata)
    {
        $this->metadata = array_merge($this->metadata, $metadata);
    }

    /**
     * @param $data
     * @return array
     */
    protected function getTemplateData($data)
    {
        return [
            'env'  => $this->app->envData,
            'meta' => $this->metadata,
            'data' => $data,
        ];
    }

    /**
     * @return \App\Models\User|null
     */
    protected function getCurrentUser()
    {
        return $this->app->getCurrentUser();
    }
}