
// Gestisce l'invio delle candidature e i cambi di stato.
// 

// const Job = require('../models/job_listings');

const Application = require('../models/applications');
const JobService = require('../services/jobService');

// per rispondere ad un annuncio "job"
const applyToJob = async (candidateId, jobId, coverLetter) => {
    // chiamo jobService e fa il controllo
    // Se l'annuncio non esiste lancerà l'errore
    await JobService.getJobById(jobId);

    // Verifica duplicato
    const resultDuplicato = await Application.findByCandidateAndJob(candidateId, jobId);
    const candidaturaEsistente = resultDuplicato.rows ? resultDuplicato.rows[0] : resultDuplicato;

    if (candidaturaEsistente) {
        const err = new Error("Ti sei già candidato per questa posizione");
        err.statusCode = 409;
        throw err;
    }

    const newApp = await Application.create({
        candidate_id: candidateId,
        job_id: jobId,
        cover_letter: coverLetter,
        status: 'inviata'
    });
    return newApp.rows[0];
};

const updateApplicationStatus = async (applicationId, newStatus, companyId) => {
    //  Recuperiamo la candidatura includendo i dati dell'annuncio associato
    const appResult = await Application.findById(applicationId);
    const application = appResult.rows ? appResult.rows[0] : appResult;

    if (!application) {
        const err = new Error("Candidatura non trovata");
        err.statusCode = 404;
        throw err;
    }

    //  Recuperiamo l'annuncio per vedere chi è il proprietario
    const job = await JobService.getJobById(application.job_id);

    //  L'azienda loggata è la stessa che ha pubblicato l'annuncio? 
    // così l'annuncio che non appartiene all'azienda non può essere modificato
    if (job.company_id !== companyId) {
        const err = new Error("Non sei autorizzato a gestire questa candidatura");
        err.statusCode = 403;
        throw err;
    }

    //  Aggiornamento dello stato
    const updatedApp = await Application.updateStatus(applicationId, newStatus);
    return updatedApp.rows[0];
};

const getCandidatoApplications = async (candidateId) => {
    const result = await Application.findByCandidateId(candidateId);
    return result.rows;
};

const getusersByapplicationPercompany = async (companyId) => {
  const result = await Application.FindusersByapplicationPercompany(companyId);
  return result.rows;
};

const getApplicationsByJob = async (jobId, companyId) => {

    const job = await JobService.getJobById(jobId);

    // Verifichiamo prima che l'annuncio appartenga all'azienda
    if (job.company_id !== companyId) {
        const err = new Error("Non autorizzato o annuncio non trovato");
        err.statusCode = 403;
        throw err;
    }

    const result = await Application.findByJobId(jobId);
    return result.rows;
};

module.exports = {
    applyToJob,
    updateApplicationStatus,
    getCandidatoApplications,
    getusersByapplicationPercompany,
    getApplicationsByJob
};
