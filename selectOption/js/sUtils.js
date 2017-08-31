/**
 * mediaroom
 */
/**
 * 树形转换工具类
 * @type {{clearChildrenData}}
 */
var treeUtils = function() {

	return {

		/**
		 * 过滤掉 本身 和 节孩子节点数据
		 *
		 * @param treeData 整棵树的数据
		 * @param fieldName 匹配字段（保证在整个树型的数据中是唯一的，如果不唯一有可能会删除多个）
		 * @param value 匹配值
		 */
		clearChildrenData: function(treeData, fieldName, value) {
			if(treeData == null || fieldName == null) {
				return [];
			}

			// 删除结点
			function removeChild(parent, indx) {
				parent.splice(indx, 1);
			}

			// 递归
			function recursionChilren(children) {
				for(var i = 0; i < children.length; i++) {
					var child = children[i];
					if(child[fieldName] == value) {
						// 删除方法调用
						removeChild(children, i);
						return;
					} else {
						var childChildren = child.children;
						if(sUtils.notNull(childChildren) && childChildren.length > 0) {
							recursionChilren(childChildren);
						}
					}
				}
			}

			// 第一遍循环
			for(var i = 0; i < treeData.length; i++) {
				var td = treeData[i];
				if(td[fieldName] == value) {
					removeChild(treeData, i);
					break;
				} else {
					var tdChildren = td.children;
					if(sUtils.notNull(tdChildren) && tdChildren.length > 0) {
						recursionChilren(tdChildren);
					}
				}
			}
			return treeData;
		}
	};

}();

/**
 * 登录工具类
 * @type {{authCodeShow, showMsg, show, msgConfirm, setLoginUrl, setFormId, login, logoutBtn, loginBtn, checkLogin, version}}
 */
var loginUtils = function() {

	var formSelected = '#formLogin';

	var loginBtnSelected = '#loginBtn';

	//var homeUrl = path + '/admin/sec.jsp';

	//var loginUrl = path + '/action/pub/login/logIn.do';

	//var logoutUrl = path + '/action/pub/login/logOut.do';

	var LOGIN_FAIL_COUNT = 'LOGIN_FAIL_COUNT';

	var redirect = '';

	var HAND_LOGIN = 1;

	var AUTO_LOGIN = 2;

	/**
	 * 获取登录失败次数
	 * @returns {Number}
	 */
	function getLoginFailCount() {
		return parseInt(localStorage.getItem(LOGIN_FAIL_COUNT));
	}

	/**
	 * 添加登录失败次数
	 */
	function addLoginFailCount() {
		var count = 1;
		if(getLoginFailCount() > 0) {
			count = getLoginFailCount() + 1;
		}
		localStorage.setItem(LOGIN_FAIL_COUNT, count);
	}

	/**
	 * 移除登录失败结果
	 */
	function removeLoginFailCount() {
		localStorage.removeItem(LOGIN_FAIL_COUNT);
	}

	/**
	 * 缓存数据
	 * @param data
	 */
	function cacheData(data) {
		stroage.setLocalItem(CURRENT_USER_ID, data.obj[CURRENT_USER_ID]);
		//FIXME ACCOUNT对象密码不能返回前端，后端要拦截
		stroage.setLocalItem(CURRENT_USER_OBJECT, data.obj[CURRENT_USER_OBJECT]);
		stroage.setLocalItem(CURRENT_USER_RIGHTS, data.obj[CURRENT_USER_RIGHTS]);
		stroage.setLocalItem(CURRENT_USER_RIGHTS_URL, data.obj[CURRENT_USER_RIGHTS_URL]);
		stroage.setLocalItem(CURRENT_USER_RIGHTS_CODE, data.obj[CURRENT_USER_RIGHTS_CODE]);
		stroage.setLocalItem(CURRENT_USER_ROLES, data.obj[CURRENT_USER_ROLES]);
		stroage.setLocalItem(CURRENT_USER_MENUS, data.obj[CURRENT_USER_MENUS]);
		stroage.setLocalItem(CURRENT_USER_MENUS_ADMIN, data.obj[CURRENT_USER_MENUS_ADMIN]);
	}

	return {

		/**
		 * 跳转url 参数
		 * @returns {string}
		 */
		getRedirect: function() {
			return redirect;
		},

		/**
		 * 显示验证码
		 */
		authCodeShow: function() {

		},

		/**
		 * 弹窗显示信息
		 * @param msg
		 */
		showMsg: function(msg) {
			alert('警告:' + msg);
		},

		/**
		 * 登录成功弹窗
		 * @param msg
		 */
		showSuccessMsg: function(msg) {
			//alert(msg);
		},

		/**
		 * 弹窗显示信息
		 * @param msg
		 */
		showWarnMsg: function(msg) {
			alert('警告:' + msg);
		},

		/**
		 * 登录成功弹窗
		 * @param msg
		 */
		show: function(msg) {
			alert(msg);
		},

		/**
		 * 确认弹窗
		 */
		confirm: function(msg, okFun, cancelFun) {
			if(confirm('提示:' + msg)) {
				if(jQuery.isFunction(okFun)) okFun();
			} else {
				if(jQuery.isFunction(cancelFun)) cancelFun();
			}
		},

		/**
		 * 重置登录页面
		 */
		setLoginUrl: function(url) {
			homeUrl = url;
		},

		/**
		 * 充值登录表单id
		 */
		setFormId: function(selected) {
			formSelected = selected;
		},

		/**
		 * 登录成功的特殊处理
		 */
		loginSuccess: function() {
			return true;
		},

		/**
		 * 登录操作
		 * @param loginType 1，用户登录；2，自动登录
		 * @param params
		 * @param force true强制登录
		 *
		 */
		login: function(loginType, params, force) {
			$(loginBtnSelected).attr('disabled', true);
			params.loginType = loginType;
			params.redirect = loginUtils.getRedirect();

			if(force) params.isForceLogin = true; //强制登录

			sPost.ajax(loginUrl, params, function(data, textStatus, jqXHR) {
				goHome(data);
				//FIXME 登录action保存登录状态到cookie中

			}, function(jqXHR, textStatus, errorThrown) { //fail
				loginUtils.showMsg('服务器连接异常，请与管理员联系！');
			});

			/**
			 * 跳转到首页
			 * @param data
			 */
			function goHome(data) {
				if(data.success) {
					removeLoginFailCount();
					loginUtils.show('登录成功！');
					cacheData(data);
					if(loginUtils.loginSuccess()) {
						if(sUtils.notNull(data.obj) && sUtils.notNull(data.obj['redirect'])) {
							window.location.href = path + data.obj['redirect'];
						} else {
							window.location.href = homeUrl;
						}
					}
				} else {
					if(data.errorCode == 3) { // 已有用户登录
						if(confirm('当前用户已在其他终端登录，是否强制登录？')) {
							loginUtils.login(loginType, params, true);
						}
					} else {
						addLoginFailCount();
						loginUtils.showMsg('登录失败：' + data.msg);
					}
				}
			}

			$(loginBtnSelected).attr('disabled', false);
		},

		/**
		 * 登出
		 */
		logoutBtn: function() {
			loginUtils.confirm('您是否要退出当前登录？', function() {
				sPost.ajax(logoutUrl, null, function(data, textStatus, jqXHR) {
					window.location.href = path;
				}, function(jqXHR, textStatus, errorThrown) { //fail
					loginUtils.showMsg('服务器连接异常，请与管理员联系！');
				});
			})
		},

		fromValidate: function() {
			return $(formSelected).form('validate');
		},

		/**
		 * 登录按钮
		 */
		loginBtn: function() {

			slog.log('logBtn click');
			if(getLoginFailCount() > 2) {
				//TODO 添加验证码
				slog.error('登录失败超过3次');
			}

			if(!loginUtils.fromValidate()) {
				return;
			}

			var params = sUtils.getFormParams(formSelected);
			params.password = CryptoUtils.md5(params.password);

			loginUtils.login(HAND_LOGIN, params);

		},

		/**
		 * 绑定登录事件
		 */
		loginBtnBind: function() {
			//登录的回车事件
			document.onkeypress = function(e) {
				var ev = document.all ? window.event : e;
				if(ev.keyCode == 13) {
					loginUtils.loginBtn();
				}
			};
			$(loginBtnSelected).attr('disabled', false);

			$(loginBtnSelected).bind('click', function() {
				loginUtils.loginBtn();
			});

		},

		/**
		 * 判断session，有session直接跳转到首页
		 */
		checkLogin: function(curUserId) {

			loginUtils.loginBtnBind();

			function checkCookie() {
				var saveLogin = $.cookie('SAVE_LOGIN');
				if(sUtils.notNull(saveLogin) && saveLogin.length > 8) {
					slog.log('saveLog:' + saveLogin);
					loginUtils.login(AUTO_LOGIN, {
						username: saveLogin,
						password: 'U2FsdGVkX19VaWdMdkpvAly6dRF5Tf6ronZ0zYxe3AM='
					});
				}
			}

			/*		var timeOut = $.cookie('SESSION_TIME_OUT');
			 /!*
			 如果超时， timeOut == 1，不做任何事情
			 如果

			 第一次登录
			 timeOut == null && session存在， 则跳转

			 session超时
			 timeOut == 1，不做任何事情，登录后把timeOut设置为2
			 *!/

			 if (timeOut == 2) {
			 var id = $.cookie('JSESSIONID');
			 if (id) {
			 window.location.href = homeUrl;
			 }
			 }*/

			checkCookie();

		},

		/**
		 * 打印版本号
		 * @returns {number}
		 */
		version: function() {
			var version = 0.5;
			slog.log('loginUtils version: ' + version);
			return version;
		}
	}

}();

/**
 * 本地存储方式方法工具类，存入和取出对象有用，存入和取出非对象，直接用localStorage/sessionStorage
 * @type {{setLocalItem, getLocalItem, setSessionItem, getSessionItem, version}}
 */
