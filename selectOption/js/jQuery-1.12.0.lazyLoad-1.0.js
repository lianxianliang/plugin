;
(function($, window, document, undefined) {
	// 初始态定义
	var _oDialogCollections = {};

	// 插件定义
	$.fn.selctOption = function(options) {

		var _oSelf = this;
		var $this = $(this);
		var $document = $(document);
		var _isFistRender = true;
		var _selectInput_len = 0;
		var _timer = undefined;

		// 默认参数，可被重写
		var defaults = {
			url_programList: "json/chosen.json", //搜索地址
			waitTime: 500, //发起请求等待时长
			searchAble: true, //是否可以搜索
			lazyLoadAble: true //是否可以懒加载
		};

		// 插件配置
		_oSelf.oConfig = $.extend(true, defaults, options);

		var _hide = function() {
			$this.$searchableSelectDropdown.hide();
		}

		var _documentHide = function() {
			document.addEventListener("mousedown", _hide);
		}

		var _showAndHide = function() {
			$this.$searchableSelectHolder.off("click").on("click", function(e) {
				$this.$searchableSelectDropdown.toggle();
			})
		};

		var _collect = function() {
			var data = {};
			data.name = $this.$searchableSelectInput.val().trim();

			return data;
		}

		var _load = function() {
			var data = _collect();
			sUtils.get(_oSelf.oConfig.url_programList, data, function(res) {
				_render(res);
			})
		}

		var _render = function(res) {

			if(_isFistRender) {
				console.log("第一次渲染")
				$this.$searchableSelectItems.empty();
			}

			if(!res || res.length == 0) {
				return
			}

			//渲染模板
			var strHtml = "";
			for(var i = 0, len = res.length; i < len; i++) {
				strHtml += '<div class="searchable-select-item" code="' + res[i].code + '">' + res[i].name + '</div>'
			}
			var tempHtml = $this.$searchableSelectItems.html();
			$this.$searchableSelectItems.html(tempHtml + strHtml);

			if(_isFistRender) {
				//=========默认值
				var val = res[0].name;
				var code = res[0].id;
				$this.$searchableSelectHolder.attr("code", code).text(val);
				//=========手动选择
				_selected();
			}

			_isFistRender = false;

		}

		var _selected = function() {
			$this.$searchableSelectItems.off("click", ".searchable-select-item").on("click", ".searchable-select-item", function() {
				var code = $(this).attr("code");
				var val = $(this).text();
				$this.$searchableSelectHolder.attr("code", code).text(val);

				_hide();
			})

			$this.$searchableSelectItems.off("mousedown", ".searchable-select-item").on("mousedown", ".searchable-select-item", function(e) {
				e.stopPropagation();
			})
		}

		var _search = function() {

			$this.$searchableSelectInput.off("keyup").on("keyup", function() {
				var temp_len = $this.$searchableSelectInput.val().trim().length;
				if(_selectInput_len == temp_len) {
					return;
				}

				_selectInput_len = temp_len;

				if(_timer) {
					clearTimeout(_timer);
				}

				_timer = setTimeout(function() {
					_isFistRender = true;
					_load();
					console.log("搜索")
				}, _oSelf.oConfig.waitTime)
			})
			$this.$searchableSelectInput.off("mousedown").on("mousedown", function(e) {
				e.stopPropagation();
			})

		}

		var _scroll = function() {
			$this.$searchableSelectItems.off("scroll").on("scroll", function(e) {

				var wholeHeight = this.scrollHeight;
				var scrollTop = this.scrollTop;
				var divHeight = this.clientHeight;
				if(scrollTop + divHeight >= wholeHeight) {
					console.log('滚动到底部了！');

					_load();
				}
				if(scrollTop == 0) {
					console.log('滚动到头部了！');
				}

			})
		}

		// 初始化数据
		var _initData = function() {};

		//加载内容
		var _loadContent = function() {

			var strHtml = '<div class="searchable-select-holder"></div><div class="searchable-select-dropdown"><input type="text" class="searchable-select-input"><div class="searchable-scroll"><div class="searchable-select-items"></div></div></div>'
			$this.html(strHtml);

			$this.$searchableSelectHolder = $this.find(".searchable-select-holder");
			$this.$searchableSelectDropdown = $this.find(".searchable-select-dropdown");
			$this.$searchableSelectInput = $this.find(".searchable-select-input");
			$this.$searchableScroll = $this.find(".searchable-scroll");
			$this.$searchableSelectItems = $this.find(".searchable-select-items");

			$this.addClass("searchable-select");
			if(!_oSelf.oConfig.searchAble) {
				$this.$searchableSelectInput.hide();
				$this.$searchableSelectDropdown.addClass("searchDisabled");
			}

		};

		//事件绑定
		var _loadEvent = function() {

			_showAndHide();
			_documentHide();
			_load();
			if(_oSelf.oConfig.searchAble) {
				_search();
			}
			if(_oSelf.oConfig.lazyLoadAble) {
				_scroll();
			}

		};

		// 内部使用参数
		var _oEventAlias = {
			click: 'D_ck',
			dblclick: 'D_dbl'
		};

		// 提供外部函数
		this.close = function() {

		}

		// 初始化函数
		var _init = function() {
			if(_oDialogCollections) {
				// 对于已初始化的处理
				// 如果此时已经存在弹框，则remove掉再添加新的弹框
			}
			// 初始化弹出框数据
			//_initData();
			// 加载内容
			_loadContent();

			// 事件绑定
			_loadEvent();
		}

		// 启动插件
		_init();

		// 链式调用
		return $this;
	};
	// 插件结束

})(jQuery, window, document);