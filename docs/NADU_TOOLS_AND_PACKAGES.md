# 🛠️ NADU - כלים וחבילות מלא

**מדריך מקיף:** כל הכלים, ההגדרות, והחבילות לפרויקט NADU  
**תאריך:** 2026-01-08

---

## 📦 1. NPM Packages - רשימה מלאה

### Core Dependencies (production)
```json
{
  "dependencies": {
    "next": "^15.1.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "typescript": "^5.7.0",
    
    "firebase": "^11.1.0",
    "firebase-admin": "^13.1.0",
    "firebase-functions": "^6.1.0",
    
    "@tiptap/react": "^2.10.0",
    "@tiptap/starter-kit": "^2.10.0",
    "@tiptap/extension-link": "^2.10.0",
    
    "zod": "^3.24.0",
    "date-fns": "^4.1.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.6.0"
  }
}
```

### Dev Dependencies
```json
{
  "devDependencies": {
    "@types/node": "^22.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    
    "eslint": "^9.0.0",
    "eslint-config-next": "^15.1.0",
    "eslint-config-prettier": "^9.1.0",
    "eslint-plugin-prettier": "^5.2.0",
    "@typescript-eslint/parser": "^8.0.0",
    "@typescript-eslint/eslint-plugin": "^8.0.0",
    
    "prettier": "^3.4.0",
    "prettier-plugin-tailwindcss": "^0.6.0",
    
    "husky": "^9.1.0",
    "lint-staged": "^15.2.0",
    
    "tailwindcss": "^4.0.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    
    "@testing-library/react": "^16.0.0",
    "@testing-library/jest-dom": "^6.6.0",
    "vitest": "^2.1.0",
    "@vitest/ui": "^2.1.0"
  }
}
```

---

## ⚙️ 2. כל קבצי ההגדרות

### package.json - Scripts מלא
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "format": "prettier --check './**/*.{js,jsx,ts,tsx,json,css,md}'",
    "format:fix": "prettier --write './**/*.{js,jsx,ts,tsx,json,css,md}'",
    "type-check": "tsc --noEmit",
    
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    
    "emulators": "firebase emulators:start --import=./emulator-data",
    "emulators:export": "firebase emulators:export ./emulator-data",
    
    "validate": "npm run type-check && npm run lint && npm run format",
    "prepare": "husky install"
  }
}
```

### tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["DOM", "DOM.Iterable", "ES2022"],
    "jsx": "preserve",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "resolveJsonModule": true,
    "allowJs": true,
    "noEmit": true,
    "incremental": true,
    
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "forceConsistentCasingInFileNames": true,
    
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "isolatedModules": true,
    
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/types/*": ["./src/types/*"],
      "@/app/*": ["./src/app/*"]
    },
    
    "plugins": [
      {
        "name": "next"
      }
    ]
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts"
  ],
  "exclude": [
    "node_modules",
    ".next",
    "out",
    "build"
  ]
}
```

### eslint.config.mjs (Next.js 15)
```javascript
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.config({
    extends: [
      'next/core-web-vitals',
      'next/typescript',
      'prettier'
    ],
    plugins: ['prettier'],
    rules: {
      'prettier/prettier': ['error', {
        endOfLine: 'auto'
      }],
      '@typescript-eslint/no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }],
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-console': ['warn', {
        allow: ['warn', 'error']
      }]
    }
  })
];

export default eslintConfig;
```

### .prettierrc
```json
{
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "semi": true,
  "singleQuote": true,
  "quoteProps": "as-needed",
  "jsxSingleQuote": false,
  "trailingComma": "es5",
  "bracketSpacing": true,
  "bracketSameLine": false,
  "arrowParens": "always",
  "endOfLine": "lf",
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

### .prettierignore
```
.next
next-env.d.ts
node_modules
out
build
dist
*.log
.firebase
emulator-data
public
.env*
```

### .eslintignore
```
.next
next-env.d.ts
node_modules
out
build
dist
*.config.js
*.config.mjs
public
.firebase
emulator-data
```

### .gitignore
```
# Dependencies
node_modules
.pnp
.pnp.js

# Testing
coverage

# Next.js
.next/
out/
build

# Production
dist

# Misc
.DS_Store
*.pem

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Local env files
.env*.local
.env

# Vercel
.vercel

# TypeScript
*.tsbuildinfo
next-env.d.ts

