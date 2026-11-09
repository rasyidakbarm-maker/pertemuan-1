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

// 2. Function Helper: formatRupiah(nilai)
function formatRupiah(nilai) {
  return `Rp${nilai.toLocaleString("id-ID")}`;
}

// 3. Function Helper: statusStok(stok)
// Mengembalikan objek berisi teks label dan nama kelas CSS badge
function statusStok(stok) {
  if (stok <= 0) {
    return {
      label: "Habis",
      badgeClass: "badge-habis"
    };
  } else if (stok <= 5) {
    return {
      label: `Sisa ${stok}`,
      badgeClass: "badge-terbatas"
    };
  } else {
    return {
      label: `Tersedia (${stok})`,
      badgeClass: "badge-tersedia"
    };
  }
}

function buatKartuProduk(produk) {
  const status = statusStok(produk.stok);
  const labelUnggulanHTML = produk.isUnggulan
    ? `<span class="badge badge-unggulan">★ Unggulan</span>`
    : "";

  return `
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
        <span class="badge ${status.badgeClass}">${status.label}</span>
      </div>
    </article>
  `;
}

// Helper baris tabel untuk halaman produk.html
function buatBarisTabel(produk) {
  const status = statusStok(produk.stok);
  const labelUnggulanHTML = produk.isUnggulan
    ? `<span class="badge badge-unggulan">★ Unggulan</span>`
    : "";

  return `
    <tr class="${produk.isUnggulan ? 'baris-unggulan' : ''}">
      <th scope="row">
        <strong>${produk.nama}</strong>
        ${labelUnggulanHTML}
      </th>
      <td>${produk.kategori}</td>
      <td>${produk.deskripsi}</td>
      <td><strong>${formatRupiah(produk.harga)}</strong></td>
      <td><span class="badge ${status.badgeClass}">${status.label}</span></td>
    </tr>
  `;
}

// 5. Operasi Array & Nilai Antara (filter, find, forEach, console.table/log)
console.group("=== [P10] Katalog Produk UMKM Modular ===");

// Inspeksi seluruh data produk
console.table(daftarProduk);

// (a) filter: Mengambil hanya produk yang tersedia (stok > 0)
const produkTersedia = daftarProduk.filter((produk) => produk.stok > 0);
console.log("1. Hasil filter (Produk Tersedia stok > 0):", produkTersedia);

// (b) find: Menentukan satu produk rekomendasi unggulan yang siap dipesan
const produkRekomendasi = daftarProduk.find(
  (produk) => produk.isUnggulan && produk.stok > 0
);
console.log("2. Hasil find (Produk Rekomendasi Utama):", produkRekomendasi);


console.groupCollapsed("3. Audit Inventaris Stok (forEach):");
daftarProduk.forEach((p, idx) => {
  const status = statusStok(p.stok);
  console.log(`[Item #${idx + 1}] ${p.nama} | Status: ${status.label} | Harga: ${formatRupiah(p.harga)}`);
});
console.groupEnd();

console.groupEnd();

// 6. Rendering DOM dengan map & Guard Clause Bebas Error

// (a) Render Kartu Produk di Beranda (index.html target #produk-dinamis)
function renderKartuProdukDinamis() {
  const container = document.querySelector("#produk-dinamis");
  if (!container) return; // Guard clause mencegah error pada halaman non-beranda

  const kartuMarkup = daftarProduk
    .filter((produk) => produk.isUnggulan)
    .map(buatKartuProduk)
    .join("");
  container.innerHTML = kartuMarkup;
}

// (b) Render Baris Tabel di Katalog (produk.html target #tabel-produk-body)
function renderKatalogProduk() {
  const tbody = document.querySelector("#tabel-produk-body");
  if (!tbody) return; // Guard clause mencegah error pada halaman non-katalog

  const tabelMarkup = daftarProduk.map(buatBarisTabel).join("");
  tbody.innerHTML = tabelMarkup;
}

// Fungsi utama renderProduk
function renderProduk() {
  renderKartuProdukDinamis();
  renderKatalogProduk();
}

// Eksekusi render
renderProduk();

// 7. Navigasi Responsif Hamburger Menu 
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
