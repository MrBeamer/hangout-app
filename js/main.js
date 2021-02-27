"use strict";

// Selected elements
const slider = document.querySelector("#distance");
const submitBtn = document.querySelector(".form__btn");

submitBtn.addEventListener("click", function (event) {
  event.preventDefault();
  console.log("test");
  console.log(slider.value);
});

// get initial location coords
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    function (position) {
      const { latitude, longitude } = position.coords;
      const coords = [latitude, longitude];

      // creates map
      let map = L.map("map").setView(coords, 13);
      L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      // creates marker and popup
      L.marker(coords)
        .addTo(map)
        .bindPopup(
          L.popup({
            maxWidth: 250,
            minWidth: 100,
            autoClose: false,
            closeOnClick: false,
            className: `type-popup`,
          }).setContent("test")
        )
        .openPopup();
    },
    function () {
      console.log("Location is not accessible");
    }
  );
}
