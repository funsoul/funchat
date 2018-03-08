const LOGIN = 1;
const DISPATCH = 2;
const SINGLE = 3;
const CLOSE = 4;
const OFFLINE = 5;
const FD_INFO = 6;
var relationship = [];
var relationId = [];

function reply(v) {
  var currId = $('#currentUser').attr('fd')
  var $this = $(v);
  var nickname = $this.attr('nickname');
  var toUserId = $this.attr('id');
  console.log("v", v);
  console.log("curr_id", currId);
  // $('#group-chat').css('display', 'none');
  // $('#single-chat').css('display', 'block');
  // $('#single-chat-title').text(nickname);
  // $('#single-chat-title').attr('user-id', toUserId);
  if (currId != toUserId) {
    if ($this.attr('created') != 0) {
      console.log("不是第一次点击");
    } else {
      console.log("是第一次点击");
      $this.attr('created', 1);
      let id = currId + toUserId;
      if (relationId.length == 0) {
        relationId.push(id);
      } else {
        for (let i = 0; i < relationId.length; i++) {
          let tag = '#' + relationId[i];
          $(tag).css('display', 'none');
        }
      }
      let title = id + 'title';
      let content = id + 'content';
      let singleContent = id + 'singleContent';
      let sendMsg = id + 'sendMsg';
      console.log("id", id);
      $('#group-chat').css('display', 'none');
      $('#single-chat').append('<div class="chat-div" id=" ' + id + ' "><div class="chat-hd" id=" ' + title + ' "></div><div class="chat-content" id=" ' + content + ' "></div><div class="chat-ft"><div class="toolbar"><div class="emoji"></div><div class="empty" onclick="empty()">清空消息</div></div><div class="input"><textarea placeholder="say something..." type="text" id=" ' + singleContent + ' " name="singleContent" placeholder="say something..." /></textarea></div><div class="send"><div class="button" id=" ' + sendMsg + ' " onclick="sendMsg(3)">发送</div></div></div></div>');
    }
  } else {
    console.log("my");
  }
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
    var userId = parseInt($('#single-chat-title').attr('user-id'));
    var userName = $('#single-chat-title').attr('username');
    var text = document.getElementById('singleContent').value;
    if (text.length > 0) {
      var currentUser = $('#currentUser').text();
      $('#single-chat-content').append('<div class="item"><div class="chat-scope-right"><div class="content"><div class="nickname">' + currentUser + '</div><div class="message">' + text + '</div></div><div class="avatar"><img src="http://n.sinaimg.cn/translate/w1280h1280/20171211/hsEC-fypnsip6872500.jpg" alt=""></div></div></div>');
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
    console.log("data.userList", data.userList);
    if (data.userList) {
      userList.innerHTML = '';
      for (var i = 0; i < data.userList.length; i++) {
        if (data.userList[i].username.length > 1) {
          userList.innerHTML += '<a href="#" onclick="reply(this)" created="0" id="' + data.userList[i].fd + '" ' + 'nickname=' + data.userList[i].username + ' ><div class="user-scope">' + '<div class="image"><img src="http://n.sinaimg.cn/translate/w1280h1280/20171211/hsEC-fypnsip6872500.jpg" alt=""></div><div class="nickname">' + data.userList[i].username + '</div></div></a>';
        }
      }
    }
    var currentFd = $('#currentUser').attr('fd');
    switch (data.type) {
      case LOGIN:
        $('#chat').append('<div class="item"><div class="enter-status">' + data.fromWho + ' enter the room..</div></div>');
        break;
      case DISPATCH:
        if (data.fd == currentFd) {
          // right
          $('#chat').append('<div class="item"><div class="chat-scope-right"><div class="content"><div class="nickname">' + data.fromWho + '</div><div class="message">' + data.content + '</div></div><div class="avatar"><img src="http://n.sinaimg.cn/translate/w1280h1280/20171211/hsEC-fypnsip6872500.jpg" alt=""></div></div></div>');
        } else {
          // left
          $('#chat').append('<div class="item"><div class = "chat-scope-left" ><div class="avatar"><img src="http://n.sinaimg.cn/translate/w1280h1280/20171211/hsEC-fypnsip6872500.jpg" alt=""></div><div class = "content" ><div class="nickname">' + data.fromWho + '</div><div class = "message" >' + data.content + '</div></div></div></div>');
        }
        break;
      case SINGLE:
        if (data.fd == currentFd) {
          $('#single-chat-content').append('<div class="item"><div class="chat-scope-right"><div class="content"><div class="nickname">' + data.fromWho + '</div><div class="message">' + data.content + '</div></div><div class="avatar"><img src="http://n.sinaimg.cn/translate/w1280h1280/20171211/hsEC-fypnsip6872500.jpg" alt=""></div></div></div>');
        } else {
          $('#single-chat-content').append('<div class="item"><div class = "chat-scope-left" ><div class="avatar"><img src="http://n.sinaimg.cn/translate/w1280h1280/20171211/hsEC-fypnsip6872500.jpg" alt=""></div><div class = "content" ><div class="nickname">' + data.fromWho + '</div><div class = "message" >' + data.content + '</div></div></div></div>');
        }
        break;
      case CLOSE:
        $('#chat').append('<div class="item"><div class="left-status">' + data.content + ' left the room.</div></div>');
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
    var chatDiv = document.getElementById('chat');
    chatDiv.scrollTop = chatDiv.scrollHeight;
  }
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

function backToGroup() {
  $('#group-chat').css('display', 'block');
  $('#single-chat').css('display', 'none');
}
