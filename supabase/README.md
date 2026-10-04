# Supabase — SIDIBE STUDIO

## Mise en route

1. Renseigner `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` dans l’environnement de l’application.
2. Exécuter `supabase/migrate-v2.sql` dans Supabase SQL Editor pour une base déjà créée.
3. L’application utilise Supabase Auth pour sécuriser les requêtes cloud.
4. La clé `service_role` ne doit **jamais** être placée dans le frontend.

## Architecture

- `schema.sql` : schéma canonique complet.
- `migrate-v2.sql` : migration sûre pour une base déjà initialisée.
- `../src/utils/supabaseAuth.ts` : session Auth Supabase côté client.
- `../src/utils/cloudSync.ts` : synchronisation REST avec le jeton utilisateur.

## Sécurité

Les tables sont protégées par RLS. Le frontend envoie le `access_token` Supabase dans le header Authorization ; l’API ne doit pas être appelée avec la seule clé anon pour des données privées.
