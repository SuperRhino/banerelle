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
        /*
        return [
            [
                'id' => 4,
                'title' => 'We got engaged!',
                'description' => 'Shayna & Ryan have a very enjoyable day in an inspirational sunflower field. We started by visiting Merwin\'s Wharf for brunch on the river. Shayna plans out her whole day thinking Ryan was going to watch the Browns game. Ryan had other plans...',
                'details' => 0,
                'post_date' => '2015-09-27 14:05:00',
                'event_date' => '2015-09-27 14:05:00',
            ],
            [
                'id' => 5,
                'title' => 'Spot the differences',
                'description' => 'Shayna makes it "Facebook official" with a spot-the-differences post. If you guessed: Picture "A" doesn\'t have a Lake Erie Monster sighting, you were correct.',
                'details' => 1,
                'post_date' => '2015-10-01 19:31:00',
                'event_date' => '2015-10-01 19:31:00',
            ],
            [
                'id' => 6,
                'title' => 'Banerelle.com launch',
                'description' => 'Ryan makes use of his recent domain-name buying binge and turns Banerelle.com into the www hub for all things Pasto-Bane! #pastobane #banerelle',
                'details' => 0,
                'post_date' => '2015-10-17 21:05:00',
                'event_date' => '2015-10-17 21:05:00',
            ],
        ];
        */

        $query = $this->app->query->newSelect();
        $query->cols(['*'])
              ->from('events')
              ->orderBy(['event_date desc', 'post_date desc'])
              ->limit(3);

        return $this->app->db->fetchAll($query);
    }
}