// main.js
import React from 'react';
import ReactDOM from 'react-dom';
import Initialize from './Utils/Initialize';
import Routes from './Utils/Routes';

// Run that init:
Initialize.onLoad();

// Initialize current route
Routes.current(window.location.pathname);