# 1. FROM: Pick the Base OS
# We are grabbing a pre-made Linux environment that has Node v18 installed.
# "alpine" means it is a tiny, lightweight version (Professional standard).
FROM node:18-alpine

# 2. WORKDIR: Set the folder
# We tell Docker: "Do all your work inside a folder called /app"
WORKDIR /app

# 3. COPY: The Dependencies first
# Copy package.json from your computer -> to the container's /app folder.
COPY package.json .

# 4. RUN: Install libraries
# This runs 'npm install' inside the container to download Express.
RUN npm install

# 5. COPY: The Rest
# Copy your index.js and everything else -> to the container.
COPY . .

# 6. EXPOSE: Open the Window
# Tell Docker this app wants to talk on port 3000.
EXPOSE 3000

# 7. CMD: The Start Command
# What happens when we turn the container on? Run this command.
CMD ["node", "src/index.js"]