<?php

$RedisConfig = require 'config/database.php';
//连接本地的 Redis 服务
$redis = new Redis();
$redis->connect($RedisConfig['redis']['host'], $RedisConfig['redis']['port']);
echo "Connection to server sucessfully";
//查看服务是否运行
echo "Server is running: " . $redis->ping() . chr(10);