var stroage = function() {

	/* ************************* private method start *************************************** */

	/*	function objToJsonString(value) {
	 if (typeof value != 'string') {
	 value = JSON.stringify(value);
	 }
	 return value;
	 }*/

	/* ************************* private method end *************************************** */

	return {

		/**
		 * 设置浏览器存储
		 * @param key
		 * @param value 支持对象、数组
		 */
		setLocalItem: function(key, value) {
			localStorage.setItem(key, sUtils.objToJsonString(value));
		},

		/**
		 * 获取浏览器存储值
		 * @param key
		 */
		getLocalItem: function(key) {
			var value = localStorage.getItem(key);
			return JSON.parse(value);
		},

		/**
		 * 设置浏览器session存储
		 * @param key
		 * @param value 支持对象、数组
		 */
		setSessionItem: function(key, value) {
			sessionStorage.setItem(key, sUtils.objToJsonString(value));
		},

		/**
		 * 获取浏览器session存储值
		 * @param key
		 */
		getSessionItem: function(key) {
			var value = sessionStorage.getItem(key);
			return JSON.parse(value);
		},

		version: function() {}
	}

}();

/**
 * 日志打印控制
 * @type {{log, info, debug, error}}
 */
var slog = function() {

	var debug = true;
	var log = true;
	var info = true;
	var error = true;

	return {

		/**
		 * 设置所有级别日志打印状态
		 * @param flag true打印，false不打印
		 */
		setAll: function(flag) {
			log = flag;
			debug = flag;
			info = flag;
			error = flag;
			console.error('slog setAll: ' + flag);
		},

		/**
		 * 设置log级别日志打印状态
		 * @param flag true打印，false不打印
		 */
		setLog: function(flag) {
			log = flag;
			console.warn('slog setLog: ' + flag);
		},

		/**
		 * 设置debug级别日志打印状态
		 * @param flag true打印，false不打印
		 */
		setDebug: function(flag) {
			debug = flag;
			console.warn('slog setDebug: ' + flag);
		},

		/**
		 * 设置info级别日志打印状态
		 * @param flag true打印，false不打印
		 */
		setInfo: function(flag) {
			info = flag;
			console.warn('slog setInfo: ' + flag);
		},

		/**
		 * 设置error级别日志打印状态
		 * @param flag true打印，false不打印
		 */
		setError: function(flag) {
			error = flag;
			console.warn('slog setError: ' + flag);
		},

		/**
		 * 打印日志
		 * @param msg
		 */
		log: function(msg) {
			if(log) console.log(msg);
		},

		/**
		 * 打印日志
		 * @param msg
		 */
		debug: function(msg) {
			if(debug) console.debug(msg);
		},

		/**
		 * 打印日志
		 * @param msg
		 */
		info: function(msg) {
			if(info) console.info(msg);
		},

		/**
		 * 可以打印堆栈日志
		 * @param msg
		 */
		error: function(msg) {
			if(error) console.error(msg);
		}

	}

}();

/**
 * <PRE>
 * 数学方法
 * </PRE>
 * <B>技术支持：</B>三盟信息科技 (c) 2016
 * @version   1.0 2016-01
 * @author    黄坚：huangjian@sunmnet.com
 */
var mathUtils = function() {

	return {

		/**
		 * js 两数相乘  float精度问题
		 * @param arg1
		 * @param arg2
		 * @returns {number}
		 */
		accMul: function(arg1, arg2) {
			var m = 0,
				s1 = arg1.toString(),
				s2 = arg2.toString();
			try {
				m += s1.split('.')[1].length;
			} catch(e) {}
			try {
				m += s2.split('.')[1].length;
			} catch(e) {}
			return Number(s1.replace('.', '')) * Number(s2.replace('.', '')) / Math.pow(10, m);
		},

		/**
		 * js 两数相除  float精度问题
		 * @param arg1
		 * @param arg2
		 * @returns {number}
		 */
		accDiv: function(arg1, arg2) {
			var t1 = 0,
				t2 = 0,
				r1, r2;
			try {
				t1 = arg1.toString().split('.')[1].length;
			} catch(e) {}
			try {
				t2 = arg2.toString().split('.')[1].length;
			} catch(e) {}
			with(Math) {
				r1 = Number(arg1.toString().replace('.', ''));
				r2 = Number(arg2.toString().replace('.', ''));
				return(r1 / r2) * pow(10, t2 - t1);
			}
		},

		/**
		 * js 两数相加 float精度问题
		 * @param arg1
		 * @param arg2
		 * @returns {number}
		 */
		accAdd: function(arg1, arg2) {
			var r1, r2, m;
			try {
				r1 = arg1.toString().split('.')[1].length;
			} catch(e) {
				r1 = 0;
			}
			try {
				r2 = arg2.toString().split('.')[1].length;
			} catch(e) {
				r2 = 0;
			}
			m = Math.pow(10, Math.max(r1, r2));
			return(arg1 * m + arg2 * m) / m;
		},

		/**
		 * 两数相减
		 * @param arg1
		 * @param arg2
		 * @returns {string}
		 * @constructor
		 */
		subtr: function(arg1, arg2) {
			var r1, r2, m, n;
			try {
				r1 = arg1.toString().split('.')[1].length;
			} catch(e) {
				r1 = 0;
			}
			try {
				r2 = arg2.toString().split('.')[1].length;
			} catch(e) {
				r2 = 0;
			}
			m = Math.pow(10, Math.max(r1, r2));
			n = (r1 >= r2) ? r1 : r2;
			return((arg1 * m - arg2 * m) / m).toFixed(n);
		}
	}
}();

/**
 * <PRE>
 *    时间处理工具类
 * </PRE>
 * <B>技术支持：</B>三盟信息科技 (c) 2016
 * @version   1.0 2016-01
 * @author    黄坚：huangjian@sunmnet.com
 */
var dateUtils = function() {

	return {

		/**
		 * 将时间类型转换成字符串
		 * @param time
		 * @param useType
		 * @returns {string}
		 */
		dateToStr: function(time, useType) {
			var year = time.getFullYear();
			var month = time.getMonth();
			var day = time.getDate();
			var hour = time.getHours();
			var min = time.getMinutes();
			var seconds = time.getSeconds();

			var dataStr = year + '-' + this.paddingLeftByZero((month + 1), 2) + '-' + this.paddingLeftByZero(day, 2);
			if(useType != 'notAddTime') {
				dataStr += ' ' + this.paddingLeftByZero(hour, 2) + ':' + this.paddingLeftByZero(min, 2) + ':' + this.paddingLeftByZero(seconds, 2);
			}

			return dataStr;
		},

		/**
		 *
		 * @param time
		 * @returns {string}
		 */
		dataStrFormat: function(time) { //将2013-03-26 21:32:00 000形式的时间字符串，转换成2013-03-26 21:32:00
			if(time != null && time != '') {
				return time.substr(0, 19);
			}
		},

		/**
		 *
		 * @param time
		 * @param useType
		 * @returns {*}
		 */
		timeToStr: function(time, useType) { //将时间戳类型转换成字符串
			var data = new Date(time);
			return this.dateToStr(data, useType);
		},

		/**
		 *
		 * @param time
		 * @returns {string}
		 */
		dataStrSimpleFormat: function(time) {
			if(time != null && time != '') {
				return time.substr(0, 10);
			}
		},

		/**
		 *
		 * @param time
		 * @param format
		 * @returns {*|XML|void|string}
		 */
		timeToFormatStr: function(time, format) { //将时间戳转换成指定的格式字符串
			var t = new Date(time);
			var tf = function(i) {
				return(i < 10 ? '0' : '') + i;
			};
			return format.replace(/yyyy|MM|dd|HH|mm|ss/g,
				function(a) {
					switch(a) {
						case 'yyyy':
							return tf(t.getFullYear());
							break;
						case 'MM':
							return tf(t.getMonth() + 1);
							break;
						case 'mm':
							return tf(t.getMinutes());
							break;
						case 'dd':
							return tf(t.getDate());
							break;
						case 'HH':
							return tf(t.getHours());
							break;
						case 'ss':
							return tf(t.getSeconds());
							break;
					}
				});
		},

		/**
		 * 获取当前时间
		 */
		getNowFormatDate: function() {
			var day = new Date();
			var Year = 0;
			var Month = 0;
			var Day = 0;
			var Hour;
			var Minute;
			var Second;
			var CurrentDate = '';
			//初始化时间
			//Year= day.getYear();//有火狐下2008年显示108的bug
			Year = day.getFullYear(); //ie火狐下都可以
			Month = day.getMonth() + 1;
			Day = day.getDate();
			Hour = day.getHours();
			Minute = day.getMinutes();
			Second = day.getSeconds();
			CurrentDate += Year + '-';
			if(Month >= 10) {
				CurrentDate += Month + '-';
			} else {
				CurrentDate += '0' + Month + '-';
			}
			if(Day >= 10) {
				CurrentDate += Day;
			} else {
				CurrentDate += '0' + Day;
			}
			CurrentDate += ' ';

			if(Hour >= 10) {
				CurrentDate += Hour + ':';
			} else {
				CurrentDate += '0' + Hour + ':';
			}
			if(Minute >= 10) {
				CurrentDate += Minute + ':';
			} else {
				CurrentDate += '0' + Minute + ':';
			}
			if(Second >= 10) {
				CurrentDate += Second;
			} else {
				CurrentDate += '0' + Second;
			}
			return CurrentDate;
		},

		/**
		 * 获取当前日期前N天
		 */
		getAfterDate: function(curDate, days) {
			//获取s系统时间
			var LSTR_ndate = new Date(Date.parse(curDate.replace(/-/g, '/')));
			var LSTR_Year = LSTR_ndate.getFullYear();
			var LSTR_Month = LSTR_ndate.getMonth();
			var LSTR_Date = LSTR_ndate.getDate();
			//处理
			var uom = new Date(LSTR_Year, LSTR_Month, LSTR_Date);
			uom.setDate(uom.getDate() - days); //取得系统时间的前一天,重点在这里,负数是前几天,正数是后几天
			var LINT_MM = uom.getMonth();
			LINT_MM++;
			var LSTR_MM = LINT_MM > 10 ? LINT_MM : ('0' + LINT_MM);
			var LINT_DD = uom.getDate();
			var LSTR_DD = LINT_DD >= 10 ? LINT_DD : ('0' + LINT_DD);
			//得到最终结果
			uom = uom.getFullYear() + '-' + LSTR_MM + '-' + LSTR_DD;
			return uom + ' 00:00:00';
		},

		/**
		 * 获取当前日期前N分钟（小时）
		 */
		getAfterTime: function(curDate, time, type) {
			var hour = '00';
			var minute = '00';
			//获取s系统时间
			var LSTR_ndate = new Date(Date.parse(curDate.replace(/-/g, '/')));
			var LSTR_Year = LSTR_ndate.getFullYear();
			var LSTR_Month = LSTR_ndate.getMonth();
			var LSTR_Date = LSTR_ndate.getDate();
			var LSTR_Hour = LSTR_ndate.getHours();
			var LSTR_Minute = LSTR_ndate.getMinutes();
			var LSTR_seconds = LSTR_ndate.getSeconds();
			if(LSTR_seconds < 10) {
				LSTR_seconds = '0' + LSTR_seconds;
			}
			//处理
			var uom = new Date(LSTR_Year, LSTR_Month, LSTR_Date);
			if(type == 'hour') {
				if(LSTR_Hour < 1) {
					uom.setDate(uom.getDate() - 1);
					hour = 59;
				} else {
					hour = LSTR_Hour - 1;
				}
				minute = LSTR_Minute;
			} else if(type == 'minute') {
				if(LSTR_Minute < 10) {
					//uom.setDate(uom.getDate() - 1);
					minute = 60 + LSTR_Minute - 10;
					if(LSTR_Hour > 1) {
						hour = LSTR_Hour - 1;
					} else {
						hour = 23;
						uom.setDate(uom.getDate() - 1);
					}
				} else {
					minute = LSTR_Minute - 10;
					hour = LSTR_Hour;
				}
			}
			var LINT_MM = uom.getMonth();
			LINT_MM++;
			var LSTR_MM = LINT_MM > 10 ? LINT_MM : ('0' + LINT_MM);
			var LINT_DD = uom.getDate();
			var LSTR_DD = LINT_DD >= 10 ? LINT_DD : ('0' + LINT_DD);
			//得到最终结果
			uom = uom.getFullYear() + '-' + LSTR_MM + '-' + LSTR_DD;
			if(hour != '00') {
				hour = hour < 10 ? ('0' + hour) : hour;
			}
			if(minute != '00') {
				minute = minute < 10 ? ('0' + minute) : minute;
			}
			return uom + ' ' + hour + ':' + minute + ':' + LSTR_seconds;
		}

	}

}();

