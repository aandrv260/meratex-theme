"use strict";

// Slideshow section functionality
function slideshow(slides, btnLeft, btnRight, timer) {
  const maxSlide = slides.length;
  let curSlide = 0;

  slides.forEach((s, i) => {
    s.style.transform = `translateX(${100 * i}%)`;
  });

  function goToSlide(slide) {
    slides.forEach((s, i) => {
      s.style.transform = `translateX(${100 * (i - slide)}%)`;
    });
  }

  function slideRight() {
    if (curSlide === maxSlide - 1) {
      curSlide = 0;
    } else {
      curSlide++;
    }

    goToSlide(curSlide);
  }

  function slideLeft() {
    if (curSlide === 0) {
      curSlide = maxSlide - 1;
    } else {
      curSlide--;
    }

    goToSlide(curSlide);
  }

  if (typeof timer === "number") {
    setInterval(() => {
      slideRight();
    }, timer * 1000);
  }

  btnLeft?.forEach((btn) => {
    btn.addEventListener("click", () => {
      slideLeft();
    });
  });

  btnRight?.forEach((btn) => {
    btn.addEventListener("click", () => {
      slideRight();
    });
  });
}

// Promo bar slideshow functionality
function promoSlideshow(textSlides, btnLeft, btnRight) {
  const maxSlide = textSlides.length;
  let curSlide = 0;

  //   --------------------------------
  textSlides.forEach((s, i) => {
    s.style.transform = `translateX(${100 * i}%)`;
  });

  function slideLeft() {
    if (curSlide === 0) {
      curSlide = maxSlide - 1;
    } else {
      curSlide--;
    }

    goToSlide(curSlide);
  }

  function goToSlide(slide) {
    textSlides.forEach((s, i) => {
      s.style.transform = `translateX(${100 * (i - slide)}%)`;
    });
  }

  function slideRight() {
    if (curSlide === maxSlide - 1) {
      curSlide = 0;
    } else {
      curSlide++;
    }

    goToSlide(curSlide);
  }

  setInterval(() => {
    slideLeft();
  }, 10000);

  // Next slide
  btnRight.addEventListener("click", () => {
    slideRight(textSlides);
  });

  btnLeft.addEventListener("click", () => {
    slideRight(textSlides);
  });
}

// -------------------------------------------------------
// CART
// -------------------------------------------------------

async function getCartInfo() {
  const d = await fetch("/cart.js")
    .then((res) => res.json())
    .then((data) => {
      const dataObj = {};
      if (data.items.length > 0) {
        dataObj.empty = false;
      } else {
        dataObj.empty = true;
      }

      for (const [key, entry] of Object.entries(data)) {
        dataObj[key] = entry;
      }

      return dataObj;
    });
  return d;
}

function cartEmpty(cartBody) {
  cartBody.innerHTML = `<div class="cart__products"></div>`;
  // cartBody.innerHTML = `Вашата количка е празна`;
  cartBody.classList.add("cart__body--centered");
}

function disableScrollOnCartModalOpen(modal) {
  if (modal.classList.contains("hidden")) {
    document.body.style.overflowY = "hidden";
  } else {
    document.body.style.overflowY = "scroll";
  }
}

const cartHTML = `
<div class="cart__product">
<div class="cart__img-name-box">
    <div class="cart__img-box">
        <img class="cart__img"/>
    </div>

    <div class="cart__name-box">
        <span class="cart__prod-title">Title</span>

        <span class="cart__prod-option-name">Option name</span>
    </div>

</div>

<div class="cart__quantity-box">

    <div class="cart__prod-quantity-selector-box">
        <button class="cart__prod-quanitity-btn cart__prod-quanitity-btn-decr">-</button>

        <span class="cart__quantity-text">1</span>

        <button class="cart__prod-quanitity-btn cart__prod-quanitity-btn-incr">+</button>
    </div>

    <span class="cart__product-delete">X</span>

</div>

<div class="cart__price-box">
    <!-- LATER ADD THIS PIECE OF CODE (COMPARE AT PRICE) USING JS ONLY IF THERE IS A COMPARE PRICE -->
    <span class="cart__price cart__price--compare">
        890 лв
    </span>

    <span class="cart__price cart__price--active"></span>
</div>
</div>
`;

