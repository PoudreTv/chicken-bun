# Guide du site – [[Nom de l'entreprise]]

Ce document explique comment fonctionne votre site, qui détient quoi, et comment le faire
évoluer. Il est destiné à [[Nom de l'entreprise]] et à toute personne qui reprendra le site.

---

## En bref

- **Le site vous appartient** : hébergement (Netlify) et nom de domaine ([[OVH / autre]]) sont à votre nom.
  Vous seul(e) avez les mots de passe.
- **Il ne coûte rien** en dehors du nom de domaine (~10-15 €/an). L'hébergement Netlify est gratuit
  (une vingtaine de mises à jour par mois, bien plus que nécessaire). Si la limite était dépassée,
  le site serait simplement mis en pause jusqu'au mois suivant, sans facture.
- **Rien à entretenir** : pas de logiciel à mettre à jour, pas de risque de piratage type WordPress.
- **Les demandes du formulaire** arrivent par e-mail et restent consultables dans Netlify → *Forms*.

### Faire une modification plus tard
| Vous voulez… | Solution |
|---|---|
| Changer un horaire, un numéro, une phrase | Me contacter ([[ton e-mail]]) ou n'importe quel développeur web |
| Ajouter des photos, un service, une page | Idem : le site est en HTML standard, tout développeur peut le reprendre avec ce guide |
| Revenir en arrière après une erreur | Netlify → *Deploys* → choisir une version précédente → *Publish deploy* |

---

## 1. Comment c'est construit

Site en HTML, CSS et JavaScript « purs » : aucun logiciel, aucune base de données, aucun abonnement.

| Fichier | Rôle |
|---|---|
| `index.html` | La page d'accueil complète |
| `mentions-legales.html` | Mentions légales (obligatoires) |
| `404.html` | Page affichée si une adresse n'existe pas |
| `style.css` | Mise en page et couleurs |
| `script.js` | Menu mobile, galerie photos, formulaire |
| `img/` | Logo et photos |
| `netlify.toml` | Réglages de l'hébergement |
| `robots.txt`, `sitemap.xml` | Référencement Google |

## 2. Qui détient quoi

| Élément | Où | Titulaire | Coût |
|---|---|---|---|
| Nom de domaine `[[domaine]]` | [[OVH]] | **[[Nom de l'entreprise]]** | ~10-15 €/an |
| Hébergement | Netlify | **[[Nom de l'entreprise]]** | gratuit |
| Code source | [[GitHub / copie remise]] | [[…]] | gratuit |
| Fiche Google (avis, horaires) | Google Business Profile | **[[Nom de l'entreprise]]** | gratuit |

## 3. Les demandes de contact

Gérées par **Netlify Forms** : chaque demande est envoyée par e-mail à l'adresse configurée,
et reste consultable dans Netlify → *Forms* → *contact*. Une protection anti-spam est intégrée.

Changer l'adresse de réception : Netlify → le site → *Project configuration* → *Notifications*
→ *Form submission notifications*.

## 4. Les modifications courantes (pour un développeur)

- **Horaires** : dans `index.html`, le tableau `class="hours"` **et** le bloc `application/ld+json` en haut (lu par Google).
- **Téléphone** : rechercher l'ancien numéro dans toutes les pages (formats `0X XX XX XX XX` et `+33XXXXXXXXX`).
- **Un service** : un bloc `<article class="card">` par service, copier un bloc pour en ajouter un.
- **Une photo** : la déposer dans `img/`, puis copier une ligne `<a>` de la galerie.
- **Les couleurs** : en haut de `style.css`, bloc `:root`.

## 5. Le nom de domaine (fait à la livraison)

1. Netlify → *Domain management* → *Add a domain* → `www.[[domaine]]`.
2. Chez le registrar ([[OVH]]) → *Zone DNS* : enregistrement **A** du domaine nu vers l'IP Netlify,
   **CNAME** de `www` vers `[[xxx]].netlify.app`.
3. ⚠️ **Ne jamais toucher aux enregistrements MX / SPF** : ce sont vos e-mails.
4. Le certificat HTTPS s'active tout seul en quelques heures.
