<?php
namespace App\Controllers\Api;

use App\Models\User;
use App\Models\Guest;
use App\Models\GuestMessage;
use App\Models\Rsvp;
use Core\BaseApiController;
use Core\Http\Exception\BadRequestException;
use Core\Http\Exception\NotFoundException;

class GuestController extends BaseApiController
{
    public function addGuestMessage()
    {
        $name = $this->json('name');
        $message = $this->json('message');

        if (! $name) {
            throw new BadRequestException('Let us know who you are! (Name is required)');
        }

        if (! $message) {
            throw new BadRequestException('Write us a message!');
        }

        $message = new GuestMessage([
            'name' => $name,
            'message' => $message,
        ]);

        $message->create();

        return $this->success($message->toArray());
    }

    public function rsvp()
    {
        $rsvp = $this->json('rsvp');
        $rsvp_num = (int) $this->json('rsvp_num');
        $primary_name = $this->json('primary_name');
        $secondary_name = $this->json('secondary_name');

        if (! $rsvp) {
            throw new BadRequestException('Missing RSVP!');
        }
        if (! $primary_name) {
            throw new BadRequestException('Missing your name!');
        }
        if ($rsvp === 'y') {
            if (! $rsvp_num) {
                throw new BadRequestException('Missing number of attendees!');
            }
            if ($rsvp_num === 2 && ! $secondary_name) {
                throw new BadRequestException('Missing your date\'s name!');
            }
        }

        $rsvp = new Rsvp([
            'primary_name' => $primary_name,
            'secondary_name' => $secondary_name,
            'rsvp' => $rsvp,
            'rsvp_num' => ($rsvp === 'y') ? $rsvp_num : 0,
        ]);

        $rsvp->save();

        return $this->success($rsvp->toArray());
    }

    public function rsvpEmail($request)
    {
        $rsvpId = (int) $request->getAttribute('id');
        $rsvp = Rsvp::findById($rsvpId);
        if (! $rsvp) {
            throw new NotFoundException('RSVP not found');
        }

        $email = $this->json('rsvp_email');
        if (filter_var($email, FILTER_VALIDATE_EMAIL) === false) {
            throw new NotFoundException('Invalid email, sorry.');
        }

        $rsvp->rsvp_email = $email;
        $rsvp->save();

        return $this->success($rsvp->toArray());
    }

    public function verifyRsvp($request)
    {
        $user = $this->app->getCurrentUser();
        if (! $user) {
            throw new NotFoundException('User not found');
        }

        $rsvpId = (int) $this->json('id');
        $rsvp = Rsvp::findById($rsvpId);
        if (! $rsvp) {
            throw new NotFoundException('RSVP ('.$rsvpId.') not found');
        }

        $rsvp->verify($user);

        return $this->success($rsvp->toArray());
    }

    public function addGuest()
    {
        $user = $this->app->getCurrentUser();
        if (! $user) {
            throw new NotFoundException('User not found');
        }

        $data = $this->json();

        // Validate:
        if (empty($data['first_name']) || empty($data['last_name'])) {
            throw new BadRequestException('First + last name are required.');
        }

        $res = [];

        // Save Guest:
        $guest   = new Guest($data);
        $guestId = $guest->save();
        $res []= $guest->toArray();

        // Add Plus One for this guest?
        if ($guestId && $this->json('plusOne')) {
            $plusOne = new Guest($data);
            $plusOne->last_name = $plusOne->last_name . '\'s +1';
            $plusOne->save();
            $res []= $plusOne->toArray();
        }

        return $this->success($res);
    }

    public function updateGuest($request)
    {
        $user = $this->app->getCurrentUser();
        if (! $user) {
            throw new NotFoundException('User not found');
        }

        $guestId = (int) $request->getAttribute('id');
        $guest = Guest::findById($guestId);
        if (! $guest) {
            throw new NotFoundException('Guest ('.$guestId.') not found');
        }

        $data = $this->json();
        $guest->updateData($data);
        $guest->save();

        return $this->success([$guest->toArray()]);
    }

    public function removeGuest($request)
    {
        $user = $this->app->getCurrentUser();
        if (! $user) {
            throw new NotFoundException('User not found');
        }

        $guestId = (int) $request->getAttribute('id');
        $guest = Guest::findById($guestId);
        if (! $guest) {
            throw new NotFoundException('Guest ('.$guestId.') not found');
        }

        $guest->delete();
    }
}
