// Export des suivis en Excel / PDF / JSON — limité au périmètre de l'utilisateur connecté.
const Membre = require("../models/Membre");
const User = require("../models/User");
const Instance = require("../models/Instance");
const { filtreMembres, et, LIBELLES } = require("../utils/scope");

const oui = (v) => (v ? "Oui" : "Non");
const jour = (d) => (d ? new Date(d).toISOString().substring(0, 10) : "");
// Colonnes à plat (utilisées par Excel et PDF)
const COLONNES = [
  { cle: "instance", titre: "Instance", largeur: 18 },
  { cle: "leader", titre: "Leader", largeur: 20 },
  { cle: "referent", titre: "Référent", largeur: 20 },
  { cle: "nom", titre: "Nom", largeur: 18 },
  { cle: "prenom", titre: "Prénom", largeur: 18 },
  { cle: "genre", titre: "Genre", largeur: 9 },
  { cle: "situation", titre: "Situation matrimoniale", largeur: 16 },
  { cle: "profession", titre: "Profession", largeur: 18 },
  { cle: "contact", titre: "Contact", largeur: 16 },
  { cle: "mail", titre: "Email", largeur: 24 },
  { cle: "adresse", titre: "Adresse", largeur: 24 },
  { cle: "urgenceNom", titre: "Urgence (nom)", largeur: 18 },
  { cle: "urgenceContact", titre: "Urgence (contact)", largeur: 16 },
  { cle: "dateArrivee", titre: "Date d'arrivée", largeur: 13 },
  { cle: "rdvPasteur", titre: "RDV pasteur", largeur: 13 },
  { cle: "baptise", titre: "Baptisé", largeur: 9 },
  { cle: "veuxFaireBapteme", titre: "Veut être baptisé", largeur: 11 },
  { cle: "veuxIntegrer", titre: "Veut intégrer", largeur: 11 },
  { cle: "dePassage", titre: "De passage", largeur: 10 },
  { cle: "nouvelleNaissance", titre: "Nouvelle naissance", largeur: 12 },
  { cle: "renouvelle", titre: "Renouvelle engagement", largeur: 12 },
  { cle: "veutParlerPasteur", titre: "Veut voir le pasteur", largeur: 12 },
  { cle: "contactRegulier", titre: "Contact régulier", largeur: 11 },
  { cle: "visiteMaison", titre: "Visite à domicile", largeur: 11 },
  { cle: "dimanche1", titre: "Dim. 1", largeur: 8 },
  { cle: "dimanche2", titre: "Dim. 2", largeur: 8 },
  { cle: "dimanche3", titre: "Dim. 3", largeur: 8 },
  { cle: "dimanche4", titre: "Dim. 4", largeur: 8 },
  { cle: "connuPar", titre: "Connu l'église par", largeur: 24 },
  { cle: "requete", titre: "Requête de prière", largeur: 30 },
  { cle: "note", titre: "Commentaire du référent", largeur: 30 },
];

// Colonnes retenues pour le PDF (paysage A4 : on garde l'essentiel)
const COLONNES_PDF = [
  ["nom", 78], ["prenom", 78], ["contact", 78], ["genre", 38], ["dateArrivee", 58],
  ["baptise", 40], ["veuxIntegrer", 44], ["dePassage", 44], ["dimanche1", 28],
  ["dimanche2", 28], ["dimanche3", 28], ["dimanche4", 28], ["referent", 90], ["instance", 90],
];

// Statistiques cliquables du tableau de bord → conditions Mongo
const STATUTS = {
  integrer: { veuxIntegrer: true },
  passage: { dePassage: true },
  bapteme: { veuxFaireBapteme: true },
  baptises: { baptise: true },
  naissance: { nouvelleNaissance: true },
  renouvelle: { renouvelleMonEngagement: true },
  pasteur: { desireRencontrerPasteur: true },
};

