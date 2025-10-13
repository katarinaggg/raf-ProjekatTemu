// const proxy = "https://cors-anywhere.herokuapp.com/";

// dohvatanje departmana iz API-ja
// dodavanje opcija u dropdown meni
// provera za pretragu/klik na departman

// listener za ceo html dokument
// kada se ucita ceo mozemo da napunimo dropdown
document.addEventListener("DOMContentLoaded", () => {
  const departmentList = document.getElementById("departmentList");

  // parametri navbara
  const searchInput = document.getElementById("searchInput");
  const searchBtn = document.getElementById("searchBtn");
  const pageTitle = document.getElementById("pageTitle");

  fetch("https://collectionapi.metmuseum.org/public/collection/v1/departments")
    .then((response) => response.json())
    .then((data) => {
      data.departments.forEach((dep) => {
        const option = document.createElement("option");
        option.value = dep.departmentId;
        option.textContent = dep.displayName;

        departmentList.appendChild(option);
      });
    })
    .catch((error) => console.error("Greška pri učitavanju odeljenja:", error));

  // dodajemo listener na dropdown da bi mogla da se otvori nova stranica na klik
  departmentList.addEventListener("change", () => {
    const selectedDepartmentID = departmentList.value; // ID kliknutog
    if (selectedDepartmentID === "Departments") return;
    // otvori novu stranicu department.html
    window.location.href = `department.html?departmentId=${selectedDepartmentID}`;
  });

  // ako postoji pretraga treba da se otvori odgovarajuca stranica
  if (searchBtn && searchInput) {
    searchBtn.addEventListener("click", () => {
      const query = searchInput.value.trim();
      if (query) {
        window.location.href = `department.html?q=${query}`;
      }
    });

    searchInput.addEventListener("keypress", (event) => {
      if (event.key === "Enter") {
        event.preventDefault(); // sprečava reload strane
        const query = searchInput.value.trim();
        if (query) {
          window.location.href = `department.html?q=${query}`;
        }
      }
    });
  }

  const params = new URLSearchParams(window.location.search);
  const departmentId = params.get("departmentId");
  const searchQuery = params.get("q");

  //
  if (pageTitle) {
    if (departmentId) {
      pageTitle.textContent = "Department";
      loadDepartmentArtworks(departmentId);
    } else if (searchQuery) {
      pageTitle.textContent = `Search results for "${searchQuery}"`;
      loadSearchResults(searchQuery);
    }
  }
});

///////////////////////////////////////////////////////////////////////////////////

