"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.updateMe = updateMe;
exports.updatePassword = updatePassword;

var _alerts = require("./alerts.js");

// import axios from "axios";
function updateMe(data) {
  var res;
  return regeneratorRuntime.async(function updateMe$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _context.next = 3;
          return regeneratorRuntime.awrap(axios({
            method: "PATCH",
            url: "/api/v1/users/UpdateMe",
            data: data
          }));

        case 3:
          res = _context.sent;
          (0, _alerts.alert)("successful update", "success");
          _context.next = 10;
          break;

        case 7:
          _context.prev = 7;
          _context.t0 = _context["catch"](0);
          (0, _alerts.alert)("error al enviar los datos", "error");

        case 10:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 7]]);
}

function updatePassword(passwordCurrent, password, passwordConfirm) {
  var res;
  return regeneratorRuntime.async(function updatePassword$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          _context2.next = 3;
          return regeneratorRuntime.awrap(axios({
            method: "PATCH",
            url: "/api/v1/users/UpdatePassword",
            data: {
              passwordCurrent: passwordCurrent,
              password: password,
              passwordConfirm: passwordConfirm
            }
          }));

        case 3:
          res = _context2.sent;
          console.log(res.data);
          (0, _alerts.alert)("successful update password", "success");
          _context2.next = 11;
          break;

        case 8:
          _context2.prev = 8;
          _context2.t0 = _context2["catch"](0);
          (0, _alerts.alert)("error al enviar los datos", "error");

        case 11:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[0, 8]]);
}