<?php
namespace App\Controllers\Api;

use App\Models\User;
use Core\BaseApiController;
use Core\Http\Exception\BadRequestException;
use Core\Http\Exception\NotFoundException;

class FlashBriefingController extends BaseApiController
{
    public function get()
    {
        $now = new \DateTime('now', new \DateTimeZone('America/New_York'));
        $wedding_date = new \DateTime('2017-07-15 16:30:00', new \DateTimeZone('America/New_York'));
        $interval = $wedding_date->diff($now);
        $diff = $interval->format("%a days, %h hours, and %i minutes");

        $data = [
            [
                'uid' => uniqid(),
                'updateDate' => date(\DateTime::ISO8601),
                'titleText' => 'Bane Arelli Wedding Countdown',
                'mainText' => "There are $diff remaining until the Bane Arelli Wedding",
                'redirectionURL' => $this->app->getSetting('host'),
            ],
        ];

        return $this->container->response->withJson($data);
    }
}
