import { personIcon } from "./constants.js";
import { getIcon, getStatus } from "./helpers.js";
import { ui } from "./ui.js";

var map;
let clickedCords;
let layer;

let notes = JSON.parse(localStorage.getItem("notes")) || [];

window.navigator.geolocation.getCurrentPosition(
  (e) => {
    loadMap([e.coords.latitude, e.coords.longitude], "Mevcut Konum");
  },
  (e) => {
    loadMap([39.921132, 32.861194], "Varsayılan Konum");
  }
);

function loadMap(currentPosition, msg) {
  map = L.map("map", {
    zoomControl: false,
  }).setView(currentPosition, 10);

  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);

  layer = L.layerGroup().addTo(map);

  L.control
    .zoom({
      position: "bottomright",
    })
    .addTo(map);
  // İlmeç ekle
  L.marker(currentPosition, { icon: personIcon }).addTo(map).bindPopup(msg);

  map.on("click", onMapClick);

  renderMakers();
  renderNotes();
}

function onMapClick(e) {
  clickedCords = [e.latlng.lat, e.latlng.lng];

  ui.aside.classList.add("add");
}

ui.cancelBtn.addEventListener("click", () => {
  ui.aside.classList.remove("add");
});

ui.form.addEventListener("submit", (e) => {
  e.preventDefault();

  const title = e.target[0].value;
  const date = e.target[1].value;
  const status = e.target[2].value;

  const newNote = {
    id: new Date().getTime(),
    title,
    date,
    status,
    coords: clickedCords,
  };

  notes.push(newNote);

  localStorage.setItem("notes", JSON.stringify(notes));

  ui.aside.classList.remove("add");

  e.target.reset();

  renderNotes();
  renderMakers();
});

function renderMakers() {
  layer.clearLayers();
  notes.map((note) => {
    const icon = getIcon(note.status);
    L.marker(note.coords, { icon }).addTo(layer).bindPopup(note.title);
  });
}

function renderNotes() {
  const noteCards = notes
    .map((note) => {
      const date = new Date(note.date).toLocaleString("tr", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });

      const status = getStatus(note.status);
      return `
       <li>
          <div>
            <p>${note.title}</p>
            <p>${date}</p>
            <p>${status}</p>
          </div>
          <div class="icons">
            <i data-id="${note.id}" class="bi bi-airplane-fill" id="fly"></i>
            <i data-id="${note.id}" class="bi bi-trash-fill" id="delete"></i>
          </div>
        </li>
  `;
    })
    .join("");

  ui.ul.innerHTML = noteCards;

  document.querySelectorAll("li #delete").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      deleteNote(id);
    });
  });

  document.querySelectorAll("li #fly").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      flyToLocation(id);
    });
  });
}

// Not silme fonksiyonu
function deleteNote(id) {
  const res = confirm("Not silme işlemini onaylıyor musunuz ?");

  if (res) {
    notes = notes.filter((note) => note.id !== parseInt(id));

    localStorage.setItem("notes", JSON.stringify(notes));

    renderNotes();
    renderMakers();
  }
}

// Haritadaki ilgili nota hareket etmeyi saglayan fonksiyon
function flyToLocation(id) {
  const note = notes.find((note) => note.id === parseInt(id));

  map.flyTo(note.coords, 12);
}

ui.arrow.addEventListener("click", () => {
  ui.aside.classList.toggle("hide");
});
