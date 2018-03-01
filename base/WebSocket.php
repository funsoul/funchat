<?php

class WebSocket {
    protected $server;
    public function __construct($ip, $port, $workNum, $isDaemon) {
        $this->server = new swoole_websocket_server($ip, $port);
        $this->server->set([
            'worker_num' => $workNum,
            'daemonize' => $isDaemon, //是否作为守护进程
        ]);
        $this->server->on('open', [$this, 'open']);
        $this->server->on('message', [$this, 'message']);
        $this->server->on('close', [$this, 'close']);
        $this->server->start();
    }
}