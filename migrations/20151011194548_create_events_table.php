<?php

use Phinx\Migration\AbstractMigration;

class CreateEventsTable extends AbstractMigration
{
    /**
     * Change Method.
     *
     * Write your reversible migrations using this method.
     *
     * More information on writing migrations is available here:
     * http://docs.phinx.org/en/latest/migrations.html#the-abstractmigration-class
     *
     * The following commands can be used in this method and Phinx will
     * automatically reverse them when rolling back:
     *
     *    createTable
     *    renameTable
     *    addColumn
     *    renameColumn
     *    addIndex
     *    addForeignKey
     *
     * Remember to call "create()" or "update()" and NOT "save()" when working
     * with the Table class.
     */
    public function change()
    {
        $this->table('events')
             ->addColumn('title', 'string', ['limit' => 20, 'null' => false])
             ->addColumn('description', 'string', ['null' => true])
             ->addColumn('details_uri', 'string', ['null' => true])
             ->addColumn('post_date', 'datetime', ['null' => false])
             ->addColumn('event_date', 'datetime', ['null' => true])
             ->addIndex('title')
             ->addIndex('details_uri')
             ->addIndex('post_date')
             ->addIndex('event_date')
             ->create();
    }
}
