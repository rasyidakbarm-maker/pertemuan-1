const promoButton = document.querySelector("#promoButton");

if (promoButton) {
  promoButton.addEventListener("click", () => {
    promoButton.textContent = "Promo: Beli 3 Gratis 1!";
    console.log("Promo Kopi Kampung berhasil ditampilkan.");
  });
}