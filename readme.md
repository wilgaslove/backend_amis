## Cahier des Charges – Application ADN (Accueil Des Nouveaux)
###  Objectif de l'application
Créer une application web permettant de suivre efficacement les nouvelles personnes qui rejoignent l’église.
Chaque nouveau est assigné à un référent, supervisé par un leader, le tout piloté par un super-admin/pasteur.
👥 Les utilisateurs & rôles
🔹 Référent
- Suivre les nouveaux qui lui sont assignés
- Renseigner les informations de suivi
- Voir l'évolution de chaque nouveau membre

🔸 Leader
- Voir tous les référents qu’il supervise
- Consulter l’état d’avancement de chaque suivi
- Relancer les référents inactifs

🔶 Super Admin (ou Pasteur)
- Vue complète sur tous les référents, leaders, et membres
- Gestion des utilisateurs (création, suppression)
- Générer des statistiques globales
- Accéder à toutes les fiches de suivi
📋 Fonctionnalités principales
✅ Authentification
- Login par rôle
- Gestion des rôles et accès selon profil

✅ Fiche d’un nouveau membre
- Nom & Prénom, Contact, Adresse, Profession
- Date d’arrivée à l’église, Baptisé ? Oui/Non
- Requête de prière
 - Désire rencontrer le pasteur ? Date du rendez-vous avec le pasteur,
-  Visite effectuée à la maison ?
- En contact régulier ?, Évolution spirituelle
- Commentaires supplémentaires

✅ Suivi
- Ajout de notes de suivi (appel, message, visite)
- Historique des actions, Statut d’évolution

✅ Tableau de bord par rôle
- Référent : ses membres + actions
- Leader : ses référents + indicateurs
- Admin : vue globale + stats + recherche + actions
📦 Technologies utilisées
🎯 Backend (API)
- Node.js + Express.js
- MongoDB (Atlas)
- Authentification JWT
- Architecture REST



🎯 Frontend
- Vue.js (composition API)
- Vue Router, Axios, Tailwind CSS
🧱 Modèle de données MongoDB (simplifié)
🔸 User
-	User_login, user_name,  password, rôle

🔸 Member
- name: ,
- profession: ,
- contact: ,
- address: ,
- arrivalDate: ,
- baptized: ,
- prayerRequest: ,
- wantsToMeetPastor: ,
- pastorAppointment: ,
- visitedHome: ,
- regulaContact: ,
- followUps[]: ,
- dim1: ,
- dim2: ,
- dim3: ,
- dim4: 
- referentId : 


📅 Planning prévisionnel
| Étape                  | Délai estimé |
|------------------------|--------------|
| Cahier des charges     | ✅ Terminé   |
| Maquette Figma         | 1-2 jours    |
| Backend Node.js        | 3-5 jours    |
| Frontend Vue.js        | 4-7 jours    |
| Intégration & test     | 3 jours      |
| Déploiement            | 1 jour       |
🚀 Déploiement
- Backend : Railway
- Base MongoDB : MongoDB Atlas
- Frontend :Firebase Hosting
📌 Équipe
- Responsable technique : Wilgas ADJOVI
- Designer / UX : Wilgas A.
- Testeurs : Dr_Love