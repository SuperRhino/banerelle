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
     * Sends the given data as downloadable CSV file
     * @param $data
     * @throws \Slim\Exception\Stop
     */
    protected function download($data)
    {
        // Write to body
        $body = $this->container->response->getBody();
        $body->write($data);

        return $this->_withDownloadHeaders()
                    ->withBody($body);
    }

    private function _withDownloadHeaders()
    {
        $now = gmdate("D, d M Y H:i:s");
        $filename = 'banerelle_guest_list_' . date('Y-m-d') . '.csv';

        return $this->container->response
                            // disable caching
                            ->withHeader('Expires', 'Tue, 03 Jul 2001 06:00:00 GMT')
                            ->withHeader('Cache-Control', 'max-age=0, no-cache, must-revalidate, proxy-revalidate')
                            ->withHeader('Last-Modified', "{$now} GMT")
                            // force download
                            ->withHeader('Content-Type', 'application/force-download')
                            ->withAddedHeader('Content-Type', 'application/octet-stream')
                            ->withAddedHeader('Content-Type', 'application/download')
                            // disposition / encoding on response body
                            ->withHeader('Content-Disposition', "attachment;filename={$filename}")
                            ->withHeader('Content-Transfer-Encoding', 'binary');
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
        $user = $this->getCurrentUser();
        return [
            'env'  => $this->app->envData,
            'meta' => $this->metadata,
            'data' => $data,
            'user' => $user ? $user->toArray() : false,
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
