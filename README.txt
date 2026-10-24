NINJA-GLITCH-FINAL  (v1.0.0)
============================
Website statis mobile-first bertema cyber/neon. SEMUA fitur adalah SIMULASI VISUAL LOKAL.
Tidak ada backend, database, API key, atau request ke server luar.

FLOW
----
INTRO (index.html) -> LOGIN (login.html) -> FINGERPRINT -> NINJA LOADING -> DASHBOARD (dashboard.html)
Login, fingerprint, dan ninja loading berada dalam SATU halaman (login.html) sebagai 3 "stage",
sehingga perpindahan tidak bergantung pada reload.

KREDENSIAL SIMULASI
-------------------
Username : Ninja67
Password : Glitch76
(case-sensitive; maksimal 5 percobaan gagal, lalu terkunci 30 detik)
Catatan: ini hanya simulasi UI. Kredensial ada di kode sisi-klien (app.js), jadi JANGAN
dipakai sebagai pengamanan sungguhan. Password tidak disimpan di localStorage dan tidak masuk URL.

PERBAIKAN UTAMA (dari video referensi)
--------------------------------------
- Login me-reload halaman terus (URL menjadi login.html?). Penyebab: <form> ter-submit seperti GET biasa.
  Sekarang form memakai action="javascript:void(0)", onsubmit="return false" dan handler
  preventDefault(); tidak ada reload, tidak ada query di URL.
- Semua progress (intro, fingerprint, loading, simulator) memakai timer berbasis waktu (Date.now),
  bukan animasi CSS, sehingga tidak bisa stuck di 0%. Ada watchdog + tombol SKIP di setiap layar.
- localStorage dibungkus aman (storage.js) dengan fallback jika diblokir browser.

STRUKTUR FILE
-------------
index.html       Intro (progress 0-100%, SKIP INTRO)
login.html       Login + Fingerprint + Ninja Loading
dashboard.html   Dashboard (Home, Glitch, Tools, Settings) + bottom navigation
style.css        Tema cyber neon
responsive.css   Android kecil, portrait, landscape, tablet/desktop
storage.js       Wrapper localStorage aman
animation.js     Progress timer, Boot controller, partikel, FPS
fingerprint.js   Simulasi fingerprint interaktif
navigation.js    Bottom navigation + hash routing
app.js           Logika Intro, Login, Dashboard, Glitch Simulator
assets/images    ninja.svg (logo)
assets/icons     favicon.svg
assets/effects   grid.svg (latar grid)

Catatan arsitektur: Home/Glitch/Tools/Settings dibuat sebagai view di dalam dashboard.html
(bukan file terpisah di pages/) agar berpindah tab instan, tanpa fetch, dan tetap jalan di
file:// maupun Vercel. Riwayat simulasi ada di tab TOOLS.

DEPLOY (GitHub -> Vercel)
-------------------------
1. Ekstrak ZIP, upload SEMUA isinya ke root repository GitHub (index.html harus di root).
2. Di Vercel: Add New Project -> pilih repo -> Framework Preset: "Other".
   Build Command: kosongkan. Output Directory: kosongkan (root). Deploy.
Bisa juga dibuka langsung dengan mengklik index.html, atau: python3 -m http.server

RESET / TROUBLESHOOTING
-----------------------
- Mau lihat intro lagi: Dashboard > Settings > REPLAY INTRO, atau Logout.
- Data tersangkut: Settings > RESET LOCAL DATA, atau hapus data situs di browser.
- Progress selalu berjalan otomatis; tombol SKIP tersedia di Intro, Fingerprint, dan Loading.
