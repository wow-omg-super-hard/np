/**
 * @fetch.js
 * @des http请求封装，对请求错误（404，超时、请求数据不规范、断网）、逻辑错误(错误码非0)
 * @author zengwenbin
 * @date 18-7-9
 * @Created
 */

(function (root, factory, $) {
  if (typeof define !== 'undefined' && define.amd) {
    define([ 'jQuery' ], function ($) {
      return factory($);
    });
  } else {
    root.fetch = factory($);
  }
})(this, function ($) {
  return function (url, method, data, success, error) {
    // 初始化错误弹出框
    var ajaxParams = {
      url: url,
      type: method ? method.toUpperCase() : 'GET',
      dataType: 'JSON',
      data: data,
      timeout: 30000,
      contentType: 'application/json',
      success: function (resp) {
        if (resp.errCode) {
          error && error(resp.errMsg);
          return;
        }

        success(resp);
      },
      error: function (xhr, status) {
        // 请求错误统一处理
        // 包括 '404'、'超时'、'请求数据不规范'、'断网'
        var errSubject = '<p>对不起，您刚才的操作有误</p>', errReason;

        // 404
        if (status === 'error') {
          errReason = '<p>可能是数据请求地址错误，一般是开发人员没有考虑周全，欢迎反馈给我们</p>';
        }
        // 超时
        else if (status === 'timeout') {
          errReason = '<p>由于请求时间过长，导致数据没能请求成功，这一般是因为网速过慢导致，您可以稍后重试</p>';
        }
        // 请求数据不规范
        else if (status === 'parsererror') {
          errReason = '<p>请求数据不规范，一般是开发人员没有考虑周全，欢迎反馈给我们</p>';
        }
        // 断网
        else {
          errReason = '<p>可能是断网，您稍后再试，多试几次后若情况不变，欢迎反馈给我们</p>';
        }

        error && error(errSubject + errReason);
      }
    };

    $.ajax(ajaxParams);
  }
}, jQuery);
