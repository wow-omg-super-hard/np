/**
 * @Dialog.js
 * @author zengwenbin
 * @version 1.0
 * Created 18-6-28
 */

(function (root, factory, $, fetch) {
  if (typeof define !== 'undefined' && define.amd) {
    // amd环境
    define([ 'jquery', 'fetch' ], function ($, fetch) {
      return factory($, fetch);
    });
  } else {
    // 浏览器直接引用
    root.Dialog = factory($, fetch);
  }
})(this, function ($, fetch) {
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

// 'custom'弹出框的`loading` svg
var loadingSVG = '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" id="Capa_1" x="0px" y="0px" viewBox="0 0 429.354 429.354" style="enable-background:new 0 0 429.354 429.354;" xml:space="preserve" width="512px" height="512px"><g><g><path d="M372.53,82.843C336.673,30.958,277.621-0.009,214.55,0C108.512,0.115,22.644,86.17,22.759,192.208    c0.107,98.751,75.105,181.317,173.392,190.888L163.638,415.6c-3.178,3.07-3.266,8.134-0.196,11.312 c3.07,3.178,8.134,3.266,11.312,0.196c0.067-0.064,0.132-0.13,0.196-0.196l45.248-45.248c0.747-0.745,1.337-1.632,1.736-2.608    c0.809-1.957,0.809-4.155,0-6.112c-0.399-0.976-0.989-1.863-1.736-2.608l-45.248-45.248c-3.178-3.07-8.243-2.982-11.312,0.196    c-2.994,3.1-2.994,8.015,0,11.116l30.4,30.4C97.56,355.44,28.559,268.019,39.919,171.541S138.7,6.061,235.178,17.422    s165.48,98.781,154.119,195.259c-5.908,50.177-33.107,95.39-74.667,124.119c-3.691,2.428-4.714,7.389-2.286,11.08 c2.429,3.691,7.389,4.714,11.08,2.286c0.105-0.069,0.208-0.141,0.31-0.214C410.969,289.666,432.815,170.078,372.53,82.843z" fill="#00d8f0"/></g></g></svg>';

// 是否在chrome运行
var isWebkit = 'WebkitAppearance' in document.documentElement.style || typeof document.webkitHidden !== 'undefined';

// 抽取构建弹出框相同的代码，作纯函数使用，用于解耦
function quick (dialogType) {
  var titleClass, createBody, defaultButtons;

  if (dialogType === 'custom') {
    titleClass = 'alert';
    createBody = function (content, type) {
      return $('<div class="'+ prefix + splitter + type +'"><div class="custom">'+ content +'</div></div>');
    };
    defaultButtons = [{}];
  } else if (dialogType === 'confirm') {
    titleClass = 'confirm';
    createBody = function (content, type) {
      return $('<div class="'+ prefix + splitter + type +'"><div>'+ content +'</div></div>').prepend('<i>'+ (type === 'remind' ? remindSVG : type === 'success' ? tickSVG : crossSVG) +'</i>');
    };
    defaultButtons = [{}, {}];
  } else {
    titleClass = 'alert';
    createBody = function (content, type) {
      return $('<div class="'+ prefix + splitter + type +'"><div>'+ content +'</div></div>').prepend('<i>'+ (type === 'remind' ? remindSVG : type === 'success' ? tickSVG : crossSVG) +'</i>');
    };
    defaultButtons = [{}];
  }

  return function (title, content, buttons, type) {
    type || (type = 'remind');
    var options = {
      title: title || '',
      content: $.isFunction(content) ? content() : (content || ''),
      buttons: buttons || defaultButtons
    };
    var bodyChild;
    // 如果写错了type，导致会写错class，所以引用不到，样式就会错乱
    type !== 'remind' && type !== 'success' && type !== 'warning' && (type = 'remind');

    // 添加对话框容器元素class
    this.el.container.addClass(titleClass);

    // 如果标题是纯文本
    if (!/<[\w\W]*?>/.test(options.title)) {
      options.title = '<p>'+ options.title +'</p>';
    }

    // 如果内容是纯文本
    if (!/<[\w\W]*?>/.test(options.content)) {
      options.content = '<p>'+ options.content +'</p>';
    }

    bodyChild = createBody(options.content, type);

    // 添加title的内容
    this.el.title.html(options.title);

    // 添加body的内容
    this.el.body.empty().append(bodyChild);

    // 添加footer的内容
    this._createFooterContent(options.buttons, type)._show();

    return this;
  };
}

var Dialog = function (options) {
  options || (options = {});

  // 对话框默认的公共属性
  var defaults = {
    width: 'auto',
    onShow: $.noop,
    onRemove: $.noop
  };

  var options = $.extend({}, defaults, options);
  var el = this.el = {};
  var dialog = null;

  this.width = options.width;
  this.callbacks = {
    onShow: options.onShow,
    onRemove: options.onRemove
  };

  // 标识当前对话框的显隐状态，针对不同状态删除或恢复滚动条
  this.display = false;

  // 容器新浏览器使用更加语义化的标签
  el.container = window.addEventListener ? $('<dialog class="'+ prefixRoot +'"></dialog>') : $('<div class="'+ prefixRoot +'"></div>');

  // 弹框主体
  el.dialog = $('<div class="'+ prefixDialog +'"></div>').css('width', options.width);

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
      zIndex: parseInt(dialog.eq(0).css('z-index')) + 1
    }));
  } else {
    $(document.body).append(el.container);
  }
};

