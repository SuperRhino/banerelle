<?php
namespace App\Controllers\Api;

use App\Models\User;
use App\Models\Guest;
use App\Models\GuestMessage;
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
            throw new BadRequestException('Your name is required.');
        }

        if (! $message) {
            throw new BadRequestException('Message is required.');
        }

        $message = new GuestMessage([
            'name' => $name,
            'message' => $message,
        ]);

        $message->create();

        return $this->success($message->toArray());
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