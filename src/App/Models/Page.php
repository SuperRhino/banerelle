<?php
namespace App\Models;

use Core\Database\Model;

class Page extends Model {

    protected static $table = 'pages';

    var $id;
    var $title;
    var $uri;
    var $article;
    var $preview_image;
    var $category;
    var $meta_title;
    var $meta_description;
    var $meta_keywords;
    var $author_id;
    var $post_date;
    var $updated_date;
    var $status;

    function __construct($values = [])
    {
        $this->id = (int) array_get($values, 'id');
        $this->title = array_get($values, 'title');
        $this->uri = array_get($values, 'uri');
        $this->article = array_get($values, 'article');
        $this->preview_image = array_get($values, 'preview_image');
        $this->category = array_get($values, 'category');
        $this->meta_title = array_get($values, 'meta_title');
        $this->meta_description = array_get($values, 'meta_description');
        $this->meta_keywords = array_get($values, 'meta_keywords');
        $this->author_id = (int) array_get($values, 'author_id');
        $this->post_date = array_get($values, 'post_date') ?: date('Y-m-d H:i:s');
        $this->updated_date = array_get($values, 'updated_date');
        $this->status = array_get($values, 'status') ? 1 : 0;
    }

    public function updateData($values = [])
    {
        if (isset($values['title'])) {
            $this->title = array_get($values, 'title');
        }
        if (isset($values['uri'])) {
            $this->uri = array_get($values, 'uri');
        }
        if (isset($values['article'])) {
            $this->article = array_get($values, 'article');
        }
        if (isset($values['preview_image'])) {
            $this->preview_image = array_get($values, 'preview_image');
        }
        if (isset($values['category'])) {
            $this->category = array_get($values, 'category');
        }
        if (isset($values['meta_title'])) {
            $this->meta_title = array_get($values, 'meta_title');
        }
        if (isset($values['meta_description'])) {
            $this->meta_description = array_get($values, 'meta_description');
        }
        if (isset($values['meta_keywords'])) {
            $this->meta_keywords = array_get($values, 'meta_keywords');
        }
        if (isset($values['author_id'])) {
            $this->author_id = (int) array_get($values, 'author_id');
        }
        if (isset($values['post_date'])) {
            $this->post_date = array_get($values, 'post_date');
        }
        if (isset($values['status'])) {
            $this->status = array_get($values, 'status') ? 1 : 0;
        }
    }

    public function save()
    {
        if (! $this->id) {
            $this->createPage();
        } else {
            $this->updatePage();
        }
    }

    protected function createPage()
    {
        // TODO (see below)
        //$article = str_ireplace('<img ', '<img class="img-responsive" ', $this->article);

        $insert = static::$app->query->newInsert();
        $insert->into(static::$table)
               ->cols($this->getQueryCols());

        // prepare the statement + execute with bound values
        $sth = static::$app->db->prepare($insert->getStatement());
        $sth->execute($insert->getBindValues());

        $this->id = static::$app->db->lastInsertId();

        return $this->id;
    }

    protected function updatePage()
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
            'title' => $this->title,
            'uri' => $this->uri,
            'article' => $this->article,
            'preview_image' => $this->preview_image,
            'category' => $this->category,
            'meta_title' => $this->meta_title,
            'meta_description' => $this->meta_description,
            'meta_keywords' => $this->meta_keywords,
            'author_id' => $this->author_id,
            'post_date' => $this->post_date,
            'status' => $this->status,
        ];
    }

    public function toArray()
    {
        return [
            'id' => (int) $this->id,
            'title' => $this->title,
            'uri' => $this->uri,
            'article' => $this->article,
            'preview_image' => $this->preview_image,
            'category' => $this->category,
            'meta_title' => ! empty($this->meta_title) ? $this->meta_title : $this->title,
            'meta_description' => $this->meta_description,
            'meta_keywords' => $this->meta_keywords,
            'post_date' => $this->post_date,
            'updated_date' => $this->updated_date,
            'author_id' => $this->author_id,
            'status' => $this->status,
        ];
    }

    public function isPublished()
    {
        return ($this->status === 1);
    }

    public static function findMostRecent($limit = 3)
    {
        $query = static::$app->query->newSelect();
        $query->cols(['*'])
              ->from(static::$table)
              ->where('status=1')
              ->where('(category IS NULL OR category != "Hidden")')
              ->orderBy(['post_date desc'])
              ->limit($limit);

        $pages = [];
        $res = static::$app->db->fetchAll($query);
        foreach ($res as $page) {
            $pages []= new Page($page);
        }

        return $pages;
    }

    public static function findByPageName($pageName)
    {
        $query = static::$app->query->newSelect();
        $query->cols(['*'])
              ->from(static::$table)
              ->where('status=1')
              ->where('uri="'.$pageName.'"')
              ->limit(1);

        $result = static::$app->db->fetchOne($query);
        if (! $result) {
            return null;
        }

        return new Page($result);
    }

    public static function findById($pageId)
    {
        $query = static::$app->query->newSelect();
        $query->cols(['*'])
              ->from(static::$table)
              ->where('id='.$pageId);

        $result = static::$app->db->fetchOne($query);
        if (! $result) {
            return null;
        }

        return new Page($result);
    }

    public static function findAll()
    {
        $query = static::$app->query->newSelect();
        $query->cols(['*'])
              ->from(static::$table)
              ->orderBy(['if(updated_date, updated_date, post_date) desc']);

        $pages = [];
        $res = static::$app->db->fetchAll($query);
        foreach ($res as $page) {
            $pages []= (new Page($page))->toArray();
        }

        return $pages;
    }
}
