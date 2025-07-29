// const mongoose = require('mongoose');
// const Membre = require('./models/Membre');

// mongoose.connect(
//   'mongodb+srv://foimotivation216:5u2O8s6P4yl5JktI@clusteradn.kygkj8x.mongodb.net/ma_base?retryWrites=true&w=majority'
// )
// .then(async () => {
//   console.log("✅ Connecté à MongoDB Atlas");

//   const membres = await Membre.find({ "suivi.referentId": { $exists: true } });

//   console.log(`🔍 ${membres.length} membres à migrer...`);

//   for (const membre of membres) {
//     membre.referent = membre.suivi.referentId;
//     await membre.save();
//     console.log(`✔️ Membre ${membre.firstName} ${membre.lastName} mis à jour`);
//   }

//   console.log("✅ Migration terminée !");
//   process.exit();
// })
// .catch((err) => {
//   console.error("❌ Erreur de connexion :", err);
//   process.exit(1);
// });


const mongoose = require('mongoose');
const Referent = require('/models/Referent'); // Assurez-vous que le chemin est correct

async function removeMembresField() {
  try {
    // Connexion à la base de données
    await mongoose.connect(
      'mongodb+srv://foimotivation216:5u2O8s6P4yl5JktI@clusteradn.kygkj8x.mongodb.net/ma_base?retryWrites=true&w=majority', 
      {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Suppression du champ `membres` s'il existe
    await Referent.updateMany({}, { $unset: { membres: "" } });

    console.log("Champ 'membres' supprimé de tous les documents, s'il existait.");
  } catch (error) {
    console.error("Erreur lors de la migration :", error);
  } finally {
    // Déconnexion de la base de données
    mongoose.connection.close();
  }
}

removeMembresField();