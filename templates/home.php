<?php
/**
 * Created by PhpStorm.
 * User: ryanpastorelle
 * Date: 10/17/15
 * Time: 2:47 PM
 */

    /** @var $events [id, title, description, details, post_date, event_date] */

?>
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
        <p><a class="btn btn-default" href="https://www.facebook.com/shayna.bane/posts/10153811147650628" role="button">View details &raquo;</a></p>
        <?php endif; ?>
    </div>
    <?php endfor; ?>
</div>