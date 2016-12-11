<?php

use Phinx\Migration\AbstractMigration;

class CreateRsvps extends AbstractMigration
{
    public function change()
    {
        $this->table('rsvps')
             ->addColumn('primary_name', 'string', ['null' => false])
             ->addColumn('secondary_name', 'string', ['null' => true])
             ->addColumn('rsvp', 'char', ['null' => false, 'limit' => 1])
             ->addColumn('rsvp_num', 'integer', ['null' => false, 'default' => 0, 'limit' => 1])
             ->addColumn('rsvp_date', 'datetime', ['null' => false])
             ->addColumn('rsvp_email', 'string', ['null' => true])
             ->addColumn('verify_date', 'datetime', ['null' => true])
             ->addColumn('verify_by', 'integer', ['null' => true])
             ->addIndex('primary_name')
             ->addIndex('secondary_name')
             ->addIndex('rsvp')
             ->addIndex('verify_date')
             ->create();
    }
}
