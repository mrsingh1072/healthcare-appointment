document.addEventListener("DOMContentLoaded", function () {
    let selectedDoctor = ""; 

    document.querySelectorAll(".btn-warning").forEach(button => {
        button.addEventListener("click", function () {
            selectedDoctor = this.closest(".card").querySelector(".card-title").innerText;
            document.getElementById("doctorName").value = selectedDoctor;
            new bootstrap.Modal(document.getElementById("bookingModal")).show();
        });
    });

    document.getElementById("appointmentForm").addEventListener("submit", function (event) {
        event.preventDefault();

        let pId = document.getElementById("patientId").value.trim();
        let pName = document.getElementById("patientName").value.trim();
        let aDate = document.getElementById("appointmentDate").value;

        if (!pId || !pName || !aDate) {
            alert("Please fill all fields!");
            return;
        }

        let appointments = JSON.parse(localStorage.getItem("appointments")) || [];
        let duplicate = appointments.some(app => app.pId === pId && app.aDate === aDate);
        if (duplicate) {
            alert("You have already booked an appointment on this date with another doctor.");
            return;
        }

        let appointmentTime = new Date(aDate + "T09:00:00"); // Assume 9 AM appointment
        let reminderTime = new Date(appointmentTime.getTime() - 15 * 60 * 1000); // 15 minutes before

        appointments.push({ pId, pName, doctor: selectedDoctor, aDate, reminderTime });
        localStorage.setItem("appointments", JSON.stringify(appointments));

        alert("Appointment booked successfully!");
        document.getElementById("appointmentForm").reset();
        bootstrap.Modal.getInstance(document.getElementById("bookingModal")).hide();

        requestNotificationPermission();
        scheduleReminders();
    });

    scheduleReminders();
});

function requestNotificationPermission() {
    if ("Notification" in window) {
        Notification.requestPermission().then(permission => {
            console.log("Notification permission:", permission);
        });
    }
}

function scheduleReminders() {
    let appointments = JSON.parse(localStorage.getItem("appointments")) || [];
    let now = new Date();

    appointments.forEach(app => {
        let reminderTime = new Date(app.reminderTime);
        let timeDiff = reminderTime - now;

        if (timeDiff > 0) {
            setTimeout(() => {
                showNotification(app.pName, app.doctor, app.aDate);
            }, timeDiff);
        }
    });
}

function showNotification(pName, doctor, aDate) {
    if (Notification.permission === "granted") {
        new Notification("Appointment Reminder", {
            body: `Hey ${pName}, you have an appointment with Dr. ${doctor} on ${aDate}.`,
            icon: "assets/notification-icon.png"
        });
    }
}