<?php
namespace App\Controllers\Api;

use Core\BaseApiController;

class AccountController extends BaseApiController
{
    public function login()
    {
        return $this->success($this->json());
    }
}