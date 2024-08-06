document.addEventListener("DOMContentLoaded", function () {
  // Pengaturan untuk repository d3ak
  const baseApiUrld3ak = "https://repoulbi-be.ulbi.ac.id/repoulbi/contents";
  const repositoryd3ak = "d3ak";
  const foldersToHided3ak = [
    ".vscode",
    "assets",
    "vendors",
    "css",
    "js",
    "metis-assets",
    "src",
  ];
  const maxFileSizeMBd3ak = 5;
  window.directoryStackd3ak = [""];
  function getAuthToken() {
    const token =
      localStorage.getItem("login") ||
      (document.cookie.match(/(^|;)\s*login\s*=\s*([^;]+)/) || [])[2];
    return token ? decodeURIComponent(token) : null;
  }
  // Pengaturan untuk repository buktiajar-d3ak
  clearDailyActivities();
  const baseApiUrlBap = "https://repoulbi-be.ulbi.ac.id/repoulbi/contents";
  const repositoryBap = "buktiajar-d3ak";
  const foldersToHideBap = [
    ".vscode",
    "assets",
    "vendors",
    "css",
    "js",
    "metis-assets",
    "src",
  ];
  const maxFileSizeMBBap = 5;
  window.directoryStackBap = [""];

  window.fetchDatad3ak = function (path = "") {
    const url = buildApiUrl(baseApiUrld3ak, repositoryd3ak, path);
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
                item.type === "dir" && !foldersToHided3ak.includes(item.name)
            )
          : data.filter((item) => item.name !== "README.md");

        if (!window.directoryStackd3ak.includes(path)) {
          window.directoryStackd3ak.push(path);
        }

        const folderCount = itemsToShow.filter(
          (item) => item.type === "dir"
        ).length;
        const fileCount = itemsToShow.filter(
          (item) => item.type === "file"
        ).length;

        document.getElementById("totalFolderCount").textContent = folderCount;
        document.getElementById("totalFileCount").textContent = fileCount;

        displayDirectoryContentsd3ak(itemsToShow, !isBaseFetch);
      })
      .catch((error) => {
        console.error("Error fetching data: ", error);
        alert(
          "Failed to load data. Please check the console for more details."
        );
      });
  };

  window.fetchDataBap = function (path = "") {
    const url = buildApiUrl(baseApiUrlBap, repositoryBap, path);
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
                item.type === "dir" && !foldersToHideBap.includes(item.name)
            )
          : data.filter((item) => item.name !== "README.md");

        if (!window.directoryStackBap.includes(path)) {
          window.directoryStackBap.push(path);
        }

        const folderCount = itemsToShow.filter(
          (item) => item.type === "dir"
        ).length;
        const fileCount = itemsToShow.filter(
          (item) => item.type === "file"
        ).length;

        document.getElementById("totalFolderCount-bap").textContent =
          folderCount;
        document.getElementById("totalFileCount-bap").textContent = fileCount;

        displayDirectoryContentsBap(itemsToShow, !isBaseFetch);
      })
      .catch((error) => {
        console.error("Error fetching data: ", error);
        alert(
          "Failed to load data. Please check the console for more details."
        );
      });
  };

  function buildApiUrl(baseApiUrl, repository, path = "") {
    return `${baseApiUrl}?repository=${repository}${path ? "&path=" + encodeURIComponent(path) : ""}`;
  }

  function displayDirectoryContentsd3ak(data, showBackButton) {
    const listContainer = document.getElementById("directory-list-d3ak");
    listContainer.innerHTML = "";

    if (showBackButton) {
      const backButton = document.createElement("li");
      backButton.innerHTML = `
          <div class="d-flex align-self-center iq-email-sender-info">
            <a href="javascript:void(0);" onclick="window.handleBackActiond3ak()" class="btn btn-primary back-button">
              <i class="ri-arrow-left-line"></i> Back
            </a>
            <div class="upload-container">
              <input type="file" id="uploadFileInputd3ak" class="upload-input" />
              <button class="btn btn-secondary create-folder-btn" onclick="window.handleCreateFolderClickd3ak()">Create Folder</button>
              <button class="btn btn-success upload-btn" onclick="document.getElementById('uploadFileInputd3ak').click();">Choose File</button>
              <span id="fileNamed3ak" class="file-name">No file chosen</span>
              <button class="btn btn-info upload-file-btn" onclick="window.handleUploadClickd3ak()">Upload File</button>
            </div>
          </div>`;
      listContainer.appendChild(backButton);
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
            <a href="javascript:void(0);" class="iq-email-title" onclick="window.handleItemClickd3ak('${
              item.path
            }', '${item.type}')">${item.name}</a>
          </div>
          ${
            item.type === "file"
              ? `
          <div class="file-actions">
            <button class="btn btn-primary download-link" onclick="downloadFiled3ak('${item.download_url}', '${item.filename}')">Download</button>
            <button class="btn btn-success copy-url-link" onclick="viewFiled3ak('${item.download_url}')">View</button>
            <button class="btn btn-danger delete-link" onclick="deleteFiled3ak('${item.path}')">Delete</button>
          </div>`
              : ""
          }`;
      listContainer.appendChild(itemElement);
    });
  }

  function displayDirectoryContentsBap(data, showBackButton) {
    const listContainer = document.getElementById("directory-list-bap");
    listContainer.innerHTML = "";

    if (showBackButton) {
      const backButton = document.createElement("li");
      backButton.innerHTML = `
          <div class="d-flex align-self-center iq-email-sender-info">
            <a href="javascript:void(0);" onclick="window.handleBackActionBap()" class="btn btn-primary back-button">
              <i class="ri-arrow-left-line"></i> Back
            </a>
            <div class="upload-container">
              <input type="file" id="uploadFileInputBap" class="upload-input" />
              <button class="btn btn-secondary create-folder-btn" onclick="window.handleCreateFolderClickBap()">Create Folder</button>
              <button class="btn btn-success upload-btn" onclick="document.getElementById('uploadFileInputBap').click();">Choose File</button>
              <span id="fileNameBap" class="file-name">No file chosen</span>
              <button class="btn btn-info upload-file-btn" onclick="window.handleUploadClickBap()">Upload File</button>
            </div>
          </div>`;
      listContainer.appendChild(backButton);
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
            <a href="javascript:void(0);" class="iq-email-title" onclick="window.handleItemClickBap('${
              item.path
            }', '${item.type}')">${item.name}</a>
          </div>
          ${
            item.type === "file"
              ? `
          <div class="file-actions">
            <button class="btn btn-primary download-link" onclick="downloadFileBap('${item.download_url}', '${item.filename}')">Download</button>
            <button class="btn btn-success copy-url-link" onclick="viewFileBap('${item.download_url}')">View</button>
            <button class="btn btn-danger delete-link" onclick="deleteFileBap('${item.path}')">Delete</button>
          </div>`
              : ""
          }`;
      listContainer.appendChild(itemElement);
    });
  }

  function displayStoredActivities() {
    const activitiesd3ak =
      JSON.parse(localStorage.getItem("activitiesd3ak")) || [];
    const activitiesBap =
      JSON.parse(localStorage.getItem("activitiesBap")) || [];

    const combinedActivities = [...activitiesd3ak, ...activitiesBap].sort(
      (a, b) => new Date(b.currentDateTime) - new Date(a.currentDateTime)
    );

    const timelineContainer = document.querySelector(".iq-timeline");
    timelineContainer.innerHTML = "";

    combinedActivities.forEach((activity) => {
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

  window.handleBackActiond3ak = function () {
    if (window.directoryStackd3ak.length > 1) {
      window.directoryStackd3ak.pop();
      const previousPath =
        window.directoryStackd3ak[window.directoryStackd3ak.length - 1];
      window.fetchDatad3ak(previousPath);
    }
  };

  window.handleBackActionBap = function () {
    if (window.directoryStackBap.length > 1) {
      window.directoryStackBap.pop();
      const previousPath =
        window.directoryStackBap[window.directoryStackBap.length - 1];
      window.fetchDataBap(previousPath);
    }
  };

  window.handleItemClickd3ak = function (path, type) {
    if (type === "dir") {
      window.fetchDatad3ak(path);
    }
  };

  window.handleItemClickBap = function (path, type) {
    if (type === "dir") {
      window.fetchDataBap(path);
    }
  };

  window.handleUploadClickd3ak = function () {
    const uploadFileInput = document.getElementById("uploadFileInputd3ak");
    const file = uploadFileInput.files[0];
    if (file) {
      const fileSizeMB = file.size / (1024 * 1024);
      if (fileSizeMB > maxFileSizeMBd3ak) {
        Swal.fire({
          title: "File Terlalu Besar",
          text: `Ukuran File "${file.name}" Mencapai Jumlah Maksimum Size ${maxFileSizeMBd3ak} MB.`,
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
          window.uploadFiled3ak(file);
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

  window.handleUploadClickBap = function () {
    const uploadFileInput = document.getElementById("uploadFileInputBap");
    const file = uploadFileInput.files[0];
    if (file) {
      const fileSizeMB = file.size / (1024 * 1024);
      if (fileSizeMB > maxFileSizeMBBap) {
        Swal.fire({
          title: "File Terlalu Besar",
          text: `Ukuran File "${file.name}" Mencapai Jumlah Maksimum Size ${maxFileSizeMBBap} MB.`,
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
          window.uploadFileBap(file);
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

  window.handleCreateFolderClickd3ak = function () {
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

        const currentPath =
          window.directoryStackd3ak[window.directoryStackd3ak.length - 1];
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
        formData.append("repository", repositoryd3ak);
        formData.append("folder", fullPath);

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
                window.fetchDatad3ak(currentPath); // Refresh the current directory
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

  window.handleCreateFolderClickBap = function () {
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

        const currentPath =
          window.directoryStackBap[window.directoryStackBap.length - 1];
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
        formData.append("repository", repositoryBap);
        formData.append("folder", fullPath);

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
                window.fetchDataBap(currentPath); // Refresh the current directory
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

  window.uploadFiled3ak = function (file) {
    const currentPath =
      window.directoryStackd3ak[window.directoryStackd3ak.length - 1];
    const apiUrl = `https://repoulbi-be.ulbi.ac.id/repoulbi/uploadfile/${encodeURIComponent(
      currentPath
    )}`;
    const token = getAuthToken();
    const formData = new FormData();
    formData.append("file", file);
    formData.append("repository", repositoryd3ak);

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
            window.fetchDatad3ak(currentPath); // Refresh the current directory
            updateTimeline("upload", file.name, currentPath);
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

  window.uploadFileBap = function (file) {
    const currentPath =
      window.directoryStackBap[window.directoryStackBap.length - 1];
    const apiUrl = `https://repoulbi-be.ulbi.ac.id/repoulbi/uploadfile/${encodeURIComponent(
      currentPath
    )}`;
    const token = getAuthToken();
    const formData = new FormData();
    formData.append("file", file);
    formData.append("repository", repositoryBap);

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
            window.fetchDataBap(currentPath); // Refresh the current directory
            updateTimeline("upload", file.name, currentPath);
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

  window.downloadFiled3ak = function (download_url, fileName) {
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

  window.downloadFileBap = function (download_url, fileName) {
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

  window.viewFiled3ak = function (url) {
    if (!url) {
      console.error("No URL provided.");
      alert("View URL not available for this item.");
      return;
    }

    const pdfUrl = encodeURIComponent(url);
    window.open(`view.html?pdfUrl=${pdfUrl}`, "_blank");
  };

  window.viewFileBap = function (url) {
    if (!url) {
      console.error("No URL provided.");
      alert("View URL not available for this item.");
      return;
    }

    const pdfUrl = encodeURIComponent(url);
    window.open(`view.html?pdfUrl=${pdfUrl}`, "_blank");
  };

  window.deleteFiled3ak = function (path) {
    const apiUrl = `https://repoulbi-be.ulbi.ac.id/repoulbi/deletefile?repository=${repositoryd3ak}&path=${encodeURIComponent(
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
                  window.directoryStackd3ak[
                    window.directoryStackd3ak.length - 1
                  ];
                window.fetchDatad3ak(currentPath); // Refresh the current directory
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
    if (activities.length > 5) {
      activities.shift();
    }
    localStorage.setItem("activities", JSON.stringify(activities));
  }

  function displayStoredActivities() {
    const activities = JSON.parse(localStorage.getItem("activities")) || [];
    const timelineContainer = document.querySelector(".iq-timeline");
    timelineContainer.innerHTML = "";

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

  window.deleteFileBap = function (path) {
    const apiUrl = `https://repoulbi-be.ulbi.ac.id/repoulbi/deletefile?repository=${repositoryBap}&path=${encodeURIComponent(
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
                  window.directoryStackBap[window.directoryStackBap.length - 1];
                window.fetchDataBap(currentPath); // Refresh the current directory
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

  // Initial fetch for both repositories
  window.fetchDatad3ak("");
  window.fetchDataBap("");
});
