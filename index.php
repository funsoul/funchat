<!doctype html>
<html lang="en">

	<head>
		<meta charset="UTF-8" />
		<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />
		<meta name="viewport" content="width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1,user-scalable=no" />
		<title>FunChat</title>
		<link rel="stylesheet" type="text/css" href="static/css/chat.css" />

		<script src="static/js/jquery.min.js"></script>
		<script src="static/js/flexible.js"></script>
	</head>

	<body>
        <div class="left" style="position: fixed;left: 100px;top: 200px;">
            <p>Online</p>
            <ul id="userList"></ul>
        </div>
		<header class="header">
			<a class="back" href="javascript:history.back()"></a>
			<h5 class="tit">FunChat</h5>
			<div class="right">资料</div>
		</header>
		<div class="message">
			<div class="send">
				<div class="time">05/22 06:30</div>
				<div class="msg">
					<img src="static/images/touxiang.png" alt="" />
					<p><i class="msg_input"></i>1</p>
				</div>
			</div>
			<div class="show">
				<div class="time">05/22 06:30</div>
				<div class="msg">
					<img src="static/images/touxiangm.png" alt="" />
					<p><i class="msg_input"></i>2</p>
				</div>
			</div>
		</div>
		<div class="footer">
			<img src="static/images/hua.png" alt="" />
			<img src="static/images/xiaolian.png" alt="" />
			<input id="content" type="text"  />
			<p id="sendBtn" onclick="sendMsg()">发送</p>
		</div>
	<script src="static/js/chat.js" type="text/javascript" charset="utf-8"></script>
    <script>
      <?php
      $websocketConfig = require 'config/server.php';
      $wsServer = 'ws://'.$websocketConfig['websocket']['host'].':'.$websocketConfig['websocket']['port'];
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

//      function reply(v) {
//        var toUserId = v.id;
//        var toUserName = v.innerHTML;
//        document.getElementById('content').innerHTML = '回复 '+ toUserName;
//        document.getElementById('toUserId').value = toUserId;
//      }

      function sendMsg(){
        var text = document.getElementById('content').value;
        //向服务器发送数据
        websocket.send(JSON.stringify({
          from: 'jack',
          body:text
        }));
      }
      //监听连接关闭
      websocket.onclose = function (evt) {
        console.log("Disconnected");
      };

      //onmessage 监听服务器数据推送
      websocket.onmessage = function (evt) {
        if(evt.data) {
          data = JSON.parse(evt.data);
          if(data.userList) {
            for(var i=0;i<data.userList.length;i++){
              userList.innerHTML += '<li><a href="#" onclick="reply(this)" id="'+ data.userList[i].fd +'">' + data.userList[i].username + '</a></li>';
            }
          }
          if(data.msg) {
            send("../static/images/touxiang.png",data.msg)
          }
          console.log(data);
        }
      };
      //监听连接错误信息
      websocket.onerror = function (evt, e) {
        console.log('Error occured: ' + evt.data);
      };

    </script>
	</body>

</html>