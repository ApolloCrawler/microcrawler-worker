# Microcrawler Worker

## Prerequisities

- [microcrawler-webapp](https://github.com/ApolloCrawler/microcrawler-webapp)


## Getting started

***Clone Sources***

```
git clone https://github.com/AplloCrawler/microcrawler-worker.git
```

***Enter Directory with Sources***

```
cd microcrawler-worker
```

***Install Dependencies***

```
npm install
```

***Run Microcrawler Client***

```
bin/microcrawler-worker.js
```

## Usage

***Show Help***

```
$ ./bin/microcrawler-worker.js -h

  Usage: microcrawler-worker [options]

  Options:

    -h, --help                           output usage information
    -V, --version                        output the version number
    -c, --channel <CHANNEL>              Channel to connect to, default: worker:lobby
    --heartbeat-interval <MILLISECONDS>  Heartbeat interval in milliseconds, default: 10000
    -u, --url <URL>                      URL to connect to, default: ws://localhost:4000/socket
    -t, --token <TOKEN>                  Token used for authorization, default: null
```

***Print Version***

```
$ ./bin/microcrawler-worker.js --version
0.0.1
```

***Connect to Default URL***

```
$ ./bin/microcrawler-worker.js
Connecting to "ws://localhost:4000/socket"
catching up {}
```

***Connect to Custom URL***

```
$ ./bin/microcrawler-worker.js -u ws://example.com/socket
Connecting to "ws://example.com/socket"
catching up {}
```