/**
 * <PRE>
 *    后台请求方法
 * </PRE>
 * <B>技术支持：</B>三盟信息科技 (c) 2016
 * @version   1.0 2016-01
 * @author    黄坚：huangjian@sunmnet.com
 */
var sPost = function() {

	/* ************************* private method start *************************************** */

	/**
	 * 获取枚举数据
	 * @param url            请求的action地址
	 * @param tableName        表名
	 * @param key            字段名
	 * @returns {*}
	 */
	function getEnumLists(url, tableName, key) {
		//var url = path + '/action/pub/enum/findActiveEnumShowValue.do';
		var params = {
			tableName: tableName,
			enumKey: key
		};
		var data = sPost.getPostResponse(url, params);
		if(data.success) {
			return data.obj;
		} else {
			console.error('获取枚举数据失败' + data.msg);
		}

	}

	function checkTimeout(data) {
		if(data.errorCode == 402) {
			window.location = path + '/admin/security/login.jsp';
		}
	}

	/* ************************* private method end *************************************** */
	return {

		/**
		 * resful规范方法： PUT 修改
		 * @param url
		 * @param params
		 * @param successFun
		 * @param failFun
		 * @param alwaysFun
		 * @param async
		 */
		ajaxPut: function(url, params, successFun, failFun, alwaysFun, async) {
			if(sUtils.isNull(params)) {
				params = {};
			}
			params._method = 'PUT';
			return sPost.ajax(url, params, successFun, failFun, alwaysFun, 'PUT', async);
		},

		/**
		 * resful规范方法： DELETE 单个删除
		 * @param url action/obj/{id}
		 * @param params
		 * @param successFun
		 * @param failFun
		 * @param alwaysFun
		 * @param async
		 */
		ajaxDel: function(url, params, successFun, failFun, alwaysFun, async) {
			if(sUtils.isNull(params)) {
				params = {};
			}
			params._method = 'DELETE';
			return sPost.ajax(url, params, successFun, failFun, alwaysFun, 'DELETE', async);
		},

		/**
		 * resful规范方法： PATCH IBaseWebModel支持
		 * @param url
		 * @param params \{'Q_field_=String': '', 'Q_field_Like': ''\}
		 * @param successFun
		 * @param failFun
		 * @param alwaysFun
		 * @param async
		 */
		ajaxFind: function(url, params, successFun, failFun, alwaysFun, async) {
			if(sUtils.isNull(params)) {
				params = {};
			}
			params._method = 'PATCH';
			return sPost.ajax(url, params, successFun, failFun, alwaysFun, 'POST', async);
		},

		/**
		 * resful规范方法： GET getById
		 * @param url action/obj/{id}
		 * @param successFun
		 * @param failFun
		 * @param alwaysFun
		 * @param async
		 */
		ajaxGet: function(url, successFun, failFun, alwaysFun, async) {
			return sPost.ajax(url, null, successFun, failFun, alwaysFun, 'GET', async);
		},

		/**
		 * 获取post返回
		 * @param url        请求的action地址
		 * @param params    请求的参数对象{}
		 * @param async    false为同步，这个方法中的Ajax请求将整个浏览器锁死，请求成功后，才执行success中的方法
		 */
		getPostResponse: function(url, params, async) {
			var reData = {};
			sPost.ajax(url, params, function(data, textStatus, jqXHR) {
				reData = data;
			}, null, null, 'POST', async);
			return reData;
		},

		/**
		 * 根据枚举关键字配置获取枚举集合
		 *
		 * @param enums     【表名】-【字段名】数组 var eums = ['sec_account-active', 'pub-sex'];
		 * @returns {new sMap}
		 */
		getEnumMap: function(enums) {
			function toMap(obj, map) {
				for(var key in obj) {
					map.put(key, obj[key]);
				}
				return map;
			}

			var len = enums.length;
			var enumMap = new sMap();
			var enumKey = '';
			var enumKeys = '';
			while(len--) {
				enumKey = enums[len];
				enumKeys += enumKey + '|';
			}
			enumKeys = enumKeys.substring(0, enumKeys.length - 1);
			var data = sPost.getPostResponse(
				path + '/action/pub/enum/findActiveEnums.do', {
					enumKeys: enumKeys
				});
			return toMap(data.obj, enumMap);
		},

		/**
		 * 获取枚举值
		 * @param tableName
		 * @param key
		 * @returns {*}
		 */
		getEnumValues: function(tableName, key) {
			var url = path + '/action/pub/enum/findActiveEnums';
			return getEnumLists(url, tableName, key);

		},

		/**
		 *    result风格 新增或者更新
		 * @param url
		 * @param params
		 * @param async
		 * @returns {*}
		 */
		addOrUpdate: function(url, params, async) {
			if(params.id) {
				return sPost.update(url, params, async);
			} else {
				return sPost.add(url, params, async);
			}
		},

		/**
		 * var param = {id: 1, name: '张三', sex: '男', age: 23};
		 * var url = path + '/action/test/person/';
		 * var data = sPost.add(url, params);
		 * @param url
		 * @param params
		 * @param async
		 */
		add: function(url, params, async) {
			return sPost.post(url, params, async);
		},
		/**
		 * var param = {id: 1, name: '张三', sex: '男', age: 23};
		 * var url = path + '/action/test/person/';
		 * var data = sPost.add(url, params);
		 * @param url
		 * @param params
		 * @param async
		 */
		post: function(url, params, async) {
			var reData = {};
			sPost.ajax(url, params, function(data, textStatus, jqXHR) {
				reData = data;
			}, null, null, 'POST', async);
			return reData;
		},

		/**
		 * var param = {_method: 'PUT', id: 221, name: '王五', sex: '男', age: 23};
		 * var url = path + '/action/test/person/';
		 * var data = sPost.update(url, params);
		 * @param url
		 * @param params
		 * @param async
		 */
		update: function(url, params, async) {
			return sPost.put(url, params, async);
		},
		/**
		 * var param = {_method: 'PUT', id: 221, name: '王五', sex: '男', age: 23};
		 * var url = path + '/action/test/person/';
		 * var data = sPost.update(url, params);
		 * @param url
		 * @param params
		 * @param async
		 */
		put: function(url, params, async) {
			params._method = 'PUT';
			//return sPost.ajax(url, 'PUT', params, async);
			var reData = {};
			sPost.ajax(url, params, function(data, textStatus, jqXHR) {
				reData = data;
			}, null, null, 'PUT', async);
			return reData;
		},

		/**
		 * var param = {_method: 'PATCH', name: '张三'};
		 * var url = path + '/action/test/person/';
		 * var data = sPost.find(url, params);
		 * @param url
		 * @param params
		 * @param async
		 */
		find: function(url, params, async) {
			params._method = 'PATCH';
			//return sPost.ajax(url, 'POST', params, async);
			var reData = {};
			sPost.ajax(url, params, function(data, textStatus, jqXHR) {
				reData = data;
			}, null, null, 'POST', async);
			return reData;
		},

		/**
		 *  var url = path + '/action/test/person/{id}';
		 *  var data = sPost.getObject(url);
		 * @param url
		 * @param async
		 * @returns {*}
		 */
		getObject: function(url, async) {
			return sPost.get(url, null, async);
		},
		/**
		 *  var url = path + '/action/test/person/{id}';
		 *  var data = sPost.getObject(url);
		 * @param url
		 * @param async
		 * @returns {*}
		 */
		get: function(url, params, async) {
			//return sPost.ajax(url, 'GET', null, async);
			var reData = {};
			sPost.ajax(url, params, function(data, textStatus, jqXHR) {
				reData = data;
			}, null, null, 'GET', async);
			return reData;
		},

		/**
		 *  var url = path + '/action/test/person/{id}';
		 *  var data = sPost.del(url);
		 *
		 * @param url
		 * @param async
		 * @returns {*}
		 */
		del: function(url, async) {
			//return sPost.ajax(url, 'DELETE', null, async);
			var reData = {};
			sPost.ajax(url, null, function(data, textStatus, jqXHR) {
				reData = data;
			}, null, null, 'DELETE', async);
			return reData;
		},

		/**
		 *    var url = path + '/action/test/person/batch';
		 *    var arrs = new Array(1, 2, 3);
		 *    var param = {ids: arrs};
		 *    param = {ids: '1,2,3'};
		 *    var data = sPost.batchDelete(url, param);
		 *
		 * @param url
		 * @param param
		 * @param async
		 * @returns {*}
		 */
		batchDelete: function(url, params, async) {
			//return sPost.ajax(url + 'batch', 'POST', params, async);
			var reData = {};
			sPost.ajax(url + 'batch', params, function(data, textStatus, jqXHR) {
				reData = data;
			}, null, null, 'POST', async);
			return reData;
		},

		/**
		 *
		 * @param url
		 * @param type
		 * @param params
		 * @param async
		 * @returns {{}}
		 */
		/*		ajax2: function (url, type, params, async) {
		 if (sUtils.isNull(async)) {
		 async = false;
		 }
		 var reData = {};
		 $.ajax({
		 url: url,
		 type: type,
		 dataType: 'json',
		 contentType: 'application/x-www-form-urlencoded;charset=UTF-8',
		 async: async,
		 data: params
		 }).done(function (data, status, xhr) {
		 //console.log(data);
		 reData = data;
		 }).fail(function (data, status, error) {
		 alert('提示: 服务器发生故障！status: ' + status + ', error: ' + error);
		 });
		 return reData;
		 },*/

		/**
		 * ajax请求
		 * @param url
		 * @param params    参数
		 * @param successFun    成功时回调函数
		 * @param failFun        失败回调函数
		 * @param alwaysFun        成功或失败都执行的回调函数
		 * @param type            请求类型
		 * @param async            是否同步
		 */
		ajax: function(url, params, successFun, failFun, alwaysFun, type, async) {
			if(sUtils.isNull(async)) async = false;
			if(sUtils.isNull(type)) type = 'POST';
			return $.ajax({
				url: url,
				type: type,
				dataType: 'json',
				contentType: 'application/x-www-form-urlencoded;charset=UTF-8',
				async: async,
				data: params,
				traditional: true
			}).done(function(data, textStatus, jqXHR) {
				if(jQuery.isFunction(successFun))
					successFun(data, textStatus, jqXHR);
			}).fail(function(XMLHttpRequest, textStatus, errorThrown) {
				// 登录超时或被强制退出在 complete 处理
				if(sUtils.isNull(XMLHttpRequest) || XMLHttpRequest.getResponseHeader("mystatus") != 'sessionOutAndToLogin') {
					if(jQuery.isFunction(failFun)) {
						failFun(XMLHttpRequest, textStatus, errorThrown);
					} else {
						console.error('服务器发生故障！status: ' + textStatus + ', error: ' + errorThrown);
					}
				}
			}).always(function(dataOrjqXHR, textStatus, jqXHROrerrorThrown) {
				if(jQuery.isFunction(alwaysFun))
					alwaysFun(dataOrjqXHR, textStatus, jqXHROrerrorThrown)
			}).complete(function(XMLHttpRequest, textStatus, xhr) {
				if(sUtils.notNull(XMLHttpRequest) && XMLHttpRequest.getResponseHeader("mystatus") == 'sessionOutAndToLogin') {
					alert('' + CryptoUtils.aesDecryptUtf8(XMLHttpRequest.getResponseHeader("msg")));
					window.location.href = XMLHttpRequest.getResponseHeader("href");
				}
			});

		},

		version: function() {}
	}

}();

