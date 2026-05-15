// ============================================================
// routes/application.routes.js
// ============================================================

const router = require("express").Router();
const { body, param } = require("express-validator");
const validate = require("../middleware/validate");

const controller = require("../controllers/applicationController");

const {
  autenticato,
  soloAzienda,
  soloCandidato,
} = require("../middleware/auth");

console.log("LOG: Il file applicationRoutes è stato caricato!");

console.log("TEST FUNZIONI:");
console.log("autenticato:", typeof autenticato);
console.log("soloCandidato:", typeof soloCandidato);
console.log("controller.apply:", typeof controller.apply);

const regolaId = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("L'id deve essere un numero intero positivo"),
];

router.post("/apply", autenticato, soloCandidato, validate, controller.apply);

router.patch(
  "/:id/status",
  autenticato,
  soloAzienda,
  regolaId,
  validate,
  controller.updateStatus,
);

router.get(
  "/job/:jobId",
  autenticato,
  soloAzienda,
  validate,
  controller.getApplicationsByJob,
);

router.get("/mine", autenticato, soloCandidato, controller.getMyApplications);

router.get(
  "/company-applications",
  autenticato,
  soloAzienda,
  controller.getusersByapplicationPercompany,
);

// Tutte le routes

module.exports = router;
