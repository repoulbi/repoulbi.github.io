document.addEventListener("DOMContentLoaded", function () {
  const baseApiUrl = "https://repoulbi-be.ulbi.ac.id/repoulbi/contents";
  const repository = "general";
  const foldersToHide = [
    ".vscode",
    "assets",
    "vendors",
    "css",
    "js",
    "metis-assets",
    "src",
  ];
  let permissions = false;
  const maxFileSizeMB = 5; // Maximum file size in MB
  window.directoryStack = [""]; // Starting with the base directory

  // Check and clear activities daily
  clearDailyActivities();

  window.fetchPermissionData = function () {
    const url = "https://repoulbi-be.ulbi.ac.id/repoulbi/permissions";
    const token = getAuthToken();
    fetch(url, {
      headers: { LOGIN: token, "Content-Type": "application/json" },
    })
        .then((response) => response.json())
        .then((response) => {
          if (response.status_code !== 200) {
            throw new Error("Failed to fetch data: " + response.message);
          }
          permissions = response.data.decisions;
        })
  };

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

          window.fetchPermissionData();
          const data = response.data;
          const isBaseFetch = path === "";
          const itemsToShow = isBaseFetch
              ? data.filter(
                  (item) =>
                      item.type === "dir" &&
                      !foldersToHide.includes(item.name) &&
                      item.name !== "README.md"
              )
              : data.filter((item) => item.name !== "README.md");

          if (!window.directoryStack.includes(path)) {
            window.directoryStack.push(path); // Add current path to the stack
          }

          // Count folders and files
          const folderCount = itemsToShow.filter(
              (item) => item.type === "dir"
          ).length;
          const fileCount = itemsToShow.filter(
              (item) => item.type === "file"
          ).length;

          // Update the HTML content with the counts
          document.getElementById("totalFolderCount").textContent = folderCount;
          document.getElementById("totalFileCount").textContent = fileCount;

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

    window.fetchPermissionData();

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
            <button class="btn btn-secondary create-folder-btn" onclick="window.handleCreateFolderClick()"${permissions === true ? "" : "hidden"}>Create Folder</button>

            <button class="btn btn-success upload-btn" onclick="window.uploadFile();"${permissions === true ? "" : "hidden"}>Upload File</button>
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
            <i class="mdi ${
          item.type === "dir" ? "mdi-folder" : "mdi-file-document-outline"
      }"></i>
          </div>
          <a href="javascript:void(0);" class="iq-email-title" onclick="window.handleItemClick('${
          item.path
      }', '${item.type}')">${item.name}</a>
        </div>
        ${
          item.type === "file" && permissions === true

              ? `<div class="file-actions">
              <button class="btn btn-primary download-link" onclick="downloadFile('${item.download_url}', '${item.filename}')">Download</button>
              <button class="btn btn-success copy-url-link" onclick="viewFile('${item.download_url}')">View</button>
              <button class="btn btn-danger delete-link" onclick="deleteFile('${item.path}')">Delete</button>
            </div>`
              : item.type === "file" && permissions === false
              ? `<div class="file-actions">
              <button class="btn btn-primary download-link" onclick="downloadFile('${item.download_url}', '${item.filename}')">Download</button>
              <button class="btn btn-success copy-url-link" onclick="viewFile('${item.download_url}')">View</button>
            </div>`
              : ""
      }`;
      listContainer.appendChild(itemElement);
    });

    // Display stored activities on initial load
    displayStoredActivities();
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
      // Check file size
      const fileSizeMB = file.size / (1024 * 1024);
      if (fileSizeMB > maxFileSizeMB) {
        Swal.fire({
          title: "File Terlalu Besar",
          text: `Ukuran File "${file.name}"Mencapai Jumlah Maksimum Size ${maxFileSizeMB} MB.`,
          icon: "error",
        });
        return;
      }

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

  window.handleCreateFolderClick = function () {
    Swal.fire({
      title: "Create New Folder",
      input: "text",
      inputPlaceholder: "Enter folder name",
      showCancelButton: true,
      confirmButtonText: "Create",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        const folderName = result.value.trim();
        if (!folderName) {
          Swal.fire({
            title: "Error!",
            text: "Folder name cannot be empty.",
            icon: "error",
          });
          return;
        }

        const currentPath = window.directoryStack[
        window.directoryStack.length - 1
            ]
            .replace(baseApiUrl, "")
            .split("?")[0];

        // Tentukan path folder baru
        const fullPath = currentPath
            ? `${currentPath}/${folderName}`
            : folderName;

        const apiUrl = `https://repoulbi-be.ulbi.ac.id/repoulbi/uploadfile/${encodeURIComponent(
            fullPath
        )}`;
        const token = getAuthToken();

        const formData = new FormData();
        const readmeFile = new File(["# " + folderName], "README.md", {
          type: "text/markdown",
        });
        formData.append("file", readmeFile);
        formData.append("repository", repository);
        formData.append("folder", fullPath); // Kirim path lengkap

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
              if (data.status_code === 200) {
                Swal.fire({
                  title: "Success!",
                  text: "Folder created successfully",
                  icon: "success",
                }).then(() => {
                  window.fetchData(currentPath); // Refresh the current directory
                  updateTimeline("createFolder", folderName, currentPath);
                });
              } else {
                Swal.fire({
                  title: "Error!",
                  text: "Failed to create folder: " + data.message,
                  icon: "error",
                });
              }
            })
            .catch((error) => {
              console.error("Error creating folder:", error);
              Swal.fire({
                title: "Error!",
                text: "Failed to create folder. Please try again.",
                icon: "error",
              });
            });
      }
    });
  };


  window.uploadFile = function () {
    const currentPath = window.directoryStack[window.directoryStack.length - 1]
      .replace(baseApiUrl, "")
      .split("?")[0];
    const apiUrl = `https://repoulbi-be.ulbi.ac.id/repoulbi/uploadfile/${encodeURIComponent(currentPath)}`;
    const token = getAuthToken();
  
    Swal.fire({
      title: 'Upload PDF File',
      html: `
        <div style="text-align: left; width: 100%; padding: 0 10px;">
          <div style="margin-bottom: 15px;">
            <label for="tanggal" style="display: block; font-weight: bold; margin-bottom: 5px;">Tanggal Penetapan SK</label>
            <input type="date" id="tanggal" class="swal2-input" style="width: 100%; margin: 0;">
          </div>
          <div>
            <label for="pdfFile" style="display: block; font-weight: bold; margin-bottom: 5px;">Pilih File PDF</label>
            <input type="file" id="pdfFile" accept="application/pdf" class="swal2-file" style="width: 100%;">
          </div>
        </div>
      `,
      customClass: {
        popup: 'swal2-no-center' // optional, in case you want to define custom class
      },
      showCancelButton: true,
      confirmButtonText: 'Submit',
      cancelButtonText: 'Cancel',
      focusConfirm: false,
      preConfirm: () => {
        const tanggal = document.getElementById('tanggal').value;
        const file = document.getElementById('pdfFile').files[0];
  
        if (!tanggal) {
          Swal.showValidationMessage('Tanggal tidak boleh kosong');
          return false;
        }
  
        if (!file || file.type !== 'application/pdf') {
          Swal.showValidationMessage('Harap unggah file PDF yang valid');
          return false;
        }
  
        return { tanggal, file };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const { tanggal, file } = result.value;
        const formData = new FormData();
        formData.append("file", file);
        formData.append("tanggal", tanggal); // contoh field
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
            if (data.message === "File uploaded successfully" && data.status_code === 200) {
              Swal.fire({
                title: "Success!",
                text: "File uploaded successfully",
                icon: "success",
              }).then(() => {
                window.fetchData(currentPath); // Refresh
                updateTimeline("upload", file.name, currentPath);
              });
            } else {
              Swal.fire({
                title: "Error!",
                text: "File upload failed: " + data.status,
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
      }
    });
  };
  

  // window.uploadFile = function (file) {
  //   const currentPath = window.directoryStack[window.directoryStack.length - 1]
  //       .replace(baseApiUrl, "")
  //       .split("?")[0];
  //   const apiUrl = `https://repoulbi-be.ulbi.ac.id/repoulbi/uploadfile/${encodeURIComponent(
  //       currentPath
  //   )}`;
  //   const token = getAuthToken();
  //   const formData = new FormData();
  //   formData.append("file", file);
  //   formData.append("repository", repository);

  //   fetch(apiUrl, {
  //     method: "POST",
  //     headers: {
  //       accept: "application/json",
  //       LOGIN: token,
  //     },
  //     body: formData,
  //   })
  //       .then((response) => response.json())
  //       .then((data) => {
  //         if (
  //             data.message === "File uploaded successfully" &&
  //             data.status_code === 200
  //         ) {
  //           Swal.fire({
  //             title: "Success!",
  //             text: "File uploaded successfully",
  //             icon: "success",
  //           }).then(() => {
  //             window.fetchData(currentPath); // Refresh the current directory
  //             updateTimeline("upload", file.name, currentPath);
  //           });
  //         } else {
  //           Swal.fire({
  //             title: "Error!",
  //             text: "File upload failed: " + data.message,
  //             icon: "error",
  //           });
  //         }
  //       })
  //       .catch((error) => {
  //         console.error("Error uploading file:", error);
  //         Swal.fire({
  //           title: "Error!",
  //           text: "File upload failed. Please try again.",
  //           icon: "error",
  //         });
  //       });
  // };

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
    const apiUrl = `https://repoulbi-be.ulbi.ac.id/repoulbi/deletefile?repository=${repository}&path=${encodeURIComponent(
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
                  updateTimeline("delete", path.split("/").pop(), currentPath);
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

  function updateTimeline(action, itemName, path) {
    const timelineContainer = document.querySelector(".iq-timeline");
    const currentDateTime = new Date().toLocaleString();

    let actionText = "";
    let borderColorClass = "";
    if (action === "upload") {
      actionText = `Uploaded file "${itemName}"`;
      borderColorClass = "border-success";
    } else if (action === "createFolder") {
      actionText = `Created folder "${itemName}"`;
      borderColorClass = "border-primary";
    } else if (action === "delete") {
      actionText = `Deleted file "${itemName}"`;
      borderColorClass = "border-danger";
    }

    const activity = {
      path,
      currentDateTime,
      actionText,
      borderColorClass,
    };

    saveActivityToLocalStorage(activity);

    displayStoredActivities();
  }

  function saveActivityToLocalStorage(activity) {
    const activities = JSON.parse(localStorage.getItem("activities")) || [];
    activities.push(activity);
    // Keep only the 5 most recent activities
    if (activities.length > 5) {
      activities.shift();
    }
    localStorage.setItem("activities", JSON.stringify(activities));
  }

  function displayStoredActivities() {
    const activities = JSON.parse(localStorage.getItem("activities")) || [];
    const timelineContainer = document.querySelector(".iq-timeline");
    timelineContainer.innerHTML = ""; // Clear the timeline

    // Reverse the activities to show the most recent first
    activities.reverse().forEach((activity) => {
      const newTimelineItem = `
        <li>
          <div class="timeline-dots ${activity.borderColorClass}"></div>
          <h6 class="float-left mb-1">${activity.path}</h6>
          <small class="float-right mt-1">${activity.currentDateTime}</small>
          <div class="d-inline-block w-100">
            <p>${activity.actionText}</p>
          </div>
        </li>
      `;
      timelineContainer.innerHTML += newTimelineItem;
    });
  }

  function clearDailyActivities() {
    const lastClearDate = localStorage.getItem("lastClearDate");
    const today = new Date().toLocaleDateString();

    if (lastClearDate !== today) {
      localStorage.removeItem("activities");
      localStorage.setItem("lastClearDate", today);
    }
  }
});
