// ============================================================
// models/applications.js — Model della tabella "applications"
//
// Il model si occupa SOLO di comunicare con il database.
// ============================================================

const pool = require("../config/db");

const CREATE_TABLE = `
  CREATE TABLE applications (
        id                SERIAL PRIMARY KEY,         
        candidate_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        job_id            INTEGER NOT NULL REFERENCES job_listings(id) ON DELETE CASCADE,
        cover_letter      TEXT NOT NULL,
        status            VARCHAR(50) DEFAULT 'inviata',
        created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(candidate_id, job_id)  -- Evita candidature duplicate
  );
`;

const init = () => pool.query(CREATE_TABLE);

const findById = async (id) => {
  const result = await pool.query(
    `SELECT
            a.*,
            u.name AS candidate_name,
            u.email AS candidate_email,
            j.title AS job_title,
            j.company_id
         FROM applications a
         JOIN users u ON a.candidate_id = u.id   
         JOIN job_listings j ON a.job_id = j.id
         WHERE a.id = $1`,
    [id],
  );
  return result.rows[0];
};

const findAll = () => {
  return pool.query(
    `SELECT
            a.*,
            u.name AS candidate_name,
            u.email AS candidate_email,
            j.title AS job_title,
            j.city AS job_city,
            j.company_id
         FROM applications a
         JOIN users u ON a.candidate_id = u.id   
         JOIN job_listings j ON a.job_id = j.id
         ORDER BY a.created_at DESC`,
  );
};

const findByCandidateId = (candidate_id) => {
  return pool.query(
    `SELECT
        a.*,
        j.title AS job_title,
        j.description AS job_description,
        j.contract_type,
        j.city,
        j.salary,
        u.name AS company_name
        FROM applications a
         JOIN job_listings j ON a.job_id = j.id
         JOIN users u ON j.company_id = u.id
         WHERE a.candidate_id = $1
         ORDER BY a.created_at DESC`,
    [candidate_id],
  );
};

const FindusersByapplicationPercompany = async (company_id) => {
  const result = await pool.query(
    `SELECT 
    a.id AS application_id,
    a.job_id,
    a.candidate_id,
    a.status,
    a.cover_letter,
    a.created_at AS application_date,
    j.title AS job_title,
    j.description AS job_description,
    j.contract_type,
    j.city AS job_city,
    j.salary,
    u.name AS candidate_name,
    u.email AS candidate_email
FROM applications a
INNER JOIN job_listings j ON a.job_id = j.id
INNER JOIN users u ON a.candidate_id = u.id
WHERE j.company_id = $1 
ORDER BY a.created_at DESC`,
    [company_id],
  );
  return result;
};

const findByCandidateAndJob = async (candidate_id, job_id) => {
  //  const result = await pool.query(
  return pool.query(
    `SELECT * FROM applications 
         WHERE candidate_id = $1 AND job_id = $2`,
    [candidate_id, job_id],
  );
  //  return result.rows[0];
};

const findByJobId = (job_id) => {
  return pool.query(
    `SELECT
            a.*,
            u.name AS candidate_name,
            u.email AS candidate_email
         FROM applications a
         JOIN users u ON a.candidate_id = u.id
         WHERE a.job_id = $1
         ORDER BY a.created_at DESC`,
    [job_id],
  );
};

const create = ({ candidate_id, job_id, cover_letter }) => {
  return pool.query(
    `INSERT INTO applications (candidate_id, job_id, cover_letter, status)
         VALUES ($1, $2, $3, 'inviata')
         RETURNING *`,
    [candidate_id, job_id, cover_letter],
  );
};

const updateStatus = (id, status) => {
  return pool.query(
    `UPDATE applications            
         SET status = $1, updated_at = NOW()
         WHERE id = $2
         RETURNING *`,
    [status, id],
  );
};

const updateCoverLetter = (id, { cover_letter }) => {
  return pool.query(
    `UPDATE applications
            SET cover_letter = COALESCE($1, cover_letter)   
            WHERE id = $2
            RETURNING id, candidate_id, job_id, cover_letter, status`,
    [cover_letter, id],
  );
};

const remove = (id) => {
  return pool.query(`DELETE FROM applications WHERE id = $1 RETURNING id`, [
    id,
  ]);
};

module.exports = {
  init,
  create,
  findById,
  findAll,
  findByJobId,
  FindusersByapplicationPercompany,
  findByCandidateId,
  findByCandidateAndJob,
  updateStatus,
  updateCoverLetter,
  remove,
};
