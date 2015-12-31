import { Config, } from './Constants';

export default class Utils {

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
}