function renderPagination(
  paginationContainer,
  totalItems,
  itemsPerPage,
  currentPage,
  onPageChange
) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  paginationContainer.innerHTML = `
    <nav aria-label="Page navigation">
      <ul class="pagination justify-content-center"></ul>
    </nav>
  `;

  const paginationList = paginationContainer.querySelector(".pagination");

  const prevItem = document.createElement("li");
  prevItem.classList.add("page-item");
  if (currentPage === 1) prevItem.classList.add("disabled");
  prevItem.innerHTML = `
    <a class="page-link" href="#" aria-label="Previous">
      <span aria-hidden="true">&laquo;</span>
    </a>
  `;
  prevItem.addEventListener("click", (e) => {
    e.preventDefault();
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });
  paginationList.appendChild(prevItem);

  const maxVisible = 5;
  let start = Math.max(1, currentPage - 2);
  let end = Math.min(totalPages, start + maxVisible - 1);
  if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);

  for (let i = start; i <= end; i++) {
    const li = document.createElement("li");
    li.classList.add("page-item");
    if (i === currentPage) li.classList.add("active");
    li.innerHTML = `<a class="page-link" href="#">${i}</a>`;

    li.addEventListener("click", (e) => {
      e.preventDefault();
      onPageChange(i);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    paginationList.appendChild(li);
  }

  const nextItem = document.createElement("li");
  nextItem.classList.add("page-item");
  if (currentPage === totalPages) nextItem.classList.add("disabled");
  nextItem.innerHTML = `
    <a class="page-link" href="#" aria-label="Next">
      <span aria-hidden="true">&raquo;</span>
    </a>
  `;
  nextItem.addEventListener("click", (e) => {
    e.preventDefault();
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });
  paginationList.appendChild(nextItem);
}

////////////////////////////////////////////////////////////////////////////////

function loadDepartmentArtworks(departmentId) {
  const pageTitle = document.getElementById("pageTitle");
  const artworksContainer = document.getElementById("artworksContainer");
  const paginationContainer = document.getElementById("paginationContainer");

  fetch("https://collectionapi.metmuseum.org/public/collection/v1/departments")
    .then((response) => response.json())
    .then((data) => {
      const selectedDepartment = data.departments.find(
        (dep) => dep.departmentId == departmentId
      );
      pageTitle.textContent = selectedDepartment?.displayName || "Department";
      document.title = selectedDepartment?.displayName || "Department";

      return fetch(
        `https://collectionapi.metmuseum.org/public/collection/v1/objects?departmentIds=${departmentId}`
      );
    })
    .then((response) => response.json())
    .then((data) => {
      const objectIDs = data.objectIDs || [];
      const itemsPerPage = 10;
      let currentPage = 1;

      function renderPage(page) {
        artworksContainer.innerHTML = "";
        const start = (page - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const pageItems = objectIDs.slice(start, end);

        pageItems.forEach((objectId) => {
          fetch(
            `https://collectionapi.metmuseum.org/public/collection/v1/objects/${objectId}`
          )
            .then((res) => res.json())
            .then((artwork) => {
              const col = document.createElement("div");
              col.classList.add("col-md-3", "mb-4");
              col.innerHTML = `
                <div class="card h-100 shadow-sm">
                  <img src="${
                    artwork.primaryImageSmall || "images/placeholder.svg"
                  }" 
                       class="card-img-top" alt="${artwork.title}">
                  <div class="card-body">
                    <h5 class="card-title">${artwork.title}</h5>
                    <p class="card-text">${
                      artwork.artistDisplayName || "Unknown artist"
                    }</p>
                  </div>
                </div>`;
              col.addEventListener("click", () => {
                window.location.href = `artwork.html?objectId=${objectId}`;
              });
              artworksContainer.appendChild(col);
            });
        });

        renderPagination(
          paginationContainer,
          objectIDs.length,
          itemsPerPage,
          page,
          (newPage) => {
            currentPage = newPage;
            renderPage(currentPage);
          }
        );
      }

      renderPage(currentPage);
    })
    .catch((error) =>
      console.error("Greška pri učitavanju umetničkih dela:", error)
    );
}

////////////////////////////////////////////////////////////////////////////////

function loadSearchResults(query) {
  const pageTitle = document.getElementById("pageTitle");
  const artworksContainer = document.getElementById("artworksContainer");
  const paginationContainer = document.getElementById("paginationContainer");

  pageTitle.textContent = `Search results for "${query}"`;
  document.title = `Search: ${query}`;

  fetch(
    `https://collectionapi.metmuseum.org/public/collection/v1/search?q=${query}`
  )
    .then((response) => response.json())
    .then((data) => {
      const objectIDs = data.objectIDs || [];

      if (!objectIDs.length) {
        artworksContainer.innerHTML = `
        <div class="no-results text-center mt-5">
         <h4>No results found for "<em>${query}</em>".</h4>
         <p>Please try a different keyword.</p>
        </div>
        `;

        paginationContainer.innerHTML = "";
        return;
      }
      const itemsPerPage = 10;
      let currentPage = 1;

      function renderPage(page) {
        artworksContainer.innerHTML = "";
        const start = (page - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const pageItems = objectIDs.slice(start, end);

        if (pageItems.length === 0) {
          artworksContainer.innerHTML = `<p class="text-center">No results found for "${query}".</p>`;
          paginationContainer.innerHTML = "";
          return;
        }

        pageItems.forEach((objectId) => {
          fetch(
            `https://collectionapi.metmuseum.org/public/collection/v1/objects/${objectId}`
          )
            .then((res) => res.json())
            .then((artwork) => {
              const col = document.createElement("div");
              col.classList.add("col-md-3", "mb-4");
              col.innerHTML = `
                <div class="card h-100 shadow-sm">
                  <img src="${
                    artwork.primaryImageSmall || "images/placeholder.svg"
                  }" 
                       class="card-img-top" alt="${artwork.title}">
                  <div class="card-body">
                    <h5 class="card-title">${artwork.title}</h5>
                    <p class="card-text">${
                      artwork.artistDisplayName || "Unknown artist"
                    }</p>
                  </div>
                </div>`;
              col.addEventListener("click", () => {
                window.location.href = `artwork.html?objectId=${objectId}`;
              });
              artworksContainer.appendChild(col);
            });
        });

        renderPagination(
          paginationContainer,
          objectIDs.length,
          itemsPerPage,
          page,
          (newPage) => {
            currentPage = newPage;
            renderPage(currentPage);
          }
        );
      }

      renderPage(currentPage);
    })
    .catch((error) => console.error("Greška pri pretrazi:", error));
}
