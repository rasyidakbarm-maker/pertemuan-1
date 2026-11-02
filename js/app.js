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


console.group("=== Katalog Data Produk UMKM ===");
console.info("Memuat data produk dalam bentuk tabel terstruktur:");
console.table(daftarProduk);
console.groupEnd();

const formatRupiah = (angka) => `Rp${angka.toLocaleString("id-ID")}`;

function renderKatalogProduk() {
  const tbody = document.querySelector("#tabel-produk-body");


  if (!tbody) {
    console.info("Halaman ini tidak memuat kontainer #tabel-produk-body. Rendering dilewati dengan aman.");
    return;
  }

  let barisTabelHTML = "";

  
  for (let i = 0; i < daftarProduk.length; i++) {
    const produk = daftarProduk[i];

    
    let statusBadgeHTML = "";
    if (produk.stok === 0) {
      statusBadgeHTML = `<span class="badge badge-habis">Habis</span>`;
    } else if (produk.stok <= 5) {
      statusBadgeHTML = `<span class="badge badge-terbatas">Sisa ${produk.stok}</span>`;
    } else {
      statusBadgeHTML = `<span class="badge badge-tersedia">Tersedia (${produk.stok})</span>`;
    }

    const labelUnggulanHTML = produk.isUnggulan
      ? `<span class="badge badge-unggulan">★ Unggulan</span>`
      : "";

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

  tbody.innerHTML = barisTabelHTML;
  console.log(`%c[Sukses] Berhasil merender ${daftarProduk.length} produk ke dalam DOM.`, "color: #2e7d32; font-weight: bold;");
}

function renderKartuProdukDinamis() {
  const container = document.querySelector("#produk-dinamis");
  
  if (!container) return;

  let kartuHTML = "";

  for (let i = 0; i < daftarProduk.length; i++) {
    const produk = daftarProduk[i];

    let statusBadgeHTML = "";
    if (produk.stok === 0) {
      statusBadgeHTML = `<span class="badge badge-habis">Habis</span>`;
    } else if (produk.stok <= 5) {
      statusBadgeHTML = `<span class="badge badge-terbatas">Sisa ${produk.stok}</span>`;
    } else {
      statusBadgeHTML = `<span class="badge badge-tersedia">Tersedia (${produk.stok})</span>`;
    }

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


renderKatalogProduk();
renderKartuProdukDinamis();


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
