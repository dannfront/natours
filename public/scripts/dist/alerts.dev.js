"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.alert = alert;

function hideAlert() {
  var el = document.querySelector(".alert");
  if (el) el.remove();
}

function alert(message, type) {
  var template = "<div class=\"alert alert--".concat(type, "\">").concat(message, "</div>");
  document.querySelector("body").insertAdjacentHTML('afterbegin', template);
  window.setTimeout(hideAlert, 8000);
}