<?php
namespace App\Models;

use Core\Database\Model;

class Rsvp extends Model {

    protected static $table = 'rsvps';

    var $id;
    var $primary_name;
    var $secondary_name;
    var $rsvp;
    var $rsvp_num;
    var $rsvp_date;
    var $rsvp_email;
    var $quiz_drink;
    var $quiz_meal;
    var $quiz_song;
    var $verify_date;
    var $verify_by;

    function __construct($values = [])
    {
        $this->id = (int) array_get($values, 'id');
        $this->primary_name = array_get($values, 'primary_name');
        $this->secondary_name = array_get($values, 'secondary_name');
        $this->rsvp = array_get($values, 'rsvp');
        $this->rsvp_num = (int) array_get($values, 'rsvp_num');
        $this->rsvp_date = array_get($values, 'rsvp_date') ?: date('Y-m-d H:i:s');
        $this->rsvp_email = array_get($values, 'rsvp_email');
        $this->quiz_drink = array_get($values, 'quiz_drink');
        $this->quiz_meal = array_get($values, 'quiz_meal');
        $this->quiz_song = array_get($values, 'quiz_song');
        $this->verify_date = array_get($values, 'verify_date');
        $this->verify_by = array_get($values, 'verify_by');
    }

    public function toArray()
    {
        return [
            'id' => (int) $this->id,
            'primary_name' => $this->primary_name,
            'secondary_name' => $this->secondary_name,
            'rsvp' => $this->rsvp,
            'rsvp_num' => $this->rsvp_num,
            'rsvp_date' => $this->rsvp_date,
            'rsvp_email' => $this->rsvp_email,
            'quiz_drink' => $this->quiz_drink,
            'quiz_meal' => $this->quiz_meal,
            'quiz_song' => $this->quiz_song,
            'verify_date' => $this->verify_date,
            'verify_by' => (int) $this->verify_by,
        ];
    }

    public static function findAllPending()
    {
        $query = static::$app->query->newSelect();
        $query->cols(['*'])
              ->from(static::$table)
              //->where('verify_date is null')
              ->orderBy(['verify_date is null DESC', 'rsvp_date desc', 'primary_name asc', 'secondary_name asc']);

        $rsvps = [];
        $res = static::$app->db->fetchAll($query);
        foreach ($res as $rsvp) {
            $rsvps []= (new Rsvp($rsvp))->toArray();
        }

        return $rsvps;
    }

    public static function findById($id)
    {
        $query = static::$app->query->newSelect();
        $query->cols(['*'])
              ->from(static::$table)
              ->where('id='.$id);

        $result = static::$app->db->fetchOne($query);
        if (! $result) {
            return null;
        }

        return new Rsvp($result);
    }

    public function updateData($values = [])
    {
        if (isset($values['primary_name'])) {
            $this->primary_name = array_get($values, 'primary_name');
        }
        if (isset($values['secondary_name'])) {
            $this->secondary_name = array_get($values, 'secondary_name');
        }
        if (isset($values['rsvp'])) {
            $this->rsvp = array_get($values, 'rsvp');
        }
        if (isset($values['rsvp_num'])) {
            $this->rsvp_num = array_get($values, 'rsvp_num');
        }
        if (isset($values['rsvp_date'])) {
            $this->rsvp_date = array_get($values, 'rsvp_date');
        }
        if (isset($values['rsvp_email'])) {
            $this->rsvp_email = array_get($values, 'rsvp_email');
        }
        if (isset($values['quiz_drink'])) {
            $this->quiz_drink = array_get($values, 'quiz_drink');
        }
        if (isset($values['quiz_meal'])) {
            $this->quiz_meal = array_get($values, 'quiz_meal');
        }
        if (isset($values['quiz_song'])) {
            $this->quiz_song = array_get($values, 'quiz_song');
        }
        if (isset($values['verify_date'])) {
            $this->verify_date = array_get($values, 'verify_date');
        }
        if (isset($values['verify_by'])) {
            $this->verify_by = (int) array_get($values, 'verify_by');
        }
    }

    public function verify($user)
    {
        $this->updateData([
            'verify_date' => date('Y-m-d H:i:s'),
            'verify_by' => $user->id,
        ]);
        $this->save();
    }

    public function save()
    {
        if (! $this->id) {
            $this->create();
        } else {
            $this->update();
        }

        return $this->id;
    }

    protected function create()
    {
        $insert = static::$app->query->newInsert();
        $insert->into(static::$table)
               ->cols($this->getQueryCols());

        // prepare the statement + execute with bound values
        $sth = static::$app->db->prepare($insert->getStatement());
        $sth->execute($insert->getBindValues());

        $this->id = static::$app->db->lastInsertId();

        return $this->id;
    }

    protected function update()
    {
        $update = static::$app->query->newUpdate();
        $update->table(static::$table)
               ->cols($this->getQueryCols())
               ->where('id = ?', $this->id);

        // prepare the statement + execute with bound values
        $sth = static::$app->db->prepare($update->getStatement());
        $sth->execute($update->getBindValues());

        return $this->id;
    }

    protected function getQueryCols()
    {
        return [
            'primary_name' => $this->primary_name,
            'secondary_name' => $this->secondary_name,
            'rsvp' => $this->rsvp,
            'rsvp_num' => $this->rsvp_num,
            'rsvp_date' => $this->rsvp_date,
            'rsvp_email' => $this->rsvp_email,
            'quiz_drink' => $this->quiz_drink,
            'quiz_meal' => $this->quiz_meal,
            'quiz_song' => $this->quiz_song,
            'verify_date' => $this->verify_date,
            'verify_by' => $this->verify_by,
        ];
    }
}
