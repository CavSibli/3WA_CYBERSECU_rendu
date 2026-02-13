# Configuration OTP (Authentification à deux facteurs)

## Variables d'environnement

Ajoutez la variable suivante dans votre fichier `.env` :

```env
APP_NAME="EventHub"
```

Cette variable est utilisée pour générer le QR code OTP avec le nom de l'application.

## Migration de base de données

Après avoir modifié le schéma Prisma, exécutez la migration :

```bash
npx prisma migrate dev --name add_otp_support
```

## Utilisation

### Activation OTP

1. L'utilisateur se connecte à son compte
2. Va dans la section "Paramètres de sécurité" du Dashboard
3. Clique sur "Activer l'OTP"
4. Scanne le QR code avec son application d'authentification (Google Authenticator, Authy, etc.)
5. Entre le code de vérification affiché par l'application
6. Reçoit les codes de secours (à conserver en lieu sûr)

### Connexion avec OTP

1. L'utilisateur entre son email et mot de passe
2. Si OTP est activé, un formulaire de vérification OTP s'affiche
3. L'utilisateur entre le code à 6 chiffres de son application d'authentification
4. Ou utilise un code de secours si nécessaire

### Codes de secours

- Générés automatiquement lors de l'activation OTP
- 8 codes par défaut
- Peuvent être régénérés depuis le Dashboard
- À conserver en lieu sûr (affichés une seule fois)

## Sécurité

- Rate limiting : 4 tentatives par minute pour les routes OTP
- Rate limiting : 5 tentatives par 15 minutes pour les routes d'authentification
- Protection contre les tentatives consécutives échouées (blocage après 5 tentatives)
- Codes de secours stockés en base de données (sérialisés en JSON)

## API Endpoints

### OTP Management (nécessite authentification)

- `GET /api/a2f/qrcode` - Récupérer le QR code pour activer l'OTP
- `POST /api/a2f/enable` - Activer l'OTP (body: `{ secret, code }`)
- `POST /api/a2f/verify` - Vérifier un code OTP (body: `{ code }`)
- `POST /api/a2f/disable` - Désactiver l'OTP
- `POST /api/a2f/regenerate-backup-codes` - Régénérer les codes de secours

### Authentification

- `POST /api/auth/login` - Connexion (retourne `requiresOtp: true` si OTP activé)
- `POST /api/auth/verify-otp` - Finaliser la connexion avec OTP (body: `{ email, password, code }`)

