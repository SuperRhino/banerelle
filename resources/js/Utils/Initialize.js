var $ = require('jquery');

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
  }

  static onLoad() {
    Initialize.globals();
    Initialize.bootstrap();
    Initialize.onReady();
  }
}
