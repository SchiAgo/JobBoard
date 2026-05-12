// ============================================================
// routes/users.routes.js — Route per users e autenticazione
// ============================================================

const router = require("express").Router();
const { body, param } = require("express-validator");
const validate = require("../middleware/validate");
const controller = require("../controllers/authController");

const { autenticato, soloAzienda } = require("../middleware/auth");
const limiter = require("express-rate-limit");

const limiterAuth = limiter({
  windowMs: 1 * 60 * 1000,
  max: 10,
  message: {
    successo: false,
    errore: "Troppi tentativi, riprova tra qualche minuto",
  },
});

// ── Route pubbliche (senza autenticazione) ────────────────────
router.post("/registra", limiterAuth, validate, controller.register);

router.post("/login", limiterAuth, validate, controller.login);

// Solo azienda può eliminare un utente
//router.delete("/:id", autenticato, soloAzienda, validate, controller.elimina);

// ── Esportazione ──────────────────────────────────────────────
module.exports = router;
