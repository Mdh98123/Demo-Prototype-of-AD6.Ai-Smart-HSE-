# Enterprise HSE Platform - Phase 1 Initialization

This directory contains the foundational artifacts for the Phase 1 Enterprise Architecture upgrade, strictly adhering to the mandated tech stack (Next.js, NestJS, PostgreSQL, Prisma, Turborepo). 

*Note: As this environment currently runs a specialized Vite/Express prototype sandbox, these files have been scaffolded in this export folder. You can download the workspace as a ZIP to execute these commands in your production environment.*

## 1. Monorepo Initialization Commands

Execute the following commands in your local terminal to initialize the enterprise Turborepo structure:

```bash
# 1. Initialize Turborepo Workspace
npx create-turbo@latest enterprise-hse-platform -e basic
cd enterprise-hse-platform

# 2. Clear default templates
rm -rf apps/docs apps/web

# 3. Scaffold Next.js (Frontend)
cd apps
npx create-next-app@latest web --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

# 4. Scaffold NestJS (Backend)
npx @nestjs/cli new api --strict
cd ..

# 5. Scaffold Database Package (Prisma)
mkdir -p packages/database
cd packages/database
npm init -y
npm install @prisma/client
npm install prisma --save-dev
npx prisma init
# Replace the generated schema.prisma with the one provided in packages/database/prisma/schema.prisma
```

## 2. Folder Structure

```text
enterprise-hse-platform/
├── apps/
│   ├── api/                  # NestJS Backend (REST/GraphQL + AI Orchestration)
│   │   ├── src/
│   │   │   ├── auth/         # JWT, MFA, RBAC Logic (Provided)
│   │   │   ├── incidents/    # Incident Management Module
│   │   │   └── ...
│   │   └── package.json
│   └── web/                  # Next.js Frontend (React + Tailwind + Shadcn UI)
│       ├── src/
│       │   ├── app/
│       │   ├── components/ui/# Shadcn Components
│       │   └── ...
│       └── package.json
├── packages/
│   ├── database/             # Prisma ORM & PostgreSQL setup
│   │   ├── prisma/
│   │   │   └── schema.prisma # Core Schema (Provided)
│   │   └── package.json
│   ├── eslint-config/        # Shared Linting
│   ├── typescript-config/    # Shared TS Configs
│   └── ui/                   # Shared UI Components (if scaling beyond one frontend)
├── turbo.json                # Turborepo build pipeline configuration
└── package.json              # Root workspace management
```

## 3. Next Steps

1. Copy the provided `schema.prisma` into `packages/database/prisma/schema.prisma`.
2. Run `npx prisma db push` or `npx prisma migrate dev` to provision the PostgreSQL database.
3. Integrate the provided NestJS Auth & RBAC logic into `apps/api/src/auth`.
4. Run `npm run dev` at the Turborepo root to spin up both Next.js and NestJS concurrently.
