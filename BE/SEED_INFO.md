# Production Seed Data Guide

This document explains how to seed production data into the SNBP system.

## Overview

The system includes four seed scripts that should be run in order:

1. **Lookups** - Base kelompok (saintek, soshum, vokasi, agama, seni) and jenjang (S1, D3/D4)
2. **Admin** - Admin user account (requires env vars)
3. **Universitas** - 20 Indonesian universities
4. **Sekolah** - 37 schools from Bekasi area
5. **Prodi** - 63 program studi entries with auto-computed level keketatan

## Prerequisites

### Environment Variables Required

For admin seeding, set these in `.env.local`:

```bash
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your-secure-password
ADMIN_FULLNAME=Admin Name
ADMIN_PHONE=+62812345678
```

### Database Connection

Ensure `DATABASE_URL` is set in `.env.local` pointing to your development or production database.

## Running Seeds

### Individual Seeds

```bash
# Seed lookups (kelompok & jenjang)
npm run seed:lookups

# Seed admin user (requires env vars)
npm run seed:admin

# Seed 20 universities
npm run seed:universitas

# Seed 37 schools
npm run seed:sekolah

# Seed 63 prodi entries
npm run seed:prodi
```

### All Seeds at Once

```bash
# Runs: lookups → admin → universitas → sekolah → prodi
npm run seed:all
```

## Data Sources

### Universities (seed-universitas.ts)
- **Source**: FE/lib/data-univ.ts
- **Count**: 20 universities
- **Fields**: namaUniversitas, singkatan (abbreviation), provinsi, ranking
- **Examples**: UI, ITB, UGM, IPB, UNAIR, UNDIP, UNPAD, UB, UNHAS, etc.
- **Note**: `estimasiNilaiMin` excluded - system auto-computes via prodi entries

### Schools (seed-sekolah.ts)
- **Source**: FE/lib/data-sekolah.ts
- **Count**: 37 schools
- **Fields**: namaSekolah, akreditasi (A/B/C rating)
- **Region**: Bekasi area schools
- **Examples**: SMAN 1 Bekasi, SMKN 2 Bekasi, SMK Negeri 13 Bekasi, etc.
- **Note**: `kecamatan` (district) field excluded - not needed in DB

### Prodi (seed-prodi.ts)
- **Source**: FE/lib/data-univ.ts
- **Count**: 63 program studi entries
- **Fields**: universitasId, programStudi, kelompokId, jenjangId, nilai, levelKeketatan
- **Auto-computed**: levelKeketatan based on nilai thresholds:
  - ≥93: SANGAT_KETAT (red)
  - 88-92.9: KETAT (yellow)
  - 83-87.9: SEDANG (green)
  - <83: TERBUKA (blue)

## Seed Script Flow

Each seed script:
1. Connects to database via PrismaClient
2. Uses `findFirst` + `create`/`update` pattern for idempotency
3. Logs each record with ✓ (created), ↺ (updated), ⚠ (skipped), ✗ (error)
4. Displays summary: "X created, Y skipped"

## Idempotency

All seed scripts are **idempotent** - you can run them multiple times safely:
- If record exists: updates relevant fields
- If record is new: creates it
- No duplicates will be created

## Deployment to Vercel

To seed Vercel production database:

```bash
# 1. Set DATABASE_URL to production Vercel Postgres connection
export DATABASE_URL="postgresql://..."

# 2. Run seed:all
npm run seed:all
```

Or add seed command to Vercel deploy hooks in `vercel.json` (optional).

## Troubleshooting

### "Universitas not found" warning
- Ensure `npm run seed:universitas` ran successfully first
- Check database connection

### "Kelompok/Jenjang not found" warning
- Run `npm run seed:lookups` before prodi seeding
- Verify default lookups exist in database

### Database connection errors
- Verify DATABASE_URL env var is set correctly
- Check database credentials and network access
- For Vercel: ensure connection string is from Vercel dashboard

### Duplicate key errors
- Seeds use findFirst pattern, so duplicates shouldn't occur
- If error persists, check for manual records with same values

## Data Customization

To modify seed data, edit the SNBP_DATA, UNIVERSITAS_DATA, SEKOLAH_DATA, or PRODI_DATA arrays in each seed file.

### Adding more universities
Edit `BE/prisma/seed-universitas.ts` UNIVERSITAS_DATA array - maintain {namaUniversitas, singkatan, provinsi, ranking} structure.

### Adding more schools
Edit `BE/prisma/seed-sekolah.ts` SEKOLAH_DATA array - maintain {namaSekolah, akreditasi} structure.

### Adding more prodi
Edit `BE/prisma/seed-prodi.ts` PRODI_DATA array - maintain {universitas, programStudi, jenjang, kelompok, nilai} structure. Level keketatan auto-computes from nilai.

## Next Steps

After seeding:
1. Verify data in admin panel: `/admin/universitas`, `/admin/sekolah`, `/admin/riwayat`
2. Test creating new prodi via lookup dropdowns
3. Test search functionality across seeded data
4. Test pagination (default limit=5)

---

**Last Updated**: 2026-07-28  
**Seed Version**: 1.0  
**Status**: Production Ready
