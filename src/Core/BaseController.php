<?php
namespace Core;

class BaseController {

    /**
     * @var Application
     */
    protected $app;

    public function __construct(Application $app)
    {
        $this->app = $app;
    }

    /**
     * @return \App\Models\User|null
     */
    protected function getCurrentUser()
    {
        return $this->app->getCurrentUser();
    }
}