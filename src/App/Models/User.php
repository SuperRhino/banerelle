<?php
namespace App\Models;

use Core\Database\Model;

class User extends Model {

    var $id;
    var $username;
    var $password;
    var $session_id;

    function __construct($values = [])
    {
        $this->id = (int) array_get($values, 'id');
        $this->username = array_get($values, 'username');
        $this->password = array_get($values, 'password');
    }

    public function toArray()
    {
        return [
            'id' => (int) $this->id,
            'username' => $this->username,
            'session_id' => static::$app->hashids->encode($this->session_id),
        ];
    }

    public function findOrCreateSession()
    {
        $this->loadSession();
        if (! $this->session_id) {
            $this->createSession();
            $this->loadSession();
        }

        return $this->session_id;
    }

    protected function loadSession()
    {
        $query = static::$app->query->newSelect();
        $query->cols(['id'])
              ->from('sessions')
              ->where('user_id="'.$this->id.'"')
              ->limit(1);
        $this->session_id = (int) static::$app->db->fetchValue($query) ?: null;
    }

    protected function createSession()
    {
        $insert = 'INSERT INTO sessions (user_id, created) VALUES ("'.$this->id.'", "'.date('Y-m-d H:i:s').'")';
        static::$app->db->query($insert);
    }

    public function removeSession()
    {
        $delete = 'DELETE FROM sessions WHERE user_id = "'.$this->id.'"';
        static::$app->db->query($delete);
    }

    public static function findByUsername($username, $password)
    {
        $query = static::$app->query->newSelect();
        $query->cols(['id', 'username', 'password'])
              ->from('users')
              ->where('username="'.$username.'"')
              ->limit(1);

        $user = static::$app->db->fetchOne($query);
        return $user ? new User($user) : null;
    }

    public static function findByToken($token)
    {
        $sessionId = static::$app->hashids->decode($token)[0];
        $query = static::$app->query->newSelect();
        $query->cols(['u.id', 'u.username', 'u.password'])
              ->from('sessions as s')
              ->join('inner', 'users as u', 'u.id = s.user_id')
              ->where('s.id="'.$sessionId.'"')
              ->limit(1);

        $user = static::$app->db->fetchOne($query);
        if (! $user) {
            return null;
        }

        $user = new User($user);
        $user->session_id = $sessionId;
        return $user;
    }
}