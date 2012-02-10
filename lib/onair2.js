typeof onAir2 === "undefined" && (function( window, document, undefined ) {

var	DOMEvent = !!document.addEventListener,
	toString = Object.prototype.toString,
	hasOwnProperty = Object.prototype.hasOwnProperty,
	encodeURIComponent = window.encodeURIComponent,
	slice = Array.prototype.slice,
	now = Date.now || function() {
		return +new Date;
	},
	hasOwn = function( obj, prop ) {
		return hasOwnProperty.call( obj, prop );
	},
	isFn = function( obj ) {
		return toString.call( obj ) === "[object Function]";
	},
	GUID = 1,
	guid = function() {
		return GUID++;
	},
	expando = "onair" + now();

var	forEach = function( obj, callback, context ) {
		context = context || null;
		var l = obj.length;
		if( l === undefined ) {
			for( l in obj ) {
				if( callback.call( context, obj[ l ], l, obj ) === false ) {
					break;
				}
			}
		} else {
			for( var i = 0, item; i < l && callback.call( context, obj[ i ], i, obj ) !== false; i++ ) {}
		}
		return obj;
	},
	merge = function( plnObj ) {
		forEach( slice.call( arguments, 1 ), function( item ) {
			if( item ) {
				for( var i in item ) {
					plnObj[ i ] = item[ i ];
				}
			}
		});
		return plnObj;
	};

function toQueryString( obj ) {
	var qs = [];
	forEach( obj, function( value, key ){
		if( hasOwn( obj, key ) ) {
			qs.push( encodeURIComponent( key ) + "=" + encodeURIComponent( isFn( value ) ? value() : value ) );
		}
	});
	return qs.join( "&" );
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
	var	localGuid = node[ expando ] = node[ expando ] || guid(),
		data = bindedNodes[localGuid] = bindedNodes[localGuid] || {},
		handlerGuid = fn[ expando ] = fn[ expando ] || guid(),
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
		wrapper[ expando ] = handlerGuid;
		handlerStack.wrapper = wrapper;
		addEventListener(node, eventType, handlerStack.wrapper);
	}
}
function unbind (node, eventType, fn) {
	if( node[ expando ] && ( bindedNodes[ node[ expando ] ] || {} )[ eventType ] && fn[ expando ] ) {
		var	handlersStack = bindedNodes[node[expando]][eventType],
			l = handlersStack.length,
			i = 0;
		while( i < l ) {
			if( handlersStack[ i ][ expando ] == fn[ expando ] ) {
				handlersStack.splice( i, 1 );
				l--;
			}
			i++;
		}
		
		if( !l ) {
			removeEventListener( node, eventType, handlersStack.wrapper );
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


function proxy( fn, context ) {
	context = context || this;
	var wrapper = function () {
		return fn.apply(context, arguments);
	};
	fn[ expando ] = wrapper[ expando ] = fn[ expando ] || guid();
	return wrapper;
}

function shuffle( arr ) {
	var j,
		x,
		i = arr.length,
		ret = arr.slice();
	while( i-- ) {
		j = parseInt( Math.random() * ( i + 1 ) );
		x = ret[ i ];
		ret[ i ] = ret[ j ];
		ret[ j ] = x;
	}
	return ret;
}

var	str__raf = "requestAnimationFrame",
	str__craf = "cancelRequestAnimFrame",
	rafSupport = !!window[ str__raf ];
if( !rafSupport ) {
	str__raf = str__raf.charAt( 0 ).toUpperCase() + str__raf.slice( 1 );
	forEach( [ "webkit", "moz", "o", "ms" ], function( prefix ) {
		var prop = prefix + str__raf;
		if( window[ prop ] ) {
			str__raf = prop;
			rafSupport = true;
			return false;
		}
	});
}


/*var	requestAnimationFrame = (function(){
		return (
			window.requestAnimationFrame ||
			window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame ||
			window.oRequestAnimationFrame ||
			window.msRequestAnimationFrame ||
			function( cb ){
				return setTimeout( cb, 1000 / 60 );
			}
		);
	})();
	cancelRequestAnimationFrame = (function() {
		return ( 
			window.cancelAnimationFrame ||
			window.cancelRequestAnimationFrame ||
			window.webkitCancelRequestAnimationFrame ||
			window.mozCancelRequestAnimationFrame ||
			window.oCancelRequestAnimationFrame ||
			window.msCancelRequestAnimationFrame ||
			clearTimeout
		);
	})();*/

var ticks = [],
	tickAnimId;
function addTick( tick ) {
	if( !tick ) {
		return;
	}
	
	var i = ticks.push( tick ) - 1;
	if( !i ) {
		tickAnimId = setInterval( tickLoop, 25 );
	}
}

function removeTick( tick ) {
	var l = ticks.length;
	while( l-- ) {
		if( ticks[ l ] === tick ) {
			ticks.splice( l, 1 );
			break;
		}
	}
	
	if( !ticks.length ) {
		clearInterval( tickAnimId );
	}
}

function tickLoop() {
	var i = 0,
		l = ticks.length,
		needStop = false;
	while( i < l ) {
		if( ticks[ i ]() === false ) {
			ticks.splice( i, 1 );
			l--;
			continue;
		}
		i++;
	}
	
	needStop = !l;
	
	if( needStop ) {
		clearInterval( tickAnimId );
	}
}

/**
 * OnAir Constructor
 * settings: {
 * 	container: {String|Node},
 * 	items: {Array|String},
 * 	uniqueName: {String}, // [optional]
 * 	params: {Object}, // [optional]
 * 	charset: {String}, // [optional] utf-8
 * 	linkPattern: {String|Function}, // http://example.com/search?q={searchTerms}, {searchTerms} будет заменено на запрос
 * 	scrollEnabled: {Boolean}, // [optional] true
 * 	scrollDelay: {Number}, // [optional] in ms, 1000
 * 	scrollDuration: {Number}, // [optional] in ms, 500
 * 	updateAfterLoop: {Number}, // [optional] После какого кол-ва итераций стоит обновить список запросов
 * 	shuffle: {Boolean}, // [optional] false
 * 	visibleItems: {Number}, // [optional] 9
 * 	blockClass: {String}, // [optional] onair-block
 * 	listClass: {String}, // [optional] onair-list
 * 	itemClass: {String}, // [optional] onair-item
 * 	linkClass: {String}, // [optional] onair-link
 * 	loadingClass: {String}, // [optional] onair-loading
 * 	instanceExistDestroy: {Boolean} // [optional] уничтожает экземпляр с именем uniqueName, если такой был создан ранее
 * } 
 */
function onAir( settings ) {
	if( !( this instanceof onAir ) ) {
		return new onAir( settings );
	}
	
	if(
		!settings || !settings.container || settings.uniqueName &&
		onAir.instances[ settings.uniqueName ] && !settings.instanceExistDestroy
	)
	{
		throw new Error("onAir incorrect options");
	}
	
	this.guid = guid();
	
	var options = this.options = merge({
			charset: "utf-8",
			linkPattern: "http://go.mail.ru/search?q={searchTerms}",
			linkTarget: "_blank",
			showLinkTitle: false,
			scrollEnabled: true,
			scrollDelay: 1000,
			scrollDuration: 500,
			shuffle: false,
			visibleItems: 9,
			updateAfterLoop: -1,
			blockClass: "onair-block",
			listClass: "onair-list",
		 	itemClass: "onair-item",
		 	linkClass: "onair-link",
		 	loadingClass: "onair-loading"
		}, settings );
	
	this.name = options.uniqueName ? options.uniqueName : "onair" + this.guid;	
	
	if( onAir.instances[ this.name ] ) {
		if( options.instanceExistDestroy ) {
			onAir.instances[ this.name ].destroy();
		} else {
			throw Error("onAir instance name \"" + this.name + "\" already exist.");
		}
	}
	
	this.container = typeof settings.container === "string"
		? document.getElementById( settings.container )
		: settings.container;
		
	this.isRemoteItems = typeof settings.items === "string";
	
	if( !this.isRemoteItems ) {
		this.items = options.shuffle ? shuffle( settings.items ) : settings.items;
	}
	
	onAir.instances[ this.name ] = this;
	
	if( options.scrollEnabled ) {
		var self = this;
		// Сохраняем обработчики событий с сохраненным контекстом
		this.blockMouseOver = function() {
			self.stop();
		};
		this.blockMouseOut = function() {
			self.start();
		};
	}
}
onAir.prototype = {
	draw: function () {
		this.stop();
		this.clean();
		
		this.firstVisibleItem = 0;
		this.currentLoop = 0;
		
		var	self = this,
			options = this.options,
			block = this.block;
		
		if (!this.block) {
			block = this.block = document.createElement("div");
			block.id = this.name;
			block.className = options.blockClass;
			block.style.position = "relative";
			block.style.overflow = "hidden";
			this.container.appendChild(block);
			
			if( options.scrollEnabled ) {
				bind( block, "mouseover", this.blockMouseOver );
				bind( block, "mouseout", this.blockMouseOut );
			}
		}
		
		if( this.items && this.items.length ) {
			var ul = this.list = document.createElement("ul");
			ul.className = options.listClass;
			ul.style.position = "relative";
			ul.style.overflow = "hidden";
			forEach( this.items, function( item ){
				var li = document.createElement("li"),
					a = document.createElement("a");
				li.className = self.options.itemClass;
				a.className = self.options.linkClass;
				
				var link = String( options.linkPattern ).replace( /\{(\w+)\}/g, function( $0, $1 ) {
					return $1 === "searchTerms" ? encodeURIComponent( item ) : "";
				});
				
				a.setAttribute( "href", link );
				
				if( options.showLinkTitle ) {
					a.setAttribute( "title", item );
				}
				if( options.linkTarget ) {
					a.setAttribute( "target", options.linkTarget );
				}
				
				a.appendChild( document.createTextNode( item ) );
				li.appendChild( a );
				ul.appendChild( li );
			});
			block.style.height = "1px";
			ul.style.zoom = "1";
			block.appendChild( ul );
			
			var height = this.heightPerItem = getWH( ul.firstChild, "height" );
			if( options.visibleItems != -1 ) {
				height *= options.visibleItems;
			} else {
				height = "";
			}
			block.style.height = height ? height + "px" : "";
			
			if( options.scrollEnabled ) {
				this.start();
			}
		} else if( this.isRemoteItems ) {
			this.update();
		}
	},
	clean: function () {
		var block = this.block;
		while( block && block.firstChild ) {
			block.removeChild( block.firstChild );
		}
	},
	destroy: function () {
		this.stop( true );
		this.clean();
		
		var block = this.block;
		if( block ) {
			unbind( block, "mouseover", this.blockMouseOver );
			unbind( block, "mouseout", this.blockMouseOut );
			if( block.parentNode ) {
				block.parentNode.removeChild( block );
			}
			this.block = null;
		}
		
		delete onAir.instances[ this.name ];
	},
	update: function () {
		var self = this;
		this.stop( true );
		
		function setItemsAndDraw( items ) {
			self.items = self.options.shuffle ? shuffle( items ) : items;
			self.draw();
		}
		
		if( this.isRemoteItems ) {
			this.getItems(function( items ){
				setItemsAndDraw( items );
			});
		} else {
			setItemsAndDraw( this.items );
		}
	},
	getItems: function( callback ) {
		if( !this.isRemoteItems ) {
			callback( this.items );
		} else {
			var	options = this.options,
				head = document.getElementsByTagName("head")[0] || document.getElementsByTagName("body")[0],
				params = options.params ? merge({}, options.params) : {},
				uniqueName = this.name,
				tmpCallbackName = uniqueName + now();
			if (!params.callback) {
				params.callback = tmpCallbackName;
			}
			var	script = document.createElement("script");
			script.charset = options.charset;
			script.src = options.items + (/\?.*$/.test(options.items) ? "&" : "?") + toQueryString(params);
			
			var	block = this.block,
				loading = document.createElement("div");
			loading.className = options.loadingClass;
			loading.style.display = "block";
			loading.style.position = "absolute";
			loading.style.left = loading.style.top = "0";
			loading.style.width = loading.style.height = "100%";
			block.style.height = "60px";
			block.appendChild(loading);
			
			onAirCatchers[uniqueName] = tmpCallbackName;
			window[tmpCallbackName] = function (response) {
				if( loading && loading.parentNode ) {
					loading.parentNode.removeChild( loading );
				}
				
				callback( response );
				
				try {
					delete window[tmpCallbackName];
				} catch (e) {}
				
				delete onAirCatchers[uniqueName];
				
				if( script.parentNode ) {
					head.removeChild( script );
				}
			};
			
			head.insertBefore(script, head.firstChild);
		}
	},
	scroller: function() {
		var self = this,
			options = this.options,
			items = this.items,
			list = this.list,
			itemHeight = this.heightPerItem;
		
		if( self.immediateStopped ) {
			return false;
		}
		
		var	from = self.fromPos,
			to = self.toPos,
			start = self.startTime,
			stop = self.stopTime,
			time = now(),
			top,
			prevent = false;
		if( time >= stop ) {
			list.insertBefore( list.firstChild, null );
			if( self.firstVisibleItem++ == items.length - 1 ) {
				self.firstVisibleItem = 1;
				self.currentLoop++;
			}
			
			top = 0;
			prevent = true;
		} else {
			var state = ( time - start ) / options.scrollDuration;
			top = from + ( to - from ) * state;
		}
		
		list.style.top = top + "px";
		
		return !prevent;
	},
	start: function( force ) {
		var self = this,
			options = this.options,
			items = this.items,
			list = this.list,
			itemHeight = this.heightPerItem;
		
		if( !options.scrollEnabled || !items.length || !list || !itemHeight || this.scrollDelayTimeout || this.scrolling ) {
			return;
		}
		
		this.stopped = false;
		this.immediateStopped = false;
		
		function defer() {
			function handler() {
				self.scrollDelayTimeout = null;
				
				self.scrolling = true;
				
				self.fromPos = parseFloat( list.style.top ) || 0;
				self.toPos = -itemHeight;
				self.startTime = now();
				self.stopTime = self.startTime + options.scrollDuration;
				self._scroller = function() {
					var prevented = !self.scroller();
					if( prevented ) {
						self.scrolling = false;
						self._scroller = null;
						
						if( self.currentLoop == options.updateAfterLoop ) {
							self.update();
						} else {
							if( !self.stopped ) {
								defer();
							}
						}
					}
					return !prevented;
				};
				
				addTick( self._scroller );
			}
			
			if( force ) {
				force = false;
				handler();
			} else {
				self.scrollDelayTimeout = setTimeout( handler, options.scrollDelay );
			}
		}
		defer();
	},
	stop: function( immediate ) {
		clearTimeout( this.scrollDelayTimeout );
		this.scrollDelayTimeout = null;
		this.stopped = true;
		
		if( immediate ) {
			this.immediateStopped = true;
			this.scrolling = false;
			if( this._scroller ) {
				removeTick( this._scroller );
			}
		}
	}
};
onAir.instances = {};

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

})( window, document );