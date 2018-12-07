/*变量初始化*/
var INIT = {
	interfaceUrl:'http://172.18.2.34/teachactive/view',  //接口服务器
	//数据渲染状态，以防多次渲染------------------------------
	globalSetState:false,  //整体设置页
	indexState:true,      //首页(活动列表按钮)
	userSetState:false,  //人员设置页
	//DOM树预取-----------------------------------
	actionSearch2Html:$('#actionSearch2').html(),  //搜索框
	onceActListHtml:$('#onceActTable').html(),   //非周期性活动列表
	repeatActListHtml:$('#repeatActTable').html(),   //非周期性活动列表
	userListNavHtml:$('#userListNav').html(),   //用户列表页码
	onceActListNavHtml:$('#onceActListNav').html(),  //非周期性活动页码
	repeatActListNavHtml:$('#repeatActListNav').html(),  //周期性活动页码
	coursewareFileHtml:$('#coursewareFile').html(),  //非周期性活动课件
	editModalMonthHtml:$('.editModalMonth').html(),  //非周期活动月份
	onceEditModalHoursHtml:$('#editModal1 .editModalHours').html(),  //非周期活动小时
	onceEditModalMinuteHtml:$('#editModal1 .editModalMinute').html(),  //非周期活动分钟
	cyclicityHtml:$('#cyclicity').html(),  //周期活动周期类型
	cyclicityDayHtml:$('.cyclicityDay').html(),  //周期活动每月几号
	repeatEditModalHoursHtml:$('#editModal2 .editModalHours').html(),  //周期活动小时
	repeatEditModalMinuteHtml:$('#editModal2 .editModalMinute').html(),  //周期活动分钟
	ifOrderHtml:$('#ifOrder').html(),  //非周期活动是否预约
	report1Html:$('#report1').html(),  //报表1
	report2Html:$('#report2').html(),  //报表2
	report3Html:$('#report3').html(),  //报表3
	report4Html:$('#report4').html(),  //报表4
	//远程数据初始化-------------------------------
	actListRecords:3,   //活动列表每页条数
	userListRecords:5,   //用户列表每页条数
	canvasRadius:$('canvas')[0].width * 0.27,   //饼图半径
	canvasLegendTop:0,   //图例距顶部高度
	week:['一','二','三','四','五','六','日'],   //星期
	actionType:null,   //活动类型
	actAddress:null,   //活动地址
	groups:null,    //部门科室
	teachers:null,   //授课人
	users:null,    //用户列表
	usersPageNum:null,  //用户列表页码
	onceActList:null, //非周期活动列表
	repeatActList:null,  //周期性活动列表
	onceActPageNum:null,  //非周期活动页码
	repeatActPageNum:null, //周期性活动页码
}
/*函数封装*/
var FN = {
	getData:function(url,data,callback){ //GET请求
		$.ajax({
			url:INIT.interfaceUrl+url,
			timeout:1500, //超时时间设置，单位毫秒
			data:data,
			contentType:'application/json;charset=utf-8',
			success:function(res){
				callback(res)
			},
			error:function(err){
				callback(err.status)
				if(err.status==0){
					console.error('请求超时')
				}else{
					console.error('服务器请求失败')
				}
			}
		})
	},
	setData:function(url,data,callback,load){ //post请求
		$.ajax({
			url:INIT.interfaceUrl+url,
			timeout:load?5000:1500,
			type:'post',
			data:load?data:JSON.stringify(data),
			processData:load?false:true,
			contentType:load?false:'application/json;charset=utf-8',
			success:function(res){
				callback(res)
			},
			error:function(err){
				if(err.status==0){
					console.error('请求超时')
					callback('请求超时,请检查网络状况！')
				}else{
					console.error('服务器请求失败')
					callback(err.status)
				}
			}
		})
	},
	dayModalView:function(year,month,dayEl,html) {  //日期下拉渲染
		var selectYear = $(year).find("option:selected").val()
		var selectMonth = $(month).find("option:selected").val()
		var dayArr = [] , firstDay= 1
		if(selectYear.length > 0 && selectMonth.length > 0) {
			var dayLength = new Date(selectYear, selectMonth, 0).getDate();
			for(var j = 0; j < dayLength; j++) {
				dayArr.push(firstDay++)
			}
		}
		this.hdbs(dayEl,dayArr,html)
	},
	hdbs:function(el,data,html) { //模板引擎
		var hdbsHtml = Handlebars.compile(html?html:$('#'+el).html())   //编译
		$('.'+el).html(hdbsHtml(data))   //渲染
	},
	getActionType:function(){    //活动类型及授课人数据请求及渲染
		var self = this
		self.setData('/findAllActiveType',{},function(res) {
			if(res.constructor == Array){
				INIT.actionType = res
				self.setData('/teach',{},function(res) {
					if(res.constructor == Array){
						INIT.teachers = res
						self.hdbs('actionSearch2',{actionType:INIT.actionType,teachers:INIT.teachers},INIT.actionSearch2Html)   //渲染活动类型
					}else{
						alert('授课人请求失败：'+res)
					}
				})
			}else{
				alert('活动类型请求失败：'+res)
			}
		})
	},
	getActPageNum:function(_url,cb){   //总页数
		var self = this
		var records=_url=='/userAllPageNum'?INIT.userListRecords:INIT.actListRecords
		self.setData(_url,{records:records},function(res) {
			if(res.code == 200){
				var pageArr = []
				for (var i=0;i<res.numpage;i++) {
					pageArr.push(i+1)
				}
				switch (_url){
					case '/onceAllPageNum':
						INIT.onceActPageNum = {
							pageNum:res.numpage,
							pageArr:pageArr,
						} 
						break;
					case '/findPeriodAllPageNum':
						INIT.repeatActPageNum =  {
							pageNum:res.numpage,
							pageArr:pageArr,
						} 
						break;
					case '/userAllPageNum':
						INIT.usersPageNum =  {
							pageNum:res.numpage,
							pageArr:pageArr,
						} 
						break;
				}
				cb(200)
			}else{
				res.code=='error'?alert('当前没有任何数据，请添加！'):alert('服务器请求失败：'+res)
				cb('err')
			}
		})
	},
	pageNavDisign:function(el,now,pageArr){   //页码设计
		var allNum =pageArr.length   //获取总页数
		//页码渲染
		if(now<10){
			this.hdbs(el,pageArr.splice(0,10),INIT[el+'Html'])   //渲染
		}else{
			this.hdbs(el,pageArr.splice(now-5,now+5),INIT[el+'Html'])   //渲染
		}
		//页码标记
		$('.'+el+' .'+now).addClass('active')
		$('.'+el+' li').not($('.'+now)).removeClass('active')
		$('.'+el+'>li:first>a').attr('aria-label',parseInt(now)-1<=0?1:parseInt(now)-1)   //向前翻页
		$('.'+el+'>li:last>a').attr('aria-label',parseInt(now)+1>=allNum?allNum:parseInt(now)+1)  //向后翻页
		//页码切换
		this.pageNavChange('.'+el+' li a',now)
	},
	getActList:function(type,page){    //活动列表（按页码）请求及渲染
		var self = this , _url
		if (type=='once') {
			_url = '/onceActivesByPaging'
		} else{
			_url = '/findPeriodActiveByPaging'
		}
		self.setData(_url,{page:page,records:INIT.actListRecords},function(res) {
			if(res.constructor == Array){
				if(type=='once'){
					for (var i=0;i<res.length;i++) {  //日期转义
						res[i].year = new Date(res[i].time).getFullYear() 
						res[i].month = new Date(res[i].time).getMonth()+1
						res[i].day = new Date(res[i].time).getDate()
						res[i].hour = new Date(res[i].time).getHours()
						res[i].minute = new Date(res[i].time).getMinutes()
					}
					INIT.onceActList = res
					if(res[0]){
						self.hdbs('onceActTable',INIT.onceActList,INIT.onceActListHtml)   //渲染非周期活动
						self.pageNavDisign('onceActListNav',page,INIT.onceActPageNum.pageArr)   //页码渲染
					}
				}else{
					for (var i=0;i<res.length;i++) { //周期日期转义
						if(res[i].period=='week'){
							res[i].periodZh = '星期'
							res[i].weekDay = INIT.week[res[i].day-1]
							res[i].state = true
						}else{
							res[i].periodZh = '月份'
						}
						res[i].beginYear = new Date(res[i].start).getFullYear() 
						res[i].beginMonth = new Date(res[i].start).getMonth()+1
						res[i].beginDays = new Date(res[i].start).getDate()
						res[i].endYear = new Date(res[i].end).getFullYear() 
						res[i].endMonth = new Date(res[i].end).getMonth()+1
						res[i].endDays = new Date(res[i].end).getDate()
					}
					INIT.repeatActList = res
					if(res[0]){
						self.hdbs('repeatActTable',INIT.repeatActList,INIT.repeatActListHtml)   //渲染非周期活动
						self.pageNavDisign('repeatActListNav',page,INIT.repeatActPageNum.pageArr)   //页码渲染
					}
				}
			}else{
				alert('活动列表请求失败：'+res)
			}
		})
	},
	saveOnceAct:function(_oaid){  //非周期性活动保存修改数据  oaid为0时为增加活动
		var self = this
		//时间转毫秒
		var year = $('#editModal1 .editModalYears>option:selected').val()
		var month = $('#editModal1 .editModalMonth>option:selected').val()
		var day = $('#editModal1 .editModalDays>option:selected').val()
		var hour = $('#editModal1 .editModalHours>option:selected').val()
		var minute = $('#editModal1 .editModalMinute>option:selected').val()
		var _time = new Date(year+'/'+month+'/'+day+' '+hour+':'+minute+':00').getTime()
		var updateOnceActData = {
			oaid:_oaid,
			name:$('#editModal1 #actionName').val(),
			time:_time,
			teachid:$('#editModal1 #teacher>option:selected').val(),
			did:$('#editModal1 #groups>option:selected').val(),
			atid:$('#editModal1 #actionType>option:selected').val(),
			address:$('#editModal1 #actAddress>option:selected').text(),
			state:$('#editModal1 #ifOrder>option:selected').val(),
			bespeaknum:$('#editModal1 #reserveNum').val(),
			bespeakday:$('#editModal1 #reserveTime').val()
		}
		//表单验证
		if(updateOnceActData.state=='true' && (updateOnceActData.bespeaknum=='' || updateOnceActData.bespeaknum<1)){
			alert('预约名额不能少于1')
		}else if(updateOnceActData.state=='true' && (updateOnceActData.bespeakday=='' || updateOnceActData.bespeakday<1)){
			alert('提前预约天数不能少于1')
		}else if(updateOnceActData.name.replace(/\s|\xA0/g,'')==''){
			alert('活动名称不能为空')
		}else{
			self.setData('/addEditOnceActive',updateOnceActData,function(res) {
				if(res==200){
					$('#editModal1').modal('hide')   //关闭模态框
					var nowPage = $('.onceActListNav .active>a').text()==''?1:$('.onceActListNav .active>a').text()  //获取当前页
					self.getActPageNum('/onceAllPageNum',function(res) { //总页数
						if(res==200){
							self.getActList('once',nowPage)   //渲染当前页
						}
					}) 
					alert('保存成功')
				}else{
					alert('保存失败')
					console.log(res)
				}
			})
		}
	},
	savaRepeatAct:function(_paid){  //周期性活动保存  paid为0时为增加活动
		var self = this
		//时间转毫秒
		var beginYear = $('#editModal2 .beginYear>option:selected').val() , endYear = $('#editModal2 .endYear>option:selected').val()
		var beginMonth = $('#editModal2 .beginMonth>option:selected').val() , endMonth = $('#editModal2 .endMonth>option:selected').val()
		var beginDays = $('#editModal2 .beginDays>option:selected').val() , endDays = $('#editModal2 .endDays>option:selected').val()
		var _start = new Date(beginYear+'/'+beginMonth+'/'+beginDays+' 00:00:00').getTime()
		var _end = new Date(endYear+'/'+endMonth+'/'+endDays+' 00:00:00').getTime()
		var updateRepeatActData = {
			paid:_paid,
			name:$('#editModal2 #actionName').val(),
			atid:$('#editModal2 #actionType>option:selected').val(),
			teachid:$('#editModal2 #teacher>option:selected').val(),
			address:$('#editModal2 #actAddress>option:selected').text(),
			did:$('#editModal2 #groups>option:selected').val(),
			period:$('#editModal2 #cyclicity>option:selected').val(),
			day:$('#editModal2 .cyclicityDay>option:selected').val(),
			time:$('#editModal2 .editModalHours>option:selected').val()+':'+$('#editModal2 .editModalMinute>option:selected').val(),
			start:_start,
			end:_end,
		}
		//表单验证
		if(updateRepeatActData.name.replace(/\s|\xA0/g,'')==''){
			alert('活动名称不能为空')
		}else{
			this.setData('/addEditPeriodActive',updateRepeatActData,function(res) {
				if(res==200){
					$('#editModal2').modal('hide')   //关闭模态框
					var nowPage = $('.repeatActListNav .active>a').text()==''?1:$('.repeatActListNav .active>a').text()  //获取当前页
					self.getActPageNum('/findPeriodAllPageNum',function(res) { //总页数
						if(res==200){
							self.getActList('repeat',nowPage)   //渲染当前页
						}
					})
					alert('保存成功')
				}else{
					alert('保存失败')
					console.log(res)
				}
			})
		}
	},
	getUserList:function(page){    //用户列表（按页码）请求及渲染
		var self = this
		self.setData('/allUserByPaging',{page:page,records:INIT.userListRecords},function(res) {
			if(res.constructor == Array){
				INIT.users = res
				if(res[0]){
					self.hdbs('userSet',INIT.users,userSetHtml)    //渲染
					self.pageNavDisign('userListNav',page,INIT.usersPageNum.pageArr)   //页码渲染
				}
				//部门科室数据请求 只请求一次------------------------------
				if(INIT.userSetState == false){
					INIT.userSetState = true
					self.setData('/allDepartment',{},function(res) { 
						if(res.constructor == Array){
							INIT.groups = res
							self.usersSetGetGroups()  //点击下拉菜单获取部门科室选项
						}else{
							console.error(res)
							alert('服务器请求失败：'+res)
						}
					})
				}else{
					self.usersSetGetGroups()  //点击下拉菜单获取部门科室选项
				}
				//修改人员数据----------------------------------------
				$('.userSetBtn').click(function() {
					var _tr = $(this).parents('tr')
					var updateUserData = {
						userid:$(this).attr('data-userid'),
						did:_tr.find('select>option:selected').val(),
						level:_tr.find('.level').is(':checked'),
						teachlabel:_tr.find('.teachlabel').val(),
					}
					self.setData('/updateUser',updateUserData,function(res) {
						if(res==200){
							alert('修改成功')
						}else{
							alert('修改失败',res)
						}
					})
				})
			}else{
				alert('用户列表请求失败',res)
			}
		})
	},
	pageNavChange:function(el,now){  //页码切换
		var self = this
		$(el).not('a[aria-label='+now+']').on('click',function() {
			var toNum = $(this).attr('aria-label')
			if(el.indexOf('once')!=-1){
				self.getActPageNum('/onceAllPageNum',function(res) { //总页数
					if(res==200){
						self.getActList('once',toNum)  //非周期活动第toNum页
					}
				}) 
			}else if(el.indexOf('user')!=-1){
				self.getActPageNum('/userAllPageNum',function(res) { //总页数
					if(res==200){
						self.getUserList(toNum)  //非周期活动第toNum页
					}
				}) 
			}else{
				self.getActPageNum('/findPeriodAllPageNum',function(res) { //总页数
					if(res==200){
						self.getActList('repeat',toNum)  //周期活动第toNum页
					}
				}) 
			}
		})
	},
	delOptionData:function(clickEl,delUrl,key) {   //选项数据删除
		var self = this
		$(clickEl).on('click','li>button',function(){
			var ID = $(this).attr('data-id')
			var _this = $(this)
			var _json = {}
			_json[key] = ID    //为对象的KEY赋值变量
			self.setData(delUrl,_json,function(res) {
				if(res=='200'){
					_this.parent().remove()
					//弹窗状态改变，以备重新拉取弹窗数据
					INIT.indexState = false
					INIT.userSetState = false
					alert('删除成功')
				}else{
					alert(res)
				}
			})
		})
	},
	addOptionData:function(clickEl,addUrl,getUrl,variable,key) {  //选项数据新增
		var self = this
		$('.'+clickEl+'>span').click(function(){  //活动类型新增
			var val = $('.'+clickEl+'>input').val()
			if(val.replace(/\s|\xA0/g,'')==''){
				alert('不能为空')
			}else{
				self.setData(addUrl,{name:val},function(res1) {  //新增后重获数据
					$('.'+clickEl+'>input').val('')   //置空
					if(res1=='200'){
						self.setData(getUrl,{},function(res2) { //重新取数据
							if(res2.constructor == Array){
								variable = res2
								//操作DOM增加假元素
								$('.'+clickEl).before(
									'<li class="list-group-item">'
									+val.replace(/\s|\xA0/g,'')+
									'<button type="button" data-id='+variable[variable.length-1][key]+' class="close" aria-label="Close"><span class="glyphicon glyphicon-minus-sign" aria-hidden="true"></span></button></li>'
								)
								//弹窗状态改变，以备重新拉取弹窗数据
								INIT.indexState = false
								INIT.userSetState = false
								alert('添加成功')
							}else{
								console.error(res2)
							}
						})
					}else{
						alert(res1)
					}
				})
			}									
		})
	},
	canvasSize:function() {  //图表尺寸
		var w = $(window).width()
		if (w>=1200) {
			$('canvas').each(function(i,item) {
				item.width = 352
			})
		}else if(w>=992&&w<1200){
			$('canvas').each(function(i,item) {
				item.width = 285
			})
		}else if(w>=768&&w<992){
			$('canvas').each(function(i,item) {
					item.width = 400
				})
		}else if(w<768){
			$('canvas').each(function(i,item) {
					item.width = $('.container').width()
				})
		}
		$('canvas').each(function(i,item) {
			item.height = item.width*0.9
		})
	},
	pieReport:function(canvas,num,allnum){  //饼图报表
		var name1 , name2 , _colorList
		switch (canvas){
			case 'canvas1':
				name1 = '参与'
				name2 = '未参与'
				_colorList = ['#e77366', '#41bdbd']
				break;
			case 'canvas2':
				name1 = '参与'
				name2 = '未参与'
				_colorList = ['#ed7d31', '#5d99d1']
				break;
			default:
				name1 = '本组'
				name2 = '其他组'
				_colorList = ['#e84756', '#fe9b71']
				break;
		}
		new sChart(canvas, 'pie', [{name:name1, value:num},{name:name2, value:allnum-num}], {
			radius: INIT.canvasRadius,
			legendTop: INIT.canvasLegendTop,
			colorList: _colorList,    
		})
	},
	barReport:function(rank) { //排行榜报表
		var data = []
		for (var i=0;i<rank.length;i++) {
			for (key in rank[i]) {
				data.push({name:key,value:rank[i][key]})
			}
		}
		console.log(data)
		new sChart('canvas4', 'bar', data, {
	 		showValue: true,
	  		fillColor: '#00887C',
	 		contentColor: 'rgba(46,199,201,0.3)',
	   		yEqual: 5
		})
	},
	usersSetGetGroups:function() {      //人员设置页下拉选项获取部门科室
		$('.userSetGroups').mousedown(function() {
			var val = $(this).find('option:selected').val()   //获取已选的选项ID
			$(this).html('')
			for(var i =0;i<INIT.groups.length;i++){
				if(INIT.groups[i].did==val){  //重置DOM时恢复已选选项
					$(this).append(
						'<option value='+INIT.groups[i].did+' selected>'+INIT.groups[i].name+'</option>'
					)
				}else{
					$(this).append(
						'<option value='+INIT.groups[i].did+'>'+INIT.groups[i].name+'</option>'
					)
				}
			}
		})
	}
}
/*登录判断*/
//FN.getData('/sess','',function(res) {
//	if(res=='200'){
		/*登出*/
		$('.logout').click(function() {
			FN.setData('/exit',{},function(res) {
				res=='200'?window.location.href="login.html":alert('退出失败')
			})
		})
		//非周期性活动文件数据
		var coursewareUrl = [
			'http://lc-rk5wwh3k.cn-n1.lcfile.com/啊啊啊啊啊啊啊啊.pdf',
			'http://lc-rk5wwh3k.cn-n1.lcfile.com/阿斯顿撒多.ppt',
			'http://lc-rk5wwh3k.cn-n1.lcfile.com/的范德萨范德萨.xlsx',
			'http://lc-rk5wwh3k.cn-n1.lcfile.com/个梵蒂冈梵蒂冈.docx',
			'http://lc-rk5wwh3k.cn-n1.lcfile.com/阿萨德撒打算.doc',
			'http://lc-rk5wwh3k.cn-n1.lcfile.com/阿萨德阿萨德按时.pptx',
			'http://lc-rk5wwh3k.cn-n1.lcfile.com/按时大声道阿萨德.pot',
			'http://lc-rk5wwh3k.cn-n1.lcfile.com/阿萨德阿萨德按时.potx',
			'http://lc-rk5wwh3k.cn-n1.lcfile.com/阿萨德按时按时.xls',
		]
		//截取文件名和类型
		var coursewareName = [],coursewareType = []
		for (var i = 0; i < coursewareUrl.length; i++) {
			var n1 = coursewareUrl[i].lastIndexOf('/'),n2 = coursewareUrl[i].lastIndexOf('.')
			coursewareName.push(coursewareUrl[i].substr(n1+1,3))
			coursewareType.push(coursewareUrl[i].substr(n2+1))
		}
		var actionPicData = [
				'http://lc-rk5wwh3k.cn-n1.lcfile.com/436ec55814d8180439f9.jpg',
				'http://lc-rk5wwh3k.cn-n1.lcfile.com/436ec55814d8180439f9.jpg',
				'http://www.zuifengyun.com/wp-content/uploads/2018/01/20180117.jpg',
				'http://www.zuifengyun.com/wp-content/uploads/2018/01/20180117.jpg',
			]
		var coursewareFileData = {
			coursewareName:coursewareName,
			coursewareType:coursewareType
		}
		var uploadFileData = {
			pic:[
				'http://lc-rk5wwh3k.cn-n1.lcfile.com/436ec55814d8180439f9.jpg',
				'http://lc-rk5wwh3k.cn-n1.lcfile.com/436ec55814d8180439f9.jpg',
				'http://www.zuifengyun.com/wp-content/uploads/2018/01/20180117.jpg',
				'http://www.zuifengyun.com/wp-content/uploads/2018/01/20180117.jpg',
			],
			coursewareName:coursewareName,
			coursewareType:coursewareType
		}
		/*首页进入初始化***************************************************************************************/
		/*search 数据渲染*/
		//下拉日期渲染
		//年份------------------------------------------
		var nowYear = new Date().getFullYear();
		var firstYear = 2018;
		var yearLength = nowYear - firstYear + 5;
		var yearArr = [];
		for(var i = 0; i < yearLength; i++) {
			yearArr.push(firstYear++)
		};
		FN.hdbs('years',yearArr)   //年份渲染
		//日期----------------------------------------------------------------------
		var daySearchHtml = $('#select-days').html()   //日期数据位置获取
		var dayHdbs = function () {                    //日期计算（更改年月重新执行）
			var selectYear = $('#year').find("option:selected").text()
			var selectMonth = $('#month').find("option:selected").text()
			var dayArr = []
			var firstDay = 1
			if(selectYear.length > 0 && selectYear != '缺省' && selectMonth.length > 0 && selectMonth != '缺省') {
				var dayLength = new Date(selectYear, selectMonth, 0).getDate();
				for(var j = 0; j < dayLength; j++) {
					dayArr.push(firstDay++)
				}
			}
			FN.hdbs('select-days',dayArr,daySearchHtml)
		}
		dayHdbs() //执行
		$('#year,#month').change(function(){dayHdbs()})  //选择年月后执行
		//数据请求及渲染-----------------------------------------------------------
		FN.getActionType()   //活动类型、授课人
		FN.getActPageNum('/onceAllPageNum',function(res) { //总页数
			if(res==200){
				FN.getActList('once',1)  //非周期活动第一页
			}
		}) 
		$('form.search').on('submit',function() {  //搜索表单
			var _url,_data,_time
			//时间转义
			var year = $('form.search #year>option:selected').val()
			var month = $('form.search #month>option:selected').val()
			var day = $('form.search #day>option:selected').val().length==1?'0'+$('form.search #day>option:selected').val():$('form.search #day>option:selected').val()
			var	_name = $('form.search #actionName').val()==''?'0':$('form.search #actionName').val()
			var	_atid = $('form.search #actionType>option:selected').val()
			var	_teachid = $('form.search #teacher>option:selected').val()
			var _period = $('form.search #period>option:selected').val()
			var _periodDay = $('form.search #periodDay>option:selected').val()
			if($(this).find('.submit').attr('data-type')=='once'){
				_url = '/findListOnceActive'
				_time=[year,month,day]
				_data = {time:_time,name:_name,atid:_atid,teachid:_teachid}
				FN.setData(_url,_data,function(res) {
					if(res.constructor == Array && res[0]){
						for (var i=0;i<res.length;i++) {  //日期转义
							res[i].year = new Date(res[i].time).getFullYear() 
							res[i].month = new Date(res[i].time).getMonth()+1
							res[i].day = new Date(res[i].time).getDate()
							res[i].hour = new Date(res[i].time).getHours()
							res[i].minute = new Date(res[i].time).getMinutes()
						}
						FN.hdbs('onceActTable',res,INIT.onceActListHtml)   //渲染搜索到的非周期活动
						$('#actionList1>nav').hide()   //隐藏页码
					}else{
						alert('未搜索到相关活动！')
					}
				})
			}else{
				_url = '/findListPeriodActive'
				_time = year==0?'0':new Date(year+'/01/01 00:00:00').getTime()
				_data = {start:_time.toString(),name:_name,atid:_atid,teachid:_teachid,period:_period,day:_periodDay}
				FN.setData(_url,_data,function(res) {
					if(res.constructor == Array && res[0]){
						for (var i=0;i<res.length;i++) { //周期日期转义
							if(res[i].period=='week'){
								res[i].periodZh = '星期'
								res[i].weekDay = INIT.week[res[i].day-1]
								res[i].state = true
							}else{
								res[i].periodZh = '月份'
							}
						}
						FN.hdbs('repeatActTable',res,INIT.repeatActListHtml)   //渲染搜索到的周期活动
						$('#actionList2>nav').hide()   //隐藏页码
					}else{
						alert('未搜索到相关活动！')
					}
				})
			}
			//表单验证
//			if(year==0 || month==0 || day==0){
//				alert('年月日必须全部选择！')
//			}else{
//			}
			return false
		})
		$('#delModal').on('show.bs.modal', function (ev){  //删除活动
			var _url,_data,_nowPage,_type = $(ev.relatedTarget).data('type')
			if(_type == 'once'){
				__url = '/deleteOnceActive'
				_data = {oaid:ev.relatedTarget.id}
				_nowPage = $('.onceActListNav .active>a').text()==''?1:$('.onceActListNav .active>a').text()  //获取当前页
				_getPageUrl = '/onceAllPageNum'
			}else{
				__url = '/deletePeriodActive'
				_data = {paid:ev.relatedTarget.id}
				_nowPage = $('.repeatActListNav .active>a').text()==''?1:$('.repeatActListNav .active>a').text() //获取当前页
				_getPageUrl = '/findPeriodAllPageNum'
			}
			$(this).find('.sureDel').unbind('click').click(function() {
				FN.setData(__url,_data,function(res) {
					if(res == 200){
						FN.getActPageNum(_getPageUrl,function(res) { //总页数
							if(res==200){
								FN.getActList(_type,_nowPage)   //渲染当前页
							}
						}) 
						alert('删除成功')
					}else{
						alert('删除失败')
						console.log(res)
					}
				})
			})
		})
		/*图表***************************************************************/
		$(window).resize(function() { //窗口缩放事件
			$('canvas').css({"width":"100%","height":$('canvas').css("width")})
		})
		/*按钮动作执行*************************************************************/
		$('.menu1').children().click(function() {
			btnGroupAct($(this))
			switch($(this).text()) {
				case '报表':
					//按钮显隐
					$('#report').removeClass('hidden')
					$('.menu2,.jumbotron,.menu3,.addActionBtn').addClass('hidden')
					$('section').not($('#report')).addClass('hidden')
					//图表选框渲染
					FN.setData('/allUser',{},function(res) {  //图表1
						if(res.constructor == Array){
							FN.hdbs('report1',{years:yearArr,users:res},INIT.report1Html)  //渲染图表1选框
							var _time = new Date($('form.report1 .years>option:selected').val()+'/01/01 00:00:00').getTime()
							var _userid = $('form.report1 .users>option:selected').val()
							FN.setData('/reportOne',{yearnum:_time,userid:_userid},function(res) { //初始化图表1
								console.log('1',res)
								//FN.pieReport('canvas1',res.didnum,res.activenum)
								$('form.report1 .users,form.report1 .years').change(function() {  //改变表单事件
									_time = new Date($('form.report1 .years>option:selected').val()+'/01/01 00:00:00').getTime()
									_userid = $('form.report1 .users>option:selected').val()
									FN.setData('/reportOne',{yearnum:_time,userid:_userid},function(res) {
										console.log('1',res)
										//FN.pieReport('canvas1',res.didnum,res.activenum)
									})
								})
							})
						}else{
							alert('用户请求失败')
							console.error(res)
						}
					}) 
					//图表2，老师数据首页查询过，这里不查
					FN.hdbs('report2',{years:yearArr,teachers:INIT.teachers},INIT.report2Html)  //渲染图表2选框
					FN.setData('/reportFour',{  //初始化图表2
						yearnum:new Date($('form.report2 .years>option:selected').val()+'/01/01 00:00:00').getTime(),
						teachid:$('form.report2 .teachers>option:selected').val()
					},function(res) {
						FN.pieReport('canvas2',res.teachAllNum,res.activeAllNum)
						$('form.report2 .teachers,form.report2 .years').change(function() {  //改变表单事件
							FN.setData('/reportFour',{
								yearnum:new Date($('form.report2 .years>option:selected').val()+'/01/01 00:00:00').getTime(),
								teachid:$('form.report2 .teachers>option:selected').val()
							},function(res) {
								FN.pieReport('canvas2',res.teachAllNum,res.activeAllNum)
							})
						})
					})
					//图表3
					FN.setData('/allDepartment',{},function(res) {  
						if(res.constructor == Array){
							FN.hdbs('report3',{years:yearArr,groups:res},INIT.report3Html)  //渲染图表3选框
							var _time = new Date($('form.report3 .years>option:selected').val()+'/01/01 00:00:00').getTime()
							var _did = $('form.report3 .groups>option:selected').val()
							FN.setData('/reportTwo',{yearnum:_time,did:_did},function(res) { //初始化图表3
								FN.pieReport('canvas3',res.didnum,res.activenum)
								$('form.report3 .groups,form.report3 .years').change(function() {  //改变表单事件
									_time = new Date($('form.report3 .years>option:selected').val()+'/01/01 00:00:00').getTime()
									_did = $('form.report3 .groups>option:selected').val()
									FN.setData('/reportTwo',{yearnum:_time,did:_did},function(res) {
										FN.pieReport('canvas3',res.didnum,res.activenum)
									})
								})
							})
						}else{
							alert('部门科室请求失败')
							console.error(res)
						}
					}) 
					//图表4
					FN.hdbs('report4',{years:yearArr},INIT.report4Html)  //渲染图表1选框
					FN.setData('/reportThree',{
						yearnum:new Date($('form.report4 .years>option:selected').val()+'/01/01 00:00:00').getTime(),
						topnum:$('form.report4 .rank>option:selected').val()
					},function(res) { //初始化图表4
						FN.barReport(res)
						$('form.report4 .rank,form.report4 .years').change(function() {  //改变表单事件
							FN.setData('/reportThree',{
								yearnum:new Date($('form.report4 .years>option:selected').val()+'/01/01 00:00:00').getTime(),
								topnum:$('form.report4 .rank>option:selected').val()
							},function(res) {
								FN.barReport(res)
							})
						})
					})
					//图表初始化
					FN.canvasSize()
					FN.pieReport('canvas1',14,144)
					break;
				case '设置':
					$('.menu2,.jumbotron,.addActionBtn').addClass('hidden')
					$('.menu3,#globalSet').removeClass('hidden')
					$('section').not($('#globalSet')).addClass('hidden')
					$('.menu3>button:first-child').addClass('active')
					$('.menu3>button:last-child').removeClass('active')
					//数据位置预取
					var globalSetHtml = $('#hdbsGlobalSet').html()
					//未请求数据获取--------------------------------------------------
					if(INIT.globalSetState==false){
						INIT.globalSetState=true    //改变状态（只执行一次）
						FN.setData('/allAddress',{},function(res1) { //活动地址请求
							if(res1.constructor == Array){
								INIT.actAddress = res1
								FN.setData('/allDepartment',{},function(res2) { //部门科室请求
									if(res2.constructor == Array){
										INIT.groups = res2
										/*选项数据渲染：由于地址栏已请求过活动类型，故这里不请求*/
										FN.hdbs('hdbsGlobalSet',{actionType:INIT.actionType,groups:INIT.groups,actAddress:INIT.actAddress},globalSetHtml) 
										//新增选项数据
										FN.addOptionData('addActionType','/addActiveType','/findAllActiveType',INIT.actionType,'atid')  //活动类型新增
										FN.addOptionData('addGroups','/addDepartment','/allDepartment',INIT.groups,'did')  //部门科室新增
										FN.addOptionData('addActAddress','/addAddress','/allAddress',INIT.actAddress,'adid')  //新增活动地址
										//删除选项数据
										FN.delOptionData('.actionTypeList','/deleteType','atid')    //删除活动类型
										FN.delOptionData('.groupsList','/deleteDepartment','did')   //删除部门科室
										FN.delOptionData('.actAddressList','/deleteAddress','adid')  //删除活动地址
									}else{
										alert('服务器请求失败：'+res2)
									}
								})
							}else{
								alert('服务器请求失败：'+res1)
							}
						})
					}					
					break;
				default:
					$('.menu2,.jumbotron,#actionList1,.addActionBtn,.monthForm,.dayForm').removeClass('hidden')
					$('.menu2>button:first-child').addClass('active')
					$('.menu2>button:last-child').removeClass('active')
					$('.menu3,.periodForm,.periodDayForm').addClass('hidden')
					$('section').not($('#actionList1')).addClass('hidden')
					//首页数据获取
					if(INIT.indexState==false){
						INIT.indexState=true
						FN.getActionType()    //活动类型、授课人请求、渲染
					}
					FN.getActPageNum('/onceAllPageNum',function(res) { //总页数
						if(res==200){
							FN.getActList('once',1)  //非周期活动第一页
							$('#actionList1>nav').show()   //显示页码
						}
					})  
					break;
			}
		})
		$('.menu2').children().click(function() {
			btnGroupAct($(this))
			switch ($(this).text()){
				case '周期':
					$('.monthForm,.dayForm').addClass('hidden')
					$('#actionList2,.periodForm,.periodDayForm').removeClass('hidden')
					$('section').not($('#actionList2')).addClass('hidden')
					$('form.search .submit').attr('data-type','repeat')
					//周期性活动搜索
					$('.periodForm #period').change(function() {
						$('.periodDayForm #periodDay').html('<option value="0">缺省</option>')
						if($(this).find('option:selected').val()=='month'){
							for(var i=1;i<32;i++){
								$('.periodDayForm #periodDay').append('<option value='+i+'>'+i+'日</option>')
							}
						}else if($(this).find('option:selected').val()=='week'){
							for(var i=1;i<8;i++){
								$('.periodDayForm #periodDay').append('<option value='+i+'>周'+INIT.week[i-1]+'</option>')
							}
						}
					})
					periodDay
					//周期性活动渲染
					FN.getActPageNum('/findPeriodAllPageNum',function(res) { //总页数
						if(res==200){
							FN.getActList('repeat',1)  //非周期活动第一页
							$('#actionList2>nav').show()   //显示页码
						}
					})
					break;
				default:
					$('#actionList1,.monthForm,.dayForm').removeClass('hidden')
					$('.periodForm,.periodDayForm').addClass('hidden')
					$('section').not($('#actionList1')).addClass('hidden')
					$('form.search .submit').attr('data-type','once')
					//非周期性活动渲染
					if(INIT.indexState==false){
						INIT.indexState=true
						FN.getActionType()    //活动类型、授课人请求、渲染
					}
					FN.getActPageNum('/onceAllPageNum',function(res) { //总页数
						if(res==200){
							FN.getActList('once',1)  //非周期活动第一页
							$('#actionList1>nav').show()   //显示页码
						}
					})
					break;
			}
		})
		//人员设置页位置预取
		var userSetHtml = $('#userSet').html()
		$('.menu3').children().click(function() {
			btnGroupAct($(this))
			switch ($(this).text()){
				case '人员设置':
					$('#personSet').removeClass('hidden')
					$('section').not($('#personSet')).addClass('hidden')
					//人员数据请求、渲染(每次都重新请求，数据实时更新)
					FN.getActPageNum('/userAllPageNum',function(res) {  //页码总页数
						if(res==200){
							FN.getUserList(1)   //请求第一页
						}
					})  
					break;
				default:
					$('#globalSet').removeClass('hidden')
					$('section').not($('#globalSet')).addClass('hidden')
					break;
			}
		})
		//按钮动作封装
		function btnGroupAct(_this) {
			_this.parent().children().not(_this).removeClass('active')
			_this.addClass('active')
		}
		/*活动编辑弹窗渲染****************************************************************************************/
		//日期渲染
		var editModalDaysHtml = $('#editModalDays').html() , beginDaysHtml = $('#beginDays').html() , endDaysHtml = $('#endDays').html()
		var editModalDays = function(type) {
			switch (type){
				case 'modal1':
					FN.dayModalView('.editModalYears','.editModalMonth','editModalDays',editModalDaysHtml)
					break;
				case 'modal2':
					FN.dayModalView('.beginYear','.beginMonth','beginDays',beginDaysHtml)
					break;
				case 'modal3':
					FN.dayModalView('.endYear','.endMonth','endDays',endDaysHtml)
					break;
			}
		}
		/*周期性活动弹窗****************************************************************************************/
		//周期性活动数据位置截取
		var hdbsEditModal2Html = $('#hdbsEditModal2').html(),beginYearHtml = $('#beginYear').html(),endYearHtml = $('#endYear').html()
		//弹窗事件
		$('#editModal2').on('show.bs.modal', function (ev){
			//未请求数据获取--------------------------------------------------
			//活动地址请求
			FN.setData('/allAddress',{},function(res1) {
				if(res1.constructor == Array){
					INIT.actAddress = res1
					//部门科室请求
					FN.setData('/allDepartment',{},function(res2) {
						if(res2.constructor == Array){
							INIT.groups = res2
							/*选项数据渲染：由于地址栏已请求过活动类型，故这里不请求*/
							FN.hdbs('hdbsEditModal2',{actionType:INIT.actionType,teachers:INIT.teachers,actAddress:INIT.actAddress,groups:INIT.groups},hdbsEditModal2Html) 
							//按月或星期为周期事件
							$('#editModal2 #cyclicity').change(function() {
								if($(this).find('option:selected').val()=='week'){
									$("label.cyclicityType").text('每周')
									$("#editModal2 .cyclicityDay").html('')
									for(var i=1;i<8;i++){
										$("#editModal2 .cyclicityDay").append('<option value='+i+'>'+INIT.week[i-1]+'</option>')
									}
								}else{
									$("label.cyclicityType").text('每月')
									$("#editModal2 .cyclicityDay").html('')
									for(var i=1;i<32;i++){
										$("#editModal2 .cyclicityDay").append('<option value='+i+'>'+i+'日</option>')
									}
								}
							})
							//开始时间------------------------------------------------
							FN.hdbs('beginYear',yearArr,beginYearHtml)  //年份
							editModalDays('modal2')
							$('.beginYear,.beginMonth').change(function() {  //选择年月后执行
								editModalDays('modal2')
							})
							//结束时间-------------------------------------------------
							FN.hdbs('endYear',yearArr,endYearHtml)  //年份
							editModalDays('modal3')
							$('.endYear,.endMonth').change(function() {  //选择年月后执行
								editModalDays('modal3')
							})
							//其他选项重载
							$('#cyclicity').html(INIT.cyclicityHtml)  //周期活动周期类型
							$('#editModal2 .editModalHours').html(INIT.repeatEditModalHoursHtml)  //周期活动小时
							$('#editModal2 .editModalMinute').html(INIT.repeatEditModalMinuteHtml)  //周期活动分钟
							$('.beginMonth').html(INIT.editModalMonthHtml)  //开始月份
							$('.endMonth').html(INIT.editModalMonthHtml)  //结束月份
							//新增or修改区分-------------------------------------------------
							var operation = $(ev.relatedTarget).data('operation')
							if (operation=='add'){
								$('#editModal2 .sureEdit').unbind("click").click(function() {  //保存事件
									FN.savaRepeatAct('0')
								})
							}else{
								//活动数据提取
								var index = ev.relatedTarget.id  //获取编辑活动的id
								var thisActData = INIT.repeatActList[index]  //获取当前点击的活动数据
								if(thisActData.period=='week'){
									$("label.cyclicityType").text('每周')
									$("#editModal2 .cyclicityDay").html('')
									for(var i=1;i<8;i++){
										$("#editModal2 .cyclicityDay").append('<option value='+i+'>'+INIT.week[i-1]+'</option>')
									}
								}else{
									$('.cyclicityDay').html(INIT.cyclicityDayHtml)  //周期活动每月几号
								}
								//活动数据写入
								$('#editModal2 #actionName').val(thisActData.name)  //活动名
								$('#editModal2 #actionType>option[value='+thisActData.activeType.atid+']').attr('selected',true)   //活动类型
								$('#editModal2 #teacher>option[value='+thisActData.teach.userid+']').attr('selected',true)   //授课人
								$('#editModal2 #actAddress>option[value='+thisActData.address+']').attr('selected',true)   //地址
								$('#editModal2 #groups>option[value='+thisActData.department.did+']').attr('selected',true)   //部门科室
								$('#editModal2 #cyclicity>option[value='+thisActData.period+']').attr('selected',true)   //周期类型
								$('#editModal2 .cyclicityDay>option[value='+thisActData.day+']').attr('selected',true)   //每周期哪天
								$('#editModal2 .editModalHours>option[value='+thisActData.time.substr(0,2)+']').attr('selected',true)   //时
								$('#editModal2 .editModalMinute>option[value='+thisActData.time.substr(3,2)+']').attr('selected',true)   //分
								//开始结束时间
								$('#editModal2 .beginYear>option[value='+thisActData.beginYear+']').attr('selected',true)   
								$('#editModal2 .beginMonth>option[value='+thisActData.beginMonth+']').attr('selected',true)   
								$('#editModal2 .beginDays>option[value='+thisActData.beginDays+']').attr('selected',true)   
								$('#editModal2 .endYear>option[value='+thisActData.endYear+']').attr('selected',true)   
								$('#editModal2 .endMonth>option[value='+thisActData.endMonth+']').attr('selected',true)   
								$('#editModal2 .endDays>option[value='+thisActData.endDays+']').attr('selected',true)   
								$('#editModal2 .sureEdit').unbind("click").click(function() {  //保存事件
									FN.savaRepeatAct(thisActData.paid)
								})
							}
						}else{
							alert('服务器请求失败：'+res2)
						}
					})
				}else{
					alert('服务器请求失败：'+res1)
				}
			})
		})
		/*非周期性活动弹窗****************************************************************************************/
		//非周期性活动数据位置截取
		var hdbsEditModal1Html = $('#hdbsEditModal1').html(),editModalYearsHtml = $('#editModalYears').html(),actionPicHtml = $('#actionPic').html()
		//弹窗事件
		$('#editModal1').on('show.bs.modal', function (ev){
			//去除已有属性 
			$('#editModal1').find('#actionName,#reserveNum,#reserveTime').val('')  
			$('#editModal1').find('#actionType,#teacher,#actAddress,#groups,.editModalYears,.editModalMonth,.editModalHours,.editModalMinute,#ifOrder').find('option').each(function() {
				$(this).removeAttr("selected")
			})  
			$('.ifOrderChange').show()  //显示预约人数天数
			//未请求数据获取--------------------------------------------------
			//活动地址请求
			FN.setData('/allAddress',{},function(res1) {
				if(res1.constructor == Array){
					INIT.actAddress = res1
					//部门科室请求
					FN.setData('/allDepartment',{},function(res2) {
						if(res2.constructor == Array){
							INIT.groups = res2
							/*选项数据渲染：由于地址栏已请求过活动类型和授课人，故这里不请求*/
							FN.hdbs('hdbsEditModal1',{actionType:INIT.actionType,teachers:INIT.teachers,actAddress:INIT.actAddress,groups:INIT.groups},hdbsEditModal1Html) 
							//年月日执行--------------------------------------------------------
							FN.hdbs('editModalYears',yearArr,editModalYearsHtml)   //年份
							$('.editModalMonth').html(INIT.editModalMonthHtml)  //执行月份
							$('#editModal1 .editModalHours').html(INIT.onceEditModalHoursHtml)  //非周期活动小时
							$('#editModal1 .editModalMinute').html(INIT.onceEditModalMinuteHtml)  //非周期活动分钟
							$('#ifOrder').html(INIT.ifOrderHtml)  //非周期活动是否预约
							editModalDays('modal1')  //执行日期
							$('.editModalYears,.editModalMonth').change(function() {  //选择年月后执行
								editModalDays('modal1')
							})
							$('#ifOrder').change(function() {  //选择是否预约后执行
								if($('#ifOrder>option:selected').val()=='false'){
									$('.ifOrderChange').hide()
								}else{
									$('.ifOrderChange').show()
								}
							})
							//新增or修改区分--------------------------------------------------
							var operation = $(ev.relatedTarget).data('operation')
							if (operation=='add') {  //区分新增修改
								$('span.picBox').hide()   //隐藏照片块
								FN.hdbs('coursewareFile',{},INIT.coursewareFileHtml)  //清空课件
								$('#editModal1 .sureEdit').unbind("click").click(function() {  //保存事件
									FN.saveOnceAct('0')
								})
							}else{  //编辑模式
								$('span.picBox').show()   //显示照片
								FN.hdbs('coursewareFile',coursewareFileData,INIT.coursewareFileHtml)   //课件
								//活动数据提取
								var index = ev.relatedTarget.id  //获取编辑活动的id
								var thisActData = INIT.onceActList[index]  //获取当前点击的活动数据
								//活动数据写入
								$('#editModal1 #actionName').val(thisActData.name)  //活动名
								$('#editModal1 #actionType>option[value='+thisActData.activeType.atid+']').attr('selected',true)   //活动类型
								$('#editModal1 #teacher>option[value='+thisActData.teach.userid+']').attr('selected',true)   //授课人
								$('#editModal1 #actAddress>option[value='+thisActData.address+']').attr('selected',true)   //地址
								$('#editModal1 #groups>option[value='+thisActData.department.did+']').attr('selected',true)   //部门科室
								$('#editModal1 .editModalYears>option[value='+thisActData.year+']').attr('selected',true)   //年
								$('#editModal1 .editModalMonth>option[value='+thisActData.month+']').attr('selected',true)   //月
								$('#editModal1 .editModalDays').html('<option value='+thisActData.day+'>'+thisActData.day+'日</option>')   //日
								$('#editModal1 .editModalHours>option[value='+thisActData.hour+']').attr('selected',true)   //时
								$('#editModal1 .editModalMinute>option[value='+thisActData.minute+']').attr('selected',true)   //分
								$('#editModal1 #ifOrder>option[value='+thisActData.state+']').attr('selected',true)   //是否预约
								if(thisActData.state==false){$('.ifOrderChange').hide()}else{$('.ifOrderChange').show()}  //是否预约显示人数和天数
								$('#editModal1 #reserveNum').val(thisActData.bespeaknum)   //预约人数
								$('#editModal1 #reserveTime').val(thisActData.bespeakday)   //提前预约天数
								$('#editModal1 .sureEdit').unbind("click").click(function() {  //保存事件
									FN.saveOnceAct(thisActData.oaid)
								})
							}
						}else{
							alert('服务器请求失败：'+res2)
						}
					})
				}else{
					alert('服务器请求失败：'+res1)
				}
			})
			//活动照片及课件渲染--------------------------------------------------
			FN.hdbs('actionPic',actionPicData,actionPicHtml)   //照片
			//课件图标颜色
			var coursewareBg = function() {
				$('.coursewareFileItem>button').each(function() {
					var txt = $(this).text()
					if (txt== 'docx' || txt== 'doc') {
						$(this).addClass('btn-success')
					}else if(txt== 'ppt' || txt== 'pptx' || txt== 'pot'|| txt== 'potx'){
						$(this).addClass('btn-primary')
					}
					else if(txt== 'pdf'){
						$(this).addClass('btn-danger')
					}
					else if(txt== 'xls'|| txt== 'xlsx'){
						$(this).addClass('btn-info')
					}
				})
			}()
		})
		/*上传Excel弹窗判断*/
		$('#upExcelModal').on('show.bs.modal', function (ev){
			var excelType = $(ev.relatedTarget).data('type')
			if (excelType=='once') {
				$('.sureUpExcel').unbind('click').click(function() {
					var formData = new FormData($('#upExcelForm')[0])
					if (formData.get('uploadfile').name.indexOf('.xlsx')==-1) {
						alert('文件格式只能是.xlsx后缀')
					}else{
						FN.setData('/extractExcel',formData,function(res) {
							if (res==200) {
								$('#upExcelModal').modal('hide')   //关闭模态框
								console.log('上传成功')
							} else{
								console.log('上传失败')
							}
						},true)
					}
				})
			}else{
				
			}
		})
		/*人员名单弹窗判断*/
		$('#nameListModal').on('show.bs.modal', function (ev){
			var button = $(ev.relatedTarget)
			var nametype = button.data('nametype')
			var modal = $(this)
			if (nametype=='order') { 
				modal.find('h4.modal-title').text('预约人员名单')
				//...
			}else if(nametype=='signin'){
				modal.find('h4.modal-title').text('实际签到名单')
				//...
			}
		})
		/*课件/图片弹窗判断*/
		$('#fileViewModal').on('show.bs.modal', function (ev){
			var button = $(ev.relatedTarget)
			var filetype = button.data('filetype')
			var modal = $(this)
			modal.find('.modal-body').html('')
			if (filetype=='courseware') {  
				modal.find('h4.modal-title').text('活动课件下载')
				modal.find('.modal-body').addClass('list-group').removeClass('row')
				for (var i=0;i<coursewareName.length;i++) {
					modal.find('.modal-body').append("<li role='button' class='list-group-item'>"+coursewareName[i]+"."+coursewareType[i]+"<span style='font-size: 18px;float: right;' class='glyphicon glyphicon-download-alt' aria-hidden='true'></span></li>")
				}
			}else if(filetype=='pic'){
				modal.find('h4.modal-title').text('活动照片查看')
				modal.find('.modal-body').addClass('row').removeClass('list-group')
				for (var i=0;i<uploadFileData.pic.length;i++) {
					modal.find('.modal-body').append("<div class='col-sm-4'><img src="+uploadFileData.pic[i]+" /></div>")
				}
			}
		})
	//}else if(res==0){
		//document.write('服务器请求失败')
	//}else{
		//window.location.href="login.html"
		//console.log(res)
	//}
//})
