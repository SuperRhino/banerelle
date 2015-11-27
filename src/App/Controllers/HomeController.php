<?php
namespace App\Controllers;

use Core\BaseController;
use Slim\Container;

class HomeController extends BaseController
{
    public function index()
    {
        $data = [
            'events' => $this->app->isProd() ? $this->_getEventData() : [],
        ];

        var_dump($data); die;
        return $this->view('home.html', $data);
    }

    public function rsvp()
    {
        return $this->view('rsvp.html');
    }

    /**
     * Get event data for homepage display
     *
     * @return array
     */
    private function _getEventData()
    {
        $query = $this->app->query->newSelect();
        $query->cols(['*'])
              ->from('events')
              ->orderBy(['event_date desc', 'post_date desc'])
              ->limit(3);

        return $this->app->db->fetchAll($query);
    }
}