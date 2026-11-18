/* Script commun à tous les sites de l'atelier : menu mobile, en-tête, galerie, formulaire. */

/* ---------- Menu mobile ---------- */
const burger = document.getElementById("burger");
const nav = document.getElementById("nav");

function setMenu(open) {
  document.body.classList.toggle("menu-open", open);
  burger.setAttribute("aria-expanded", String(open));
  burger.textContent = open ? "Fermer" : "Menu";
}
if (burger) {
  burger.addEventListener("click", () => setMenu(!document.body.classList.contains("menu-open")));
  nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
}

/* ---------- En-tête : transparent sur la photo, plein ensuite ---------- */
const header = document.getElementById("header");
function onScroll() {
  header.classList.toggle("is-solid", window.scrollY > 60);
}
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

/* ---------- Apparition des blocs au défilement ---------- */
const revealer = new IntersectionObserver((entries) => {
  entries.forEach((en) => {
    if (en.isIntersecting) {
      en.target.classList.add("is-visible");
      revealer.unobserve(en.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll(".reveal").forEach((el) => revealer.observe(el));

/* ---------- Galerie : agrandissement des photos ---------- */
const gallery = document.getElementById("gallery");
const lightbox = document.getElementById("lightbox");
if (gallery && lightbox) {
  const lbImg = lightbox.querySelector("img");
  gallery.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      lbImg.src = a.href;
      lbImg.alt = a.querySelector("img").alt;
      lightbox.classList.add("open");
      lightbox.setAttribute("aria-hidden", "false");
    });
  });
  const close = () => {
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
  };
  lightbox.addEventListener("click", close);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
}

/* ---------- Formulaire de contact ----------
   Envoyé à Netlify Forms (attribut data-netlify dans index.html) : les demandes
   apparaissent dans Netlify > Forms et sont transmises par e-mail au client. */
const form = document.getElementById("contact-form");
const msg = document.getElementById("form-msg");

if (form) form.addEventListener("submit", async (e) => {
  e.preventDefault();
  msg.className = "form__msg";

  if (!form.checkValidity()) {
    msg.textContent = "Merci d'indiquer votre nom, votre téléphone et d'accepter l'utilisation de vos données.";
    form.reportValidity();
    return;
  }

  const button = form.querySelector("button[type=submit]");
  button.disabled = true;
  try {
    const res = await fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(new FormData(form)).toString(),
    });
    if (!res.ok) throw new Error();
    form.reset();
    msg.textContent = "Merci, votre message a bien été envoyé.";
    msg.classList.add("ok");
  } catch {
    msg.textContent = "L'envoi a échoué. Vous pouvez nous appeler directement.";
  } finally {
    button.disabled = false;
  }
});

const year = document.getElementById("year");
if (year) year.textContent = new Date().getFullYear();

/* ============================================================
   Chicken Bun : contenu modifiable par le client
   Tout ce qui change souvent (carte, prix, horaires, liens, photos, promo)
   est rangé dans data/*.json et modifié depuis l'espace d'administration
   (Pages CMS, configuration dans .pages.yml). Ce script remplit la page.
   ============================================================ */

const JOURS = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
const JOURS_EN = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const CARTE = ["tacos-signatures", "tacos-classiques", "buns", "burgers", "double-dose", "fried-chicken", "a-cotes"];

// Toujours la dernière version des données (pas de cache après une modification)
const charger = (fichier) =>
  fetch(`data/${fichier}?v=${Date.now()}`, { cache: "no-store" }).then((r) => {
    if (!r.ok) throw new Error(fichier);
    return r.json();
  });

