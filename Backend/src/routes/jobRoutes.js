// le rotte per i JOB

const express = require("express");
const router = express.Router();

const validate = require("../middleware/validate");
const jobController = require("../controllers/jobController");

const { body, param, query } = require("express-validator"); // questo sfrutta i controlli di Express.js

const { regoleJob, regolaId } = require("../middleware/jobValidator");

const {
  autenticato,
  soloAzienda,
  soloCandidato,
} = require("../middleware/auth");

console.log("Ciao dal router job");

// TEST: Creazione annuncio senza middleware
// uso un ID esistente nel DB (es. 1)
// router.post('/test-create', (req, res, next) => {

//    console.log("Dentro la rotta test-create")

//    req.user = { id: 1, role: 'azienda' }; // MOCK: simuliamo il middleware
//    next();
// }, jobController.createJob);

// GET /api/jobs — Lista di tutti gli annunci
router.get(
  "/",
  // autenticato,
  jobController.getAllJobs,
);

router.get(
  "/company-jobs",
  autenticato,
  soloAzienda,
  jobController.getJobsPerCompany,
);

// POST /api/jobs — Creazione singolo annuncio
router.post(
  "/",
  autenticato,
  soloAzienda,
  regoleJob,
  validate,
  jobController.createJob,
);

// PUT /api/jobs/:id — Modifica annuncio (Protetta da ID valido e ruolo Azienda)
router.put(
  "/:id",
  autenticato,
  soloAzienda,
  regolaId,
  regoleJob,
  validate,
  jobController.updateJob,
);

// DELETE /api/jobs/:id — Cancellazione annuncio (Protetta da ID valido e ruolo Azienda)
router.delete(
  "/:id",
  autenticato,
  soloAzienda,
  regolaId,
  validate,
  jobController.deleteJob,
);

module.exports = router;
