<?php
namespace App\Controllers\Api;

use Core\BaseApiController;

class AccountController extends BaseApiController
{
    public function login()
    {
        return $this->success($this->json());

        $username = $this->json('username');
        $password = $this->json('password');

        // TODO --- Login User
        // 1. select from users table where username and password
        // 2. if not found, throw error
        // 3. --- Create [Db] Session ---
        // 4. set sessionid cookie (hashid of sessions.id)
        // 5. respond / redirect
    }

    public function logout()
    {
        // TODO --- Clean Session
        // 1. find/delete session from sessionid cookie
        // 2. delete/expire cookie
        // 3. respond / redirect
    }
}