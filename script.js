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

/* ---------- Chicken Bun : ouvert / fermé en direct + jour du jour dans les horaires ----------
   Horaires à garder identiques au tableau #hours et au bloc ld+json de index.html.
   Clé = jour (0 dimanche … 6 samedi), valeurs = créneaux [ouverture, fermeture] en minutes. */
const SCHEDULE = {
  0: [ [18 * 60, 22 * 60] ],
  1: [ [18 * 60, 22 * 60 + 30] ],
  2: [ [18 * 60, 22 * 60 + 30] ],
  3: [ [18 * 60, 22 * 60 + 30] ],
  4: [ [11 * 60, 14 * 60], [18 * 60, 22 * 60 + 30] ],
  5: [],
  6: [ [18 * 60, 22 * 60 + 30] ],
};
const DAYS = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
const hhmm = (m) => `${Math.floor(m / 60)}h${m % 60 ? String(m % 60).padStart(2, "0") : ""}`;

function openingStatus(now) {
  const day = now.getDay();
  const min = now.getHours() * 60 + now.getMinutes();
  const current = SCHEDULE[day].find(([o, c]) => min >= o && min < c);
  if (current) return { open: true, text: `Ouvert · jusqu'à ${hhmm(current[1])}` };
  const later = SCHEDULE[day].find(([o]) => o > min);
  if (later) return { open: false, text: `Fermé · ouvre à ${hhmm(later[0])}` };
  for (let i = 1; i <= 7; i++) {
    const d = (day + i) % 7;
    if (SCHEDULE[d].length) {
      const when = i === 1 ? "demain" : DAYS[d];
      return { open: false, text: `Fermé · ouvre ${when} à ${hhmm(SCHEDULE[d][0][0])}` };
    }
  }
  return { open: false, text: "Fermé" };
}

const statusEl = document.getElementById("status");
if (statusEl) {
  const s = openingStatus(new Date());
  statusEl.classList.add(s.open ? "is-open" : "is-closed");
  document.getElementById("status-text").textContent = s.text;
}
const todayRow = document.querySelector(`#hours tr[data-day="${new Date().getDay()}"]`);
if (todayRow) todayRow.classList.add("today");
