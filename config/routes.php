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

$should_auth = function($request, $response, $next)
{
    $cookies = $request->getCookieParams();
    $token = array_get($cookies, 'ACCESS_TOKEN');

    // Will set app->currentUser if logged in:
    $this['app']->validateToken($token);

    return $next($request, $response);
};

/**
 * Public Pages Routes:
 */
$this->get('/', 'App\Controllers\HomeController:index')->add($should_auth);
$this->get('/guest-book', 'App\Controllers\HomeController:guestBook');
$this->get('/photos', 'App\Controllers\HomeController:photos');
$this->get('/rsvp', 'App\Controllers\HomeController:rsvp');
$this->get('/admin', 'App\Controllers\AdminController:index')->add($should_auth);
// catch-all must be last:
$this->get('/{pageName}', 'App\Controllers\HomeController:showPage');

/**
 * Admin Page Routes:
 */
$this->get('/admin/page-editor', 'App\Controllers\AdminController:pageEditor')->add($should_auth);
$this->get('/admin/page-inventory', 'App\Controllers\AdminController:pageInventory')->add($should_auth);
$this->get('/admin/guest-list', 'App\Controllers\AdminController:guestList')->add($should_auth);
$this->get('/admin/manage-rsvp', 'App\Controllers\AdminController:manageRsvp')->add($should_auth);

/**
 * API Routes:
 */
$this->post('/api/account/login', 'App\Controllers\Api\AccountController:login');
$this->post('/api/account/logout', 'App\Controllers\Api\AccountController:logout')->add($must_auth);
$this->get('/api/account', 'App\Controllers\Api\AccountController:getUser')->add($must_auth);

$this->post('/api/guests',       'App\Controllers\Api\GuestController:addGuest')->add($must_auth);
$this->post('/api/guests/messages',  'App\Controllers\Api\GuestController:addGuestMessage');
$this->post('/api/guests/rsvp',  'App\Controllers\Api\GuestController:rsvp');
$this->post('/api/guests/rsvp/{id}',  'App\Controllers\Api\GuestController:rsvpEmail');
$this->post('/api/guests/verify-rsvp',  'App\Controllers\Api\GuestController:verifyRsvp')->add($must_auth);
$this->post('/api/guests/{id}',  'App\Controllers\Api\GuestController:updateGuest')->add($must_auth);
$this->delete('/api/guests/{id}', 'App\Controllers\Api\GuestController:removeGuest')->add($must_auth);

$this->get('/api/pages',         'App\Controllers\Api\PageController:getPages')->add($must_auth);
$this->post('/api/pages',        'App\Controllers\Api\PageController:addPage')->add($must_auth);
$this->get('/api/pages/{id}',    'App\Controllers\Api\PageController:getPage')->add($must_auth);
$this->post('/api/pages/{id}',   'App\Controllers\Api\PageController:updatePage')->add($must_auth);
$this->post('/api/upload-file',  'App\Controllers\Api\PageController:uploadFile')->add($must_auth);

// Catch all for any API route
$this->any('/api/{endpoint}', 'Core\BaseApiController:notFound');