# Firebase
.firebase
emulator-data/
firebase-debug.log
firestore-debug.log
ui-debug.log
functions-debug.log

# IDEs
.vscode/*
!.vscode/settings.json
!.vscode/extensions.json
.idea
*.swp
*.swo
*~
```

### .vscode/settings.json
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[json]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "files.associations": {
    "*.css": "tailwindcss"
  },
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"],
    ["cn\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ]
}
```

### .vscode/extensions.json
```json
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "usernamehw.errorlens",
    "christian-kohler.path-intellisense",
    "formulahendry.auto-rename-tag",
    "ms-azuretools.vscode-docker"
  ]
}
```

### tailwind.config.ts
```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
      },
      // RTL support
      spacing: {
        'safe-inset-top': 'env(safe-area-inset-top)',
        'safe-inset-bottom': 'env(safe-area-inset-bottom)',
        'safe-inset-left': 'env(safe-area-inset-left)',
        'safe-inset-right': 'env(safe-area-inset-right)',
      },
    },
  },
  plugins: [],
};

export default config;
```

### next.config.ts
```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  
  // RTL support
  i18n: {
    locales: ['he', 'en'],
    defaultLocale: 'he',
    localeDetection: false,
  },
  
  // Images
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        pathname: '/v0/b/**',
      },
    ],
  },
  
  // Headers for security
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  
  // Environment variables validation
  env: {
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  },
};

export default nextConfig;
```

### .env.local.example
```bash
# Firebase Client (Public)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef

# Firebase Admin (Server-side - DO NOT COMMIT)
FIREBASE_ADMIN_PROJECT_ID=your_project_id
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk@your_project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY_HERE\n-----END PRIVATE KEY-----\n"

# App Check (Cloudflare Turnstile)
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your_turnstile_site_key
TURNSTILE_SECRET_KEY=your_turnstile_secret_key

# Environment
NODE_ENV=development
```

---

## 🔧 3. Husky + Lint-staged

### Setup:
```bash
# Install
npm install --save-dev husky lint-staged

# Initialize Husky
npx husky install
npm pkg set scripts.prepare="husky install"

# Add pre-commit hook
npx husky add .husky/pre-commit "npx lint-staged"
```

### .lintstagedrc.js
```javascript
module.exports = {
  '*.{js,jsx,ts,tsx}': [
    'eslint --fix',
    'prettier --write',
  ],
  '*.{json,css,md}': [
    'prettier --write',
  ],
};
```

### .husky/pre-commit
```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Run type check
npm run type-check

# Run lint-staged
npx lint-staged

# Run tests (optional)
# npm test
```

---

## 🎨 4. Cursor IDE Extensions

### Must Have:
```json
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "usernamehw.errorlens",
    "christian-kohler.path-intellisense",
    "formulahendry.auto-rename-tag"
  ]
}
```

### Nice to Have:
```json
{
  "recommendations": [
    "ms-azuretools.vscode-docker",
    "eamodio.gitlens",
    "github.copilot",
    "prisma.prisma",
    "firefox-devtools.vscode-firefox-debug",
    "yoavbls.pretty-ts-errors"
  ]
}
```

### Cursor Settings:
```json
{
  "cursor.aiModel": "claude-3.5-sonnet",
  "cursor.composer.enabled": true,
  "cursor.chat.enabled": true,
  "cursor.cpp.disabledLanguages": [],
  "cursor.general.enableShadowWorkspace": true
}
```

---

## 🔥 5. Firebase Configuration Files

### firebase.json
```json
{
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "functions": [
    {
      "source": "functions",
      "codebase": "default",
      "runtime": "nodejs20"
    }
  ],
  "hosting": {
    "public": "out",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(jpg|jpeg|gif|png|svg|webp)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      }
    ]
  },
  "storage": {
    "rules": "storage.rules"
  },
  "emulators": {
    "auth": {
      "port": 9099
    },
    "firestore": {
      "port": 8080
    },
    "functions": {
      "port": 5001
    },
    "storage": {
      "port": 9199
    },
    "ui": {
      "enabled": true,
      "port": 4000
    },
    "singleProjectMode": true
  }
}
```

### firestore.rules (starter)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function hasRole(role) {
      return isAuthenticated() && request.auth.token.role == role;
    }
    
    function isOwner(uid) {
      return isAuthenticated() && request.auth.uid == uid;
    }
    
    // Users collection
    match /users/{uid} {
      allow read: if isAuthenticated();
      allow write: if false; // Use Cloud Functions
    }
    
    // Posts collection
    match /posts/{postId} {
      allow read: if isAuthenticated();
      allow write: if false; // Use Cloud Functions
    }
  }
}
```

### storage.rules
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    // Profile photos
    match /users/{uid}/photos/{photoId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == uid
        && request.resource.size < 5 * 1024 * 1024  // 5MB
        && request.resource.contentType.matches('image/.*');
    }
    
    // Post media
    match /posts/{postId}/media/{mediaId} {
      allow read: if request.auth != null;
      allow write: if false; // Upload via Functions
    }
  }
}
```

---

## 📝 6. TypeScript Types Structure

### src/types/index.ts
```typescript
// Firebase
export type { User, DocumentReference, Timestamp } from 'firebase/firestore';

// App types
export interface AppUser {
  uid: string;
  email: string;
  username: string;
  displayName: string;
  photoURL?: string;
  role: 'dom' | 'sub' | 'switch' | 'curious' | 'other';
  createdAt: Date;
  updatedAt: Date;
}

export interface Post {
  postId: string;
  authorUid: string;
  authorUsername: string;
  title: string;
  content: string;
  isAnonymous: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Form types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData extends LoginFormData {
  username: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

// API responses
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}
```

---

## 🧪 7. Testing Setup

### vitest.config.ts
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### src/test/setup.ts
```typescript
import '@testing-library/jest-dom';
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

expect.extend(matchers);

afterEach(() => {
  cleanup();
});
```

---

## 🚀 8. Utility Functions

### src/lib/cn.ts (className merger)
```typescript
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### src/lib/firebase.ts
```typescript
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);
const functions = getFunctions(app);
const storage = getStorage(app);

// Connect to emulators in development
if (process.env.NODE_ENV === 'development') {
  connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectFunctionsEmulator(functions, 'localhost', 5001);
  connectStorageEmulator(storage, 'localhost', 9199);
}

export { app, auth, db, functions, storage };
```

---

## ✅ 9. מהירות Setup

### הפקודה האחת (copy-paste):
```bash
# Install all packages
npm install next@15 react@19 react-dom@19 typescript firebase firebase-admin firebase-functions @tiptap/react @tiptap/starter-kit @tiptap/extension-link zod date-fns clsx tailwind-merge

npm install --save-dev @types/node @types/react @types/react-dom eslint eslint-config-next eslint-config-prettier eslint-plugin-prettier @typescript-eslint/parser @typescript-eslint/eslint-plugin prettier prettier-plugin-tailwindcss husky lint-staged tailwindcss postcss autoprefixer @testing-library/react @testing-library/jest-dom vitest @vitest/ui

# Initialize Husky
npx husky install
npm pkg set scripts.prepare="husky install"
npx husky add .husky/pre-commit "npx lint-staged"

# Initialize Tailwind
npx tailwindcss init -p
```

---

## 📊 10. סיכום כלים לפי קטגוריה

| קטגוריה | כלי | מטרה |
|----------|-----|------|
| **Framework** | Next.js 15 | App Router, SSR, RSC |
| **Language** | TypeScript | Type safety |
| **Backend** | Firebase | Auth, DB, Storage, Functions |
| **Styling** | Tailwind CSS | Utility-first CSS + RTL |
| **Rich Text** | Tiptap | WYSIWYG editor |
| **Validation** | Zod | Schema validation |
| **Linting** | ESLint | Code quality |
| **Formatting** | Prettier | Code style |
| **Git Hooks** | Husky | Pre-commit checks |
| **Testing** | Vitest | Unit/integration tests |
| **IDE** | Cursor | AI-powered coding |

---

## 🎯 Best Practices סיכום

### DO ✅
- Format on save
- Lint before commit
- Type check before push
- Use emulators always
- Write tests
- Use Zod for validation
- Follow naming conventions
- Document complex logic

### DON'T ❌
- Commit without linting
- Skip type checking
- Use `any` type
- Hardcode secrets
- Test on production
- Ignore ESLint warnings
- Format manually
- Skip documentation

---

**הכל מוכן!** כל קובץ, כל חבילה, כל הגדרה. 🚀
