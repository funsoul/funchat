<?php
$config = [
    'mysql' => [
        'type'     => 'MySql',
        'host'     => '127.0.0.1',
        'user'     => 'root',
        'password' => '123456',
        'dbname'   => 'test'
    ],
    'redis' => [
        'host' => '127.0.0.1',
        'port' => 6379
    ]
];
return $config;