async function construireDonnees(req) {
  const { dateDebut, dateFin, instance, statut, perimetre } = req.query;
  const filtres = [await filtreMembres(req.user)];

  if (dateDebut || dateFin) {
    const plage = {};
    if (dateDebut) plage.$gte = new Date(dateDebut);
    if (dateFin) {
      const fin = new Date(dateFin);
      fin.setUTCHours(23, 59, 59, 999);
      plage.$lte = fin;
    }
    filtres.push({ dateArrivee: plage });
  }
  // « Mes membres » : uniquement les suivis dont l'utilisateur est lui-même le référent
  if (perimetre === "miens") filtres.push({ referentId: req.user._id });
  if (Object.prototype.hasOwnProperty.call(STATUTS, statut)) filtres.push(STATUTS[statut]);
  // Seul le pasteur principal peut cibler une instance ; pour les autres le périmètre l'impose déjà
  if (instance && req.user.role === "pasteur") filtres.push({ instance });

  const membres = await Membre.find(et(...filtres)).sort({ dateArrivee: -1, createdAt: -1 }).lean();

  const referentIds = [...new Set(membres.map((m) => String(m.referentId)))];
  const referents = await User.find({ _id: { $in: referentIds } })
    .select("nom prenom parent")
    .lean();
  const leaders = await User.find({ _id: { $in: referents.map((r) => r.parent).filter(Boolean) } })
    .select("nom prenom")
    .lean();
  const instances = await Instance.find({
    _id: { $in: [...new Set(membres.map((m) => String(m.instance)).filter((i) => i !== "undefined"))] },
  }).lean();

  const refParId = Object.fromEntries(referents.map((r) => [String(r._id), r]));
  const leaderParId = Object.fromEntries(leaders.map((l) => [String(l._id), l]));
  const instParId = Object.fromEntries(instances.map((i) => [String(i._id), i]));
  const nomComplet = (u) => (u ? `${u.prenom || ""} ${u.nom || ""}`.trim() : "");

  const lignes = membres.map((m) => {
    const ref = refParId[String(m.referentId)];
    const inst = instParId[String(m.instance)];
    const c = m.commentVousAvezConnuEglise || {};
    const connu = [
      c.reseauSociaux && "Réseaux sociaux",
      c.invitation && "Invitation d'un ami",
      c.passageProximite && "Passage à proximité",
      [true, "true"].includes(c.autre) && "Autre",
    ].filter(Boolean).join(", ");

    return {
      instance: inst ? `${inst.ville} (${inst.pays})` : "",
      leader: nomComplet(ref && leaderParId[String(ref.parent)]),
      referent: nomComplet(ref),
      // Dans l'application, "firstName" est saisi comme "Nom" et "lastName" comme "Prénom"
      nom: m.firstName || "",
      prenom: m.lastName || "",
      genre: m.genre || "",
      situation: m.situationMatrimoniale || "",
      profession: m.profession || "",
      contact: m.contact || "",
      mail: m.mail || "",
      adresse: m.address || "",
      urgenceNom: m.personneUrgence?.nomPrenom || "",
      urgenceContact: m.personneUrgence?.contact || "",
      dateArrivee: jour(m.dateArrivee),
      rdvPasteur: jour(m.rdvPasteur),
      baptise: oui(m.baptise),
      veuxFaireBapteme: oui(m.veuxFaireBapteme),
      veuxIntegrer: oui(m.veuxIntegrer),
      dePassage: oui(m.dePassage),
      nouvelleNaissance: oui(m.nouvelleNaissance),
      renouvelle: oui(m.renouvelleMonEngagement),
      veutParlerPasteur: oui(m.desireRencontrerPasteur),
      contactRegulier: oui(m.contactRegulier),
      visiteMaison: oui(m.visiteMaison),
      dimanche1: oui(m.suivi?.dimanche1),
      dimanche2: oui(m.suivi?.dimanche2),
      dimanche3: oui(m.suivi?.dimanche3),
      dimanche4: oui(m.suivi?.dimanche4),
      connuPar: connu,
      requete: m.requetePriere || "",
      note: m.note || "",
    };
  });

  return { membres, lignes, referents: refParId, leaders: leaderParId, instances: instParId };
}

const nomFichier = (ext) => `suivis_${new Date().toISOString().substring(0, 10)}.${ext}`;

