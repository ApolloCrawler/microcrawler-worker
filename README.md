# microcrawler-client
Microcrawler Client

## Prerequisities

- [microcrawler-webapp](https://github.com/ApolloCrawler/microcrawler-webapp)


## Getting started

***Clone Sources***

```
git clone https://github.com/AplloCrawler/microcrawler-client.git
```

***Enter Directory with Sources***

```
cd microcrawler-client
```

***Install Dependencies***

```
npm install
```

***Run Microcrawler Client***

```
bin/microcrawler-client.js
```

## Usage

***Show Help***

```
$ ./bin/microcrawler-client.js -h

  Usage: microcrawler-client [options]

  Options:

    -h, --help       output usage information
    -V, --version    output the version number
    -u, --url <URL>  URL to connect to, default: ws://localhost:4000/socket/longpoll?token=undefined&vsn=1.0.0
```


***Print Version***

```
$ ./bin/microcrawler-client.js --version
0.0.1
```

***Connect to Default URL***

```
$ ./bin/microcrawler-client.js
catching up {}
```

***Connect to Custom URL***

```
$ ./bin/microcrawler-client.js -u ws://example.com/socket/longpoll?token=undefined&vsn=1.0.0
catching up {}
```
