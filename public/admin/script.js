async function changeStatus(paymentID, currentStatus) {
  let num = 0;
  if (currentStatus === "Pending") {
    num = 0;
  } else if (currentStatus === "Completed") {
    num = 1;
  } else return;

  data = { paymentID: paymentID, num: num };
  const start = await fetch("/admin/status", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  window.location.reload();
}

async function changeRole(userID, currentStatus) {
  let num = 0;
  if (currentStatus === "customer") {
    num = 0;
  } else if (currentStatus === "chef") {
    num = 1;
  } else if (currentStatus === "administrator") {
    num = 2;
  }

  data = { userID: userID, num: num };
  const start = await fetch("/admin/role", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  window.location.reload();
}

function filter() {
  const roleName = document.getElementById("role").value.toLowerCase();
  const rows = document.querySelectorAll(".userTable");

  rows.forEach((row) => {
    if (roleName === "role") {
      row.style.display = "";
      return;
    }
    const role = row.querySelector(".roleF").textContent.toLowerCase();

    if (role.includes(roleName)) {
      row.style.display = "";
    } else {
      row.style.display = "none";
    }
  });
}
