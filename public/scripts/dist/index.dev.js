"use strict";

var _getLogin = require("./getLogin.js");

var _script = require("./script.js");

var _updateMe = require("./updateMe.js");

var _stripe = _interopRequireDefault(require("./stripe.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var map = document.querySelector("#map");
var form = document.querySelector(".form--login");
var logButton = document.querySelector(".nav__el--logout");
var formUserData = document.querySelector(".form--update");
var formUserPassword = document.querySelector(".form-user-password");
var buyBtn = document.querySelector("#buyBtn");

if (map) {
  var locations = JSON.parse(map.dataset.location);
  (0, _script.renderMap)(locations);
}

console.log(form);
console.log(formUserData);

if (form) {
  document.querySelector(".form").addEventListener("submit", function (e) {
    e.preventDefault();
    var email = document.querySelector("#email").value;
    var password = document.querySelector("#password").value;
    console.log(email, password);
    (0, _getLogin.login)(email, password);
  });
}

if (logButton) {
  logButton.addEventListener('click', _getLogin.loggout);
}

if (formUserData) {
  document.querySelector(".form--update").addEventListener('submit', function (e) {
    e.preventDefault();
    var form = new FormData();
    form.append('name', document.querySelector("#name").value);
    form.append('email', document.querySelector("#email").value);
    form.append('photo', document.querySelector("#photo").files[0]);
    (0, _updateMe.updateMe)(form);
  });
}

if (formUserPassword) {
  formUserPassword.addEventListener('submit', function (e) {
    e.preventDefault();
    var passwordCurrent = document.querySelector("#password-current");
    var password = document.querySelector("#password");
    var passwordConfirm = document.querySelector("#password-confirm");
    (0, _updateMe.updatePassword)(passwordCurrent.value, password.value, passwordConfirm.value);
    passwordCurrent.value = "";
    password.value = "";
    passwordConfirm.value = "";
  });
}

if (buyBtn) {
  buyBtn.addEventListener('click', function () {
    buyBtn.textContent = "procesing...";
    (0, _stripe["default"])(buyBtn.dataset.tourId);
  });
}