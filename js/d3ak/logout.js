document.getElementById("logout-button").addEventListener("click", function () {
  localStorage.removeItem("authToken");
  window.location.href = "https://repo.ulbi.ac.id/";
});
