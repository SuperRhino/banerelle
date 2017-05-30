import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import Actions from '../Utils/Actions';
import Events from '../Utils/Events';
import UserNav from '../Components/UserNav';

export default class Initialize {

  static globals() {
    // Expose globals like jQuery
    window.jQuery = $;
  }

  static bootstrap() {
    require('bootstrap');
  }

  static onReady() {
    Events.init();

    // Show that user nav:
    let userNavEl = document.getElementById('UserNav');
    if (userNavEl) {
      ReactDOM.render(
        <UserNav />,
        userNavEl
      );
    }

    // jQuery for page scrolling feature - requires jQuery Easing plugin
    $('a.page-scroll').bind('click', function(event) {
        var $anchor = $(this);
        $('html, body').stop().animate({
            scrollTop: ($($anchor.attr('href')).offset().top - 80)
        }, 1250, 'easeInOutExpo');
        Events.send('buttons', 'click', $anchor.text().toLowerCase());
        event.preventDefault();
    });

    // Highlight the top nav as scrolling occurs
    let $body = $('body');
    $body.scrollspy({
        target: '.navbar-fixed-top',
        offset: 51
    });
    // Listen for new scrollspy section active:
    $body.on('activate.bs.scrollspy', function () {
      let item = document.querySelector('.navbar-nav > .active > a');
      if (item) {
          Events.send('scrolling', 'sectionview', (item.innerText).toLowerCase());
      }
    });

    // Closes the Responsive Menu on Menu Item Click
    $('.navbar-collapse ul li a').click(function(){
            $('.navbar-toggle:visible').click();
    });

    // Offset for Main Navigation
    $('#mainNav').affix({
        offset: {
            top: 100
        }
    });

  }

  static authUser() {
    Actions.auth();
  }

  static onLoad() {
    Initialize.globals();
    Initialize.bootstrap();
    Initialize.onReady();
    Initialize.authUser();
  }
}
