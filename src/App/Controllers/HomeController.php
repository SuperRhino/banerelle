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
        $conn = new \mysqli($hostname, $username, $password, $dbname);
        // Check connection
        if ($conn->connect_error) {
            die("Connection failed: " . $conn->connect_error);
        }

        $sql = "SELECT title, description, details, post_date FROM events";
        $result = $conn->query($sql);

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
        $conn->close();



        include("index.html");
    }
}