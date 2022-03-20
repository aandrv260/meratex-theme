async function qtyBtnsHandler(type) {
  const parentEl = this.parentElement;
  const quantityText = parentEl.querySelector(".cart__quantity-text");
  let quantityNum;

  if (type === "decr") {
    quantityNum = +quantityText.textContent;

    if (+quantityText.textContent > 0) quantityText.textContent--;
  } else {
    quantityNum = ++quantityText.textContent;
  }

  console.log(quantityNum);
  console.log(this, parentEl, quantityText);

  const productEl = this.closest(".cart__product");
  const key = productEl.getAttribute("key");
  console.log(productEl);
  console.log(key);

  const updateObj = {
    [key]: +quantityText.textContent,
  };

  await jQuery.post("/cart/update.js", {
    updates: updateObj,
  });

  fetch("/cart.js")
    .then((res) => res.json())
    .then((data) => {
      console.log("After quantity decrease", data);

      if (data.items.length === 0) {
        const cartBody = document.querySelector(".cart__body");
        const cartSummary = document.querySelector(".cart__summary");

        cartSummary.remove();
        cartEmpty(cartBody);
      }

      data.items.forEach((item) => {
        if (item.key === key) {
          const priceEl = productEl.querySelector(".cart__price--active");
          // productEl.querySelector('.cart__price--active').textContent = new Intl.NumberFormat('bg-BG', {style: 'currency', currency: 'BGN'}).format(item.final_line_price / 100);
          priceEl.textContent = intlPrice(
            item.final_line_price / 100,
            "BGN",
            "bg-BG"
          );
          console.log(
            productEl.querySelector(".cart__price--active").textContent
          );
        }
      });

      const summary = document.querySelector(".cart__summary-price--main");
      summary.textContent = intlPrice(data.total_price / 100);
    });
}
