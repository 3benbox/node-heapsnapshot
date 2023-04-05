FROM node:16

WORKDIR /app
RUN curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl" \
  && chmod +x ./kubectl

ADD ./package.json /app/package.json
ADD ./package-lock.json /app/package-lock.json
RUN npm ci

ADD ./ /app

ENTRYPOINT [ "node", "remote-debug.js" ]
