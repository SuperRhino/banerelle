<?php
/**
 * Auth route middleware
 */
$must_auth = function($request, $response, $next)
{
    $params = $request->getQueryParams();
    $token = array_get($params, 'token');

    if (is_null($token)) {
        throw new \Core\Http\Exception\BadRequestException('Missing token URL parameter.');
    }

    if (! $this['app']->validateToken($token)) {
        throw new \Core\Http\Exception\UnauthorizedException('Invalid token.');
    }

    return $next($request, $response);
};

/**
 * Public Pages Routes:
 */
$this->get('/', 'App\Controllers\HomeController:index');
$this->get('/rsvp', 'App\Controllers\HomeController:rsvp');
$this->get('/guest-book', 'App\Controllers\HomeController:guestBook');
$this->get('/{pageName}', 'App\Controllers\HomeController:showPage');

/**
 * Admin Page Routes:
 */
$this->get('/admin/page-editor', 'App\Controllers\AdminController:pageEditor');
$this->get('/admin/page-inventory', 'App\Controllers\AdminController:pageInventory');
$this->get('/admin/guest-list', 'App\Controllers\AdminController:guestList');

/**
 * API Routes:
 */
$this->post('/api/account/login', 'App\Controllers\Api\AccountController:login');
$this->post('/api/account/logout', 'App\Controllers\Api\AccountController:logout')->add($must_auth);
$this->get('/api/account', 'App\Controllers\Api\AccountController:getUser')->add($must_auth);

$this->post('/api/guests',       'App\Controllers\Api\GuestController:addGuest')->add($must_auth);
$this->post('/api/guests/messages',  'App\Controllers\Api\GuestController:addGuestMessage');
$this->post('/api/guests/{id}',  'App\Controllers\Api\GuestController:updateGuest')->add($must_auth);
$this->delete('/api/guests/{id}', 'App\Controllers\Api\GuestController:removeGuest')->add($must_auth);

$this->get('/api/pages',         'App\Controllers\Api\PageController:getPages')->add($must_auth);
$this->post('/api/pages',        'App\Controllers\Api\PageController:addPage')->add($must_auth);
$this->get('/api/pages/{id}',    'App\Controllers\Api\PageController:getPage')->add($must_auth);
$this->post('/api/pages/{id}',   'App\Controllers\Api\PageController:updatePage')->add($must_auth);
$this->post('/api/upload-file',  'App\Controllers\Api\PageController:uploadFile')->add($must_auth);

// Catch all for any API route
$this->any('/api/{endpoint}', 'Core\BaseApiController:notFound');
