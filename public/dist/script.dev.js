"use strict";

var locations = JSON.parse(document.querySelector("#map").dataset.location);
var map = L.map('map', {
  zoomControl: false
}); //to disable + - zoom
// var map = L.map('map', { zoomControl: false }).setView([31.111745, -118.113491], );

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  crossOrigin: ''
}).addTo(map);
var points = [];
locations.forEach(function (loc) {
  points.push([loc.coordinates[1], loc.coordinates[0]]);
  L.marker([loc.coordinates[1], loc.coordinates[0]]).addTo(map).bindPopup("<p>Day ".concat(loc.day, ": ").concat(loc.description, "</p>"), {
    autoClose: false
  }).openPopup();
});
var bounds = L.latLngBounds(points).pad(0.5);
map.fitBounds(bounds);
map.scrollWheelZoom.disable(); //to disable zoom by mouse wheel