// script.js

document.addEventListener("DOMContentLoaded", () => {
  const ctx = document.getElementById("prChart").getContext("2d");
  let chart;
  let originalData = [];

  fetch("data.json")
    .then((response) => {
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      return response.json();
    })
    .then((data) => {
      originalData = data;
      renderChart(originalData);
    })
    .catch((err) => console.error("データの取得に失敗:", err));

  function filterData() {
    const startStr = document.getElementById("startDate").value;
    const endStr = document.getElementById("endDate").value;

    let filtered = originalData;

    if (startStr) {
      const startDate = new Date(startStr);
      filtered = filtered.filter(
        (item) => new Date(item.createdAt) >= startDate
      );
    }
    if (endStr) {
      const endDate = new Date(endStr);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter((item) => new Date(item.createdAt) <= endDate);
    }

    renderChart(filtered);
  }

  function renderChart(data) {
    const authors = Array.from(new Set(data.map((item) => item.author)));
    const countsPerAuthor = authors.map(
      (author) => data.filter((item) => item.author === author).length
    );

    if (chart) chart.destroy();

    chart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: authors,
        datasets: [
          {
            label: "pr数",
            data: countsPerAuthor,
            backgroundColor: "rgba(54, 162, 235, 0.5)",
            borderColor: "rgba(54, 162, 235, 1)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => (Number.isInteger(value) ? value : null),
            },
          },
        },
      },
    });
  }

  document.getElementById("filterBtn").addEventListener("click", filterData);
});
