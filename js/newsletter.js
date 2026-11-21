document.addEventListener("DOMContentLoaded", () => {
  const STORAGE_KEY = "kopi_kampung_preferensi_v1";

  const newsletterForm = document.querySelector("#newsletterForm");
  const emailInput = document.querySelector("#newsletterEmail");
  const emailError = document.querySelector("#newsletterEmail-error");
  const kategoriSelect = document.querySelector("#preferensiKategori");
  const promoCheckbox = document.querySelector("#langgananPromo");
  const statusBox = document.querySelector("#newsletterStatus");
  const savedContent = document.querySelector("#savedPreferenceContent");
  const hapusBtn = document.querySelector("#hapusPreferensiBtn");

  // Jika halaman tidak memuat form newsletter, hentikan dengan aman (Guard Clause)
  if (!newsletterForm) return;

  function simpanPreferensiKeStorage(data) {
    try {
      const serialized = JSON.stringify(data);
      localStorage.setItem(STORAGE_KEY, serialized);
      console.info("[SlocalStorage] Berhasil menyimpan preferensi:", data);
      return true;
    } catch (error) {
      console.error("[localStorage] Gagal menyimpan preferensi ke localStorage:", error);
      return false;
    }
  }
  
  function bacaPreferensiDariStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;

      const parsed = JSON.parse(raw);
      console.info("[P12 localStorage] Berhasil membaca preferensi tersimpan:", parsed);
      return parsed;
    } catch (error) {
      console.error("[localStorage] Terjadi kesalahan saat membaca/mem-parsing JSON:", error);
      return null;
    }
  }

  function renderTampilanPreferensi(data) {
    if (!savedContent) return;

    if (!data) {
      savedContent.textContent = "Belum ada preferensi yang tersimpan di peramban ini.";
      return;
    }

    const formattedWaktu = data.disimpanPada
      ? new Date(data.disimpanPada).toLocaleString("id-ID", {
          dateStyle: "medium",
          timeStyle: "short"
        })
      : "-";

    savedContent.innerHTML = `
      <strong>Email:</strong> ${data.email}<br />
      <strong>Minat Menu:</strong> ${data.kategoriMinat}<br />
      <strong>Langganan Promo:</strong> ${data.terimaPromo ? "Ya (Aktif)" : "Tidak"}<br />
      <small style="color: var(--color-text-muted);">Tersimpan pada: ${formattedWaktu}</small>
    `;

    // Sinkronkan kembali kontrol form agar sesuai dengan data tersimpan
    if (emailInput) emailInput.value = data.email || "";
    if (kategoriSelect) kategoriSelect.value = data.kategoriMinat || "Semua Menu";
    if (promoCheckbox) promoCheckbox.checked = Boolean(data.terimaPromo);
  }

  function hapusPreferensiDariStorage() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      console.info("[P12 localStorage] Preferensi berhasil dihapus.");
      return true;
    } catch (error) {
      console.error("[P12 localStorage] Gagal menghapus preferensi:", error);
      return false;
    }
  }

  // 1. Inisialisasi: Baca preferensi yang sudah ada saat halaman dimuat
  const dataAwal = bacaPreferensiDariStorage();
  renderTampilanPreferensi(dataAwal);

  // 2. Validasi realtime input email newsletter
  if (emailInput && emailError) {
    emailInput.addEventListener("input", () => {
      if (emailInput.getAttribute("aria-invalid") === "true") {
        if (emailInput.checkValidity()) {
          emailError.textContent = "";
          emailInput.classList.remove("is-invalid");
          emailInput.setAttribute("aria-invalid", "false");
        }
      }
    });

    emailInput.addEventListener("blur", () => {
      if (!emailInput.checkValidity()) {
        emailInput.classList.add("is-invalid");
        emailInput.setAttribute("aria-invalid", "true");
        if (emailInput.validity.valueMissing) {
          emailError.textContent = "Alamat email langganan wajib diisi.";
        } else if (emailInput.validity.typeMismatch) {
          emailError.textContent = "Format email tidak valid (contoh: nama@email.com).";
        }
      } else {
        emailInput.classList.remove("is-invalid");
        emailInput.setAttribute("aria-invalid", "false");
        emailError.textContent = "";
      }
    });
  }

  // 3. Handler Submit Formulir Preferensi / Newsletter
  newsletterForm.addEventListener("submit", (event) => {
    event.preventDefault();

    // Validasi email menggunakan Constraint Validation API
    if (!emailInput.checkValidity()) {
      emailInput.classList.add("is-invalid");
      emailInput.setAttribute("aria-invalid", "true");
      if (emailInput.validity.valueMissing) {
        emailError.textContent = "Alamat email langganan wajib diisi.";
      } else if (emailInput.validity.typeMismatch) {
        emailError.textContent = "Format email tidak valid (contoh: nama@email.com).";
      }

      if (statusBox) {
        statusBox.className = "form-status is-error";
        statusBox.textContent = "Gagal menyimpan: Format email langganan tidak valid.";
      }
      emailInput.focus();
      return;
    }

    // Bersihkan error jika valid
    emailInput.classList.remove("is-invalid");
    emailInput.setAttribute("aria-invalid", "false");
    emailError.textContent = "";

    // Bentuk objek data preferensi non-sensitif
    const dataPreferensi = {
      email: emailInput.value.trim(),
      kategoriMinat: kategoriSelect ? kategoriSelect.value : "Semua Menu",
      terimaPromo: promoCheckbox ? promoCheckbox.checked : false,
      disimpanPada: new Date().toISOString()
    };

    // Simpan ke localStorage dengan JSON.stringify
    const berhasil = simpanPreferensiKeStorage(dataPreferensi);

    if (berhasil) {
      if (statusBox) {
        statusBox.className = "form-status is-success";
        statusBox.textContent = "Preferensi Anda berhasil disimpan ke peramban (localStorage)!";
        statusBox.focus();
      }
      renderTampilanPreferensi(dataPreferensi);
    } else {
      if (statusBox) {
        statusBox.className = "form-status is-error";
        statusBox.textContent = "Terjadi gangguan saat menyimpan ke penyimpanan lokal peramban.";
      }
    }
  });

  // 4. Handler Hapus Preferensi
  if (hapusBtn) {
    hapusBtn.addEventListener("click", () => {
      hapusPreferensiDariStorage();
      renderTampilanPreferensi(null);

      if (newsletterForm) newsletterForm.reset();

      if (statusBox) {
        statusBox.className = "form-status is-success";
        statusBox.textContent = "Preferensi Anda telah dihapus dari penyimpanan peramban.";
      }
    });
  }
});
