// ─────────────────────────────────────────────────────────────
//  MIGRATION / RATTACHEMENT : ancienne version (admin/leader/referent)
//  → instances + hiérarchie  Pasteur principal → Leader → Référent
//
//  Usage (exemple pour l'église de Calavi, Bénin) :
//    node scripts/migrer-vers-instances.js --ville "Calavi" --pays "Bénin" --indicatif 229 --garder-zero --dry-run
//    node scripts/migrer-vers-instances.js --ville "Calavi" --pays "Bénin" --indicatif 229 --garder-zero
//
//  Options :
//    --dry-run          simulation : affiche ce qui serait fait, ne modifie rien
//    --pasteur <login>  à utiliser s'il y a plusieurs comptes pasteur/admin
//    --leader <login>   à utiliser s'il y a plusieurs leaders : tous les référents sans leader lui sont rattachés
//
//  Ce que fait le script (sans danger si relancé) :
//   1. crée (ou met à jour) l'instance de départ : ville + pays + indicatif téléphonique
//   2. admin → pasteur (pasteur principal, sans instance)
//   3. TOUS les leaders sans supérieur → rattachés directement au pasteur principal
//   4. leaders et référents → rattachés à l'instance
//   5. TOUS les référents (et assistants leaders) sans leader → rattachés au leader (le leader unique, ou celui donné par --leader)
//   6. suivis et commentaires existants → rattachés à l'instance
//  Les liens déjà existants (ex. leader créé par un AP) ne sont jamais écrasés.
// ─────────────────────────────────────────────────────────────

const SANS = (champ) => ({ $or: [{ [champ]: null }, { [champ]: { $exists: false } }] });

