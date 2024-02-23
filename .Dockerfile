# Stage 1: Build the Nuxt 3 application
FROM node:16 as build-stage

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy project files and folders to the current working directory (i.e. 'app' folder)
COPY . .

# Build the app
RUN npm run build

# Stage 2: Setup the production environment
FROM node:16 as production-stage

# Set the working directory
WORKDIR /app

# Copy built assets from the build stage
COPY --from=build-stage /app/.output ./.output

# Install a server to serve the app, e.g., npm package 'serve'
# If your app does not need a server then this step can be skipped
RUN npm install -g serve

# Expose the port the app runs on
EXPOSE 3000

# Serve the app using 'serve'
CMD ["serve", "-s", ".output/public", "-p", "3000"]
