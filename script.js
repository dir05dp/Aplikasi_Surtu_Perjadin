// File: script.js

// ========================================================
// 1. IMPORT FIREBASE (Menghubungkan ke Server Google Cloud)
// ========================================================
const firebaseConfig = {
    apiKey: "AIzaSyCe3rPcr16z_fn8PI26PmVTtcVLn_UR6nI",
    authDomain: "surat-tugas-pjn3.firebaseapp.com",
    databaseURL: "https://surat-tugas-pjn3-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "surat-tugas-pjn3",
    storageBucket: "surat-tugas-pjn3.firebasestorage.app",
    messagingSenderId: "102517467930",
    appId: "1:102517467930:web:f3e6b6e3a28a5ce8509aa3",
    measurementId: "G-K7M71P318Z"
};

let db = null;
try {
    if (typeof firebase !== "undefined") {
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
        db = firebase.database();
    }
} catch (err) {
    console.warn("Menggunakan fallback REST API Firebase:", err);
}

// Helper kompatibilitas ref, get, set, remove (mendukung Firebase SDK & REST API)
function ref(dbInstance, path) {
    return String(path || "").replace(/^\/+|\/+$/g, "");
}

async function get(pathStr) {
    if (db && typeof db.ref === "function") {
        const snap = await db.ref(pathStr).once("value");
        return {
            exists: () => snap.exists(),
            val: () => snap.val()
        };
    }
    const url = `${firebaseConfig.databaseURL.replace(/\/+$/, "")}/${pathStr}.json`;
    const res = await fetch(url);
    const data = res.ok ? await res.json() : null;
    return {
        exists: () => data !== null && data !== undefined,
        val: () => data
    };
}

async function set(pathStr, value) {
    if (db && typeof db.ref === "function") {
        return await db.ref(pathStr).set(value);
    }
    const url = `${firebaseConfig.databaseURL.replace(/\/+$/, "")}/${pathStr}.json`;
    await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(value)
    });
}

async function remove(pathStr) {
    if (db && typeof db.ref === "function") {
        return await db.ref(pathStr).remove();
    }
    const url = `${firebaseConfig.databaseURL.replace(/\/+$/, "")}/${pathStr}.json`;
    await fetch(url, { method: "DELETE" });
}

// ========================================================
// HELPER DIALOG MODERN (PENGGANTI ALERT / CONFIRM / PROMPT)
// ========================================================
function showUiDialog({ title = "Informasi", message = "", mode = "alert", okText = "OK", cancelText = "Batal" }) {
    return new Promise((resolve) => {
        const modal = document.getElementById('uiDialogModal');
        const titleEl = document.getElementById('uiDialogTitle');
        const msgEl = document.getElementById('uiDialogMessage');
        const inputWrap = document.getElementById('uiDialogInputWrap');
        const inputEl = document.getElementById('uiDialogInput');
        const okBtn = document.getElementById('uiDialogOkBtn');
        const cancelBtn = document.getElementById('uiDialogCancelBtn');

        if (!modal) {
            resolve(mode === "prompt" ? null : false);
            return;
        }

        titleEl.innerText = title;
        msgEl.innerText = message;
        okBtn.innerText = okText;
        cancelBtn.innerText = cancelText;

        if (mode === "prompt") {
            inputWrap.style.display = "block";
            inputEl.value = "";
            cancelBtn.style.display = "inline-block";
        } else if (mode === "confirm") {
            inputWrap.style.display = "none";
            cancelBtn.style.display = "inline-block";
        } else {
            inputWrap.style.display = "none";
            cancelBtn.style.display = "none";
        }

        modal.style.display = "block";
        if (mode === "prompt") {
            setTimeout(() => inputEl.focus(), 40);
        } else {
            setTimeout(() => okBtn.focus(), 40);
        }

        function cleanup() {
            modal.style.display = "none";
            okBtn.onclick = null;
            cancelBtn.onclick = null;
            inputEl.onkeydown = null;
        }

        okBtn.onclick = () => {
            const val = inputEl.value;
            cleanup();
            if (mode === "prompt") resolve(val);
            else resolve(true);
        };

        cancelBtn.onclick = () => {
            cleanup();
            if (mode === "prompt") resolve(null);
            else resolve(false);
        };

        inputEl.onkeydown = (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                okBtn.click();
            } else if (e.key === "Escape") {
                e.preventDefault();
                cancelBtn.click();
            }
        };
    });
}

function uiAlert(message, title = "Informasi") {
    return showUiDialog({ title, message, mode: "alert", okText: "OK" });
}

function uiConfirm(message, title = "Konfirmasi") {
    return showUiDialog({ title, message, mode: "confirm", okText: "Ya, Lanjutkan", cancelText: "Batal" });
}

function uiPromptPassword(message, title = "Otorisasi Keamanan") {
    return showUiDialog({ title, message, mode: "prompt", okText: "Konfirmasi", cancelText: "Batal" });
}

// ========================================================
// HELPER FORMAT TANGGAL DATEPICKER & TERBILANG HARI
// ========================================================
const NAMA_BULAN_INDO = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

function angkaKeKataKecil(n) {
    n = Math.floor(Math.abs(Number(n) || 0));
    const satuan = [
        "", "satu", "dua", "tiga", "empat", "lima",
        "enam", "tujuh", "delapan", "sembilan", "sepuluh", "sebelas"
    ];
    if (n === 0) return "nol";
    if (n < 12) return satuan[n];
    if (n < 20) return angkaKeKataKecil(n - 10) + " belas";
    if (n < 100) {
        const puluh = Math.floor(n / 10);
        const sisa = n % 10;
        return angkaKeKataKecil(puluh) + " puluh" + (sisa > 0 ? " " + angkaKeKataKecil(sisa) : "");
    }
    if (n < 200) {
        return "seratus" + (n - 100 > 0 ? " " + angkaKeKataKecil(n - 100) : "");
    }
    return String(n);
}

function isoToTanggalIndo(isoDateStr, stripLeadingZero = false) {
    if (!isoDateStr) return "... ...... .....";
    const match = String(isoDateStr).trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) return isoDateStr;
    const tahun = match[1];
    const idxBulan = parseInt(match[2], 10) - 1;
    const hari = stripLeadingZero ? String(parseInt(match[3], 10)) : match[3];
    return `${hari} ${NAMA_BULAN_INDO[idxBulan] || ""} ${tahun}`;
}

