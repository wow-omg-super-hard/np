/**
 * @throttle.js
 * @des 函数节流，指定的时间内执行函数，其他时间内禁止执行
 * @author zengwenbin
 * @date 18-7-9
 * @Created
 */

(function (root, factory) {
  if (typeof define !== 'undefined' && define.amd) {
    define(function () {
      return factory();
    });
  } else {
    root.throttle = factory();
  }
})(this, function () {
  function throttle (cb, wait) {
    var isInvoke = true;
    var timer;

    return function () {
      var args = Array.prototype.slice.call(arguments, 0);
      var self = this;

      if (isInvoke) {
        isInvoke = false;
        timer = setTimeout(function () {
          clearTimeout(timer);
          isInvoke = true;
          cb.apply(self, args);
        });
      }
    }
  }

  return throttle;
});
