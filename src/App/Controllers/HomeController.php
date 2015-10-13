<?php
namespace App\Controllers;

use Core\BaseController;

class HomeController extends BaseController
{
    public function index()
    {
        echo "<h1>Squad API - OK</h1>";
    }
}