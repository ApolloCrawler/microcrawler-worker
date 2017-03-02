FROM mhart/alpine-node:6.7.0

# Install required dependencies (Alpine Linux packages)
RUN apk update && \
  apk add --no-cache \
    cmake \
    g++ \
    gcc \
    gd-dev \
    git \
    libev-dev \
    libevent-dev \
    libuv-dev \
    make \
    openssl-dev \
    perl \
    python

RUN git clone git://github.com/couchbase/libcouchbase.git && \
   cd libcouchbase && \
   git checkout 2.5.8 && \
   mkdir build && \
   cd build && \
   ../cmake/configure && \
   make && \
   make install && \
   cd ..

# Copy required stuff
ADD . .

# If you need npm, don't use a base tag
RUN mkdir -p /root/.microcrawler && \
  touch /root/.microcrawler/token.jwt && \
  npm install

# RUN npm install -g babel-cli gulp

RUN npm run gulp

ENTRYPOINT ["./bin/microcrawler-worker.js"]
