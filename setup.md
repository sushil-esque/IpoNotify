npm init -y
npm i express
npm i -D typescript
npm i -D @types/express
npx tsc --init //creates tsconfig.json
in tsconfig set "rootDir": "./src", and "outDir": "./dist"
also set "module": "CommonJS" and "esModuleInterop": true to allow ES imports in a CommonJS project.

in package.json, inside scripts add "build" and "start" like this:
"scripts": {
"test": "echo \"Error: no test specified\" && exit 1",
"build" : "tsc --build",
"start": "node ./dist/index.js"
},

npm i -D nodemon tsx
then in scripts add start:dev using tsx to run typescript directly:
"start:dev": "nodemon ./src/index.ts"

npm i express-session
npm i -D @types/express-session

---

### Troubleshooting: "Duplicate identifier 'SessionStore'" Error

**Issue:** After installing `express-session` and its types, you might see a TypeScript error saying `Duplicate identifier 'SessionStore'`.

**Cause:** This happens when VS Code's Automatic Type Acquisition (ATA) tries to download the `@types/express-session` globally (in `AppData\Local\Microsoft\TypeScript`) while you also have it installed locally in your project's `node_modules`. TypeScript ends up loading both definitions, causing a conflict.

**Fix:**
In your `tsconfig.json`, make these changes to prevent global type fetching:

1. **Remove** `"types": []` if it exists.
2. **Add** `"typeAcquisition": { "enable": false }` at the root object level (outside `compilerOptions`).

```json
{
  "compilerOptions": { ... },
  "typeAcquisition": {
    "enable": false
  }
}
```

_Note: After applying the fix, make sure to close any globally cached `index.d.ts` file tabs open in your editor and restart the TS server (`Ctrl + Shift + P` -> "TypeScript: Restart TS server")._

npm install mongoose
npm install --save-dev @types/mongoose

npm install connect-mongo
npm install --save-dev @types/connect-mongo  # optional for TypeScript

for prettier 
in settings.json
"[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
   },