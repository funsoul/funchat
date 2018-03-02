function reply(v) {
	var toUserId = v.id;
	var toUserName = v.innerHTML;
	$('#singleChatBox').css('display','block');
	$('#singleCurrentUser').attr('user-id',toUserId);
	$('#singleCurrentUser').text('Reply: '+ toUserName);
}

function login() {
  var userName = $('#Account').val();
  if(userName.length == 0){
    alert('please enter your nickname!');
  }else{
    $('#LoginBox').css('display','none');
    $('#chatBox').css('display','block');
    $('#currentUser').text(userName);
    websocket.send(JSON.stringify({
      type: 1,
      fromWho: userName
    }));
  }
}

function sendMsg(type){
  var text = document.getElementById('content').value;
  var user = $('#currentUser').text();
  if(type == 3){
		var userId = parseInt($('#singleCurrentUser').attr('user-id'));
    var text = document.getElementById('singleContent').value;
	}else{
    var userId = '';
  }
  //向服务器发送数据
  websocket.send(JSON.stringify({
		type: type,
    fromWho: user,
    toWho: userId,
    content:text
  }));
}

function receive(evt) {
  if(evt.data) {
    data = JSON.parse(evt.data);
    if(data.userList) {
      userList.innerHTML = '';
      for(var i=0;i<data.userList.length;i++){
      	if(data.userList[i].username.length > 1){
          userList.innerHTML += '<li><a href="#" onclick="reply(this)" id="'+ data.userList[i].fd +'">' + data.userList[i].username + '</a></li>';
				}
      }
    }
    if(data.content) {
    	if(data.type == 2){
        $('#chat').append('<li>'+ data.fromWho + ' : ' + data.content +'</li>');
			}else if(data.type == 3){
        $('#chat').append('<li style="color: red">[Private]'+ data.fromWho + ' : ' + data.content +'</li>');
			}else if(data.type == 4){
        $('#chat').append('<li style="color: orange">' + data.content + ' left the room.</li>');
      }else if(data.type == 5){
			  var msg = $('#singleCurrentUser').text() + ' [Failed to send : maybe your friend have been offline.]';
        $('#chat').append('<li style="color: blue;">' + msg + '</li>');
      }
    }
    console.log(data);
  }
}