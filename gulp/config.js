module.exports = {
  jsBuildDirectory: './public/build/js/',
  cssBuildDirectory: './public/build/css/',
  mainJsFile: './resources/js/main.js',
  appCssFiles: './resources/less/*.less',
  prodFiles: './public/build/@(css|js)/*-*.*',
  commonCss: [
    "./bower_components/bootstrap/dist/css/bootstrap.css",
    "./bower_components/bootstrap/dist/css/bootstrap-theme.css",
  ],
};
