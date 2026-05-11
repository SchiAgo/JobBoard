
function Annuncio({
    titolo = "Frontend Developer",
    descrizione = "Stiamo cercando un Frontend Developer appassionato di React per unirsi al nostro team. Lavorerai su prodotti consumer ad alta scalabilità in un ambiente agile e collaborativo.",
    tipoContratto = "Tempo Indeterminato",
    citta = "Milano",
    stipendio = "35.000 – 50.000 €/anno",
    azienda = "Acme Srl",
    dataPublicazione = "Pubblicato oggi",
    onCandidati,
    onSalva,
}) {
    const [salvato, setSalvato] = useState(false);
    const colore = CONTRACT_COLORS[tipoContratto] ?? DEFAULT_COLOR;

    const handleSalva = () => {
        setSalvato((prev) => !prev);
        onSalva?.(!salvato);
    };

    return (
        <div className="annunci">
            <h2>{titolo}</h2>
            <p>{descrizione}</p>
            <p>Tipo Contratto: {tipoContratto}</p>
            <p>Città: {citta}</p>
            <p>Stipendio: {stipendio}</p>
            <p>Azienda: {azienda}</p>
            <p>{dataPublicazione}</p>
            <button onClick={onCandidati}>Candidati</button>
            <button onClick={handleSalva}>{salvato ? "Salvato" : "Salva"}</button>
        </div>
    );
}

export default Annuncio;