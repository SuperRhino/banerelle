import React from 'react';
import ReactDOM from 'react-dom';
import path from 'path';
import Utils from '../Utils/Utils';
import RsvpForm from '../Views/RsvpForm';
import PageEditor from '../Views/PageEditor';
import PageInventory from '../Views/PageInventory';
import GuestList from '../Views/GuestList/GuestList';

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

  //----------------------------
  // Admin Routes:
  //----------------------------

  static pageEditor() {
    let pageId = Utils.getQueryParam('id') || null;
    if (pageId) pageId = parseInt(pageId);
    ReactDOM.render(
      <PageEditor pageId={pageId} />,
      document.getElementById('PageEditor')
    );
  }

  static pageInventory() {
    ReactDOM.render(
      <PageInventory />,
      document.getElementById('PageInventory')
    );
  }

  static guestList() {
    ReactDOM.render(
      <GuestList />,
      document.getElementById('GuestList')
    );
  }

}
