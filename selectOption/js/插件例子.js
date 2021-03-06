(function($, window) {
	// 初始态定义
	var _oDialogCollections = {};

	// 插件定义
	$.fn.MNDialog = function(_aoConfig) {
		// 默认参数，可被重写
		var defaults = {
			// string
			sId: "",
			// num
			nWidth: 400,
			// bollean
			bDisplayHeader: true,
			// object
			oContentHtml: "",
			// function
			fCloseCallback: null
		};

		var _oSelf = this,
			$this = $(this);

		// 插件配置
		this.oConfig = $.extend(defaults, _aoConfig);

		// 初始化函数
		var _init = function() {
			if(_oDialogCollections) {
				// 对于已初始化的处理
				// 如果此时已经存在弹框，则remove掉再添加新的弹框
			}
			// 初始化弹出框数据
			_initData();
			// 事件绑定
			_loadEvent();
			// 加载内容
			_loadContent();
		}
		// 私有函数
		var _initData = function() {};
		var _loadEvent = function() {};
		var _loadContent = function() {
			// 内容（分字符和函数两种，字符为静态模板，函数为异步请求后组装的模板，会延迟，所以特殊处理）
			if($.isFunction(_oSelf.oConfig.oContentHtml)) {
				_oSelf.oConfig.oContentHtml.call(_oSelf, function(oCallbackHtml) {
					// 便于传带参函数进来并且执行
					_oSelf.html(oCallbackHtml);
					// 有回调函数则执行
					_oSelf.oConfig.fLoadedCallback && _oSelf.oConfig.fLoadedCallback.call(_oSelf, _oSelf._oContainer$);
				});
			} else if($.type(_oSelf.oConfig.oContentHtml) === "string") {
				_oSelf.html(_oSelf.oConfig.oContentHtml);
				_oSelf.oConfig.fLoadedCallback && _oSelf.oConfig.fLoadedCallback.call(_oSelf, _oSelf._oContainer$);
			} else {
				console.log("弹出框的内容格式不对，应为function或者string。");
			}
		};

		// 内部使用参数
		var _oEventAlias = {
			click: 'D_ck',
			dblclick: 'D_dbl'
		};

		// 提供外部函数
		this.close = function() {
			_close();
		}

		// 启动插件
		_init();

		// 链式调用
		return this;
	};
	// 插件结束
})(jQuery, window);

//调用
var MNDialog = $("#header").MNDialog({
	sId: "#footer", //覆盖默认值
	fCloseCallback: dialog, //回调函数
	oContentHtml: function(_aoCallback) {
		_aoCallback(_oEditGrpDlgView.el);
	}
})

// 调用提供的函数
MNDialog.close;