function tanggalIndoToIso(indoStr) {
    if (!indoStr) return "";
    const clean = String(indoStr).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) return clean;
    const parts = clean.split(/\s+/);
    if (parts.length >= 3) {
        const dayNum = parseInt(parts[0], 10);
        const mIdx = NAMA_BULAN_INDO.findIndex(b => b.toLowerCase() === parts[1].toLowerCase());
        const year = parts[2];
        if (!isNaN(dayNum) && mIdx >= 0 && /^\d{4}$/.test(year)) {
            return `${year}-${String(mIdx + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
        }
    }
    return "";
}

function hitungHariInklusif(isoMulai, isoSelesai) {
    const m1 = String(isoMulai || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
    const m2 = String(isoSelesai || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m1 || !m2) return 1;
    const d1 = Date.UTC(parseInt(m1[1], 10), parseInt(m1[2], 10) - 1, parseInt(m1[3], 10));
    const d2 = Date.UTC(parseInt(m2[1], 10), parseInt(m2[2], 10) - 1, parseInt(m2[3], 10));
    const diff = Math.round((d2 - d1) / (1000 * 60 * 60 * 24)) + 1;
    return diff > 0 ? diff : 1;
}

window.handleDatePickerChange = function(isoValue) {
    const hiddenTanggal = document.getElementById('in-tanggal');
    const formatted = isoValue ? isoToTanggalIndo(isoValue, true) : "... ...... .....";
    if (hiddenTanggal) hiddenTanggal.value = formatted;
    window.updatePreview();
};

function syncDatePickerFromTanggalValue(tanggalVal) {
    const pickerEl = document.getElementById('in-tanggal-picker');
    const hiddenTanggal = document.getElementById('in-tanggal');
    const iso = tanggalIndoToIso(tanggalVal);

    if (pickerEl) pickerEl.value = iso;
    const displayStr = iso ? isoToTanggalIndo(iso, true) : (tanggalVal || "... ...... .....");
    if (hiddenTanggal) hiddenTanggal.value = displayStr;
}

window.handlePeriodeChange = function() {
    const mulaiEl = document.getElementById('in-periode-mulai');
    const selesaiEl = document.getElementById('in-periode-selesai');
    const hiddenUntuk2 = document.getElementById('in-untuk-2');
    if (!mulaiEl || !selesaiEl || !hiddenUntuk2) return;

    const isoMulai = mulaiEl.value;
    let isoSelesai = selesaiEl.value;

    if (isoMulai && isoSelesai && isoSelesai < isoMulai) {
        isoSelesai = isoMulai;
        selesaiEl.value = isoSelesai;
    }

    if (isoMulai && isoSelesai) {
        const tglMulaiStr = isoToTanggalIndo(isoMulai, true);
        const tglSelesaiStr = isoToTanggalIndo(isoSelesai, true);
        const jmlHari = hitungHariInklusif(isoMulai, isoSelesai);
        const kataHari = angkaKeKataKecil(jmlHari);
        hiddenUntuk2.value = `Periode Perjalanan Dinas ${tglMulaiStr} s/d ${tglSelesaiStr} ${jmlHari} (${kataHari}) hari.`;
    }
    window.updatePreview();
};

function syncPeriodeFromUntuk2Value(untuk2Text) {
    const mulaiEl = document.getElementById('in-periode-mulai');
    const selesaiEl = document.getElementById('in-periode-selesai');
    const hiddenUntuk2 = document.getElementById('in-untuk-2');
    if (hiddenUntuk2) hiddenUntuk2.value = untuk2Text || "";

    if (!untuk2Text || !mulaiEl || !selesaiEl) return;
    const extracted = extractDatesFromSuratTugas({ untuk2: untuk2Text });
    if (extracted && extracted.isoMulai && extracted.isoSelesai) {
        mulaiEl.value = extracted.isoMulai;
        selesaiEl.value = extracted.isoSelesai;
        window.handlePeriodeChange();
    }
}

// (Proteksi Anti-Intip ditangani secara terpusat)

// ========================================================
// 3. LOGIKA GEMBOK FORM (MODE BACA & EDIT)
// ========================================================
window.isFormLocked = true; // Default terkunci

window.toggleLock = async function() {
    if (window.isFormLocked) {
        const sandi = await uiPromptPassword("🔒 Masukkan Sandi Rahasia untuk mengedit form:", "Buka Kunci Form");
        if (sandi === "pjn3") {
            window.isFormLocked = false;
            window.applyStLockState();
        } else if (sandi !== null) {
            await uiAlert("❌ Sandi Salah!", "Akses Ditolak");
        }
    } else {
        window.isFormLocked = true;
        window.applyStLockState();
    }
};

window.applyStLockState = function() {
    const btnLock = document.getElementById('btn-lock');
    if (btnLock) {
        if (window.isFormLocked) {
            btnLock.innerHTML = "🔒 Mode Baca: Form Terkunci (Klik Buka Edit)";
            btnLock.style.background = "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)";
        } else {
            btnLock.innerHTML = "🔓 Mode Edit: Form Terbuka (Klik Kunci Kembali)";
            btnLock.style.background = "linear-gradient(135deg, #16a34a 0%, #15803d 100%)";
        }
    }

    const inputs = ['in-nomor', 'in-menimbang', 'in-dasar', 'in-untuk-1', 'in-untuk-3', 'in-untuk-4', 'in-untuk-5', 'in-tempat', 'in-ttd-jabatan', 'in-ttd-nama'];
    inputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.readOnly = window.isFormLocked;
            el.style.backgroundColor = window.isFormLocked ? "#f1f5f9" : "#ffffff";
            el.style.cursor = window.isFormLocked ? "not-allowed" : "text";
        }
    });

    const datePickers = ['in-tanggal-picker', 'in-periode-mulai', 'in-periode-selesai'];
    datePickers.forEach(id => {
        const dp = document.getElementById(id);
        if (dp) {
            dp.disabled = window.isFormLocked;
            dp.style.backgroundColor = window.isFormLocked ? "#f1f5f9" : "#ffffff";
            dp.style.cursor = window.isFormLocked ? "not-allowed" : "pointer";
        }
    });

    const btnAdd = document.querySelector('.btn-add');
    if (btnAdd) {
        btnAdd.disabled = window.isFormLocked;
        btnAdd.style.opacity = window.isFormLocked ? "0.5" : "1";
        btnAdd.style.cursor = window.isFormLocked ? "not-allowed" : "pointer";
    }

    window.renderPegawaiForms();
}


// ========================================================
// 4. LOGIKA APLIKASI CLOUD (SIMPAN, LOAD, HAPUS)
// ========================================================
let pegawaiData = [];

window.closeModal = function(modalId) { const modal = document.getElementById(modalId); if(modal) modal.style.display = "none"; }
window.onclick = function(event) { if (event.target.classList.contains('modal') && event.target.id === 'historyModal') { event.target.style.display = "none"; } }
window.openHistoryModal = function() { window.renderSavedList(); document.getElementById('historyModal').style.display = "block"; }

function getThreeWordsUntuk(text) {
    const cleaned = String(text || "")
        .replace(/\s+/g, " ")
        .replace(/^\.\.\.\s*/, "")
        .trim();
    if (!cleaned || cleaned === "...") return "";
    return cleaned.split(" ").slice(0, 3).join(" ");
}

function getTrailingSuratNumber(surat) {
    const nomorStr = String(surat.nomor || surat.namaFile || "").trim();
    // Cari angka yang berada di belakang kalimat setelah tanda / (misal .../2026/34 atau .../0034)
    const afterSlashMatch = nomorStr.match(/\/\s*(\d+)\s*$/);
    if (afterSlashMatch) {
        return parseInt(afterSlashMatch[1], 10);
    }
    // Fallback: ambil grup angka terakhir pada nomor surat
    const allNums = nomorStr.match(/(\d+)/g);
    if (allNums && allNums.length > 0) {
        return parseInt(allNums[allNums.length - 1], 10);
    }
    return -1;
}

window.renderSavedList = async function() {
    const container = document.getElementById('saved-list');
    if(!container) return;
    container.innerHTML = '<p style="text-align:center; color:#0284c7; margin-top:20px; font-weight:bold;">⏳ Menghubungkan ke Server...</p>';
    
    try {
        const snapshot = await get(ref(db, 'suratTugas'));
        if (!snapshot.exists()) {
            container.innerHTML = '<p style="text-align:center; color:#64748b; margin-top:20px;">Belum ada surat yang disimpan.</p>';
            return;
        }

        const allData = snapshot.val();
        const dataArray = Object.keys(allData).map(key => ({ idCloud: key, ...allData[key] }));

        // Urutkan berdasarkan nomor angka paling besar yang berada di belakang setelah tanda / (paling besar tampil paling atas)
        dataArray.sort((a, b) => {
            const numA = getTrailingSuratNumber(a);
            const numB = getTrailingSuratNumber(b);
            if (numB !== numA) return numB - numA;
            return Number(b.idCloud || 0) - Number(a.idCloud || 0);
        });

        container.innerHTML = '';
        dataArray.forEach((surat) => {
            const nomorDisplay = (surat.nomor || "").trim() || (surat.namaFile || "Surat Tanpa Nama").replace(/^ST\s*-\s*/i, "");
            const tigaKataUntuk = getThreeWordsUntuk(surat.untuk1);
            const barisanAtas = tigaKataUntuk
                ? `ST - ${nomorDisplay} - ${tigaKataUntuk}`
                : `ST - ${nomorDisplay}`;

            const namaPegawaiPertama =
                (Array.isArray(surat.pegawai) && surat.pegawai.length > 0 && surat.pegawai[0]?.nama)
                    ? surat.pegawai[0].nama
                    : "-";

            const periodeRingkas = String(surat.untuk2 || "-")
                .replace(/^Periode\s+Perjalanan\s+Dinas\s+/i, "")
                .trim() || "-";

            container.innerHTML += `
                <div class="list-item">
                    <div class="list-item-info" style="padding-right: 10px;">
                        <div class="list-item-title">☁️ ${barisanAtas}</div>
                        <div class="list-item-sub" style="color:#1e293b; font-weight:600; margin-top:2px;">- ${namaPegawaiPertama} - ${periodeRingkas}</div>
                    </div>
                    <div style="flex-shrink: 0;">
                        <button class="btn-small btn-load" onclick="loadData('${surat.idCloud}')">📂 Buka</button>
                        <button class="btn-small btn-del" onclick="deleteData('${surat.idCloud}')">🗑️ Hapus</button>
                    </div>
                </div>
            `;
        });
    } catch (error) {
        container.innerHTML = '<p style="text-align:center; color:#dc2626; margin-top:20px;">Gagal terhubung ke server. Pastikan internet aktif.</p>';
    }
}

window.saveData = async function() {
    const nomorEl = document.getElementById('in-nomor');
    if(!nomorEl) return;
    
    const nomorSurat = nomorEl.value.trim();
    if (nomorSurat === "") { await uiAlert("Nomor surat tidak boleh kosong!", "Peringatan"); return; }

    const btnSave = document.querySelector('.btn-save');
    const oldText = btnSave.innerText;
    btnSave.innerText = "⏳ Mengunggah ke Cloud...";
    btnSave.disabled = true;
    btnSave.style.background = "#64748b";

    try {
        const getVal = (id) => { const el = document.getElementById(id); return el ? el.value : ""; };
        const tigaKata = getThreeWordsUntuk(getVal('in-untuk-1'));
        const namaFileSurat = tigaKata ? ("ST - " + nomorSurat + " - " + tigaKata) : ("ST - " + nomorSurat); 
        const snapshot = await get(ref(db, 'suratTugas'));
        let existingId = null;
        if(snapshot.exists()){
            const allData = snapshot.val();
            for(let key in allData){
                if(allData[key].nomor === nomorSurat){ existingId = key; break; }
            }
        }

        
        const newData = {
            namaFile: namaFileSurat,
            waktuSimpan: new Date().toLocaleString('id-ID'),
            nomor: nomorSurat,
            menimbang: getVal('in-menimbang'),
            dasar: getVal('in-dasar'),
            untuk1: getVal('in-untuk-1'), untuk2: getVal('in-untuk-2'), untuk3: getVal('in-untuk-3'), untuk4: getVal('in-untuk-4'), untuk5: getVal('in-untuk-5'),
            periodeMulaiIso: getVal('in-periode-mulai'),
            periodeSelesaiIso: getVal('in-periode-selesai'),
            tempat: getVal('in-tempat') || "Makassar",
            tanggal: getVal('in-tanggal'),
            ttdJabatan: getVal('in-ttd-jabatan') || "Kepala Satuan Kerja PJN Wilayah III\nProv. Sulawesi Selatan",
            ttdNama: getVal('in-ttd-nama'),
            pegawai: JSON.parse(JSON.stringify(pegawaiData))
        };

        const targetId = existingId ? existingId : Date.now().toString();
        // Simpan ke local cache agar selalu instan
        saveLocalSuratTugasRecord(targetId, newData);
        await set(ref(db, 'suratTugas/' + targetId), newData);
        // Sinkronkan juga ke Cloud Utama jika URL diset
        syncSuratTugasToPrimaryCloud(targetId, newData);
        await refreshSpdNoSptDropdown(nomorSurat);

        if (existingId) { await uiAlert("🔄 Data berhasil diperbarui (Ditimpa)!", "Berhasil Diperbarui"); } 
        else { await uiAlert("✅ Surat Tugas Baru berhasil disimpan!", "Berhasil Disimpan"); }

        const modal = document.getElementById('historyModal');
        if (modal && modal.style.display === "block") { window.renderSavedList(); }
    } catch (error) {
        await uiAlert("Terjadi kesalahan saat mengunggah ke server: " + error.message, "Gagal Menyimpan");
    } finally {
        btnSave.innerText = oldText;
        btnSave.disabled = false;
        btnSave.style.background = "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)";
    }
}

window.loadData = async function(idCloud) {
    const confirmLoad = await uiConfirm("Perhatian: Memuat surat ini akan menggantikan form di layar. Lanjutkan?", "Muat Surat Tugas");
    if(!confirmLoad) return;
    try {
        const snapshot = await get(ref(db, 'suratTugas/' + idCloud));
        if (snapshot.exists()) {
            const dataToLoad = snapshot.val();
            const setVal = (id, val) => { const el = document.getElementById(id); if(el) el.value = val || ""; };

            setVal('in-nomor', dataToLoad.nomor); setVal('in-menimbang', dataToLoad.menimbang); setVal('in-dasar', dataToLoad.dasar);
            
            if (dataToLoad.untuk1 !== undefined) {
                setVal('in-untuk-1', dataToLoad.untuk1);
                if (dataToLoad.periodeMulaiIso && dataToLoad.periodeSelesaiIso) {
                    setVal('in-periode-mulai', dataToLoad.periodeMulaiIso);
                    setVal('in-periode-selesai', dataToLoad.periodeSelesaiIso);
                    window.handlePeriodeChange();
                } else {
                    syncPeriodeFromUntuk2Value(dataToLoad.untuk2);
                }
                setVal('in-untuk-3', dataToLoad.untuk3);
                setVal('in-untuk-4', dataToLoad.untuk4);
                setVal('in-untuk-5', dataToLoad.untuk5);
            }

            setVal('in-tempat', dataToLoad.tempat || "Makassar");
            syncDatePickerFromTanggalValue(dataToLoad.tanggal);
            setVal('in-ttd-jabatan', dataToLoad.ttdJabatan || "Kepala Satuan Kerja PJN Wilayah III\nProv. Sulawesi Selatan");
            setVal('in-ttd-nama', dataToLoad.ttdNama);
            
            if(dataToLoad.pegawai) { pegawaiData = JSON.parse(JSON.stringify(dataToLoad.pegawai)); }
            
            window.renderPegawaiForms(); 
            window.updatePreview();      
            window.closeModal('historyModal'); 
        } else {
            await uiAlert("⚠️ Surat tidak ditemukan di server.", "Tidak Ditemukan");
        }
    } catch (error) {
        await uiAlert("Gagal mengunduh data dari server: " + error.message, "Gagal Memuat");
    }
}

window.deleteData = async function(idCloud) {
    const sandi = await uiPromptPassword("🔒 Masukkan Sandi Administrator untuk menghapus riwayat:", "Hapus Riwayat Surat");
    if (sandi !== "delete") { 
        if(sandi !== null) await uiAlert("❌ Sandi Salah! Hanya admin yang boleh menghapus data.", "Akses Ditolak");
        return; 
    }
    const confirmDelete = await uiConfirm("⚠️ PERINGATAN: Menghapus data ini akan menghapusnya secara PERMANEN! Yakin?", "Konfirmasi Hapus Permanen");
    if(!confirmDelete) return;
    try {
        await remove(ref(db, 'suratTugas/' + idCloud));
        deleteLocalSuratTugasRecord(idCloud);
        await refreshSpdNoSptDropdown();
        window.renderSavedList(); 
    } catch (error) {
        await uiAlert("Gagal menghapus data dari server!", "Gagal Menghapus");
    }
}

// ========================================================
// 5. LOGIKA FORM PEGAWAI & RENDER PRATINJAU KERTAS
// ========================================================

window.renderPegawaiForms = function() {
    const container = document.getElementById('pegawai-container');
    if(!container) return;
    container.innerHTML = '';
    
    const disabledAttr = window.isFormLocked ? 'disabled' : '';
    const btnStyle = window.isFormLocked ? 'display:none;' : '';
    const selectStyle = window.isFormLocked ? 'cursor:not-allowed; opacity:0.75; background:#f1f5f9;' : 'cursor:pointer; opacity:1; background:#fefce8;';

    pegawaiData.forEach((pegawai, index) => {
        let optionsHTML = '<option value="">-- Pilih Pegawai --</option>';
        (databasePegawai.length ? databasePegawai : dbPegawai).forEach(p => {
            let selected = (p.nama === pegawai.nama) ? 'selected' : '';
            optionsHTML += `<option value="${p.nama}" ${selected}>${p.nama}</option>`;
        });

        container.innerHTML += `
            <div class="pegawai-item">
                <button type="button" class="remove-btn" style="${btnStyle}" onclick="removePegawai(${index})">Hapus</button>
                <strong style="font-size: 13px; color: #162a5c;">Pegawai ${index + 1}</strong>
                <select ${disabledAttr} onchange="updatePegawaiData(${index}, 'nama', this.value)" style="margin-top: 6px; width: 100%; padding: 7px 9px; border: 1px solid #eab308; border-radius: 6px; font-weight: 700; outline: none; font-size: 13.5px; font-family: inherit; color: #0f172a; ${selectStyle}">
                    ${optionsHTML}
                </select>
            </div>
        `;
    });
    window.updatePreview();
}

window.addPegawaiForm = function() { pegawaiData.push({ nama: "", nip: "", jabatan: "" }); window.renderPegawaiForms(); }
window.removePegawai = function(index) { pegawaiData.splice(index, 1); window.renderPegawaiForms(); }

window.updatePegawaiData = function(index, field, value) {
    pegawaiData[index][field] = value;
    if (field === 'nama') {
        const found = (databasePegawai.length ? databasePegawai : dbPegawai).find(p => p.nama === value);
        if (found) {
            pegawaiData[index].nip = found.nip;
            pegawaiData[index].jabatan = found.jabatan;
        } else {
            pegawaiData[index].nip = "";
            pegawaiData[index].jabatan = "";
        }
    }
    window.updatePreview();
}

function formatListIndent(text) {
    if(!text) return '';
    const lines = text.split('\n');
    let html = '';
    lines.forEach(line => {
        if (!line.trim()) { html += '<div style="height: 5px;"></div>'; return; }
        const match = line.match(/^([a-zA-Z0-9]+[\.\)])\s+(.*)/);
        if (match) {
            html += `<div style="display: flex; margin-bottom: 0; text-align: justify; line-height: 1.15;">
                        <div style="width: 18px; flex-shrink: 0;">${match[1]}</div>
                        <div style="flex-grow: 1;">${match[2]}</div>
                     </div>`;
        } else {
            html += `<div style="margin-bottom: 0; text-align: justify; line-height: 1.15;">${line}</div>`;
        }
    });
    return html;
}

function formatNIP(nip) {
    if (!nip) return "";
    let nipStr = String(nip).trim();
    if (nipStr === "#N/A" || nipStr === "-" || nipStr.toLowerCase() === "nan") return nipStr;
    if (nipStr.toUpperCase().startsWith("NIP")) return nipStr;
    return "NIP " + nipStr;
}


// ========================================================
// 6. FUNGSI SMART SPACER (PENDORONG LOGO KAN)
// ========================================================
window.adjustPageHeight = function() {
    const konten = document.querySelector('.konten-utama');
    const spacer = document.getElementById('spacer');
    const footer = document.querySelector('.footer-kan');
    
    if(!konten || !spacer || !footer) return;
    
    // 1. Reset spacer untuk mengukur tinggi asli teks saat ini
    spacer.style.height = '0px';
    
    // 2. Mencari nilai pixel yang akurat untuk 1 mm di monitor Anda
    const mmRef = document.createElement('div');
    mmRef.style.height = '100mm';
    mmRef.style.position = 'absolute';
    document.body.appendChild(mmRef);
    const pxPerMm = mmRef.getBoundingClientRect().height / 100;
    document.body.removeChild(mmRef);
    
    // 3. Menghitung Ruang Cetak Bersih (Kertas A4 297mm - Margin Atas 15mm - Margin Bawah 12mm)
    // Sisa tinggi bersih per halaman adalah 270mm
    const pageHeightPx = 270 * pxPerMm;
    
    // 4. Ukur total tinggi teks dan logo saat ini
    const totalNaturalHeight = konten.getBoundingClientRect().height + footer.getBoundingClientRect().height;
    
    // 5. Cari sisa ruang di halaman terakhir
    const remainder = totalNaturalHeight % pageHeightPx;
    
    // 6. Ciptakan balok transparan sebesar sisa ruang untuk menekan logo ke batas terbawah
    if (remainder > 0) {
        let fillSpace = pageHeightPx - remainder;
        // Kurangi 2px sebagai toleransi aman agar mesin print tidak panik
        spacer.style.height = (fillSpace - 2) + 'px'; 
    }
}

// ========================================================
// 7. RENDER PREVIEW AKHIR
// ========================================================
window.updatePreview = function() {
    const getVal = (id) => { const el = document.getElementById(id); return el ? el.value : ""; };
    const setHtml = (id, html) => { const el = document.getElementById(id); if(el) el.innerHTML = html; };
    const setText = (id, text) => { const el = document.getElementById(id); if(el) el.innerText = text; };

    setText('out-nomor', getVal('in-nomor'));
    setText('out-tempat', getVal('in-tempat') || 'Makassar');
    setText('out-tanggal', getVal('in-tanggal'));
    
    const ttdJabatanText = getVal('in-ttd-jabatan').replace(/\n/g, '<br>');
    setHtml('out-ttd-jabatan', `<p style="margin: 2px 0; line-height: 1.15;">${ttdJabatanText}</p>`);
    setText('out-ttd-nama', getVal('in-ttd-nama'));
    
    setHtml('out-menimbang', formatListIndent(getVal('in-menimbang')));
    setHtml('out-dasar', formatListIndent(getVal('in-dasar')));
    
    let arrUntuk = []; let no = 1;
    for(let i=1; i<=5; i++) {
        const val = getVal(`in-untuk-${i}`).trim();
        if(val) { arrUntuk.push(`${no}. ${val}`); no++; }
    }
    setHtml('out-untuk', formatListIndent(arrUntuk.join('\n')));

    const outPegawai = document.getElementById('out-pegawai');
    if(outPegawai) {
        outPegawai.innerHTML = '';
        pegawaiData.forEach((p, index) => {
            if(p.nama && p.nama.trim() !== "") { 
                outPegawai.innerHTML += `
                    <div style="display: flex; margin-bottom: 0; line-height: 1.15;">
                        <div style="width: 18px; flex-shrink: 0;">${index + 1}.</div>
                        <div style="flex-grow: 1;">
                            <div style="margin: 0;">${p.nama}</div>
                            <div style="margin: 0;">${formatNIP(p.nip)}</div>
                            <div style="margin: 0;">${p.jabatan}</div>
                        </div>
                    </div>
                `;
            }
        });
    }

    // MEMANGGIL FITUR SMART SPACER SETELAH TEKS BERUBAH
    setTimeout(() => { 
        if(window.adjustPageHeight) window.adjustPageHeight(); 
    }, 50);
}

function initSuratTugasModule() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayIso = `${yyyy}-${mm}-${dd}`;

    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    const tYyyy = tomorrow.getFullYear();
    const tMm = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const tDd = String(tomorrow.getDate()).padStart(2, '0');
    const tomorrowIso = `${tYyyy}-${tMm}-${tDd}`;

    // Inisialisasi Datepicker Tanggal Surat
    const pickerEl = document.getElementById('in-tanggal-picker');
    if (pickerEl) {
        pickerEl.value = todayIso;
        window.handleDatePickerChange(todayIso);
    }

    // Inisialisasi Datepicker Periode Perjalanan Dinas (Tanggal Berangkat & Tanggal Kembali)
    const mulaiEl = document.getElementById('in-periode-mulai');
    const selesaiEl = document.getElementById('in-periode-selesai');
    if (mulaiEl && selesaiEl) {
        mulaiEl.value = todayIso;
        selesaiEl.value = tomorrowIso;
        window.handlePeriodeChange();
    }

    // Buka kalender otomatis saat diklik (ketika form tidak terkunci)
    ['in-tanggal-picker', 'in-periode-mulai', 'in-periode-selesai'].forEach(id => {
        const dp = document.getElementById(id);
        if (dp) {
            dp.addEventListener('click', function() {
                if (!window.isFormLocked && typeof this.showPicker === 'function') {
                    try { this.showPicker(); } catch (e) {}
                }
            });
        }
    });

    pegawaiData = [{ nama: "", nip: "", jabatan: "" }];
    window.applyStLockState(); // Mengaktifkan gembok Surat Tugas saat pertama kali dibuka
    window.switchPortalModule("st"); // Pastikan pertama kali dibuka langsung tampil Aplikasi Surat Tugas
};



// ============================================================================
// INTEGRASI PORTAL TERPADU: SINKRONISASI SURAT TUGAS <-> SPJ PERJALANAN DINAS
// & DATABASE PEGAWAI TERPUSAT DI CLOUD FIREBASE
// ============================================================================
const STORAGE_KEY_ST_LOCAL = "spj_pjn3_surat_tugas_records_v1";
let cachedSuratTugasByNomor = {};

window.switchPortalModule = function(targetMod) {
  const modSt = document.getElementById("module-surat-tugas");
  const modSpj = document.getElementById("module-spj");
  const btnSt = document.getElementById("btnSwitchModST");
  const btnSpj = document.getElementById("btnSwitchModSPJ");
  const bottomBar = document.querySelector(".bottom-settings-bar");

  if (targetMod === "st") {
    if (modSt) modSt.style.display = "flex";
    if (modSpj) modSpj.style.display = "none";
    if (btnSt) btnSt.classList.add("active");
    if (btnSpj) btnSpj.classList.remove("active");
    if (bottomBar) bottomBar.style.display = "none";
    document.body.classList.remove("active-module-spj");
    document.body.classList.add("active-module-st");
    if (window.renderPegawaiForms) window.renderPegawaiForms();
    setTimeout(() => {
      if (window.adjustPageHeight) window.adjustPageHeight();
    }, 60);
  } else {
    if (modSt) modSt.style.display = "none";
    if (modSpj) modSpj.style.display = "block";
    if (btnSt) btnSt.classList.remove("active");
    if (btnSpj) btnSpj.classList.add("active");
    if (bottomBar) bottomBar.style.display = "block";
    document.body.classList.remove("active-module-st");
    document.body.classList.add("active-module-spj");
    refreshSpdNoSptDropdown();
    autoResizeAllTextareas();
  }
};

function getLocalSuratTugasRecords() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ST_LOCAL);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") return parsed;
    }
  } catch (e) {}
  return {};
}

function saveLocalSuratTugasRecord(id, data) {
  try {
    const map = getLocalSuratTugasRecords();
    map[id] = data;
    localStorage.setItem(STORAGE_KEY_ST_LOCAL, JSON.stringify(map));
  } catch (e) {}
}

function deleteLocalSuratTugasRecord(id) {
  try {
    const map = getLocalSuratTugasRecords();
    delete map[id];
    localStorage.setItem(STORAGE_KEY_ST_LOCAL, JSON.stringify(map));
  } catch (e) {}
}

async function syncSuratTugasToPrimaryCloud(targetId, newData) {
  const baseUrl = getFirebaseDatabaseUrl();
  if (!baseUrl) return;
  try {
    await fetch(`${baseUrl}/suratTugas/${encodeURIComponent(targetId)}.json`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newData)
    });
  } catch (e) {}
}

// Parse satu tanggal fleksibel (mendukung "09 November 2026", "9 Nov 2026", "09/11/2026", "09-11-2026", "2026-11-09")
function parseFlexibleDateToIso(rawStr, fallbackMonthName = "", fallbackYearStr = "") {
  if (!rawStr) return "";
  const s = String(rawStr).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

  // Format DD/MM/YYYY atau DD-MM-YYYY
  const dmySlash = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (dmySlash) {
    const dd = dmySlash[1].padStart(2, "0");
    const mm = dmySlash[2].padStart(2, "0");
    const yyyy = dmySlash[3];
    return `${yyyy}-${mm}-${dd}`;
  }

  // Format "DD Bulan YYYY" atau "DD Bulan" (dengan tahun ikut tanggal kedua)
  const monthMap = {
    januari: "01", jan: "01",
    februari: "02", pebruari: "02", feb: "02",
    maret: "03", mar: "03",
    april: "04", apr: "04",
    mei: "05",
    juni: "06", jun: "06",
    juli: "07", jul: "07",
    agustus: "08", agu: "08", agt: "08",
    september: "09", sep: "09", sept: "09",
    oktober: "10", okt: "10",
    november: "11", nopember: "11", nov: "11", nop: "11",
    desember: "12", des: "12"
  };

  const parts = s.replace(/,/g, " ").split(/\s+/).filter(Boolean);
  if (parts.length >= 1 && /^\d{1,2}$/.test(parts[0])) {
    const dd = parts[0].padStart(2, "0");
    const mName = (parts[1] && !/^\d{4}$/.test(parts[1]) ? parts[1] : fallbackMonthName).toLowerCase();
    const yStr = (parts.find(p => /^\d{4}$/.test(p)) || fallbackYearStr);
    const mm = monthMap[mName];
    if (mm && /^\d{4}$/.test(yStr)) {
      return `${yStr}-${mm}-${dd}`;
    }
  }
  return "";
}

// Ekstrak Tanggal Berangkat & Tanggal Kembali (ISO YYYY-MM-DD) dari objek Surat Tugas atau kalimat Periode Perjalanan Dinas (untuk2)
function extractDatesFromSuratTugas(stData) {
  if (!stData) return null;

  // 1. Jika ada field periodeMulaiIso & periodeSelesaiIso langsung dari datepicker Surat Tugas
  if (
    stData.periodeMulaiIso &&
    stData.periodeSelesaiIso &&
    /^\d{4}-\d{2}-\d{2}$/.test(stData.periodeMulaiIso) &&
    /^\d{4}-\d{2}-\d{2}$/.test(stData.periodeSelesaiIso)
  ) {
    return {
      isoMulai: stData.periodeMulaiIso,
      isoSelesai: stData.periodeSelesaiIso
    };
  }

  const text = String(stData.untuk2 || "").trim();
  if (!text) return null;

  // 2. Cari pemisah rentang tanggal: "s/d", "s.d.", "s.d", "sampai dengan", atau "-"
  const rangeRegex = /(\d{1,2}(?:[\/\-]\d{1,2}[\/\-]\d{4}|(?:\s+[A-Za-z]+)?(?:\s+\d{4})?))\s*(?:s\/d|s\.d\.?|sampai\s+dengan|\-)\s*(\d{1,2}(?:[\/\-]\d{1,2}[\/\-]\d{4}|\s+[A-Za-z]+\s+\d{4}))/i;
  const m = text.match(rangeRegex);
  if (m) {
    const rightTokens = m[2].trim().split(/\s+/);
    const fallbackYear = rightTokens.find(t => /^\d{4}$/.test(t)) || "";
    const fallbackMonth = rightTokens.find(t => /^[A-Za-z]+$/.test(t)) || "";

    const isoMulai = parseFlexibleDateToIso(m[1], fallbackMonth, fallbackYear);
    const isoSelesai = parseFlexibleDateToIso(m[2], fallbackMonth, fallbackYear);
    if (isoMulai && isoSelesai) {
      return { isoMulai, isoSelesai };
    }
  }

  // 3. Jika hanya ada 1 tanggal tunggal di kalimat Periode (perjalanan 1 hari)
  const singleRegex = /(\d{1,2}\s+[A-Za-z]+\s+\d{4}|\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/i;
  const ms = text.match(singleRegex);
  if (ms) {
    const isoSingle = parseFlexibleDateToIso(ms[1]);
    if (isoSingle) {
      return { isoMulai: isoSingle, isoSelesai: isoSingle };
    }
  }

  return null;
}

// Ambil seluruh daftar Surat Tugas yang tersimpan di Cloud & Lokal, lalu isi dropdown Poin 10 (#spd_no_spt)
async function refreshSpdNoSptDropdown(preferredNomor = null) {
  const selectEl = document.getElementById("spd_no_spt");
  if (!selectEl) return;

  const currentVal = preferredNomor || selectEl.value || INITIAL_FORM_STATE.spd_no_spt;
  let allRecords = { ...getLocalSuratTugasRecords() };

  // Ambil dari Firebase SDK (suratTugas)
  try {
    const snapshot = await get(ref(db, "suratTugas"));
    if (snapshot.exists()) {
      const cloudVal = snapshot.val();
      if (cloudVal && typeof cloudVal === "object") {
        allRecords = { ...allRecords, ...cloudVal };
      }
    }
  } catch (e) {}

  // Ambil juga dari FIREBASE_DATABASE_URL jika berbeda
  const baseUrl = getFirebaseDatabaseUrl();
  if (baseUrl) {
    try {
      const res = await fetch(`${baseUrl}/suratTugas.json`);
      if (res.ok) {
        const extra = await res.json();
        if (extra && typeof extra === "object") {
          allRecords = { ...allRecords, ...extra };
        }
      }
    } catch (e) {}
  }

  const list = Object.keys(allRecords)
    .map(k => ({ idCloud: k, ...allRecords[k] }))
    .filter(item => item && item.nomor && String(item.nomor).trim() !== "" && String(item.nomor).trim() !== "...");

  // Urutkan berdasarkan nomor angka paling besar di belakang setelah tanda /
  list.sort((a, b) => {
    const numA = getTrailingSuratNumber(a);
    const numB = getTrailingSuratNumber(b);
    if (numB !== numA) return numB - numA;
    return Number(b.idCloud || 0) - Number(a.idCloud || 0);
  });

  cachedSuratTugasByNomor = {};
  list.forEach(item => {
    const noClean = String(item.nomor).trim();
    cachedSuratTugasByNomor[noClean] = item;
  });

  selectEl.innerHTML = "";

  // Pastikan nilai default/saat ini tetap ada di opsi meskipun belum ada di daftar Cloud
  const hasCurrentInList = list.some(item => String(item.nomor).trim() === currentVal);
  if (currentVal && !hasCurrentInList) {
    const optDefault = document.createElement("option");
    optDefault.value = currentVal;
    optDefault.textContent = currentVal;
    selectEl.appendChild(optDefault);
  }

  list.forEach(item => {
    const noClean = String(item.nomor).trim();
    const opt = document.createElement("option");
    opt.value = noClean;
    opt.textContent = noClean;
    selectEl.appendChild(opt);
  });

  selectEl.value = currentVal;
  if (preferredNomor && cachedSuratTugasByNomor[preferredNomor]) {
    syncSpjFieldsFromSelectedSuratTugas(preferredNomor);
  }
}

// Sinkronkan data Surat Tugas yang dipilih pada Poin 10 ke Poin 4, 5, 6, 7 di Sheet 1 & Uang Harian di Sheet 2
function syncSpjFieldsFromSelectedSuratTugas(nomorSpt) {
  const key = String(nomorSpt || "").trim();
  if (!key) return;

  let stData = cachedSuratTugasByNomor[key] ? { ...cachedSuratTugasByNomor[key] } : null;

  // Gabungkan juga data dari form Surat Tugas yang sedang aktif apabila nomornya sama
  const liveNo = (document.getElementById("in-nomor")?.value || "").trim();
  if (liveNo === key) {
    stData = {
      ...(stData || {}),
      nomor: liveNo,
      untuk1: document.getElementById("in-untuk-1")?.value || stData?.untuk1 || "",
      untuk2: document.getElementById("in-untuk-2")?.value || stData?.untuk2 || "",
      untuk3: document.getElementById("in-untuk-3")?.value || stData?.untuk3 || "",
      untuk4: document.getElementById("in-untuk-4")?.value || stData?.untuk4 || "",
      periodeMulaiIso: document.getElementById("in-periode-mulai")?.value || stData?.periodeMulaiIso || "",
      periodeSelesaiIso: document.getElementById("in-periode-selesai")?.value || stData?.periodeSelesaiIso || "",
      tanggalIso: document.getElementById("in-tanggal-picker")?.value || stData?.tanggalIso || "",
      tanggal: document.getElementById("in-tanggal")?.value || stData?.tanggal || ""
    };
  }
  if (!stData) return;

  // 1. Maksud Perjalanan Dinas (Poin 4 dari isian 1. Untuk/Keterangan Tugas)
  if (stData.untuk1 && String(stData.untuk1).trim() !== "" && String(stData.untuk1).trim() !== "...") {
    const elMaksud = document.getElementById("spd_maksud");
    if (elMaksud) elMaksud.value = String(stData.untuk1).trim();
  }

  // 2. Alat Angkutan (Poin 5) & Tempat Tujuan (Poin 6b)
  if (stData.untuk4 && String(stData.untuk4).trim() !== "" && String(stData.untuk4).trim() !== "....") {
    const elAngkutan = document.getElementById("spd_angkutan");
    if (elAngkutan) elAngkutan.value = String(stData.untuk4).trim();
  }
  if (stData.untuk3 && String(stData.untuk3).trim() !== "" && String(stData.untuk3).trim() !== "Tujuan ...") {
    const elTujuan = document.getElementById("spd_tempat_tujuan");
    if (elTujuan) elTujuan.value = String(stData.untuk3).trim();
  }

  // 3. Tanggal Berangkat, Tanggal Kembali & Lamanya Perjalanan Dinas (Poin 7 di Sheet 1 & Uang Harian di Sheet 2)
  const periodeDates = extractDatesFromSuratTugas(stData);
  if (periodeDates && periodeDates.isoMulai && periodeDates.isoSelesai) {
    const elBerangkat = document.getElementById("spd_tgl_berangkat");
    const elKembali = document.getElementById("spd_tgl_kembali");
    if (elBerangkat) elBerangkat.value = periodeDates.isoMulai;
    if (elKembali) elKembali.value = periodeDates.isoSelesai;
  }

  // 4. Tanggal SPT pada Poin 10
  const isoTglSpt = stData.tanggalIso || parseFlexibleDateToIso(stData.tanggal);
  if (isoTglSpt) {
    const elTglSpt = document.getElementById("spd_tgl_spt");
    if (elTglSpt) elTglSpt.value = isoTglSpt;
    autoSyncFlags.spd_tgl_spt = true;
  }

  // Jalankan recalculateAndSyncAll dengan trigger tanggal berangkat agar Poin 7a, 7b, 7c & Uang Harian Sheet 2 langsung terhitung
  recalculateAndSyncAll("spd_tgl_berangkat");
  autoResizeAllTextareas();
  showToast(`Data Surat Tugas "${key}" berhasil disinkronkan ke Poin 4, 5, 6, 7 & Sheet 2!`, "success");
}


// ============================================================================
// SCRIPT.JS - Aplikasi Pertanggung Jawaban Perjalanan Dinas
// Satker PJN Wilayah III Provinsi Sulawesi Selatan
// Terintegrasi Cloud Firebase Realtime Database
// ============================================================================

const APP_PASSWORD = "wil3";
const DB_PASSWORD = "pjn3";
const STORAGE_KEY_DATA = "spj_pjn3_saved_state_v1";
const STORAGE_KEY_RECORDS = "spj_pjn3_cloud_records_v1";
const STORAGE_KEY_DB = "spj_pjn3_saved_db_v1";

let isUnlocked = false;
let isDbUnlocked = false;
let currentSheet = "spd";
let databasePegawai = [];
let cachedCloudRecordsMap = {};

const BULAN_INDO = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

// Initial Default Form Values (Sesuai Sheet Excel & Terlink)
const INITIAL_FORM_STATE = {
  spd_lembar: "",
  spd_kode_no: "",
  spd_nomor: "KU0205/SPD/Bbpjn6.7/2026/131",
  spd_kasatker_jabatan: "Kepala Satuan Kerja PJN Wil. III Prov. Sulawesi Selatan",
  spd_pegawai_nama: "Muhammad Takdir, S.Kom",
  spd_instansi_pegawai: "Satker PJN Wil. III Prov. Sulawesi Selatan",
  spd_tingkat_biaya: "-",
  spd_maksud: "Penelitian Lapangan Dalam Rangka Serah Terima Hibah BMN Berupa Jembatan Gantung Tahun 2024 Lingkup BBPJN SulSel ke Pemda Kab. Maros, Pemda Kab. Bone & Pemda Kab. Jeneponto Prov. SulSel",
  spd_angkutan: "Kendaraan Sewa",
  spd_tempat_berangkat: "Satker PJN Wil. III Prov. Sulawesi Selatan",
  spd_tempat_tujuan: "Kab. Jeneponto, Kab. Maros dan Kab. Bone",
  spd_tgl_berangkat: "2026-04-06",
  spd_tgl_kembali: "2026-04-08",
  spd_pengikut1_nama: "",
  spd_pengikut1_tgl: "",
  spd_pengikut1_ket: "",
  spd_pengikut2_nama: "",
  spd_pengikut2_tgl: "",
  spd_pengikut2_ket: "",
  spd_anggaran_instansi: "Satker PJN Wil. III Prov. Sulawesi Selatan",
  spd_akun: "7756.EBA.962.055.AA.524111",
  spd_no_spt: "PS0603/Bbpjn6.7/2026/84",
  spd_tgl_spt: "2026-04-06",
  spd_dikeluarkan_di: "Makassar",
  spd_tgl_dikeluarkan: "2026-04-06",
  spd_ttd_jabatan: "Kepala Satuan Kerja,",
  spd_kpa_nama: "Malik, ST., MM",

  // Rincian (Teks No 1, 3, 4 Bisa di-Enter, Kolom JUMLAH Format Accounting)
  rincian_trans_uraian: "Biaya Transportasi",
  rincian_trans_jumlah: "-",
  rincian_trans_ket: "",
  rincian_uh_tarif: "258,000",
  rincian_uh_ket: "",
  rincian_inap_uraian: "Biaya Penginapan",
  rincian_inap_jumlah: "-",
  rincian_inap_ket: "",
  rincian_rep_uraian: "Uang Representasi",
  rincian_rep_jumlah: "-",
  rincian_rep_ket: "",
  rincian_kota_tanggal: "Makassar,",
  rincian_tanggal_lunas: "2026-02-11",
  rincian_bendahara_nama: "Wahyuni, SE",
  rincian_kpa_nama: "Malik, ST., MM",
  rincian_rampung_semula: "774,000",

  // Kwitansi
  kwitansi_tahun: "2026",
  kwitansi_no_bukti: "",
  kwitansi_rute: "Kantor Satker PJN Wil.III Prov.SulSel Ke Kantor ATR/BPN Kab.ParePare (PP)",

  // SPBy (Nota/bukti penerimaan barang/jasa dikosongkan isinya namun input tetap ada)
  spby_tanggal: "",
  spby_nomor: "",
  spby_nota_bukti: "",
  spby_layanan: "Layanan Umum,Pengelolaan Perbendaharaan,Administrasi Kegiatan Satker Induk",
  spby_jenis_belanja: "Belanja Perjalanan Dinas Biasa"
};

// Track whether user manually edited auto-synced fields
let autoSyncFlags = {
  rincian_rampung_semula: false,
  spd_tgl_spt: false,
  spd_tgl_dikeluarkan: false
};

// ============================================================================
// KONFIGURASI  REALTIME DATABASE (DIAMBIL DARI DATABASE.JS)
// ============================================================================
function getFirebaseDatabaseUrl() {
  if (typeof FIREBASE_DATABASE_URL !== "undefined" && FIREBASE_DATABASE_URL) {
    return String(FIREBASE_DATABASE_URL).trim().replace(/\/+$/, "");
  }
  return "";
}

async function syncDatabasePegawaiToCloud() {
  dbPegawai = databasePegawai;
  if (window.renderPegawaiForms) window.renderPegawaiForms();
  try {
    localStorage.setItem(STORAGE_KEY_DB, JSON.stringify(databasePegawai));
  } catch (e) {
    // ignore
  }

  let sdkOk = false;
  try {
    await set(ref(db, "spj_pjn3/databasePegawai"), databasePegawai);
    sdkOk = true;
  } catch (e) {}

  const baseUrl = getFirebaseDatabaseUrl();
  if (!baseUrl) return sdkOk;

  try {
    const res = await fetch(`${baseUrl}/spj_pjn3/databasePegawai.json`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(databasePegawai)
    });
    return res.ok || sdkOk;
  } catch (err) {
    return sdkOk;
  }
}

async function fetchDatabasePegawaiFromCloud() {
  const baseUrl = getFirebaseDatabaseUrl();
  if (baseUrl) {
    try {
      const res = await fetch(`${baseUrl}/spj_pjn3/databasePegawai.json`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          return data;
        }
      }
    } catch (err) {}
  }

  try {
    const snap = await get(ref(db, "spj_pjn3/databasePegawai"));
    if (snap.exists()) {
      const data = snap.val();
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch (e) {}

  await syncDatabasePegawaiToCloud();
  return null;
}

// ============================================================================
// UTILITY FUNCTIONS: TANGGAL INDONESIA, ACCOUNTING & TERBILANG
// ============================================================================
function formatTanggalIndo(isoStr) {
  if (!isoStr) return "-";
  const m = String(isoStr).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return isoStr;
  const year = m[1];
  const monthIdx = parseInt(m[2], 10) - 1;
  const day = m[3];
  return `${day} ${BULAN_INDO[monthIdx] || ""} ${year}`;
}

function normalizeToIsoDate(val, fallbackIso = "2026-04-06") {
  if (!val) return fallbackIso;
  const str = String(val).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
  const parts = str.split(/\s+/);
  if (parts.length >= 3) {
    const day = parts[0].padStart(2, "0");
    const mIdx = BULAN_INDO.findIndex(b => b.toLowerCase() === parts[1].toLowerCase());
    const year = parts[2];
    if (mIdx >= 0 && /^\d{4}$/.test(year)) {
      return `${year}-${String(mIdx + 1).padStart(2, "0")}-${day}`;
    }
  }
  return fallbackIso;
}

function hitungSelisihHariInklusif(isoMulai, isoSelesai) {
  const m1 = String(isoMulai || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const m2 = String(isoSelesai || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m1 || !m2) return 1;
  const d1 = Date.UTC(parseInt(m1[1], 10), parseInt(m1[2], 10) - 1, parseInt(m1[3], 10));
  const d2 = Date.UTC(parseInt(m2[1], 10), parseInt(m2[2], 10) - 1, parseInt(m2[3], 10));
  const diffDays = Math.round((d2 - d1) / (1000 * 60 * 60 * 24)) + 1;
  return diffDays > 0 ? diffDays : 1;
}

function formatLamaHariString(hari) {
  const h = Math.max(1, Math.round(Number(hari) || 1));
  const numStr = String(h).padStart(2, "0");
  const kata = (angkaKeKata(h) || "satu").toLowerCase();
  return `${numStr} (${kata}) Hari`;
}

function formatRupiahNumber(num) {
  const n = Math.round(Number(num) || 0);
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function parseAccountingNumber(val) {
  if (typeof val === "number") return val;
  const cleaned = String(val || "").replace(/[^0-9-]/g, "");
  return Number(cleaned) || 0;
}

function formatAccountingValue(num) {
  const n = Math.round(Number(num) || 0);
  if (n === 0) return "-";
  return formatRupiahNumber(n);
}

function formatTextWithBreaks(str) {
  return escapeHtml(str).replace(/\r?\n/g, "<br/>");
}

function angkaKeKata(n) {
  n = Math.floor(Math.abs(Number(n) || 0));
  const satuan = [
    "", "Satu", "Dua", "Tiga", "Empat", "Lima",
    "Enam", "Tujuh", "Delapan", "Sembilan", "Sepuluh", "Sebelas"
  ];
  if (n === 0) return "";
  if (n < 12) return satuan[n];
  if (n < 20) return angkaKeKata(n - 10) + " Belas";
  if (n < 100) {
    const puluh = Math.floor(n / 10);
    const sisa = n % 10;
    return angkaKeKata(puluh) + " Puluh" + (sisa > 0 ? " " + angkaKeKata(sisa) : "");
  }
  if (n < 200) {
    return "Seratus" + (n - 100 > 0 ? " " + angkaKeKata(n - 100) : "");
  }
  if (n < 1000) {
    const ratus = Math.floor(n / 100);
    const sisa = n % 100;
    return angkaKeKata(ratus) + " Ratus" + (sisa > 0 ? " " + angkaKeKata(sisa) : "");
  }
  if (n < 2000) {
    return "Seribu" + (n - 1000 > 0 ? " " + angkaKeKata(n - 1000) : "");
  }
  if (n < 1000000) {
    const ribu = Math.floor(n / 1000);
    const sisa = n % 1000;
    return angkaKeKata(ribu) + " Ribu" + (sisa > 0 ? " " + angkaKeKata(sisa) : "");
  }
  if (n < 1000000000) {
    const juta = Math.floor(n / 1000000);
    const sisa = n % 1000000;
    return angkaKeKata(juta) + " Juta" + (sisa > 0 ? " " + angkaKeKata(sisa) : "");
  }
  if (n < 1000000000000) {
    const milyar = Math.floor(n / 1000000000);
    const sisa = n % 1000000000;
    return angkaKeKata(milyar) + " Milyar" + (sisa > 0 ? " " + angkaKeKata(sisa) : "");
  }
  return n.toString();
}

function terbilangRupiah(nominal) {
  const n = Math.round(Number(nominal) || 0);
  if (n === 0) return "Nol Rupiah";
  if (n < 0) return "Minus " + angkaKeKata(Math.abs(n)) + " Rupiah";
  return angkaKeKata(n).replace(/\s+/g, " ").trim() + " Rupiah";
}

function autoResizeAllTextareas() {
  document.querySelectorAll(".auto-wrap-textarea").forEach(ta => {
    ta.style.height = "auto";
    if (ta.scrollHeight > 0) {
      ta.style.height = ta.scrollHeight + "px";
    }
  });
}

function showToast(message, type = "info") {
  const container = document.getElementById("toastContainer");
  if (!container) return;
  const colors = {
    success: "bg-emerald-700 border-emerald-400 text-white",
    error: "bg-red-700 border-red-400 text-white",
    warning: "bg-amber-600 border-amber-300 text-white",
    info: "bg-[#162a5c] border-blue-400 text-white"
  };
  const toast = document.createElement("div");
  toast.className = `${colors[type] || colors.info} border-l-4 px-4 py-3 rounded-lg shadow-xl text-xs font-semibold flex items-center justify-between gap-3 transition-all duration-300`;
  toast.innerHTML = `<span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 300);
  }, 3600);
}

