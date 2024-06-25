document.addEventListener("DOMContentLoaded", function () {
  const baseApiUrl = "https://api.github.com/repos/repoulbi/d4if/contents/";
  window.directoryStack = [baseApiUrl]; // Starting with the base directory

  window.fetchData = function (url) {
    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            "Network response was not ok: " + response.statusText
          );
        }
        return response.json();
      })
      .then((data) => {
        if (!Array.isArray(data)) {
          throw new TypeError("Expected an array of data");
        }

        // Determine if we are at the base level or navigating deeper
        const isBaseFetch = url === baseApiUrl;

        // If at the base, show only directories, otherwise show all items
        const itemsToShow = isBaseFetch
          ? data.filter((item) => item.type === "dir")
          : data;

        if (!window.directoryStack.includes(url)) {
          window.directoryStack.push(url); // Add current URL to the stack
        }

        displayDirectoryContents(itemsToShow, !isBaseFetch); // Show back button if not at the base level
      })
      .catch((error) => {
        console.error("Error fetching data: ", error);
        alert(
          "Failed to load data. Please check the console for more details."
        );
      });
  };

  function displayDirectoryContents(data, showBackButton) {
    const listContainer = document.getElementById("directory-list");
    if (!listContainer) {
      console.error("Element #directory-list not found.");
      return;
    }

    listContainer.innerHTML = ""; // Clear previous entries

    // Optionally add a back button
    if (showBackButton) {
      const backButton = document.createElement("li");
      backButton.innerHTML = `
                <div class="d-flex align-self-center iq-email-sender-info">
                  <a href="javascript:void(0);" onclick="window.handleBackAction()" class="back-button">
                    <i class="ri-arrow-left-line"></i> Back
                  </a>
                </div>`;
      listContainer.appendChild(backButton);
    }

    // Append each directory or file to the list
    data.forEach((item) => {
      const itemElement = document.createElement("li");
      itemElement.className =
        "d-flex justify-content-between align-items-center";
      itemElement.innerHTML = `
                <div class="iq-email-sender-info">
                  <div class="iq-checkbox-mail">
                    <i class="mdi ${
                      item.type === "dir"
                        ? "mdi-folder"
                        : "mdi-file-document-outline"
                    }"></i>
                  </div>
                  <a href="javascript:void(0);" class="iq-email-title" onclick="window.handleItemClick('${
                    item.url
                  }', '${item.type}')">${item.name}</a>
                </div>
                <div class="file-actions">
                  ${
                    item.type === "file" && item.download_url
                      ? `<a class="link-secondary download-link" href="javascript:void(0);" data-url="${item.download_url}" onclick="window.downloadFile('${item.download_url}')">Download</a>`
                      : ""
                  }
                  <a href="javascript:void(0);" class="link-danger" onclick="window.deleteFile('${
                    item.path
                  }')">Delete</a>
                </div>`;
      listContainer.appendChild(itemElement);
    });

    // No need to add event listeners for download links as they are now directly bound by onclick
  }

  window.handleBackAction = function () {
    if (window.directoryStack.length > 1) {
      window.directoryStack.pop(); // Remove current directory
      const previousUrl =
        window.directoryStack[window.directoryStack.length - 1];
      window.fetchData(previousUrl); // Fetch previous directory
    }
  };

  window.handleItemClick = function (url, type) {
    if (type === "dir") {
      window.fetchData(url); // Fetch the directory contents
    }
  };

  // Fetch initial data from the base URL
  window.fetchData(baseApiUrl);
});

window.downloadFile = function (downloadUrl) {
  window.open(downloadUrl, "_blank");
};

window.deleteFile = function (path) {
  alert("Delete functionality not implemented."); // Placeholder for delete functionality
};
