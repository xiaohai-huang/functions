# Use the latest version of the Node.js alpine runtime as the base image
FROM node:alpine


# Set the working directory in the container
WORKDIR /app

# Copy the package.json and yarn.lock files
COPY package.json ./
COPY yarn.lock ./

# Install production dependencies
RUN yarn install --production --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Set the environment to production
ENV NODE_ENV production

# Expose the port that the app will run on
EXPOSE 3000

# Start the app
CMD ["node", "app.js"]