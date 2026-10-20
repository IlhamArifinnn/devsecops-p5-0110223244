# TaskFlow API

[![DevSecOps Pipeline](https://github.com/IlhamArifinnn/devsecops-p5-0110223244/actions/workflows/devsecops.yml/badge.svg)](https://github.com/IlhamArifinnn/devsecops-p5-0110223244/actions/workflows/devsecops.yml)

Repository praktik **DevSecOps Pertemuan 5 — Integrasi SAST dalam CI/CD Pipeline dengan GitHub Actions**
(S1 Teknik Informatika, STT Terpadu Nurul Fikri · NIM 0110223244).

## 1. Nama Aplikasi & Fungsinya

**TaskFlow API** adalah REST API sederhana untuk mengelola daftar tugas (to-do). Fitur utama:

- CRUD task (judul, deskripsi, prioritas, status, tenggat)
- Filter task berdasarkan status dan prioritas
- Ringkasan statistik task (jumlah per status/prioritas dan persentase selesai)
- Endpoint untuk mengunduh file laporan dari folder `exports/`

Data disimpan in-memory (tanpa database) karena fokus praktik ini adalah pipeline keamanan, bukan aplikasinya.

## 2. Bahasa & Framework

| Komponen | Teknologi |
| --- | --- |
| Bahasa | JavaScript (Node.js 22) |
| Framework | Express 5 |
| Unit test | Jest + Supertest |
| CI/CD | GitHub Actions |
| SAST | CodeQL, SonarQube (Community Build) |

## 3. Cara Menjalankan

```bash
# 1. Install dependency
npm ci

# 2. Jalankan unit test + coverage
npm test

# 3. Jalankan server (default http://localhost:3000)
npm start
```

Contoh pemakaian:

```bash
curl http://localhost:3000/health

curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Belajar GitHub Actions","priority":"high"}'

curl http://localhost:3000/api/tasks
curl http://localhost:3000/api/tasks/stats
curl http://localhost:3000/api/export/sample-report.txt
```

### Daftar endpoint

| Method | Path | Keterangan |
| --- | --- | --- |
| GET | `/health` | Cek status server |
| GET | `/api/tasks` | Daftar task (opsional `?status=` dan `?priority=`) |
| GET | `/api/tasks/stats` | Ringkasan statistik |
| GET | `/api/tasks/:id` | Detail satu task |
| POST | `/api/tasks` | Buat task baru |
| PUT | `/api/tasks/:id` | Ubah task |
| DELETE | `/api/tasks/:id` | Hapus task |
| GET | `/api/export/:name` | Unduh file dari folder `exports/` |

### Struktur project

```
src/
├── app.js                  # perakitan aplikasi Express
├── server.js               # entry point (app.listen)
├── config.js               # konfigurasi
├── routes/                 # tasks.js, export.js
├── services/taskService.js # logika bisnis (in-memory)
├── middleware/             # requestLogger.js, errorHandler.js
└── utils/                  # validator.js, id.js
tests/                      # unit & integration test (Jest)
.github/workflows/devsecops.yml
sonar-project.properties
```

## 4. Overview Pipeline CI/CD

Workflow: [`.github/workflows/devsecops.yml`](.github/workflows/devsecops.yml)

**Trigger:** `push` ke `main`, `pull_request` ke `main`, dan `workflow_dispatch` (manual).

```
        ┌──────────────────────┐
        │  build               │  npm ci → npm test (coverage) → upload lcov
        └──────────┬───────────┘
          needs: build│
        ┌────────────┴─────────────┐
        ▼                          ▼
┌──────────────────┐   ┌──────────────────────────────┐
│ sast-scan        │   │ sonarqube-scan               │
│ CodeQL           │   │ SonarQube + Quality Gate     │
│ (push & PR)      │   │ (push/manual, bukan PR)      │
└──────────────────┘   └──────────────────────────────┘
```

| Job | Fungsi | Runner |
| --- | --- | --- |
| `build` | Install dependency, jalankan unit test, hasilkan laporan coverage | `ubuntu-latest` |
| `sast-scan` | Analisis statis dengan **CodeQL**; hasil tampil di tab *Security → Code scanning* | `ubuntu-latest` |
| `sonarqube-scan` | Analisis dengan **SonarQube**, lalu **Quality Gate** memblokir pipeline jika standar tidak terpenuhi | `ubuntu-latest` |

Kredensial SonarQube disimpan sebagai **GitHub Secrets** (`SONAR_TOKEN`, `SONAR_HOST_URL`) dan tidak pernah ditulis di file YAML.
