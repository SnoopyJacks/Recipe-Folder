type StatusKind = "info" | "success" | "danger";

function getEl<T extends HTML>(id: string): T {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Missing element #${id}`);
  return el as T;
}

const searchForm = getEl<HTMLFormElement>("searchForm");
const searchInput = getEl<HTMLInputElement>("searchInput");
const statusEl = getEl<HTMLDivElement>("status");

function setStatus(message: string, kind: StatusKind): void {
  statusEl.classList.remove("d-none");
  statusEl.classList.remove(
    "alert-secondary",
    "alert-success",
    "alert-danger"
  );

  if (kind === "info") statusEl.classList.add("alert-secondary");
  if (kind === "success") statusEl.classList.add("alert-success");
  if (kind === "danger") statusEl.classList.add("alert-danger");

  statusEl.textContent = message;
}

function clearStatus(): void {
  statusEl.textContent = "";
  statusEl.classList.add("d-none");
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve,ms));
}

async function handleSearchSubmit(e: SubmitEvent): Promise<void> {
  e.preventDefault();

  const query = searchInput.value.trim();

  if(!query) {
    setStatus("Type something");
    return;
  }

  setStatus(`Searching for "${query}".`, "success");

  await sleep(900);
  clearStatus();
}

searchForm.addEventListener("submit", (e) => {
  void handleSearchSubmit(e as SubmitEvent);
});
