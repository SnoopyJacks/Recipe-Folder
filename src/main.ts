// File: src/main.ts

type StatusKind = "info" | "success" | "danger";

type MealApi = {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
};

type SearchResponse = {
  meals: MealApi[] | null;
};

function getEl<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Missing element #${id}`);
  return el as T;
}

const searchForm = getEl<HTMLFormElement>("searchForm");
const searchInput = getEl<HTMLInputElement>("searchInput");
const statusEl = getEl<HTMLDivElement>("status");
const resultsGrid = getEl<HTMLDivElement>("resultsGrid");

function setStatus(message: string, kind: StatusKind): void {
  statusEl.classList.remove("d-none");
  statusEl.classList.remove("alert-secondary", "alert-success", "alert-danger");

  if (kind === "info") statusEl.classList.add("alert-secondary");
  if (kind === "success") statusEl.classList.add("alert-success");
  if (kind === "danger") statusEl.classList.add("alert-danger");

  statusEl.textContent = message;
}

function escapeHtml(input: string): string {
  const div = document.createElement("div");
  div.textContent = input;
  return div.innerHTML;
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  return (await res.json()) as T;
}

async function searchMealsByName(query: string): Promise<MealApi[]> {
  const base = "https://www.themealdb.com/api/json/v1/1";
  const url = `${base}/search.php?s=${encodeURIComponent(query)}`;
  const data = await fetchJson<SearchResponse>(url);
  return data.meals ?? [];
}

function clearResults(): void {
  resultsGrid.innerHTML = "";
}

function renderMeals(meals: MealApi[]): void {
  clearResults();

  const frag = document.createDocumentFragment();

  for (const meal of meals) {
    const col = document.createElement("div");
    col.className = "col-12 col-sm-6";

    col.innerHTML = `
      <button
        type="button"
        class="card recipe-card w-100 text-start"
        data-id="${escapeHtml(meal.idMeal)}"
      >
        <img
          class="card-img-top recipe-img"
          src="${escapeHtml(meal.strMealThumb)}"
          alt="${escapeHtml(meal.strMeal)}"
          loading="lazy"
        />
        <div class="card-body">
          <h2 class="h6 mb-1">
            ${escapeHtml(meal.strMeal)}
          </h2>
          <p class="text-muted small mb-0">
            Click for details (next step)
          </p>
        </div>
      </button>
    `;

    frag.appendChild(col);
  }

  resultsGrid.appendChild(frag);
}

async function handleSearchSubmit(e: SubmitEvent): Promise<void> {
  e.preventDefault();

  const query = searchInput.value.trim();

  if (!query) {
    setStatus("Type something like: chicken", "danger");
    clearResults();
    return;
  }

  setStatus(`Searching "${query}"…`, "info");

  try {
    const meals = await searchMealsByName(query);

    if (meals.length === 0) {
      setStatus("No results found.", "danger");
      clearResults();
      return;
    }

    renderMeals(meals);
    setStatus(`Found ${meals.length} meal(s). Click a card.`, "success");
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    setStatus(`Failed: ${msg}`, "danger");
    clearResults();
  }
}

/* ADDED: read data-id when a card is clicked */
function getMealIdFromClick(target: EventTarget | null): string | null {
  if (!(target instanceof HTMLElement)) return null;

  const card = target.closest<HTMLElement>(".recipe-card");
  if (!card) return null;

  return card.dataset.id ?? null;
}

/* ADDED: one click listener for all cards (event delegation) */
resultsGrid.addEventListener("click", (e) => {
  const mealId = getMealIdFromClick(e.target);

  if (!mealId) return;

  console.log("Clicked mealId:", mealId);
  setStatus(`Clicked mealId: ${mealId}`, "info");
});

searchForm.addEventListener("submit", (e) => {
  void handleSearchSubmit(e as SubmitEvent);
});

// Optional: starter search
searchInput.value = "chicken";
searchForm.requestSubmit();
