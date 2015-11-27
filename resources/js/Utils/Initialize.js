import $ from 'jquery';

export default class Initialize {

  static globals() {
    // Expose globals like jQuery
    window.jQuery = $;
  }

  static bootstrap() {
    require('bootstrap');
  }

  static jqueryReady() {
    // Click on big button:
    $('a.btn-lg').on('click', function(){
        if (ga) ga('send', 'event', 'buttons', 'click', 'stay tuned');
        console.log('send', 'event', 'buttons', 'click', 'stay tuned');
    });
  }

  static onLoad() {
    Initialize.globals();
    Initialize.bootstrap();
    Initialize.jqueryReady();
  }
}
