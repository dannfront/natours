"use strict";

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
            window.location.href = "/";
          }

          _context.next = 10;
          break;

        case 7:
          _context.prev = 7;
          _context.t0 = _context["catch"](0);
          window.alert(_context.t0.response.data.message);

        case 10:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 7]]);
}

document.querySelector(".form").addEventListener("submit", function (e) {
  e.preventDefault();
  var email = document.querySelector("#email").value;
  var password = document.querySelector("#password").value;
  login(email, password);
});