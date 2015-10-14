<?php
namespace App\Controllers;

use Core\BaseController;

class HomeController extends BaseController
{
    public function index($page = null)
    {
        $hostname = $this->app->config('db.host');
        $username = $this->app->config('db.user');
        $dbname   = $this->app->config('db.name');
        $password = $this->app->config('db.pass');

        // Create connection
        mysql_connect($hostname,$username,$password);
        @mysql_select_db($dbname) or die( "Unable to select database");

        $query = "SELECT * FROM table;";
        mysql_query($query);



        $sql = "SELECT title, description, details, post_date FROM events";
        $result = mysql_query($sql);

        if ($result->num_rows > 0) {
            // output data of each row
            while($row = $result->fetch_assoc()) {
                foreach ($row as $key => $val) {
                    echo $key.': ' . $val. ' ';
                }
                echo "<br>";
            }
        } else {
            echo "NO results";
        }
        mysql_close();



        include("index.html");
    }
}