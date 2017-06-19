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

    public function guestListDownload()
    {
        $user = $this->getCurrentUser();
        if (! $user) {
            throw new NotFoundException('Page not found');
        }

        $yes = isset($_GET['yes']) && $_GET['yes'] == '1';

        $guests = $yes ? Guest::findYesForExport() : Guest::findForExport();
        $data = $this->toCSV($guests);

        return $this->download($data);
    }

    public function manageRsvp()
    {
        return $this->view('admin/manage-rsvp.html', [
            'rsvps' => Rsvp::findAllPending(),
        ]);
    }

    protected function toCSV($array)
    {
        if (count($array) == 0) {
          return null;
        }

        ob_start();
        $df = fopen("php://output", 'w');
        fputcsv($df, array_keys(reset($array)));
        foreach ($array as $row) {
           fputcsv($df, $row);
        }
        fclose($df);

        return ob_get_clean();
    }
}
