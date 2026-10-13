// Logic Formulir Kontak & Preview Ringan (P04)
document.addEventListener("DOMContentLoaded", () => {
  const contactForm = document.querySelector("#contactForm");

  if (contactForm) {
    contactForm.addEventListener("submit", (event) => {
      event.preventDefault();

      // Mengambil nilai kontrol formulir
      const nama = document.querySelector("#nama").value;
      const email = document.querySelector("#email").value;
      const paketSelect = document.querySelector("#paket");
      const paket = paketSelect ? paketSelect.value : "-";

      const topikChecked = document.querySelector("input[name='topik']:checked");
      const topik = topikChecked ? topikChecked.value : "-";

      const whatsapp = document.querySelector("#whatsapp").value;

      const waktuKontakChecked = document.querySelector("input[name='waktuKontak']:checked");
      const waktu = waktuKontakChecked ? waktuKontakChecked.value : "-";

      const pesan = document.querySelector("#pesan").value;

      // Menampilkan data ke elemen preview ringan
      const previewBox = document.querySelector("#previewBox");
      document.querySelector("#previewNama").textContent = nama;
      document.querySelector("#previewEmail").textContent = email;
      document.querySelector("#previewPaket").textContent = paket;
      document.querySelector("#previewTopik").textContent = topik;
      document.querySelector("#previewWhatsapp").textContent = whatsapp;
      document.querySelector("#previewWaktu").textContent = waktu;
      document.querySelector("#previewPesan").textContent = pesan;

      previewBox.style.display = "block";
    });

    // Reset formulir menyembunyikan kembali kotak preview dan mengosongkan data lama (E07)
    contactForm.addEventListener("reset", () => {
      const previewBox = document.querySelector("#previewBox");
      if (previewBox) {
        previewBox.style.display = "none";
        document.querySelector("#previewNama").textContent = "-";
        document.querySelector("#previewEmail").textContent = "-";
        document.querySelector("#previewPaket").textContent = "-";
        document.querySelector("#previewTopik").textContent = "-";
        document.querySelector("#previewWhatsapp").textContent = "-";
        document.querySelector("#previewWaktu").textContent = "-";
        document.querySelector("#previewPesan").textContent = "-";
      }
    });
  }
});
