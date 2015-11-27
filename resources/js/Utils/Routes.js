import React from 'react';
import ReactDOM from 'react-dom';
import path from 'path';
import Utils from '../Utils/Utils';
import RsvpForm from '../Views/RsvpForm';

export default class Routes {

  static homeRoute = 'home';

  static current(pathname) {
    var basename = path.basename(pathname) || Routes.homeRoute;
    var camelName = basename.replace(/-([a-z])/g, function (g) { return g[1].toUpperCase(); });
    if (typeof Routes[camelName] === 'function') {
      Routes[camelName]();
    }
  }

  //----------------------------
  // Custom Routes:
  //----------------------------

  static home() {
    console.log('Home route');
  }

  static rsvp() {
    console.log('rsvp');
    ReactDOM.render(
      <RsvpForm />,
      document.getElementById('RsvpForm')
    );
  }

}
