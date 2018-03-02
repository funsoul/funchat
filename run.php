<?php
require_once ('./base/WebSocket.php');
require_once ('./lib/function/Utils.php');

const MSG_TYPE_LOGIN = 1;
const MSG_TYPE_DISPATCH = 2;
const MSG_TYPE_SINGLE = 3;
const MSG_TYPE_CLOSE = 4;
const MSG_TYPE_OFFLINE = 5;

class WebSocketServer extends WebSocket
{
    private $_server_config = [];
    private $_db_config = [];
    private $redis;
    public function __construct()
    {
        $this->_server_config = require 'config/server.php';
        $this->_db_config = require 'config/database.php';

        $this->redis = new Redis();
        $this->redis->connect(
            $this->_db_config['REDIS']['HOST'],
            $this->_db_config['REDIS']['PORT']
        );
        $this->redis->set("fd", "[]");

        parent::__construct(
            $this->_server_config['LOCALHOST']['HOST'],
            $this->_server_config['LOCALHOST']['PORT'],
            $this->_server_config['LOCALHOST']['WORKER_NUM'],
            $this->_server_config['LOCALHOST']['IS_DAEMON']
        );
    }

    public function open(swoole_websocket_server $server, swoole_http_request $req)
    {
        echo "\n connection open: " . $req->fd . "\n";
        echo $this->redis->ping();
        $depkg = json_decode($this->redis->get("fd"), true);
        if ($depkg == "") $depkg = [];
        if (!isset($depkg[$req->fd])) {
            $depkg[$req->fd] = [];
            $enpkg = json_encode($depkg);
            $this->redis->set("fd", $enpkg);
        }
    }

    public function message(swoole_websocket_server $server, swoole_websocket_frame $frame)
    {
        echo "\n message: " . $frame->data . "\n";

        $data = json_decode($frame->data,true);
        $depkg = json_decode($this->redis->get("fd"), true);
        $depkg[$frame->fd] = $data['fromWho'];

        $enpkg = json_encode($depkg);
        $this->redis->set("fd", $enpkg);

        $this->respMessage([
            'server' => $server,
            'type' => $data['type'],
            'fd' => $frame->fd,
            'depkg' => $depkg,
            'frame' => $frame
        ]);
    }

    public function close(swoole_websocket_server $server, $fd)
    {
        echo "\n 连接关闭: \n" . $fd;
        $depkg = json_decode($this->redis->get("fd"), true);
        $userName = $depkg[$fd];
        unset($depkg[$fd]);
        $enpkg = json_encode($depkg);
        $this->redis->set("fd", $enpkg);
        $this->respMessage([
            'server' => $server,
            'type' => MSG_TYPE_CLOSE,
            'fd' => $fd,
            'depkg' => $depkg,
            'username' => $userName
        ]);
    }

    private function respMessage($data)
    {
        switch ($data['type']){
            case MSG_TYPE_LOGIN:
                $userList = [];
                foreach ($data['depkg'] as $fd => $username){
                    $userList[] = [
                        'fd' => $fd,
                        'username' => $username
                    ];
                }
                $res = json_encode(['userList' => $userList]);
                $data['server']->push($fd, $res);
                break;
            case MSG_TYPE_DISPATCH:
                foreach ($data['depkg'] as $fd => $value){
                    $data['server']->push($fd, $data['frame']->data);
                }
                break;
            case MSG_TYPE_SINGLE:
                $dedata= json_decode($data['frame']->data,true);
                if($data['server']->exist($dedata['toWho'])){
                    $data['server']->push($dedata['toWho'], $data['frame']->data);
                }else{
                    $res = json_encode(['type' => MSG_TYPE_OFFLINE, 'content' => $dedata['toWho']]);
                    $data['server']->push($data['fd'], $res);
                }
                break;
            case MSG_TYPE_CLOSE:
                $res = json_encode(['type' => MSG_TYPE_CLOSE, 'content' => $data['username']]);
                foreach ($data['depkg'] as $fd => $username){
                    $data['server']->push($fd, $res);
                }
                break;
        }
    }
}

new WebSocketServer();