function intlPrice(num, currency = "BGN", locale = "bg-BG") {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
  })
    .format(num)
    .replace(",", ".")
    .slice(0, -1);
}

async function addProductToCart(data, slider) {
  await fetch("/cart/add.js", {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify(data),
  }).then((res) => res.json());

  return fetch("/cart/add.js", {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify(data),
  })
    .then((res) => res.json())
    .then((data) => {
      async function handleData() {
        const { items } = data;
        const added = items[0];

        slider?.classList.add("hidden");

        const comparePriceObj = await fetch(`/products/${added.handle}.js`)
          .then((res) => res.json())
          .then((data) => data);

        let comparePrice = "";

        if (comparePriceObj.variants[0].compare_at_price) {
          comparePrice = intlPrice(
            comparePriceObj.variants[0].compare_at_price / 100
          );
        }

        cartHTML = cartHTML
          .replace("[KEY]", added.key)
          .replace("[TITLE]", added.title)
          .replace("[SRC]", added.image)
          .replace("[OPTION NAME]", added.variant_title)
          .replace("[QUANTITY]", added.quantity - 1)
          .replace("[COMPARE AT]", comparePrice)
          .replace("[MAIN-PRICE]", intlPrice(added.final_line_price / 100));

        slider?.insertAdjacentHTML("beforebegin", cartHTML);

        const prodDeleteBtns = document.querySelectorAll(
          ".cart__product-delete"
        );
        const qtyIncreaseBtns = document.querySelectorAll(
          ".cart__prod-quanitity-btn-incr"
        );
        const qtyDecreaseBtns = document.querySelectorAll(
          ".cart__prod-quanitity-btn-decr"
        );

        const prodDeleteBtn = prodDeleteBtns[prodDeleteBtns.length - 1];
        const qtyIncreaseBtn = qtyIncreaseBtns[qtyIncreaseBtns.length - 1];
        const qtyDecreaseBtn = qtyDecreaseBtns[qtyDecreaseBtns.length - 1];

        prodDeleteBtn.addEventListener("click", (e) => {
          e.preventDefault();
          handleDeleteBtn(prodDeleteBtn);
        });

        qtyIncreaseBtn.addEventListener("click", function (e) {
          e.preventDefault();
          qtyBtnsHandler.call(this, "incr");
        });

        qtyDecreaseBtn.addEventListener("click", function (e) {
          e.preventDefault();
          qtyBtnsHandler.call(this, "decr");
        });

        return fetch("/cart.js");
      }
      handleData();
    });
}

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

  const productEl = this.closest(".cart__product");
  const key = productEl.getAttribute("key");

  const updateObj = {
    [key]: +quantityText.textContent,
  };

  const g = await jQuery.post("/cart/update.js", {
    updates: updateObj,
  });

  fetch("/cart.js")
    .then((res) => res.json())
    .then((data) => {
      // productEl
      // Filter the item on which was clicked
      const [curItem] = data.items.filter((item) => item.key === key);

      if (!curItem) productEl.remove();

      if (data.items.length === 0) {
        const cartBody = document.querySelector(".cart__body");
        const cartSummary = document.querySelector(".cart__summary");

        cartSummary.remove();
        cartEmpty(cartBody);
      } else {
        data.items.forEach((item) => {
          if (item.key === key) {
            const priceEl = productEl.querySelector(".cart__price--active");
            const comparePriceEl = productEl.querySelector(
              ".cart__price--compare"
            );
            // if(item.)
            renderComparePrice(item.handle, comparePriceEl, quantityText);

            priceEl.textContent = intlPrice(
              item.final_line_price / 100,
              "BGN",
              "bg-BG"
            );
          }
        });

        const summary = document.querySelector(".cart__summary-price--main");
        summary.textContent = intlPrice(data.total_price / 100);
      }
    });
}

