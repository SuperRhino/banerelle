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
    document.getElementById('btnComingSoon').onclick = function(){
      if (ga) ga('send', 'event', 'buttons', 'click', 'stay tuned');
      console.log('send', 'event', 'buttons', 'click', 'stay tuned');
      return false;
    };

    // Show that user nav:
    ReactDOM.render(
      <UserNav />,
      document.getElementById('UserNav')
    );
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
