#!/bin/bash

# Couleurs pour les logs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Démarrage de l'environnement de développement...${NC}"

# Vérifier si Prisma Postgres tourne déjà
if lsof -Pi :51213 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo -e "${YELLOW}✓ Prisma Postgres est déjà actif${NC}"
else
    echo -e "${GREEN}📦 Démarrage de Prisma Postgres en arrière-plan...${NC}"
    npx prisma dev > /dev/null 2>&1 &
    PRISMA_PID=$!

    # Attendre que Prisma soit prêt
    echo -e "${YELLOW}⏳ Attente de Prisma Postgres...${NC}"
    for i in {1..30}; do
        if lsof -Pi :51213 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
            echo -e "${GREEN}✓ Prisma Postgres est prêt !${NC}"
            break
        fi
        sleep 1
    done
fi

echo -e "${GREEN}🔥 Démarrage de Next.js...${NC}"
echo ""

# Démarrer Next.js
next dev --turbopack -p 4490

# Cleanup: Arrêter Prisma si on a Ctrl+C
trap "echo -e '\n${YELLOW}🛑 Arrêt de l'environnement...${NC}'; pkill -f 'prisma dev'; exit" INT TERM
