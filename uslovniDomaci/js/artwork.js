document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const objectId = params.get("objectId");

  const container = document.getElementById("artworkDetails");

  if (!objectId) {
    container.innerHTML = `
      <p style="color: #3b2a1a; font-family: 'Poppins', sans-serif; text-align: center;">
        There is no information available about this artwork.
      </p>`;
    return;
  }

  fetch(
    `https://collectionapi.metmuseum.org/public/collection/v1/objects/${objectId}`
  )
    .then((response) => response.json())
    .then((artwork) => {
      document.title = artwork.title || "Artwork Details";

      container.innerHTML = `
        <div class="artwork-container">
            <div class="artwork-image">
                <img 
                src="${artwork.primaryImageSmall || "images/placeholder.svg"}" 
                alt="${artwork.title}">
            </div>
            <div class="artwork-info">
                <h3>${artwork.title || "Untitled"}</h3>
                <p><strong>Artist:</strong> ${
                  artwork.artistDisplayName || "Unknown"
                }</p>
                <p><strong>Year:</strong> ${artwork.objectDate || "N/A"}</p>
                <p><strong>Medium:</strong> ${artwork.medium || "N/A"}</p>
                <p><strong>Department:</strong> ${
                  artwork.department || "N/A"
                }</p>
                <p><strong>Culture:</strong> ${artwork.culture || "N/A"}</p>
                <p><strong>Dimensions:</strong> ${
                  artwork.dimensions || "N/A"
                }</p>
                ${
                  artwork.objectURL
                    ? `<a href="${artwork.objectURL}" target="_blank" class="btn btn-search">View on The Met Website</a>`
                    : ""
                }
            </div>
        </div>
    `;
    })
    .catch((error) => {
      console.error("Greška pri učitavanju detalja o delu:", error);
    });
});
