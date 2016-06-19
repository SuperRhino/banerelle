<?php
namespace App\Models;

use Core\Database\Model;

class GuestMessage extends Model {

    var $id;
    var $name;
    var $message;
    var $post_date;
    var $status;

    function __construct($values = [])
    {
        $this->id = (int) array_get($values, 'id');
        $this->name = array_get($values, 'name');
        $this->message = array_get($values, 'message');
        $this->post_date = array_get($values, 'post_date') ?: date('Y-m-d H:i:s');
        $this->status = array_get($values, 'status', 1) ? 1 : 0;
    }

    public function toArray()
    {
        return [
            'id' => (int) $this->id,
            'name' => $this->name,
            'message' => $this->message,
            'post_date' => $this->post_date,
        ];
    }

    public static function findAll()
    {
        $query = static::$app->query->newSelect();
        $query->cols(['*'])
              ->from('guest_messages')
              ->where('status=1')
              ->orderBy(['post_date desc']);

        $messages = [];
        $res = static::$app->db->fetchAll($query);
        foreach ($res as $message) {
            $messages []= (new GuestMessage($message))->toArray();
        }

        return $messages;
    }

    public function create()
    {
        $insert = static::$app->query->newInsert();
        $insert->into('guest_messages')
               ->cols($this->getQueryCols());

        // prepare the statement + execute with bound values
        $sth = static::$app->db->prepare($insert->getStatement());
        $sth->execute($insert->getBindValues());

        $this->id = static::$app->db->lastInsertId();

        return $this->id;
    }

    protected function getQueryCols()
    {
        return [
            'name' => $this->name,
            'message' => $this->message,
            'post_date' => $this->post_date,
            'status' => $this->status,
        ];
    }
}