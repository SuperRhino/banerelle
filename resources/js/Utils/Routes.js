import React from 'react';
import ReactDOM from 'react-dom';
import path from 'path';
import Utils from '../Utils/Utils';
import DateCountdown from '../Components/DateCountdown';
import PhotoGallery from '../Components/PhotoGallery';
import VerifyRsvpButton from '../Components/VerifyRsvpButton';
import RsvpForm from '../Views/RsvpForm';
import PageEditor from '../Views/PageEditor';
import PageInventory from '../Views/PageInventory';
import GuestList from '../Views/GuestList/GuestList';
import GuestBookForm from '../Views/GuestBookForm';

export default class Routes {

  static homeRoute = 'home';

  static current(pathname) {
    var basename = path.basename(pathname) || Routes.homeRoute;
    var camelName = basename.replace(/-([a-z])/g, function (g) { return g[1].toUpperCase(); });
    if (typeof Routes[camelName] === 'function') {
      console.log("Loading route: "+camelName);
      Routes[camelName]();
    }
  }

  //----------------------------
  // Custom Routes:
  //----------------------------

  static home() {
    ReactDOM.render(
      <DateCountdown />,
      document.getElementById('DateCountdown')
    );
  }

  static guestBook() {
    ReactDOM.render(
      <GuestBookForm />,
      document.getElementById('GuestBookForm')
    );
  }

  static photos() {
    ReactDOM.render(
      <PhotoGallery />,
      document.getElementById('PhotoGallery')
    );
  }

  static rsvp() {
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

  static manageRsvp() {
      let rsvpButtons = document.querySelectorAll('.VerifyRsvpButton');
      rsvpButtons.forEach(btn => {
          ReactDOM.render(
            <VerifyRsvpButton id={btn.getAttribute('data-id')} />,
            btn
          );
      })
  }

}
