<?php
namespace App\Controllers;

use Core\BaseController;
use App\Models\Guest;
use App\Models\Rsvp;
use Core\Http\Exception\NotFoundException;

class AdminController extends BaseController
{
    /**
     * ADMIN ROUTES
     */
    public function index()
    {
        return $this->view('admin/index.html');
    }

    public function pageEditor()
    {
        return $this->view('admin/page-editor.html');
    }

    public function pageInventory()
    {
        return $this->view('admin/page-inventory.html');
    }

    public function guestList()
    {
        return $this->view('admin/guest-list.html', [
            'guests' => Guest::findAll(),
        ]);
    }

    public function manageRsvp()
    {
        return $this->view('admin/manage-rsvp.html', [
            'rsvps' => Rsvp::findAllPending(),
        ]);
    }
}
