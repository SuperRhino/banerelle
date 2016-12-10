<?php
namespace App\Models;

use Core\Database\Model;

class Guest extends Model {

    protected static $table = 'guests';

    var $id;
    var $first_name;
    var $last_name;
    var $party_leader_name;
    var $address;
    var $phone;
    var $email;
    var $rsvp;
    var $meal_option;

    function __construct($values = [])
    {
        $this->id = (int) array_get($values, 'id');
        $this->first_name = array_get($values, 'first_name');
        $this->last_name = array_get($values, 'last_name');
        $this->party_leader_name = array_get($values, 'party_leader_name');
        $this->address = array_get($values, 'address');
        $this->phone = array_get($values, 'phone');
        $this->email = array_get($values, 'email');
        $this->rsvp = array_get($values, 'rsvp');
        $this->meal_option = array_get($values, 'meal_option');
    }

    public function toArray()
    {
        return [
            'id' => (int) $this->id,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'party_leader_name' => $this->party_leader_name,
            'address' => $this->address,
            'phone' => $this->phone,
            'email' => $this->email,
            'rsvp' => $this->rsvp,
            'meal_option' => $this->meal_option,
        ];
    }

    public static function findAll()
    {
        $query = static::$app->query->newSelect();
        $query->cols(['*'])
              ->from(static::$table)
              ->orderBy(['party_leader_name asc', 'last_name asc', 'first_name asc']);

        $guests = [];
        $res = static::$app->db->fetchAll($query);
        foreach ($res as $guest) {
            $guests []= (new Guest($guest))->toArray();
        }

        return $guests;
    }

    public static function findById($guestId)
    {
        $query = static::$app->query->newSelect();
        $query->cols(['*'])
              ->from(static::$table)
              ->where('id='.$guestId);

        $result = static::$app->db->fetchOne($query);
        if (! $result) {
            return null;
        }

        return new Guest($result);
    }

    public function updateData($values = [])
    {
        if (isset($values['first_name'])) {
            $this->first_name = array_get($values, 'first_name');
        }
        if (isset($values['last_name'])) {
            $this->last_name = array_get($values, 'last_name');
        }
        if (isset($values['party_leader_name'])) {
            $this->party_leader_name = array_get($values, 'party_leader_name');
        }
        if (isset($values['address'])) {
            $this->address = array_get($values, 'address');
        }
        if (isset($values['phone'])) {
            $this->phone = array_get($values, 'phone');
        }
        if (isset($values['email'])) {
            $this->email = array_get($values, 'email');
        }
        if (isset($values['rsvp'])) {
            $this->rsvp = array_get($values, 'rsvp');
        }
        if (isset($values['meal_option'])) {
            $this->meal_option = array_get($values, 'meal_option');
        }
    }

    public function save()
    {
        if (! $this->id) {
            $this->createGuest();
        } else {
            $this->updateGuest();
        }

        return $this->id;
    }

    public function delete()
    {
        $query = static::$app->query->newDelete();
        $query->from(static::$table)
              ->where('id = ?', $this->id);

      // prepare the statement + execute with bound values
      $sth = static::$app->db->prepare($query->getStatement());
      $sth->execute($query->getBindValues());
    }

    protected function createGuest()
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

    protected function updateGuest()
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
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'party_leader_name' => $this->party_leader_name,
            'address' => $this->address,
            'phone' => $this->phone,
            'email' => $this->email,
            'rsvp' => $this->rsvp,
            'meal_option' => $this->meal_option,
        ];
    }
}
