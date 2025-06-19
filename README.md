# Synchronisation entre le projet Front (Next.js) et l'Admin Payload

## Procédure

1. Modifiez vos modèles, hooks, endpoints, etc. dans le dossier `src/` du projet front.
2. Lancez le script `sync-admin.sh` depuis la racine du projet front :
   ```sh
   ./sync-admin.sh
   ```
3. Vérifiez et complétez le fichier `src/payload.config.ts` du projet admin.
4. Installez les dépendances manquantes dans le projet admin :
   ```sh
   cd ../verrerie-cms-admin
   pnpm install
   pnpm run generate:types
   pnpm dev
   ```
5. Testez l’admin sur http://localhost:3000/admin (ou le port choisi).

## Dossiers synchronisés automatiquement

- `src/collections/`
- `src/globals/`
- `src/fields/`
- `src/endpoints/`
- `src/hooks/`
- `src/access/`
- `src/blocks/`
- `src/utils/`

**Le fichier `payload.config.ts` n’est pas synchronisé automatiquement.  
Adaptez-le manuellement si besoin.**

---

**Attention** :  
Toute modification non synchronisée peut entraîner des bugs ou des incohérences entre l’admin et le front.