async function migrer({ User, Membre, Instance, Commentaire }, opts, log = console.log) {
  const { ville, pays, dry } = opts;
  if (!ville || !pays) throw new Error('Indiquez --ville "..." et --pays "..."');
  log(dry ? "🔎 MODE SIMULATION (rien n'est modifié)\n" : "");

  // 1. Instance (créée, ou mise à jour si des options sont fournies)
  let instance = await Instance.findOne({ ville, pays }).collation({ locale: "fr", strength: 2 });
  const indicatif = opts.indicatif ? String(opts.indicatif).replace(/\D/g, "") : undefined;
  if (!instance) {
    log(`Instance : ${ville} (${pays}) → sera créée`);
    if (!dry) {
      instance = await Instance.create({ ville, pays, indicatif: indicatif || "", conserverZero: !!opts.garderZero });
    }
  } else {
    const maj = {};
    if (indicatif !== undefined && instance.indicatif !== indicatif) maj.indicatif = indicatif;
    if (opts.garderZero && !instance.conserverZero) maj.conserverZero = true;
    log(`Instance : ${ville} (${pays}) ✔ existe déjà${Object.keys(maj).length ? " → mise à jour " + JSON.stringify(maj) : ""}`);
    if (Object.keys(maj).length && !dry) await Instance.updateOne({ _id: instance._id }, { $set: maj });
  }
  const instId = instance?._id ?? null;

  // 2. Pasteur principal
  const pasteurs = await User.find({ role: { $in: ["admin", "pasteur"] } }).select("_id userLogin");
  let pasteur;
  if (opts.pasteur) {
    pasteur = pasteurs.find((p) => p.userLogin === opts.pasteur);
    if (!pasteur) throw new Error(`Aucun pasteur/admin avec le login « ${opts.pasteur} ».`);
  } else if (pasteurs.length === 1) {
    pasteur = pasteurs[0];
  } else {
    throw new Error(
      pasteurs.length === 0
        ? "Aucun compte pasteur/admin trouvé."
        : `Plusieurs comptes pasteur/admin (${pasteurs.map((p) => p.userLogin).join(", ")}) : précisez --pasteur <login>.`
    );
  }
  log(`Pasteur principal : ${pasteur.userLogin}`);
  if (!dry) await User.updateMany({ role: "admin" }, { $set: { role: "pasteur", instance: null, parent: null } });

  // 3. Leaders → pasteur principal (uniquement ceux qui n'ont pas déjà un supérieur)
  const leadersSansParent = { role: "leader", ...SANS("parent") };
  const nbLeaders = await User.countDocuments(leadersSansParent);
  log(`Leaders à rattacher au pasteur principal : ${nbLeaders}`);
  if (!dry) await User.updateMany(leadersSansParent, { $set: { parent: pasteur._id } });

  // 4. Instance des leaders et référents
  const sansInstance = { role: { $in: ["leader", "referent"] }, ...SANS("instance") };
  log(`Leaders/référents à rattacher à l'instance : ${await User.countDocuments(sansInstance)}`);
  if (!dry) await User.updateMany(sansInstance, { $set: { instance: instId } });

  // 5. Référents → leader
  const leaders = await User.find({ role: "leader" }).select("_id userLogin");
  let leader = null;
  if (opts.leader) {
    leader = leaders.find((l) => l.userLogin === opts.leader);
    if (!leader) throw new Error(`Aucun leader avec le login « ${opts.leader} ».`);
  } else if (leaders.length === 1) {
    leader = leaders[0];
  }
  const referentsSansParent = { role: { $in: ["referent", "al"] }, ...SANS("parent") };
  const nbRef = await User.countDocuments(referentsSansParent);
  if (leader) {
    log(`Référents / assistants leaders à rattacher au leader « ${leader.userLogin} » : ${nbRef}`);
    if (!dry) await User.updateMany(referentsSansParent, { $set: { parent: leader._id } });
  } else if (nbRef) {
    log(
      `⚠️  ${nbRef} référent(s) sans leader, et ${leaders.length} leaders : impossible de choisir.\n` +
        `   Relancez avec --leader <login> (ex. ${leaders[0]?.userLogin || "login.du.leader"}).`
    );
  }

  // 6. Suivis et commentaires
  const membres = await Membre.find(SANS("instance")).select("referentId");
  log(`Suivis à rattacher à l'instance : ${membres.length}`);
  const coms = await Commentaire.find({ instance: { $exists: false } }).select("user");
  log(`Commentaires à rattacher à l'instance : ${coms.length}`);
  if (!dry) {
    for (const m of membres) {
      const ref = await User.findById(m.referentId).select("instance");
      await Membre.updateOne({ _id: m._id }, { $set: { instance: ref?.instance || instId } });
    }
    for (const c of coms) {
      const u = await User.findById(c.user).select("instance");
      await Commentaire.updateOne({ _id: c._id }, { $set: { instance: u?.instance || null } });
    }
  }

  log(dry ? "\n🔎 Simulation terminée : relancez sans --dry-run pour appliquer." : "\n✅ Terminé.");
  return { instanceId: instId, pasteurId: pasteur._id, leaderId: leader?._id ?? null };
}

module.exports = { migrer };

// ───── Lancement en ligne de commande ─────
if (require.main === module) {
  require("dotenv").config();
  const mongoose = require("mongoose");
  const args = process.argv.slice(2);
  const val = (n) => (args.indexOf(n) >= 0 ? args[args.indexOf(n) + 1] : undefined);
  (async () => {
    await mongoose.connect(process.env.MONGODB_URI);
    try {
      await migrer(
        {
          User: require("../models/User"),
          Membre: require("../models/Membre"),
          Instance: require("../models/Instance"),
          Commentaire: require("../models/Commentaire"),
        },
        {
          ville: val("--ville"),
          pays: val("--pays"),
          indicatif: val("--indicatif"),
          garderZero: args.includes("--garder-zero"),
          dry: args.includes("--dry-run"),
          pasteur: val("--pasteur"),
          leader: val("--leader"),
        }
      );
    } finally {
      await mongoose.disconnect();
    }
  })().catch((e) => {
    console.error("❌ " + e.message);
    process.exit(1);
  });
}
