# ADN v2 — Instances (villes/pays) + hiérarchie Pasteur → AP → Leader → Référent

## Qui voit / crée quoi
| Rôle | Crée | Voit | Exporte |
|---|---|---|---|
| Pasteur principal | Instances + Assistants Pasteurs | Tout, toutes instances | Tout (ou une instance) |
| Assistant Pasteur | Leaders | Toute SON instance | Son instance |
| Leader | Référents | Ses référents + leurs suivis | Ses référents |
| Référent | Suivis | Ses suivis | Ses suivis |

## Déploiement (dans cet ordre, aux heures calmes)
1. **Sauvegarde** de la base (Atlas → Backup / Snapshot).
2. Copiez les fichiers de ce dossier par-dessus votre projet (les `.env` ne sont PAS inclus : gardez les vôtres).
3. Backend : `npm install` (nouveaux paquets : `exceljs`, `pdfkit`).
   Sur Railway, ajoutez la variable **JWT_SECRET** (longue chaîne aléatoire) — voir « Sécurité ».
4. Déployez le backend, puis **tout de suite** lancez la migration depuis votre poste (avec le `.env` pointant sur la base de prod) :
   ```
   node scripts/migrer-vers-instances.js --ville "Cotonou" --pays "Bénin" --indicatif 229 --garder-zero --dry-run
   node scripts/migrer-vers-instances.js --ville "Cotonou" --pays "Bénin" --indicatif 229 --garder-zero
   ```
   (`--dry-run` = simulation. Remplacez ville/pays par votre église actuelle. `--garder-zero` : voir plus bas.)
5. Déployez le frontend (`npm run build` puis `firebase deploy`).
6. Connectez-vous avec votre compte pasteur (l'ancien « admin » devient Pasteur principal) :
   créez les autres instances, puis un AP par instance. Les AP créent leurs leaders.
   Les leaders/référents existants sont rattachés à l'instance de départ ; un AP peut rattacher
   les référents aux bons leaders dans « Mon équipe ».

## Photos
Enregistrées dans MongoDB (le disque de Railway est effacé à chaque déploiement). Le navigateur les
réduit à ~800 px avant l'envoi. Elles ne sont visibles que par les personnes ayant accès au suivi.

## Appel / WhatsApp
Le numéro est transformé en lien `tel:` et `https://wa.me/…`.
- Numéro avec `+` ou `00` : utilisé tel quel.
- Sinon : l'indicatif de l'instance est ajouté. Le « 0 » initial est retiré, sauf si l'instance a
  l'option « le 0 initial fait partie du numéro » (cochez-la pour les pays à numéros du type 01…).
- Conseil : demandez aux référents de saisir les numéros au format international (+229…).

## Sécurité — à faire
- **Changez le mot de passe MongoDB Atlas.** L'ancien script `migrateReferents.js` (supprimé ici) contenait
  l'URL de connexion avec mot de passe, et le `.env` était versionné (le fichier s'appelait `.gitinore`,
  sans effet). Ils restent dans l'historique git : changer le mot de passe est la seule vraie protection.
- Définissez `JWT_SECRET` : sans lui, le serveur utilise `secret_key`, valeur publique avec laquelle n'importe qui
  peut fabriquer un faux jeton. Après ajout, tout le monde devra se reconnecter (normal).
- L'inscription publique `/register` (qui permettait de créer un compte avec n'importe quel rôle) est supprimée.
- Les commentaires ne sont plus lisibles sans connexion, et sont limités à l'instance (+ ceux du pasteur).
- Un référent ne peut plus changer le référent/l'instance d'un suivi via la requête.

## Nouveaux comptes
Les comptes créés par la hiérarchie doivent changer leur mot de passe à la 1re connexion (8 caractères min.).

## Nouveau compte pasteur (installation vierge)
`node scripts/creer-pasteur.js <login> <motDePasse> "<Nom>" "<Prénom>"`

## Mode sombre (Clair / Sombre / Système)
- Sélecteur ☀️ 🌙 💻 dans la barre de navigation du tableau de bord et en haut à droite de la page de connexion.
- Le choix est mémorisé sur l'appareil. « Système » suit le téléphone/ordinateur en direct.
- Défaut : « Système » (`THEME_PAR_DEFAUT` dans `src/utils/theme.ts`, et la même logique dans `index.html`).
- Palette sombre : un seul fichier à retoucher, `src/assets/dark.css`.

## Design et responsivité (écrans mobile / tablette / ordinateur)
- **Base globale** (`assets/main.css`) : suppression du CSS hérité du modèle Vue (grille 2 colonnes + `body` en flex) qui tassait
  toutes les pages à gauche. Chaque écran gère maintenant sa propre largeur. Texte de 16 px (évite le zoom automatique d'iOS dans les champs).
- **Tableau de bord** : barre du haut pleine largeur ; statistiques en tuiles compactes (2 lignes sur mobile, 1 ligne sur ordinateur) ;
  liste de membres avec avatar, contact, date, boutons Appeler / WhatsApp ; recherche + export en haut, filtres repliables ;
  sur ordinateur, colonne de droite (formulaire ou gestion) qui reste visible au défilement ; sur mobile, le formulaire s'ouvre en plein écran
  avec un bouton « Enregistrer » toujours visible. Cliquer sur une ligne ouvre la fiche.
- **Menu** : barre de liens sur ordinateur, panneau déroulant sur mobile (un tap à côté le ferme).
- **Pages** Commentaires, Mot de passe, Guide, Connexion : mêmes principes (cartes arrondies, largeur adaptée, connexion en plein écran).
