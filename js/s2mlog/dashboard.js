document.addEventListener("DOMContentLoaded", function () {
  const baseApiUrl = "https://repoulbi-be.ulbi.ac.id/repoulbi/contents";
  const repository = "d4if";
  const foldersToHide = [
    ".vscode",
    "assets",
    "vendors",
    "css",
    "js",
    "metis-assets",
    "src",
  ];

  // Build API URL by appending the repository and path
  function buildApiUrl(path = "") {
    return `${baseApiUrl}?repository=${repository}${path ? "&path=" + encodeURIComponent(path) : ""}`;
  }

  // Get the authentication token from local storage or cookies
  window.getAuthToken = function () {
    const token =
      localStorage.getItem("login") ||
      (document.cookie.match(/(^|;)\s*login\s*=\s*([^;]+)/) || [])[2];
    return token ? decodeURIComponent(token) : null;
  };

  // Initialize the directory stack with the base API URL
  window.directoryStack = [""];

  // Fetch data from the server
  window.fetchData = function (path = "") {
    const url = buildApiUrl(path);
    const token = getAuthToken();
    fetch(url, {
      headers: { LOGIN: token, "Content-Type": "application/json" },
    })
      .then((response) => response.json())
      .then((response) => {
        if (response.status_code !== 200) {
          throw new Error("Failed to fetch data: " + response.message);
        }
        const data = response.data;
        const isBaseFetch = path === "";
        const itemsToShow = isBaseFetch
          ? data.filter(
              (item) =>
                item.type === "dir" && !foldersToHide.includes(item.name)
            )
          : data;
        displayDirectoryContents(itemsToShow, !isBaseFetch);
        if (!isBaseFetch && !window.directoryStack.includes(path)) {
          window.directoryStack.push(path); // Push the current path to the stack
        }
      })
      .catch((error) => {
        console.error("Error fetching data: ", error);
        alert(
          "Failed to load data. Please check the console for more details."
        );
      });
  };

  // Display the contents of a directory
  function displayDirectoryContents(data, showBackButton) {
    const listContainer = document.getElementById("directory-list");
    if (!listContainer) {
      console.error("Element #directory-list not found.");
      return;
    }
    listContainer.innerHTML = ""; // Clear previous entries

    if (showBackButton) {
      const backButton = document.createElement("li");
      backButton.innerHTML = `
              <div class="d-flex align-self-center iq-email-sender-info">
                  <a href="javascript:void(0);" onclick="window.handleBackAction()" class="btn btn-primary back-button">
                      <i class="ri-arrow-left-line"></i> Back
                  </a>
                  <div class="upload-container">
                      <input type="file" id="uploadFileInput" class="upload-input" />
                      <button class="btn btn-success upload-btn" onclick="document.getElementById('uploadFileInput').click();">Choose File</button>
                      <span id="fileName" class="file-name">No file chosen</span>
                      <button class="btn btn-info upload-file-btn" onclick="window.handleUploadClick()">Upload File</button>
                  </div>
              </div>`;
      listContainer.appendChild(backButton);

      // Add event listener for file input
      const uploadFileInput = document.getElementById("uploadFileInput");
      uploadFileInput.addEventListener("change", function (event) {
        const file = event.target.files[0];
        document.getElementById("fileName").textContent = file
          ? file.name
          : "No file chosen";
      });
    }

    data.forEach((item) => {
      const itemElement = document.createElement("li");
      itemElement.className =
        "d-flex justify-content-between align-items-center";
      itemElement.innerHTML = `
              <div class="iq-email-sender-info">
                  <div class="iq-checkbox-mail">
                      <i class="${
                        item.type === "dir"
                          ? "mdi mdi-folder"
                          : "mdi mdi-file-document-outline"
                      }"></i>
                  </div>
                  <a href="javascript:void(0);" onclick="window.handleItemClick('${
                    item.path
                  }', '${item.type}')" class="iq-email-title">${item.name}</a>
              </div>`;
      listContainer.appendChild(itemElement);
    });
  }

  // Handle back navigation
  window.handleBackAction = function () {
    if (window.directoryStack.length > 1) {
      window.directoryStack.pop();
      const previousPath =
        window.directoryStack[window.directoryStack.length - 1];
      window.fetchData(previousPath);
    } else {
      window.fetchData(); // Fetch from base if stack is empty
    }
  };

  // Handle item clicks for navigation or download
  window.handleItemClick = function (path, type) {
    if (type === "dir") {
      window.fetchData(path);
    } else {
      // Uncomment the line below if you need the download functionality
      // const downloadUrl = `https://repoulbi-be.ulbi.ac.id/repoulbi/download?repository=${repository}&path=${encodeURIComponent(path)}`;
      // window.downloadFile(downloadUrl, path.split("/").pop());
    }
  };

  // Handle file downloads
  window.downloadFile = function (downloadUrl, fileName) {
    if (!downloadUrl || !fileName) {
      console.error("No download URL or file name provided.");
      alert("Download URL or file name not available for this item.");
      return;
    }

    const imageExtensions = ["png", "jpg", "jpeg", "gif", "bmp", "svg"];
    const fileExtension = fileName.split(".").pop().toLowerCase();

    if (imageExtensions.includes(fileExtension)) {
      // Redirect to the fetched URL for image files
      window.open(downloadUrl, "_blank");
    } else {
      // Create a temporary link element and trigger the download for other file types
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Handle file uploads
  window.handleUploadClick = function () {
    const fileInput = document.getElementById("uploadFileInput");
    const file = fileInput.files[0];
    if (!file) {
      alert("Please select a file to upload.");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);

    const currentPath =
      window.directoryStack.length > 0
        ? window.directoryStack[window.directoryStack.length - 1]
        : "";
    const uploadUrl = `https://repoulbi-be.ulbi.ac.id/repoulbi/uploadfile?repository=${repository}&path=${encodeURIComponent(
      currentPath
    )}`;

    fetch(uploadUrl, {
      method: "POST",
      headers: { LOGIN: getAuthToken() },
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.status_code === 200) {
          alert("File uploaded successfully.");
          window.fetchData(currentPath); // Refresh the current directory
        } else {
          alert("Failed to upload file: " + data.message);
        }
      })
      .catch((error) => {
        console.error("Error uploading file:", error);
        alert("Error uploading file. Please try again.");
      })
      .finally(() => {
        // Clear the file input after upload attempt
        document.getElementById("uploadFileInput").value = "";
        document.getElementById("fileName").textContent = "No file chosen";
      });
  };

  window.fetchData(); // Initial fetch
});
