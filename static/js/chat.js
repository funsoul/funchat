const LOGIN = 1;
const DISPATCH = 2;
const SINGLE = 3;
const CLOSE = 4;
const OFFLINE = 5;
const FD_INFO = 6;

function reply(v) {
  var toUserId = v.id;
  var toUserName = v.innerHTML;
  $('#singleChatBox').css('display', 'block');
  $('#singleCurrentUser').attr('user-id', toUserId);
  $('#singleCurrentUser').text('Reply: ' + toUserName);
}

function login() {
  var userName = $('#Account').val();
  if (userName.length == 0) {
    alert('please enter your nickname!');
  } else if (userName.length > 18) {
    alert('Nickname is too long!');
  } else {
    $('#LoginBox').css('display', 'none');
    $('#chatBox').css('display', 'block');
    $('#currentUser').text(userName);
    websocket.send(JSON.stringify({
      type: 1,
      fromWho: userName
    }));
  }
}

function sendMsg(type) {
  var text = document.getElementById('content').value;
  var user = $('#currentUser').text();
  if (type == SINGLE) {
    var userId = parseInt($('#singleCurrentUser').attr('user-id'));
    var text = document.getElementById('singleContent').value;
    if (text.length > 0) {
      var userName = $('#Account').val();
      var replyUserText = $('#singleCurrentUser').text();
      $('#chat').append('<li><div class="item-right"><div class="right"><div class="right-content"><div class="nickname">' + userName + '</div><div class="text">[' + replyUserText + ']' + text + '</div></div><div class="image"><img src="http://n.sinaimg.cn/translate/w1280h1280/20171211/hsEC-fypnsip6872500.jpg" alt=""></div></div></div></li>');
    }
    $("#singleContent").val('');
  } else {
    var userId = '';
    $("#content").val('');
  }
  if (text.length == 0) {
    alert('Please enter content');
    return false;
  }
  //向服务器发送数据
  websocket.send(JSON.stringify({
    type: type,
    fromWho: user,
    toWho: userId,
    content: text
  }));
}

function receive(evt) {
  if (evt.data) {
    data = JSON.parse(evt.data);
    console.log("evt.data", evt.data);
    console.log("data.userList", data.userList);
    if (data.userList) {
      userList.innerHTML = '';
      for (var i = 0; i < data.userList.length; i++) {
        if (data.userList[i].username.length > 1) {
          // userList.innerHTML += '<li><a href="#" onclick="reply(this)" id="' + data.userList[i].fd + '">' + data.userList[i].username + '</a></li>';
          userList.innerHTML += '<a href="#" onclick="reply(this)" id="' + data.userList[i].fd + '"><div class="user-scope">' + '<div class="image"><img src="http://n.sinaimg.cn/translate/w1280h1280/20171211/hsEC-fypnsip6872500.jpg" alt=""></div><div class="nickname">' + data.userList[i].username + '</div></div></a>';
        }
      }
    }
    var currentFd = $('#currentUser').attr('fd');
    switch (data.type) {
      case LOGIN:
        $('#chat').append('<divstyle="color: pink;margin-bottom: 20px; text-align:center;">' + data.fromWho + ' enter the room..</div>');
        break;
      case DISPATCH:
        if (data.fd == currentFd) {
          // $('#chat').append('<li><div class="item-right"><div class="right"><div class="right-content"><div class="nickname">' + data.fromWho + '</div><div class="text">' + data.content + '</div></div><div class="image"><img src="http://n.sinaimg.cn/translate/w1280h1280/20171211/hsEC-fypnsip6872500.jpg" alt=""></div></div></div></li>');
          $('#chat').append('<div class="item"><div class="chat-scope-right"><div class="content"><div class="nickname">' + data.fromWho + '</div><div class="message">' + data.content + '</div></div><div class="avatar"><img src="http://n.sinaimg.cn/translate/w1280h1280/20171211/hsEC-fypnsip6872500.jpg" alt=""></div></div></div>');
        } else {
          // $('#chat').append('<li><div class="item-left"><div class="left"><div class="image"><img src="http://n.sinaimg.cn/translate/w1280h1280/20171211/hsEC-fypnsip6872500.jpg" alt=""></div><div class="left-content"><div class="nickname">' + data.fromWho + '</div><div class="text">' + data.content + '</div></div></div></div></li>');
          $('#chat').append('<div class="item"><div class = "chat-scope-left" ><div class="avatar"><img src="http://n.sinaimg.cn/translate/w1280h1280/20171211/hsEC-fypnsip6872500.jpg" alt=""></div><div class = "content" ><div class="nickname">' + data.fromWho + '</div><div class = "message" >' + data.content + '</div></div></div></div>');
        }
        break;
      case SINGLE:
        if (data.fd == currentFd) {
          $('#chat').append('<li style="color: red;">' + data.content + ' : ' + data.fromWho + '[Private]</li>'); // right
        } else {
          $('#chat').append('<li style="color: red;">[Private]' + data.fromWho + ' : ' + data.content + '</li>'); // left
        }
        break;
      case CLOSE:
        $('#chat').append('<div style="color: orange; text-align:center;">' + data.content + ' left the room.</div>');
        break;
      case OFFLINE:
        var msg = $('#singleCurrentUser').text() + ' [Failed to send : maybe your friend have been offline.]';
        $('#chat').append('<li style="color: blue;">' + msg + '</li>');
        break;
      case FD_INFO:
        $('#currentUser').attr('fd', data.fd);
        break;
    }
    console.log(data);
    var chatDiv = document.getElementById('ChatContainer');
    chatDiv.scrollTop = chatDiv.scrollHeight;
  }
}

function cancel() {
  $("#singleChatBox").css('display', 'none');
}

function empty() {
  var msg = "Clearing records will not be restored.\n\nReally?";
  if (confirm(msg) == true) {
    $('#chat').html('');
    return true;
  } else {
    return false;
  }
}
