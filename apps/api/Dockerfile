FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
COPY apps/api ./apps/api
COPY packages ./packages
COPY skills ./skills
RUN npm install --workspaces --include-workspace-root
WORKDIR /app/apps/api
EXPOSE 3000
CMD ["npm", "run", "start"]
