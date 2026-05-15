
// Gestione Annunci
// controller gestisce la creazione e la visualizzazione degli annunci


const jobService = require('../services/jobService');


// Crea un nuovo annuncio (Azienda)
const createJob = async (req, res) => {
    try {
        const companyId = req.user.id; // Preso dal JWT
        const job = await jobService.createJob(req.body, companyId);

        res
            .status(201)
            .json({
                successo: true,
                message: "Annuncio pubblicato con successo",
                data: job
            });
    } catch (err) {
        res
            .status(err.statusCode || 500)
            .json({
                successo: false,
                error: err.message
            });
    }
};

// Recupera un singolo annuncio per ID
const getJobById = async (req, res) => {
    try {
        const { id } = req.params;
        const job = await jobService.getJobById(parseInt(id, 10));

        res
            .json({
                successo: true,
                data: job
            });
    } catch (err) {
        res
            .status(err.statusCode || 500)
            .json({
                successo: false,
                error: err.message
            });
    }
};

// Recupera tutti gli annunci (Candidati / Pubblico)
const getAllJobs = async (req, res) => {
    try {
        const jobs = await jobService.getAllJobs();
        res
            .json({
                successo: true,
                dati: jobs
            });
    } catch (err) {
        res
            .status(500)
            .json({
                successo: false,
                error: err.message
            });
    }
};

//
const getJobsPerCompany = async (req, res) => {
    try {
        const companyId = req.user.id; // Preso dal JWT dell'azienda autenticata
        const jobs = await jobService.getJobsPerCompany(companyId);
        res           .json({           
            successo: true,
            dati: jobs
        });
    } catch (err) {
        res
            .status(500)
            .json({
                successo: false,
                error: err.message
            });
    }
};


// Elimina un annuncio (Solo azienda proprietaria)
const deleteJob = async (req, res) => {
    try {
        //Forza la conversione in numero intero prima di passarlo al service
        const jobId = parseInt(req.params.id, 10);
        // alternativa sarebbe:
        //const { id } = req.params; con la destrutturazione
        //const jobId = parseInt(id, 10);

        const companyId = req.user.id;

        // Il service verificherà se l'annuncio esiste e se appartiene a questa azienda,
        // poi procederà con l'eliminazione dal database
        await jobService.deleteJob(jobId, companyId);
        res
            .status(200)
            .json({
                successo: true,
                message: "Annuncio eliminato con successo"
            });
    } catch (err) {
        res
            .status(err.statusCode || 500)
            .json({
                successo: false,
                error: err.message
            });
    }
};

// Aggiorna un annuncio esistente
const updateJob = async (req, res) => {
    try {
        //Forza la conversione in numero intero prima di passarlo al service
        const jobId = parseInt(req.params.id, 10);
        const companyId = req.user.id; // Preso sempre dal token JWT

        // Il service verificherà la proprietà dell'annuncio prima di aggiornare nel model
        const updatedJob = await jobService.updateJob(jobId, req.body, companyId);

        res
            .json({
                successo: true,
                message: "Annuncio modificato con successo",
                data: updatedJob
            });
    } catch (err) {
        res
            .status(err.statusCode || 500)
            .json({
                successo: false,
                error: err.message
            });
    }
};

module.exports = {
    createJob,
    getJobById,
    getAllJobs,
    getJobsPerCompany,
    deleteJob,
    updateJob
};
