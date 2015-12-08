<?php

use Phinx\Migration\AbstractMigration;

class CreateSessionsTable extends AbstractMigration
{
    public function change()
    {
        $this->table('sessions')
             ->addColumn('user_id', 'integer', ['null' => false])
             ->addColumn('created', 'datetime', ['null' => false])
             ->addIndex('user_id', ['unique' => true])
             ->create();
    }
}
