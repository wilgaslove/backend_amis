const multer = require("multer");

// Les photos sont gardées en mémoire puis enregistrées en base (MongoDB) :
// le disque de l'hébergeur est effacé à chaque redéploiement.
const TAILLE_MAX = 5 * 1024 * 1024; // 5 Mo (le navigateur réduit déjà les photos avant l'envoi)

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: TAILLE_MAX, files: 1 },
  fileFilter: (req, file, cb) => {
    if (/^image\/(jpeg|png|webp|gif)$/.test(file.mimetype)) return cb(null, true);
    cb(new Error("FORMAT_IMAGE"));
  },
});

// Middleware qui renvoie des erreurs JSON propres (au lieu d'une page d'erreur HTML)
const uploadPhoto = (req, res, next) => {
  upload.single("photo")(req, res, (err) => {
    if (!err) return next();
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ message: "Photo trop lourde (5 Mo maximum)." });
    }
    if (err.message === "FORMAT_IMAGE") {
      return res.status(400).json({ message: "Format non supporté (JPG, PNG, WEBP ou GIF)." });
    }
    return res.status(400).json({ message: "Envoi de la photo impossible." });
  });
};

module.exports = uploadPhoto;
