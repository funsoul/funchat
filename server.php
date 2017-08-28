<?php

require_once "RedisDB.php";

//创建websocket服务器对象，监听0.0.0.0:9502端口
$ws = new swoole_websocket_server("0.0.0.0", 29501);

//监听WebSocket连接打开事件
$ws->on('open', function ($ws, $request) {
    global $redis;
    $redis->lpush("fd", $request->fd);

    $arList = $redis->lrange("fd",0,5);
    print_r($arList);

//    var_dump($request);
    $ws->push($request->fd, "hello, welcome\n");
});

//监听WebSocket消息事件
$ws->on('message', function ($ws, $frame) {
    $msg =  'from'.$frame->fd.":{$frame->data}\n";
var_dump($GLOBALS['fds']);
//exit;
    foreach($GLOBALS['fds'] as $aa){
        $ws->push($aa,$msg);
    }
   // $ws->push($frame->fd, "server: {$frame->data}");
    // $ws->push($frame->fd, "server: {$frame->data}");
});

//监听WebSocket连接关闭事件
$ws->on('close', function ($ws, $fd) {
    $tempArr = array_flip($GLOBALS['fds']);
    unset($tempArr[$fd]);
    $GLOBALS['fds'] = array_flip($tempArr);
    echo "client-{$fd} is closed\n";
});

$ws->start();
