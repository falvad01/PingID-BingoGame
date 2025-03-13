# Stage 1: Build the Angular app
FROM node:22 as build
WORKDIR /app

# Copy the entire frontend project and build it for production
COPY FrontEnd/ ./FrontEnd/
WORKDIR /app/FrontEnd
RUN npm install --legacy-peer-deps 
RUN npm run build --configuration=production

# Stage 2: Set up the final image
FROM node:22 as production
WORKDIR /app

# Copy the backend files and install backend dependencies
COPY Backend/ ./Backend/
WORKDIR /app/Backend
RUN npm ci --only=production

# Copy the production build from the previous stage
COPY --from=build /app/FrontEnd/dist/frontend /app/dist/frontend

# Expose port 3009 for the application
EXPOSE 443
# Start the Node.js server
ENTRYPOINT ["node", "/app/Backend/app.js"]

#docker build -t djavic/bingoWeb:0.1.4 -t djavic/bingoWeb:latest .