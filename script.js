document.addEventListener("DOMContentLoaded", () => {
  const $ = (id) => document.getElementById(id);
  const screenIds = ["screen-system", "screen-invite", "screen-choices", "screen-confirmation"];

  const placesByType = {
    "Cinema": ["Cinema (escolher depois)"],
    "Viagem longa": ["Pedreira", "São Paulo (SP)", "Torre de Miroku"],
    "Hamburgueria": ["Brooks", "Lifebox", "Madero", "Empório de Comidas – Boliche Parque Dom Pedro"],
    "Japonês": ["Satoshi – Campinas", "My Sushi", "Sukiya"],
    "Viagem curta": ["Pico das Cabras – Campinas", "Parque do Taquaral", "Maeda – Itu"]
  };
  const mapQueries = {
    "Pedreira": "Pedreira SP", "São Paulo (SP)": "São Paulo SP", "Torre de Miroku": "Torre de Miroku",
    "Brooks": "Brooks hamburgueria", "Lifebox": "Lifebox hamburgueria", "Madero": "Madero restaurante",
    "Empório de Comidas – Boliche Parque Dom Pedro": "Empório de Comidas Boliche Parque Dom Pedro",
    "Satoshi – Campinas": "Satoshi restaurante japonês Campinas", "My Sushi": "My Sushi Campinas",
    "Sukiya": "Sukiya Campinas", "Pico das Cabras – Campinas": "Pico das Cabras Campinas",
    "Parque do Taquaral": "Parque Portugal Taquaral Campinas", "Maeda – Itu": "Parque Maeda Itu"
  };

  let selectedType = "";
  const placeSelect = $("place-select");
  const detailsPanel = $("details-panel");
  const movieField = $("movie-field");
  const movieName = $("movie-name");
  const placeLinks = $("place-links");
  const formError = $("form-error");
  const dateInput = $("date-choice");

  function showScreen(id) {
    screenIds.forEach((screenId) => $(screenId).classList.toggle("is-active", screenId === id));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  $("enter-button").addEventListener("click", () => showScreen("screen-invite"));
  $("yes-button").addEventListener("click", () => showScreen("screen-choices"));
  document.querySelectorAll("[data-go]").forEach((button) => {
    button.addEventListener("click", () => showScreen(button.dataset.go));
  });

  const noButton = $("no-button");
  noButton.addEventListener("pointerenter", () => {
    const x = Math.random() < .5 ? -1 : 1;
    noButton.style.transform = `translate(${x * (22 + Math.random() * 35)}px, ${-7 - Math.random() * 12}px)`;
  });
  noButton.addEventListener("pointerleave", () => { noButton.style.transform = ""; });
  noButton.addEventListener("click", (event) => {
    event.preventDefault();
    noButton.style.transform = `translate(${Math.random() < .5 ? -38 : 38}px, -12px)`;
  });

  function updatePlaceLinks() {
    placeLinks.replaceChildren();
    const selected = placeSelect.value;
    if (!selected || !mapQueries[selected]) return;
    const link = document.createElement("a");
    link.href = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(mapQueries[selected]);
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "Ver local no mapa ↗";
    placeLinks.appendChild(link);
  }
  function populatePlaces(type) {
    placeSelect.replaceChildren();
    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "Escolha uma opção";
    placeSelect.appendChild(placeholder);
    (placesByType[type] || []).forEach((place) => {
      const option = document.createElement("option");
      option.value = place;
      option.textContent = place;
      placeSelect.appendChild(option);
    });
    detailsPanel.hidden = false;
    movieField.hidden = type !== "Cinema";
    movieName.required = type === "Cinema";
    placeLinks.replaceChildren();
    updatePlaceLinks();
  }
  document.querySelectorAll(".choice").forEach((button) => {
    button.addEventListener("click", () => {
      selectedType = button.dataset.type;
      document.querySelectorAll(".choice").forEach((choice) => {
        choice.setAttribute("aria-pressed", String(choice === button));
      });
      populatePlaces(selectedType);
      formError.textContent = "";
    });
  });
  placeSelect.addEventListener("change", updatePlaceLinks);

  const today = new Date();
  dateInput.min = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  function formatDate(value) {
    if (!value) return "Não informada";
    const [year, month, day] = value.split("-");
    return `${day}/${month}/${year}`;
  }
  function addSummary(labelText, valueText) {
    const row = document.createElement("div");
    row.className = "summary-row";
    const label = document.createElement("span");
    label.textContent = labelText;
    const value = document.createElement("strong");
    value.textContent = valueText || "Não informado";
    row.append(label, value);
    $("summary").appendChild(row);
  }

  $("confirm-button").addEventListener("click", () => {
    formError.textContent = "";
    if (!selectedType) { formError.textContent = "Escolha primeiro o tipo de encontro."; return; }
    if (!placeSelect.value) { formError.textContent = "Escolha um local ou uma opção."; placeSelect.focus(); return; }
    if (selectedType === "Cinema" && !movieName.value.trim()) {
      formError.textContent = "Escreva o nome do filme que gostaria de assistir.";
      movieName.focus(); return;
    }
    if (!dateInput.value) { formError.textContent = "Escolha a data do encontro."; dateInput.focus(); return; }
    if (dateInput.value < dateInput.min) { formError.textContent = "Escolha uma data de hoje em diante."; dateInput.focus(); return; }

    const place = selectedType === "Cinema" ? `${placeSelect.value} — Filme: ${movieName.value.trim()}` : placeSelect.value;
    const note = $("note").value.trim();
    $("summary").replaceChildren();
    addSummary("Programa", selectedType);
    addSummary("Local / filme", place);
    addSummary("Data", formatDate(dateInput.value));
    if (note) addSummary("Recadinho", note);

    $("mail-type").value = selectedType;
    $("mail-place").value = place;
    $("mail-date").value = formatDate(dateInput.value);
    $("mail-note").value = note || "Nenhuma mensagem.";
    showScreen("screen-confirmation");

    const mailForm = $("mail-form");
    const status = $("email-status");
    if (mailForm.action.includes("wendel.emanuel@gmail.com")) {
      status.textContent = "O encontro foi confirmado! Para receber os detalhes por e-mail, configure seu endereço no index.html.";
      return;
    }
    status.textContent = "Solicitação de envio iniciada. Na primeira utilização, o FormSubmit pode pedir a confirmação do endereço de e-mail.";
    mailForm.submit();
  });

  $("restart-button").addEventListener("click", () => {
    selectedType = "";
    $("mail-form").reset();
    $("note").value = "";
    dateInput.value = "";
    movieName.value = "";
    placeSelect.selectedIndex = 0;
    detailsPanel.hidden = true;
    movieField.hidden = true;
    formError.textContent = "";
    placeLinks.replaceChildren();
    document.querySelectorAll(".choice").forEach((choice) => choice.setAttribute("aria-pressed", "false"));
    showScreen("screen-system");
  });
});
