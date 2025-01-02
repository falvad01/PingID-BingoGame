# Stage 1: Build the Angular app
FROM node:18 as build
WORKDIR /app

# Copy the entire frontend project and build it for production
COPY FrontEnd/ FrontEnd/
RUN cd FrontEnd && npm install --legacy-peer-deps && npm run build

# Copy the production build from the previous stage
COPY --from=build /app/FrontEnd/dist/frontend /app/dist/frontend

# Copy the backend files and install backend dependencies
COPY Backend /app/Backend
RUN cd /app/Backend && npm install --only=production

# Expose port 80 for the application
EXPOSE 80

# Start the Node.js server
ENTRYPOINT ["node", "/app/Backend/app.js"]