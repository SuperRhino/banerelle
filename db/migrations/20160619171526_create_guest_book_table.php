<?php

use Phinx\Migration\AbstractMigration;

class CreateGuestBookTable extends AbstractMigration
{
    public function change()
    {
        $this->table('guest_messages')
             ->addColumn('name', 'string', ['null' => false])
             ->addColumn('message', 'text', ['null' => false])
             ->addColumn('post_date', 'datetime', ['null' => false])
             ->addColumn('status', 'integer', ['null' => false, 'limit' => 1, 'default' => 1])
             ->addIndex('name')
             ->addIndex('post_date')
             ->addIndex('status')
             ->create();
    }
}
