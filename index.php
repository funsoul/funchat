<!doctype html>
<html lang="en">

	<head>
		<meta charset="UTF-8" />
		<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />
		<meta name="viewport" content="width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1,user-scalable=no" />
		<title>FunChat</title>
		<link rel="stylesheet" type="text/css" href="static/css/new_chat.css" />
		<script src="static/js/jquery.min.js"></script>
		<script src="static/js/chat.js"></script>
	</head>

	<body>
    <div class="container">
      <div class="main">
      <div class="content">
        <div class="login-box" id="LoginBox">
          <div class="title">
            Welcome to <span style="color: red">Fun</span><span style="color: blue">Chat</span>!<span class="warning" style="color:red;display: none">[The system is being upgraded...]</span>
          </div>
          <div class="logInput">
            <span>Account</span>
            <span class="inputBox">
              <input type="text" id="Account" placeholder="please enter a nickname ..."/>
            </span>
          </div>
          <div class="logBtn">
            <button href="#" id="loginbtn" plain="true" onclick="login()">Log in!</button>
          </div>
        </div>

        <div id="chatBox" class="chat-box">

          <div class="title">
            <span style="color: red;font-weight: bold">Fun</span><span style="color: blue">Chat</span><span class="warning" style="color:red;display: none">[The system is being upgraded...]</span>
          </div>
          <div class="list-box">
            <p class="p">Online List</p>
            <ul id="userList"></ul>
          </div>

          <div class="chat-container" id="ChatContainer">
            <p class="p">Chat Record</p>
            <ul class="center" id="chat"></ul>
          </div>

          <div class="send-container">
            <div class="empty"><button onclick="empty()">empty</button></div>
            <span id="currentUser"></span>
            <span class="input"><input type="text" id="content" name="content" placeholder="say something..." /></span>
            <span class="right"><button id="sendMsg" onclick="sendMsg(2)">send</button></span>
          </div>

        </div>
        <div id="singleChatBox" class="right-box">
          <div class="single-send-container">
            <span id="singleCurrentUser" user-id=""></span>
            <span><input type="text" id="singleContent" name="singleContent" placeholder="say something..." /></span>
            <span><button id="sendMsg" onclick="sendMsg(3)">send</button></span>
            <span><button id="cancel" onclick="cancel()">cancel</button></span>
          </div>
        </div>
      </div>
      </div>
      

      <div class="footer">
        <div class="copyright">
          ©<a href="http://www.funsoul.org/">funsoul.org</a> 2018 备案号：粤ICP备17095160号  | 开发者<a href="http://www.funsoul.org">funsoul</a>
          <a href="http://www.fogcrane.org/">fogcrane</a>| 当前版本 <a href="https://github.com/funsoul/funchat/releases/tag/1.0">funchat-1.0</a>  
        </div>
      </div>
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
          $('.warning').css('display','none');
          console.log('conn!');
        }
      };
      //监听连接关闭
      websocket.onclose = function (evt) {
        $('.warning').css('display','block');
        console.log("Disconnected");
      };
      //onmessage 监听服务器数据推送
      websocket.onmessage = function (evt) {
        receive(evt);
      };
      //监听连接错误信息
      websocket.onerror = function (evt, e) {
        $('.warning').css('display','block');
        console.log('Error occured: ' + evt.data);
      };

    </script>
	</body>

</html>