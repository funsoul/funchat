<?php

require_once "RedisDB.php";

//创建websocket服务器对象，监听0.0.0.0:9502端口
$ws = new swoole_websocket_server("0.0.0.0", 29501);

//监听WebSocket连接打开事件
$ws->on('open', function ($ws, $request) {
    global $redis;
//    $redis->flushAll(); # 清空所有数据库
    if(!$redis->exists($request->fd)){
        $redis->setex($request->fd, 3600, 'fd');
    }
    $fds = $redis->keys('*');

    $userList = [];
    foreach ($fds as $fd) {
        $userList[] = [
            'fd' =>  $fd,
            'username' =>  $redis->get($fd)
        ];
    }

    $ws->push($request->fd, json_encode(['userList' => $userList]));
});

//监听WebSocket消息事件
$ws->on('message', function ($ws, $frame) {
    var_dump(['message--ws: ' => $ws]);
    global $redis;
    $data = json_decode($frame->data,true);
    $user    = $data['from'];
    $content = $data['body'];
    $msg = $user." : ".$content;
//var_dump($data);
    $fds = $redis->keys('*');
    foreach($fds as $fd){
        $ws->push($fd,$msg);
    }
});

//监听WebSocket连接关闭事件
$ws->on('close', function ($ws, $fd) {
    global $redis;
    $redis->delete($fd);
    $fds = $redis->keys('*');
    var_dump(['after delete: ' =>$fds]);
    echo "client-{$fd} is closed\n";
});

$ws->start();
