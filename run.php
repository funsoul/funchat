<?php
require_once ('./base/WebSocket.php');
require_once ('./lib/function/Utils.php');

class WebSocketServer extends WebSocket
{
    private $_server_config = [];
    private $_db_config = [];
    private $_constants = [];
    private $redis;
    public function __construct()
    {
        $this->_server_config = require 'config/server.php';
        $this->_db_config = require 'config/database.php';
        $this->_constants = require 'config/constants.php';

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
        if(!empty($userName)){
            $this->respMessage([
                'server' => $server,
                'type' => $this->_constants['MSG']['TYPE']['CLOSE'],
                'fd' => $fd,
                'depkg' => $depkg,
                'username' => $userName
            ]);
        }
    }

    private function respUserList($data)
    {
        $userList = [];
        foreach ($data['depkg'] as $fd => $username){
            $userList[] = [
                'fd' => $fd,
                'username' => $username
            ];
        }
        $res = json_encode(['userList' => $userList]);
        foreach ($data['depkg'] as $fd => $username){
            $data['server']->push($fd, $res);
        }
    }

    private function respCurrentFdInfo($data)
    {
        $fd = $data['fd'];
        $userName = $data['depkg'][$fd];
        $res = json_encode(['fd' => $fd, 'username' => $userName,'type' => $this->_constants['MSG']['TYPE']['FD_INFO']]);
        $data['server']->push($fd, $res);
    }

    private function respMessage($data)
    {
        switch ($data['type']){
            case $this->_constants['MSG']['TYPE']['LOGIN']:
                $this->respUserList($data);
                $this->respCurrentFdInfo($data);
                foreach ($data['depkg'] as $fd => $value){
                    $data['server']->push($fd, $data['frame']->data);
                }
                break;
            case $this->_constants['MSG']['TYPE']['DISPATCH']:
                $dedata = json_decode($data['frame']->data,true);
                $res = array_merge($dedata,['fd' => $data['fd']]);
                $res = json_encode($res);
                foreach ($data['depkg'] as $fd => $value){
                    $data['server']->push($fd, $res);
                }
                break;
            case $this->_constants['MSG']['TYPE']['SINGLE']:
                $dedata= json_decode($data['frame']->data,true);
                $res = array_merge($dedata,['fd' => $data['fd']]);
                $res = json_encode($res);
                if($data['server']->exist($dedata['toWho'])){
                    $data['server']->push($dedata['toWho'], $res);
                }else{
                    $res = json_encode(['type' => $this->_constants['MSG']['TYPE']['OFFLINE'], 'content' => $dedata['toWho']]);
                    $data['server']->push($data['fd'], $res);
                }
                break;
            case $this->_constants['MSG']['TYPE']['CLOSE']:
                $res = json_encode(['type' => $this->_constants['MSG']['TYPE']['CLOSE'], 'content' => $data['username']]);
                foreach ($data['depkg'] as $fd => $username){
                    $data['server']->push($fd, $res);
                }
                $this->respUserList($data);
                break;
        }
    }
}

new WebSocketServer();