"use strict";

// Setting Date through index
const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// Selected elements
const distanceSlider = document.querySelector("#distance");
const durationSlider = document.querySelector("#duration");
const romanticSlider = document.querySelector("#romanticLvl");
const ambienceSlider = document.querySelector("#ambience");
const walkTypeSelect = document.querySelector("#walkType");
const formContainer = document.querySelector("form");
const walksContainer = document.querySelector(".walks");

// Fixes the sliders starting in the middle
distanceSlider.value = 0;
durationSlider.value = 0;
romanticSlider.value = 0;
ambienceSlider.value = 0;

// Makes that the materialize select work
document.addEventListener("DOMContentLoaded", function () {
  let elements = document.querySelectorAll("select");
  let instances = M.FormSelect.init(elements);
});

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////// BRAIN of the App
class App {
  #map;
  #mapEvent;
  #walks = [];

  constructor() {
    this._getLocation();
    formContainer.addEventListener("submit", this._newWalk.bind(this));
    walkTypeSelect.addEventListener(
      "change",
      this._toggleRomanticLvl.bind(this)
    );
    walksContainer.addEventListener("click", this._moveToPopup.bind(this));
  }

  _newWalk(event) {
    event.preventDefault();

    //gets data
    const distance = distanceSlider.value;
    const duration = durationSlider.value;
    const walkType = walkTypeSelect.value;
    const { lat, lng } = this.#mapEvent.latlng;
    const coords = [lat, lng];
    let walk;

    //check if its a date or casual
    if (walkType === "casual") {
      const ambience = ambienceSlider.value;
      walk = new Casual(coords, distance, duration, ambience);
    }

    if (walkType === "romantic") {
      const romanticLvl = romanticSlider.value;
      walk = new Romantic(coords, distance, duration, romanticLvl);
    }
    this.#walks.push(walk);

    // Renders walk in list - helper function
    this._renderWalk(walk);

    // Renders walk on map - helper function
    this._renderMarker(walk);

    // Hides form and resets it
    this._hideForm();
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
    this.#map.on("click", this._showForm.bind(this));

    // Connects marker with the object
    this.#walks.forEach((walk) => {
      this._renderMarker(walk);
    });
  }

  _renderMarker(walk) {
    // const { lat, lng } = event.latlng;
    // const coords = [lat, lng];

    L.marker(walk.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `type-popup`,
        }).setContent(
          `${walk.type === "casual" ? "⭐️ " : "❤️ "} ${walk.description}`
        )
      )
      .openPopup();
  }

  _renderWalk(walk) {
    let html = `    
    <li class="walk walk--${walk.type}" data-id="${walk.id}">
      <h2 class="walk__title">${walk.description}</h2>
      <div class="walk__details">
        <span class="walk__icon">👣</span>
        <span class="walk__value">${walk.distance}</span>
        <span class="walk__unit">km</span>
      </div>
      <div class="walk__details">
        <span class="walk__icon">⏱</span>
        <span class="walk__value">${walk.duration}</span>
        <span class="walk__unit">min</span>
      </div>`;

    if (walk.type === "casual") {
      html += `
        <div class="walk__details">
            <span class="walk__icon">Ambience Level</span>
            <span class="walk__value">${"⭐️ ".repeat(walk.ambience)}</span>
        </div>
    </li>`;
    }

    if (walk.type === "romantic") {
      html += `    
        <div class="walk__details">
            <span class="walk__icon">Romantic Level</span>
            <span class="walk__value">${"❤️ ".repeat(walk.romanticLvl)}</span>
        </div>
    </li>`;
    }

    formContainer.insertAdjacentHTML("afterend", html);
  }

  _showForm(mapE) {
    this.#mapEvent = mapE;
    formContainer.classList.remove("hidden");
  }

  _toggleRomanticLvl() {
    if (walkTypeSelect.value === "romantic") {
      romanticSlider
        .closest(".form__row")
        .classList.remove("form__row--hidden");

      ambienceSlider.closest(".form__row").classList.add("form__row--hidden");
    }
    if (walkTypeSelect.value === "casual") {
      ambienceSlider
        .closest(".form__row")
        .classList.toggle("form__row--hidden");

      romanticSlider.closest(".form__row").classList.add("form__row--hidden");
    }
  }

  _hideForm() {
    distanceSlider.value = 0;
    durationSlider.value = 0;
    romanticSlider.value = 0;
    ambienceSlider.value = 0;
    walkTypeSelect.value = "choose";

    formContainer.classList.add("hidden");
  }

  _moveToPopup(event) {
    if (!this.#map) return;

    const walkEl = event.target.closest(".walk");

    if (!walkEl) return;

    const walk = this.#walks.find((walk) => walkEl.dataset.id === walk.id);
    this.#map.setView(walk.coords, 13, {
      animate: true,
      pan: {
        duration: 1,
      },
    });
  }
}

const app = new App();

/// parent class

class Walk {
  date = new Date();
  id = (Date.now() + "").slice(-10);
  constructor(coords, distance, duration) {
    this.distance = distance;
    this.duration = duration;
    this.coords = coords;
  }

  _setDescription() {
    this.description = `${
      this.type[0].toUpperCase() + this.type.substring(1)
    } walk on ${months[this.date.getMonth()]} ${this.date.getDate()}`;
  }
}

class Romantic extends Walk {
  type = "romantic";

  constructor(coords, distance, duration, romanticLvl) {
    super(coords, distance, duration);
    this.romanticLvl = romanticLvl;
    this._setDescription();
  }
}

class Casual extends Walk {
  type = "casual";
  constructor(coords, distance, duration, ambience) {
    super(coords, distance, duration);
    this.ambience = ambience;
    this._setDescription();
  }
}
