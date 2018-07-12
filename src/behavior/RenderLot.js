/**
 * @RenderLot.js
 * @des 渲染大量数据
 * @author zengwenbin
 * @date 18-7-11
 * @Created
 */

(function (root, factory, $) {
  if (typeof define !== 'undefined' && define.amd) {
    define([ 'jQuery' ], function ($) {
      return factory($);
    });
  } else {
    root.RenderLot = factory($);
  }
})(this, function ($) {
  /*
    解决下拉滚动条时候，由于产生重排、重绘，如果有很多元素，那么gpu渲染不过来，导致卡顿
    所以建议只渲染渲染可见部分，不可见部分隐藏
  */
  var RenderLot = function (options) {
    var defaults = {
      el: $()
    };
    options = $.extend({}, defaults, options);
    var firstChild = options.el.children().eq(0);
    var marginTop = isNaN(marginTop = parseInt(firstChild.css('marginTop'))) ? 0 : marginTop;
    var marginBottom = isNaN(marginBottom = parseInt(firstChild.css('marginBottom'))) ? 0 : marginBottom;
    var delta = firstChild.outerHeight() + marginTop + marginBottom;

    this.el = options.el;
    this.data = {
      delta: delta,
      count: Math.floor(this.el.height() / delta)
    };
    this.state = {
      startIndex: void 0,
      endIndex: void 0
    };

    // 确保el是相对定位
    if (this.el.css('position') !== 'relative') {
      this.el.css('position', 'relative');
    }

    // 绑定滚动事件
    this.el.bind('scroll', $.proxy(this._scroll, this));

    // 隐藏所有el的子元素
    this.el.children().hide();

    // 开始显示第一屏的元素
    this._scroll();
  };

  RenderLot.prototype._scroll = function () {
    var currIndex = Math.floor((this.el.scrollTop() || 0) / this.data.delta);

    $.extend(this.state, {
      startIndex: currIndex,
      endIndex: currIndex + this.data.count
    });

    // 设置元素索引属性和top属性
    // 设置索引属性是为了该索引如果小于startIndex，就证明不在可视区域内，可以隐藏
    // 设置top为了不在可视区域内的元素如果隐藏后，不会造成元素重排，影响体验
    this._configureAreaEls();

    // index prop小于startIndex都视为在不可视区域在外的，应该隐藏
    this._hideAreaEls();
  };

  RenderLot.prototype._configureAreaEls = function () {
    // 每次多渲染1个，为了在下拉出当前屏后的第一个元素不是空白
    for (var i = this.state.startIndex, childrens = this.el.children(), child; i <= this.state.endIndex; i++) {
      child = childrens.eq(i);

      // 确保子元素是绝对定位，否则隐藏时候会抖动，影响体验
      if (child.css('position') !== 'absolute') {
        child.css('position', 'absolute');
      }

      // 如果没有设置top
      if (isNaN(parseInt(child.css('top')))) {
        child.css('top', i * this.data.delta);
      }

      // 如果没有设置index prop
      if (!child.is('[index]')) {
        child.attr('index', i);
      }

      // 如果是隐藏状态，就显示
      if (child.is(':hidden')) {
        child.show();
      }
    }
  };

  RenderLot.prototype._hideAreaEls = function () {
    // 在当前显示的元素中遍历
    var els = this.el.children().filter(':visible');
    var index;

    els.each($.proxy(function (_, el) {
      index = parseInt($(el).attr('index'));

      // index prop小于startIndex都视为在不可视区域在外的并且不是最后一个元素，都应该隐藏
      // 或者是从下往上滚动，因为后面的索引肯定是大于当前索引
      if (index < this.state.startIndex || index > this.state.endIndex) {
        $(el).hide();
      }
    }, this));
  };

  return RenderLot;
}, jQuery);
