const mongoose = require('mongoose');
const Membre = require('./models/Membre');

mongoose.connect('mongodb://127.0.0.1:27017/nom_de_ta_base', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log("✅ Connecté à MongoDB");

  const membres = await Membre.find({ "suivi.referentId": { $exists: true } });

  console.log(`🔍 ${membres.length} membres à migrer...`);

  for (const membre of membres) {
    membre.referent = membre.suivi.referentId;
    await membre.save();
    console.log(`✔️ Membre ${membre.firstName} ${membre.lastName} mis à jour`);
  }

  console.log("✅ Migration terminée !");
  process.exit();
})
.catch((err) => {
  console.error("❌ Erreur de connexion :", err);
  process.exit(1);
});
