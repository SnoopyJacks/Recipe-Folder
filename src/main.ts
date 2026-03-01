
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

function setStatus(message: string, kind: StatusKind): void {
  statusEl.classList.remove("d-none");
  statusEl.classList.remove("alert-secondary", "alert-success", "alert-danger");

  if (kind === "info") statusEl.classList.add("alert-secondary");
  if (kind === "success") statusEl.classList.add("alert-success");
  if (kind === "danger") statusEl.classList.add("alert-danger");

  statusEl.textContent = message;
}

function clearStatus(): void {
  statusEl.textContent = "";
  statusEl.classList.add("d-none");
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

async function handleSearchSubmit(e: SubmitEvent): Promise<void> {
  e.preventDefault();

  const query = searchInput.value.trim();

  if (!query) {
    setStatus("Type something like: chicken", "danger");
    return;
  }

  setStatus(`Searching "${query}"…`, "info");

  try {
    const meals = await searchMealsByName(query);

    console.clear();
    console.log("Query:", query);
    console.log("Meals count:", meals.length);
    console.log("Meals:", meals);

    if (meals.length === 0) {
      setStatus("No results found.", "danger");
      return;
    }

    setStatus(`Found ${meals.length} meal(s). Check console.`, "success");
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    setStatus(`Failed: ${msg}`, "danger");
  }
}

searchForm.addEventListener("submit", (e) => {
  void handleSearchSubmit(e as SubmitEvent);
});


searchInput.value = "chicken";
searchForm.requestSubmit();
