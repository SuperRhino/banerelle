<?php

use Phinx\Migration\AbstractMigration;

class CreatePagesTable extends AbstractMigration
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
        $this->table('pages')
             ->addColumn('title', 'string', ['null' => false])
             ->addColumn('uri', 'string', ['null' => true])
             ->addColumn('article', 'text', ['null' => true])
             ->addColumn('preview_image', 'string', ['null' => true])
             ->addColumn('category', 'string', ['limit' => 50, 'null' => true])
             ->addColumn('meta_title', 'string', ['null' => true])
             ->addColumn('meta_description', 'string', ['null' => true])
             ->addColumn('meta_keywords', 'string', ['null' => true])
             ->addColumn('author_id', 'integer', ['null' => false])
             ->addColumn('post_date', 'datetime', ['null' => false])
             ->addColumn('updated_date', 'datetime', ['null' => true])
             ->addColumn('status', 'integer', ['null' => false, 'limit' => 1, 'default' => 0])
             ->addIndex('title')
             ->addIndex('uri')
             ->addIndex('category')
             ->addIndex('author_id')
             ->addIndex('post_date')
             ->addIndex('updated_date')
             ->addIndex('status')
             ->create();
    }
}
