document.addEventListener("DOMContentLoaded", function () {
  const baseApiUrl = "https://repoulbi-be.ulbi.ac.id/repoulbi/contents";
  const repository = "d4lb";
  const foldersToHide = [
    ".vscode",
    "assets",
    "vendors",
    "css",
    "js",
    "metis-assets",
    "src",
  ];
  window.directoryStack = [""]; // Starting with the base directory

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

        if (!window.directoryStack.includes(path)) {
          window.directoryStack.push(path); // Add current path to the stack
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

  function buildApiUrl(path = "") {
    return `${baseApiUrl}?repository=${repository}${path ? "&path=" + encodeURIComponent(path) : ""}`;
  }

  function getAuthToken() {
    const token =
      localStorage.getItem("login") ||
      (document.cookie.match(/(^|;)\s*login\s*=\s*([^;]+)/) || [])[2];
    return token ? decodeURIComponent(token) : null;
  }

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
            item.path
          }', '${item.type}')">${item.name}</a>
        </div>
        ${
          item.type === "file"
            ? `<div class="file-actions">
              <button class="btn btn-primary download-link" onclick="downloadFile('${item.download_url}', '${item.filename}')">Download</button>
              <button class="btn btn-success copy-url-link" onclick="viewFile('${item.download_url}')">View</button>
              <button class="btn btn-danger delete-link" onclick="deleteFile('${item.path}')">Delete</button>
            </div>`
            : ""
        }`;
      listContainer.appendChild(itemElement);
    });
  }

  window.handleBackAction = function () {
    if (window.directoryStack.length > 1) {
      window.directoryStack.pop(); // Remove current directory
      const previousPath =
        window.directoryStack[window.directoryStack.length - 1];
      window.fetchData(previousPath); // Fetch previous directory
    }
  };

  window.handleItemClick = function (path, type) {
    if (type === "dir") {
      window.fetchData(path); // Fetch the directory contents
    }
  };

  window.handleUploadClick = function () {
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
          window.uploadFile(file);
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

  window.uploadFile = function (file) {
    const currentPath = window.directoryStack[window.directoryStack.length - 1]
      .replace(baseApiUrl, "")
      .split("?")[0];
    const apiUrl = `https://repoulbi-be.ulbi.ac.id/repoulbi/uploadfile/${encodeURIComponent(
      currentPath
    )}`;
    const token = getAuthToken();
    const formData = new FormData();
    formData.append("file", file);
    formData.append("repository", repository);

    fetch(apiUrl, {
      method: "POST",
      headers: {
        accept: "application/json",
        LOGIN: token,
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
            window.fetchData(currentPath); // Refresh the current directory
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

  window.downloadFile = function (download_url, fileName) {
    if (!download_url) {
      console.error("No download URL provided.");
      alert("Download URL not available for this item.");
      return;
    }

    const decodedUrl = decodeURIComponent(download_url);
    const decodedFileName = decodeURIComponent(fileName);

    const link = document.createElement("a");
    link.href = decodedUrl;
    link.download = decodedFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  window.copyUrlToClipboard = function (url) {
    if (!url) {
      console.error("No URL provided.");
      alert("URL not available for this item.");
      return;
    }

    const currentUrl = `${
      window.location.origin
    }/view.html?pdfUrl=${encodeURIComponent(url)}`;

    navigator.clipboard.writeText(currentUrl).then(
      function () {
        Swal.fire({
          title: "URL Copied!",
          text: "URL has been copied to clipboard.",
          icon: "success",
          confirmButtonText: "OK",
        });
      },
      function (err) {
        console.error("Error copying URL: ", err);
        Swal.fire({
          title: "Error!",
          text: "Failed to copy URL. Please try again.",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    );
  };

  window.deleteFile = function (path) {
    const apiUrl = `https://repoulbi-be.ulbi.ac.id/repoulbi/deletefile/${encodeURIComponent(
      path
    )}`;
    const token = getAuthToken();

    Swal.fire({
      title: "Are you sure?",
      text: `You are about to delete the file "${path}"`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(apiUrl, {
          method: "DELETE",
          headers: {
            accept: "application/json",
            LOGIN: token,
          },
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.status_code === 200) {
              Swal.fire({
                title: "Deleted!",
                text: "File has been deleted.",
                icon: "success",
              }).then(() => {
                const currentPath =
                  window.directoryStack[window.directoryStack.length - 1];
                window.fetchData(currentPath); // Refresh the current directory
              });
            } else {
              Swal.fire({
                title: "Error!",
                text: "File deletion failed: " + data.message,
                icon: "error",
              });
            }
          })
          .catch((error) => {
            console.error("Error deleting file:", error);
            Swal.fire({
              title: "Error!",
              text: "File deletion failed. Please try again.",
              icon: "error",
            });
          });
      }
    });
  };

  window.viewFile = function (url) {
    if (!url) {
      console.error("No URL provided.");
      alert("View URL not available for this item.");
      return;
    }

    const pdfUrl = encodeURIComponent(url);
    window.open(`view.html?pdfUrl=${pdfUrl}`, "_blank");
  };

  window.fetchData(""); // Initial fetch
});
