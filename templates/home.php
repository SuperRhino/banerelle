<?php
/**
 * Created by PhpStorm.
 * User: ryanpastorelle
 * Date: 10/17/15
 * Time: 2:47 PM
 */

    /** @var $events [id, title, description, details, post_date, event_date] */

?><!doctype html>
<html class="no-js" lang="">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
    <title></title>
    <meta name="description" content="">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="apple-touch-icon" href="apple-touch-icon.png">

    <link rel="stylesheet" href="css/bootstrap.min.css">
    <style>
        body {
            padding-top: 50px;
            padding-bottom: 20px;
        }
    </style>
    <link rel="stylesheet" href="css/bootstrap-theme.min.css">
    <link rel="stylesheet" href="css/main.css">

    <script src="js/vendor/modernizr-2.8.3.min.js"></script>
</head>
<body>
<!--[if lt IE 8]>
<p class="browserupgrade">You are using an <strong>outdated</strong> browser. Please <a href="http://browsehappy.com/">upgrade your browser</a> to improve your experience.</p>
<![endif]-->
<nav class="navbar navbar-inverse navbar-fixed-top" role="navigation">
    <div class="container">
        <div class="navbar-header">
            <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar">
                <span class="sr-only">Toggle navigation</span>
                <span class="icon-bar"></span>
                <span class="icon-bar"></span>
                <span class="icon-bar"></span>
            </button>
            <a class="navbar-brand" href="#">Banerelle.com</a>
        </div>
    </div>
</nav>

<!-- Main jumbotron for a primary marketing message or call to action -->
<div class="jumbotron">
    <div class="container">
        <h1>Banerelle!</h1>
        <p>The start of something awesome.</p>
        <p><a class="btn btn-primary btn-lg" href="#" role="button">Coming Soon. Stay tuned...</a></p>
    </div>
</div>

<div class="container">
    <!-- Example row of columns -->
    <div class="row">
        <?php
        for ($i=0; $i<3; $i++) :
            $event = $events[$i];
            $title = $event['title'];
            $description = $event['description'];
            $details = $event['details'];
            $date = ! empty($event['event_date']) ? $event['event_date'] : $event['post_date'];
            $date = date('M j, Y', strtotime($date));
        ?>
        <div class="col-md-4">
            <h2><?= $title; ?></h2>
            <p><em><?= $date; ?></em></p>
            <p><?= $description; ?></p>
            <?php if ($details): ?>
            <p><a class="btn btn-default" href="#" role="button">View details &raquo;</a></p>
            <?php endif; ?>
        </div>
        <?php endfor; ?>
    </div>

    <hr>

    <footer>
        <p>&copy; Company 2015</p>
    </footer>
</div> <!-- /container -->        <script src="//ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min.js"></script>
<script>window.jQuery || document.write('<script src="js/vendor/jquery-1.11.2.min.js"><\/script>')</script>

<script src="js/vendor/bootstrap.min.js"></script>

<script src="js/plugins.js"></script>
<script src="js/main.js"></script>

<!-- Google Analytics -->
<script>
    (function(b,o,i,l,e,r){b.GoogleAnalyticsObject=l;b[l]||(b[l]=
        function(){(b[l].q=b[l].q||[]).push(arguments)});b[l].l=+new Date;
        e=o.createElement(i);r=o.getElementsByTagName(i)[0];
        e.src='//www.google-analytics.com/analytics.js';
        r.parentNode.insertBefore(e,r)}(window,document,'script','ga'));
    ga('create','UA-67735723-2','auto');ga('send','pageview');
</script>
</body>
</html>