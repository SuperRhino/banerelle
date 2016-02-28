<?php

use Phinx\Seed\AbstractSeed;

class UserSeed extends AbstractSeed
{
    /**
     * Run Method.
     *
     * Write your database seeder using this method.
     *
     * More information on writing seeders is available here:
     * http://docs.phinx.org/en/latest/seeding.html
     */
    public function run()
    {
        $users = [
            [
              'id'       => 1,
              'username' => 'ryan',
              'password' => md5('kittyburger'),
            ],
            [
                'id'       => 2,
                'username' => 'shayna',
                'password' => md5('kittyburger'),
            ],
        ];

        // this is a handy shortcut
        $this->insert('users', $users);

    }
}
