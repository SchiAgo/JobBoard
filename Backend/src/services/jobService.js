
// Gestisce la creazione degli annunci e la logica di visibilità.


const Job = require('../models/job_listings');

const createJob = async (elencoJob, companyId) => {
    const result = await Job.create({ ...elencoJob, company_id: companyId });
    return result.rows[0]; // Ritorna l'annuncio appena inserito
};

const getJobById = async (id) => {
    const job = await Job.findById(id); // estraiamo già rows[0]
    if (!job) {
        const err = new Error("L'annuncio non esiste");
        err.statusCode = 404;
        throw err;
    }
    return job;
};

//
const getJobsPerCompany = async (companyId) => {

    const result = await Job.findCompanyProfile(companyId);
    return result.rows;
};

const getAllJobs = async () => {
    const result = await Job.findAll();
    return result.rows;
};

const deleteJob = async (jobId, companyId) => {

    const job = await getJobById(jobId);

    // Controlla prima se esiste e appartiene all'azienda
    if (job.company_id !== companyId) {
        const err = new Error("Non sei autorizzato a eliminare questo annuncio");
        err.statusCode = 403;
        throw err;
    }

    const result = await Job.remove(jobId);
    return result.rows[0];
};

const updateJob = async (jobId, jobData, companyId) => {
    // Recupera il job (errore 404 se non esiste da getJobById)
    const job = await getJobById(jobId);

    // controlliamo se l'azienda è la proprietaria?
    if (job.company_id !== companyId) {
        const err = new Error("Non sei autorizzato a modificare questo annuncio");
        err.statusCode = 403;
        throw err;
    }

    // facciamo update passando i dati puliti al model
    const result = await Job.update(jobId, jobData);
    return result.rows[0]; // Ritorna l'oggetto aggiornato dal DB
};

module.exports = {
    createJob,
    getJobById,
    getJobsPerCompany,
    getAllJobs,
    deleteJob,
    updateJob
};
