<?php
namespace App\Controllers;

use Core\BaseController;
use App\Models\Page;
use Core\Http\Exception\NotFoundException;

class AdminController extends BaseController
{
    /**
     * ADMIN ROUTES
     */
    public function pageEditor()
    {
        return $this->view('admin/page-editor.html');
    }

    public function pageInventory()
    {
        return $this->view('admin/page-inventory.html');
    }
}