import { Config, } from './Constants';
import Humane from 'humane-js';

export default class Utils {

  static showMessage = Humane.spawn({
    addnCls: 'bg-info text-info',
    waitForMove: true,
  });

  static showSuccess = Humane.spawn({
    addnCls: 'bg-success text-success',
    timeout: 10e3,
    waitForMove: true,
  });

  static showError = Humane.spawn({
    addnCls: 'bg-danger text-danger',
    timeout: 5000,
    clickToClose: true,
    waitForMove: true,
  });

  /**
   * Get JSON data from another server. Supported back to IE6.
   * credit: http://gomakethings.com/ditching-jquery
   * @param url
   * @param callback
   */
  static getJSONP(url, callback) {

    // Create script with url and callback (if specified)
    var ref = window.document.getElementsByTagName( 'script' )[ 0 ];
    var script = window.document.createElement( 'script' );
    script.src = url + (url.indexOf( '?' ) + 1 ? '&' : '?') + 'callback=' + callback;

    // Insert script tag into the DOM (append to <head>)
    ref.parentNode.insertBefore( script, ref );

    // After the script is loaded (and executed), remove it
    script.onload = function () {
      this.remove();
    };

  }

  /**
   * Quotes the given string so it can safely be used in a Regular Expression.
   * @param regex
   * @returns {*|string|void|XML}
   */
  static quoteRegex(regex) {
      return regex.replace(/([()[{*+.$^\\|?])/g, '\\$1');
  }

  /**
   * Trim the given character from both ends of the given string.
   * @param str
   * @param chr
   * @returns {*|string|void|XML}
   */
  static trimChar(str, chr) {
      chr = Utils.quoteRegex(chr);
      return str.replace(new RegExp('^' + chr + '+|' + chr + '+$', 'g'), "");
  }

  /**
   * Convert an object to a query string.
   * credit: http://stackoverflow.com/a/1714899
   * @param obj
   * @param prefix
   * @returns {string}
   */
  static toQueryString(obj, prefix) {
    var str = [];
    for (var p in obj) {
      if (obj.hasOwnProperty(p)) {
        var k = prefix ? prefix + "[" + p + "]" : p, v = obj[p];
        str.push(typeof v == "object" ?
          Utils.toQueryString(v, k) : encodeURIComponent(k) + "=" + encodeURIComponent(v));
      }
    }
    return str.join("&");
  }

  /**
   * Credit: http://stackoverflow.com/a/901144/5780385
   * @param  {[type]} name [description]
   * @param  {[type]} url  [description]
   * @return {[type]}      [description]
   */
  static getQueryParam(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

  /**
   * Is object empty?
   * @param  obj
   * @return {Boolean}
   */
  static isEmpty(obj) {
    if (obj == null) return true;
    if (obj.length > 0) return false;
    if (obj.length === 0) return true;
    if (Object.getOwnPropertyNames(obj).length > 0) return false;
    return true;
  }

  /**
   * Clean string for use in URL
   * @param  {string} str
   * @return {string} uri
   * Credit: http://stackoverflow.com/a/14962369/5780385
   */
  static cleanForUrl(str) {
    return str.replace(/(^\-+|[^a-zA-Z0-9\/_| -]+|\-+$)/g, '')
              .toLowerCase()
              .replace(/[\/_| -]+/g, '-');
  }

  /*
   * Cookies!
   * Credit: http://stackoverflow.com/a/24103596
   */
  static createCookie(name,value,days) {
      var expires = "";
      if (days) {
          var date = new Date();
          date.setTime(date.getTime() + (days*24*60*60*1000));
          expires = "; expires=" + date.toUTCString();
      }
      document.cookie = name + "=" + value + expires + "; path=/";
  }
  static readCookie(name) {
      var nameEQ = name + "=";
      var ca = document.cookie.split(';');
      for(var i=0;i < ca.length;i++) {
          var c = ca[i];
          while (c.charAt(0)==' ') c = c.substring(1,c.length);
          if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
      }
      return null;
  }
  static eraseCookie(name) {
      Utils.createCookie(name,"",-1);
  }

}
