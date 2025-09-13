// script.js

document.addEventListener("DOMContentLoaded", () => {
  const ctx = document.getElementById("prChart").getContext("2d");

  // JSON データのパス。index.html と同じ階層なら相対パスで OK
  fetch("data.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      const authors = Array.from(new Set(data.map((item) => item.author)));
      const countsPerAuthor = authors.reduce((acc, author) => {
        acc[author] = (acc[author] || 0) + 1;
        return acc;
      }, {});

      const chart = new Chart(ctx, {
        type: "bar", // 棒グラフ
        data: {
          labels: authors,
          datasets: [
            {
              label: "pr数",
              data: Object.values(countsPerAuthor),
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
                // 整数だけ表示したいなら
                callback: function (value, index, values) {
                  if (Number.isInteger(value)) {
                    return value;
                  }
                },
              },
            },
          },
          plugins: {
            legend: {
              display: true,
            },
            tooltip: {
              enabled: true,
            },
          },
        },
      });
    })
    .catch((err) => {
      console.error("データの取得に失敗:", err);
    });
});