/*
 * MAP对象，实现MAP功能
 *
 * 接口：
 * size()     获取MAP元素个数
 * isEmpty()    判断MAP是否为空
 * clear()     删除MAP所有元素
 * put(key, value)   向MAP中增加元素（key, value)
 * remove(key)    删除指定KEY的元素，成功返回True，失败返回False
 * get(key)    获取指定KEY的元素值VALUE，失败返回NULL
 * element(index)   获取指定索引的元素（使用element.key，element.value获取KEY和VALUE），失败返回NULL
 * containsKey(key)  判断MAP中是否含有指定KEY的元素
 * containsValue(value) 判断MAP中是否含有指定VALUE的元素
 * values()    获取MAP中所有VALUE的数组（ARRAY）
 * keys()     获取MAP中所有KEY的数组（ARRAY）
 *
 * 例子：
 * var map = new Map();
 *
 * map.put('key', 'value');
 * var val = map.get('key')
 * ……
 *
 var map = new Map();

 map.put('key1', 'value1');
 map.put('key2', 'value2');
 map.put('key3', 'value3');


 //var val = map.get('key1');
 //	var val = map.containsKey('key1');
 //	var val = map.element(2).value;

 var arr=map.keys();
 for(var i=0;i<arr.length;i++){
 alert(map.get(arr[i]));
 }
 //  alert(val);
 */
function sMap() {

	this.elements = new Array();

	//获取MAP元素个数
	this.size = function() {
		return this.elements.length;
	}

	//判断MAP是否为空
	this.isEmpty = function() {
		return(this.elements.length < 1);
	}

	//删除MAP所有元素
	this.clear = function() {
		this.elements = new Array();
	}

	//向MAP中增加元素（key, value)
	this.put = function(_key, _value) {
		this.elements.push({
			key: _key,
			value: _value
		});
	}

	//删除指定KEY的元素，成功返回True，失败返回False
	this.remove = function(_key) {
		var bln = false;
		try {
			for(var i = 0; i < this.elements.length; i++) {
				if(this.elements[i].key == _key) {
					this.elements.splice(i, 1);
					return true;
				}
			}
		} catch(e) {
			bln = false;
		}
		return bln;
	}

	//获取指定KEY的元素值VALUE，失败返回NULL
	this.get = function(_key) {
		try {
			for(var i = 0; i < this.elements.length; i++) {
				if(this.elements[i].key == _key) {
					return this.elements[i].value;
				}
			}
		} catch(e) {
			return null;
		}
	}

	//获取指定索引的元素（使用element.key，element.value获取KEY和VALUE），失败返回NULL
	this.element = function(_index) {
		if(_index < 0 || _index >= this.elements.length) {
			return null;
		}
		return this.elements[_index];
	}

	//判断MAP中是否含有指定KEY的元素
	this.containsKey = function(_key) {
		var bln = false;
		try {
			for(var i = 0; i < this.elements.length; i++) {
				if(this.elements[i].key == _key) {
					bln = true;
				}
			}
		} catch(e) {
			bln = false;
		}
		return bln;
	}

	//判断MAP中是否含有指定VALUE的元素
	this.containsValue = function(_value) {
		var bln = false;
		try {
			for(var i = 0; i < this.elements.length; i++) {
				if(this.elements[i].value == _value) {
					bln = true;
				}
			}
		} catch(e) {
			bln = false;
		}
		return bln;
	}

	//获取MAP中所有VALUE的数组（ARRAY）
	this.values = function() {
		var arr = new Array();
		for(var i = 0; i < this.elements.length; i++) {
			arr.push(this.elements[i].value);
		}
		return arr;
	}

	//获取MAP中所有KEY的数组（ARRAY）
	this.keys = function() {
		var arr = new Array();
		for(var i = 0; i < this.elements.length; i++) {
			arr.push(this.elements[i].key);
		}
		return arr;
	}
}

