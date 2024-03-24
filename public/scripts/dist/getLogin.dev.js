"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.login = login;
exports.loggout = loggout;

var _alerts = require("./alerts.js");

// import axios from 'axios'
// import axios from 'axios'
function login(email, password) {
  var res;
  return regeneratorRuntime.async(function login$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _context.next = 3;
          return regeneratorRuntime.awrap(axios({
            method: "POST",
            url: 'http://127.0.0.1:3000/api/v1/users/login',
            data: {
              email: email,
              password: password
            },
            withCredentials: true
          }));

        case 3:
          res = _context.sent;

          // redireccionamos a la pagina principal 
          if (res.data.status === "success") {
            (0, _alerts.alert)("logueado", "success");
            window.location.href = "/";
          }

          _context.next = 10;
          break;

        case 7:
          _context.prev = 7;
          _context.t0 = _context["catch"](0);
          (0, _alerts.alert)(_context.t0.response.data.message, "error");

        case 10:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 7]]);
}

function loggout() {
  var res;
  return regeneratorRuntime.async(function loggout$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          _context2.next = 3;
          return regeneratorRuntime.awrap(axios({
            method: "GET",
            url: 'http://127.0.0.1:3000/api/v1/users/logout'
          }));

        case 3:
          res = _context2.sent;
          if (res.data.status === "succes") location.reload(true);
          _context2.next = 10;
          break;

        case 7:
          _context2.prev = 7;
          _context2.t0 = _context2["catch"](0);
          (0, _alerts.alert)("error when closing session", "error");

        case 10:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[0, 7]]);
}