/**
 * 弹出框
 * remind(提醒)、success(成功)、warning(警告)
 *
 * @param { String } title
 * @param { String } content 弹出框显示内容
 * @param { Array(JSON) } buttons 按钮信息
 * @param { String } type 弹出框类型
 */
Dialog.prototype.alert = quick('alert');

/**
 * confirm 确认对话框
 * 参数参考上面
 */
Dialog.prototype.confirm = quick('confirm');

/**
 * custom 自定义弹出框
 * 参数参考上面
 */
Dialog.prototype.custom = quick('custom');

/**
 * ajax请求弹出框
 * 就是先创建菊花弹出框，再发送一个ajax，ajax请求完成后，消除菊花弹出框，根据内容打开新的弹出框
 * ajaxOptions.url 是必填的
 * options.content 是必填的，必须是函数类型
 */
Dialog.prototype.ajax = function (ajaxOptions, options) {
  if (!ajaxOptions.url) return;

  var self = this;

  // 弹出菊花弹出框
  this.custom(null, function () {
    return '<div class="loading">'+ loadingSVG +'</div>';
  }, null);

  // 发送ajax
  fetch(ajaxOptions.url, ajaxOptions.method, ajaxOptions.data, function (resp) {
    // 弹出得到内容的弹出框
    self._switch(null, function () { return options.content(resp) }, null, 'success');
  }, function (errMsg) {
    self._switch(null, errMsg, null, 'warning');
  });
};

Dialog.prototype._createFooterContent = function (buttons, type) {
  var self = this;
  var text, events, btn;

  self.el.footer.empty();

  $.each(buttons, function (idx, button) {
    text = button.text || (!idx ? '确定' : '取消');
    type = button.type || (!idx ? type : void 0)
    events = $.proxy(button.events || function () { this.remove(); }, self);
    btn = $('<a href="javascript:;" class="'+ prefixBtn +' '+ prefix + splitter + 'button' + splitter + (type || 'default') +'">'+ text +'</a>').bind('click', events).appendTo(self.el.footer);
  });

  return self;
};

/**
 * 从一种状态(alert|confirm)切换成(confirm|alert)状态等
 * 其实就是将对话框里的title、body、footer替换内容
 */
Dialog.prototype._switch = function (title, content, buttons, type) {
  var options = {
    title: title || '',
    content: content || '',
    buttons: buttons || [{}]
  };
  type || (type = 'remind');

  if (this.el && this.display) {
    this.el.title.html(options.title);
    this.el.body.html($.isFunction(options.content) ? options.content() : options.content);
    this._createFooterContent(options.buttons, type)._show();
  }

  return this;
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
  if (this.el && !this.display) {
    this.el.dialog.addClass(prefix + splitter + 'animation');
    this._scroll();
    this.display = true;
    this.callbacks.onShow.call(this, this.el.container);
    this.el.container.css('display', 'block');
  }
};

Dialog.prototype.remove = function () {
  if (this.el && this.display) {
    this._scroll();
    this.display = false;
    this.callbacks.onRemove.call(this, this.el.container);
    this.el.container.remove();
    delete this.el;
  }

  return this;
};

return Dialog;
}, jQuery, fetch);