// ============================================================================
// DATABASE PEGAWAI & DROPDOWN SUMBER (SHEET 1 & SHEET 2)
// ============================================================================
const REQUIRED_PERSON_SELECTS = [
  { id: "spd_pegawai_nama", defaultVal: "Muhammad Takdir, S.Kom" },
  { id: "spd_kpa_nama", defaultVal: "Malik, ST., MM" },
  { id: "rincian_bendahara_nama", defaultVal: "Wahyuni, SE" },
  { id: "rincian_kpa_nama", defaultVal: "Malik, ST., MM" }
];

const OPTIONAL_PERSON_SELECTS = [
  "spd_pengikut1_nama",
  "spd_pengikut2_nama"
];

async function initDatabase() {
  let savedDb = null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DB);
    if (raw) savedDb = JSON.parse(raw);
  } catch (e) {
    // ignore storage errors
  }

  if (Array.isArray(savedDb) && savedDb.length > 0) {
    databasePegawai = savedDb;
  } else {
    databasePegawai = JSON.parse(JSON.stringify(DEFAULT_DATABASE_PEGAWAI));
  }

  populateAllEmployeeDropdowns();
  renderDatabaseTable();

  // Ambil Database Pegawai terbaru dari Cloud Firebase setiap kali aplikasi dibuka
  const cloudDb = await fetchDatabasePegawaiFromCloud();
  if (Array.isArray(cloudDb) && cloudDb.length > 0) {
    databasePegawai = cloudDb;
    try {
      localStorage.setItem(STORAGE_KEY_DB, JSON.stringify(databasePegawai));
    } catch (e) {
      // ignore
    }
    populateAllEmployeeDropdowns();
    renderDatabaseTable();
    recalculateAndSyncAll();
  }
}

