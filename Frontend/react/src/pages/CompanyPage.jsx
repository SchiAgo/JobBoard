import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Hero from "../components/Hero";
import JobCard from "../components/JobCard";
import DettaglioCandidato from "../components/DettaglioCandidato";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Table,
  Badge,
  Modal,
  Spinner,
  Alert,
  Pagination,
} from "react-bootstrap";

const CompanyPage = () => {
  const navigate = useNavigate();

  // Estados
  const [jobs, setJobs] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [error, setError] = useState("");

  // Estados para paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [jobsPerPage] = useState(3); // 3 cards por página

  const [showModal, setShowModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showForm, setShowForm] = useState(true);

  const [filters, setFilters] = useState({
    search: "",
    status: "",
    role: "",
  });

  const [newJob, setNewJob] = useState({
    title: "",
    description: "",
    city: "",
    contract_type: "",
    salary: "",
  });

  // ========== LOGICA DI PAGINAZIONE ==========
  // Calcola gli indici dei lavori per la pagina corrente
  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = jobs.slice(indexOfFirstJob, indexOfLastJob);
  const totalPages = Math.ceil(jobs.length / jobsPerPage);

  // Mudar de página
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Criar array de números de páginas
  const getPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // Mostra todas as páginas
      for (let i = 1; i <= totalPages; i++) {
        items.push(i);
      }
    } else {
      // Mostra páginas com elipse
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) items.push(i);
        items.push("...");
        items.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        items.push(1);
        items.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) items.push(i);
      } else {
        items.push(1);
        items.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) items.push(i);
        items.push("...");
        items.push(totalPages);
      }
    }
    return items;
  };

  //Reimposta la pagina quando cambiano i lavori.
  useEffect(() => {
    setCurrentPage(1);
  }, [jobs.length]);

  // ========== CERCA LAVORI NEL DATABASE ==========
  const fetchJobsFromBackend = async () => {
    setLoadingJobs(true);
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      //Buscando jobs do backend...
      const response = await fetch(
        "http://localhost:3000/api/jobs/company-jobs",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const data = await response.json();
      //Dados recebidos em data);

      let jobsList = [];

      if (data.successo && Array.isArray(data.dati)) {
        jobsList = data.dati; // ✅ Seu formato real
      } else if (Array.isArray(data)) {
        jobsList = data;
      } else {
        jobsList = [];
        console.warn("Formato inesperado:", data);
      }

      //Jobs carregados - jobsList.length
      setJobs(jobsList);
    } catch (err) {
      setError("Errore nel caricamento degli annunci");
    } finally {
      setLoadingJobs(false);
      setLoading(false);
    }
  };

  // ========== BUSCAR CANDIDATOS DAS VAGAS DA EMPRESA ==========
  const fetchCandidatesFromBackend = async () => {
    setLoadingCandidates(true);
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      console.log("📢 Buscando candidatos...");

      const response = await fetch(
        "http://localhost:3000/api/applications/company-applications",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const data = await response.json();

      let applicationsList = [];

      // Adaptando para o formato da sua API
      if (data.successo && Array.isArray(data.dati)) {
        applicationsList = data.dati;
      } else if (Array.isArray(data)) {
        applicationsList = data;
      } else {
        applicationsList = [];
        console.warn("Formato inesperado:", data);
      }

      // Transformar os dados para o formato que a tabela espera
      const formattedCandidates = applicationsList.map((app) => ({
        id: app.application_id,
        name: app.candidate_name,
        email: app.candidate_email,
        role: app.job_title,
        date: new Date(app.application_date).toLocaleDateString("it-IT"),
        status: app.status,
        cover_letter: app.cover_letter,
        job_title: app.job_title,
        job_id: app.job_id,
        salary: app.salary,
        city: app.job_city,
        application_date: app.application_date,
      }));

      console.log("📋 Candidatos formatados:", formattedCandidates);
      setCandidates(formattedCandidates);
    } catch (err) {
      setError("Errore nel caricamento dei candidati");
    } finally {
      setLoadingCandidates(false);
    }
  };

  // ========== CREA UN NUOVO ANNUNCIO SULLA BANCA ==========
  const handleCreateJob = async () => {
    if (
      !newJob.title.trim() ||
      !newJob.description.trim() ||
      !newJob.city.trim() ||
      !newJob.contract_type.trim() ||
      !newJob.salary.trim()
    ) {
      setError("Tutti i campi sono obbligatori");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const jobToCreate = {
        title: newJob.title.trim(),
        description: newJob.description.trim(),
        city: newJob.city.trim(),
        contract_type: newJob.contract_type.trim(),
        salary: parseFloat(newJob.salary),
      };

      //Creando nuovo annuncio no backend...
      const response = await fetch("http://localhost:3000/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(jobToCreate),
      });

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Errore nella creazione");
      }

      const data = await response.json();
      // console.log("Annuncio creato:", data);

      await fetchJobsFromBackend();

      setNewJob({
        title: "",
        description: "",
        city: "",
        contract_type: "",
        salary: "",
      });

      setShowSuccessModal(true);
      setTimeout(() => setShowSuccessModal(false), 3000);
    } catch (err) {
      console.error("❌ Errore:", err);
      setError(err.message || "Errore durante la creazione");
    } finally {
      setLoading(false);
    }
  };

  // ========== HANDLERS ==========
  const handleChange = (e) => {
    setNewJob({ ...newJob, [e.target.name]: e.target.value });
  };

  const handleShow = (candidate) => {
    setSelectedCandidate(candidate);
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
  };

  const resetFilters = () => {
    setFilters({
      search: "",
      status: "",
      role: "",
    });
  };

  // ========== FILTROS ==========
  const filteredCandidates = candidates.filter((c) => {
    const matchName = c.name
      ?.toLowerCase()
      .includes(filters.search.toLowerCase());
    const matchStatus = !filters.status || c.status === filters.status;
    const matchRole =
      !filters.role || c.role?.toLowerCase() === filters.role.toLowerCase();
    return matchName && matchStatus && matchRole;
  });

  // ========== VERIFICA AUTENTICAZIONE E CARICA DATI ==========
  useEffect(() => {
    const checkAuthAndLoad = async () => {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const token = localStorage.getItem("token");

      if (!token || user.role !== "azienda") {
        navigate("/login");
        return;
      }

      await fetchJobsFromBackend(); // Carrega os jobs
      await fetchCandidatesFromBackend(); // Carrega os candidatos
    };

    checkAuthAndLoad();
  }, []);

  if (loadingJobs && jobs.length === 0) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Caricamento annunci...</p>
      </Container>
    );
  }

  return (
    <>
      <Hero
        title="Scopri i migliori talenti!"
        subtitle="Pubblica offerte e seleziona i candidati ideali per la tua azienda."
      />

      <Container fluid className="py-4 bg-light">
        <h2 className="mb-4">Dashboard Azienda</h2>

        {error && (
          <Alert variant="danger" onClose={() => setError("")} dismissible>
            {error}
          </Alert>
        )}

        {/* SEZIONE ANNUNCI PUBBLICATI - CARDS COM PAGINAÇÃO */}
        <div className="mb-5">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="fw-bold text-primary">I tuoi annunci pubblicati</h4>
            <span className="badge bg-primary fs-6">{jobs.length} annunci</span>
          </div>
          {jobs.length === 0 ? (
            <Card className="border-0 shadow-sm p-4 text-center">
              <p className="text-muted mb-0">
                Non hai ancora pubblicato annunci. Crea il tuo primo annuncio
                qui sotto!
              </p>
            </Card>
          ) : (
            <>
              {/* CARDS */}
              <div className="row g-4">
                {currentJobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>

              {/* PAGINAÇÃO BOOTSTRAP */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-center mt-4">
                  <Pagination>
                    {/* Botão Primeira */}
                    <Pagination.First
                      onClick={() => paginate(1)}
                      disabled={currentPage === 1}
                    />

                    {/* Botão Anterior */}
                    <Pagination.Prev
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                    />

                    {/* Números das páginas */}
                    {getPaginationItems().map((item, index) => {
                      if (item === "...") {
                        return (
                          <Pagination.Ellipsis key={`ellipsis-${index}`} />
                        );
                      }
                      return (
                        <Pagination.Item
                          key={item}
                          active={item === currentPage}
                          onClick={() => paginate(item)}
                        >
                          {item}
                        </Pagination.Item>
                      );
                    })}

                    {/* Botão Próximo */}
                    <Pagination.Next
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    />

                    {/* Botão Última */}
                    <Pagination.Last
                      onClick={() => paginate(totalPages)}
                      disabled={currentPage === totalPages}
                    />
                  </Pagination>
                </div>
              )}

              {/* Informação de paginação */}
              <div className="text-center mt-3 text-muted small">
                Mostrando {indexOfFirstJob + 1} -{" "}
                {Math.min(indexOfLastJob, jobs.length)} di {jobs.length} annunci
              </div>
            </>
          )}
        </div>

        {/* FORM CREAZIONE ANNUNCIO */}
        {showForm && (
          <Card className="border-0 shadow-sm mx-auto mb-4 w-50">
            <Card.Body>
              <h5 className="fw-bold mb-3">Crea nuovo annuncio</h5>

              <Row className="g-3">
                <Col md={6}>
                  <Form.Control
                    name="title"
                    placeholder="Titolo"
                    value={newJob.title}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </Col>

                <Col md={6}>
                  <Form.Control
                    name="city"
                    placeholder="Città"
                    value={newJob.city}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </Col>
              </Row>

              <Row className="g-3 mt-1">
                <Col md={6}>
                  <Form.Control
                    name="salary"
                    type="number"
                    placeholder="Stipendio (€)"
                    value={newJob.salary}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </Col>

                <Col md={6}>
                  <Form.Select
                    name="contract_type"
                    value={newJob.contract_type}
                    onChange={handleChange}
                    disabled={loading}
                  >
                    <option value="">Seleziona tipo contratto</option>
                    <option value="Tempo indeterminato">
                      Tempo indeterminato
                    </option>
                    <option value="Tempo determinato">Tempo determinato</option>
                    <option value="Partita IVA">Partita IVA</option>
                    <option value="Freelance">Freelance</option>
                    <option value="Stage">Stage</option>
                  </Form.Select>
                </Col>
              </Row>

              <Row className="mt-3">
                <Col md={12}>
                  <Form.Control
                    as="textarea"
                    rows={5}
                    name="description"
                    placeholder="Descrizione del lavoro..."
                    value={newJob.description}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </Col>
              </Row>

              <div className="mt-3 text-end">
                <Button
                  variant="success"
                  onClick={handleCreateJob}
                  disabled={loading}
                >
                  {loading ? "Pubblicazione..." : "Pubblica annuncio"}
                </Button>
              </div>
            </Card.Body>
          </Card>
        )}

        {/* FILTRI */}
        <Card className="border-0 shadow-sm mb-4">
          <Card.Body>
            <Form>
              <Row className="align-items-end">
                <Col md={4}>
                  <Form.Group>
                    <Form.Label className="small fw-bold">
                      Cerca nome candidato
                    </Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Filtra per nome..."
                      value={filters.search}
                      onChange={(e) =>
                        setFilters({ ...filters, search: e.target.value })
                      }
                    />
                  </Form.Group>
                </Col>

                <Col md={3}>
                  <Form.Group>
                    <Form.Label className="small fw-bold">Stato</Form.Label>
                    <Form.Select
                      value={filters.status}
                      onChange={(e) =>
                        setFilters({ ...filters, status: e.target.value })
                      }
                    >
                      <option value="">Tutti gli stati</option>
                      <option>Accettata</option>
                      <option>Rifiutata</option>
                      <option>In Revisione</option>
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={3}>
                  <Form.Group>
                    <Form.Label className="small fw-bold">Posizione</Form.Label>
                    <Form.Select
                      value={filters.role}
                      onChange={(e) =>
                        setFilters({ ...filters, role: e.target.value })
                      }
                    >
                      <option value="">Tutte le posizioni</option>
                      <option>Frontend Dev</option>
                      <option>Backend Dev</option>
                      <option>UX Designer</option>
                      <option>Full Stack</option>
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={2} className="d-flex flex-column justify-content-end">
                  <Button
                    variant="primary"
                    className="w-100"
                    onClick={resetFilters}
                  >
                    Reset
                  </Button>
                </Col>
              </Row>
            </Form>
          </Card.Body>
        </Card>

        {/* TABELLA CANDIDATI */}
        <Card className="border-0 shadow-sm">
          <Table hover responsive className="mb-0">
            <thead className="bg-light">
              <tr>
                <th>Candidato</th>
                <th>Posizione</th>
                <th>Data</th>
                <th>Stato</th>
                <th className="text-end">Azioni</th>
              </tr>
            </thead>
            <tbody>
              {loadingCandidates ? (
                <tr>
                  <td colSpan="5" className="text-center py-4">
                    <Spinner animation="border" size="sm" variant="primary" />
                    <p className="mt-2 text-muted">Caricamento candidati...</p>
                  </td>
                </tr>
              ) : filteredCandidates.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-4">
                    <p className="text-muted mb-0">Nessun candidato trovato</p>
                  </td>
                </tr>
              ) : (
                filteredCandidates.map((c) => (
                  <tr key={c.id} className="align-middle">
                    <td className="fw-bold">{c.name}</td>
                    <td>{c.role}</td>
                    <td>{c.date}</td>
                    <td>
                      <Badge
                        bg={
                          c.status === "Rifiutata"
                            ? "danger"
                            : c.status === "Accettata"
                              ? "success"
                              : "warning"
                        }
                        className={
                          c.status === "In Revisione" ? "text-dark" : ""
                        }
                      >
                        {c.status}
                      </Badge>
                    </td>
                    <td className="text-end">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => handleShow(c)}
                      >
                        Profilo
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot className="table-light">
              <tr>
                <td colSpan="5" className="text-end fw-bold">
                  Totale candidati: {filteredCandidates.length}
                </td>
              </tr>
            </tfoot>
          </Table>
        </Card>

        {/* MODALE CANDIDATO */}
        <DettaglioCandidato
          show={showModal}
          handleClose={handleClose}
          candidate={selectedCandidate}
        />

        {/* MODALE SUCCESSO */}
        <Modal
          show={showSuccessModal}
          onHide={() => setShowSuccessModal(false)}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>✓ Operazione completata</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Il tuo annuncio è stato pubblicato correttamente.
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="success"
              onClick={() => setShowSuccessModal(false)}
            >
              Chiudi
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </>
  );
};

export default CompanyPage;
