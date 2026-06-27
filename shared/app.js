/* =========================================================
   Shared UnicAthlete prototype helpers
   ========================================================= */

function openBackendNote(noteId) {
  if (typeof backendNotes === "undefined") return;

  const note = backendNotes[noteId];
  if (!note) return;

  const title = document.getElementById("backendModalTitle");
  const body = document.getElementById("backendModalBody");
  const modal = document.getElementById("backendNoteModal");

  if (!title || !body || !modal) return;

  title.textContent = note.title;
  body.textContent = note.body;
  modal.classList.add("visible");
}

function closeBackendNote(event) {
  const modal = document.getElementById("backendNoteModal");
  if (!modal) return;

  if (
    !event ||
    event.target === modal ||
    event.target.classList.contains("backend-modal-close")
  ) {
    modal.classList.remove("visible");
  }
}

document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    const modal = document.getElementById("backendNoteModal");
    if (modal) modal.classList.remove("visible");
  }
});
