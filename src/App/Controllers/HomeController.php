<?php
namespace App\Controllers;

use Core\BaseController;

class HomeController extends BaseController
{
    public function index()
    {
        $data = [
            'events' => $this->getEventData(),
        ];

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
    private function getEventData()
    {
        $query = $this->app->query->newSelect();
        $query->cols(['*'])
              ->from('events')
              ->orderBy(['event_date desc', 'post_date desc'])
              ->limit(3);

        return $this->app->db->fetchAll($query);
    }
}