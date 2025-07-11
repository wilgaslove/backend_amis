const mongoose = require('mongoose');
const Membre = require('./models/Membre');

mongoose.connect(
  'mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/nom_de_ta_base?retryWrites=true&w=majority'
)
.then(async () => {
  console.log("✅ Connecté à MongoDB Atlas");

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
