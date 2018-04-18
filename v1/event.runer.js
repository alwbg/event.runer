/**
 * @autor alwbg@163.com | soei
 * creation-time : 2018-04-13 20:30:20 PM
 */
;(function( global, factory ){
	global[ 'global' ] = global;
	if( typeof exports === 'object' ) {
		//factory( require, exports, module );
	} else if (typeof define === 'function') {
		//AMD CMD
		define( 'event.runer', factory );
	} else {
		var funcName = 'require';
		if( funcName && !global[ funcName ] ) {
			global[ funcName ] = function( id ) {
				return global[id];
			};
		};
		var MODULE = { exports : {} };
		factory( global[ funcName ] || function( id ) {
			alert( '需要实现 require(),加载模块:"' + id + '"' );
		}, MODULE.exports, MODULE );
		global['event.runer'] = MODULE.exports;
	}
}( this, function( require, exports, module ) {
	var $$ 			= require( 'query' ) || $;
	if( $isEmpty( $$ ) ) return alert('需要类库[JQuery|Query]');
	var $dialog 	= require( 'dialog' );
	// var $mode 		= require( 'mode' );
	var areain 		= require( 'areain' );
	var mode 		= require( 'mode' );

	var r_css2js = /-([a-z])/g;
	var r_js2css = /(?=[a-z])([A-Z])/g;

	var $Globel = {};
	/**
	 * css格式输出JS格式
	 * @param  {String} css data-name-show
	 * @return {String} js dataNameShow
	 */
	function $css2js( css ){
		return css.replace( r_css2js, function(source,$1,index){
			return $1.toUpperCase();
		} )
	}
	function $js2css( css ){
		return css.replace( r_js2css, '-$1' );
	}
	function getKeys( json ){
		var toArray = [];
		for( var i in json ){
			if( ! json.hasOwnProperty( i ) ) continue;
			toArray.push( i );
		}
		return toArray;
	}
	/**
	 * 获取指定前缀的属性值
	 * @param  {Object} target    DOM或者JSON
	 * @param  {String} prefix    字符串或者字符串正则
	 * @param  {Boolean} hasprefix true|false
	 * @return {JSON}           按需输出
	 */
	function $attrs( target, prefix, hasprefix ){
		var attrs;
		if( !( target.getAttributeNames instanceof Function ) ) attrs = target.getAttributeNames || target.attributeNames || getKeys( target );
		else attrs = target.getAttributeNames();
		var prefixReg = new RegExp( '^' + prefix + '-(.+)', 'i');
		var space = '';
		var attr;

		var execz = hasprefix != true ? function( x ){
			return prefixReg.test( x ), $css2js( RegExp.$1 );
		} : function( x ) {
			return x;
		}
		var json = {};
		for( var i = 0, length = attrs.length; i < length; i++ ){
			attr = attrs[ i ]
			if( prefixReg.test( attr ) ){
				json[ execz( attr ) ] = $attr( target, attr );
			}
		}
		return json;
	}
	// 获取对象属性值
	function $attr( target, key ){
		if( target.getAttribute instanceof Function ) return target.getAttribute( key );
		else {
			if( !( $attr.attr instanceof Function ) ){
				$attr.attr = function( key ){
					return this[ key ];
				}
			} 
			return $attr.attr.call( target, key );
		}
	}

	function $default( target, key, value ){
		$dialog.tips( needattr( target, key, value ), 1000 ).addClass('notice');
	}

	// 执行方法并传参数
	function $runer( fx, target, json ){
		if( ! (fx instanceof Function) ) 
			fx = $Globel[ fx ] || window[ fx ] || (fx && $default( { vname : 'require("event.runer").add( "{attr}", [Function] )|window.'}, fx,  true));
		return $dialog.runer( fx, exports, target, json );
	}
	function $isEmpty( json ){
		for( var key in json )
			return false;
		return true;
	}
	//'缺少 → data-uri ← 属性 如:' + (isTag ? '&lt;' : '{') + (isTag||'') +' data-uri'+( isTag ? '=' : ':' )+'"[String]" .../&gt;'
	var noTagAttrMode = new mode( '缺少 → {vname}{attr} ← 属性{?!{hide}?\'如:<span style="color:#000">\'+{l}+{tagName}+{attr}+{eq}+{value}+"..."+{r}:"";?}</span>' );
	function needattr( target, attr, value ){
		var isTag 	= target.tagName;
		var hide 	= value === true;
		return noTagAttrMode.on( {
			vname 	: target.vname||'',
			attr 	: attr,
			l 		: isTag ? '&lt;' : '{',
			r 		: isTag ? '&gt;' : '}',
			tagName : isTag ? isTag + ' ... ' : '',
			eq 		: isTag ? '=' : ':',
			value 	: value || '[String]',
			hide 	: hide
		} )
	}
	function needuri( target ){
		return needattr( target, 'data-uri' );
	}
	function request( target, dialogBox ){
		//初始化失败 ,结束请求
		if( $runer( $attr( target, 'event-request-init' ), target, dialogBox ) ){
			return $dialog.tips( 'This request has been terminated!', 3 ).addClass( 'notice' );
		};
		// 请求地址
		var url 	= $attr( target, 'data-uri' );
		if( ! url ) return $dialog.tips( needuri( target ), 100 ).addClass('notice');
		// 请求类型 post get
		var type 	= $attr( target, 'data-type' ) || 'post';
		// 是否显示Tips提示加载
		var loading = $attr( target, 'data-loading' );
		var tips;
		if( loading == 'true' ){
			tips = $dialog.tips( '<span class="icon-loading"></span>'+ (
				$attr( target,'data-loading-message') /*Tips提示的内容*/
				|| '正在加载请稍后') + '...', $attr( target, "data-loading-time" ) || 10000, $attr( target, "data-loading-position" ) || 'right top' )
		}
		var g = $attrs( target, 'global' );
		var isSave;
		// console.log( $attr( target, 'save-uri' ) == "true" );
		if( isSave = $attr( target, 'save-uri' ) == "true" )
			$Globel.current = url;
		//获取请求参数
		var args = $attrs( target, '(?:args|var)' );
		if( $isEmpty( args ) ) args = $attr( target, 'send-data' );
		if( $isEmpty( g ) ){
			delete $Globel[ url ];
		} else {
			//获取全局仓库
			var gl = $Globel[ url ] || ($Globel[ url ] = {});
			for( var key in g ){
				//保存自定义参数 @see attr global-*="true|false"
				if( g[ key ] == 'true' ){
					if( args[ key ] != undefined ){
						gl[ key ]  = args[ key ];
					}
				}
			}
			$dialog.merge( args, gl );//合并全局变量属性
		}
		// console.log(args, '-', JSON.stringify( $Globel ))
		exports.ajax({
			url 	: url,
			type 	: type,
			data 	: args,
			success : function( json ){
				tips && tips.remove && tips.remove();
				json.dialog = dialogBox;
				// 获取回调方法指针
				var fxname = $attr( target, 'event-callback' );
				if( isSave ) $Globel.currentcallback = fxname;
				fxname = fxname || $Globel.currentcallback;
				$runer( fxname , target, json );
				$dialog.runer( _EVENTS_[ 'requested' ], exports, 'request', fxname );
			},
			error : function(e){
				tips && tips.remove && tips.remove();
				$dialog.tips( '异常!稍后再试.或者联系后台管理员 : 状态码::'+e.status, 7 ).room.addClass('error');
			}
		});
	}

	exports.attr 	= $attr;
	exports.attrs 	= $attrs;
	exports.runer 	= $runer;
	exports.js2css 	= $js2css;
	exports.css2js 	= $css2js;
	
	exports.ajax 	= function(){
		$dialog.tips( needattr( {vname:'event.runer.js.'}, 'ajax', 'function(){}' ), 300 ).addClass('notice');
	}
	exports.request = request;
	exports.add = function( key, map ){
		$Globel[ key ] = map;
	}
	exports.get = function( key ) {
		return $Globel[ key ];
	}
	exports.current = function(){
		return $Globel[ $Globel.current ];
	}
	var _EVENTS_ = {};
	/**
	 * 添加监听
	 * @param  {Object} target   DOM对象或者选择器
	 * @param  {String} selector 要监控的选择器对象事件
	 */
	exports.listen = function( target, selector, eventHandle ){
		eventHandle || (eventHandle = 'click');
		$$( target ).on( eventHandle, function( e ){
			var target = areain.within( selector,  e.target );
			if( target ){
				var key = areain.__val_;
				if( areain.is( '.disabled', target ) ) return;
				exports.runer( key, target );
				// console.log( eventHandle )
				// if( /^(?:request|.*-init)$/.test( key ) ) return;
				$dialog.runer( _EVENTS_[ eventHandle ], exports, eventHandle, key, target );
			}
		} )
	}
	exports.on = function( key, fx ){
		(_EVENTS_[ key ] || (_EVENTS_[ key ] = [])).push( fx );
	}

	exports.array2map = function( arr ){
		var map = {};
		if( arr instanceof Array ){
			for( var i = 0, len = arr.length; i < len; i++ ){
				map[ arr[ i ] ] = i;
			}
		}
		return map;
	}

}));
