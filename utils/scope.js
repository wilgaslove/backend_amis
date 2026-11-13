// ─────────────────────────────────────────────────────────────
//  Hiérarchie et périmètre d'accès (UNE seule source de vérité)
//
//  pasteur  → tout, dans toutes les instances (villes / pays)
//  ap       → tout ce qui est dans SON instance
//  leader   → ses référents et leurs suivis
//  al       → Assistant Leader : EXACTEMENT comme le leader qu'il assiste (même équipe, mêmes droits)
//  referent → ses suivis
// ─────────────────────────────────────────────────────────────
const User = require("../models/User");

const ROLES = ["pasteur", "ap", "leader", "al", "referent"];

// Qui peut créer quels rôles (le premier de la liste est celui proposé par défaut)
const ROLES_CREABLES = {
  pasteur: ["ap"],
  ap: ["leader", "al"],
  leader: ["referent", "al"],
  al: ["referent", "al"], // l'AL a les mêmes droits que le leader
};

const LIBELLES = {
  pasteur: "Pasteur principal",
  ap: "Assistant Pasteur",
  leader: "Leader",
  al: "Assistant Leader",
  referent: "Référent",
};

// Le leader dont dépend l'équipe : lui-même, ou celui que l'AL assiste (son "parent")
const leaderDe = (user) =>
  user.role === "leader" ? user._id : user.role === "al" ? user.parent || null : null;

// Filtre qui ne renvoie jamais rien
const RIEN = { _id: { $in: [] } };

// Filtre Mongo des suivis (Membre) visibles par cet utilisateur
async function filtreMembres(user) {
  switch (user.role) {
    case "pasteur":
      return {};
    case "ap":
      return user.instance ? { instance: user.instance } : RIEN;
    case "leader":
    case "al": {
      const chef = leaderDe(user);
      // Suivis des référents ET des assistants leaders de l'équipe (un AL a aussi ses propres suivis)
      const ids = chef
        ? await User.find({ role: { $in: ["referent", "al"] }, parent: chef }).distinct("_id")
        : [];
      // Un AL voit toujours SES suivis, même si son compte n'est pas (encore) rattaché à un leader
      // (ex. un référent promu assistant leader). Un leader a toujours une équipe : lui-même.
      if (user.role === "al") ids.push(user._id);
      return ids.length ? { referentId: { $in: ids } } : RIEN;
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
        ? { instance: user.instance, role: { $in: ["leader", "al", "referent"] } }
        : RIEN;
    case "leader": {
      const chef = leaderDe(user);
      if (!chef) return RIEN;
      // Ses référents et ses assistants leaders
      return { parent: chef, role: { $in: ["referent", "al"] }, _id: { $ne: user._id } };
    }
    case "al": {
      const chef = leaderDe(user);
      if (!chef) return RIEN;
      // Son leader + les autres assistants + les référents (sans soi-même)
      return {
        $or: [
          { _id: chef },
          { parent: chef, role: { $in: ["referent", "al"] }, _id: { $ne: user._id } },
        ],
      };
    }
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
  ROLES_CREABLES,
  LIBELLES,
  leaderDe,
  filtreMembres,
  filtreUtilisateurs,
  filtreCommentaires,
  et,
};
