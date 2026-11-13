// ─────────────────────────────────────────────────────────────
//  Hiérarchie et périmètre d'accès (UNE seule source de vérité)
//
//  pasteur  → tout, dans toutes les instances (villes / pays)
//  ap       → tout ce qui est dans SON instance
//  leader   → ses référents et leurs suivis
//  referent → ses suivis
// ─────────────────────────────────────────────────────────────
const User = require("../models/User");

const ROLES = ["pasteur", "ap", "leader", "referent"];

// Qui peut créer quel rôle (chaque niveau crée le niveau juste en dessous)
const ROLE_CREE = { pasteur: "ap", ap: "leader", leader: "referent" };

const LIBELLES = {
  pasteur: "Pasteur principal",
  ap: "Assistant Pasteur",
  leader: "Leader",
  referent: "Référent",
};

// Filtre qui ne renvoie jamais rien
const RIEN = { _id: { $in: [] } };

// Filtre Mongo des suivis (Membre) visibles par cet utilisateur
async function filtreMembres(user) {
  switch (user.role) {
    case "pasteur":
      return {};
    case "ap":
      return user.instance ? { instance: user.instance } : RIEN;
    case "leader": {
      const ids = await User.find({ role: "referent", parent: user._id }).distinct("_id");
      return { referentId: { $in: ids } };
    }
    case "referent":
      return { referentId: user._id };
    default:
      return RIEN;
  }
}

// Filtre Mongo des comptes (User) que cet utilisateur peut voir / gérer
function filtreUtilisateurs(user) {
  switch (user.role) {
    case "pasteur":
      return { _id: { $ne: user._id }, role: { $ne: "pasteur" } };
    case "ap":
      return user.instance
        ? { instance: user.instance, role: { $in: ["leader", "referent"] } }
        : RIEN;
    case "leader":
      return { role: "referent", parent: user._id };
    default:
      return RIEN;
  }
}

// Filtre des commentaires : l'instance de l'utilisateur + ceux du pasteur (instance null)
function filtreCommentaires(user) {
  if (user.role === "pasteur") return {};
  return { $or: [{ instance: user.instance || null }, { instance: null }] };
}

// Combine plusieurs filtres Mongo sans collision de clés
const et = (...filtres) => ({ $and: filtres.filter((f) => f && Object.keys(f).length) });

module.exports = {
  ROLES,
  ROLE_CREE,
  LIBELLES,
  filtreMembres,
  filtreUtilisateurs,
  filtreCommentaires,
  et,
};
