function getTokenFromCookies() {
  let name = "login=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == " ") {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

// Function to delete a cookie
function deleteCookie(name) {
  document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/;";
}

// Function to clear localStorage and cookies, and then check for the token and redirect if not found
function clearAuthDataAndRedirect() {
  // Clear localStorage
  localStorage.removeItem("login");

  // Clear cookies
  deleteCookie("login");

  // Check if token still exists in localStorage or cookies
  let token = localStorage.getItem("login") || getTokenFromCookies();
  if (!token) {
    window.location.href = "https://repo.ulbi.ac.id";
  }
}

// Add event listener to the button
document.addEventListener("DOMContentLoaded", function () {
  document
    .getElementById("logoutButton")
    .addEventListener("click", function () {
      clearAuthDataAndRedirect();
    });
});