async function handleDeleteBtn(btn) {
  const key = btn.closest(".cart__product").getAttribute("key");
  const k = {
    [key]: 0,
  };

  await jQuery.post("/cart/update.js", {
    updates: k,
  });

  fetch("/cart.js")
    .then((res) => res.json())
    .then((data) => {
      let isPresent = false;
      const cartBody = document.querySelector(".cart__body");
      const cartSummary = document.querySelector(".cart__summary");

      data.items.forEach((item) => {
        if (item.key === key) {
          isPresent = true;
        }
      });

      if (!isPresent) {
        btn.closest(".cart__product").remove();
        const products = document.querySelectorAll(".cart__product");
        if (products.length === 0) {
          cartSummary.remove();
          cartEmpty(cartBody);
        }
      } else {
        console.log("found");
      }

      return fetch("/cart.js");
    })
    .then((res) => res.json())
    .then((data) => {
      const summary = document?.querySelector(".cart__summary-price--main");
      if (summary) summary.textContent = intlPrice(data.total_price / 100);
    });
}

async function getProductData(handle) {
  return fetch(`/products/${handle}.js`).then((res) => res.json());
}

async function renderComparePrice(handle, comparePriceEl, quantityTextEl) {
  await getProductData(handle).then((data) => {
    if (data.compare_at_price)
      comparePriceEl.textContent = intlPrice(
        (data.compare_at_price * +quantityTextEl.textContent) / 100
      );
  });
}

async function renderRecommendedProduct(productId) {
  fetch(`/recommendations/products.json?product_id=${productId}&limit=1`)
    .then((res) => res.json())
    .then((data) => {
      const slider = document.querySelector(".cart__slideshow-slider");
      const slideImg = document.querySelector(".cart__slideshow-img");
      const slideTitle = document.querySelector(".cart__slide-prod-title");
      const slideOptionTitle = document.querySelector(
        ".cart__slide-prod-option-name"
      );
      const comparePriceEl = document.querySelector(
        ".cart__slide-price--compare"
      );
      const mainPrice = document.querySelector(".cart__slide-price--active ");
      const addToCartSlideBtn = document.querySelector(".cart__slideshow-btn");

      const { products } = data;
      const [product] = products;
      const variant = product.variants[0];
      const slideProductId = variant.id;
      const comparePrice = variant.compare_at_price;

      slideImg.src = product.images[0];
      slideTitle.textContent = product.title;
      mainPrice.textContent = intlPrice(variant.price / 100);

      if (product.variants.length > 0)
        slideOptionTitle.textContent = variant.option1;
      else slideOptionTitle.textContent = "";

      if (
        variant.compare_at_price &&
        variant.compare_at_price > variant.price
      ) {
        comparePriceEl.textContent = intlPrice(product.compare_at_price / 100);
      } else {
        comparePriceEl.textContent = "";
      }

      addToCartSlideBtn.addEventListener("click", (e) => {
        e.preventDefault();

        const data = {
          items: [
            {
              id: slideProductId,
              quantity: 1,
            },
          ],
        };

        addProductToCart(data, slider)
          .catch((err) => console.log(err))
          .then((res) => res.json())
          .then((data) => {
            const summary = document.querySelector(
              ".cart__summary-price--main"
            );
            summary.textContent = intlPrice(data.total_price / 100);
          })
          .catch((err) => console.warn("Error", err));
      });
    });

  const deleteBtns = document.querySelectorAll(".cart__product-delete");

  deleteBtns.forEach((btn) => {
    btn.addEventListener("click", function (e) {
      e.preventDefault();

      handleDeleteBtn(btn);
    });
  });
}

function addQtyBtnsListener(btnsIncr, btnsDecr, qtyBtnsHandler) {
  btnsIncr.forEach((btn) => {
    btn.addEventListener("click", async function (e) {
      e.preventDefault();

      qtyBtnsHandler.call(this, "incr");
    });
  });

  btnsDecr.forEach((btn) => {
    btn.addEventListener("click", async function (e) {
      e.preventDefault();

      qtyBtnsHandler.call(this, "decr");
    });
  });
}
