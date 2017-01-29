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
    var $address_street;
    var $address_city;
    var $address_state;
    var $address_zip;
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
        $this->address_street = array_get($values, 'address_street');
        $this->address_city = array_get($values, 'address_city');
        $this->address_state = array_get($values, 'address_state');
        $this->address_zip = array_get($values, 'address_zip');
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
            'address_street' => $this->address_street,
            'address_city' => $this->address_city,
            'address_state' => $this->address_state,
            'address_zip' => $this->address_zip,
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

    /**
     * Find all guests for export.
     * @return {array} [guests, address_street, address_city, address_state, address_zip, (int) invites]
     *
    **/
    public static function findForExport()
    {
        $query = static::$app->query->newSelect();
        $query->cols([
                'g.id',
                'if (count(distinct p2.last_name) = 1,
                    if (count(distinct p.id) = 0,
                        trim(concat(g.first_name, " ", g.last_name)),
                        trim(concat(g.first_name, " & ", trim(group_concat(distinct p.first_name separator " & ")), " ", g.last_name))
                    ),
                    if (LOCATE("+1", group_concat(distinct p.last_name)),
                        trim(concat(g.first_name, " ", g.last_name)),
                        trim(CONCAT(g.first_name, " ", g.last_name, " & ", p.first_name, " ", p.last_name))
                    )
                ) as guests',
                'g.address_street',
                'g.address_city',
                'g.address_state',
                'g.address_zip',
                'g.phone',
                'count(distinct p2.id) as invites',
              ])
              ->from(static::$table.' as g')
              // join guests for all accompanying the primary
              ->join('left',
                    'guests as p',
                    'p.party_leader_name = g.party_leader_name AND g.party_leader_name <> concat(p.first_name, " ", p.last_name)')
              // join all for this party leader
              ->join('left',
                    'guests as p2',
                    'p2.party_leader_name = g.party_leader_name')
              // where "guest [g]" is the primary
              ->where('g.party_leader_name = concat(g.first_name, " ", g.last_name)')
              // group by primary guest
              ->groupBy(['g.id'])
              // order by has-address, then by primary last name
              ->orderBy([
                  'g.address_street IS NULL',
                  'g.last_name'
              ]);

        $guests = [];
        $res = static::$app->db->fetchAll($query);
        foreach ($res as $guest) {
            // $guests []= (new Guest($guest))->toArray();
            $guests []= $guest;
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
        if (isset($values['address_street'])) {
            $this->address_street = array_get($values, 'address_street');
        }
        if (isset($values['address_city'])) {
            $this->address_city = array_get($values, 'address_city');
        }
        if (isset($values['address_state'])) {
            $this->address_state = array_get($values, 'address_state');
        }
        if (isset($values['address_zip'])) {
            $this->address_zip = array_get($values, 'address_zip');
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
            'address_street' => $this->address_street,
            'address_city' => $this->address_city,
            'address_state' => $this->address_state,
            'address_zip' => $this->address_zip,
            'phone' => $this->phone,
            'email' => $this->email,
            'rsvp' => $this->rsvp,
            'meal_option' => $this->meal_option,
        ];
    }
}
