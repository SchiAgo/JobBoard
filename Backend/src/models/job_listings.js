// ============================================================
// models/job_listings.js — Model della tabella "job_listings"
// ============================================================
const pool = require("../config/db");

const CREATE_TABLE = `
  CREATE TABLE IF NOT EXISTS job_listings (
    id              SERIAL          PRIMARY KEY,
    company_id      INTEGER         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title           VARCHAR(255)    NOT NULL,
    description     TEXT            NOT NULL,
    contract_type   VARCHAR(100)    NOT NULL,
    city            varchar(150)    NOT NULL,
    salary          Numeric(10,2)   NOT NULL,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
  );    
`;

const init = () => pool.query(CREATE_TABLE);

const findById = async (id) => {
  const result = await pool.query(
    `SELECT 
          j.*,
          u.name AS company_name,
          u.email AS company_email,
          COUNT(a.id) AS total_applications,
          COUNT(CASE WHEN a.status = 'inviata' THEN 1 END) AS pending_applications,
          COUNT(CASE WHEN a.status = 'accettata' THEN 1 END) AS accepted_applications,
          COUNT(CASE WHEN a.status = 'rifiutata' THEN 1 END) AS rejected_applications   
      FROM job_listings j
      JOIN users u ON u.id = j.company_id
      LEFT JOIN applications a ON a.job_id = j.id
      WHERE j.id = $1
      GROUP BY j.id, u.name, u.email`,
    [id],
  );
  return result.rows[0];
};

const findAll = () =>
  pool.query(
    `SELECT
       j.*,
       u.name                          AS company_name,
       u.email                         AS company_email,
       COUNT(a.id)                     AS total_applications,
       COUNT(CASE WHEN a.status = 'inviata' THEN 1 END) AS pending_applications
     FROM job_listings j
     JOIN users u ON u.id = j.company_id
     LEFT JOIN applications a ON a.job_id = j.id
     GROUP BY j.id, u.name, u.email
     ORDER BY j.created_at DESC`,
  );

//Filtri per città e tipo contratto ·
const findByFilters = (city, contract_type) =>
  pool.query(
    `SELECT
       j.*,
       u.name                          AS company_name,
       u.email                         AS company_email,
       COUNT(a.id)                     AS total_applications,
       COUNT(CASE WHEN a.status = 'inviata' THEN 1 END) AS pending_applications
     FROM job_listings j
     JOIN users u ON u.id = j.company_id
     LEFT JOIN applications a ON a.job_id = j.id
     WHERE j.city = $1 AND j.contract_type = $2
     GROUP BY j.id, u.name, u.email
     ORDER BY j.created_at DESC`,
    [city, contract_type],
  );

// INICIO EXTRA
// Ricerca per parola chiave nel titolo ·
const findByKeyword = (keyword) =>
  pool.query(
    `SELECT
       j.*,
       u.name                          AS company_name,
       u.email                         AS company_email,
       COUNT(a.id)                     AS total_applications,
       COUNT(CASE WHEN a.status = 'inviata' THEN 1 END) AS pending_applications
     FROM job_listings j
     JOIN users u ON u.id = j.company_id
     LEFT JOIN applications a ON a.job_id = j.id
     WHERE j.title ILIKE $1
     GROUP BY j.id, u.name, u.email
     ORDER BY j.created_at DESC`,
    [`%${keyword}%`],
  );

//Salva offerta nei preferiti · ----------------------------------
//const saveToFavorites = (user_id, job_id) =>
//  pool.query(
//    `INSERT INTO favorites (candidate_id, job_id)    VALUES ($1, $2) RETURNING *`,
//    [user_id, job_id],
//  );
// FINAL EXTRA

// Profilo azienda con tutte le offerte attive
const findCompanyProfile = (company_id) =>
  pool.query(
    `SELECT 
       j.*,
       u.name AS company_name,
       u.email AS company_email,
       COUNT(a.id) AS total_applications,
       COUNT(CASE WHEN a.status = 'inviata' THEN 1 END) AS pending_applications,
       COUNT(CASE WHEN a.status = 'accettata' THEN 1 END) AS accepted_applications,
       COUNT(CASE WHEN a.status = 'rifiutata' THEN 1 END) AS rejected_applications
     FROM job_listings j
     JOIN users u ON u.id = j.company_id
     LEFT JOIN applications a ON a.job_id = j.id
     WHERE j.company_id = $1
     GROUP BY j.id, u.name, u.email
     ORDER BY j.created_at DESC`,
    [company_id],
  );

// Inserisce un nuovo job listing
const create = ({
  company_id,
  title,
  description,
  contract_type,
  city,
  salary,
}) =>
  pool.query(
    `INSERT INTO job_listings (company_id, title, description, contract_type, city, salary)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [company_id, title, description, contract_type, city, salary],
  );

// UPDATE job listing
const update = (id, { title, description, contract_type, city, salary }) =>
  pool.query(
    `UPDATE job_listings
     SET title = $2,
         description = $3,
         contract_type = $4,
         city = $5,
         salary = $6
     WHERE id = $1
     RETURNING *`,
    [id, title, description, contract_type, city, salary],
  );

// Elimina un job listing per id
const remove = (id) =>
  pool.query("DELETE FROM job_listings WHERE id = $1 RETURNING id", [id]);

module.exports = {
  init,
  findById,
  findAll,
  findByFilters,
  findByKeyword,
  //saveToFavorites,
  findCompanyProfile,
  update,
  create,
  remove,
};
