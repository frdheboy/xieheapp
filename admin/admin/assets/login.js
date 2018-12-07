$('.form-login').submit(function() {
	var name = $('#inputUsername').val(),pass = $('#inputPassword').val()
	if(name.indexOf(' ') != -1||pass.indexOf(' ')!=-1){
		alert('请不要在用户名或密码中输入空格')
		return false
	}
	$.ajax({
		type:"post",
		url:"http://172.18.2.34/teachactive/view/Login",
		data:JSON.stringify({
			name:name,
			password:pass
		}),
		contentType:'application/json;charset=UTF-8',
		success:function(res) {
			res=='200'?window.location.href="index.html":alert(res)
		},
		error:function(err) {
			if(err.responseText.length>0){
				alert(err.responseText)
			}else{
				alert('服务器请求失败！')
			}
		}
	});
	return false;
})
