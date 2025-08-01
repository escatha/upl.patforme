const knex = require("../db/knex");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");

// Avant d’insérer
const id = uuidv4();

await knex("users").insert({
  id,
  name,
  matricule,
  password: hashedPassword,
  role,
  faculty
});

const login = async (req, res) => {
  const { matricule, password, faculty } = req.body;

  if (!matricule || !password || !faculty) {
    return res.status(400).json({ message: "Tous les champs sont requis." });
  }

  try {
    // ✅ Cherche l’utilisateur avec matricule et faculté
    const user = await knex("users")
      .select("*") // Ajouté pour forcer à tout récupérer, y compris id
      .where({ matricule, faculty })
      .first();

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé dans cette faculté." });
    }

    console.log("Utilisateur trouvé en base :", user); // ✅ ici maintenant que user est défini

    // 🔐 Vérifie le mot de passe
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: "Mot de passe incorrect." });
    }

    // 🔑 Génère un token JWT
    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        faculty: user.faculty,
      },
      process.env.JWT_SECRET || "default_secret",
      { expiresIn: "2h" }
    );

    // ✅ Supprime le champ password avant d’envoyer
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      user: userWithoutPassword,
      token,
    });

  } catch (err) {
    console.error("Erreur serveur lors de la connexion :", err);
    res.status(500).json({ message: "Erreur serveur lors de la connexion." });
  }
};

module.exports = {
  login,
};