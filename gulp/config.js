module.exports = {
  jsBuildDirectory: './public/build/js/',
  cssBuildDirectory: './public/build/css/',
  mainJsFile: './resources/js/main.js',
  appCssFiles: './resources/less/*.less',
  prodFiles: './public/build/@(css|js)/*-*.*',
  commonCss: [
    "./node_modules/humane-js/themes/flatty.css",
    "./node_modules/bootstrap/dist/css/bootstrap.css",
    "./node_modules/bootstrap/dist/css/bootstrap-theme.css",
    "./node_modules/react-bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css",
    "./node_modules/medium-editor/dist/css/medium-editor.css",
    "./node_modules/medium-editor/dist/css/themes/default.css",
    "./node_modules/react-bootstrap-table/css/react-bootstrap-table.min.css",
    "./node_modules/dropzone/dist/basic.css",
    "./node_modules/dropzone/dist/dropzone.css",
  ],
};
