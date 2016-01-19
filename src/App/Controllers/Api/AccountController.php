<?php
namespace App\Controllers\Api;

use App\Models\User;
use Core\BaseApiController;
use Core\Http\Exception\BadRequestException;
use Core\Http\Exception\NotFoundException;

class AccountController extends BaseApiController
{
    public function login()
    {
        $username = $this->json('username');
        $password = $this->json('password');

        $user = User::findByUsername($username);
        if (! $user) {
            throw new NotFoundException('User not found');
        }

        if ($user->password !== md5($password)) {
            throw new BadRequestException('Incorrect password');
        }

        // Create [Db] Session
        $user->findOrCreateSession();

        return $this->success($user->toArray());
    }

    public function logout()
    {
        $user = $this->app->getCurrentUser();
        if (! $user) {
            throw new NotFoundException('User not found');
        }

        $user->removeSession();
        return $this->success([]);
    }

    public function getUser()
    {
        $user = $this->app->getCurrentUser();
        if (! $user) {
            throw new NotFoundException('User not found');
        }

        return $this->success($user->toArray());
    }
}