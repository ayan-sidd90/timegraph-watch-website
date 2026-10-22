const cart = [];

const cartToggle = document.getElementById("cart-toggle");
const cartClose = document.getElementById("cart-close");
const cartPanel = document.getElementById("cart-panel");
const overlay = document.getElementById("overlay");
const cartItems = document.getElementById("cart-items");
const cartCount = document.getElementById("cart-count");
const cartTotal = document.getElementById("cart-total");
const checkoutButton = document.getElementById("checkout");
const nav = document.getElementById("nav");

// Apna WhatsApp business number country code ke sath likho.
// Example: 923001234567 (plus sign ke baghair)
const WHATSAPP_NUMBER = "923001234567";

function formatPrice(price) {
    return "Rs. " + price.toLocaleString("en-PK");
}

function openCart() {
    document.body.classList.add("cart-open");
    cartPanel.setAttribute("aria-hidden", "false");
}

function closeCart() {
    document.body.classList.remove("cart-open");
    cartPanel.setAttribute("aria-hidden", "true");
}

cartToggle.addEventListener("click", openCart);
cartClose.addEventListener("click", closeCart);
overlay.addEventListener("click", closeCart);

document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
        closeCart();
        nav.classList.remove("open");
    }
});

// Mobile navigation
document.getElementById("menu-toggle").addEventListener("click", function () {
    nav.classList.toggle("open");
});

nav.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
        nav.classList.remove("open");
    });
});

// Product filters
const filterButtons = document.querySelectorAll(".filter");
const products = document.querySelectorAll(".product-card");

filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
        const selectedFilter = button.dataset.filter;

        filterButtons.forEach(function (item) {
            item.classList.remove("active");
        });

        button.classList.add("active");

        products.forEach(function (product) {
            const matches =
                selectedFilter === "all" ||
                product.dataset.category === selectedFilter;

            product.hidden = !matches;
        });
    });
});

// Add products to cart
document.querySelectorAll(".quick-add").forEach(function (button) {
    button.addEventListener("click", function () {
        const name = button.dataset.name;
        const price = Number(button.dataset.price);

        if (!name || !Number.isFinite(price) || price <= 0) {
            return;
        }

        const existingItem = cart.find(function (item) {
            return item.name === name;
        });

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                name: name,
                price: price,
                quantity: 1
            });
        }

        renderCart();
        openCart();
    });
});

// Draw cart items
function renderCart() {
    const totalQuantity = cart.reduce(function (sum, item) {
        return sum + item.quantity;
    }, 0);

    const totalPrice = cart.reduce(function (sum, item) {
        return sum + item.price * item.quantity;
    }, 0);

    cartCount.textContent = totalQuantity;
    cartTotal.textContent = formatPrice(totalPrice);

    if (cart.length === 0) {
        cartItems.replaceChildren();

        const message = document.createElement("p");
        message.className = "empty-cart";
        message.textContent =
            "Your bag is waiting for something timeless.";

        cartItems.appendChild(message);
        return;
    }

    cartItems.replaceChildren();

    cart.forEach(function (item) {
        const row = document.createElement("div");
        row.className = "cart-item";

        const details = document.createElement("div");
        const title = document.createElement("h3");
        title.textContent = item.name;

        const price = document.createElement("p");
        price.textContent = formatPrice(item.price) + " each";

        const controls = document.createElement("div");
        controls.className = "quantity-controls";

        const minus = document.createElement("button");
        minus.type = "button";
        minus.textContent = "−";
        minus.setAttribute("aria-label", "Decrease quantity");

        const quantity = document.createElement("span");
        quantity.textContent = item.quantity;

        const plus = document.createElement("button");
        plus.type = "button";
        plus.textContent = "+";
        plus.setAttribute("aria-label", "Increase quantity");

        minus.addEventListener("click", function () {
            item.quantity -= 1;

            if (item.quantity <= 0) {
                cart.splice(cart.indexOf(item), 1);
            }

            renderCart();
        });

        plus.addEventListener("click", function () {
            item.quantity += 1;
            renderCart();
        });

        controls.append(minus, quantity, plus);

        const remove = document.createElement("button");
        remove.type = "button";
        remove.className = "remove-item";
        remove.textContent = "Remove";

        remove.addEventListener("click", function () {
            cart.splice(cart.indexOf(item), 1);
            renderCart();
        });

        details.append(title, price, controls, remove);
        row.appendChild(details);

        const subtotal = document.createElement("strong");
        subtotal.textContent = formatPrice(item.price * item.quantity);
        row.appendChild(subtotal);

        cartItems.appendChild(row);
    });
}

// WhatsApp checkout
checkoutButton.addEventListener("click", function () {
    if (cart.length === 0) {
        alert("Your bag is empty. Please add a watch first.");
        return;
    }

    if (!/^\d{10,15}$/.test(WHATSAPP_NUMBER)) {
        alert("Please set your correct WhatsApp business number in script.js.");
        return;
    }

    const total = cart.reduce(function (sum, item) {
        return sum + item.price * item.quantity;
    }, 0);

    const orderLines = cart.map(function (item) {
        return (
            item.name +
            " x " + item.quantity +
            " = " + formatPrice(item.price * item.quantity)
        );
    });

    const message = [
        "Hello Timegraph!",
        "",
        "I would like to place an order:",
        ...orderLines,
        "",
        "Total: " + formatPrice(total),
        "",
        "Please confirm availability and payment details."
    ].join("\n");

    const whatsappURL =
        "https://wa.me/" +
        WHATSAPP_NUMBER +
        "?text=" +
        encodeURIComponent(message);

    window.open(whatsappURL, "_blank", "noopener,noreferrer");
});

// Automatically update copyright year
document.getElementById("year").textContent =
    new Date().getFullYear();