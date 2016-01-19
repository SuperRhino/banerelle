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

$this->get('/', 'App\Controllers\HomeController:index');
$this->get('/rsvp', 'App\Controllers\HomeController:rsvp');

$this->post('/api/account/login', 'App\Controllers\Api\AccountController:login');
$this->post('/api/account/logout', 'App\Controllers\Api\AccountController:logout')->add($must_auth);
$this->get('/api/account', 'App\Controllers\Api\AccountController:getUser')->add($must_auth);

// Catch all for any API route
$this->any('/api/{endpoint}', 'Core\BaseApiController:notFound');
