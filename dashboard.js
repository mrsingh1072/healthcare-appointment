function toggleMode() {
    document.body.classList.toggle("dark-mode");
    let icon = document.querySelector(".mode-toggle");
    icon.textContent = document.body.classList.contains("dark-mode") ? "☀️" : "🌙";
}

function loadHistory() {
    let pId = document.getElementById("patientIdSearch").value.trim();
    let doctorFilter = document.getElementById("doctorFilter").value;
    let dateFilter = document.getElementById("dateFilter").value;
    let tableBody = document.getElementById("historyTable");

    if (!pId) {
        alert("Please enter a Patient ID!");
        return;
    }

    let appointments = JSON.parse(localStorage.getItem("appointments")) || [];
    let history = appointments.filter(app => app.pId === pId);

    if (doctorFilter) {
        history = history.filter(app => app.doctor === doctorFilter);
    }

    if (dateFilter) {
        history = history.filter(app => app.aDate === dateFilter);
    }

    if (history.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" class="text-center">No Appointment Found!</td></tr>`;
        return;
    }

    tableBody.innerHTML = history.map(app => `
        <tr>
            <td>${app.pId}</td>
            <td>${app.pName}</td>
            <td>${app.doctor}</td>
            <td>${app.aDate}</td>
            <td><button class="btn btn-danger btn-sm" onclick="deleteAppointment('${app.pId}', '${app.aDate}')">Delete</button></td>
        </tr>
    `).join('');

    updateDoctorStats();
}

function updateDoctorStats() {
    let appointments = JSON.parse(localStorage.getItem("appointments")) || [];
    let stats = {};

    appointments.forEach(app => {
        stats[app.doctor] = (stats[app.doctor] || 0) + 1;
    });

    let ctx = document.getElementById("doctorChart").getContext("2d");
    new Chart(ctx, {
        type: "pie",
        data: {
            labels: Object.keys(stats),
            datasets: [{
                data: Object.values(stats),
                backgroundColor: ["#FF5733", "#33FF57", "#3357FF"],
            }]
        }
    });
}

document.addEventListener("DOMContentLoaded", function () {
    let appointments = JSON.parse(localStorage.getItem("appointments")) || [];
    let doctorSelect = document.getElementById("doctorFilter");

    let uniqueDoctors = [...new Set(appointments.map(app => app.doctor))];
    doctorSelect.innerHTML += uniqueDoctors.map(doctor => `<option value="${doctor}">${doctor}</option>`).join('');
});