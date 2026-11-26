const DATA_URL = "data/products.json";

let allProducts = [];
let activeCategory = "semua";

// Helper: Format angka ke mata uang Rupiah
function formatRupiah(nilai) {
  return `Rp${nilai.toLocaleString("id-ID")}`;
}

// Helper: Status label ketersediaan stok
function statusStok(stok) {
  if (stok <= 0) {
    return { label: "Habis", badgeClass: "badge-habis" };
  } else if (stok <= 5) {
    return { label: `Sisa ${stok}`, badgeClass: "badge-terbatas" };
  } else {
    return { label: `Tersedia (${stok})`, badgeClass: "badge-tersedia" };
  }
}

// Helper: Komponen UI State Loading
function createLoadingState() {
  const loadingBox = document.createElement("div");
  loadingBox.classList.add("catalog-loading");
  loadingBox.setAttribute("role", "status");
  loadingBox.setAttribute("aria-live", "polite");

  const spinner = document.createElement("div");
  spinner.classList.add("spinner");

  const text = document.createElement("p");
  text.textContent = "Memuat katalog produk Kopi Kampung...";

  loadingBox.append(spinner, text);
  return loadingBox;
}

// Helper: Komponen UI State Kosong (Empty State)
function createEmptyState(kategori) {
  const emptyBox = document.createElement("div");
  emptyBox.classList.add("empty-state");
  emptyBox.setAttribute("role", "status");

  const title = document.createElement("p");
  title.classList.add("empty-title");

  const desc = document.createElement("p");
  desc.classList.add("empty-desc");

  if (!kategori || kategori.toLowerCase() === "semua") {
    title.textContent = "Belum ada produk yang tersedia saat ini.";
    desc.textContent = "Katalog produk sedang dalam pembaruan atau belum ada data yang dimuat. Silakan periksa kembali nanti.";
  } else {
    title.textContent = `Tidak ada produk untuk kategori "${kategori}".`;
    desc.textContent = "Silakan pilih kategori lain atau klik 'Semua' untuk melihat seluruh menu.";
  }

  emptyBox.append(title, desc);
  return emptyBox;
}

// Helper: Komponen UI State Error (Error State) dengan tombol Retry
function createErrorState(pesan, onRetry) {
  const errorBox = document.createElement("div");
  errorBox.classList.add("catalog-error");
  errorBox.setAttribute("role", "alert");
  errorBox.setAttribute("aria-live", "assertive");

  const title = document.createElement("p");
  title.classList.add("error-title");
  title.textContent = "Gagal Memuat Katalog Produk";

  const desc = document.createElement("p");
  desc.classList.add("error-desc");
  desc.textContent = pesan || "Terjadi kesalahan saat mengambil data dari server.";

  const btnRetry = document.createElement("button");
  btnRetry.type = "button";
  btnRetry.classList.add("btn-retry");
  btnRetry.textContent = "Coba Lagi";
  btnRetry.addEventListener("click", () => {
    if (typeof onRetry === "function") {
      onRetry();
    }
  });

  errorBox.append(title, desc, btnRetry);
  return errorBox;
}

// Helper: Pembuatan kartu produk DOM
function createProductCard(produk) {
  const card = document.createElement("article");
  card.classList.add("product-card");
  card.dataset.id = String(produk.id);

  // Gambar produk (jika tersedia di JSON)
  if (produk.gambar) {
    const imgWrapper = document.createElement("div");
    imgWrapper.classList.add("product-card-image");

    const img = document.createElement("img");
    img.src = produk.gambar;
    img.alt = `Foto ${produk.nama}`;
    img.loading = "lazy";
    img.width = 300;
    img.height = 180;

    imgWrapper.append(img);
    card.append(imgWrapper);
  }

  // Header kartu
  const header = document.createElement("div");
  header.classList.add("product-card-header");

  const titleGroup = document.createElement("div");
  const cat = document.createElement("span");
  cat.classList.add("product-card-category");
  cat.textContent = produk.kategori;

  const title = document.createElement("h3");
  title.classList.add("product-card-title");
  title.textContent = produk.nama;

  titleGroup.append(cat, title);
  header.append(titleGroup);

  if (produk.isUnggulan) {
    const badgeUnggulan = document.createElement("span");
    badgeUnggulan.classList.add("badge", "badge-unggulan");
    badgeUnggulan.textContent = "★ Unggulan";
    header.append(badgeUnggulan);
  }

  // Deskripsi produk
  const desc = document.createElement("p");
  desc.classList.add("product-card-desc");
  desc.textContent = produk.deskripsi;

  // Footer kartu (harga & stok)
  const footer = document.createElement("div");
  footer.classList.add("product-card-footer");

  const price = document.createElement("p");
  price.classList.add("product-card-price");
  price.textContent = formatRupiah(produk.harga);

  const status = statusStok(produk.stok);
  const badgeStok = document.createElement("span");
  badgeStok.classList.add("badge", status.badgeClass);
  badgeStok.textContent = status.label;

  footer.append(price, badgeStok);

  // Susun elemen kartu
  card.append(header, desc, footer);
  return card;
}

