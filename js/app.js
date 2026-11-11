// 1. Data Model UMKM Kopi Kampung (Array of Objects)
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

// Variabel pelacak jumlah kartu yang dihapus dalam sesi filter aktif
let jumlahKartuDihapus = 0;

function buatElemenProduk(produk) {
  // Buat elemen pembungkus kartu (<article class="product-card">)
  const card = document.createElement("article");
  card.classList.add("product-card");
  card.dataset.id = String(produk.id);

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

  // Label unggulan
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

  // Footer kartu (harga & status stok)
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

  // Bagian aksi: Latihan manipulasi DOM uji card.remove()
  const actions = document.createElement("div");
  actions.classList.add("product-card-actions");

  const btnHapus = document.createElement("button");
  btnHapus.type = "button";
  btnHapus.classList.add("btn-hapus-kartu");
  btnHapus.textContent = "Hapus Kartu (Latihan DOM)";
  btnHapus.setAttribute("aria-label", `Hapus kartu ${produk.nama} dari tampilan`);

  // Event listener untuk menguji method remove()
  btnHapus.addEventListener("click", () => {
    card.remove(); // Menghapus elemen kartu dari pohon DOM
    jumlahKartuDihapus++;
    console.log(`[DOM remove()] Kartu "${produk.nama}" berhasil dihapus dari tree DOM.`);

    // Perbarui teks status setelah penghapusan elemen
    const sisaKartu = document.querySelectorAll("#produk-grid .product-card");
    const statusEl = document.querySelector("#status-katalog");
    if (statusEl) {
      statusEl.textContent = `Menampilkan ${sisaKartu.length} produk di layar (${jumlahKartuDihapus} kartu dihapus via latihan DOM remove).`;
    }
  });

  actions.append(btnHapus);

  // Susun elemen kartu menggunakan append()
  card.append(header, desc, footer, actions);

  return card;
}

//untuk elemen pesan kategori kosong
function buatEmptyState(kategoriAktif) {
  const emptyBox = document.createElement("div");
  emptyBox.classList.add("empty-state");

  const emptyTitle = document.createElement("p");
  emptyTitle.classList.add("empty-title");
  emptyTitle.textContent = `Tidak ada produk untuk kategori "${kategoriAktif}".`;

  const emptyDesc = document.createElement("p");
  emptyDesc.classList.add("empty-desc");
  emptyDesc.textContent = "Silakan pilih kategori lain atau klik 'Semua' untuk melihat seluruh menu.";

  emptyBox.append(emptyTitle, emptyDesc);
  return emptyBox;
}

//renderProduk(kategoriAktif) dengan querySelector & replaceChildren
function renderProduk(kategoriAktif = "semua") {
  // Reset penghitung kartu yang dihapus saat kategori dirender ulang
  jumlahKartuDihapus = 0;

  
  const grid = document.querySelector("#produk-grid");
  const statusEl = document.querySelector("#status-katalog");

  // Guard clause mencegah error jika dijalankan di halaman tanpa #produk-grid
  if (!grid) return;

  // Filter produk berdasarkan kategori yang dipilih
  const produkTersaring = kategoriAktif === "semua"
    ? daftarProduk
    : daftarProduk.filter((produk) => produk.kategori.toLowerCase() === kategoriAktif.toLowerCase());

  // Perbarui area status produk dengan teks informatif
  if (statusEl) {
    if (kategoriAktif === "semua") {
      statusEl.textContent = `Menampilkan semua produk (${produkTersaring.length} produk)`;
    } else {
      statusEl.textContent = `Kategori "${kategoriAktif}": ${produkTersaring.length} produk ditemukan`;
    }
  }

  // Empty State: Jika kategori tidak memiliki produk
  if (produkTersaring.length === 0) {
    const emptyBox = buatEmptyState(kategoriAktif);
    // replaceChildren membersihkan elemen lama dan menampilkan pesan kosong
    grid.replaceChildren(emptyBox);
    return;
  }

  // Buat array elemen kartu dengan createElement via buatElemenProduk
  const elemenKartu = produkTersaring.map((produk) => buatElemenProduk(produk));

  // replaceChildren menggambar ulang kartu tanpa risiko dobel
  grid.replaceChildren(...elemenKartu);
}

//Inisialisasi Filter Kategori (querySelectorAll, addEventListener, event.currentTarget.dataset.filter)
function initFilterKategori() {
  // Gunakan querySelectorAll untuk daftar tombol filter
  const filterButtons = document.querySelectorAll(".btn-filter");
  if (filterButtons.length === 0) return;

  filterButtons.forEach((btn) => {
    btn.addEventListener("click", (event) => {
      // Ambil nilai kategori secara aman dari data-filter
      const kategori = event.currentTarget.dataset.filter;

      // Kelola kelas tombol aktif menggunakan classList
      filterButtons.forEach((b) => b.classList.remove("is-active"));
      event.currentTarget.classList.add("is-active");

      // Gambar ulang produk sesuai kategori
      renderProduk(kategori);
    });
  });
}

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

function renderKatalogProduk() {
  const tbody = document.querySelector("#tabel-produk-body");
  if (!tbody) return;

  const tabelMarkup = daftarProduk.map(buatBarisTabel).join("");
  tbody.innerHTML = tabelMarkup;
}

function renderKartuProdukDinamis() {
  const container = document.querySelector("#produk-dinamis");
  if (!container) return;

  // Filter hanya produk unggulan untuk beranda
  const produkUnggulan = daftarProduk.filter((produk) => produk.isUnggulan);
  const kartuElemen = produkUnggulan.map((produk) => buatElemenProduk(produk));
  container.replaceChildren(...kartuElemen);
}

//Navigasi Responsif Hamburger Menu 
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

// inisialisasi
renderProduk("semua");
initFilterKategori();
renderKatalogProduk();
renderKartuProdukDinamis();
initNavToggle();