const echapper = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const prix = (n) => (n === null || n === undefined || n === "" || isNaN(Number(n)) ? "" : Number(n).toFixed(2).replace(".", ",") + " €");
const hhmm = (m) => { m = m % 1440; return `${Math.floor(m / 60)}h${m % 60 ? String(m % 60).padStart(2, "0") : ""}`; };
const iso = (m) => { m = m % 1440; return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`; };

// « 11:00-14:00 / 18:00-22:30 », « 18h-22h30 », « 18h à 23h »… → [[660, 840], [1080, 1350]] en minutes
function creneaux(texte) {
  const out = [];
  const re = /(\d{1,2})\s*[h:]\s*(\d{2})?\s*(?:-|–|à|a)\s*(\d{1,2})\s*[h:]?\s*(\d{2})?/gi;
  let m;
  while ((m = re.exec(texte || ""))) {
    const o = Number(m[1]) * 60 + Number(m[2] || 0);
    let c = Number(m[3]) * 60 + Number(m[4] || 0);
    if (c <= o) c += 1440; // fermeture après minuit
    out.push([o, c]);
  }
  return out;
}

function remplirCarte(fichier, plats) {
  const dl = document.querySelector(`[data-carte="${fichier}"]`);
  if (!dl) return;
  dl.innerHTML = plats.map((p) => {
    const etiquette = p.etiquette && p.etiquette !== "Aucune"
      ? ` <em${p.etiquette === "Épicé" ? ' class="hot"' : ""}>${echapper(p.etiquette)}</em>` : "";
    const seul = prix(p.prix), menu = prix(p.prix_menu);
    return `<div><dt>${echapper(p.nom)}${etiquette}</dt><dd>${echapper(p.description)}</dd>` +
      `<span class="price">${seul ? `<b>${seul}</b>` : ""}${menu ? `<small>Menu ${menu}</small>` : ""}</span></div>`;
  }).join("");
}

function remplirInfos(infos) {
  // Téléphone : 09 79 00 69 86 → +33979006986
  const chiffres = (infos.telephone || "").replace(/\D/g, "");
  const intl = chiffres.startsWith("0") ? "+33" + chiffres.slice(1) : "+" + chiffres;
  if (chiffres) {
    document.querySelectorAll("[data-tel]").forEach((a) => (a.href = "tel:" + intl));
    document.querySelectorAll("[data-tel-texte]").forEach((s) => (s.textContent = infos.telephone));
  }
  document.querySelectorAll('[data-lien="uber"]').forEach((a) => infos.lien_uber_eats && (a.href = infos.lien_uber_eats));
  document.querySelectorAll('[data-lien="instagram"]').forEach((a) => infos.lien_instagram && (a.href = infos.lien_instagram));
  document.querySelectorAll("[data-champ]").forEach((el) => {
    const v = infos[el.dataset.champ];
    if (v !== undefined && v !== "") el.textContent = v;
  });
  document.querySelectorAll("[data-supplement]").forEach((el) => {
    const v = (infos.supplements || {})[el.dataset.supplement];
    if (v !== undefined && v !== null && v !== "") el.textContent = String(v).replace(".", ",");
  });

  // Promo du moment
  const promo = document.getElementById("promo");
  if (promo && infos.promo && infos.promo.afficher && infos.promo.texte) {
    promo.textContent = infos.promo.texte;
    promo.hidden = false;
  }

  // Horaires : tableau (lundi en premier), jour du jour, message, ouvert / fermé
  const horaires = {};
  JOURS.forEach((j, d) => (horaires[d] = creneaux((infos.horaires || {})[j])));
  const table = document.getElementById("hours");
  if (table) {
    const aujourdhui = new Date().getDay();
    table.innerHTML = [1, 2, 3, 4, 5, 6, 0].map((d) => {
      const c = horaires[d];
      const texte = c.length ? c.map(([o, f]) => `${hhmm(o)} – ${hhmm(f)}`).join(" · ") : "Fermé";
      const cls = [d === aujourdhui ? "today" : "", c.length ? "" : "closed"].join(" ").trim();
      return `<tr${cls ? ` class="${cls}"` : ""}><td>${JOURS[d][0].toUpperCase() + JOURS[d].slice(1)}</td><td>${texte}</td></tr>`;
    }).join("");
  }
  const msg = document.getElementById("hours-msg");
  if (msg && infos.message_horaires) { msg.textContent = infos.message_horaires; msg.hidden = false; }

  const statut = document.getElementById("status");
  if (statut) {
    const s = statutOuverture(horaires, new Date());
    statut.classList.add(s.ouvert ? "is-open" : "is-closed");
    document.getElementById("status-text").textContent = s.texte;
  }

  // Données pour Google (horaires, note) : toujours identiques à ce qui est affiché
  const ld = document.getElementById("ld-json");
  if (ld) {
    try {
      const data = JSON.parse(ld.textContent);
      data.telephone = intl;
      data.openingHoursSpecification = [];
      for (let d = 0; d < 7; d++) {
        horaires[d].forEach(([o, f]) => data.openingHoursSpecification.push(
          { "@type": "OpeningHoursSpecification", dayOfWeek: JOURS_EN[d], opens: iso(o), closes: iso(f) }));
      }
      const note = parseFloat(String(infos.note_google || "").replace(",", "."));
      if (note) data.aggregateRating = { "@type": "AggregateRating", ratingValue: String(note), reviewCount: String(infos.nombre_avis_google || "") };
      ld.textContent = JSON.stringify(data);
    } catch { /* données Google laissées telles quelles */ }
  }
}

function statutOuverture(horaires, maintenant) {
  const jour = maintenant.getDay();
  const min = maintenant.getHours() * 60 + maintenant.getMinutes();
  const hier = (jour + 6) % 7;
  // créneau d'hier qui déborde après minuit
  const nuit = horaires[hier].find(([o, f]) => f > 1440 && min + 1440 < f);
  if (nuit) return { ouvert: true, texte: `Ouvert · jusqu'à ${hhmm(nuit[1])}` };
  const enCours = horaires[jour].find(([o, f]) => min >= o && min < f);
  if (enCours) return { ouvert: true, texte: `Ouvert · jusqu'à ${hhmm(enCours[1])}` };
  const plusTard = horaires[jour].find(([o]) => o > min);
  if (plusTard) return { ouvert: false, texte: `Fermé · ouvre à ${hhmm(plusTard[0])}` };
  for (let i = 1; i <= 7; i++) {
    const d = (jour + i) % 7;
    if (horaires[d].length) return { ouvert: false, texte: `Fermé · ouvre ${i === 1 ? "demain" : JOURS[d]} à ${hhmm(horaires[d][0][0])}` };
  }
  return { ouvert: false, texte: "Fermé" };
}

