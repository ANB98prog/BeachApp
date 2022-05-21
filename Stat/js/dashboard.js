(() => {
    "use strict";
    feather.replace({ "aria-hidden": "true" });
    const e = document.getElementById("myChart");
    new Chart(e, { type: "line", data: { labels: ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"], datasets: [{ data: [3434, 2134, 1848, 1909, 1348, 1409, 2203], lineTension: 0, backgroundColor: "transparent", borderColor: "#007bff", borderWidth: 4, pointBackgroundColor: "#007bff" }] }, options: { scales: { yAxes: [{ ticks: { beginAtZero: !1 } }] }, legend: { display: !1 } } })
})();