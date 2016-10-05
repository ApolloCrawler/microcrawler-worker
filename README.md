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
    -i, --interactive                    Run interactive mode
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
```

***Connect to Custom URL***

```
$ ./bin/microcrawler-worker.js -u ws://example.com/socket
Connecting to "ws://example.com/socket"
```

***Sample Output***

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

***Interactive Mode***

*Server*

```
$ iex -S mix phoenix.server
Erlang/OTP 19 [erts-8.1] [source] [64-bit] [smp:4:4] [async-threads:10] [hipe] [kernel-poll:false] [dtrace]

[info] Running MicrocrawlerWebapp.Endpoint with Cowboy using http://localhost:4000
Interactive Elixir (1.3.3) - press Ctrl+C to exit (type h() ENTER for help)
iex(1)> 05 Oct 20:54:35 - info: compiled 6 files into 2 files, copied 6 in 1.6 sec
[info] JOIN worker:lobby to MicrocrawlerWebapp.WorkerChannel
  Transport:  Phoenix.Transports.WebSocket
  Parameters: %{"token" => nil}
Received join - worker:lobby
{
  "token": null
}
#PID<0.366.0>
[info] Replied worker:lobby :ok
{:basic_consume_ok, %{consumer_tag: "amq.ctag-Rb-fiGVc4xTncGoOKjxyKA"}}
#PID<0.366.0>
Received event - msg
{
  "msg": "Hello World!"
}
Received event - msg
"Hi, how are you?"
Received event - msg
"Received my message?"
Received event - msg
42
Received event - msg
{
  "abc": "123"
}
Received event - msg
{
  "pole": [
    1,
    2,
    3,
    4
  ],
  "msg": "to pole je fakt urodny"
}
{:shutdown, :closed}
#PID<0.366.0>
%Phoenix.Socket{assigns: %{rabb_chan: %AMQP.Channel{conn: %AMQP.Connection{pid: #PID<0.369.0>},
    pid: #PID<0.379.0>}, rabb_conn: %AMQP.Connection{pid: #PID<0.369.0>}},
 channel: MicrocrawlerWebapp.WorkerChannel, channel_pid: #PID<0.366.0>,
 endpoint: MicrocrawlerWebapp.Endpoint, handler: MicrocrawlerWebapp.UserSocket,
 id: nil, joined: true, pubsub_server: MicrocrawlerWebapp.PubSub, ref: nil,
 serializer: Phoenix.Transports.WebSocketSerializer, topic: "worker:lobby",
 transport: Phoenix.Transports.WebSocket, transport_name: :websocket,
 transport_pid: #PID<0.364.0>}
```

*Client*

```
$ ./bin/microcrawler-worker.js -i --heartbeat-interval 3600000
Connecting to "ws://localhost:4000/socket"
Running in interactive mode.
Type "quit" or press ctrl+c twice to exit.
msg> Received ok
{
    "msg": "Welcome!"
}
msg> Hi, how are you?
msg> Received my message?
msg> 42
msg> {"abc": "123"}
msg> {"pole": [1, 2, 3, 4], "msg": "to pole je fakt urodny"}
msg> quit
$
```
