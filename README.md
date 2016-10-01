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

***Run Microcrawler Worker***

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

***Example Output***

```
$ ./bin/microcrawler-worker.js --heartbeat-interval 10000
Connecting to "ws://localhost:4000/socket"
Received ok
{
    "msg": "Welcome!"
}
Received event - pong
{
    "version": "0.0.1",
    "os": {
        "uptime": 139871,
        "platform": "darwin",
        "mem": {
            "total": 8589934592,
            "free": 134340608
        },
        "load": [
            2.14794921875,
            2.11328125,
            2.318359375
        ],
        "hostname": "kx-mac.local",
        "endian": "LE",
        "cpus": [
            {
                "times": {
                    "user": 17079150,
                    "sys": 8949760,
                    "nice": 0,
                    "irq": 0,
                    "idle": 65412150
                },
                "speed": 1700,
                "model": "Intel(R) Core(TM) i7-4650U CPU @ 1.70GHz"
            },
            {
                "times": {
                    "user": 7933380,
                    "sys": 3558830,
                    "nice": 0,
                    "irq": 0,
                    "idle": 79947730
                },
                "speed": 1700,
                "model": "Intel(R) Core(TM) i7-4650U CPU @ 1.70GHz"
            },
            {
                "times": {
                    "user": 17069960,
                    "sys": 7510340,
                    "nice": 0,
                    "irq": 0,
                    "idle": 66859640
                },
                "speed": 1700,
                "model": "Intel(R) Core(TM) i7-4650U CPU @ 1.70GHz"
            },
            {
                "times": {
                    "user": 8092410,
                    "sys": 3646170,
                    "nice": 0,
                    "irq": 0,
                    "idle": 79701350
                },
                "speed": 1700,
                "model": "Intel(R) Core(TM) i7-4650U CPU @ 1.70GHz"
            }
        ]
    },
    "name": "microcrawler-worker",
    "msg": "I am still alive!",
    "id": 0,
    "ts": 1475360236777
}
```