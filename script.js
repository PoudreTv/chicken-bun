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
