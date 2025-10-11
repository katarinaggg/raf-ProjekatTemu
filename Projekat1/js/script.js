document.addEventListener("DOMContentLoaded", () => {
  const departmentList = document.getElementById("departmentList");

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
});
