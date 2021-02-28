"use strict";

// Selected elements
const distanceSlider = document.querySelector("#distance");
const durationSlider = document.querySelector("#duration");
const romanticSlider = document.querySelector("#romanticLvl");
const ambienceSlider = document.querySelector("#ambience");
const walkTypeSelect = document.querySelector("#walkType");

// makes the materilize select work
document.addEventListener("DOMContentLoaded", function () {
  let elements = document.querySelectorAll("select");
  let instances = M.FormSelect.init(elements);
});

const formContainer = document.querySelector("form");
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////// BRAIN of the App
class App {
  #map;
  #walks = [];

  constructor() {
    this._getLocation();
    formContainer.addEventListener("submit", this._newWalk.bind(this));
  }

  _newWalk(event) {
    event.preventDefault();

    //gets data
    const distance = distanceSlider.value;
    const duration = durationSlider.value;
    const walkType = walkTypeSelect.value;

    //check if its a date or casual
    if (walkType === "casual") {
      const ambience = ambienceSlider.value;
      const walk = new Casual(distance, duration, ambience);
      this.#walks.push(walk);
      console.log(this.#walks);
    }

    if (walkType === "romantic") {
      const romanticLvl = romanticSlider.value;
      const walk = new Romantic(distance, duration, romanticLvl);
      this.#walks.push(walk);
      console.log(this.#walks);
    }
  }

  _getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          console.log("Location is not accessible");
        }
      );
    }
  }

  _loadMap(position) {
    const { latitude, longitude } = position.coords;
    const coords = [latitude, longitude];

    // creates map
    this.#map = L.map("map").setView(coords, 13);
    L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    // Handling clicks on map
    this.#map?.on("click", this._setMarker.bind(this));
  }

  _setMarker(event) {
    console.log(event);
    const { lat, lng } = event.latlng;
    const coords = [lat, lng];

    L.marker(coords)
      .addTo(this.#map)
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

    this._showForm();
  }

  _showForm() {
    formContainer.classList.remove("hidden");
  }
}

const app = new App();

/// parent class

class Walk {
  constructor(distance, duration) {
    this.distance = distance;
    this.duration = duration;
  }
}

class Romantic extends Walk {
  type = "romantic";

  constructor(distance, duration, romanticLvl) {
    super(distance, duration);
    this.romanticLvl = romanticLvl;
  }
}

class Casual extends Walk {
  type = "casual";
  constructor(distance, duration, ambience) {
    super(distance, duration);
    this.ambience = ambience;
  }
}
