// Definisikan fungsi secara global
function fetchData(url, backUrl = null) {
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      displayDirectoryContents(data, url, backUrl);
    })
    .catch((error) => console.error("Error fetching data: ", error));
}

function displayDirectoryContents(data, currentUrl, backUrl) {
  const listContainer = document.getElementById("directory-list"); // Pastikan elemen ini ada
  listContainer.innerHTML = ""; // Bersihkan konten yang ada

  if (backUrl) {
    const backButton = document.createElement("li");
    backButton.innerHTML = `<div class="d-flex align-self-center">
                                   <div class="iq-email-sender-info">
                                       <a href="#" class="iq-email-title" onclick="fetchData('${backUrl}')">
                                           <i class="mdi mdi-arrow-left-bold"></i> Back
                                       </a>
                                   </div>
                                </div>`;
    listContainer.appendChild(backButton);
  }

  data.forEach((item) => {
    const itemElement = document.createElement("li");
    itemElement.className = "d-flex align-self-center";
    itemElement.innerHTML = `<div class="iq-email-sender-info">
                                    <div class="iq-checkbox-mail">
                                        <i class="mdi ${
                                          item.type === "dir"
                                            ? "mdi-folder"
                                            : "mdi-file-document-outline"
                                        }"></i>
                                    </div>
                                    <a href="javascript:void(0);" class="iq-email-title" onclick="fetchData('${
                                      item.url
                                    }', '${currentUrl}')">${item.name}</a>
                                 </div>
                                 <div class="iq-email-content">
                                     <span>Last Seen </span>
                                     <div class="iq-email-date">11:49 am</div>
                                 </div>`;

    listContainer.appendChild(itemElement);
  });
}
document.addEventListener("DOMContentLoaded", function () {
  const apiBaseURL = "https://api.github.com/repos/repoulbi/d4if/contents/";
  const listContainer = document.getElementById("directory-list");

  function fetchData(url, backUrl = null) {
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        displayDirectoryContents(data, url, backUrl);
      })
      .catch((error) => console.error("Error fetching data: ", error));
  }

  function displayDirectoryContents(data, currentUrl, backUrl) {
    listContainer.innerHTML = "";

    if (backUrl) {
      const backButton = document.createElement("li");
      backButton.innerHTML = `<div class="d-flex align-self-center">
                                       <div class="iq-email-sender-info">
                                           <a href="#" class="iq-email-title">
                                               <i class="mdi mdi-arrow-left-bold"></i> Back
                                           </a>
                                       </div>
                                    </div>`;
      backButton
        .querySelector("a")
        .addEventListener("click", () => fetchData(backUrl));
      listContainer.appendChild(backButton);
    }

    data.forEach((item) => {
      const itemElement = document.createElement("li");
      itemElement.className = "d-flex align-self-center";
      itemElement.innerHTML = `<div class="iq-email-sender-info">
                                        <div class="iq-checkbox-mail">
                                            <i class="mdi ${
                                              item.type === "dir"
                                                ? "mdi-folder"
                                                : "mdi-file-document-outline"
                                            }"></i>
                                        </div>
                                        <a href="javascript:void(0);" class="iq-email-title">${
                                          item.name
                                        }</a>
                                     </div>
                                     <div class="iq-email-content">
                                         <span>Last Seen </span>
                                         <div class="iq-email-date">11:49 am</div>
                                     </div>`;

      itemElement
        .querySelector("a")
        .addEventListener("click", () => fetchData(item.url, currentUrl));
      listContainer.appendChild(itemElement);
    });
  }

  fetchData(apiBaseURL);
});
