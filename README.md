# funchat
A chat room based on swoole.

PHP+Swoole实现的网页即时聊天工具，在线体验：http://funchat.funsoul.org/

# 安装
```markdown
pecl install swoole
```
# 运行
配置Nginx/Apache虚拟主机目录为项目目录,参考如下：

```markdown
server {
    listen       80;
    server_name  your.domain.com;
    index index.html index.php;
    
    location / {
        root   /path/to/funchat/;
        proxy_set_header X-Real-IP $remote_addr;
        if (!-e $request_filename) {
            rewrite ^/(.*)$ /index.php;
        }
    }
    
    location ~ .*\.(php|php5)?$ {
	    fastcgi_pass  127.0.0.1:9000;
	    fastcgi_index index.php;
	    include fastcgi.conf;
    }
}
```
# 配置

- config/server.php 修改服务器信息
- config/database.php 修改数据库MySQL/Redis信息

# 启动
```markdown
php run.php
```

# 关闭
给funchat/stop.sh添加可执行权限
```markdown
chmod a+x stop.sh
```
执行脚本关闭websocket服务
```markdown
./stop.sh run.php
```