function findPegawaiByName(nama) {
  if (!nama) return null;
  const target = nama.trim().toLowerCase();
  return databasePegawai.find(p => p.nama.trim().toLowerCase() === target) || null;
}

function populateAllEmployeeDropdowns() {
  REQUIRED_PERSON_SELECTS.forEach(({ id, defaultVal }) => {
    const el = document.getElementById(id);
    if (!el) return;
    const prevValue = el.value || defaultVal;
    el.innerHTML = "";
    databasePegawai.forEach(emp => {
      const opt = document.createElement("option");
      opt.value = emp.nama;
      opt.textContent = emp.nama;
      el.appendChild(opt);
    });

    const exists = databasePegawai.some(e => e.nama === prevValue);
    if (exists) {
      el.value = prevValue;
    } else if (databasePegawai.length > 0) {
      el.value = databasePegawai[0].nama;
    }
  });

  OPTIONAL_PERSON_SELECTS.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    const prevValue = el.value || "";
    el.innerHTML = "";
    const emptyOpt = document.createElement("option");
    emptyOpt.value = "";
    emptyOpt.textContent = "";
    el.appendChild(emptyOpt);

    databasePegawai.forEach(emp => {
      const opt = document.createElement("option");
      opt.value = emp.nama;
      opt.textContent = emp.nama;
      el.appendChild(opt);
    });

    const exists = databasePegawai.some(e => e.nama === prevValue);
    el.value = exists ? prevValue : "";
    el.classList.toggle("empty-optional-select", !el.value);
  });

  const badge = document.getElementById("dbCountBadge");
  if (badge) badge.textContent = databasePegawai.length;
}

