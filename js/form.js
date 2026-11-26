/**
 * ========================================================
 * PRAKTIKUM P12: VALIDASI FORMULIR DENGAN CONSTRAINT VALIDATION API
 * ========================================================
 * Fitur-fitur utama:
 * - Validasi formulir menggunakan browser Constraint Validation API (checkValidity, setCustomValidity, reportValidity)
 * - Sinkronisasi pesan gelembung browser dan inline error berbahasa Indonesia yang aksesibel
 * - Penanganan input spasi saja (whitespace only) secara tepat sebagai valueMissing
 * - Dukungan format nomor telepon Indonesia (^(\+62|62|0)[0-9]{9,12}$)
 * - Penanganan aksesibilitas grup radio dengan pengarahan aria-describedby & aria-invalid ke kontainer dan elemen radio
 * - Focus management: Mengarahkan fokus kursor ke input tidak valid pertama berdasarkan posisi DOM
 * - Konsistensi penyimpanan preferensi localStorage dengan key 'kopiKampung_contact_pref' (Skenario 7 & 8)
 * - Penanganan reset formulir yang membersihkan seluruh state error dan storage
 */

document.addEventListener("DOMContentLoaded", () => {
  const STORAGE_KEY = "kopiKampung_contact_pref";

  const contactForm = document.querySelector("#contactForm");
  if (!contactForm) return;

  const formStatus = document.querySelector("#formStatus");
  const previewBox = document.querySelector("#previewBox");

  // Helper localStorage untuk persistensi preferensi formulir
  function simpanPreferensiForm(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      console.info("[P12 localStorage] Preferensi kontak berhasil disimpan dengan key:", STORAGE_KEY);
      return true;
    } catch (err) {
      console.warn("[P12 localStorage] Catatan: Penyimpanan ke localStorage dibatasi atau gagal:", err);
      return false;
    }
  }

  function bacaPreferensiForm() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") return null;
      console.info("[P12 localStorage] Preferensi kontak berhasil dimuat dari key:", STORAGE_KEY);
      return parsed;
    } catch (err) {
      console.warn("[P12 localStorage] Catatan: Data preferensi di storage tidak valid atau rusak, dikembalikan sebagai null.");
      return null;
    }
  }

  function hapusPreferensiForm() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      console.info("[P12 localStorage] Preferensi kontak berhasil dihapus dari key:", STORAGE_KEY);
      return true;
    } catch (err) {
      console.warn("[P12 localStorage] Catatan: Penghapusan dari localStorage dibatasi:", err);
      return false;
    }
  }

  // Pulihkan preferensi tersimpan saat reload halaman (Skenario 7)
  const savedPref = bacaPreferensiForm();
  if (savedPref) {
    if (savedPref.nama && document.querySelector("#nama")) {
      document.querySelector("#nama").value = savedPref.nama;
    }
    if (savedPref.paket && document.querySelector("#paket")) {
      document.querySelector("#paket").value = savedPref.paket;
    }
    if (savedPref.topik) {
      const radioTopik = document.querySelector(`input[name='topik'][value='${savedPref.topik}']`);
      if (radioTopik) radioTopik.checked = true;
    }
    if (savedPref.waktuKontak) {
      const radioWaktu = document.querySelector(`input[name='waktuKontak'][value='${savedPref.waktuKontak}']`);
      if (radioWaktu) radioWaktu.checked = true;
    }
  }

  // Daftar input kontrol berbasis field tunggal
  const singleInputs = [
    {
      id: "nama",
      label: "Nama Lengkap",
      customMessage: (validity) => {
        if (validity.valueMissing) return "Nama Lengkap wajib diisi.";
        if (validity.tooShort) return "Nama Lengkap minimal 3 karakter.";
        if (validity.tooLong) return "Nama Lengkap maksimal 50 karakter.";
        return "Isian Nama Lengkap tidak valid.";
      }
    },
    {
      id: "email",
      label: "Alamat Email",
      customMessage: (validity) => {
        if (validity.valueMissing) return "Alamat Email wajib diisi.";
        if (validity.typeMismatch) return "Format email tidak valid (contoh: nama@email.com).";
        return "Alamat email tidak valid.";
      }
    },
    {
      id: "paket",
      label: "Paket Diminati",
      customMessage: (validity) => {
        if (validity.valueMissing) return "Silakan pilih salah satu paket yang diminati.";
        return "Pilihan paket tidak valid.";
      }
    },
    {
      id: "whatsapp",
      label: "Nomor WhatsApp",
      customMessage: (validity) => {
        if (validity.valueMissing) return "Nomor WhatsApp wajib diisi.";
        if (validity.patternMismatch) return "Nomor WhatsApp tidak valid (harus diawali 08 dan terdiri dari 10-15 digit, contoh: 081234567890).";
        return "Nomor WhatsApp tidak valid.";
      }
    },
    {
      id: "pesan",
      label: "Pesan atau Keterangan",
      customMessage: (validity) => {
        if (validity.valueMissing) return "Pesan atau keterangan wajib diisi.";
        if (validity.tooShort) return "Pesan terlalu singkat (minimal 10 karakter).";
        if (validity.tooLong) return "Pesan terlalu panjang (maksimal 500 karakter).";
        return "Pesan tidak valid.";
      }
    },
    {
      id: "setuju",
      label: "Persetujuan",
      customMessage: (validity) =>
        validity.valueMissing ? "Konfirmasi persetujuan wajib dicentang." : "Persetujuan tidak valid."
    }
  ];

  // Helper: Validasi elemen input tunggal menggunakan Constraint Validation API
  function validateSingleInput(config) {
    const el = document.querySelector(`#${config.id}`);
    const errorEl = document.querySelector(`#${config.id}-error`);
    if (!el || !errorEl) return true;

    const rawVal = el.value || "";
    const val = el.type === "checkbox" ? "" : rawVal.trim();

    let pesanError = "";

    if (el.type === "checkbox") {
      if (el.required && !el.checked) {
        pesanError = config.customMessage({ valueMissing: true });
      }
    } else if (el.tagName === "SELECT") {
      if (el.required && (!el.value || el.value === "")) {
        pesanError = config.customMessage({ valueMissing: true });
      }
    } else {
      // Input text, email, tel, textarea
      if (el.required && val.length === 0) {
        pesanError = config.customMessage({ valueMissing: true });
      } else if (el.minLength > 0 && val.length > 0 && val.length < el.minLength) {
        pesanError = config.customMessage({ tooShort: true });
      } else if (el.maxLength > 0 && val.length > el.maxLength) {
        pesanError = config.customMessage({ tooLong: true });
      } else if (el.type === "email" && el.validity.typeMismatch) {
        pesanError = config.customMessage({ typeMismatch: true });
      } else if (el.pattern && el.validity.patternMismatch) {
        pesanError = config.customMessage({ patternMismatch: true });
      } else if (!el.checkValidity()) {
        pesanError = config.customMessage(el.validity);
      }
    }

    if (pesanError) {
      el.setCustomValidity(pesanError);
      errorEl.textContent = pesanError;
      el.classList.add("is-invalid");
      el.setAttribute("aria-invalid", "true");
      return false;
    } else {
      el.setCustomValidity("");
      errorEl.textContent = "";
      el.classList.remove("is-invalid");
      el.setAttribute("aria-invalid", "false");
      return true;
    }
  }

  // Helper: Validasi grup radio dengan integrasi aksesibilitas pada fieldset dan tiap radio
  function validateRadioGroup(groupName, fieldsetId, errorId, errorMsg) {
    const radios = document.querySelectorAll(`input[name='${groupName}']`);
    const fieldset = document.querySelector(`#${fieldsetId}`);
    const errorEl = document.querySelector(`#${errorId}`);
    if (!fieldset || !errorEl || radios.length === 0) return true;

    const checked = document.querySelector(`input[name='${groupName}']:checked`);

    if (!checked) {
      radios.forEach((r) => {
        r.setCustomValidity(errorMsg);
        r.setAttribute("aria-invalid", "true");
        r.setAttribute("aria-describedby", errorId);
      });
      errorEl.textContent = errorMsg;
      fieldset.classList.add("is-invalid");
      fieldset.setAttribute("aria-invalid", "true");
      fieldset.setAttribute("aria-describedby", errorId);
      return false;
    } else {
      radios.forEach((r) => {
        r.setCustomValidity("");
        r.setAttribute("aria-invalid", "false");
      });
      errorEl.textContent = "";
      fieldset.classList.remove("is-invalid");
      fieldset.setAttribute("aria-invalid", "false");
      return true;
    }
  }

  // Pasang event listener realtime (input, change, blur) agar pesan error reaktif
  singleInputs.forEach((config) => {
    const el = document.querySelector(`#${config.id}`);
    if (!el) return;

    el.addEventListener("blur", () => {
      if (typeof el.value === "string" && el.type !== "checkbox" && el.tagName !== "SELECT") {
        el.value = el.value.trim();
      }
      validateSingleInput(config);
    });

    el.addEventListener("input", () => {
      el.setCustomValidity("");
      if (el.getAttribute("aria-invalid") === "true") {
        validateSingleInput(config);
      }
    });

    if (el.type === "checkbox") {
      el.addEventListener("change", () => {
        el.setCustomValidity("");
        validateSingleInput(config);
      });
    }

    if (el.tagName === "SELECT") {
      el.addEventListener("change", () => {
        el.setCustomValidity("");
        validateSingleInput(config);
      });
    }
  });

  // Event listener realtime untuk radio group (change dan saat fokus berpindah keluar / focusout)
  document.querySelectorAll("input[name='topik']").forEach((radio) => {
    radio.addEventListener("change", () => {
      document.querySelectorAll("input[name='topik']").forEach((r) => r.setCustomValidity(""));
      validateRadioGroup("topik", "fieldsetTopik", "topik-error", "Silakan pilih salah satu topik pertanyaan.");
    });
  });

  const fieldsetTopikEl = document.querySelector("#fieldsetTopik");
  if (fieldsetTopikEl) {
    fieldsetTopikEl.addEventListener("focusout", (e) => {
      if (!fieldsetTopikEl.contains(e.relatedTarget)) {
        validateRadioGroup("topik", "fieldsetTopik", "topik-error", "Silakan pilih salah satu topik pertanyaan.");
      }
    });
  }

  document.querySelectorAll("input[name='waktuKontak']").forEach((radio) => {
    radio.addEventListener("change", () => {
      document.querySelectorAll("input[name='waktuKontak']").forEach((r) => r.setCustomValidity(""));
      validateRadioGroup("waktuKontak", "fieldsetWaktu", "waktuKontak-error", "Silakan pilih salah satu preferensi waktu kontak.");
    });
  });

  const fieldsetWaktuEl = document.querySelector("#fieldsetWaktu");
  if (fieldsetWaktuEl) {
    fieldsetWaktuEl.addEventListener("focusout", (e) => {
      if (!fieldsetWaktuEl.contains(e.relatedTarget)) {
        validateRadioGroup("waktuKontak", "fieldsetWaktu", "waktuKontak-error", "Silakan pilih salah satu preferensi waktu kontak.");
      }
    });
  }

  // Handler Submit Formulir Kontak
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    // Auto-trim input teks saat submit agar spasi di ujung terhapus bersih
    singleInputs.forEach((config) => {
      const el = document.querySelector(`#${config.id}`);
      if (el && typeof el.value === "string" && el.type !== "checkbox" && el.tagName !== "SELECT") {
        el.value = el.value.trim();
      }
    });

    let isFormValid = true;
    const invalidElements = [];

    // 1. Validasi setiap field tunggal
    singleInputs.forEach((config) => {
      const isValid = validateSingleInput(config);
      if (!isValid) {
        isFormValid = false;
        const targetEl = document.querySelector(`#${config.id}`);
        if (targetEl) invalidElements.push(targetEl);
      }
    });

    // 2. Validasi grup radio topik
    const isTopikValid = validateRadioGroup(
      "topik",
      "fieldsetTopik",
      "topik-error",
      "Silakan pilih salah satu topik pertanyaan."
    );
    if (!isTopikValid) {
      isFormValid = false;
      const targetRadio = document.querySelector("input[name='topik']");
      if (targetRadio) invalidElements.push(targetRadio);
    }

    // 3. Validasi grup radio waktu kontak
    const isWaktuValid = validateRadioGroup(
      "waktuKontak",
      "fieldsetWaktu",
      "waktuKontak-error",
      "Silakan pilih salah satu preferensi waktu kontak."
    );
    if (!isWaktuValid) {
      isFormValid = false;
      const targetRadio = document.querySelector("input[name='waktuKontak']");
      if (targetRadio) invalidElements.push(targetRadio);
    }

    // Mengurutkan elemen invalid sesuai urutan posisi DOM dalam dokumen
    invalidElements.sort((a, b) =>
      a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1
    );
    const firstInvalidElement = invalidElements[0] || null;

    // FOCUS MANAGEMENT & reportValidity()
    if (!isFormValid) {
      if (formStatus) {
        formStatus.className = "form-status is-error";
        formStatus.textContent = "Mohon periksa kembali formulir Anda. Beberapa kolom belum terisi dengan benar.";
      }
      if (firstInvalidElement) {
        firstInvalidElement.focus();
        if (typeof firstInvalidElement.reportValidity === "function") {
          firstInvalidElement.reportValidity();
        }
      }
      if (previewBox) {
        previewBox.style.display = "none";
      }
      return;
    }

    // JIKA FORMULIR VALID: Tampilkan status sukses & data ringkasan ke Preview
    if (formStatus) {
      formStatus.className = "form-status is-success";
      formStatus.textContent = "Pesan Anda berhasil dikirim! Tim Kopi Kampung akan segera menghubungi Anda.";
      formStatus.focus();
    }

    const nama = document.querySelector("#nama").value;
    const email = document.querySelector("#email").value;
    const paket = document.querySelector("#paket").value;
    const topik = document.querySelector("input[name='topik']:checked").value;
    const whatsapp = document.querySelector("#whatsapp").value;
    const waktu = document.querySelector("input[name='waktuKontak']:checked").value;
    const pesan = document.querySelector("#pesan").value;

    document.querySelector("#previewNama").textContent = nama;
    document.querySelector("#previewEmail").textContent = email;
    document.querySelector("#previewPaket").textContent = paket;
    document.querySelector("#previewTopik").textContent = topik;
    document.querySelector("#previewWhatsapp").textContent = whatsapp;
    document.querySelector("#previewWaktu").textContent = waktu;
    document.querySelector("#previewPesan").textContent = pesan;

    if (previewBox) {
      previewBox.style.display = "block";
    }

    // Simpan preferensi non-sensitif ke localStorage secara konsisten (Skenario 7 & 8)
    simpanPreferensiForm({
      nama,
      paket,
      topik,
      waktuKontak: waktu,
      disimpanPada: new Date().toISOString()
    });

    console.info("[P12] Formulir kontak berhasil divalidasi dan dikirim.");
  });

  // Handler Reset Formulir: Bersihkan semua status error, sembunyikan preview, dan hapus storage
  contactForm.addEventListener("reset", () => {
    // Bersihkan pesan error dan atribut aria-invalid
    singleInputs.forEach((config) => {
      const el = document.querySelector(`#${config.id}`);
      const errorEl = document.querySelector(`#${config.id}-error`);
      if (el) {
        el.classList.remove("is-invalid");
        el.removeAttribute("aria-invalid");
        el.setCustomValidity("");
      }
      if (errorEl) {
        errorEl.textContent = "";
      }
    });

    const radiosTopik = document.querySelectorAll("input[name='topik']");
    radiosTopik.forEach((r) => r.setCustomValidity(""));
    const fieldsetTopik = document.querySelector("#fieldsetTopik");
    const topikError = document.querySelector("#topik-error");
    if (fieldsetTopik) fieldsetTopik.classList.remove("is-invalid");
    if (topikError) topikError.textContent = "";

    const radiosWaktu = document.querySelectorAll("input[name='waktuKontak']");
    radiosWaktu.forEach((r) => r.setCustomValidity(""));
    const fieldsetWaktu = document.querySelector("#fieldsetWaktu");
    const waktuError = document.querySelector("#waktuKontak-error");
    if (fieldsetWaktu) fieldsetWaktu.classList.remove("is-invalid");
    if (waktuError) waktuError.textContent = "";

    if (formStatus) {
      formStatus.className = "form-status";
      formStatus.textContent = "";
    }

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

    // Hapus data preferensi dari localStorage (Skenario 8)
    hapusPreferensiForm();

    console.info("[P12] Formulir kontak direset ke kondisi awal.");
  });
});
