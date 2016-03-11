<?php

use Phinx\Migration\AbstractMigration;

class CreateGuestListTable extends AbstractMigration
{
    public function change()
    {
        $this->table('guests')
             ->addColumn('first_name', 'string', ['null' => false])
             ->addColumn('last_name', 'string', ['null' => false])
             ->addColumn('party_leader_name', 'string', ['null' => true])
             ->addColumn('address', 'string', ['null' => true])
             ->addColumn('phone', 'string', ['limit' => 20, 'null' => true])
             ->addColumn('email', 'string', ['null' => true])
             ->addColumn('rsvp', 'string', ['null' => true])
             ->addColumn('meal_option', 'string', ['null' => true])
             ->addIndex('first_name')
             ->addIndex('last_name')
             ->addIndex('party_leader_name')
             ->addIndex('rsvp')
             ->addIndex('meal_option')
             ->create();
    }
}
