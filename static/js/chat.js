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
  }else if(userName.length > 18){
    alert('Nickname is too long!');
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
    $("#singleContent").val('');
	}else{
    var userId = '';
    $("#content").val('');
  }
  if(text.length == 0) {
    alert('Please enter content');
    return false;
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
    var currentFd = $('#currentUser').attr('fd');
    switch (data.type)
    {
      case 1:
        $('#chat').append('<li style="color: pink">' + data.fromWho +' enter the room..</li>');
        break;
      case 2:
        if(data.fd == currentFd){
          $('#chat').append('<li>'+ data.content + ' : ' + data.fromWho +'</li>');// right
        }else{
          $('#chat').append('<li>'+ data.fromWho + ' : ' + data.content +'</li>');// left
        }
        break;
      case 3:
        if(data.fd == currentFd){
          $('#chat').append('<li style="color: red;">'+ data.content + ' : ' + data.fromWho +'[Private]</li>');// right
        }else{
          $('#chat').append('<li style="color: red;">[Private]'+ data.fromWho + ' : ' + data.content +'</li>'); // left
        }
        break;
      case 4:
        $('#chat').append('<li style="color: orange">' + data.content + ' left the room.</li>');
        break;
      case 5:
        var msg = $('#singleCurrentUser').text() + ' [Failed to send : maybe your friend have been offline.]';
        $('#chat').append('<li style="color: blue;">' + msg + '</li>');
        break;
      case 6:
        $('#currentUser').attr('fd',data.fd);
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

function empty(){
  var msg = "Clearing records will not be restored.\n\nReally?";
  if (confirm(msg) == true){
    $('#chat').html('');
    return true;
  }else{
    return false;
  }
}