document.addEventListener("DOMContentLoaded", function () {
  const baseApiUrl = "https://api.github.com/repos/repoulbi/d4if/contents/";
  const foldersToHide = [
    ".vscode",
    "assets",
    "vendors",
    "css",
    "js",
    "metis-assets",
    "src",
  ];
  window.directoryStack = [baseApiUrl]; // Starting with the base directory
  window.getToken = function () {
    const cookieMatch = document.cookie.match(new RegExp("(^| )login=([^;]+)"));
    return cookieMatch ? cookieMatch[2] : null;
  };
  window.fetchData = function (url, searchParams = {}) {
    // Construct the full URL with search parameters if any
    const apiUrl = new URL(url);
    Object.keys(searchParams).forEach((key) =>
      apiUrl.searchParams.append(key, searchParams[key])
    );

    // Fetching the token from storage or cookie
    const token = window.getToken();

    fetch(apiUrl, {
      headers: {
        Accept: "application/json",
        LOGIN: token, // Add token to the request headers
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            "Network response was not ok: " + response.statusText
          );
        }
        return response.json();
      })
      .then((json) => {
        if (json.status_code !== 200) {
          throw new Error("Failed to fetch: " + json.message);
        }
        const data = json.data;

        if (!Array.isArray(data)) {
          throw new TypeError("Expected an array of data");
        }

        // Determine if we are at the base level or navigating deeper
        const isBaseFetch =
          url === baseApiUrl && Object.keys(searchParams).length === 0;

        // If at the base, show only directories, otherwise show all items
        const itemsToShow = isBaseFetch
          ? data.filter(
              (item) =>
                item.type === "dir" && !foldersToHide.includes(item.name)
            )
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

    // Optionally add a back button and upload button
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
              <button class="btn btn-info upload-file-btn" onclick="window.handleUploadClick('${baseApiUrl}')">Upload File</button>
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

    // Append each directory or file to the list
    data.forEach((item) => {
      const itemElement = document.createElement("li");
      itemElement.className =
        "d-flex justify-content-between align-items-center";
      itemElement.innerHTML = `
          <div class="iq-email-sender-info">
            <div class="iq-checkbox-mail">
              <i class="mdi ${
                item.type === "dir" ? "mdi-folder" : "mdi-file-document-outline"
              }"></i>
            </div>
            <a href="javascript:void(0);" class="iq-email-title" onclick="window.handleItemClick('${
              item.url
            }', '${item.type}')">${item.name}</a>
          </div>
          <div class="file-actions">
            ${
              item.type === "file" && item.download_url
                ? `<button class="btn btn-secondary download-btn" data-url="${item.download_url}" data-name="${item.name}">Download</button>`
                : ""
            }
            <button class="btn btn-danger delete-btn" data-path="${
              item.path
            }">Delete</button>
          </div>`;
      listContainer.appendChild(itemElement);
    });

    // Add event listeners for download and delete buttons
    document.querySelectorAll(".download-btn").forEach((button) => {
      button.addEventListener("click", function () {
        const downloadUrl = this.getAttribute("data-url");
        const fileName = this.getAttribute("data-name");
        window.downloadFile(downloadUrl, fileName);
      });
    });

    document.querySelectorAll(".delete-btn").forEach((button) => {
      button.addEventListener("click", function () {
        const filePath = this.getAttribute("data-path");
        window.deleteFile(filePath);
      });
    });
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

window.getToken = function () {
  const tokenFromLocalStorage = localStorage.getItem("login");
  if (tokenFromLocalStorage) {
    return tokenFromLocalStorage;
  }

  const cookieMatch = document.cookie.match(new RegExp("(^| )login=([^;]+)"));
  if (cookieMatch) {
    return cookieMatch[2];
  }

  return null;
};

window.handleUploadClick = function (baseApiUrl) {
  const uploadFileInput = document.getElementById("uploadFileInput");
  const file = uploadFileInput.files[0];
  if (file) {
    Swal.fire({
      title: "Are you sure?",
      text: `You are about to upload the file "${file.name}"`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, upload it!",
      cancelButtonText: "No, cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        window.uploadFile(file, baseApiUrl);
      }
    });
  } else {
    Swal.fire({
      title: "No file selected",
      text: "Please choose a file to upload.",
      icon: "error",
    });
  }
};

window.uploadFile = function (file, baseApiUrl) {
  const currentPath = window.directoryStack[window.directoryStack.length - 1]
    .replace(baseApiUrl, "")
    .split("?")[0];
  const repository = "d4if"; // Adjust this if needed
  const apiUrl = `https://repoulbi-be.ulbi.ac.id/repoulbi/uploadfile/${currentPath}`;
  const token = window.getToken();
  const formData = new FormData();
  formData.append("file", file);
  formData.append("repository", repository);

  fetch(apiUrl, {
    method: "POST",
    headers: {
      accept: "application/json",
      LOGIN: ` ${token}`,
    },
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      if (
        data.message === "File uploaded successfully" &&
        data.status_code === 200
      ) {
        Swal.fire({
          title: "Success!",
          text: "File uploaded successfully",
          icon: "success",
        }).then(() => {
          location.reload(); // Hard refresh
        });
      } else {
        Swal.fire({
          title: "Error!",
          text: "File upload failed: " + data.message,
          icon: "error",
        });
      }
    })
    .catch((error) => {
      console.error("Error uploading file:", error);
      Swal.fire({
        title: "Error!",
        text: "File upload failed. Please try again.",
        icon: "error",
      });
    });
};

window.deleteFile = function (path) {
  alert("Delete functionality not implemented.");
};
