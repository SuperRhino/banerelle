<?php
namespace App\Models;

use Core\Database\Model;

class Guest extends Model {

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
              ->from('guests')
              ->orderBy(['party_leader_name asc', 'last_name asc', 'first_name asc']);

        $guests = [];
        $res = static::$app->db->fetchAll($query);
        foreach ($res as $guest) {
            $guests []= (new Guest($guest))->toArray();
        }

        return $guests;
    }
}