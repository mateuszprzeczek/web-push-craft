# Web Push Craft

Projekt do zbierania i wysyłania Web Pushy:
- `embed-script/` – JS osadzany u klienta (Webpack + Firebase)
- `api/` – backend w NestJS
- `client/` – Angularowy kreator powiadomień (do zainicjalizowania)

## Start
1. `cd api && npm install && npm run start`
2. `cd embed-script && npm install && npx webpack`
3. Angular zainicjuj: `ng new client`
