if (typeof onAir2 === "undefined") {
	(function(window, undefined){
		
	var	guid = 1,
		expando = "onair" + now(),
		document = window.document,
		DOMEvent = !!document.addEventListener,
		toString = Object.prototype.toString,
		encodeURIComponent = window.encodeURIComponent;
	
	function now () {
		return (new Date).getTime();
	}
	
	var	ArrayForEach = Array.prototype.forEach,
		forEach = function (obj, callback, context) {
			var l = obj.length;
			context = context || null;
			if (l === undefined) {
				for (l in obj) {
					if (callback.call(context, obj[l], l, obj) === false) {
						break;
					}
				}
			} else if (ArrayForEach) {
				ArrayForEach.call(obj, callback, context);
			} else {
				for (var i = 0, item; i < l && callback.call(context, obj[i], i, obj) !== false; i++) {}
			}
			return obj;
		},
		merge = function (plnObj, extObj) {
			forEach(Array.prototype.slice.call(arguments, 1), function(item){
				for (var i in item) {
					plnObj[i] = item[i];
				}
			});
			return plnObj;
		};
	
	function toQueryString (obj) {
		var qs = [];
		forEach(obj, function(value, key){
			if (obj.hasOwnProperty(key)) {
				qs.push(encodeURIComponent(key) + "=" + encodeURIComponent(toString.call(value) === "[object Function]" ? value() : value));
			}
		});
		return qs.join("&");
	}
	
	var	bindedNodes = {},
		addEventListener = DOMEvent ? function (node, eventType, fn) {
			node.addEventListener(eventType, fn, false);
		} : function (node, eventType, fn) {
			node.attachEvent("on" + eventType, fn);
		},
		removeEventListener = DOMEvent ? function (node, eventType, fn) {
			node.removeEventListener(eventType, fn, false);
		} : function (node, eventType, fn) {
			node.detachEvent("on" + eventType, fn);
		};
	function bind (node, eventType, fn) {
		var	localGuid = node[expando] = node[expando] || guid++,
			data = bindedNodes[localGuid] = bindedNodes[localGuid] || {},
			handlerGuid = fn.guid = fn.guid || guid++,
			handlerStack = data[eventType] = data[eventType] || [];
		if (handlerStack.push(fn) == 1) {
			var wrapper = function (eventObject) {
				var	returnFalse;
				eventObject = eventObject || window.event;
				forEach(handlerStack, function(){
					if (arguments[0].call(node, eventObject) === false) {
						if (eventObject.preventDefault) {
							eventObject.preventDefault();
						}
						eventObject.returnFalse = false;
						if (eventObject.stopPropagation) {
							eventObject.stopPropagation();
						}
						eventObject.cancelBubble = true;
						returnFalse = false;
					}
				});
				return returnFalse;
			};
			wrapper.secured = node;
			wrapper.guid = handlerGuid;
			handlerStack.wrapper = wrapper;
			addEventListener(node, eventType, handlerStack.wrapper);
		}
	}
	function unbind (node, eventType, fn) {
		if (node[expando] && (bindedNodes[node[expando]] || {})[eventType] && fn.guid) {
			var	handlersStack = bindedNodes[node[expando]][eventType],
				l = handlersStack.length,
				i = 0;
			while (i < l) {
				if (handlersStack[i].guid == fn.guid) {
					handlersStack.splice(i, 1);
					l--;
				}
				i++;
			}
			if (!l) {
				removeEventListener(node, eventType, handlersStack.wrapper);
			}
		}
	}
	
	var defineWHHelpProps = {position: "absolute", visibility: "hidden", display: "block"};
	function getWH (elem, name, heaven) {
		var val,
			offset = "offset" + name.substring(0, 1).toUpperCase() + name.slice(1);
		if (!heaven && elem[offset] != 0) {
			val = elem[offset];
		} else {
			var old = {};
			for (name in defineWHHelpProps) {
				old[name] = elem.style[name];
				elem.style[name] = defineWHHelpProps[name];
			}
			val = elem[offset];
			for (name in old) {
				elem.style[name] = old[name];
			}
		}
		return val;
	}
	
	
	function onAirLinkNormalize (text) {
		text = encodeURIComponent(text);
		return (this.options.linkPattern || "").replace(/\{(\w+)\}/g, function($0, $1){
			return $1 === "searchTerms" ? text : "";
		});
	}
	
	var timerId,
		timers = [];
	function startCheckTimers () {
		timerId = setInterval(function(){
			for (var i = 0, l = timers.length; i < l;) {
				if (!timers[i]()) {
					timers.splice(i, 1);
					l--;
				} else {
					i++;
				}
			}
			if (!l) {
				stopCheckTimers();
			}
		}, 13);
	}
	function stopCheckTimers () {
		clearInterval(timerId);
	}
	
	function proxy (fn, context) {
		context = context || this;
		return function () {
			return fn.apply(context, arguments);
		};
	}
	
	
	/**
	 * OnAir Constructor
	 * settings: {
	 * 	container: {String|Node},
	 * 	items: {Array|String},
	 * 	[uniqueName: {String},]
	 * 	[params: {Object},]
	 * 	[charset: {String},]
	 * 	linkPattern: {String|Function},
	 * 	[refreshRate: {Number},]
	 * 	[scrollDelay: {Number},]
	 * 	[scrollDuration: {Number},]
	 * 	[visibleItems: {Number},]
	 * 	[blockClass: {String},]
	 * 	[listClass: {String},]	
	 * 	[itemClass: {String},]
	 * 	[loadClass: {String}]
	 * 	[instanceExistDestroy: {Boolean}]
	 * }
	 */
	function onAir (settings) {
		if(
			!settings || !settings.container || settings.uniqueName &&
			onAir.instances[settings.uniqueName] && !settings.instanceExistDestroy
		)
		{
			throw new Error("onAir-incorrect settings");
		}
		if (onAir.instances[settings.uniqueName]) {
			onAir.instances[settings.uniqueName].destroy();
		}
		this.guid = guid++;
		this.options = merge({
			uniqueName: "onair" + this.guid
		}, onAir.options, settings);
		this.container = typeof settings.container === "string"
			? document.getElementById( settings.container )
			: settings.container;
		this.isRemoteItems = typeof settings.items === "string";
		if (!this.isRemoteItems) {
			this.items = settings.items;
		}
		onAir.instances[this.options.uniqueName] = this;
	}
	onAir.prototype = {
		draw: function () {
			this.stop();
			this.clean();
			this.firstVisibleItem = 0;
			this.currentLoop = 0;
			
			var	self = this,
				block = this.block;
			
			if (!this.block) {
				block = this.block = document.createElement("div");
				block.id = this.options.uniqueName;
				block.className = this.options.blockClass;
				block.style.position = "relative";
				block.style.overflow = "hidden";
				this.container.appendChild(block);
				
				bind(block, "mouseover", proxy(this.stop, this));
				bind(block, "mouseout", proxy(this.start, this));
			}
			
			if (this.items && this.items.length) {
				var ul = this.list = document.createElement("ul");
				ul.className = this.options.listClass;
				ul.style.position = "relative";
				ul.style.overflow = "hidden";
				forEach(this.items, function(item){
					var li = document.createElement("li"),
						a = document.createElement("a");
					li.className = self.options.itemClass;
					a.className = self.options.linkClass;
					a.setAttribute("href", onAirLinkNormalize.call(self, item));
					a.setAttribute("title", item);
					a.setAttribute("target", self.options.linkTarget);
					a.appendChild(document.createTextNode(item));
					li.appendChild(a);
					ul.appendChild(li);
				});
				block.style.height = "1px";
				ul.style.zoom = "1";
				block.appendChild(ul);
				
				var height = this.heightPerItem = getWH(ul.firstChild, "height");
				if (this.options.visibleItems != -1) {
					height *= this.options.visibleItems;
				} else {
					height = "";
				}
				block.style.height = height ? height + "px" : "";
				
				this.start();
			} else if (this.isRemoteItems) {
				this.update();
			}
		},
		clean: function () {
			var block = this.block;
			while (block && block.firstChild) {
				block.removeChild(block.firstChild);
			}
		},
		destroy: function () {
			this.stop(true);
			this.clean();
			var block = this.block;
			unbind(block, "mouseover", this.stop);
			unbind(block, "mouseout", this.start);
			this.container.removeChild(block);
			this.block = null;
			delete onAir.instances[this.options.uniqueName];
		},
		start: function () {
			if (this.options.visibleItems == -1 || this.delayId || !this.items || this.items.length <= this.options.visibleItems) {
				return false;
			}
			var self = this,
				list = this.list;
			this.isNeedStop = false;
			
			function defer () {
				var from = parseFloat(list.style.top) || 0,
					to = -self.heightPerItem,
					current = 0,
					startTime = now(),
					duration = self.options.scrollDuration;
				function update () {
					list.style.top = current + "px";
				}
				function scroll () {
					var currentTime = now();
					if (currentTime >= startTime + duration) {
						list.insertBefore(list.firstChild, null);
						current = 0;
						if (self.firstVisibleItem++ == self.items.length - 1) {
							self.firstVisibleItem = 1;
							self.currentLoop++;
						}
						
						update();
						
						self.delayId = null;
						self.scrollHandlerId = null;
						if (self.currentLoop == self.options.updateAfterLoop) {
							self.update();
						}
						if (self.isNeedStop) {
							self.stop();
						} else {
							self.start();
						}
						return false;
					} else {
						var state = (currentTime - startTime) / duration;
						current = from + (to - from) * state;
						update();
						return true;
					}
				}
				
				self.scrollHandlerId = timers.push(scroll) - 1;
				if (!self.scrollHandlerId) {
					startCheckTimers();
				}
			}
			parseInt(list.style.top) ? defer() : this.delayId = setTimeout(defer, this.options.scrollDelay);
		},
		stop: function (force) {
			force = force === true;
			if (this.options.visibleItems == -1 || !this.items || this.items.length <= this.options.visibleItems) {
				return false;
			}
			if (force && this.scrollHandlerId !== null && timers[this.scrollHandlerId]) {
				timers.splice(this.scrollHandlerId, 1);
				this.scrollHandlerId = null;
			}
			if (this.delayId && this.scrollHandlerId === null) {
				clearTimeout(this.delayId);
				this.delayId = null;
			} else {
				this.isNeedStop = true;
			}
		},
		update: function () {
			if (this.isRemoteItems) {
				var self = this;
				this.stop(true);
				this.getItems(function(items){
					self.items = items;
					self.draw();
				});
			}
		},
		getItems: function (callback) {
			if (!this.isRemoteItems) {
				callback(this.items);
			} else {
				var	head = document.getElementsByTagName("head")[0] || document.getElementsByTagName("body")[0],
					params = this.options.params ? merge({}, this.options.params) : {},
					uniqueName = this.options.uniqueName,
					tmpCallbackName = uniqueName + now();
				if (!params.callback) {
					params.callback = tmpCallbackName;
				}
				var	script = document.createElement("script");
				script.charset = this.options.charset;
				script.src = this.options.items + (/\?.*$/.test(this.options.items) ? "&" : "?") + toQueryString(params);
				
				var	block = this.block,
					loading = document.createElement("div");
				loading.className = this.options.loadingClass;
				loading.style.display = "block";
				loading.style.position = "absolute";
				loading.style.left = loading.style.top = "0";
				loading.style.width = loading.style.height = "100%";
				block.style.height = "60px";
				block.appendChild(loading);
				
				onAirCatchers[uniqueName] = tmpCallbackName;
				window[tmpCallbackName] = function (response) {
					block.removeChild(loading);
					callback(response);
					try {
						delete window[tmpCallbackName];
					} catch (e) {}
					delete onAirCatchers[uniqueName];
					head.removeChild(script);
				};
				
				head.insertBefore(script, head.firstChild);
			}
		}
	};
	onAir.instances = {};
	onAir.options = {
		charset: document.charset || document.characterSet || "utf-8",
		linkPattern: "http://go.mail.ru/search?q={searchTerms}",
		linkTarget: "_blank",
		scrollDelay: 1000,
		scrollDuration: 500,
		visibleItems: 9,
		updateAfterLoop: -1,
		blockClass: "onair-block",
		listClass: "onair-list",
	 	itemClass: "onair-item",
	 	linkClass: "onair-link",
	 	loadingClass: "onair-loading"
	};
	
	var onAirCatchers = {};
	onAir.catcher = function (uniqueName, response) {
		if (uniqueName && onAirCatchers[uniqueName]) {
			var catcher = window[onAirCatchers[uniqueName]];
			catcher && catcher(response);
		}
	};
	
	var	DOMReadyStack = [];
	function DOMReady () {
		if (!onAir.isReady) {
			if (!document.body) {
				setTimeout(DOMReady, 13);
			} else {
				onAir.isReady = true;
				if (DOMReadyStack) {
					forEach(DOMReadyStack, function(fn){
						fn();
					});
					DOMReadyStack = null;
				}
			}
		}
	}
	
	var	tryScrollChecking,
		specialReadyEvent = DOMEvent ? "DOMContentLoaded" : "readystatechange",
		DOMContentLoaded = function(){
			if (DOMEvent || document.readyState === "complete") {
				removeEventListener(document, specialReadyEvent, DOMContentLoaded);
				DOMReady();
			}
		};
	onAir.isReady = false;
	onAir.ready = function (fn) {
		if (onAir.isReady) {
			fn();
		} else if (DOMReadyStack) {
			DOMReadyStack.push(fn);
			if (!tryScrollChecking) {
				tryScrollChecking = true;
				if (document.readyState === "complete") {
					DOMReady();
				} else {
					addEventListener(document, specialReadyEvent, DOMContentLoaded);
					addEventListener(window, "load", DOMReady);
					if (!DOMEvent) {
						(function(){
							if (!onAir.isReady) {
								try {
									document.documentElement.doScroll("left");
									DOMReady();
								} catch (e) {
									setTimeout(arguments.callee, 10);
								}
							}
						})();
					}
				}
			}
		}
	};
	
	window.onAir2 = onAir;
	
	})(this);
}