<?php

use Phinx\Seed\AbstractSeed;

class PagesSeed extends AbstractSeed
{
    /**
     * Run Method.
     *
     * Write your database seeder using this method.
     *
     * More information on writing seeders is available here:
     * http://docs.phinx.org/en/latest/seeding.html
     */
    public function run()
    {
        // $insert = 'INSERT INTO `pages` (`id`, `title`,`meta_description`,`uri`,`post_date`,`updated_date`) VALUES
        //            (1, "Heading", "Donec id elit non mi porta gravida at eget metus. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Etiam porta sem malesuada magna mollis euismod. Donec sed odio dui.", "#", "2014-09-01 00:00:00", NULL),
        //            (2, "Heading Two", "Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Donec id elit non mi porta gravida at eget metus. Donec sed odio dui. Etiam porta sem malesuada magna mollis euismod.", NULL, "2014-09-01 00:00:00", "2014-10-01 00:00:00"),
        //            (3, "Heading Three", "Donec sed odio dui. Cras justo odio, dapibus ac facilisis in, egestas eget quam. Vestibulum id ligula porta felis euismod semper. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus.", "#", "2014-09-01 00:00:00", NULL)';
        // INSERT INTO `pages` (`id`, `title`, `meta_description`, `uri`, `post_date`, `status`)
        // VALUES
        // 	(4, 'We got engaged!', 'Shayna & Ryan have a very enjoyable day in an inspirational sunflower field. We started by visiting Merwin\'s Wharf for brunch on the river. Shayna plans out her whole day thinking Ryan was going to watch the Browns game. Ryan had other plans... ', NULL, '2015-09-27 14:05:00', 1),
        // 	(5, 'Spot the differences', 'Shayna makes it \"Facebook official\" with a spot-the-differences post. If you guessed: Picture \"A\" doesn\'t have a Lake Erie Monster sighting, you were correct.', 'https://www.facebook.com/shayna.bane/posts/10153811147650628', '2015-10-01 19:31:00', 1),
        // 	(6, 'Banerelle.com launch', 'Ryan makes use of his recent domain-name buying binge and turns Banerelle.com into the www hub for all things Pasto-Bane! #pastobane #banerelle', NULL, '2015-10-17 21:05:00', 1);

        // inserting multiple rows
        $events = [
            [
              'id'    => 4,
              'title'  => 'We got engaged!',
              'meta_description' => 'Shayna & Ryan have a very enjoyable day in an inspirational sunflower field. We started by visiting Merwin\'s Wharf for brunch on the river. Shayna plans out her whole day thinking Ryan was going to watch the Browns game. Ryan had other plans...',
              'post_date' => '2015-09-27 14:05:00',
              'status' => 1,
            ],
            [
              'id'    => 5,
              'title'  => 'Spot the differences',
              'meta_description' => 'Shayna makes it "Facebook official" with a spot-the-differences post. If you guessed: Picture "A" does not have a Lake Erie Monster sighting, you were correct.',
              'uri' => 'https://www.facebook.com/shayna.bane/posts/10153811147650628',
              'post_date' => '2015-10-01 19:31:00',
              'status' => 1,
            ],
            [
              'id'    => 6,
              'title'  => 'Banerelle.com launch',
              'meta_description' => 'Ryan makes use of his recent domain-name buying binge and turns Banerelle.com into the www hub for all things Pasto-Bane! #pastobane #banerelle',
              'post_date' => '2015-10-17 21:05:00',
              'status' => 1,
            ]
        ];

        // this is a handy shortcut
        $this->insert('pages', $events);
    }
}
