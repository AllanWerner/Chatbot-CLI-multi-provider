# Chatbot CLI multi-provider

Chatbot en ligne de commande (Node.js) capable d'interroger plusieurs providers LLM de façon interchangeable, avec streaming des réponses, mémoire de conversation, compression automatique de l'historique, et un jeu de commandes de pilotage (changement de provider, résumé, traduction, métriques de coût/latence). Le projet inclut aussi une API REST (Express) exposant les mêmes fonctionnalités sans streaming.

## Fonctionnalités

- **Multi-provider** : bascule à chaud entre [Mistral](https://mistral.ai) (`mistral-small-latest`) et [Groq](https://groq.com) (`llama-3.3-70b-versatile`) via la commande `/provider`.
- **Streaming** : les réponses de l'assistant s'affichent token par token (lecture du flux SSE renvoyé par l'API du provider).
- **Mémoire de conversation** avec compression automatique : au-delà de `MAX_HISTORY` (20 messages), l'historique est résumé en un seul message système par un appel au LLM, pour ne jamais dépasser la limite de contexte.
- **Garde-fou basique contre l'injection de prompt** : détection par expressions régulières des tentatives de type « ignore tes instructions », « oublie tout », etc.
- **Commandes intégrées** :
  - `/history` — affiche l'historique complet de la conversation (avec indication des messages compressés).
  - `/provider <mistral|groq>` — change de provider actif.
  - `/current` — affiche le provider actif, son modèle et son coût estimé.
  - `/resume` — génère un résumé en bullet points de la conversation en cours (sans modifier l'historique).
  - `/translate <langue>` — traduit le dernier message de l'assistant dans la langue demandée.
  - `/stats` ou `/metrics` — statistiques globales de la session (requêtes, tokens, coût, latence moyenne, compressions).
  - `exit` / `quit` — quitte le programme et affiche les métriques globales.
- **Métriques par requête** : latence totale, temps jusqu'au premier token, tokens consommés (estimés), coût estimé (calculé à partir d'un coût par token indicatif défini par provider).
- **API REST (`api.js`)** : mêmes providers, exposés via Express (sans streaming), avec historique de session, statistiques et health check.

> Le système prompt est un exemple de chatbot service client pour une entreprise fictive (« Acme Corp ») — à adapter selon l'usage.

## Stack technique

- Node.js (ES Modules)
- [Express](https://expressjs.com/) — pour l'API REST
- [dotenv](https://www.npmjs.com/package/dotenv) — chargement des clés API depuis `.env`
- [nodemon](https://www.npmjs.com/package/nodemon) — rechargement à chaud en développement

## Prérequis

- Node.js ≥ 18 (nécessaire pour `fetch` natif et les streams utilisés par le projet)
- Une clé API [Mistral](https://console.mistral.ai/) et/ou [Groq](https://console.groq.com/) (au moins une des deux pour que le chatbot fonctionne)

## Installation

```bash
git clone https://github.com/AllanWerner/Chatbot-CLI-multi-provider.git
cd Chatbot-CLI-multi-provider
npm install
```

Copier le fichier d'exemple et renseigner vos clés API :

```bash
cp .env.example .env
```

```env
MISTRAL_API_KEY=votre_cle_ici
GROQ_API_KEY=votre_cle_ici
HF_API_KEY=votre_cle_ici
```

> `HF_API_KEY` est présente dans `.env.example` mais n'est pas encore utilisée par le code actuel (réservée pour un futur provider Hugging Face) — seules `MISTRAL_API_KEY` et `GROQ_API_KEY` sont nécessaires pour faire fonctionner le chatbot.

## Lancer le projet

### Chatbot en ligne de commande

```bash
npm start
```

ou en mode développement avec rechargement automatique :

```bash
npm run dev
```

Au démarrage, le programme vérifie la présence des clés API puis ouvre une invite interactive :

```
🚀 Chatbot CLI — Phase 7 (Traduction + Métriques complètes)
📝 Commandes: /history, /provider <name>, /current, /stats, /resume, /translate <lang>, /metrics, /exit, /quit
Vous (1/20) :
```

Il suffit de taper un message et d'appuyer sur Entrée pour discuter, ou une commande (ex. `/provider groq`) pour piloter le chatbot.

### API REST

```bash
npm run api
```

Le serveur démarre sur `http://localhost:3000`. Endpoints disponibles :

| Méthode | Route | Description |
|---|---|---|
| GET | `/` | Documentation des endpoints |
| GET | `/chat?q=<message>&provider=<mistral\|groq>` | Envoyer un message (provider par défaut : `mistral`) |
| POST | `/chat` | Envoyer un message via body JSON `{ "message": "...", "provider": "mistral" }` |
| GET | `/history` | Voir l'historique de la conversation en cours |
| DELETE | `/history` | Réinitialiser l'historique |
| GET | `/stats` | Statistiques du serveur (requêtes, tokens, uptime) |
| GET | `/health` | Health check + statut de configuration des providers |

Exemple :

```bash
curl "http://localhost:3000/chat?q=Bonjour&provider=mistral"
```

> L'historique de conversation de l'API est partagé pour toute la durée de vie du serveur (une seule session globale, pas d'isolation par utilisateur) — adapté à une démo, pas à un usage multi-utilisateur en l'état.

## Limites connues

- Le coût par requête est une **estimation** basée sur un tarif par token codé en dur par provider, à titre indicatif (pas de tarification temps réel).
- Le nombre de tokens est celui renvoyé par l'API du provider quand disponible, sinon approximé à `longueur du texte / 4`.
- Pas de tests automatisés à ce jour (`test.js` est un script manuel de vérification des variables d'environnement, pas une suite de tests).

## Licence

ISC (voir `package.json`).