// Function Utama: Render produk ke DOM (Success State & Empty State)
function renderProducts(itemsToRender, kategori = activeCategory) {
  const grid = document.querySelector("#produk-grid");
  const statusEl = document.querySelector("#status-katalog");
  if (!grid) return;

  // Filter berdasarkan kategori yang dipilih
  const filtered = kategori === "semua"
    ? itemsToRender
    : itemsToRender.filter((p) => p.kategori.toLowerCase() === kategori.toLowerCase());

  // Perbarui status informatif
  if (statusEl) {
    if (filtered.length === 0 && (!kategori || kategori.toLowerCase() === "semua")) {
      statusEl.textContent = "Tidak ada produk yang tersedia (0 produk)";
    } else if (kategori === "semua") {
      statusEl.textContent = `Menampilkan semua produk (${filtered.length} produk)`;
    } else {
      statusEl.textContent = `Kategori "${kategori}": ${filtered.length} produk ditemukan`;
    }
  }

  // Tampilkan Empty State jika hasil filter 0 item
  if (filtered.length === 0) {
    grid.replaceChildren(createEmptyState(kategori));
    return;
  }

  // Success State: Render kartu produk
  const cards = filtered.map(createProductCard);
  grid.replaceChildren(...cards);
}

// Function: Render Ringkasan Statistik Produk (E04)
function renderRingkasan(products) {
  const elTotal = document.querySelector("#ringkasan-total");
  const elUnggulan = document.querySelector("#ringkasan-unggulan");
  const elTersedia = document.querySelector("#ringkasan-tersedia");
  const elHabis = document.querySelector("#ringkasan-habis");

  if (!elTotal) return;

  const total = products.length;
  const unggulan = products.filter((p) => p.isUnggulan).length;
  const tersedia = products.filter((p) => p.stok > 0).length;
  const habis = products.filter((p) => p.stok <= 0).length;

  elTotal.textContent = `${total} Menu`;
  if (elUnggulan) elUnggulan.textContent = `${unggulan} Menu`;
  if (elTersedia) elTersedia.textContent = `${tersedia} Menu`;
  if (elHabis) elHabis.textContent = `${habis} Menu`;
}

// Function: Render Section Produk Unggulan (E04)
function renderProdukUnggulan(products) {
  const container = document.querySelector("#produk-unggulan");
  if (!container) return;

  const unggulanList = products.filter((p) => p.isUnggulan);
  const cards = unggulanList.map(createProductCard);
  container.replaceChildren(...cards);
}

// Function: Render Tabel Dinamis dari Hasil Fetch (E04)
function renderKatalogTable(products) {
  const tbody = document.querySelector("#tabel-produk-body");
  if (!tbody) return;

  const rows = products.map((produk) => {
    const status = statusStok(produk.stok);
    const badgeUnggulanHTML = produk.isUnggulan
      ? ` <span class="badge badge-unggulan">★ Unggulan</span>`
      : "";

    return `
      <tr class="${produk.isUnggulan ? 'baris-unggulan' : ''}">
        <th scope="row">
          <strong>${produk.nama}</strong>
          ${badgeUnggulanHTML}
        </th>
        <td>${produk.kategori}</td>
        <td>${produk.deskripsi}</td>
        <td><strong>${formatRupiah(produk.harga)}</strong></td>
        <td><span class="badge ${status.badgeClass}">${status.label}</span></td>
      </tr>
    `;
  }).join("");

  tbody.innerHTML = rows;
}

// Function Utama: Load products secara asinkron dari JSON via Fetch API
async function loadProducts(url = DATA_URL) {
  const grid = document.querySelector("#produk-grid");
  const statusEl = document.querySelector("#status-katalog");

  // 1. Tampilkan Loading State
  if (grid) {
    grid.replaceChildren(createLoadingState());
  }
  if (statusEl) {
    statusEl.textContent = "Mengambil data produk dari server...";
  }

  try {
    // 2. Kirim request Fetch
    const response = await fetch(url);

    // 3. Validasi status respons HTTP (response.ok dan response.status)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText || "Gagal mengambil data katalog"}`);
    }

    // 4. Parse respons JSON secara asinkron
    const data = await response.json();

    if (!Array.isArray(data)) {
      throw new Error("Format JSON tidak valid: diharapkan array objek produk.");
    }

    // 5. Simpan dan render data produk (Success State, Ringkasan, Unggulan, Tabel)
    allProducts = data;
    renderRingkasan(allProducts);
    renderProdukUnggulan(allProducts);
    renderKatalogTable(allProducts);
    renderProducts(allProducts, activeCategory);
    console.info(`[P13 Fetch API] Berhasil memuat ${allProducts.length} produk dari "${url}".`);
    return allProducts;
  } catch (error) {
    // 6. Tangani kegagalan (Error State)
    console.error("[P13 Fetch API] Error saat memuat produk:", error.message);
    if (grid) {
      grid.replaceChildren(createErrorState(error.message, () => loadProducts(url)));
    }
    if (statusEl) {
      statusEl.textContent = `Gagal memuat produk: ${error.message}`;
    }
    return null;
  }
}

// Inisialisasi Filter Kategori
function initCategoryFilter() {
  const filterButtons = document.querySelectorAll(".btn-filter");
  if (filterButtons.length === 0) return;

  filterButtons.forEach((btn) => {
    btn.addEventListener("click", (event) => {
      const kategori = event.currentTarget.dataset.filter;
      activeCategory = kategori;

      filterButtons.forEach((b) => b.classList.remove("is-active"));
      event.currentTarget.classList.add("is-active");

      // Render data tersimpan sesuai filter kategori
      renderProducts(allProducts, activeCategory);
    });
  });
}

// Inisialisasi Navigasi Hamburger Responsif
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

// Inisialisasi saat modul dimuat
document.addEventListener("DOMContentLoaded", () => {
  initNavToggle();
  initCategoryFilter();
  loadProducts();
});

// Ekspor fungsi agar dapat diuji atau diimpor di modul lain
export { loadProducts, renderProducts, renderRingkasan, renderProdukUnggulan, renderKatalogTable, DATA_URL };
