FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
ARG ENV_MY_FRONT_B64
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Création du fichier .env à partir du Base64 pour préserver les retours à la ligne
RUN echo "$ENV_MY_FRONT_B64" | base64 -d > .env

# Log des clés trouvées pour vérification (sans les valeurs)
# RUN echo "✅ .env created with $(wc -l < .env) lines"
# RUN echo "Double check - Keys found:" && grep -o "^[^=]*=" .env | sed 's/[[:space:]]*=//' || true

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Utiliser l'utilisateur temporairement pour copier les fichiers avec les bonnes permissions
USER nextjs

COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
# La commande COPY avec l'option --chown gère la propriété des fichiers lors du transfert !
# Le dossier .next/standalone contient déjà une partie de .next
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Note: Il n'est plus nécessaire de faire 'mkdir .next' ou 'chown' manuellement ici

EXPOSE 3000

ENV PORT=3000

# set hostname to localhost
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