// GET /api/export/membres?format=xlsx|pdf|json&dateDebut=&dateFin=&instance=
exports.exporterMembres = async (req, res) => {
  try {
    const format = String(req.query.format || "xlsx").toLowerCase();
    if (!["xlsx", "pdf", "json"].includes(format)) {
      return res.status(400).json({ message: "Format inconnu (xlsx, pdf ou json)." });
    }
    const donnees = await construireDonnees(req);

    if (format === "json") {
      const sortie = {
        exporteLe: new Date().toISOString(),
        exportePar: `${req.user.prenom || ""} ${req.user.nom || ""}`.trim(),
        role: LIBELLES[req.user.role] || req.user.role,
        total: donnees.membres.length,
        suivis: donnees.membres.map((m, i) => ({
          ...m,
          referent: donnees.lignes[i].referent,
          leader: donnees.lignes[i].leader,
          instanceNom: donnees.lignes[i].instance,
        })),
      };
      res.set({
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="${nomFichier("json")}"`,
      });
      return res.send(JSON.stringify(sortie, null, 2));
    }

    if (format === "xlsx") return await envoyerExcel(res, donnees);
    return envoyerPdf(req, res, donnees);
  } catch (err) {
    console.error("Erreur export :", err);
    if (!res.headersSent) res.status(500).json({ message: "Erreur lors de l'export." });
  }
};

async function envoyerExcel(res, { lignes }) {
  const ExcelJS = require("exceljs");
  const wb = new ExcelJS.Workbook();
  wb.creator = "ADN - Amis des Nouveaux";
  wb.created = new Date();
  const ws = wb.addWorksheet("Suivis", { views: [{ state: "frozen", ySplit: 1 }] });

  ws.columns = COLONNES.map((c) => ({ header: c.titre, key: c.cle, width: c.largeur }));
  lignes.forEach((l) => ws.addRow(l));

  const entete = ws.getRow(1);
  entete.font = { bold: true, color: { argb: "FFFFFFFF" } };
  entete.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF3B2A7A" } };
  entete.alignment = { vertical: "middle", wrapText: true };
  entete.height = 30;
  ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: COLONNES.length } };

  res.set({
    "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "Content-Disposition": `attachment; filename="${nomFichier("xlsx")}"`,
  });
  await wb.xlsx.write(res);
  res.end();
}

function envoyerPdf(req, res, { lignes }) {
  const PDFDocument = require("pdfkit");
  const doc = new PDFDocument({ size: "A4", layout: "landscape", margin: 28 });
  res.set({
    "Content-Type": "application/pdf",
    "Content-Disposition": `attachment; filename="${nomFichier("pdf")}"`,
  });
  doc.pipe(res);

  const titres = Object.fromEntries(COLONNES.map((c) => [c.cle, c.titre]));
  const largeurs = COLONNES_PDF.map(([, w]) => w);
  const hauteurLigne = 18;
  const bas = doc.page.height - doc.page.margins.bottom - 14;
  const gauche = doc.page.margins.left;

  const enteteDoc = () => {
    doc.font("Helvetica-Bold").fontSize(15).fillColor("#3b2a7a")
      .text("ADN - Suivi des nouveaux", gauche, doc.page.margins.top);
    doc.font("Helvetica").fontSize(9).fillColor("#444").text(
      `${LIBELLES[req.user.role] || req.user.role} : ${req.user.prenom || ""} ${req.user.nom || ""}  |  ` +
        `${lignes.length} suivi(s)  |  Exporté le ${new Date().toLocaleDateString("fr-FR")}`
    );
    doc.moveDown(0.6);
  };

  const enteteTableau = (y) => {
    doc.rect(gauche, y, largeurs.reduce((a, b) => a + b, 0), hauteurLigne).fill("#3b2a7a");
    let x = gauche;
    doc.font("Helvetica-Bold").fontSize(7).fillColor("#ffffff");
    COLONNES_PDF.forEach(([cle], i) => {
      doc.text(titres[cle], x + 2, y + 5, { width: largeurs[i] - 4, height: 10, ellipsis: true, lineBreak: false });
      x += largeurs[i];
    });
    return y + hauteurLigne;
  };

  enteteDoc();
  let y = enteteTableau(doc.y);

  lignes.forEach((l, idx) => {
    if (y + hauteurLigne > bas) {
      doc.addPage();
      y = enteteTableau(doc.page.margins.top);
    }
    if (idx % 2 === 0) {
      doc.rect(gauche, y, largeurs.reduce((a, b) => a + b, 0), hauteurLigne).fill("#f1eefb");
    }
    let x = gauche;
    doc.font("Helvetica").fontSize(7).fillColor("#111");
    COLONNES_PDF.forEach(([cle], i) => {
      doc.text(String(l[cle] ?? ""), x + 2, y + 5, { width: largeurs[i] - 4, height: 10, ellipsis: true, lineBreak: false });
      x += largeurs[i];
    });
    y += hauteurLigne;
  });

  if (!lignes.length) {
    doc.font("Helvetica").fontSize(10).fillColor("#666").text("Aucun suivi pour ce périmètre.", gauche, y + 10);
  }
  doc.end();
}
