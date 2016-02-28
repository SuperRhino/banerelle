<?php

use Phinx\Migration\AbstractMigration;

class CreateUsersTable extends AbstractMigration
{
    public function change()
    {
        $this->table('users')
             ->addColumn('username', 'string', ['limit' => 20, 'null' => false])
             ->addColumn('password', 'string', ['null' => true])
             ->addIndex('username', ['unique' => true])
             ->create();
    }
}
