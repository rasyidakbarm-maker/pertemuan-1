"use strict";

/**
 * ========================================================
 * PRAKTIKUM P09: FITUR DATA PRODUK UMKM KOPI KAMPUNG
 * ========================================================
 * Memodelkan data produk sebagai Array of Objects dan merendernya
 * secara dinamis ke dalam DOM dengan manipulasi berbasis kondisi.
 */

// 1. Data Model Produk UMKM Kopi Kampung (Minimal 4 Produk)
const daftarProduk = [
  {
    id: 1,
    nama: "Kopi Americano",
    kategori: "Kopi Hitam",
    harga: 10000,
    stok: 12,
    isUnggulan: true,
    deskripsi: "Espresso pekat diseduh air panas, cita rasa kopi murni tanpa susu."
  },
  {
    id: 2,
    nama: "Cold Brew Aren",
    kategori: "Cold Brew",
    harga: 25000,
    stok: 4,
    isUnggulan: true,
    deskripsi: "Kopi seduh dingin 12 jam dipadu gula aren pilihan, segar dan manis alami."
  },
  {
    id: 3,
    nama: "Kopi Susu",
    kategori: "Kopi Susu",
    harga: 15000,
    stok: 9,
    isUnggulan: false,
    deskripsi: "Espresso lembut berpadu susu segar, creamy dengan sentuhan manis pas."
  },
  {
    id: 4,
    nama: "Kopi Tubruk Tradisional",
    kategori: "Kopi Hitam",
    harga: 8000,
    stok: 0,
    isUnggulan: false,
    deskripsi: "Kopi giling kasar diseduh mendidih langsung, aroma pekat khas pedesaan Batang."
  }
];

// 2. Logging ke Console DevTools (Ketentuan 10)
console.group("=== Katalog Data Produk UMKM (P09) ===");
console.info("Memuat data produk dalam bentuk tabel terstruktur:");
console.table(daftarProduk);
console.groupEnd();

/**
 * Helper: Format angka menjadi mata uang Rupiah
 * Menggunakan operator dan template literal
 */
const formatRupiah = (angka) => `Rp${angka.toLocaleString("id-ID")}`;

/**
 * 3. Fungsi Render Data ke DOM
 * Mencegah runtime error pada halaman lain via Guard Clause (Ketentuan 9)
 */
function renderKatalogProduk() {
  const tbody = document.querySelector("#tabel-produk-body");

  // Guard Clause: Halaman tanpa target DOM tidak akan mengalami error
  if (!tbody) {
    console.info("Halaman ini tidak memuat kontainer #tabel-produk-body. Rendering dilewati dengan aman.");
    return;
  }

  let barisTabelHTML = "";

  // Iterasi Array of Objects
  for (let i = 0; i < daftarProduk.length; i++) {
    const produk = daftarProduk[i];

    // Keputusan Kondisional 1: Status Ketersediaan berdasarkan Stok
    let statusBadgeHTML = "";
    if (produk.stok === 0) {
      statusBadgeHTML = `<span class="badge badge-habis">Habis</span>`;
    } else if (produk.stok <= 5) {
      statusBadgeHTML = `<span class="badge badge-terbatas">Sisa ${produk.stok}</span>`;
    } else {
      statusBadgeHTML = `<span class="badge badge-tersedia">Tersedia (${produk.stok})</span>`;
    }

    // Keputusan Kondisional 2: Penanda Produk Unggulan
    const labelUnggulanHTML = produk.isUnggulan
      ? `<span class="badge badge-unggulan">★ Unggulan</span>`
      : "";

    // Penyusunan output baris tabel semantik via Template Literal
    barisTabelHTML += `
      <tr class="${produk.isUnggulan ? 'baris-unggulan' : ''}">
        <th scope="row">
          <strong>${produk.nama}</strong>
          ${labelUnggulanHTML}
        </th>
        <td>${produk.kategori}</td>
        <td>${produk.deskripsi}</td>
        <td><strong>${formatRupiah(produk.harga)}</strong></td>
        <td>${statusBadgeHTML}</td>
      </tr>
    `;
  }

  // Masukkan seluruh baris ke elemen tbody
  tbody.innerHTML = barisTabelHTML;
  console.log(`%c[Sukses] Berhasil merender ${daftarProduk.length} produk ke dalam DOM.`, "color: #2e7d32; font-weight: bold;");
}

/**
 * 4. Fungsi Render Kartu Produk Dinamis (Rubrik E04 Target #produk-dinamis)
 * Merender daftar produk dalam format kartu modern ke elemen #produk-dinamis
 */
function renderKartuProdukDinamis() {
  const container = document.querySelector("#produk-dinamis");

  // Guard Clause: Mencegah error jika dijalankan di halaman tanpa #produk-dinamis
  if (!container) return;

  let kartuHTML = "";

  for (let i = 0; i < daftarProduk.length; i++) {
    const produk = daftarProduk[i];

    // Status stok badge
    let statusBadgeHTML = "";
    if (produk.stok === 0) {
      statusBadgeHTML = `<span class="badge badge-habis">Habis</span>`;
    } else if (produk.stok <= 5) {
      statusBadgeHTML = `<span class="badge badge-terbatas">Sisa ${produk.stok}</span>`;
    } else {
      statusBadgeHTML = `<span class="badge badge-tersedia">Tersedia (${produk.stok})</span>`;
    }

    // Label unggulan
    const labelUnggulanHTML = produk.isUnggulan
      ? `<span class="badge badge-unggulan">★ Unggulan</span>`
      : "";

    kartuHTML += `
      <article class="product-card" data-id="${produk.id}">
        <div class="product-card-header">
          <div>
            <span class="product-card-category">${produk.kategori}</span>
            <h3 class="product-card-title">${produk.nama}</h3>
          </div>
          ${labelUnggulanHTML}
        </div>
        <p class="product-card-desc">${produk.deskripsi}</p>
        <div class="product-card-footer">
          <p class="product-card-price">${formatRupiah(produk.harga)}</p>
          ${statusBadgeHTML}
        </div>
      </article>
    `;
  }

  container.innerHTML = kartuHTML;
  console.log(`%c[E04] Berhasil merender ${daftarProduk.length} kartu produk dinamis ke #produk-dinamis.`, "color: #2e7d32; font-weight: bold;");
}

// Inisialisasi Eksekusi Rendering
renderKatalogProduk();
renderKartuProdukDinamis();

/**
 * 5. Navigasi Responsif Hamburger Menu (Mobile Friendly)
 * Menangani interaksi klik tombol hamburger, pembaruan ARIA, dan aksesibilitas keyboard (Escape).
 */
function initNavToggle() {
  const toggleBtn = document.querySelector(".nav-toggle");
  const navMenu = document.querySelector("#nav-menu");

  if (!toggleBtn || !navMenu) return;

  toggleBtn.addEventListener("click", () => {
    const isExpanded = toggleBtn.getAttribute("aria-expanded") === "true";
    toggleBtn.setAttribute("aria-expanded", String(!isExpanded));
    toggleBtn.setAttribute("aria-label", isExpanded ? "Buka menu navigasi" : "Tutup menu navigasi");
    navMenu.classList.toggle("is-active", !isExpanded);
  });

  // Aksesibilitas Keyboard: Tutup menu saat tombol Escape ditekan
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && toggleBtn.getAttribute("aria-expanded") === "true") {
      toggleBtn.setAttribute("aria-expanded", "false");
      toggleBtn.setAttribute("aria-label", "Buka menu navigasi");
      navMenu.classList.remove("is-active");
      toggleBtn.focus();
    }
  });
}

initNavToggle();
