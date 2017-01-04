<?php

use Phinx\Migration\AbstractMigration;

class AddAddressFields extends AbstractMigration
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
        $this->table('guests')
             ->addColumn('address_street', 'string', ['null' => true, 'after' => 'address'])
             ->addColumn('address_city', 'string', ['null' => true, 'after' => 'address_street'])
             ->addColumn('address_state', 'string', ['null' => true, 'after' => 'address_city'])
             ->addColumn('address_zip', 'string', ['null' => true, 'after' => 'address_state'])
             ->update();
    }
}
