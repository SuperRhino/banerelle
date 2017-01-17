import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import Actions from '../Utils/Actions';
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
    // Click on big button:
    let baButton = document.getElementById('btnComingSoon');
    if (baButton) {
      baButton.onclick = function(){
        if (ga) ga('send', 'event', 'buttons', 'click', 'stay tuned');
        console.log('send', 'event', 'buttons', 'click', 'stay tuned');
        return false;
      };
    }

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
            scrollTop: ($($anchor.attr('href')).offset().top - 50)
        }, 1250, 'easeInOutExpo');
        event.preventDefault();
    });

    // Highlight the top nav as scrolling occurs
    $('body').scrollspy({
        target: '.navbar-fixed-top',
        offset: 51
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
