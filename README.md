# Pasar Basa (XR) — Skeleton

Web pembelajaran bahasa Jawa: VR 360° (`/vr`) + AR kartu (`/ar`). HTML/CSS/JS biasa, tanpa build.

## Jalankan lokal
```
python3 -m http.server 8000      # lalu buka http://localhost:8000
```
(AR butuh HTTPS di HP -> uji lewat URL Vercel.)

## Setup repo (Dyan, Senin malam)
```
git init && git add . && git commit -m "skeleton"
git branch -M main && git remote add origin <URL_REPO> && git push -u origin main
```
Vercel: Add New Project -> import repo -> Framework "Other" -> Deploy (tanpa build command).
Lalu tiap anggota: `git checkout -b feat/<nama-branch>` (lihat konteks bersama §8).

## Aset yang harus diisi (sebelum fitur jalan penuh)
| Folder | File |
|---|---|
| assets/panorama | pintu.jpg, lorong.jpg, kios-sayur.jpg, kios-buah.jpg (equirectangular 4096x2048) |
| assets/models | cabai.glb, tomat.glb, pisang.glb (< 2 MB) |
| assets/markers | targets.mind (urutan: cabai, tomat, pisang) |
| shared/audio | cabai.mp3, tomat.mp3, pisang.mp3 |

Kepemilikan file ada di `00_KONTEKS_BERSAMA.md` §4.
