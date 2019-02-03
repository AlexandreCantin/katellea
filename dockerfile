FROM ubuntu:18.04

# Update apt-cache
RUN apt-get update
RUN apt-get -y install curl bzip2 gnupg

# Install Node.js and create-react-app
RUN curl -sL https://deb.nodesource.com/setup_11.x | bash -
RUN apt-get install -y nodejs
ENV NODE_ENV development

# Install pm2
RUN npm install pm2 -g

# Install Node project
ADD package.json /usr/local/node_temp/
WORKDIR /usr/local/node_temp/
RUN npm install --only=production

# Install React project
ADD frontend/package.json /usr/local/react_temp/
WORKDIR /usr/local/react_temp/
RUN npm install
RUN rm -r node_modules/terser
RUN npm install terser@3.14.1 --save-dev

# Copy all the folder
WORKDIR /code/
ADD . /code/

# Link node_modules folders for Node
RUN ln -s /usr/local/node_temp/node_modules node_modules

# Link node_modules folders for React and build project
WORKDIR /code/frontend/
RUN ln -s /usr/local/react_temp/node_modules node_modules
RUN npm run build

# Start application
WORKDIR /code/

CMD "node index.js"