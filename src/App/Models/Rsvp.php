<?php
namespace App\Models;

use Core\Database\Model;

class Rsvp extends Model {

    protected static $table = 'rsvps';

    var $id;
    var $primary_name;
    var $secondary_name;
    var $rsvp;
    var $rsvp_date;
    var $verify_date;
    var $verify_by;

    function __construct($values = [])
    {
        $this->id = (int) array_get($values, 'id');
        $this->primary_name = array_get($values, 'primary_name');
        $this->secondary_name = array_get($values, 'secondary_name');
        $this->rsvp = array_get($values, 'rsvp');
        $this->rsvp_date = array_get($values, 'rsvp_date') ?: date('Y-m-d H:i:s');
    }

    public function toArray()
    {
        return [
            'id' => (int) $this->id,
            'primary_name' => $this->primary_name,
            'secondary_name' => $this->secondary_name,
            'rsvp' => $this->rsvp,
            'rsvp_date' => $this->rsvp_date,
            'verify_date' => $this->verify_date,
            'verify_by' => (int) $this->verify_by,
        ];
    }

    public static function findAllPending()
    {
        $query = static::$app->query->newSelect();
        $query->cols(['*'])
              ->from(static::$table)
              ->orderBy(['verify_date desc', 'primary_name asc', 'secondary_name asc']);

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
        if (isset($values['rsvp_date'])) {
            $this->rsvp_date = array_get($values, 'rsvp_date');
        }
        if (isset($values['verify_date'])) {
            $this->verify_date = array_get($values, 'verify_date');
        }
        if (isset($values['verify_by'])) {
            $this->verify_by = (int) array_get($values, 'verify_by');
        }
    }

    public function save()
    {
        if (! $this->id) {
            $this->createRsvp();
        } else {
            $this->updateRsvp();
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

    protected function createRsvp()
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

    protected function updateRsvp()
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
            'rsvp_date' => $this->rsvp_date,
            'verify_date' => $this->verify_date,
            'verify_by' => $this->verify_by,
        ];
    }
}
