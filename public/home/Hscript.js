async function getCatData(index) {
  const response = await fetch(
    `http://localhost:4000/home/foods?category=${index}`,
  );
  const data = await response.json();
  document.getElementById("foodDes").innerHTML = data.description;
  document.getElementById("foodImg").style.visibility = "visible";
  document.getElementById("foodImg").src = data.image;
  let allFood = "";
  for (const item of data.items) {
    const ing = item.ingredientList || "will be added soon";
    allFood += `<div class="card mx-3 my-5 overflowy-auto" style="width: 15rem; height: 27rem;"><img src="${item.image_url}" class="card-img-top"  style="width: 15rem; height: 15rem;" alt="..."><div class="card-body"><h5 class="card-title">${item.product_name}</h5><p class="card-text">${ing}</p><a href="#" class="btn btn-success price">Price : $49 </a>
    <div class="addToCart d-inline">
      <button class="btn btn-danger" onclick="editOrder(${item.product_id}, -1)">-<div id="popup" class="popup">Done!</div></button>
      <button class="btn btn-success" onclick="editOrder(${item.product_id}, 1)">+<div id="popup" class="popup">Done!</div></button>
      <span id="count${item.product_id}" class="count"></span>
    </div>
    </div></div>`;
  }

  document.getElementById("cards").innerHTML = allFood;
}

async function startOrder(data) {
  const add = document.querySelector(".disable");
  const startButton = document.querySelectorAll(".startButton");

  add.style.opacity = "1";
  add.style.pointerEvents = "all";

  const cart = document.querySelector(".checkCart");
  cart.style.visibility = "visible";

  const start = await fetch("/order/update", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  startButton[0].style.visibility = "hidden";
  startButton[1].style.visibility = "hidden";
}

async function editOrder(idP, num) {
  const popup = document.getElementById("popup");
  popup.classList.add("show");

  const count = document.getElementById(`count${idP}`);

  // Hide after 3 seconds
  setTimeout(() => {
    popup.classList.remove("show");
  }, 2000);

  data = { product_id: idP };
  data.start = 1;
  data.num = num;

  count.innerHTML = Number(count.innerHTML) + num;
  if (Number(count.innerHTML) < 0) {
    count.innerHTML = 0;
  }

  const start = await fetch("/order/update", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}
