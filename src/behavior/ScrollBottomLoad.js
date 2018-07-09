/**
 * @ScrollBottomLoad.js
 * @des 滚动到底部加载数据 针对组件化的`可复用`、`可扩展`等特点，抽离出可变的交互
 * @author zengwenbin
 * @version 1.0
 * @Created
 */

(function (root, factory, $, throttle, fetch) {
  if (typeof define !== 'undefined' && define.amd) {
    define([ 'jQuery', 'throttle', 'fetch' ], function ($, throttle, fetch) {
      return factory($, throttle, fetch);
    });
  } else {
    root.ScrollBottomLoad = factory($, throttle, fetch);
  }
})(this, function ($, throttle, fetch) {
  var ScrollBottomLoad = function (options) {
    // 公共属性
    var defaults = {
      // 绑定滚动事件的元素
      el: $(),
      // 距离底部多少像素触发调用回调
      awayBottom: 0,
      // 回调
      onScrollToBottom: $.noop,
      // 每页多少条
      pageSize: 2,
      // 请求地址
      url: '',
      // 请求方法
      method: 'GET',
      // 请求数据
      data: void 0
    };
    var params = $.extend({}, defaults, options);

    this.el = params.el;
    this.data = {
      awayBottom: params.awayBottom,
      pageSize: params.pageSize,
      url: params.url,
      method: params.method,
      data: params.data
    };
    this.callbacks = {
      onScrollToBottom: params.onScrollToBottom
    };
    this.loadingEl = $('<div class="loading">加载中...</div>');
    // 滚动组件状态
    this.state = {
      // 请求
      fetch: false,
      // 是否请求完成
      complete: false,
      // 当前页，从1开始
      currPage: 1
    };

    // 设置元素支持滚动的基本样式
    this.el.addClass('ui-scrollload-action');

    if (!/absolute|relative|fixed/i.test(this.el.css('position'))) {
      this.el.addClass('pos');
    }

    // 添加loading元素
    this.el.append(this.loadingEl);

    // 绑定el滚动事件
    // 节流的形式处理scroll回调，避免频繁调用，损耗性能
    this.el.bind('scroll', throttle(this._scroll.bind(this, this.data.url, this.data.method, this.data.data, this.callbacks.onScrollToBottom), 300));

    this._scroll(this.data.url);
  };

  ScrollBottomLoad.prototype._loading = function () {
    if (!this.state.fetch) {
      this.state.fetch = true;
      this.loadingEl.show();
    }
  };

  ScrollBottomLoad.prototype._unloading = function () {
    if (this.state.fetch) {
      this.state.fetch = false;
      this.loadingEl.hide();
    }
  };

  // 发送ajax，数据编码采用json
  ScrollBottomLoad.prototype._ajax = function () {
    var self = this;

    // 必须强制输入url，否则ajax也没有意义
    if (!self.data.url) return self;

    // 如果还剩数据，那么就允许滚动
    if (!self.state.complete) {
      data = $.extend({}, { currPage: self.state.currPage, pageSize: self.data.pageSize }, self.data.data);
      // 添加请求状态
      self._loading();

      // 请求数据
      fetch(self.data.url, this.data.method, data, function (resp) {
        // 清除请求状态
        self._unloading();

        // 如果没有数据了
        if (!resp.data.list.length) {
          self.state.complete = true;
        }
        // 有数据，那么当前页 +1
        else {
          self.state.currPage++;
        }

        self.callbacks.onScrollToBottom.call(self.el, self.el, resp.data.list);
      }, function () {
        // 清除请求状态
        self._unloading();
        this.state.complete = true;
      });
    }
  };

  ScrollBottomLoad.prototype._checkIsBottom = function () {
    var innerHeight = this.el.innerHeight();
    var scrollTop = this.el.scrollTop();
    var scrollHeight = this.el[0].scrollHeight;

    return innerHeight + scrollTop + this.data.awayBottom >= scrollHeight;
  };

  ScrollBottomLoad.prototype._scroll = function () {
    // 检测是否滚动到对应的位置
    if (this._checkIsBottom()) {
      this._ajax();
    }
  };

  return ScrollBottomLoad;
}, jQuery, throttle, fetch);
