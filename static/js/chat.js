//      function reply(v) {
//        var toUserId = v.id;
//        var toUserName = v.innerHTML;
//        document.getElementById('content').innerHTML = '回复 '+ toUserName;
//        document.getElementById('toUserId').value = toUserId;
//      }

function login() {
	$('#LoginBox').css('display','none');
	$('#chatBox').css('display','block');
  var userName = $('#userName').val();
	$('#currentUser').text(userName);
}

function sendMsg(){
  var text = document.getElementById('content').value;
  var user = $('#currentUser').text();
  //向服务器发送数据
  websocket.send(JSON.stringify({
    fromWho: user,
    content:text
  }));
}

function receive(evt) {
  if(evt.data) {
    data = JSON.parse(evt.data);
    if(data.userList) {
      for(var i=0;i<data.userList.length;i++){
        userList.innerHTML += '<li><a href="#" onclick="reply(this)" id="'+ data.userList[i].fd +'">' + data.userList[i].username + '</a></li>';
      }
    }
    if(data.content) {
      $('#chat').append('<li>'+ data.fromWho + ':' + data.content +'</li>');
    }
    console.log(data);
  }
}