<?php
namespace App\Controllers;

use Core\BaseController;

class HomeController extends BaseController
{
    public function index($page = null)
    {
        $data = [
            'events' => $this->_getEventData(),
        ];

        try {
            $this->app->view->display('home.php', $data);
        } catch (\RuntimeException $e) {
            //throw new NotFoundException('Page not found');
        }
    }

    public function _getEventData()
    {
        $query = $this->app->query->newSelect();
        $query->cols(['*'])
              ->from('events');

        return $this->app->db->fetchAll($query);
    }
}