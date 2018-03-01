<!doctype html>
<html lang="en">

	<head>
		<meta charset="UTF-8" />
		<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />
		<meta name="viewport" content="width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1,user-scalable=no" />
		<title>FunChat</title>
		<link rel="stylesheet" type="text/css" href="static/css/chat.css" />
		<script src="static/js/jquery.min.js"></script>
		<script src="static/js/chat.js"></script>
	</head>

	<body>
        <div style="display: block" id="LoginBox">
            <div class="row1">
                登录
            </div>
            <div class="row">
                用户名: <span class="inputBox">
                    <input type="text" id="userName" placeholder="请输入昵称..." />
            </div>
            <div class="row">
                <a href="#" id="loginbtn" onclick="login()">登录</a>
            </div>
        </div>
        <div id="chatBox" style="display: none">
          <div class="left" style="position: fixed;left: 100px;top: 200px;">
            <p>Online</p>
            <ul id="userList"></ul>
          </div>
          <ul class="center" id="chat"></ul>
          <input type="text" id="content" name="content" style="width: 200px"><br>
          <span id="currentUser"></span>
          <button id="sendMsg" onclick="sendMsg()">发送</button>
        </div>
    <script>
      <?php
      $websocketConfig = require 'config/server.php';
      $wsServer = 'ws://'.$websocketConfig['WEBSOCKET']['HOST'].':'.$websocketConfig['WEBSOCKET']['PORT'];
      ?>
      var wsServer = "<?php echo $wsServer;?>";
      var userList = document.getElementById('userList');
      //调用websocket对象建立连接：
      //参数：ws/wss(加密)：//ip:port （字符串）
      var websocket = new WebSocket(wsServer);
      //onopen监听连接打开
      websocket.onopen = function (evt) {
        //websocket.readyState 属性：
          /*
           CONNECTING    0    The connection is not yet open.
           OPEN          1    The connection is open and ready to communicate.
           CLOSING       2    The connection is in the process of closing.
           CLOSED        3    The connection is closed or couldn't be opened.
           */
        if(websocket.readyState == 1) {
          console.log('conn!');
        }else{
          usrList.innerHTML = 'no conn!';
        }
      };
      //监听连接关闭
      websocket.onclose = function (evt) {
        console.log("Disconnected");
      };
      //onmessage 监听服务器数据推送
      websocket.onmessage = function (evt) {
        receive(evt);
      };
      //监听连接错误信息
      websocket.onerror = function (evt, e) {
        console.log('Error occured: ' + evt.data);
      };

    </script>
	</body>

</html>