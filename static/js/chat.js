const LOGIN = 1;
const DISPATCH = 2;
const SINGLE = 3;
const CLOSE = 4;
const OFFLINE = 5;
const FD_INFO = 6;
var toUserId = '';


function reply(v) {
  var currId = $('#currentUser').attr('fd')
  var $this = $(v);
  var nickname = $this.attr('nickname');
  toUserId = $this.attr('id');
  if (currId != toUserId) {
    let id = currId + toUserId;
    let title = id + 'title';
    let content = id + 'content';
    let singleContent = id + 'singleContent';
    if ($this.attr('created') != 0) {
      let tag = '#' + id;
      $('#group-chat').css('display', 'none');
      $('#container').children(".chat-div").css("display", "none");
      $(tag).css('display','block');
    } else {
      $this.attr('created', 1);
      $('#group-chat').css('display', 'none');
      $('#container').children(".chat-div").css("display", "none");
      $('#container').append('<div class="chat-div" id="' + id + '"><div class="chat-hd" id="' + title + '">'+ nickname +'</div><div class="chat-content" id="' + content + '"></div><div class="chat-ft"><div class="toolbar"><div class="emoji"></div><div class="empty" onclick="empty()">清空消息</div></div><div class="input"><textarea placeholder="say something..." type="text" id="' + singleContent + '" name="singleContent" placeholder="say something..." /></textarea></div><div class="send"><div class="single-chat-button" id="single-chat-button" toUserId="' + toUserId + '" '+ 'content="'+ content +'" onclick="sendMsg(3)">发送</div></div></div></div>');
    }
  } else {
    console.log("myself");
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
    var curr_id =  $('#currentUser').attr('fd');
    var singleContent = '#' + curr_id + toUserId + 'singleContent';
    var content = '#' + curr_id + toUserId + 'content';
    var text = $(singleContent).val();
    if (text.length > 0) {
      var currentUser = $('#currentUser').text();
      $(content).append('<div class="item"><div class="chat-scope-right"><div class="content"><div class="nickname">' + currentUser + '</div><div class="message">' + text + '</div></div><div class="avatar"><img src="http://n.sinaimg.cn/translate/w1280h1280/20171211/hsEC-fypnsip6872500.jpg" alt=""></div></div></div>');
    }
    $(singleContent).val('');
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
    toWho: toUserId,
    content: text
  }));
}

function receive(evt) {
  console.log('evt',evt);
  if (evt.data) {
    data = JSON.parse(evt.data);
    var currentFd = $('#currentUser').attr('fd');
    if (data.userList) {
      userList.innerHTML = '';
      for (var i = 0; i < data.userList.length; i++) {
        if (data.userList[i].username.length > 1) {
          userList.innerHTML += '<a href="#" onclick="reply(this)" created="0" id="' + data.userList[i].fd + '" ' + 'nickname=' + data.userList[i].username + ' ><div class="user-scope">' + '<div class="image"><img src="http://n.sinaimg.cn/translate/w1280h1280/20171211/hsEC-fypnsip6872500.jpg" alt=""></div><div class="nickname">' + data.userList[i].username + '</div></div></a>';
        }
      }
    }
    
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
        let id = data.toWho + data.fd;
        let title = id + 'title';
        let content = id + 'content';
        let singleContent = id + 'singleContent';
        $('#container').append('<div class="chat-div" style="display:none;" id="' + id + '"><div class="chat-hd" id="' + title + '">'+ data.fromWho +'</div><div class="chat-content" id="' + content + '"></div><div class="chat-ft"><div class="toolbar"><div class="emoji"></div><div class="empty" onclick="empty()">清空消息</div></div><div class="input"><textarea placeholder="say something..." type="text" id="' + singleContent + '" name="singleContent" placeholder="say something..." /></textarea></div><div class="send"><div class="single-chat-button" id="single-chat-button" toUserId="' + toUserId + '" '+ 'content="'+ content +'" onclick="sendMsg(3)">发送</div></div></div></div>');
        var sendId = '#'+ data.fd;
        $(sendId).attr('created',1);
        if (data.fd == currentFd) {
          var sendContent = '#'+content;
          $(sendContent).append('<div class="item"><div class="chat-scope-right"><div class="content"><div class="nickname">' + data.fromWho + '</div><div class="message">' + data.content + '</div></div><div class="avatar"><img src="http://n.sinaimg.cn/translate/w1280h1280/20171211/hsEC-fypnsip6872500.jpg" alt=""></div></div></div>');
        } else {
          var sendContent = '#'+content;
          $(sendContent).append('<div class="item"><div class = "chat-scope-left" ><div class="avatar"><img src="http://n.sinaimg.cn/translate/w1280h1280/20171211/hsEC-fypnsip6872500.jpg" alt=""></div><div class = "content" ><div class="nickname">' + data.fromWho + '</div><div class = "message" >' + data.content + '</div></div></div></div>');
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
  $('#container').children(".chat-div").css("display", "none");
  $('#group-chat').css('display', 'block');
}