function renderDatabaseTable() {
  const tbody = document.getElementById("databaseTableBody");
  if (!tbody) return;
  const searchInput = document.getElementById("dbSearchInput");
  const query = (searchInput ? searchInput.value : "").trim().toLowerCase();

  tbody.innerHTML = "";
  databasePegawai.forEach((emp, idx) => {
    if (query) {
      const match =
        emp.nama.toLowerCase().includes(query) ||
        emp.nip.toLowerCase().includes(query) ||
        emp.pangkat.toLowerCase().includes(query) ||
        emp.jabatan.toLowerCase().includes(query);
      if (!match) return;
    }

    const tr = document.createElement("tr");
    tr.className = idx % 2 === 0 ? "bg-white hover:bg-blue-50/50" : "bg-slate-50 hover:bg-blue-50/50";
    tr.innerHTML = `
      <td class="border border-slate-300 px-2.5 py-1.5 text-center font-semibold">${idx + 1}</td>
      <td class="border border-slate-300 px-2.5 py-1.5 font-semibold text-slate-900">${escapeHtml(emp.nama)}</td>
      <td class="border border-slate-300 px-2.5 py-1.5 text-slate-700">${escapeHtml(emp.nip)}</td>
      <td class="border border-slate-300 px-2.5 py-1.5 text-slate-700">${escapeHtml(emp.pangkat)}</td>
      <td class="border border-slate-300 px-2.5 py-1.5 text-slate-700">${escapeHtml(emp.jabatan)}</td>
      <td class="border border-slate-300 px-2.5 py-1.5 text-center">
        <div class="flex items-center justify-center gap-1.5">
          <button type="button" data-action="edit-pegawai" data-index="${idx}" class="bg-amber-500 hover:bg-amber-600 text-white px-2.5 py-1 rounded text-[11px] font-semibold transition" ${!isDbUnlocked ? "disabled style='opacity:0.45;cursor:not-allowed'" : ""}>
            Edit
          </button>
          <button type="button" data-action="delete-pegawai" data-index="${idx}" class="bg-red-600 hover:bg-red-700 text-white px-2.5 py-1 rounded text-[11px] font-semibold transition" ${!isDbUnlocked ? "disabled style='opacity:0.45;cursor:not-allowed'" : ""}>
            Hapus
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function escapeHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ============================================================================
// CORE REACTIVE LINKING ENGINE (ANTAR SHEET: SPD -> RINCIAN -> KWITANSI -> SPBY)
// ============================================================================
function recalculateAndSyncAll(changedId = null) {
  if (changedId === "spd_kpa_nama") {
    document.getElementById("rincian_kpa_nama").value = document.getElementById("spd_kpa_nama").value;
  }

  // 1. SHEET 1: Pegawai Yang Melaksanakan Perjalanan Dinas & KPA Sheet 1
  const spdPegawaiName = document.getElementById("spd_pegawai_nama").value;
  const spdEmp = findPegawaiByName(spdPegawaiName);
  const spdNip = spdEmp ? spdEmp.nip : "-";
  const spdPangkat = spdEmp ? spdEmp.pangkat : "-";
  const spdJabatan = spdEmp ? spdEmp.jabatan : "-";

  document.getElementById("spd_pegawai_nip").value = spdNip;
  document.getElementById("spd_pegawai_pangkat").value = spdPangkat;
  document.getElementById("spd_pegawai_jabatan").value = spdJabatan;

  const quickBadge = document.getElementById("quickActivePegawai");
  if (quickBadge) quickBadge.textContent = spdPegawaiName || "-";

  const spdKpaName = document.getElementById("spd_kpa_nama").value;
  const spdKpaEmp = findPegawaiByName(spdKpaName);
  document.getElementById("spd_kpa_nip").value = spdKpaEmp ? spdKpaEmp.nip : "-";

  // 2. SHEET 1: Date Pickers -> Hitung Lamanya Perjalanan Dinas
  const tglBerangkatIso = document.getElementById("spd_tgl_berangkat").value;
  let tglKembaliIso = document.getElementById("spd_tgl_kembali").value;

  if (tglBerangkatIso && tglKembaliIso && tglKembaliIso < tglBerangkatIso) {
    tglKembaliIso = tglBerangkatIso;
    document.getElementById("spd_tgl_kembali").value = tglKembaliIso;
  }

  if (changedId === "spd_tgl_berangkat") {
    if (!autoSyncFlags.spd_tgl_spt) {
      document.getElementById("spd_tgl_spt").value = tglBerangkatIso;
    }
    if (!autoSyncFlags.spd_tgl_dikeluarkan) {
      document.getElementById("spd_tgl_dikeluarkan").value = tglBerangkatIso;
    }
  }

  const tglSptIso = document.getElementById("spd_tgl_spt").value;
  const tglDikeluarkanIso = document.getElementById("spd_tgl_dikeluarkan").value;

  const tglBerangkatIndo = formatTanggalIndo(tglBerangkatIso);
  const tglKembaliIndo = formatTanggalIndo(tglKembaliIso);
  const tglSptIndo = formatTanggalIndo(tglSptIso);
  const tglDikeluarkanIndo = formatTanggalIndo(tglDikeluarkanIso);

  document.getElementById("spd_tgl_berangkat_display").textContent = tglBerangkatIndo;
  document.getElementById("spd_tgl_kembali_display").textContent = tglKembaliIndo;
  document.getElementById("spd_tgl_spt_display").textContent = tglSptIndo;
  document.getElementById("spd_tgl_dikeluarkan_display").textContent = tglDikeluarkanIndo;

  const uhHari = hitungSelisihHariInklusif(tglBerangkatIso, tglKembaliIso);
  const spdLamaStr = formatLamaHariString(uhHari);
  document.getElementById("spd_lama").value = spdLamaStr;

  const spdNomor = document.getElementById("spd_nomor").value;
  const spdAkun = document.getElementById("spd_akun").value;

  // 3. SHEET 2 (RINCIAN)
  document.getElementById("rincian_spd_nomor").value = spdNomor;
  document.getElementById("rincian_spd_tanggal").value = tglDikeluarkanIndo;

  document.getElementById("rincian_uh_lama_display").textContent = spdLamaStr;
  document.getElementById("rincian_uh_tanggal_ket").value = `pada Tgl. ${tglBerangkatIndo} s/d ${tglKembaliIndo}`;
  document.getElementById("rincian_uh_hari_label").textContent = uhHari;

  const transJumlah = parseAccountingNumber(document.getElementById("rincian_trans_jumlah").value);
  const uhTarif = parseAccountingNumber(document.getElementById("rincian_uh_tarif").value);
  const uhJumlah = uhHari * uhTarif;
  const inapJumlah = parseAccountingNumber(document.getElementById("rincian_inap_jumlah").value);
  const repJumlah = parseAccountingNumber(document.getElementById("rincian_rep_jumlah").value);

  const liveAccountingIds = [
    "rincian_trans_jumlah",
    "rincian_uh_tarif",
    "rincian_inap_jumlah",
    "rincian_rep_jumlah",
    "rincian_rampung_semula"
  ];
  if (liveAccountingIds.includes(changedId)) {
    const activeEl = document.getElementById(changedId);
    const valNum = parseAccountingNumber(activeEl.value);
    activeEl.value = valNum === 0 ? "0" : formatRupiahNumber(valNum);
    try {
      activeEl.setSelectionRange(activeEl.value.length, activeEl.value.length);
    } catch (e) {
      // ignore cursor set error
    }
  }

  const totalBiaya = transJumlah + uhJumlah + inapJumlah + repJumlah;
  const terbilangText = terbilangRupiah(totalBiaya);

  document.getElementById("rincian_uh_jumlah").value = formatAccountingValue(uhJumlah);
  document.getElementById("rincian_total_display").value = formatAccountingValue(totalBiaya);
  document.getElementById("rincian_terbilang_display").textContent = terbilangText;

  document.getElementById("rincian_dibayar_sejumlah").textContent = formatAccountingValue(totalBiaya);
  document.getElementById("rincian_diterima_sejumlah").textContent = formatAccountingValue(totalBiaya);

  // Sheet 2: "Yang Menerima" terlink dari Sheet 1 Pegawai Pelaksana
  const yangMenerimaNama = spdPegawaiName;
  const yangMenerimaNip = spdNip;
  const yangMenerimaJabatan = spdJabatan;
  document.getElementById("rincian_penerima_nama").value = yangMenerimaNama;
  document.getElementById("rincian_penerima_nip").value = yangMenerimaNip;

  // Sheet 2: Bendahara Pengeluaran
  const rincianBendaharaNama = document.getElementById("rincian_bendahara_nama").value;
  const rincianBendaharaEmp = findPegawaiByName(rincianBendaharaNama);
  const rincianBendaharaNip = rincianBendaharaEmp ? rincianBendaharaEmp.nip : "-";
  document.getElementById("rincian_bendahara_nip").value = rincianBendaharaNip;

  // Sheet 2: Kuasa Pengguna Anggaran
  const rincianKpaNama = document.getElementById("rincian_kpa_nama").value;
  const rincianKpaEmp = findPegawaiByName(rincianKpaNama);
  const rincianKpaNip = rincianKpaEmp ? rincianKpaEmp.nip : "-";
  document.getElementById("rincian_kpa_nip").value = rincianKpaNip;

  // Perhitungan SPD Rampung
  document.getElementById("rincian_rampung_ditetapkan").value = formatAccountingValue(totalBiaya);
  const rampungSemulaInput = document.getElementById("rincian_rampung_semula");
  if (!autoSyncFlags.rincian_rampung_semula && changedId !== "rincian_rampung_semula") {
    rampungSemulaInput.value = formatAccountingValue(totalBiaya);
  }
  const rampungSemulaVal = parseAccountingNumber(rampungSemulaInput.value);
  const sisaRampung = totalBiaya - rampungSemulaVal;
  document.getElementById("rincian_rampung_sisa").value = formatAccountingValue(sisaRampung);

  // Tanggal di atas Tanda Tangan Sheet 2 (Date Picker)
  const kotaRincian = document.getElementById("rincian_kota_tanggal").value;
  const tglLunasIso = document.getElementById("rincian_tanggal_lunas").value;
  const tglLunasIndo = formatTanggalIndo(tglLunasIso);
  document.getElementById("rincian_tanggal_lunas_display").textContent = tglLunasIndo;

  // 4. SHEET 3 (KWITANSI)
  document.getElementById("kwitansi_mak").value = spdAkun;
  document.getElementById("kwitansi_jumlah_uang").textContent = formatAccountingValue(totalBiaya);
  document.getElementById("kwitansi_terbilang").textContent = terbilangText;
  document.getElementById("kwitansi_untuk_pembayaran_nama").textContent = yangMenerimaNama;
  document.getElementById("kwitansi_spd_nomor").value = spdNomor;
  document.getElementById("kwitansi_spd_tanggal").value = tglDikeluarkanIndo;
  document.getElementById("kwitansi_kota_tgl").textContent = `${kotaRincian} ${tglLunasIndo}`.trim();

  document.getElementById("kwitansi_penerima_jabatan").textContent = yangMenerimaJabatan;
  document.getElementById("kwitansi_penerima_nama").value = yangMenerimaNama;
  document.getElementById("kwitansi_penerima_nip").value = yangMenerimaNip;

  document.getElementById("kwitansi_kpa_nama").value = rincianKpaNama;
  document.getElementById("kwitansi_kpa_nip").value = rincianKpaNip;

  document.getElementById("kwitansi_bendahara_nama").value = rincianBendaharaNama;
  document.getElementById("kwitansi_bendahara_nip").value = rincianBendaharaNip;

  // 5. SHEET 4 (SPBY):
  // - Kepada : Terlink dari Sheet 2 "Yang Menerima"
  // - Untuk Pembayaran : "Perjalanan Dinas dari " (statis di HTML) + data terlink dari Sheet 3 "Untuk Perjalanan Dinas dari:"
  // - Tanda Tangan Bendahara, Penerima Uang & KPA : Terlink dari Sheet 2
  const kwitansiRuteVal = document.getElementById("kwitansi_rute").value.trim();
  const bersihRute = kwitansiRuteVal.replace(/^perjalanan\s+dinas\s+dari\s+/i, "");
  document.getElementById("spby_jumlah_uang").textContent = formatAccountingValue(totalBiaya);
  document.getElementById("spby_terbilang").textContent = terbilangText;
  document.getElementById("spby_kepada").value = yangMenerimaNama;
  document.getElementById("spby_untuk_pembayaran").textContent = `Perjalanan Dinas dari ${bersihRute}`;
  document.getElementById("spby_tgl_kuitansi").textContent = tglLunasIndo;
  document.getElementById("spby_tgl_ttd").textContent = tglLunasIndo;
  document.getElementById("spby_mak").value = spdAkun;

  document.getElementById("spby_bendahara_nama").value = rincianBendaharaNama;
  document.getElementById("spby_bendahara_nip").value = rincianBendaharaNip;

  document.getElementById("spby_penerima_nama").value = yangMenerimaNama;
  document.getElementById("spby_penerima_nip").value = yangMenerimaNip;

  document.getElementById("spby_kpa_nama").value = rincianKpaNama;
  document.getElementById("spby_kpa_nip").value = rincianKpaNip;

  OPTIONAL_PERSON_SELECTS.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.toggle("empty-optional-select", !el.value);
  });

  autoResizeAllTextareas();
}

// ============================================================================
// LOCK / UNLOCK EDIT PROTECTION: DOKUMEN & DATABASE PEGAWAI TERPISAH
// ============================================================================
function applyLockState() {
  const controls = document.querySelectorAll(".editable-control");
  controls.forEach(ctrl => {
    ctrl.disabled = !isUnlocked;
  });

  const badge = document.getElementById("lockStatusBadge");
  const icon = document.getElementById("lockIcon");
  const text = document.getElementById("lockStatusText");
  const btn = document.getElementById("btnToggleLock");
  const btnSave = document.getElementById("btnSaveData");

  if (isUnlocked) {
    document.body.classList.remove("locked-mode");
    badge.className = "flex items-center gap-2 bg-emerald-600/95 border border-emerald-400 px-3 py-1.5 rounded-lg text-xs font-semibold";
    icon.textContent = "🔓";
    text.textContent = "Mode Edit Aktif";
    btn.textContent = "Kunci Kembali";
    if (btnSave) btnSave.classList.remove("hidden");
  } else {
    document.body.classList.add("locked-mode");
    badge.className = "flex items-center gap-2 bg-red-600/90 border border-red-400 px-3 py-1.5 rounded-lg text-xs font-semibold";
    icon.textContent = "🔒";
    text.textContent = "Terkunci (Read-Only)";
    btn.textContent = "Buka Kunci Edit";
    if (btnSave) btnSave.classList.add("hidden");
  }
}

function applyDbLockState() {
  const dbControls = document.querySelectorAll(".db-editable-control");
  dbControls.forEach(ctrl => {
    ctrl.disabled = !isDbUnlocked;
  });

  const badge = document.getElementById("dbLockStatusBadge");
  const icon = document.getElementById("dbLockIcon");
  const text = document.getElementById("dbLockStatusText");
  const btn = document.getElementById("btnToggleDbLock");

  if (isDbUnlocked) {
    badge.className = "flex items-center gap-2 bg-emerald-600/95 border border-emerald-400 text-white px-3 py-1.5 rounded-lg text-xs font-semibold";
    icon.textContent = "🔓";
    text.textContent = "Database Terbuka";
    btn.textContent = "Kunci Database";
  } else {
    badge.className = "flex items-center gap-2 bg-red-600/90 border border-red-400 text-white px-3 py-1.5 rounded-lg text-xs font-semibold";
    icon.textContent = "🔒";
    text.textContent = "Database Terkunci";
    btn.textContent = "Buka Kunci Database";
  }

  renderDatabaseTable();
}

function openPasswordModal() {
  const modal = document.getElementById("passwordModal");
  const input = document.getElementById("inputPassword");
  const err = document.getElementById("passwordErrorMsg");
  err.classList.add("hidden");
  input.value = "";
  modal.classList.remove("hidden");
  setTimeout(() => input.focus(), 50);
}

function closePasswordModal() {
  document.getElementById("passwordModal").classList.add("hidden");
}

function openDbPasswordModal() {
  const modal = document.getElementById("dbPasswordModal");
  const input = document.getElementById("inputDbPassword");
  const err = document.getElementById("dbPasswordErrorMsg");
  err.classList.add("hidden");
  input.value = "";
  modal.classList.remove("hidden");
  setTimeout(() => input.focus(), 50);
}

function closeDbPasswordModal() {
  document.getElementById("dbPasswordModal").classList.add("hidden");
}

function openEditEmployeeModal(idx) {
  const emp = databasePegawai[idx];
  if (!emp) return;
  document.getElementById("editEmpIndex").value = idx;
  document.getElementById("editEmpNama").value = emp.nama;
  document.getElementById("editEmpNip").value = emp.nip;
  document.getElementById("editEmpPangkat").value = emp.pangkat;
  document.getElementById("editEmpJabatan").value = emp.jabatan;
  document.getElementById("editEmployeeModal").classList.remove("hidden");
  setTimeout(() => document.getElementById("editEmpNama").focus(), 50);
}

function closeEditEmployeeModal() {
  document.getElementById("editEmployeeModal").classList.add("hidden");
}

function openDeleteEmployeeModal(idx) {
  const emp = databasePegawai[idx];
  if (!emp) return;
  if (databasePegawai.length <= 1) {
    showToast("Minimal harus ada 1 pegawai di database.", "warning");
    return;
  }
  document.getElementById("deleteEmpIndex").value = idx;
  document.getElementById("deleteEmpNameText").textContent = `"${emp.nama}" (${emp.nip})`;
  document.getElementById("deleteEmployeeModal").classList.remove("hidden");
}

function closeDeleteEmployeeModal() {
  document.getElementById("deleteEmployeeModal").classList.add("hidden");
}

// ============================================================================
// CLOUD FIREBASE SAVE & LOAD FUNCTIONALITY (HANYA LOAD/BUKA & HAPUS BERSANDI)
// ============================================================================
function collectFormState() {
  const state = {};
  Object.keys(INITIAL_FORM_STATE).forEach(id => {
    const el = document.getElementById(id);
    if (el) state[id] = el.value;
  });
  return state;
}

function applyFormState(stateObj) {
  if (!stateObj) return;
  const dateFieldIds = [
    "spd_tgl_berangkat",
    "spd_tgl_kembali",
    "spd_tgl_spt",
    "spd_tgl_dikeluarkan",
    "rincian_tanggal_lunas"
  ];
  const accountingFieldIds = [
    "rincian_trans_jumlah",
    "rincian_uh_tarif",
    "rincian_inap_jumlah",
    "rincian_rep_jumlah",
    "rincian_rampung_semula"
  ];

  Object.keys(INITIAL_FORM_STATE).forEach(id => {
    const el = document.getElementById(id);
    if (!el || stateObj[id] === undefined) return;
    if (dateFieldIds.includes(id)) {
      el.value = normalizeToIsoDate(stateObj[id], INITIAL_FORM_STATE[id]);
    } else if (accountingFieldIds.includes(id)) {
      el.value = formatAccountingValue(parseAccountingNumber(stateObj[id]));
    } else if (id === "spd_no_spt") {
      const valStr = String(stateObj[id] || "");
      if (valStr && !Array.from(el.options).some(o => o.value === valStr)) {
        const opt = document.createElement("option");
        opt.value = valStr;
        opt.textContent = valStr;
        el.appendChild(opt);
      }
      el.value = valStr;
    } else {
      el.value = stateObj[id];
    }
  });
  recalculateAndSyncAll();
}

function getLocalCloudRecords() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_RECORDS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") return parsed;
    }
  } catch (e) {
    // ignore
  }
  return {};
}

function saveLocalCloudRecord(recordId, payload) {
  try {
    const records = getLocalCloudRecords();
    records[recordId] = payload;
    localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(records));
    localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(payload));
    localStorage.setItem(STORAGE_KEY_DB, JSON.stringify(databasePegawai));
  } catch (e) {
    // ignore
  }
}

function buildCompositeRecordId(nip, tglBerangkatIso, tglKembaliIso, noSpt) {
  const cleanNip = String(nip || "TANPA_NIP").trim().replace(/[^a-zA-Z0-9_-]/g, "_");
  const cleanBerangkat = String(tglBerangkatIso || "0000-00-00").trim().replace(/[^a-zA-Z0-9_-]/g, "_");
  const cleanKembali = String(tglKembaliIso || "0000-00-00").trim().replace(/[^a-zA-Z0-9_-]/g, "_");
  const cleanSpt = String(noSpt || "TANPA_SPT").trim().replace(/[^a-zA-Z0-9_-]/g, "_");
  return `${cleanNip}__${cleanBerangkat}__${cleanKembali}__${cleanSpt}`;
}

let pendingOverwritePayload = null;

function closeOverwriteConfirmModal() {
  pendingOverwritePayload = null;
  document.getElementById("overwriteConfirmModal").classList.add("hidden");
}

function closeSaveNewSuccessModal() {
  document.getElementById("saveNewSuccessModal").classList.add("hidden");
}

async function commitSaveRecord(payload, isOverwrite) {
  const recordId = payload.id;
  saveLocalCloudRecord(recordId, payload);
  cachedCloudRecordsMap[recordId] = payload;

  const baseUrl = getFirebaseDatabaseUrl();
  if (baseUrl) {
    try {
      await Promise.all([
        fetch(`${baseUrl}/spj_pjn3/records/${encodeURIComponent(recordId)}.json`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        }),
        fetch(`${baseUrl}/spj_pjn3/databasePegawai.json`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(databasePegawai)
        })
      ]);
    } catch (err) {
      // ignore network error; local copy already saved
    }
  }

  if (isOverwrite) {
    showToast(`File/dokumen "${payload.namaPegawai} | No. SPT: ${payload.nomorSpt}" berhasil diperbarui!`, "success");
  } else {
    document.getElementById("saveNewDocInfo").textContent =
      `${payload.namaPegawai} • No. SPT: ${payload.nomorSpt} • Rp ${payload.totalBiaya} (${payload.tglBerangkatIndo} - ${payload.tglKembaliIndo})`;
    document.getElementById("saveNewSuccessModal").classList.remove("hidden");
  }
}

async function saveSpjData() {
  const formState = collectFormState();
  const nipPegawai = document.getElementById("spd_pegawai_nip").value || "-";
  const tglBerangkatIso = formState.spd_tgl_berangkat || "";
  const tglKembaliIso = formState.spd_tgl_kembali || "";
  const noSpt = (formState.spd_no_spt || "").trim();

  // Kunci unik berdasarkan 4 kondisi:
  // 1. NIP pegawai yang melaksanakan perjalanan dinas
  // 2. Tanggal berangkat
  // 3. Tanggal kembali
  // 4. Nomor SPT
  const recordId = buildCompositeRecordId(nipPegawai, tglBerangkatIso, tglKembaliIso, noSpt);

  const tglBerangkatIndo = formatTanggalIndo(tglBerangkatIso);
  const tglKembaliIndo = formatTanggalIndo(tglKembaliIso);
  const totalUang = document.getElementById("rincian_total_display").value || "-";

  const localRecords = getLocalCloudRecords();
  let isOverwrite = Boolean(localRecords[recordId] || cachedCloudRecordsMap[recordId]);

  const baseUrl = getFirebaseDatabaseUrl();
  if (baseUrl && !isOverwrite) {
    try {
      const checkRes = await fetch(`${baseUrl}/spj_pjn3/records/${encodeURIComponent(recordId)}.json`);
      if (checkRes.ok) {
        const existingData = await checkRes.json();
        if (existingData && typeof existingData === "object") {
          isOverwrite = true;
        }
      }
    } catch (e) {
      // ignore check error
    }
  }

  const payload = {
    id: recordId,
    version: "1.8",
    savedAt: new Date().toISOString(),
    title: `${formState.spd_pegawai_nama} — ${noSpt || "-"} (${tglBerangkatIndo} - ${tglKembaliIndo})`,
    namaPegawai: formState.spd_pegawai_nama || "-",
    nipPegawai: nipPegawai,
    nomorSpt: noSpt || "-",
    tglBerangkat: tglBerangkatIso,
    tglKembali: tglKembaliIso,
    tglBerangkatIndo: tglBerangkatIndo,
    tglKembaliIndo: tglKembaliIndo,
    totalBiaya: totalUang,
    formState: formState,
    databasePegawai: databasePegawai
  };

  if (isOverwrite) {
    pendingOverwritePayload = payload;
    document.getElementById("overwriteDocInfo").textContent =
      `${payload.namaPegawai} (${payload.nipPegawai}) • No. SPT: ${payload.nomorSpt} • Tanggal: ${payload.tglBerangkatIndo} - ${payload.tglKembaliIndo}`;
    document.getElementById("overwriteConfirmModal").classList.remove("hidden");
  } else {
    await commitSaveRecord(payload, false);
  }
}

// 2-Step Security Delete Record inside Load Modal (Step 1: Password -> Step 2: Yes/No)
function openDeleteRecordSecurityModal(recordKey) {
  const rec = cachedCloudRecordsMap[recordKey];
  if (!rec) return;
  const title = rec.title || recordKey;

  document.getElementById("deleteRecordTargetKey").value = recordKey;
  document.getElementById("deleteRecordPassTitle").textContent = `"${title}"`;
  document.getElementById("deleteRecordConfirmTitle").textContent = `"${title}"`;
  document.getElementById("inputDeleteRecordPassword").value = "";
  document.getElementById("deleteRecordPasswordError").classList.add("hidden");

  document.getElementById("deleteRecordStepPassword").classList.remove("hidden");
  document.getElementById("deleteRecordStepConfirm").classList.add("hidden");
  document.getElementById("deleteRecordAuthModal").classList.remove("hidden");
  setTimeout(() => document.getElementById("inputDeleteRecordPassword").focus(), 50);
}

function closeDeleteRecordSecurityModal() {
  document.getElementById("deleteRecordAuthModal").classList.add("hidden");
}

async function executeConfirmedRecordDelete() {
  const key = document.getElementById("deleteRecordTargetKey").value;
  if (!key) return;

  delete cachedCloudRecordsMap[key];
  try {
    const localMap = getLocalCloudRecords();
    delete localMap[key];
    localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(localMap));
  } catch (e) {
    // ignore
  }

  const baseUrl = getFirebaseDatabaseUrl();
  if (baseUrl) {
    try {
      await fetch(`${baseUrl}/spj_pjn3/records/${encodeURIComponent(key)}.json`, { method: "DELETE" });
    } catch (e) {
      // ignore
    }
  }

  closeDeleteRecordSecurityModal();
  renderCloudRecordsList();
  showToast("Berkas berhasil dihapus secara permanen.", "info");
}

async function renderCloudRecordsList() {
  const listEl = document.getElementById("cloudRecordsList");
  if (!listEl) return;

  listEl.innerHTML = `<div class="text-xs text-slate-500 py-4 text-center">Memuat daftar file tersimpan...</div>`;

  const baseUrl = getFirebaseDatabaseUrl();
  let recordsMap = {};
  let fromCloud = false;

  if (baseUrl) {
    try {
      const res = await fetch(`${baseUrl}/spj_pjn3/records.json`);
      if (res.ok) {
        const cloudData = await res.json();
        if (cloudData && typeof cloudData === "object") {
          recordsMap = cloudData;
          fromCloud = true;
        }
      }
    } catch (err) {
      // fallback to local records
    }
  }

  if (!fromCloud || Object.keys(recordsMap).length === 0) {
    const localMap = getLocalCloudRecords();
    recordsMap = { ...localMap, ...recordsMap };
  }

  cachedCloudRecordsMap = recordsMap;

  const entries = Object.entries(recordsMap).sort((a, b) => {
    const tA = a[1]?.savedAt || "";
    const tB = b[1]?.savedAt || "";
    return tB.localeCompare(tA);
  });

  if (entries.length === 0) {
    listEl.innerHTML = `<div class="text-xs text-slate-500 py-5 text-center border border-dashed border-slate-300 rounded-lg">Belum ada file SPJ yang tersimpan. Klik tombol <strong>Simpan</strong> di panel atas untuk menyimpan.</div>`;
    return;
  }

  listEl.innerHTML = "";
  entries.forEach(([key, rec]) => {
    if (!rec || !rec.formState) return;
    const peg = rec.namaPegawai || rec.formState.spd_pegawai_nama || "-";
    const noSpt = rec.nomorSpt || rec.formState.spd_no_spt || "-";
    const tot = rec.totalBiaya || "-";
    const tglBerangkatDisp = rec.tglBerangkatIndo || formatTanggalIndo(rec.formState.spd_tgl_berangkat);
    const tglKembaliDisp = rec.tglKembaliIndo || formatTanggalIndo(rec.formState.spd_tgl_kembali);

    const item = document.createElement("div");
    item.className = "p-3 bg-slate-50 border border-slate-200 rounded-lg shadow-sm flex flex-wrap items-center justify-between gap-2 hover:border-blue-400 transition";
    item.innerHTML = `
      <div class="space-y-0.5">
        <div class="text-xs font-bold text-slate-900">
          ${escapeHtml(peg)} <span class="text-slate-400 font-normal">|</span> <span class="text-blue-800">No. SPT: ${escapeHtml(noSpt)}</span>
        </div>
        <div class="text-[11px] text-slate-600">
          Total Uang: <strong class="text-emerald-800">Rp ${escapeHtml(tot)}</strong> <span class="text-slate-400">•</span> Tanggal: <strong>${escapeHtml(tglBerangkatDisp)} - ${escapeHtml(tglKembaliDisp)}</strong>
        </div>
      </div>
      <div class="flex items-center gap-1.5">
        <button type="button" data-cloud-action="load" data-key="${escapeHtml(key)}" class="bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold px-3 py-1.5 rounded shadow-sm transition">
          Buka
        </button>
        <button type="button" data-cloud-action="delete" data-key="${escapeHtml(key)}" class="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-3 py-1.5 rounded shadow-sm transition">
          Hapus
        </button>
      </div>
    `;
    listEl.appendChild(item);
  });

  listEl.querySelectorAll("button[data-cloud-action]").forEach(btn => {
    btn.addEventListener("click", () => {
      const action = btn.dataset.cloudAction;
      const key = btn.dataset.key;
      const rec = cachedCloudRecordsMap[key];
      if (!rec) return;

      if (action === "load") {
        if (isUnlocked) {
          openLoadUnlockedWarnModal(key);
        } else {
          executeRecordLoad(key);
        }
      } else if (action === "delete") {
        openDeleteRecordSecurityModal(key);
      }
    });
  });
}

let pendingLoadRecordKey = null;

function executeRecordLoad(recordKey) {
  const rec = cachedCloudRecordsMap[recordKey];
  if (!rec) return;
  if (Array.isArray(rec.databasePegawai) && rec.databasePegawai.length > 0) {
    databasePegawai = rec.databasePegawai;
    populateAllEmployeeDropdowns();
    renderDatabaseTable();
  }
  if (rec.formState) {
    applyFormState(rec.formState);
  }
  closeLoadUnlockedWarnModal();
  closeLoadModal();
  showToast(`Data "${rec.title || recordKey}" berhasil dibuka!`, "success");
}

function openLoadUnlockedWarnModal(recordKey) {
  const rec = cachedCloudRecordsMap[recordKey];
  if (!rec) return;
  pendingLoadRecordKey = recordKey;
  const peg = rec.namaPegawai || rec.formState?.spd_pegawai_nama || "-";
  const noSpt = rec.nomorSpt || rec.formState?.spd_no_spt || "-";
  const tglBerangkatDisp = rec.tglBerangkatIndo || formatTanggalIndo(rec.formState?.spd_tgl_berangkat);
  const tglKembaliDisp = rec.tglKembaliIndo || formatTanggalIndo(rec.formState?.spd_tgl_kembali);
  document.getElementById("loadUnlockedDocInfo").textContent =
    `${peg} • No. SPT: ${noSpt} • Tanggal: ${tglBerangkatDisp} - ${tglKembaliDisp}`;
  document.getElementById("loadUnlockedWarnModal").classList.remove("hidden");
}

function closeLoadUnlockedWarnModal() {
  pendingLoadRecordKey = null;
  document.getElementById("loadUnlockedWarnModal").classList.add("hidden");
}

function openLoadModal() {
  const modal = document.getElementById("loadModal");
  modal.classList.remove("hidden");
  renderCloudRecordsList();
}

function closeLoadModal() {
  document.getElementById("loadModal").classList.add("hidden");
}

// ============================================================================
// PRINT FUNCTIONALITY (SINGLE SHEET OR ALL 4 SHEETS A4S)
// ============================================================================
function printCurrentSheet() {
  if (currentSheet === "database") {
    showToast("Pilih salah satu tab dokumen (SPD, Rincian, Kwitansi, atau SPBy) atau klik 'Print Semua'.", "warning");
    return;
  }
  autoResizeAllTextareas();
  document.body.classList.remove("print-all-mode");
  document.body.classList.add("print-single-mode");
  window.print();
}

function printAllSheets() {
  const printableSections = document.querySelectorAll(".sheet-section.printable-sheet");
  const dbSection = document.getElementById("sheet-database");

  // Tampilkan sementara semua 4 sheet dokumen agar tinggi textarea terukur presisi dan tiap sheet terpisah halaman
  printableSections.forEach(sec => sec.classList.remove("hidden"));
  if (dbSection) dbSection.classList.add("hidden");

  document.body.classList.remove("print-single-mode");
  document.body.classList.add("print-all-mode");
  autoResizeAllTextareas();

  window.print();

  setTimeout(() => {
    document.body.classList.remove("print-all-mode");
    document.body.classList.add("print-single-mode");
    switchSheetTab(currentSheet);
  }, 500);
}

// ============================================================================
// EXPORT / DOWNLOAD WORD (.doc) - A4S, MARGIN 1.5CM, FONT ARIAL
// ============================================================================
async function getKopImageDataUri() {
  const imgEl = document.querySelector(".kop-surat-img");
  if (!imgEl) return "";
  if (imgEl.src.startsWith("data:")) return imgEl.src;
  try {
    const canvas = document.createElement("canvas");
    canvas.width = imgEl.naturalWidth || 1200;
    canvas.height = imgEl.naturalHeight || 220;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(imgEl, 0, 0);
    return canvas.toDataURL("image/png");
  } catch (e) {
    return imgEl.src;
  }
}

async function downloadWordDocument() {
  const s = collectFormState();
  const kopSrc = await getKopImageDataUri();

  const nipPegawai = document.getElementById("spd_pegawai_nip").value;
  const pangkatPegawai = document.getElementById("spd_pegawai_pangkat").value;
  const jabatanPegawai = document.getElementById("spd_pegawai_jabatan").value;
  const nipKpaSpd = document.getElementById("spd_kpa_nip").value;

  const yangMenerimaNama = document.getElementById("rincian_penerima_nama").value;
  const yangMenerimaNip = document.getElementById("rincian_penerima_nip").value;
  const bendaharaNama = document.getElementById("rincian_bendahara_nama").value;
  const bendaharaNip = document.getElementById("rincian_bendahara_nip").value;
  const kpaRincianNama = document.getElementById("rincian_kpa_nama").value;
  const kpaRincianNip = document.getElementById("rincian_kpa_nip").value;

  const tglBerangkatIndo = formatTanggalIndo(s.spd_tgl_berangkat);
  const tglKembaliIndo = formatTanggalIndo(s.spd_tgl_kembali);
  const tglSptIndo = formatTanggalIndo(s.spd_tgl_spt);
  const tglDikeluarkanIndo = formatTanggalIndo(s.spd_tgl_dikeluarkan);
  const tglLunasIndo = formatTanggalIndo(s.rincian_tanggal_lunas);

  const uhHari = hitungSelisihHariInklusif(s.spd_tgl_berangkat, s.spd_tgl_kembali);
  const spdLamaStr = formatLamaHariString(uhHari);
  const uhTglKet = `pada Tgl. ${tglBerangkatIndo} s/d ${tglKembaliIndo}`;

  const transJumlah = parseAccountingNumber(s.rincian_trans_jumlah);
  const uhTarif = parseAccountingNumber(s.rincian_uh_tarif);
  const uhJumlah = uhHari * uhTarif;
  const inapJumlah = parseAccountingNumber(s.rincian_inap_jumlah);
  const repJumlah = parseAccountingNumber(s.rincian_rep_jumlah);
  const totalBiaya = transJumlah + uhJumlah + inapJumlah + repJumlah;
  const terbilangText = terbilangRupiah(totalBiaya);
  const rampungSemula = parseAccountingNumber(s.rincian_rampung_semula);
  const sisaRampung = totalBiaya - rampungSemula;

  const untukPembayaranKwitansi = `Perjalanan Dinas a.n ${yangMenerimaNama}`;
  const untukPembayaranSpby = `Perjalanan Dinas dari ${s.kwitansi_rute}`;

  const kopHtml = kopSrc
    ? `<div style="text-align:center;margin-bottom:8pt;"><img src="${kopSrc}" style="width:18cm;max-height:2.8cm;" /></div>`
    : "";

  const wordHtml = `
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="utf-8">
  <title>Pertanggung Jawaban Perjalanan Dinas - ${escapeHtml(s.spd_pegawai_nama)}</title>
  <style>
    @page Section1 {
      size: 21.0cm 29.7cm;
      mso-page-orientation: portrait;
      margin: 1.5cm 1.5cm 1.5cm 1.5cm;
    }
    div.Section1 { page: Section1; }
    body, table, td, th, p, div, span {
      font-family: Arial, sans-serif;
      font-size: 10pt;
      color: #000000;
      line-height: 1.25;
      word-wrap: break-word;
    }
    table { border-collapse: collapse; width: 100%; table-layout: fixed; }
    .bordered td, .bordered th { border: 1px solid #000000; padding: 3pt 5pt; vertical-align: middle; word-wrap: break-word; }
    .no-border td { border: none; padding: 2pt 4pt; vertical-align: top; word-wrap: break-word; }
    .box-frame { border: 1.5pt solid #000000; padding: 8pt 10pt; }
    .justify { text-align: justify; }
  </style>
</head>
<body>
<div class="Section1">

  <!-- HALAMAN 1: SPD_Hal Depan -->
  ${kopHtml}
  <table class="no-border" style="margin-bottom:6pt;">
    <tr>
      <td style="width:52%;"></td>
      <td style="width:13%;">Lembar</td>
      <td style="width:2%;">:</td>
      <td style="width:33%;">${escapeHtml(s.spd_lembar)}</td>
    </tr>
    <tr>
      <td></td>
      <td>Kode No</td>
      <td>:</td>
      <td>${escapeHtml(s.spd_kode_no)}</td>
    </tr>
    <tr>
      <td></td>
      <td>Nomor</td>
      <td>:</td>
      <td><b>${escapeHtml(s.spd_nomor)}</b></td>
    </tr>
  </table>

  <table class="bordered">
    <tr>
      <td style="width:5%;text-align:center;">1</td>
      <td style="width:38%;">Kepala Satuan Kerja</td>
      <td colspan="2" style="width:57%;">${escapeHtml(s.spd_kasatker_jabatan)}</td>
    </tr>
    <tr>
      <td style="text-align:center;">2</td>
      <td>Nama/NIP Pegawai Yang Melaksanakan<br/>Perjalanan Dinas</td>
      <td colspan="2"><b>${escapeHtml(s.spd_pegawai_nama)}</b><br/>${escapeHtml(nipPegawai)}</td>
    </tr>
    <tr>
      <td style="text-align:center;">3</td>
      <td>a. Pangkat dan Golongan<br/>b. Jabatan / Instansi<br/>&nbsp;<br/>c. Tingkat Biaya Perjalanan Dinas</td>
      <td colspan="2">
        a. ${escapeHtml(pangkatPegawai)}<br/>
        b. ${escapeHtml(jabatanPegawai)}<br/>
        &nbsp;&nbsp;&nbsp;&nbsp;${escapeHtml(s.spd_instansi_pegawai)}<br/>
        c. ${escapeHtml(s.spd_tingkat_biaya)}
      </td>
    </tr>
    <tr>
      <td style="text-align:center;">4</td>
      <td>Maksud Perjalanan Dinas:</td>
      <td colspan="2" class="justify" style="text-align:justify;">${formatTextWithBreaks(s.spd_maksud)}</td>
    </tr>
    <tr>
      <td style="text-align:center;">5</td>
      <td>Alat Angkutan Yang Dipergunakan</td>
      <td colspan="2">${escapeHtml(s.spd_angkutan)}</td>
    </tr>
    <tr>
      <td style="text-align:center;">6</td>
      <td>a. Tempat Berangkat<br/>b. Tempat Tujuan</td>
      <td colspan="2" class="justify" style="text-align:justify;">a. ${formatTextWithBreaks(s.spd_tempat_berangkat)}<br/>b. ${formatTextWithBreaks(s.spd_tempat_tujuan)}</td>
    </tr>
    <tr>
      <td style="text-align:center;">7</td>
      <td>a. Lamanya perjalanan Dinas<br/>b. Tanggal Berangkat<br/>c. Tanggal Harus Kembali/tiba ditempat Baru*)</td>
      <td colspan="2">a. ${escapeHtml(spdLamaStr)}<br/>b. ${escapeHtml(tglBerangkatIndo)}<br/>c. ${escapeHtml(tglKembaliIndo)}</td>
    </tr>
    <tr>
      <td style="text-align:center;">8</td>
      <td>Pengikut : Nama</td>
      <td style="width:28%;text-align:center;">Tanggal Lahir</td>
      <td style="width:29%;text-align:center;">Keterangan</td>
    </tr>
    <tr>
      <td>&nbsp;</td>
      <td>${escapeHtml(s.spd_pengikut1_nama)}</td>
      <td style="text-align:center;">${escapeHtml(s.spd_pengikut1_tgl)}</td>
      <td>${escapeHtml(s.spd_pengikut1_ket)}</td>
    </tr>
    <tr>
      <td>&nbsp;</td>
      <td>${escapeHtml(s.spd_pengikut2_nama)}</td>
      <td style="text-align:center;">${escapeHtml(s.spd_pengikut2_tgl)}</td>
      <td>${escapeHtml(s.spd_pengikut2_ket)}</td>
    </tr>
    <tr>
      <td style="text-align:center;">9</td>
      <td>Pembebanan Anggaran<br/>a. Instansi<br/>b. Akun</td>
      <td colspan="2"><br/>a. ${escapeHtml(s.spd_anggaran_instansi)}<br/>b. <b>${escapeHtml(s.spd_akun)}</b></td>
    </tr>
    <tr>
      <td style="text-align:center;">10</td>
      <td>Keterangan Lain-lain</td>
      <td colspan="2">Nomor SPT : ${escapeHtml(s.spd_no_spt)}<br/>Tanggal &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: ${escapeHtml(tglSptIndo)}</td>
    </tr>
  </table>
  <p style="font-size:9pt;margin-top:3pt;">*) Coret yang tidak perlu</p>

  <table class="no-border" style="margin-top:8pt;">
    <tr>
      <td style="width:50%;"></td>
      <td style="width:18%;">Dikeluarkan di</td>
      <td style="width:2%;">:</td>
      <td style="width:30%;">${escapeHtml(s.spd_dikeluarkan_di)}</td>
    </tr>
    <tr>
      <td></td>
      <td>Tanggal</td>
      <td>:</td>
      <td>${escapeHtml(tglDikeluarkanIndo)}</td>
    </tr>
    <tr>
      <td></td>
      <td colspan="3" style="text-align:center;padding-top:10pt;">
        <b>${escapeHtml(s.spd_ttd_jabatan)}</b><br/><br/><br/><br/>
        <b><u>${escapeHtml(s.spd_kpa_nama)}</u></b><br/>
        ${escapeHtml(nipKpaSpd)}
      </td>
    </tr>
  </table>

  <!-- HALAMAN 2: RINCIAN BIAYA PERJALANAN DINAS -->
  <br clear="all" style="page-break-before:always" />
  <div class="box-frame">
    <p style="text-align:center;font-weight:bold;text-decoration:underline;margin-bottom:10pt;">RINCIAN BIAYA PERJALANAN DINAS</p>
    <table class="no-border" style="margin-bottom:8pt;">
      <tr>
        <td style="width:30%;">LAMPIRAN SPD NOMOR</td>
        <td style="width:2%;">:</td>
        <td style="width:68%;">${escapeHtml(s.spd_nomor)}</td>
      </tr>
      <tr>
        <td>TANGGAL</td>
        <td>:</td>
        <td>${escapeHtml(tglDikeluarkanIndo)}</td>
      </tr>
    </table>

    <table class="bordered" style="margin-bottom:10pt;">
      <tr>
        <th style="width:6%;text-align:center;">NO.</th>
        <th style="width:52%;text-align:center;">PERINCIAN BIAYA</th>
        <th style="width:24%;text-align:center;">JUMLAH</th>
        <th style="width:18%;text-align:center;">KETERANGAN</th>
      </tr>
      <tr>
        <td style="text-align:center;">1</td>
        <td><b>BIAYA TRANSPORTASI</b><br/>${formatTextWithBreaks(s.rincian_trans_uraian)}</td>
        <td style="text-align:right;vertical-align:bottom;">Rp. ${formatAccountingValue(transJumlah)}</td>
        <td>${escapeHtml(s.rincian_trans_ket)}</td>
      </tr>
      <tr>
        <td style="text-align:center;">2</td>
        <td>
          <b>UANG HARIAN</b><br/>
          Uang Harian selama ${escapeHtml(spdLamaStr)}<br/>
          ${escapeHtml(uhTglKet)}<br/>
          ${uhHari} x Rp. ${formatRupiahNumber(uhTarif)},-
        </td>
        <td style="text-align:right;vertical-align:middle;">Rp. ${formatAccountingValue(uhJumlah)}</td>
        <td>${escapeHtml(s.rincian_uh_ket)}</td>
      </tr>
      <tr>
        <td style="text-align:center;">3</td>
        <td><b>UANG PENGINAPAN</b><br/>${formatTextWithBreaks(s.rincian_inap_uraian)}</td>
        <td style="text-align:right;vertical-align:bottom;">Rp. ${formatAccountingValue(inapJumlah)}</td>
        <td>${escapeHtml(s.rincian_inap_ket)}</td>
      </tr>
      <tr>
        <td style="text-align:center;">4</td>
        <td><b>UANG REPRESENTASI</b><br/>${formatTextWithBreaks(s.rincian_rep_uraian)}</td>
        <td style="text-align:right;vertical-align:bottom;">Rp. ${formatAccountingValue(repJumlah)}</td>
        <td>${escapeHtml(s.rincian_rep_ket)}</td>
      </tr>
      <tr>
        <td></td>
        <td style="text-align:center;font-weight:bold;">JUMLAH</td>
        <td style="text-align:right;font-weight:bold;">Rp. ${formatAccountingValue(totalBiaya)}</td>
        <td></td>
      </tr>
      <tr>
        <td colspan="4"><b>TERBILANG : <i>${escapeHtml(terbilangText)}</i></b></td>
      </tr>
    </table>

    <table class="no-border" style="margin-bottom:10pt;">
      <tr>
        <td style="width:50%;"></td>
        <td style="width:50%;">${escapeHtml(s.rincian_kota_tanggal)} ${escapeHtml(tglLunasIndo)}</td>
      </tr>
      <tr>
        <td>Telah dibayar sejumlah,<br/><b>Rp ${formatAccountingValue(totalBiaya)}</b></td>
        <td>Telah terima sejumlah uang sebesar :<br/><b>Rp ${formatAccountingValue(totalBiaya)}</b></td>
      </tr>
      <tr>
        <td style="text-align:center;padding-top:8pt;">
          Bendahara Pengeluaran<br/>Pelaksanaan Jalan Nasional Wil. III Prov. SulSel<br/><br/><br/><br/>
          <b><u>${escapeHtml(bendaharaNama)}</u></b><br/>
          ${escapeHtml(bendaharaNip)}
        </td>
        <td style="text-align:center;padding-top:8pt;">
          Yang Menerima,<br/><br/><br/><br/><br/>
          <b><u>${escapeHtml(yangMenerimaNama)}</u></b><br/>
          ${escapeHtml(yangMenerimaNip)}
        </td>
      </tr>
    </table>

    <hr/>
    <p style="text-align:center;font-weight:bold;text-decoration:underline;margin:8pt 0;">PERHITUNGAN SPD RAMPUNG</p>
    <table class="no-border">
      <tr>
        <td style="width:34%;">Ditetapkan sejumlah</td>
        <td style="width:3%;">:</td>
        <td style="width:5%;">Rp</td>
        <td style="width:23%;text-align:right;"><b>${formatAccountingValue(totalBiaya)}</b></td>
        <td style="width:35%;"></td>
      </tr>
      <tr>
        <td>Yang telah dibayar semula</td>
        <td>:</td>
        <td style="border-bottom:1pt solid #000;">Rp</td>
        <td style="border-bottom:1pt solid #000;text-align:right;"><b>${formatAccountingValue(rampungSemula)}</b></td>
        <td></td>
      </tr>
      <tr>
        <td>Sisa kurang/lebih</td>
        <td>:</td>
        <td>Rp</td>
        <td style="text-align:right;"><b>${formatAccountingValue(sisaRampung)}</b></td>
        <td></td>
      </tr>
      <tr>
        <td colspan="3"></td>
        <td colspan="2" style="text-align:center;padding-top:8pt;">
          Kuasa Pengguna Anggaran<br/>PJN Wil. III Prov. SulSel<br/><br/><br/><br/>
          <b><u>${escapeHtml(kpaRincianNama)}</u></b><br/>
          ${escapeHtml(kpaRincianNip)}
        </td>
      </tr>
    </table>
  </div>

  <!-- HALAMAN 3: KWITANSI -->
  <br clear="all" style="page-break-before:always" />
  <div class="box-frame">
    ${kopHtml}
    <table class="no-border" style="margin-bottom:8pt;">
      <tr>
        <td style="width:45%;"></td>
        <td style="width:20%;">Tahun Anggaran</td>
        <td style="width:2%;">:</td>
        <td style="width:33%;">${escapeHtml(s.kwitansi_tahun)}</td>
      </tr>
      <tr>
        <td></td>
        <td>Nomor Bukti</td>
        <td>:</td>
        <td>${escapeHtml(s.kwitansi_no_bukti)}</td>
      </tr>
      <tr>
        <td></td>
        <td>Mata Anggaran</td>
        <td>:</td>
        <td><b>${escapeHtml(s.spd_akun)}</b></td>
      </tr>
    </table>

    <p style="text-align:center;font-weight:bold;font-size:12pt;border:1pt solid #000;padding:3pt;width:180pt;margin:8pt auto;">K U I T A N S I</p>
    <hr/>

    <table class="no-border" style="margin-top:8pt;margin-bottom:14pt;">
      <tr>
        <td style="width:28%;">Sudah Terima dari</td>
        <td style="width:3%;">:</td>
        <td style="width:69%;"><b>KUASA PENGGUNA ANGGARAN / PEMBUAT KOMITMEN<br/>SATKER PELAKSANAAN JALAN NASIONAL WILAYAH III<br/>PROVINSI SULAWESI SELATAN</b></td>
      </tr>
      <tr>
        <td>Jumlah Uang</td>
        <td>:</td>
        <td><b>Rp ${formatAccountingValue(totalBiaya)}</b></td>
      </tr>
      <tr>
        <td>Terbilang</td>
        <td>:</td>
        <td class="justify" style="text-align:justify;"><i><b>${escapeHtml(terbilangText)}</b></i></td>
      </tr>
      <tr>
        <td>Untuk Pembayaran</td>
        <td>:</td>
        <td class="justify" style="text-align:justify;">${escapeHtml(untukPembayaranKwitansi)}</td>
      </tr>
      <tr>
        <td colspan="3"><b>Berdasarkan SPD</b></td>
      </tr>
      <tr>
        <td>Nomor</td>
        <td>:</td>
        <td>${escapeHtml(s.spd_nomor)}</td>
      </tr>
      <tr>
        <td>Tanggal</td>
        <td>:</td>
        <td>${escapeHtml(tglDikeluarkanIndo)}</td>
      </tr>
      <tr>
        <td>Untuk Perjalanan Dinas dari</td>
        <td>:</td>
        <td class="justify" style="text-align:justify;">${formatTextWithBreaks(s.kwitansi_rute)}</td>
      </tr>
    </table>

    <table class="no-border" style="margin-bottom:16pt;">
      <tr>
        <td style="width:50%;"></td>
        <td style="width:50%;text-align:center;">
          ${escapeHtml(s.rincian_kota_tanggal)} ${escapeHtml(tglLunasIndo)}<br/>
          ${escapeHtml(jabatanPegawai)}<br/><br/><br/><br/>
          <b><u>${escapeHtml(yangMenerimaNama)}</u></b><br/>
          ${escapeHtml(yangMenerimaNip)}
        </td>
      </tr>
    </table>

    <table class="no-border">
      <tr>
        <td style="width:50%;text-align:center;">
          Setuju dibebankan pada mata anggaran berkenaan<br/>
          Kuasa Pengguna Anggaran,<br/>
          Pejabat Pembuat Komitmen<br/><br/><br/><br/>
          <b><u>${escapeHtml(kpaRincianNama)}</u></b><br/>
          ${escapeHtml(kpaRincianNip)}
        </td>
        <td style="width:50%;text-align:center;">
          Lunas dibayar tanggal,<br/>
          Bendahara Pengeluaran<br/><br/><br/><br/><br/>
          <b><u>${escapeHtml(bendaharaNama)}</u></b><br/>
          ${escapeHtml(bendaharaNip)}
        </td>
      </tr>
    </table>
  </div>

  <!-- HALAMAN 4: SURAT PERINTAH BAYAR (SPBy) -->
  <br clear="all" style="page-break-before:always" />
  <div class="box-frame">
    <div style="text-align:center;font-weight:bold;border-bottom:1pt solid #000;padding-bottom:6pt;margin-bottom:8pt;">
      KEMENTERIAN PEKERJAAN UMUM<br/>
      SATKER PELAKSANAAN JALAN NASIONAL WIL.III PROVINSI SULAWESI SELATAN<br/>
      (693865)
    </div>

    <div style="border-bottom:1pt solid #000;padding-bottom:8pt;margin-bottom:8pt;">
      <p style="text-align:center;font-weight:bold;text-decoration:underline;margin-bottom:4pt;">SURAT PERINTAH BAYAR (SPBy)</p>
      <table class="no-border" style="width:50%;margin:0 auto;">
        <tr><td style="width:30%;">Tanggal</td><td style="width:5%;">:</td><td>${escapeHtml(s.spby_tanggal)}</td></tr>
        <tr><td>Nomor</td><td>:</td><td>${escapeHtml(s.spby_nomor)}</td></tr>
      </table>
    </div>

    <div style="border-bottom:1pt solid #000;padding-bottom:8pt;margin-bottom:8pt;">
      <p class="justify" style="text-align:justify;">Saya yang bertandatangan di bawah ini selaku Kuasa Pengguna Anggaran memerintahkan Bendahara Pengeluaran agar melakukan Pembayaran sejumlah :</p>
      <table class="no-border">
        <tr><td style="width:22%;">Jumlah Uang</td><td style="width:3%;">:</td><td><b>Rp. ${formatAccountingValue(totalBiaya)}</b></td></tr>
        <tr><td>Terbilang</td><td>:</td><td class="justify" style="text-align:justify;"><b>${escapeHtml(terbilangText)}</b></td></tr>
      </table>
    </div>

    <div style="border-bottom:1pt solid #000;padding-bottom:8pt;margin-bottom:8pt;">
      <table class="no-border" style="margin-bottom:8pt;">
        <tr><td style="width:22%;">Kepada</td><td style="width:3%;">:</td><td><b>${escapeHtml(yangMenerimaNama)}</b></td></tr>
        <tr><td>Untuk Pembayaran</td><td>:</td><td class="justify" style="text-align:justify;">${formatTextWithBreaks(untukPembayaranSpby)}</td></tr>
      </table>
      <p style="margin-bottom:2pt;">Atas dasar :</p>
      <table class="no-border" style="margin-bottom:8pt;">
        <tr><td style="width:4%;">1.</td><td style="width:34%;">Kuitansi / bukti pembelian</td><td style="width:3%;">:</td><td class="justify" style="text-align:justify;">Kuitansi &amp; Rincian Perjalanan Dinas Tanggal ${escapeHtml(tglLunasIndo)}</td></tr>
        <tr><td>2.</td><td>Nota / bukti penerimaan barang/jasa</td><td>:</td><td class="justify" style="text-align:justify;">${formatTextWithBreaks(s.spby_nota_bukti)}</td></tr>
      </table>
      <p class="justify" style="text-align:justify;">${formatTextWithBreaks(s.spby_layanan)}<br/>${formatTextWithBreaks(s.spby_jenis_belanja)}<br/>Kegiatan, Output, Akun : <b>${escapeHtml(s.spd_akun)}</b></p>
    </div>

    <p style="text-align:right;margin-right:20pt;">Makassar, Tgl, ${escapeHtml(tglLunasIndo)}</p>
    <table class="no-border">
      <tr>
        <td style="width:33%;text-align:center;">
          Setuju/Lunas dibayar, tgl.<br/>Bendahara Pengeluaran,<br/><br/><br/><br/>
          <b><u>${escapeHtml(bendaharaNama)}</u></b><br/>
          ${escapeHtml(bendaharaNip)}
        </td>
        <td style="width:34%;text-align:center;">
          Diterima Tgl.<br/>Penerima Uang,<br/><br/><br/><br/>
          <b><u>${escapeHtml(yangMenerimaNama)}</u></b><br/>
          ${escapeHtml(yangMenerimaNip)}
        </td>
        <td style="width:33%;text-align:center;">
          Kuasa Pengguna Anggaran<br/>Pejabat Pembuat Komitmen<br/><br/><br/><br/>
          <b><u>${escapeHtml(kpaRincianNama)}</u></b><br/>
          ${escapeHtml(kpaRincianNip)}
        </td>
      </tr>
    </table>
  </div>

</div>
</body>
</html>`;

  const empNameClean = (s.spd_pegawai_nama || "Pegawai").replace(/[^a-zA-Z0-9]/g, "_");
  const blob = new Blob(["\ufeff", wordHtml], { type: "application/msword;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `SPJ_Perjalanan_Dinas_${empNameClean}.doc`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);

  showToast("File Microsoft Word (.doc) ukuran A4S Margin 1.5cm Font Arial berhasil diunduh!", "success");
}

// ============================================================================
// EXPORT / DOWNLOAD EXCEL (.xlsx) - 5 SHEETS TERLINK SESUAI WORKBOOK ASLI
// ============================================================================
function downloadExcelWorkbook() {
  if (typeof XLSX === "undefined") {
    showToast("Pustaka SheetJS (XLSX) belum siap.", "error");
    return;
  }

  const s = collectFormState();
  const nipPegawai = document.getElementById("spd_pegawai_nip").value;
  const pangkatPegawai = document.getElementById("spd_pegawai_pangkat").value;
  const jabatanPegawai = document.getElementById("spd_pegawai_jabatan").value;
  const nipKpaSpd = document.getElementById("spd_kpa_nip").value;

  const yangMenerimaNama = document.getElementById("rincian_penerima_nama").value;
  const yangMenerimaNip = document.getElementById("rincian_penerima_nip").value;
  const bendaharaNama = document.getElementById("rincian_bendahara_nama").value;
  const bendaharaNip = document.getElementById("rincian_bendahara_nip").value;
  const kpaRincianNama = document.getElementById("rincian_kpa_nama").value;
  const kpaRincianNip = document.getElementById("rincian_kpa_nip").value;

  const tglBerangkatIndo = formatTanggalIndo(s.spd_tgl_berangkat);
  const tglKembaliIndo = formatTanggalIndo(s.spd_tgl_kembali);
  const tglSptIndo = formatTanggalIndo(s.spd_tgl_spt);
  const tglDikeluarkanIndo = formatTanggalIndo(s.spd_tgl_dikeluarkan);
  const tglLunasIndo = formatTanggalIndo(s.rincian_tanggal_lunas);

  const uhHari = hitungSelisihHariInklusif(s.spd_tgl_berangkat, s.spd_tgl_kembali);
  const spdLamaStr = formatLamaHariString(uhHari);
  const uhTglKet = `pada Tgl. ${tglBerangkatIndo} s/d ${tglKembaliIndo}`;

  const transJumlah = parseAccountingNumber(s.rincian_trans_jumlah);
  const uhTarif = parseAccountingNumber(s.rincian_uh_tarif);
  const uhJumlah = uhHari * uhTarif;
  const inapJumlah = parseAccountingNumber(s.rincian_inap_jumlah);
  const repJumlah = parseAccountingNumber(s.rincian_rep_jumlah);
  const totalBiaya = transJumlah + uhJumlah + inapJumlah + repJumlah;
  const terbilangText = terbilangRupiah(totalBiaya);
  const rampungSemula = parseAccountingNumber(s.rincian_rampung_semula);
  const sisaRampung = totalBiaya - rampungSemula;

  const untukPembayaranKwitansi = `Perjalanan Dinas a.n ${yangMenerimaNama}`;
  const untukPembayaranSpby = `Perjalanan Dinas dari ${s.kwitansi_rute}`;

  const wb = XLSX.utils.book_new();

  // 1. Sheet SPD_Hal Depan
  const spdAoA = [
    ["KEMENTERIAN PEKERJAAN UMUM"],
    ["DIREKTORAT JENDERAL BINA MARGA"],
    ["BALAI BESAR PELAKSANAAN JALAN NASIONAL SULAWESI SELATAN"],
    ["SATUAN KERJA PELAKSANAAN JALAN NASIONAL WILAYAH III PROV. SUL-SEL"],
    [""],
    ["", "", "Lembar", "", ":", s.spd_lembar],
    ["", "", "Kode No", "", ":", s.spd_kode_no],
    ["", "", "Nomor", "", ":", s.spd_nomor],
    [""],
    [1, "Kepala Satuan Kerja", s.spd_kasatker_jabatan],
    [2, "Nama/NIP Pegawai Yang Melaksanakan", s.spd_pegawai_nama],
    ["", "Perjalanan Dinas", nipPegawai],
    [3, "a. Pangkat dan Golongan", "a.", pangkatPegawai],
    ["", "b. Jabatan / Instansi", "b.", jabatanPegawai],
    ["", "", "", s.spd_instansi_pegawai],
    ["", "c. Tingkat Biaya Perjalanan Dinas", "c.", s.spd_tingkat_biaya],
    [4, "Maksud Perjalanan Dinas:", s.spd_maksud],
    [5, "Alat Angkutan Yang Dipergunakan", s.spd_angkutan],
    [6, "a. Tempat Berangkat", "a.", s.spd_tempat_berangkat],
    ["", "b. Tempat Tujuan", "b.", s.spd_tempat_tujuan],
    [7, "a. Lamanya perjalanan Dinas", "a.", spdLamaStr],
    ["", "b. Tanggal Berangkat", "b.", tglBerangkatIndo],
    ["", "c. Tanggal Harus Kembali/tiba ditempat Baru*)", "c.", tglKembaliIndo],
    [8, "Pengikut : Nama", "Tanggal Lahir", "Keterangan"],
    ["", s.spd_pengikut1_nama, s.spd_pengikut1_tgl, s.spd_pengikut1_ket],
    ["", s.spd_pengikut2_nama, s.spd_pengikut2_tgl, s.spd_pengikut2_ket],
    [9, "Pembebanan Anggaran", "", ""],
    ["", "a. Instansi", "a.", s.spd_anggaran_instansi],
    ["", "b. Akun", "b.", s.spd_akun],
    [10, "Keterangan Lain-lain", "Nomor SPT", ":", s.spd_no_spt],
    ["", "", "Tanggal", ":", tglSptIndo],
    ["", "*) Coret yang tidak perlu"],
    [""],
    ["", "", "", "Dikeluarkan di", ":", s.spd_dikeluarkan_di],
    ["", "", "", "Tanggal", ":", tglDikeluarkanIndo],
    ["", "", s.spd_ttd_jabatan],
    [""],
    ["", "", s.spd_kpa_nama],
    ["", "", nipKpaSpd]
  ];
  const wsSpd = XLSX.utils.aoa_to_sheet(spdAoA);
  XLSX.utils.book_append_sheet(wb, wsSpd, "SPD_Hal Depan");

  // 2. Sheet RINCIAN
  const rincianAoA = [
    ["RINCIAN BIAYA PERJALANAN DINAS"],
    [""],
    ["LAMPIRAN SPD NOMOR", ":", s.spd_nomor],
    ["TANGGAL", ":", tglDikeluarkanIndo],
    [""],
    ["NO.", "PERINCIAN BIAYA", "JUMLAH (Rp)", "KETERANGAN"],
    [1, "BIAYA TRANSPORTASI - " + s.rincian_trans_uraian, formatAccountingValue(transJumlah), s.rincian_trans_ket],
    [2, `UANG HARIAN selama ${spdLamaStr} (${uhHari} x Rp ${formatRupiahNumber(uhTarif)}) ${uhTglKet}`, formatAccountingValue(uhJumlah), s.rincian_uh_ket],
    [3, "UANG PENGINAPAN - " + s.rincian_inap_uraian, formatAccountingValue(inapJumlah), s.rincian_inap_ket],
    [4, "UANG REPRESENTASI - " + s.rincian_rep_uraian, formatAccountingValue(repJumlah), s.rincian_rep_ket],
    ["", "JUMLAH", formatAccountingValue(totalBiaya), ""],
    ["", "TERBILANG :", terbilangText, ""],
    [""],
    ["", "", s.rincian_kota_tanggal, tglLunasIndo],
    ["Telah dibayar sejumlah", formatAccountingValue(totalBiaya), "Telah terima sejumlah uang sebesar", formatAccountingValue(totalBiaya)],
    ["Bendahara Pengeluaran", "", "Yang Menerima,", ""],
    [bendaharaNama, "", yangMenerimaNama, ""],
    [bendaharaNip, "", yangMenerimaNip, ""],
    [""],
    ["PERHITUNGAN SPD RAMPUNG"],
    ["Ditetapkan sejumlah", ":", formatAccountingValue(totalBiaya)],
    ["Yang telah dibayar semula", ":", formatAccountingValue(rampungSemula)],
    ["Sisa kurang/lebih", ":", formatAccountingValue(sisaRampung)],
    ["", "", "Kuasa Pengguna Anggaran"],
    ["", "", kpaRincianNama],
    ["", "", kpaRincianNip]
  ];
  const wsRincian = XLSX.utils.aoa_to_sheet(rincianAoA);
  XLSX.utils.book_append_sheet(wb, wsRincian, "RINCIAN");

  // 3. Sheet KWITANSI
  const kwitansiAoA = [
    ["Tahun Anggaran", ":", s.kwitansi_tahun],
    ["Nomor Bukti", ":", s.kwitansi_no_bukti],
    ["Mata Anggaran", ":", s.spd_akun],
    [""],
    ["K U I T A N S I"],
    [""],
    ["Sudah Terima dari", ":", "KUASA PENGGUNA ANGGARAN / PEMBUAT KOMITMEN SATKER PJN WILAYAH III PROV. SULAWESI SELATAN"],
    ["Jumlah Uang", ":", formatAccountingValue(totalBiaya)],
    ["Terbilang", ":", terbilangText],
    ["Untuk Pembayaran", ":", untukPembayaranKwitansi],
    ["Berdasarkan SPD Nomor", ":", s.spd_nomor],
    ["Tanggal SPD", ":", tglDikeluarkanIndo],
    ["Untuk Perjalanan Dinas dari", ":", s.kwitansi_rute],
    [""],
    ["", "", `${s.rincian_kota_tanggal} ${tglLunasIndo}`],
    ["", "", jabatanPegawai],
    ["", "", yangMenerimaNama],
    ["", "", yangMenerimaNip],
    [""],
    ["Kuasa Pengguna Anggaran / PPK", "", "Bendahara Pengeluaran"],
    [kpaRincianNama, "", bendaharaNama],
    [kpaRincianNip, "", bendaharaNip]
  ];
  const wsKwitansi = XLSX.utils.aoa_to_sheet(kwitansiAoA);
  XLSX.utils.book_append_sheet(wb, wsKwitansi, "KWITANSI");

  // 4. Sheet SPBY
  const spbyAoA = [
    ["KEMENTERIAN PEKERJAAN UMUM"],
    ["SATKER PELAKSANAAN JALAN NASIONAL WIL.III PROVINSI SULAWESI SELATAN (693865)"],
    [""],
    ["SURAT PERINTAH BAYAR (SPBy)"],
    ["Tanggal", ":", s.spby_tanggal],
    ["Nomor", ":", s.spby_nomor],
    [""],
    ["Jumlah Uang", ":", formatAccountingValue(totalBiaya)],
    ["Terbilang", ":", terbilangText],
    ["Kepada", ":", yangMenerimaNama],
    ["Untuk Pembayaran", ":", untukPembayaranSpby],
    ["1. Kuitansi / bukti pembelian", ":", `Kuitansi & Rincian Perjalanan Dinas Tanggal ${tglLunasIndo}`],
    ["2. Nota / bukti penerimaan barang/jasa", ":", s.spby_nota_bukti],
    ["Kegiatan, Output, Akun", ":", s.spd_akun],
    [""],
    ["", "", `Makassar, Tgl, ${tglLunasIndo}`],
    ["Bendahara Pengeluaran", "Penerima Uang", "Kuasa Pengguna Anggaran / PPK"],
    [bendaharaNama, yangMenerimaNama, kpaRincianNama],
    [bendaharaNip, yangMenerimaNip, kpaRincianNip]
  ];
  const wsSpby = XLSX.utils.aoa_to_sheet(spbyAoA);
  XLSX.utils.book_append_sheet(wb, wsSpby, "SPBY");

  // 5. Sheet Database
  const dbAoA = [
    ["NO", "NAMA", "NIP/NRP", "PANGKAT / GOLONGAN", "JABATAN KESATKERAN"],
    ["", "SATKER PJN WIL. III PROV. SUL-SEL", "", "", ""]
  ];
  databasePegawai.forEach((emp, i) => {
    dbAoA.push([i + 1, emp.nama, emp.nip, emp.pangkat, emp.jabatan]);
  });
  const wsDb = XLSX.utils.aoa_to_sheet(dbAoA);
  XLSX.utils.book_append_sheet(wb, wsDb, "Database");

  const empNameClean = (s.spd_pegawai_nama || "Pegawai").replace(/[^a-zA-Z0-9]/g, "_");
  XLSX.writeFile(wb, `Aplikasi_SPJ_Perjalanan_Dinas_${empNameClean}.xlsx`);
  showToast("File Microsoft Excel (.xlsx) lengkap 5 Sheet berhasil diunduh!", "success");
}

// ============================================================================
// EVENT LISTENERS & INITIALIZATION
// ============================================================================
function switchSheetTab(targetSheet) {
  currentSheet = targetSheet;
  document.querySelectorAll(".sheet-tab").forEach(btn => {
    if (btn.dataset.sheet === targetSheet) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  const map = {
    spd: "sheet-spd",
    rincian: "sheet-rincian",
    kwitansi: "sheet-kwitansi",
    spby: "sheet-spby",
    database: "sheet-database"
  };

  Object.entries(map).forEach(([key, secId]) => {
    const sec = document.getElementById(secId);
    if (!sec) return;
    if (key === targetSheet) {
      sec.classList.remove("hidden");
      sec.classList.add("active-print-target");
    } else {
      sec.classList.add("hidden");
      sec.classList.remove("active-print-target");
    }
  });

  autoResizeAllTextareas();
}


// ============================================================================
// PROTEKSI ANTI-INTIP INSPECT ELEMENT (TEKS TETAP BISA DIBLOK & COPY-PASTE)
// ============================================================================
function initAntiInspectProtection() {
  // Blokir klik kanan (contextmenu) agar menu Inspect Element tidak muncul,
  // namun pengguna tetap bebas memblok teks dengan mouse & menekan Ctrl+C / Ctrl+V.
  document.addEventListener("contextmenu", e => {
    e.preventDefault();
    showToast("Klik kanan dinonaktifkan. Gunakan Ctrl+C / Ctrl+V untuk Copy-Paste teks.", "warning");
  });

  // Blokir pintasan keyboard Inspect Element / View Source / DevTools
  document.addEventListener("keydown", e => {
    const key = (e.key || "").toUpperCase();
    const isF12 = e.key === "F12" || e.keyCode === 123;
    const isDevToolsCombo =
      (e.ctrlKey && e.shiftKey && (key === "I" || key === "J" || key === "C" || key === "K")) ||
      (e.metaKey && e.altKey && (key === "I" || key === "J" || key === "C" || key === "U")) ||
      (e.ctrlKey && key === "U");

    if (isF12 || isDevToolsCombo) {
      e.preventDefault();
      e.stopPropagation();
      showToast("Fitur Inspect Element / View Source dinonaktifkan demi keamanan aplikasi.", "warning");
      return false;
    }
  });
}

window.addEventListener("DOMContentLoaded", () => {
  initAntiInspectProtection();
  initSuratTugasModule();
  initDatabase().then(() => {
    dbPegawai = databasePegawai;
    if (window.renderPegawaiForms) window.renderPegawaiForms();
  });
  refreshSpdNoSptDropdown();

  const selectNoSpt = document.getElementById("spd_no_spt");
  if (selectNoSpt) {
    selectNoSpt.addEventListener("change", e => {
      syncSpjFieldsFromSelectedSuratTugas(e.target.value);
    });
  }
  applyFormState(INITIAL_FORM_STATE);
  applyLockState();
  applyDbLockState();
  autoResizeAllTextareas();

  // Tab switching
  document.querySelectorAll(".sheet-tab").forEach(btn => {
    btn.addEventListener("click", () => {
      switchSheetTab(btn.dataset.sheet);
    });
  });

  // Open native date picker on click when unlocked
  document.querySelectorAll(".date-picker-native").forEach(dateInput => {
    dateInput.addEventListener("click", e => {
      if (!isUnlocked) return;
      if (typeof e.target.showPicker === "function") {
        try {
          e.target.showPicker();
        } catch (err) {
          // ignore if already open
        }
      }
    });
  });

  // Reactive input listeners across all editable document fields
  document.querySelectorAll(".editable-control").forEach(el => {
    el.addEventListener("input", e => {
      if (e.target.id === "rincian_rampung_semula") {
        autoSyncFlags.rincian_rampung_semula = true;
      }
      if (e.target.id === "spd_tgl_spt") {
        autoSyncFlags.spd_tgl_spt = true;
      }
      if (e.target.id === "spd_tgl_dikeluarkan") {
        autoSyncFlags.spd_tgl_dikeluarkan = true;
      }
      recalculateAndSyncAll(e.target.id);
    });
    el.addEventListener("change", e => {
      if (e.target.classList.contains("accounting-input")) {
        const val = parseAccountingNumber(e.target.value);
        e.target.value = formatAccountingValue(val);
      }
      recalculateAndSyncAll(e.target.id);
    });
    el.addEventListener("blur", e => {
      if (e.target.classList.contains("accounting-input")) {
        const val = parseAccountingNumber(e.target.value);
        e.target.value = formatAccountingValue(val);
      }
    });
  });

  // 1. Document Lock / Unlock handlers (Panel Atas Saja)
  document.getElementById("btnToggleLock").addEventListener("click", () => {
    if (isUnlocked) {
      isUnlocked = false;
      applyLockState();
      showToast("Dokumen kembali dikunci (Mode Read-Only).", "info");
    } else {
      openPasswordModal();
    }
  });

  document.getElementById("btnClosePasswordModal").addEventListener("click", closePasswordModal);
  document.getElementById("btnCancelPassword").addEventListener("click", closePasswordModal);

  document.getElementById("formPasswordUnlock").addEventListener("submit", e => {
    e.preventDefault();
    const val = document.getElementById("inputPassword").value;
    if (val === APP_PASSWORD) {
      isUnlocked = true;
      closePasswordModal();
      applyLockState();
      showToast("Sandi benar! Kolom dokumen sekarang dapat diedit.", "success");
    } else {
      document.getElementById("passwordErrorMsg").classList.remove("hidden");
    }
  });

  // 2. Database Pegawai Dedicated Lock / Unlock handlers
  document.getElementById("btnToggleDbLock").addEventListener("click", () => {
    if (isDbUnlocked) {
      isDbUnlocked = false;
      applyDbLockState();
      showToast("Database Pegawai kembali dikunci.", "info");
    } else {
      openDbPasswordModal();
    }
  });

  document.getElementById("btnCloseDbPasswordModal").addEventListener("click", closeDbPasswordModal);
  document.getElementById("btnCancelDbPassword").addEventListener("click", closeDbPasswordModal);

  document.getElementById("formDbPasswordUnlock").addEventListener("submit", e => {
    e.preventDefault();
    const val = document.getElementById("inputDbPassword").value;
    if (val === DB_PASSWORD) {
      isDbUnlocked = true;
      closeDbPasswordModal();
      applyDbLockState();
      showToast("Sandi Database benar! Fitur Edit & Hapus Database Pegawai aktif.", "success");
    } else {
      document.getElementById("dbPasswordErrorMsg").classList.remove("hidden");
    }
  });

  // 3. Edit Employee Modal handlers
  document.getElementById("btnCloseEditEmpModal").addEventListener("click", closeEditEmployeeModal);
  document.getElementById("btnCancelEditEmp").addEventListener("click", closeEditEmployeeModal);

  document.getElementById("formEditEmployee").addEventListener("submit", async e => {
    e.preventDefault();
    if (!isDbUnlocked) return;
    const idx = Number(document.getElementById("editEmpIndex").value);
    if (idx < 0 || idx >= databasePegawai.length) return;

    const oldName = databasePegawai[idx].nama;
    const newNama = document.getElementById("editEmpNama").value.trim();
    const newNip = document.getElementById("editEmpNip").value.trim();
    const newPangkat = document.getElementById("editEmpPangkat").value.trim();
    const newJabatan = document.getElementById("editEmpJabatan").value.trim();

    if (!newNama) return;

    databasePegawai[idx] = {
      no: idx + 1,
      nama: newNama,
      nip: newNip,
      pangkat: newPangkat,
      jabatan: newJabatan
    };

    const currentSelections = {};
    REQUIRED_PERSON_SELECTS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) currentSelections[id] = el.value === oldName ? newNama : el.value;
    });
    OPTIONAL_PERSON_SELECTS.forEach(id => {
      const el = document.getElementById(id);
      if (el) currentSelections[id] = el.value === oldName ? newNama : el.value;
    });

    populateAllEmployeeDropdowns();

    Object.entries(currentSelections).forEach(([id, val]) => {
      const el = document.getElementById(id);
      if (el && val !== undefined) el.value = val;
    });

    renderDatabaseTable();
    recalculateAndSyncAll();
    closeEditEmployeeModal();

    const synced = await syncDatabasePegawaiToCloud();
    showToast(
      synced
        ? `Data pegawai "${newNama}" diperbarui!`
        : `Data pegawai "${newNama}" berhasil diperbarui.`,
      "success"
    );
  });

  // 4. Delete Employee Confirmation Modal (Ya / Tidak)
  document.getElementById("btnCloseDeleteEmpModal").addEventListener("click", closeDeleteEmployeeModal);
  document.getElementById("btnCancelDeleteEmp").addEventListener("click", closeDeleteEmployeeModal);

  document.getElementById("btnConfirmDeleteEmp").addEventListener("click", async () => {
    if (!isDbUnlocked) return;
    const idx = Number(document.getElementById("deleteEmpIndex").value);
    if (idx < 0 || idx >= databasePegawai.length) return;
    if (databasePegawai.length <= 1) {
      closeDeleteEmployeeModal();
      showToast("Minimal harus ada 1 pegawai di database.", "warning");
      return;
    }

    const removed = databasePegawai.splice(idx, 1)[0];
    populateAllEmployeeDropdowns();
    renderDatabaseTable();
    recalculateAndSyncAll();
    closeDeleteEmployeeModal();

    const synced = await syncDatabasePegawaiToCloud();
    showToast(
      synced
        ? `Pegawai "${removed.nama}" dihapus!.`
        : `Pegawai "${removed.nama}" dihapus dari database.`,
      "info"
    );
  });

  // 5. Cloud Firebase Save / Load, Overwrite Modal & New Save Success Modal handlers
  document.getElementById("btnSaveData").addEventListener("click", saveSpjData);
  document.getElementById("btnCloseOverwriteModal").addEventListener("click", closeOverwriteConfirmModal);
  document.getElementById("btnOverwriteNo").addEventListener("click", closeOverwriteConfirmModal);
  document.getElementById("btnOverwriteYes").addEventListener("click", async () => {
    if (!pendingOverwritePayload) return;
    const payloadToSave = pendingOverwritePayload;
    closeOverwriteConfirmModal();
    await commitSaveRecord(payloadToSave, true);
  });
  document.getElementById("btnSaveNewOk").addEventListener("click", closeSaveNewSuccessModal);
  document.getElementById("btnCloseLoadUnlockedModal").addEventListener("click", closeLoadUnlockedWarnModal);
  document.getElementById("btnLoadUnlockedNo").addEventListener("click", closeLoadUnlockedWarnModal);
  document.getElementById("btnLoadUnlockedYes").addEventListener("click", () => {
    if (!pendingLoadRecordKey) return;
    executeRecordLoad(pendingLoadRecordKey);
  });

  // Pengaturan Besar Huruf & Zoom Lembar Kerja (Panel Bawah)
  const fontSizesList = [8, 9, 9.5, 10, 10.5, 11, 12];
  const selectFont = document.getElementById("selectDocFontSize");
  const rangeZoom = document.getElementById("rangeDocZoom");
  const zoomLabel = document.getElementById("zoomPercentLabel");

  function applyFontSize(ptVal) {
    document.documentElement.style.setProperty("--doc-font-size", `${ptVal}pt`);
    if (selectFont) selectFont.value = String(ptVal);
    autoResizeAllTextareas();
  }

  function applyZoomPercent(pctVal) {
    const clamped = Math.max(60, Math.min(150, Number(pctVal) || 100));
    document.documentElement.style.setProperty("--doc-zoom", String(clamped / 100));
    if (rangeZoom) rangeZoom.value = String(clamped);
    if (zoomLabel) zoomLabel.textContent = `${clamped}%`;
  }

  selectFont.addEventListener("change", e => {
    applyFontSize(Number(e.target.value) || 10);
  });

  document.getElementById("btnFontDec").addEventListener("click", () => {
    const cur = Number(selectFont.value) || 10;
    const idx = fontSizesList.indexOf(cur);
    const nextVal = idx > 0 ? fontSizesList[idx - 1] : fontSizesList[0];
    applyFontSize(nextVal);
  });

  document.getElementById("btnFontInc").addEventListener("click", () => {
    const cur = Number(selectFont.value) || 10;
    const idx = fontSizesList.indexOf(cur);
    const nextVal = idx >= 0 && idx < fontSizesList.length - 1 ? fontSizesList[idx + 1] : fontSizesList[fontSizesList.length - 1];
    applyFontSize(nextVal);
  });

  rangeZoom.addEventListener("input", e => {
    applyZoomPercent(Number(e.target.value) || 100);
  });

  document.getElementById("btnZoomOut").addEventListener("click", () => {
    applyZoomPercent((Number(rangeZoom.value) || 100) - 10);
  });

  document.getElementById("btnZoomIn").addEventListener("click", () => {
    applyZoomPercent((Number(rangeZoom.value) || 100) + 10);
  });

  document.getElementById("btnZoomReset").addEventListener("click", () => {
    applyFontSize(10);
    applyZoomPercent(100);
  });
  document.getElementById("btnLoadData").addEventListener("click", openLoadModal);
  document.getElementById("btnCloseLoadModal").addEventListener("click", closeLoadModal);
  document.getElementById("btnCancelLoadModal").addEventListener("click", closeLoadModal);

  document.getElementById("btnCloseDeleteRecordModal").addEventListener("click", closeDeleteRecordSecurityModal);
  document.getElementById("btnCancelDeleteRecordPass").addEventListener("click", closeDeleteRecordSecurityModal);
  document.getElementById("btnDeleteRecordNo").addEventListener("click", closeDeleteRecordSecurityModal);
  document.getElementById("btnDeleteRecordYes").addEventListener("click", executeConfirmedRecordDelete);

  document.getElementById("formDeleteRecordPassword").addEventListener("submit", e => {
    e.preventDefault();
    const val = document.getElementById("inputDeleteRecordPassword").value;
    if (val === APP_PASSWORD) {
      document.getElementById("deleteRecordPasswordError").classList.add("hidden");
      document.getElementById("deleteRecordStepPassword").classList.add("hidden");
      document.getElementById("deleteRecordStepConfirm").classList.remove("hidden");
    } else {
      document.getElementById("deleteRecordPasswordError").classList.remove("hidden");
    }
  });

  // Print & Export handlers
  document.getElementById("btnPrintCurrent").addEventListener("click", printCurrentSheet);
  document.getElementById("btnPrintAll").addEventListener("click", printAllSheets);
  document.getElementById("btnDownloadWord").addEventListener("click", downloadWordDocument);
  document.getElementById("btnDownloadExcel").addEventListener("click", downloadExcelWorkbook);

  // Database Search & Actions (Popup Tambah, Edit & Hapus)
  document.getElementById("dbSearchInput").addEventListener("input", renderDatabaseTable);

  function openAddEmployeeModal() {
    if (!isDbUnlocked) {
      openDbPasswordModal();
      return;
    }
    document.getElementById("newEmpNama").value = "";
    document.getElementById("newEmpNip").value = "";
    document.getElementById("newEmpPangkat").value = "";
    document.getElementById("newEmpJabatan").value = "";
    document.getElementById("addEmployeeModal").classList.remove("hidden");
    setTimeout(() => document.getElementById("newEmpNama").focus(), 50);
  }

  function closeAddEmployeeModal() {
    document.getElementById("addEmployeeModal").classList.add("hidden");
  }

  function closeAddEmpSuccessModal() {
    document.getElementById("addEmpSuccessModal").classList.add("hidden");
  }

  document.getElementById("btnOpenAddEmpModal").addEventListener("click", openAddEmployeeModal);
  document.getElementById("btnCloseAddEmpModal").addEventListener("click", closeAddEmployeeModal);
  document.getElementById("btnCancelAddEmp").addEventListener("click", closeAddEmployeeModal);
  document.getElementById("btnAddEmpSuccessOk").addEventListener("click", closeAddEmpSuccessModal);

  document.getElementById("formAddEmployee").addEventListener("submit", async e => {
    e.preventDefault();
    if (!isDbUnlocked) {
      closeAddEmployeeModal();
      openDbPasswordModal();
      return;
    }
    const nama = document.getElementById("newEmpNama").value.trim();
    const nip = document.getElementById("newEmpNip").value.trim();
    const pangkat = document.getElementById("newEmpPangkat").value.trim();
    const jabatan = document.getElementById("newEmpJabatan").value.trim();
    if (!nama) return;

    databasePegawai.push({
      no: databasePegawai.length + 1,
      nama,
      nip,
      pangkat,
      jabatan
    });

    populateAllEmployeeDropdowns();
    renderDatabaseTable();
    recalculateAndSyncAll();
    closeAddEmployeeModal();

    await syncDatabasePegawaiToCloud();

    document.getElementById("addEmpSuccessInfo").textContent =
      `${nama} • ${nip} (${pangkat} — ${jabatan})`;
    document.getElementById("addEmpSuccessModal").classList.remove("hidden");
  });

  document.getElementById("databaseTableBody").addEventListener("click", e => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;
    if (!isDbUnlocked) {
      openDbPasswordModal();
      return;
    }
    const idx = Number(btn.dataset.index);
    const emp = databasePegawai[idx];
    if (!emp) return;

    if (btn.dataset.action === "edit-pegawai") {
      openEditEmployeeModal(idx);
    } else if (btn.dataset.action === "delete-pegawai") {
      openDeleteEmployeeModal(idx);
    }
  });
});
