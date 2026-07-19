// Mi Pensum — lógica de la app
// Guarda el progreso en localStorage para que persista entre visitas
// en el mismo navegador/dispositivo.

const STORAGE_KEY = "pensum_lit_castellana_v1";
const STORAGE_KEY_ELECTIVAS = "pensum_lit_castellana_electivas_v1";

function cargarSet(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch (e) {
    return new Set();
  }
}

function guardarSet(key, set) {
  try {
    localStorage.setItem(key, JSON.stringify(Array.from(set)));
  } catch (e) {
    // Si localStorage no está disponible (por ejemplo, en una vista previa
    // sandboxed), la app sigue funcionando durante la sesión, solo no persiste.
  }
}

let completados = cargarSet(STORAGE_KEY);
let electivasMarcadas = cargarSet(STORAGE_KEY_ELECTIVAS);

const semestersContainer = document.getElementById("semestersContainer");
const progressFill = document.getElementById("progressFill");
const progressPercent = document.getElementById("progressPercent");
const progressCredits = document.getElementById("progressCredits");
const electivesList = document.getElementById("electivesList");
const electivesToggle = document.getElementById("electivesToggle");
const electivesSub = document.getElementById("electivesSub");
const resetBtn = document.getElementById("resetBtn");

function renderSemestres() {
  semestersContainer.innerHTML = "";
  PENSUM.semestres.forEach((sem) => {
    const card = document.createElement("section");
    card.className = "semester-card";

    const head = document.createElement("div");
    head.className = "semester-head";
    head.innerHTML = `<h2>Semestre ${sem.numero}</h2><span class="credits-badge">${sem.creditos} créditos</span>`;
    card.appendChild(head);

    const pillsWrap = document.createElement("div");
    pillsWrap.className = "pills";

    sem.cursos.forEach((curso) => {
      const btn = document.createElement("button");
      btn.className = "pill" + (completados.has(curso.codigo) ? " done" : "");
      btn.type = "button";
      btn.textContent = curso.nombre;
      btn.setAttribute("aria-pressed", completados.has(curso.codigo));
      btn.addEventListener("click", () => {
        if (completados.has(curso.codigo)) {
          completados.delete(curso.codigo);
        } else {
          completados.add(curso.codigo);
        }
        guardarSet(STORAGE_KEY, completados);
        btn.classList.toggle("done");
        btn.setAttribute("aria-pressed", completados.has(curso.codigo));
        actualizarProgreso();
      });
      pillsWrap.appendChild(btn);
    });

    card.appendChild(pillsWrap);
    semestersContainer.appendChild(card);
  });
}

function renderElectivas() {
  electivesList.innerHTML = "";
  PENSUM.electivas.forEach((curso) => {
    const btn = document.createElement("button");
    btn.className = "pill" + (electivasMarcadas.has(curso.codigo) ? " done" : "");
    btn.type = "button";
    btn.textContent = curso.nombre;
    btn.setAttribute("aria-pressed", electivasMarcadas.has(curso.codigo));
    btn.addEventListener("click", () => {
      if (electivasMarcadas.has(curso.codigo)) {
        electivasMarcadas.delete(curso.codigo);
      } else {
        electivasMarcadas.add(curso.codigo);
      }
      guardarSet(STORAGE_KEY_ELECTIVAS, electivasMarcadas);
      btn.classList.toggle("done");
      btn.setAttribute("aria-pressed", electivasMarcadas.has(curso.codigo));
      actualizarSubElectivas();
    });
    electivesList.appendChild(btn);
  });
  actualizarSubElectivas();
}

function actualizarSubElectivas() {
  electivesSub.textContent = `${electivasMarcadas.size}/${PENSUM.electivas.length} marcadas ${electivesList.hidden ? "▾" : "▴"}`;
}

function actualizarProgreso() {
  let creditosHechos = 0;
  PENSUM.semestres.forEach((sem) => {
    sem.cursos.forEach((curso) => {
      if (completados.has(curso.codigo)) creditosHechos += curso.creditos;
    });
  });
  const pct = Math.round((creditosHechos / PENSUM.totalCreditos) * 100);
  progressFill.style.width = pct + "%";
  progressPercent.textContent = pct + "%";
  progressCredits.textContent = `${creditosHechos} / ${PENSUM.totalCreditos} créditos`;
}

electivesToggle.addEventListener("click", () => {
  electivesList.hidden = !electivesList.hidden;
  actualizarSubElectivas();
});

resetBtn.addEventListener("click", () => {
  const ok = confirm("¿Seguro que quieres reiniciar todo tu progreso? Esta acción no se puede deshacer.");
  if (!ok) return;
  completados = new Set();
  electivasMarcadas = new Set();
  guardarSet(STORAGE_KEY, completados);
  guardarSet(STORAGE_KEY_ELECTIVAS, electivasMarcadas);
  renderSemestres();
  renderElectivas();
  actualizarProgreso();
});

renderSemestres();
renderElectivas();
actualizarProgreso();
