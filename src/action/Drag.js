/**
 * @drag.js
 * @des 针对组件化的`可复用`、`可扩展`等特点，抽离出可变的交互
 * @author zengwenbin
 * @version 1.0
 * @Created 18-7-3
 */

(function (root, factory, $) {
  if (typeof define !== 'undefined' && define.amd) {
    define([ 'jQuery' ], function () {
      return factory($);
    });
  } else {
    root.Drag = factory($);
  }
})(this, function ($) {
  var Drag = function (options) {
    options || (options = {});

    // 公共的属性
    var defaults = {
      com: $(void 0),
      onDragStart: $.noop,
      onDrag: $.noop,
      onDragEnd: $.noop
    };
    var params = $.extend({}, defaults, options);

    this.el = params.com;
    this.callbacks = {
      onDragStart: params.onDragStart,
      onDrag: params.onDrag,
      onDragEnd: params.onDragEnd
    };

    // 是否正在拖拽中
    this.isDraging = false;
    // 当前、偏移坐标
    this.currX = this.currY = this.offsetX = this.offsetY = 0;

    // 为原型方法绑定this
    this._dragStartHandle = $.proxy(this._dragStartHandle, this);
    this._dragHandle = $.proxy(this._dragHandle, this);
    this._dragEndHandle = $.proxy(this._dragEndHandle, this);

    // 设置拖拽css属性
    this.el.addClass('ui-drag-action');

    // 绑定`mouseover`、`mousemove`、`mouseout`等事件
    this.el.bind('mousedown', this._dragStartHandle);
    $(document.body).bind('mousemove', this._dragHandle);
    $(document.body).bind('mouseup', this._dragEndHandle);
  };

  Drag.prototype._move = function (offsetX, offsetY) {
    var translateStr = 'translate('+ offsetX +'px,'+ offsetY +'px)';

    this.el.css({
      'transform': translateStr,
      '-webkit-transform': translateStr,
      '-moz-transform': translateStr,
      '-ms-transform': translateStr
    });
  };

  Drag.prototype._dragStartHandle = function (e) {
    // 设置正在拖拽
    this.isDraging = true;

    // 设置当前坐标为鼠标坐标
    this.currX = e.clientX;
    this.currY = e.clientY;

    // 设置元素的偏移量
    this._move(this.offsetX, this.offsetY);
    this.callbacks.onDragStart.call(this, this.offsetX, this.offsetY);
  };

  Drag.prototype._dragHandle = function (e) {
    var offsetX = this.offsetX;
    var offsetY = this.offsetY;

    if (this.isDraging) {
      // 记录当前坐标和上个坐标之间的差值
      offsetX = (e.clientX - this.currX) + offsetX;
      offsetY = (e.clientY - this.currY) + offsetY;

      this._move(offsetX, offsetY);
      this.callbacks.onDrag.call(this, this.offsetX, this.offsetY);
    }
  };

  Drag.prototype._dragEndHandle = function (e) {
    this.isDraging = false;

    this.offsetX = (e.clientX - this.currX) + this.offsetX;
    this.offsetY = (e.clientY - this.currY) + this.offsetY;
    
    this.callbacks.onDragEnd.call(this, this.offsetX, this.offsetY);
  };

  return Drag;
}, jQuery);
