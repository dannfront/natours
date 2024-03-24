"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = pago;
var stripe = Stripe('pk_test_51Ow7RsRrjXyajTmrGyMfs3phn3TTFPOHlbTOj0bNL5rUpt9Ssfv6QwF5f6wdFcqs1fGb6Eo7iGcZFTksk99OAk7000LyTMKDKw');

function pago(tourId) {
  var session, dataSession;
  return regeneratorRuntime.async(function pago$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _context.next = 3;
          return regeneratorRuntime.awrap(fetch("http://127.0.0.1:3000/api/v1/bookings/checkout-sessions/".concat(tourId)));

        case 3:
          session = _context.sent;
          _context.next = 6;
          return regeneratorRuntime.awrap(session.json());

        case 6:
          dataSession = _context.sent;
          _context.next = 9;
          return regeneratorRuntime.awrap(stripe.redirectToCheckout({
            sessionId: dataSession.session.id
          }));

        case 9:
          _context.next = 14;
          break;

        case 11:
          _context.prev = 11;
          _context.t0 = _context["catch"](0);
          console.error(_context.t0);

        case 14:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 11]]);
}