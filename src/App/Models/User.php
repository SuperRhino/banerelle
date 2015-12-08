<?php
namespace App\Models;

use Core\Database\Model;

class User extends Model {

    var $id;
    var $username;

    function __construct($values = [])
    {
        $this->id = (int) array_get($values, 'id');
        $this->username = array_get($values, 'username');
    }

    public function toArray()
    {
        return [
            'id' => (int) $this->id,
            'username' => $this->username,
        ];
    }

    public static function findByUsername($username, $password)
    {
        $query = static::$app->query->newSelect();
        $query->cols(['id', 'username'])
              ->from('users')
              ->where('username="'.$username.'"')
              ->limit(1);

        $user = static::$app->db->fetchOne($query);
        return new User($user);
    }
}