var sUtils = function() {

	/**
	 * 根据枚举code获取枚举值
	 * @param enumCode
	 * @param enumArr
	 * @param valField
	 * @returns {*}
	 */
	function val4Arr(enumCode, enumArr, valField) {
		var len = enumArr.length;
		for(var i = 0; i < len; i++) {
			var obj = enumArr[i];
			if(enumCode == obj.enumCode) {
				return obj[valField];
			}
		}
		return '';
	}

	/**
	 * 页面跳转时用的内部参数
	 * @type {{}}
	 * @private
	 */
	var _inParam = {};

	return {

		/**
		 * 根据会话缓存中的权限编码过滤页面中的按钮button和a标签
		 * 如果按钮没有设置right属性，则不过滤
		 */
		filterButton: function() {
			var btns = $('.page-content-area button, .page-content-area a');
			var codes = stroage.getSessionItem(CURRENT_USER_RIGHTS_CODE);
			var right = '';
			//        codes.push('right-query');
			console.debug('cur account right codes: ', codes);
			$.each(btns, function(idx, btn) {
				right = $(btn).attr('right');
				if(sUtils.isNull(right) || $.inArray(right, codes) > -1) {
					return true;
				} else {
					$(btn).remove();
				}
			});
		},

		/**
		 * 对数据中的区域数据进行翻译
		 *
		 * @param data
		 *            {city: 10000, province: 22000}
		 * @param arrKey
		 *            ['city', 'province']
		 * @returns
		 */
		transactionArea: function(data, arrKey) {
			var len = arrKey.length,
				codes = '',
				key, code, i, areas, tmp, obj;
			var arrs = [];
			for(i = 0; i < len; i++) {
				key = arrKey[i];
				code = data[key];
				if(sUtils.notNull(code)) {
					arrs.push(code);
				}
			}
			codes = arrs.join(',');
			sPost.ajax(
				action + 'pub/area/getMap', {
					'codes': codes
				},
				function(tmp) {
					if(tmp.success) {
						areas = tmp.obj;
						for(i = 0; i < len; i++) {
							key = arrKey[i];
							code = data[key];
							obj = areas[code];
							if(obj) {
								data[key] = obj.name;
							}
						}
					} else {
						slog.error('区域数据请求异常');
						slog.error(tmp);
					}
				}
			);

		},

		/**
		 * 内部参数传递
		 * @param key 参数名称
		 * @param value    参数值
		 */
		partialRemove: function(key) {
			_inParam[key] = null;
		},

		/**
		 * 内部参数传递
		 * @param key 参数名称
		 * @param value    参数值
		 */
		partial: function(key, value) {
			_inParam[key] = value;
		},

		/**
		 * 局部页面跳转/刷新
		 * @param url '#page/_demo/tiaozhuan2'
		 * @param key 参数名称
		 * @param value    参数值
		 */
		partialRefresh: function(url, key, value) {
			_inParam[key] = value;
			location.href = url;
		},

		/**
		 * 局部页面跳转/刷新的传参
		 * @param key
		 * @returns {*}
		 */
		getPartialRefreshParam: function(key) {
			return _inParam[key];
		},

		/**
		 * 对象转字符串
		 * @param value
		 * @returns {*}
		 */
		objToJsonString: function(value) {
			if(typeof value != 'string') {
				value = JSON.stringify(value);
			}
			return value;
		},

		/**
		 * 阻止冒泡
		 * @param e
		 */
		stopElementEvent: function(e) {
			e = e || window.event;
			if(e.stopPropagation) {
				e.stopPropagation();
			} else {
				e.cancelBubble = true;
			}
			if(e.preventDefault) {
				e.preventDefault();
			} else {
				e.returnValue = false;
			}
		},

		/**
		 * 刷新datagrid的选中等状态
		 * @param id 表单id
		 */
		unSelectAndChecked: function(id) {
			$(id).datagrid('uncheckAll').datagrid('unselectAll').datagrid('clearSelections');
		},

		/**
		 * 获取勾选的行ID
		 * @param id 表单id
		 * @returns {{ids: (*|string), count: number}}
		 */
		getTreeChecked: function(id) {
			var rows = $(id).tree('getChecked');
			if(rows.length == 0) {
				$.messager.alert('提示', '请勾选行！', 'info');
				return;
			}
			var params = {
				ids: sUtils.jointIds(rows),
				count: rows.length
			};
			return params;
		},

		/**
		 * 获取勾选的行ID
		 * @param id 表单id
		 * @returns {{ids: (*|string), count: number}}
		 */
		getTreeGridChecked: function(id) {
			var rows = $(id).treegrid('getChecked');
			if(rows.length == 0) {
				$.messager.alert('提示', '请勾选行！', 'info');
				return;
			}
			var params = {
				ids: sUtils.jointIds(rows),
				count: rows.length
			};
			return params;
		},

		getJS: function() {
			var js = JS;
			if(!js) {
				js = parent.JS;
			}
			if(!js) {
				js = parent.parent.JS;
			}
			if(!js) {
				js = parent.parent.parent.JS;
			}
			if(!js) {
				js = parent.parent.parent.parent.JS;
			}
			return js;
		},
		/**
		 * 获取勾选的行ID
		 * @param id 表单id
		 * @returns {{ids: (*|string), count: number}}
		 */
		getDataGridChecked: function(id) {
			var rows = $(id).datagrid('getChecked');
			if(rows.length == 0) {
				$.messager.alert('提示', '请勾选行！', 'warning');
				return;
			}
			var params = {
				ids: sUtils.jointIds(rows),
				count: rows.length
			};
			return params;
		},
		add: function(ff, dd, fun) {
			$(ff).form('clear');
			$(dd).dialog({
				title: '添加'
			});
			if(jQuery.isFunction(fun)) fun(ff, dd);
			$(dd).dialog('open');

			//一弹出框就校验，为了解决必填标识问题--zc
			$(ff).form('enableValidation').form('validate');
		},
		update: function(tt, ff, dd, fun) {
			var row = sUtils.doGrid(tt, 'getSelected');
			if(!row) {
				$.messager.alert('警告', '请选择一个进行修改！', 'warning');
				return;
			}
			$(ff).form('clear');
			$(dd).dialog({
				title: '修改'
			});
			$(ff).form('load', row);
			if(jQuery.isFunction(fun)) fun(tt, ff, dd, row);
			$(dd).dialog('open');

			//一弹出框就校验，为了解决必填标识问题--zc
			$(ff).form('enableValidation').form('validate');
			return row;
		},
		addOrUpdate: function(addOrUpdate_url, tt, ff, dd) {
			if(sUtils.trimAndValid(ff)) { //校验是否包含特殊字符
				var data = sPost.addOrUpdate(addOrUpdate_url, sUtils.getFormParams(ff));
				if(data.success) {
					$(dd).dialog('close');
					sUtils.doGrid(tt, 'reload');
					$.messager.show({
						title: '提示',
						msg: sUtils.notNull(data.msg) ? data.msg : '操作成功'
					});
					return data;
				} else if(sUtils.notNull(data.msg)) {
					$.messager.alert('错误', data.msg, 'warning');
				} else {
					$.messager.alert('错误', '操作失败！', 'error');
				}
			}
		},
		remove: function(del_url, tt) {
			var params = sUtils.getDataGridChecked(tt);
			if(params) {
				$.messager.confirm('确认对话框', '确认删除？', function(r) {
					if(r) {
						var data = sPost.batchDelete(del_url, params);
						if(data.success) {
							sUtils.doGrid(tt, 'reload');
							$.messager.show({
								title: '提示',
								msg: '操作成功'
							});
							return data;
						} else if(sUtils.notNull(data.msg)) {
							$.messager.alert('错误', data.msg, 'warning');
						} else {
							$.messager.alert('错误', '删除失败！', 'error');
						}
					}
				});
			}
		},
		query: function(tt, params) {
			var queryParams = sUtils.doGrid(tt, 'options').queryParams;
			queryParams.queryJsonStr = sUtils.json2Str(params);
			sUtils.doGrid(tt, 'reload');
		},
		doGrid: function(tt, method) {
			var grid = $(tt + ".easyui-datagrid");
			if(grid.length) return grid.datagrid(method);
			grid = $(tt + ".easyui-treegrid");
			if(grid.length) return grid.treegrid(method);
			grid = $(tt + ".tree");
			if(grid.length) return grid.tree(method);
			console.log("找不到grid：grid的id是：" + tt);
			return grid;
		},
		/**
		 * 去空格并做表单验证
		 */
		trimAndValid: function(ff) {
			var temp;
			var ui;
			$(ff + " input[id][class*='easyui-'][class*='box']").each(function(n, e) {
				var id = $(e).attr("id");
				if($("input[name='" + id + "']")) {
					temp = $("input[name='" + id + "']").val();
					if(temp !== $.trim(temp)) {
						temp = $.trim(temp);
						ui = $("#" + id);
						if($(ui).attr('class').split('easyui-combobox').length > 1)
							$(ui).combobox('setValue', temp);

						$("#" + id).textbox('setValue', temp);
					}
				}
			});

			return $(ff).form('enableValidation').form('validate') && sUtils.validSpecialStr(ff);
		},
		/**
		 * 校验输入框中是否存在特殊字符--zc
		 * @param str
		 */
		validSpecialStr: function(ff) {
			var temp;
			var validFlag = true;
			$(ff + " input[id][class*='easyui-'][class*='box']").each(function(n, e) {
				var id = $(e).attr("id");
				if($("input[name='" + id + "']")) {
					temp = $("input[name='" + id + "']").val();
					//校验一下，不能包含特殊字符--zc
					if(!sUtils.isNull(temp) && !sUtils.validStr(temp)) {
						validFlag = false;
					}
				}
			});

			if(!validFlag) {
				$.messager.alert('提示', '请勿包含特殊字符，可输入中文、英文、数字和下划线', 'warning');
				return;
			}
			return true;
		},
		/**
		 * 校验输入框中是否存在特殊字符--zc
		 * @param str
		 */
		validStr: function(str) {
			var reg = /^[\u4E00-\u9FA5A-Za-z0-9_ ，,.\-:;。~!@#$%^*()+=！……（）\\/]+$/;
			return reg.test(str);
		},
		/**
		 * 给查询添加回车事件
		 */
		enterSearch: function(tb) {
			$("div" + tb + " input.easyui-textbox").each(function(n, e) {
				$(this).textbox('textbox').keydown(function(e) {
					if(e.keyCode == 13) {
						$("div#tb a[iconCls='icon-search']").eq(0).click();
					}
				});
			});
		},
		post: function(url, params, successFun) {
			sPost.ajax(url, params, successFun, null, null, 'POST', true);
		},
		get: function(url, params, successFun) {
			sPost.ajax(url, params, successFun, null, null, 'GET', true);
		},
		/**
		 * 树形格式化转换
		 * @param rows        需要格式化的数据    [{'id': '1','name': '学校','parentId': null},{'id': '2','name': '班级2': 'parentId': 1},{'id': '3','name': '班级3': 'parentId': 1}]
		 * @param tickList    checkbox选中    [{'id': '2','name': '班级2': 'parentId': 1}}]
		 * @param textField        设置tree的显示的节点内容
		 * @param treeField        设置tree的text字段名称来，默认是'text', ztree: 'name'
		 * treegrid:
		 * tree:节点显示需要的是 text 属性,如果 rows里面没有则加上: treeGridDataConvert(rows, null, 'schemaName', 'text')
		 * ztree: 节点显示需要的是 name 属性, 如果 rows 里面没有则加上: treeGridDataConvert(rows, null, 'schemaName', 'name')
		 * @returns {Array} 格式化后的数据:    [{'id': '1','name': '学校','parentId': null,'children':[{'id': '2','name': '班级2': 'parentId': 1},{'id': '3','name': '班级3': 'parentId': 1}]}]
		 */
		treeGridDataConvert: function(rows, tickList, textField, treeField) {
			tickList = sUtils.isNull(tickList) ? [] : tickList;
			treeField = sUtils.isNull(treeField) ? 'text' : treeField;
			Array.prototype.checkItemByItem = function(item) {
				for(var i = 0; i < this.length; i++) {
					if(this[i].id == item.id) {
						item['checked'] = true;
					}
				}
			};

			function exists(rows, parentId) {
				for(var i = 0; i < rows.length; i++) {
					if(rows[i].id == parentId) return true;
				}
				return false;
			}

			var nodes = [];
			for(var i = 0; i < rows.length; i++) {
				var row = rows[i];
				if(!exists(rows, row.parentId)) {
					var obj = {};
					for(var key in row) {
						obj[key] = row[key];
					}
					if(sUtils.notNull(textField)) {
						obj[treeField] = row[textField];
					}
					tickList.checkItemByItem(obj);
					nodes.push(obj);
				}
			}
			var toDo = [];
			for(var i = 0; i < nodes.length; i++) {
				toDo.push(nodes[i]);
			}
			while(toDo.length) {
				var node = toDo.shift();
				for(var i = 0; i < rows.length; i++) {
					var row = rows[i];
					if(row.parentId == node.id) {
						var child = {};
						for(var key in row) {
							child[key] = row[key];
						}
						if(sUtils.notNull(textField)) {
							child[treeField] = row[textField];
						}
						tickList.checkItemByItem(child);
						if(node.children) {
							node.children.push(child);
						} else {
							node.children = [child];
						}
						toDo.push(child);
					}
				}
			}
			return nodes;
		},
		/**
		 * 树形数据翻译
		 * @param obj    需要翻译的数据        顶级父节点: data = [[{id: '1',name: 'n1',children:[[id: '2',name: 'n2', children:[]],[]]}],[{id: '3',name: 'n3',children:[[id: '4',name: 'n4', children:[]],[]]}]]
		 * @param enums    需要翻译的字段        ['sec_account-active', 'pub-sex']
		 * @param value    显示值与否            {'sec_account-active':true, 'pub-sex':true}
		 * @param flag    true:枚举显示值, false:取枚举映射值
		 */
		tranTreeFunRec: function(data, enumMap, enums, valueFlag) {
			//console.log(data.length);
			for(var i = 0; i < data.length; i++) {
				tranTreeRecInnerFun(data[i], enumMap, enums, valueFlag);
			}

			function tranTreeRecInnerFun(obj, enumMap, enums, valueFlag) {
				if(sUtils.isNull(obj)) {
					return;
				}
				valueFlag = sUtils.isNull(valueFlag) ? {} : valueFlag;
				for(var i = 0; i < enums.length; i++) {
					// 得到字段对应的所有值
					var enArr = enumMap.get(enums[i]);
					var enumKey = enums[i].split('-')[1];
					// right 表的值
					var enumCode = obj[enumKey];
					// 查找显示值
					for(var j = 0; j < enArr.length; j++) {
						if(enumCode != enArr[j].enumCode) {
							continue;
						}
						//console.log('utils: ' + enums[i] + ' -- ' + valueFlag[enums[i]]);
						if(valueFlag[enums[i]]) {
							obj[enumKey] = enArr[j]['enumValue'];
						} else {
							obj[enumKey] = enArr[j]['enumMapValue'];
						}
					}
				}
				var child = obj.children;
				if(sUtils.notNull(child)) {
					for(var i = 0; i < child.length; i++) {
						var co = child[i];
						tranTreeRecInnerFun(co, enumMap, enums, valueFlag);
					}
				}
				return;
			}

			return data;
		},

		/**
		 * 获取枚举翻译值
		 * @param enumMap
		 * @param val	1
		 * @param showMapValue true
		 * @returns {string}
		 */
		getEnumShowValue4Arr: function(enumMap, val, showMapValue) {
			var show = '',
				valKey = 'enumValue',
				enums = null;
			if(showMapValue) valKey = 'enumMapValue';

			enums = enumMap.get(key);
			if(enums) {
				for(var idx in enums) {
					if(enums[idx]['enumCode'] == val) {
						show = enums[idx][valKey];
						break;
					}
				}
			}
			return show;
		},

		/**
		 * 获取枚举翻译值
		 * @param enumMap
		 * @param key 'pub-sex'
		 * @param val	1
		 * @param showMapValue true
		 * @returns {string}
		 */
		getEnumShowValue: function(enumMap, key, val, showMapValue) {
			if(!val) return '';
			var show = '',
				valKey = 'enumValue',
				enums = null;
			if(showMapValue) valKey = 'enumMapValue';

			enums = enumMap.get(key);
			if(enums) {
				for(var idx in enums) {
					if(enums[idx]['enumCode'] == val) {
						show = enums[idx][valKey];
						break;
					}
				}
			}
			return show;
		},

		/**
		 * 把枚举值翻译成jqgrid col使用的editoptions
		 * @param enumMap
		 * @param key
		 * @returns {string}
		 */
		getEnumEditoptions: function(enumMap, key) {
			var arr = enumMap.get(key);
			var es = [];
			$.each(arr, function(i, val) {
				es.push(val.enumCode + ':' + val.enumValue);
			});
			return es.join(';');
		},

		/**
		 * 枚举翻译
		 * @param data    数据队列
		 * @param enums    枚举配置    ['sec_account-active', 'pub-sex']
		 * @param enumMap    枚举值集合 new sMap()
		 * @param useMapVals 是否使用翻译值    [false, true]
		 * @returns {*}
		 */
		transactionEnum: function(data, enums, enumMap, useMapVals) {
			var len = data.length;
			var eLen = enums.length;
			var obj = {};
			var enumKey = '';
			var field = '';
			var enumCode = 0;
			var enumArr = [];
			var tVal = '';
			var useMapVal = false;
			var valField = '';

			for(var i = 0; i < len; i++) {
				obj = data[i];
				for(var j = 0; j < eLen; j++) {
					enumKey = enums[j];
					field = enumKey.split('-')[1];
					enumCode = obj[field];
					enumArr = enumMap.get(enumKey);
					valField = 'enumValue';
					//判断是否使用枚举映射值
					if(sUtils.notNull(useMapVals)) {
						useMapVal = useMapVals[j];
						if(useMapVal) {
							valField = 'enumMapValue';
						}
					}
					tVal = val4Arr(enumCode, enumArr, valField);
					obj[field] = tVal;
					//console.log(field + ': ' + obj[field]);
				}
			}
			return data;
		},

		/**
		 *    获取选中行的id字符串
		 * @param rows    easyui datagrid tree treegrid对象行属性
		 * @returns {string}  '1,2,3,4'
		 */
		jointIds: function(rows) {
			var ids = '';
			//批量获取选中行的评估模板ID
			for(var i = 0; i < rows.length; i++) {
				if(ids == '') {
					ids = rows[i].id;
				} else {
					ids = rows[i].id + ',' + ids;
				}
			}
			return ids;
		},
		/**
		 * 获取选中行的指定的属性
		 * @param rows    easyui datagrid tree treegrid对象行属性
		 * @param rowName    行的属性
		 * @returns {string}  '1,2,3,4'
		 */
		joinRowNames: function(rows, rowName) {
			var RowNames = '';
			//批量获取选中行的评估模板ID
			for(var i = 0; i < rows.length; i++) {
				if(RowNames == '') {
					RowNames = rows[i][rowName];
				} else {
					RowNames = rows[i][rowName] + ',' + RowNames;
				}
			}
			return RowNames;
		},

		/**
		 *    比较2个对象是否相等
		 *    先把对象转换成字符串，再进行比较；
		 * @param obj1
		 * @param obj2
		 */
		assertObj: function(obj1, obj2) {
			var str1 = this.json2Str(obj1);
			var str2 = this.json2Str(obj2);
			console.log(str1);
			console.log(str2);
			if(str1 != str2) {
				alert('比较失败！');
			} else {
				alert('比较成功！');
			}
			//if (this.objLenght(obj1) < this.objLenght(obj2)) {
			//	alert('对象属性个数不一样，比较失败');
			//} else {
			//	for (key in obj1) {
			//		if (obj1[key] == obj2[key]) {
			//			alert('obj1-' + key + ': ' + obj1[key] + '和obj2：' +obj2[key] + '不一致，比较失败');
			//		}
			//	}
			//}
		},

		/**
		 *    获取对象树形个数；
		 * @param obj
		 * @returns {number}
		 */
		objLenght: function(obj) {
			var count = 0;
			for(var key in obj) {
				count++;
			}
			return count;
		},

		/**
		 * 替换对象的属性
		 * def 里面有10个属性，setting里面有5个属性，经过方法后，seting的5个属性值被赋予到def中；
		 * @param    def        默认值对象
		 * @param   setting        替换的值对象
		 * @return   newSet
		 */
		replaceDef: function(def, setting) {
			if(this.objLenght(def) < this.objLenght(setting)) {
				console.log('传入的参入比默认值多，多余的属性无法实现!');
			}

			return $.extend({}, def, setting);
		},

		/**
		 * 空判断
		 */
		isNull: function(val) {
			return val == null || val == '' || typeof(val) == 'undefined' || val == 'undefined' || val == 'null';
		},

		/**
		 * 对象非空判断
		 * @param val
		 * @returns {boolean}
		 */
		notNull: function(val) {
			return !this.isNull(val);
		},

		/**
		 * 获取表单参数
		 * @param formId
		 * @returns {{}}
		 */
		getFormParams: function(formId) {
			//return $(formId).serialize();
			var formArr = $(formId).serializeArray();
			var params = {};
			$.each(formArr, function() {
				if(params[this.name]) {
					if(params[this.name] instanceof Array)
						params[this.name].push(this.value);
					else
						params[this.name] = [params[this.name], this.value];
				} else
					params[this.name] = this.value;
			});
			return params;
		},

		/**
		 * json字符串转json对象
		 * @param strJson
		 * @return Object
		 */
		str2Json: function(strJson) {
			if(strJson.charAt(0) != '[') {
				strJson = '[' + strJson + ']'
			}
			return $.parseJSON(strJson);
		},

		/**
		 * json对象转字符串
		 * @param jsonObj
		 * @return Object
		 */
		json2Str: function(jsonObj) {
			var str = JSON.stringify(jsonObj);
			console.log(str);
			return str;
		},

		accMul: function(arg1, arg2) //js 两数相乘  float精度问题
		{
			var m = 0,
				s1 = arg1.toString(),
				s2 = arg2.toString();
			try {
				m += s1.split('.')[1].length;
			} catch(e) {}
			try {
				m += s2.split('.')[1].length;
			} catch(e) {}
			return Number(s1.replace('.', '')) * Number(s2.replace('.', '')) / Math.pow(10, m);
		},

		accDiv: function(arg1, arg2) { //js 两数相除  float精度问题
			var t1 = 0,
				t2 = 0,
				r1, r2;
			try {
				t1 = arg1.toString().split('.')[1].length;
			} catch(e) {}
			try {
				t2 = arg2.toString().split('.')[1].length;
			} catch(e) {}
			with(Math) {
				r1 = Number(arg1.toString().replace('.', ''));
				r2 = Number(arg2.toString().replace('.', ''));
				return(r1 / r2) * pow(10, t2 - t1);
			}
		},

		accAdd: function(arg1, arg2) { //js 两数相加 float精度问题
			var r1, r2, m;
			try {
				r1 = arg1.toString().split('.')[1].length;
			} catch(e) {
				r1 = 0;
			}
			try {
				r2 = arg2.toString().split('.')[1].length;
			} catch(e) {
				r2 = 0;
			}
			m = Math.pow(10, Math.max(r1, r2));
			return(arg1 * m + arg2 * m) / m;
		},

		Subtr: function(arg1, arg2) {
			var r1, r2, m, n;
			try {
				r1 = arg1.toString().split('.')[1].length;
			} catch(e) {
				r1 = 0;
			}
			try {
				r2 = arg2.toString().split('.')[1].length;
			} catch(e) {
				r2 = 0;
			}
			m = Math.pow(10, Math.max(r1, r2));
			n = (r1 >= r2) ? r1 : r2;
			return((arg1 * m - arg2 * m) / m).toFixed(n);
		},

		/*		/!**
		 * 获得当前页面参数
		 * @param nowPageNo  页码从 0 开始
		 * @param pageSize
		 *!/
		 getPageParam: function (nowPageNo, pageSize) {
		 var pageNum = 15;
		 if (pageSize) {
		 pageNum = pageSize;
		 }
		 if (isNaN(nowPageNo)) return 'index=0&pageSize=' + pageNum;
		 return 'index=' + nowPageNo + '&pageSize=' + pageNum;
		 },

		 /!**
		 * 获得当前页面参数
		 * @param nowPageNo  页码从 0 开始
		 * @param pageSize
		 * @param obj 设置分页目标对像
		 *!/
		 setPage: function (nowPageNo, pageSize, obj) {
		 var pageNum = 30;
		 if (pageSize) {
		 pageNum = pageSize;
		 }
		 var firstResult = nowPageNo * pageNum;
		 if (isNaN(firstResult)) {
		 obj.index = 0;
		 obj.pageSize = pageNum;
		 } else {
		 obj.index = nowPageNo;
		 obj.pageSize = pageNum;
		 }
		 },

		 /!**
		 *  每隔一行设置背景色
		 *!/
		 setTableSplitBg: function (sTbodyId, bcSplitClass) {
		 $('#' + sTbodyId + ' tr').each(function (i) {
		 if (i % 2 == 1) {
		 $(this).addClass(bcSplitClass);
		 }
		 });
		 },*/

		dateToStr: function(time, useType) //将时间类型转换成字符串
		{
			var year = time.getFullYear();
			var month = time.getMonth();
			var day = time.getDate();
			var hour = time.getHours();
			var min = time.getMinutes();
			var seconds = time.getSeconds();

			var dataStr = year + '-' + this.paddingLeftByZero((month + 1), 2) + '-' + this.paddingLeftByZero(day, 2);
			if(useType != 'notAddTime') {
				dataStr += ' ' + this.paddingLeftByZero(hour, 2) + ':' + this.paddingLeftByZero(min, 2) + ':' + this.paddingLeftByZero(seconds, 2);
			}

			return dataStr;
		},

		dataStrFormat: function(time) { //将2013-03-26 21:32:00 000形式的时间字符串，转换成2013-03-26 21:32:00
			if(time != null && time != '') {
				return time.substr(0, 19);
			}
		},

		timeToStr: function(time, useType) { //将时间戳类型转换成字符串
			var data = new Date(time);
			return this.dateToStr(data, useType);
		},

		dataStrSimpleFormat: function(time) {
			if(time != null && time != '') {
				return time.substr(0, 10);
			}
		},

		timeToFormatStr: function(time, format) { //将时间戳转换成指定的格式字符串
			var t = new Date(time);
			var tf = function(i) {
				return(i < 10 ? '0' : '') + i;
			};
			return format.replace(/yyyy|MM|dd|HH|mm|ss/g,
				function(a) {
					switch(a) {
						case 'yyyy':
							return tf(t.getFullYear());
							break;
						case 'MM':
							return tf(t.getMonth() + 1);
							break;
						case 'mm':
							return tf(t.getMinutes());
							break;
						case 'dd':
							return tf(t.getDate());
							break;
						case 'HH':
							return tf(t.getHours());
							break;
						case 'ss':
							return tf(t.getSeconds());
							break;
					}
				});
		},

		paddingLeftByZero: function(orgi, digit) {
			/*数字位数达不到预期位数时，在左边位置补0。注：只适用整数。orig:原始数字，digit:预期位数*/
			var str = orgi + '';
			if(str.length < digit) {
				var needPadding = digit - str.length;
				for(var i = 0; i < needPadding; i++) {
					str = '0' + str;
				}
			}
			return str;
		},

		paddingRightByZero: function(orgi, digit) {
			/*数字位数达不到预期位数时，在左边位置补0。注：只适用整数。orig:原始数字，digit:预期位数*/
			var str = orgi + '';
			if(str.length < digit) {
				var needPadding = digit - str.length;
				for(var i = 0; i < needPadding; i++) {
					str = str + '0';
				}
			}
			return str;
		},

		createIP: function(segmentValue) {

			var mask = segmentValue.split('/')[1];

			var bit = '';
			for(var i = 0; i < mask; i++) {
				bit += '1';
			}

			var binary = this.paddingRightByZero(bit, 32);

			var binaryCode = [];

			binaryCode[0] = binary.substring(0, 8);
			binaryCode[1] = binary.substring(8, 16);
			binaryCode[2] = binary.substring(16, 24);
			binaryCode[3] = binary.substring(24, 32);

			var segment = '';

			for(var i = 0; i < binaryCode.length; i++) {
				segment += this.bin2dec(binaryCode[i]) + '.';
			}

			return segment.substring(0, segment.length - 1);
		},
		checkIpValid: function(ip) {
			var re = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/
			return re.test(ip);
		},

		bin2dec: function(bin) {
			var c = bin.split('');
			var len = c.length;
			var dec = 0;
			for(var i = 0; i < len; i++) {
				var temp = 1;
				if(c[i] == 1) {
					for(var j = i + 1; j < len; j++) temp *= 2;
					dec += temp;
				} else if(c[i] != 0) {
					alert('二进制值有错误!');
					return false;
				}
			}
			return dec;
		},

		formatNumber: function(num) { //将数字转格式成千位符显示，num为字符串
			if(!isNaN(num)) num = '' + num;
			if(/[^0-9\.]/.test(num)) return num;
			num = num.replace(/^(\d*)$/, '$1.');
			num = (num + '00').replace(/(\d*\.\d\d)\d*/, '$1');
			num = num.replace('.', ',');
			var re = /(\d)(\d{3},)/;
			while(re.test(num))
				num = num.replace(re, '$1,$2');
			num = num.replace(/,(\d\d)$/, '.$1');
			return num.replace(/^\./, '0.');
		},

		/**
		 * 获取当前时间
		 */
		getNowFormatDate: function() {
			var day = new Date();
			var Year = 0;
			var Month = 0;
			var Day = 0;
			var CurrentDate = '';
			//初始化时间
			//Year= day.getYear();//有火狐下2008年显示108的bug
			Year = day.getFullYear(); //ie火狐下都可以
			Month = day.getMonth() + 1;
			Day = day.getDate();
			var Hour = day.getHours();
			var Minute = day.getMinutes();
			var Second = day.getSeconds();
			CurrentDate += Year + '-';
			if(Month >= 10) {
				CurrentDate += Month + '-';
			} else {
				CurrentDate += '0' + Month + '-';
			}
			if(Day >= 10) {
				CurrentDate += Day;
			} else {
				CurrentDate += '0' + Day;
			}
			CurrentDate += ' ';

			if(Hour >= 10) {
				CurrentDate += Hour + ':';
			} else {
				CurrentDate += '0' + Hour + ':';
			}
			if(Minute >= 10) {
				CurrentDate += Minute + ':';
			} else {
				CurrentDate += '0' + Minute + ':';
			}
			if(Second >= 10) {
				CurrentDate += Second;
			} else {
				CurrentDate += '0' + Second;
			}
			return CurrentDate;
		},

		/**
		 * 获取当前日期前N天
		 */
		getAfterDate: function(curDate, days) {
			//获取s系统时间
			var LSTR_ndate = new Date(Date.parse(curDate.replace(/-/g, '/')));
			var LSTR_Year = LSTR_ndate.getFullYear();
			var LSTR_Month = LSTR_ndate.getMonth();
			var LSTR_Date = LSTR_ndate.getDate();
			//处理
			var uom = new Date(LSTR_Year, LSTR_Month, LSTR_Date);
			uom.setDate(uom.getDate() - days); //取得系统时间的前一天,重点在这里,负数是前几天,正数是后几天
			var LINT_MM = uom.getMonth();
			LINT_MM++;
			var LSTR_MM = LINT_MM > 10 ? LINT_MM : ('0' + LINT_MM);
			var LINT_DD = uom.getDate();
			var LSTR_DD = LINT_DD >= 10 ? LINT_DD : ('0' + LINT_DD);
			//得到最终结果
			uom = uom.getFullYear() + '-' + LSTR_MM + '-' + LSTR_DD;
			return uom + ' 00:00:00';
		},

		/**
		 * 获取当前日期前N分钟（小时）
		 */
		getAfterTime: function(curDate, time, type) {
			var hour = '00';
			var minute = '00';
			//获取s系统时间
			var LSTR_ndate = new Date(Date.parse(curDate.replace(/-/g, '/')));
			var LSTR_Year = LSTR_ndate.getFullYear();
			var LSTR_Month = LSTR_ndate.getMonth();
			var LSTR_Date = LSTR_ndate.getDate();
			var LSTR_Hour = LSTR_ndate.getHours();
			var LSTR_Minute = LSTR_ndate.getMinutes();
			var LSTR_seconds = LSTR_ndate.getSeconds();
			if(LSTR_seconds < 10) {
				LSTR_seconds = '0' + LSTR_seconds;
			}
			//处理
			var uom = new Date(LSTR_Year, LSTR_Month, LSTR_Date);
			if(type == 'hour') {
				if(LSTR_Hour < 1) {
					uom.setDate(uom.getDate() - 1);
					hour = 59;
				} else {
					hour = LSTR_Hour - 1;
				}
				minute = LSTR_Minute;
			} else if(type == 'minute') {
				if(LSTR_Minute < 10) {
					//uom.setDate(uom.getDate() - 1);
					minute = 60 + LSTR_Minute - 10;
					if(LSTR_Hour > 1) {
						hour = LSTR_Hour - 1;
					} else {
						hour = 23;
						uom.setDate(uom.getDate() - 1);
					}
				} else {
					minute = LSTR_Minute - 10;
					hour = LSTR_Hour;
				}
			}
			var LINT_MM = uom.getMonth();
			LINT_MM++;
			var LSTR_MM = LINT_MM > 10 ? LINT_MM : ('0' + LINT_MM);
			var LINT_DD = uom.getDate();
			var LSTR_DD = LINT_DD >= 10 ? LINT_DD : ('0' + LINT_DD);
			//得到最终结果
			uom = uom.getFullYear() + '-' + LSTR_MM + '-' + LSTR_DD;
			if(hour != '00') {
				hour = hour < 10 ? ('0' + hour) : hour;
			}
			if(minute != '00') {
				minute = minute < 10 ? ('0' + minute) : minute;
			}
			return uom + ' ' + hour + ':' + minute + ':' + LSTR_seconds;
		},

		handlerWorkloadNum: function(workloadNum) {
			if(this.notNull(workloadNum)) {
				workloadNum--; //虚拟机个数据减去vios
				if(workloadNum < 0) {
					workloadNum = 0;
				}
			} else {
				workloadNum = 0;
			}
			return workloadNum;
		},

		showEmpty: function(str) {
			if(this.notNull(str)) {
				return str;
			}
			return '';
		},

		bToGB: function(b) {
			if(isNaN(b) || b == 0) return '0.00';
			if(b) {
				return(b / Math.pow(1024, 3)).toFixed(2);
			} else return b;
		},

		mbToGb: function(mb) {
			if(isNaN(mb)) return '';
			if(mb) {
				return(mb / 1024).toFixed(0);
			} else return mb;
		},

		GbToTb: function(Gb) {
			if(isNaN(Gb)) return '';
			if(Gb) {
				return(Gb / 1024).toFixed(0);
			} else return Gb;
		},

		gbToMb: function(gb) {
			if(isNaN(gb)) return 0;
			return(parseFloat(gb) * 1024).toFixed(0);
		},

		strToFloat: function(num) {
			try {
				return parseFloat(num);
			} catch(e) {
				return 0;
			}
		},

		strToInt: function(num) {
			try {
				return parseInt(num);
			} catch(e) {
				return 0;
			}
		},

		formatLongInfo: function(maxsize) {
			$('.format_long_info').each(function() {
				var info = $(this).text();
				if(info.length > maxsize) {
					$(this).text(info.substring(0, maxsize - 3) + '...');
					$(this).attr('title', info);
				}
			});
		},

		cutString: function(source, length) {
			return length >= 0 && this.notNull(source) && (source.length > length) ? source.substr(0, length) + '...' : source;
		},

		isLogout: function(errMsg) {
			var string = '<div><div>';
			var obj = $(string).append(errMsg);
			var err = obj.find('#err').html();
			if(this.notNull(err)) {
				alert(err);
			}
			return errMsg.indexOf('loginform') > 0;
		},

		convertURL: function(url) {
			var timstamp = Date.parse(new Date());
			if(url.indexOf('?') >= 0) {
				url = url + '&t=' + timstamp;
			} else {
				url = url + '?t=' + timstamp;
			};
			return url;
		},

		/**
		 * 返回是否成功
		 * @param data    后台返回的 JsonResult 数据
		 * @returns
		 *        true/false
		 */
		isSuc: function(data) {
			if(sUtils.notNull(data) && data.success) {
				return true;
			}
			return false;
		},

		/**
		 * 判断后台是否返回成功并且判断 data.obj 是否不为空
		 * @param data
		 * @returns
		 *        true: data.success = true && data.obj != null
		 *        false:
		 */
		isSucObj: function(data) {
			if(sUtils.notNull(data) && data.success && sUtils.notNull(data.obj)) {
				return true;
			}
			return false;
		},

		/**
		 * 判断后台是否返回成功并且判断 data.obj.rows 是否为空
		 * @param data
		 * @returns
		 *        true: data != null && data.success = true && data.obj != null && data.obj.rows != null
		 *        false
		 */
		isSucRows: function(data) {
			if(sUtils.notNull(data) && data.success && sUtils.notNull(data.obj) && sUtils.notNull(data.obj.rows)) {
				return true;
			}
			return false;
		},

		/**
		 * 获取树形结构数据的所有子节点id
		 * @param obj
		 * @param selIds        接收 id 的数组[{id: 1}, {id: 2}]
		 * @returns
		 */
		getChildrenIds: function(obj, selIds) {
			if(sUtils.isNull(obj.children) || obj.children.length == 0) {
				return;
			}
			for(var j = 0; j < obj.children.length; j++) {
				selIds.push({
					id: obj.children[j].id
				});
				this.getChildrenIds(obj.children[j], selIds);
			}
		},

		/**
		 * UUID生成
		 * @returns {*}
		 */
		guid: function() {
			function s4() {
				return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
			}

			return s4() + s4() + s4() + s4() + s4() + s4() + s4() + s4();
		},

		/**
		 * 获取长度为i的uuid
		 */
		uuid: function(i) {
			var uuid = "",
				len = i ? i : 32;
			for(var i = 0; i < len; i++) {
				uuid += Math.floor(Math.random() * 16.0).toString(16);
			}
			return uuid;
		}
	};
}();

/**
 * cookie工具类，存入和取出对象有用，存入和取出非对象，直接用$.cookie
 * @type {{set, get, remove, version}}
 */
var cookie = function() {

	/* ************************* private method start *************************************** */

	/* ************************* private method end *************************************** */

	return {

		/**
		 * 新增cookie
		 * @param key
		 * @param value
		 * @param lifeTime    生存时间
		 */
		set: function(key, value, lifeTime) {
			$.cookie(key, sUtils.objToJsonString(value), {
				expires: lifeTime
			});
		},

		/**
		 * 取cookie
		 * @param key
		 */
		get: function(key) {
			return JSON.parse($.cookie(key));
		},

		/**
		 * 删除cookie
		 * @param key
		 */
		remove: function(key) {
			$.cookie(key, null, {
				expires: -1
			});
		},

		version: function() {}
	}

}();

var CometUtil = function() {

	var cometId, startFun, stopFun;
	return {
		getCometId: function() {
			return cometId;
		},
		/**
		 * 连接comet4j
		 * @param sucFun
		 */
		startComet: function() {
			JS.Engine.start('/comet4j');
			JS.Engine.on('start', function(cId, channelList, engine) {
				cometId = cId;
				console.log("连接成功:" + cId);
				if($.isFunction(startFun)) {
					startFun(cId, channelList, engine);
				}
			});
			JS.Engine.on('stop', function(cause, cId, url, engine) {
				if($.isFunction(startFun)) {
					stopFun(cause, cId, url, engine);
				}
				CometUtil.startComet();
			});
		},
		registerStart: function(dealFun) {
			startFun = dealFun;
		},
		registerStop: function(dealFun) {
			stopFun = dealFun;
		},
		registerChannel: function(channelName, dealFun) {
			JS.Engine.on(channelName, function(arr) {
				if($.isFunction(dealFun))
					dealFun(arr);
			});
		}
	}
}();

/**
 * 如果要在登录页面使用需要配置 url 不拦截
 */
var SystemParamsUtil = function() {

	//var getMapUrl = path + '/action/pub/systemParams/getMap';
	//var getValueUrl = path + '/action/pub/systemParams/getValue';

	return {
		/**
		 * 返回系统配置参数集合
		 * @param keys        keys为必须项
		 * @returns
		 *        返回的数据为 {key1:value1, key2:value2} 集合
		 */
		getMap: function(keys) {
			if(sUtils.isNull(keys) || keys.length < 1) {
				return {};
			}
			var params = {
				keys: keys.join(',')
			};
			var data = sPost.getPostResponse(getMapUrl, params);
			if(sUtils.isSucObj(data)) {
				return data.obj;
			}
			return {};
		},
		/**
		 * 返回系统配置参数值
		 * @param key
		 * @returns
		 */
		get: function(key) {
			if(sUtils.isNull(key)) {
				return '';
			}
			var params = {
				key: key
			};
			var data = sPost.getPostResponse(getValueUrl, params);
			if(sUtils.isSucObj(data)) {
				return data.obj;
			}
			return '';
		}
	};
}();

/**
 * 获取学期开学时间和学期周数
 */
var SemesterUtil = function() {

	//var getStartTimeUrl = path + '/action/mediaroom/course/semester/getStartTime';
	//var getTermCountUrl = path + '/action/mediaroom/course/semester/getTermCount';

	return {
		getStartTime: function() {
			return sPost.getPostResponse(getStartTimeUrl);
		},
		getTermCount: function() {
			return sPost.getPostResponse(getTermCountUrl);
		}
	};
}();

/**
 * 获取一天有多少课程
 */
var ClassnoUtil = function() {

	//var getClassnoCountUrl = path + '/action/mediaroom/course/classno/getClassnoCount';

	return {
		getClassnoCount: function() {
			var data = sPost.getPostResponse(getClassnoCountUrl);
			if(sUtils.isSuc(data)) {
				return data.obj;
			}
			return '0';
		}
	};
}();

var sCombobox = function() {

	var version = '1.0';

	/* ************************* private method start *************************************** */

	/* ************************* private method end *************************************** */

	function getEnumBoxDefFun() {
		return {
			divId: '#selectSex',
			enumKey: 'pub-sex', //枚举关键字'表名-字段名'
			hiddenId: '', //隐藏对象的id，用于表单赋值,
			enumMap: {}, //已经查出来的枚举map对象
			/* **************必填分割线，上面必填，下面可选 *************************************/
			defVal: null, //枚举的默认显示值
			valueField: 'enumCode', //combobox的id
			textField: 'enumValue', //combobox的显示值字段
			//textField:'enumMapValue',
			addAll: false //是否添加全部选项
		};
	}

	return {

		/**
		 * 枚举下拉列表
		 * @param setting
		 */
		enumBox: function(setting) {
			setting = sUtils.replaceDef(getEnumBoxDefFun(), setting);
			var enumArr = setting.enumMap.get(setting.enumKey);
			//数组复制
			var data = enumArr.concat();
			//debugger;
			if(setting.addAll) {
				var all = {
					enumCode: '',
					enumValue: '全部'
				};
				data.splice(0, 0, all);
			}
			//console.log(data);
			$(setting.divId).combobox({
				data: data,
				valueField: setting.valueField,
				textField: setting.textField,
				onSelect: function(data) {
					/* 选择下拉时，给隐藏的对象赋值  */
					/*if (sUtils.notNull(setting.hiddenId)) {
					 $(setting.hiddenId).val(data.enumCode);
					 }*/
					//console.log($(setting.hiddenId).val());

				},
				onLoadSuccess: function() { //加载完成后,设置选中第一项
					// easyui bug 必须先选择其他的
					$(setting.divId).combobox("select", '1');
					// 如果有 "全部"
					if(setting.addAll) {
						$(setting.divId).combobox("select", '');
					} else {
						for(var i = 0; i < enumArr.length; i++) {
							if(enumArr[i]['defStatus'] == 1) {
								$(setting.divId).combobox("select", enumArr[i].enumCode);
								break;
							}
						}
					}
				}
			});
		},

		/**
		 * 显示版本
		 * @returns {string}
		 */
		version: function() {
			//alert(version);
			// console.log(version);
			return version;
		}
	}

}();