function remplirPhotos(photos) {
  document.querySelectorAll("img[data-photo]").forEach((img) => {
    const src = photos[img.dataset.photo];
    if (src) img.src = src.replace(/^\//, "");
  });
  document.querySelectorAll(".menu-tab[data-photo]").forEach((t) => {
    const src = photos[t.dataset.photo];
    if (src) t.dataset.img = src.replace(/^\//, "");
  });
  const actif = document.querySelector('.menu-tab[aria-selected="true"]');
  if (actif && actif.dataset.img) document.getElementById("menu-img").src = actif.dataset.img;
}

Promise.all([charger("infos.json"), charger("photos.json"), ...CARTE.map((f) => charger(`carte/${f}.json`))])
  .then(([infos, photos, ...cartes]) => {
    remplirInfos(infos);
    remplirPhotos(photos);
    cartes.forEach((plats, i) => remplirCarte(CARTE[i], plats));
  })
  .catch((e) => console.error("Chargement des données impossible :", e));

/* ---------- Onglets de la carte ---------- */
const menuTabs = [...document.querySelectorAll(".menu-tab")];
const menuImg = document.getElementById("menu-img");
menuTabs.forEach((tab) => tab.addEventListener("click", () => {
  menuTabs.forEach((t) => {
    const on = t === tab;
    t.setAttribute("aria-selected", String(on));
    document.getElementById(t.getAttribute("aria-controls")).hidden = !on;
  });
  if (menuImg && tab.dataset.img) menuImg.src = tab.dataset.img;
}));