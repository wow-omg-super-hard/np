/**
 * @Dialog.js
 * @author zengwenbin
 * @version 1.0
 * Created 18-6-28
 */

(function (root, factory, $) {
  if (typeof define !== 'undefined' && define.amd) {
    // amd环境
    define([ 'jquery' ], function ($) {
      return factory($);
    });
  } else {
    // 浏览器直接引用
    root.Dialog = factory($);
  }
})(this, function ($) {
// 元素class
var splitter = '-';
var prefix = 'ui-dialog';
var prefixRoot = prefix + splitter + 'container';
var prefixDialog = prefix + splitter + 'inner';
var prefixTitle = prefix + splitter + 'title';
var prefixClose = prefix + splitter + 'close';
var prefixBody = prefix + splitter + 'body';
var prefixFooter = prefix + splitter + 'footer';
var prefixBtn = prefix + splitter + 'button';

// 关闭按钮的svg
var closeSVG = '<svg width="64" version="1.1" xmlns="http://www.w3.org/2000/svg" height="64" viewBox="0 0 64 64" xmlns:xlink="http://www.w3.org/1999/xlink" enable-background="new 0 0 64 64"><g><path fill="#1D1D1B" d="M28.941,31.786L0.613,60.114c-0.787,0.787-0.787,2.062,0,2.849c0.393,0.394,0.909,0.59,1.424,0.59 c0.516,0,1.031-0.196,1.424-0.59l28.541-28.541l28.541,28.541c0.394,0.394,0.909,0.59,1.424,0.59c0.515,0,1.031-0.196,1.424-0.59   c0.787-0.787,0.787-2.062,0-2.849L35.064,31.786L63.41,3.438c0.787-0.787,0.787-2.062,0-2.849c-0.787-0.786-2.062-0.786-2.848,0   L32.003,29.15L3.441,0.59c-0.787-0.786-2.061-0.786-2.848,0c-0.787,0.787-0.787,2.062,0,2.849L28.941,31.786z"/></g></svg>';

// `alert`弹出框的`√`svg
var tickSVG = '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 32.001 32.001" style="fill: #01cf97" xml:space="preserve"><g id="icon-tick"><path style="fill:#1BCC87;" d="M30.333,4.916L11.501,23.749l-9.833-9.833L0,15.584l11.501,11.501l20.5-20.5L30.333,4.916z"/></g></svg>';

// 'alert'弹出框的`×`svg
var crossSVG = '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 26.668 26.668" style="fill: #f4615c;" xml:space="preserve"><g id="icon-cross"><path style="fill:#F05F5C;" d="M26.668,1.467L25.201,0L13.334,11.867L1.467,0L0,1.467l11.867,11.867L0,25.201l1.467,1.467l11.867-11.867l11.867,11.867l1.467-1.467L14.801,13.334L26.668,1.467z"/></g></svg>';

// 'alert'弹出框的`！`svg
var remindSVG = '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 42.666 42.666" style="fill: #2486ff" xml:space="preserve"><g><path d="M16.899,38.233c0,2.448,1.984,4.433,4.434,4.433s4.434-1.984,4.434-4.433c0-2.451-1.984-4.435-4.434-4.435S16.899,35.782,16.899,38.233z"/><path d="M23.635,25V2c0-1.104-0.896-2-2-2s-2,0.896-2,2v23c0,1.104,0.896,2,2,2S23.635,26.104,23.635,25z"/></g></svg>';

// 是否在chrome运行
var isWebkit = 'WebkitAppearance' in document.documentElement.style || typeof document.webkitHidden !== 'undefined';

var Dialog = function (options) {
  options || (options = {});

  // 对话框默认的公共属性
  var defaults = {
    width: 'auto',
    onShow: $.noop,
    onRemove: $.noop
  };

  var params = $.extend({}, defaults, options);
  var el = this.el = {};
  var dialog = null;

  this.width = params.width;
  this.callbacks = {
    onShow: params.onShow,
    onRemove: params.onRemove
  };

  // 标识当前对话框的显隐状态，针对不同状态删除或恢复滚动条
  this.display = false;

  // 容器新浏览器使用更加语义化的标签
  el.container = window.addEventListener ? $('<dialog class="'+ prefixRoot +'"></dialog>') : $('<div class="'+ prefixRoot +'"></div>');

  // 弹框主体
  el.dialog = $('<div class="'+ prefixDialog +'"></div>').css('width', params.width);

  // 标题
  el.title = $('<div class="'+ prefixTitle +'"></div>');

  // 关闭按钮
  el.close = $('<a href="javascript:;" class="'+ prefixClose +'"></a>').html(closeSVG).click($.proxy(function (e) {
    e.preventDefault();
    e.stopPropagation();

    this.remove();
  }, this));

  // 主内容
  el.body = $('<div class="'+ prefixBody +'"></div>');

  // 底部
  el.footer = $('<div class="'+ prefixFooter +'"></div>');

  // 组装起来
  el.container.append(el.dialog.append(el.title).append(el.close).append(el.body).append(el.footer));

  // 如果页面中存在弹框，则将新创建的弹框（处理定时器控制的弹框或ajax返回需要弹框的多次出现）
  if ((dialog = $('.'+ prefixRoot +'')).length) {
    dialog.eq(0).before(el.container.css({
      zIndex: dialog.eq(0).css('z-index') + 1
    }));
  } else {
    $(document.body).append(el.container);
  }
};

/**
 * 弹出框
 * remind(提醒)、success(成功)、warning(警告)
 *
 * @param { String } content 弹出框显示内容
 * @param { Array(JSON) } buttons 按钮信息
 * @param { String } type 弹出框类型
 */
Dialog.prototype.alert = function (content, buttons, type) {
  var params = {
    content: $.isFunction(content) ? content() : (content || ''),
    buttons: buttons || [{ text: '确定', type: type }],
    type: type || 'remind'
  };
  var contentChild = null;

  // 如果写错了type，导致会写错class，所以引用不到，样式就会错乱
  params.type !== 'remind' && params.type !== 'success' && params.type !== 'warning' && (params.type = 'remind');

  // 添加对话框容器元素class
  this.el.container.addClass(prefix + splitter + 'alert');

  // 如果内容是纯文本
  if (!/<[\w\W]*?>/.test(params.content)) {
    params.content = '<p>'+ params.content +'</p>';
  }

  contentChild = $('<div class="'+ prefix + splitter + params.type +'"><div>'+ params.content +'</div></div>').prepend('<i>'+ (params.type === 'remind' ? remindSVG : params.type === 'success' ? tickSVG : crossSVG) +'</i>');

  // 添加content
  this.el.body.empty().append(contentChild);

  //添加footer并且显示对话框
  this._createFooterContent(params.buttons, params.type)._show();

  return this;
};

/**
 * confirm 确认对话框
 *
 */
Dialog.prototype.confirm = function (title, content, buttons, type) {
  var params = {
    title: title || '',
    content: $.isFunction(content) ? content() : (content || ''),
    buttons: buttons || [{ type: type, text: '确定' }, {}],
    type: type || 'remind'
  };

  var contentChild = null;

  // 因为confirm对话框必须有两个按钮，检查是否小于2个或大于两个
  if (params.buttons.length < 2) {
    params.buttons.push({});
  } else if (params.buttons.length > 2) {
    params.buttons.splice(params.buttons.length - 1, 1);
  }

  // 如果写错了type，导致会写错class，所以引用不到，样式就会错乱
  params.type !== 'remind' && params.type !== 'success' && params.type !== 'warning' && (params.type = 'remind');

  this.el.container.addClass(prefix + splitter + 'confirm');

  // 如果标题是纯文本
  if (!/<[\w\W]*?>/.test(params.title)) {
    params.title = '<p>'+ params.title +'</p>';
  }

  // 如果内容是纯文本
  if (!/<[\w\W]*?>/.test(params.content)) {
    params.content = '<p>'+ params.content +'</p>';
  }

  contentChild = $('<div class="'+ prefix + splitter + params.type +'"><div>'+ params.content +'</div></div>').prepend('<i>'+ (params.type === 'remind' ? remindSVG : params.type === 'success' ? tickSVG : crossSVG) +'</i>');

  // 添加标题
  this.el.title.html(params.title);

  // 添加内容
  this.el.body.empty().append(contentChild);

  // 添加尾部内容并且显示确认对话框
  this._createFooterContent(params.buttons, params.type)._show();

  return this;
};

Dialog.prototype._createFooterContent = function (buttons, type) {
  var self = this;
  var text, events, btn;

  $.each(buttons, function (idx, button) {
    text = button.text || (!idx ? '确定' : '取消');
    type = button.type || (!idx ? type : void 0)
    events = $.proxy(button.events || function () { this.remove(); }, self);
    btn = $('<a href="javascript:;" class="'+ prefixBtn +' '+ prefix + splitter + 'button' + splitter + (type || 'default') +'">'+ text +'</a>').bind('click', events).appendTo(self.el.footer);

    self.el.footer.append(btn);
  });

  return self;
};

/**
 * 禁止打开弹出框时，背景滑动
 * 所以需要打开对话框时，先获取滚动条的宽度，然后设置documentElement的overflow为hidden，
 * 然后为了保证页面不抖动，需要偏移所以得设置body的border-right为滚动条的宽度
 */
Dialog.prototype._scroll = function () {
  var scrollbarWidth;

  // 如果是删除操作
  if (this.display) {
    $(document.documentElement).css({ 'overflow': '', 'border-right': '' });
  }
  // 显示操作
  else {
    scrollbarWidth = typeof window.innerWidth === 'number' ? window.innerWidth - document.documentElement.clientWidth : 17;
    $(document.documentElement).css({ 'overflow': 'hidden', 'border-right': scrollbarWidth + 'px solid transparent' });
  }

  return this;
};


Dialog.prototype._show = function () {
  if (this.el && this.el.container && !this.display) {
    this.el.container.css('display', 'block');
    this.el.dialog.addClass(prefix + splitter + 'animation');
    this._scroll();
    this.display = true;
    this.callbacks.onShow.call(this, this.el.container);
  }
};

Dialog.prototype.remove = function () {
  if (this.el && this.el.container && this.display) {
    this.el.container.remove();
    this._scroll();
    this.display = false;
    this.callbacks.onRemove.call(this, this.el.container);
  }

  return this;
};

return Dialog;
}, jQuery);
