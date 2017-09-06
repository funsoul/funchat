<?php

require_once 'database/RedisDB.php';

$ServerConfig = require 'config/server.php';
//创建websocket服务器对象，监听0.0.0.0:9502端口

$ws = new swoole_websocket_server($ServerConfig['localhost']['host'], $ServerConfig['localhost']['port']);

//监听WebSocket连接打开事件
$ws->on('open', function ($ws, $request) {
//    $redis->flushAll(); # 清空所有数据库

    $userList = getOnlineUsers();
    $ws->push($request->fd, pack(['userList' => $userList]));
});

//监听WebSocket消息事件
$ws->on('message', function ($ws, $frame) {
    dd('message--ws:',$ws);
    dd('message--frame: :',$frame);

    $data = unpack($frame->data);
    switch ($data['action']) {
        case 'login':     // 登录
            $user['fromWho']    = $data['fromWho'];
            $user['email']      = $data['email'];
            $user['fd']         = $frame->fd;
            $user['ip']         = $frame->ip;
            $user['status']     = 1;

            if(setCurrentUser($user)) {
                resp($data['action'],$ws,$frame->fd,'success');
            }else{
                respError($ws,$frame->fd,'login fail');
            }
            break;
        case 'dispatch':  // 群聊
            $fromWho    = $data['fromWho'];
            $content    = $data['content'];
            $msg = pack(['msg' => $fromWho." : ".$content]);
            resp($data['action'],$ws,$frame->fd,$msg);
            break;
        case 'single':    // 私聊
            $fromWho    = $data['fromWho'];
            $content    = $data['content'];
            $toWho      = $data['toWho'];
            $msg = pack(['msg' => $fromWho." : ".$content]);
            resp($data['action'],$ws,$toWho,$msg);
            break;
        default:
            return;
    }
});

//监听WebSocket连接关闭事件
$ws->on('close', function ($ws, $fd) {
    global $redis;
    $redis->del('user:'.$fd);
    $fds = $redis->keys('*');
    dd('after delete: ',$fds);
    echo "client-{$fd} is closed\n";
});

$ws->start();

function resp($action,$ws,$fd,$msg) {
    global $redis;
    switch ($action) {
        case 'login':     // 登录
            $ws->push($fd,$msg);
            break;
        case 'dispatch':  // 群聊
            $fds = $redis->lrange("fd");
            foreach($fds as $fd){
                $ws->push($fd,$msg);
            }
            break;
        case 'single':    // 私聊
            $ws->push($fd,$msg);
            break;
        default:
            return;
    }
}

function respError($ws,$fd,$msg) {
    $ws->push($fd,$msg);
}

function getOnlineUsers() {
    global $redis;
    $fds = $redis->lrange("fd");
    foreach($fds as $val){
        $data[] = $redis->hgetall("user:".$val);
    }
    $data = array_filter($data);//过滤数组中的空元素
    return $data;
}

function setCurrentUser($user) {
    global $redis;
    if(isset($user) && !empty($user)) {
        $res = $redis->hMset('user:'.$user['fd'],$user);
        return $res == 1 ? true : false;
    }else{
        return false;
    }
}

function dispatchMsg() {

}

function clearUser() {

}

function pack($data) {
    return json_encode($data);
}

function unpack($data) {
    if(isset($data) && !empty($data)) {
        return json_decode($data,true);
    }else{
        return [];
    }
}

function dd($prefix = '', $data) {
    if(isset($prefix)) {
        echo $prefix.chr(10);
    }
    if(is_array($data)) {
        var_export($data);
    }else{
        var_dump($data);
    }
}