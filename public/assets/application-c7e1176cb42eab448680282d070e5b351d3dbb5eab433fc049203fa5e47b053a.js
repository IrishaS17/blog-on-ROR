/*
Unobtrusive JavaScript
https://github.com/rails/rails/blob/master/actionview/app/assets/javascripts
Released under the MIT license
 */


;

(function() {
  (function() {
    (function() {
      this.Rails = {
        linkClickSelector: 'a[data-confirm], a[data-method], a[data-remote]:not([disabled]), a[data-disable-with], a[data-disable]',
        buttonClickSelector: {
          selector: 'button[data-remote]:not([form]), button[data-confirm]:not([form])',
          exclude: 'form button'
        },
        inputChangeSelector: 'select[data-remote], input[data-remote], textarea[data-remote]',
        formSubmitSelector: 'form',
        formInputClickSelector: 'form input[type=submit], form input[type=image], form button[type=submit], form button:not([type]), input[type=submit][form], input[type=image][form], button[type=submit][form], button[form]:not([type])',
        formDisableSelector: 'input[data-disable-with]:enabled, button[data-disable-with]:enabled, textarea[data-disable-with]:enabled, input[data-disable]:enabled, button[data-disable]:enabled, textarea[data-disable]:enabled',
        formEnableSelector: 'input[data-disable-with]:disabled, button[data-disable-with]:disabled, textarea[data-disable-with]:disabled, input[data-disable]:disabled, button[data-disable]:disabled, textarea[data-disable]:disabled',
        fileInputSelector: 'input[name][type=file]:not([disabled])',
        linkDisableSelector: 'a[data-disable-with], a[data-disable]',
        buttonDisableSelector: 'button[data-remote][data-disable-with], button[data-remote][data-disable]'
      };

    }).call(this);
  }).call(this);

  var Rails = this.Rails;

  (function() {
    (function() {
      var expando, m;

      m = Element.prototype.matches || Element.prototype.matchesSelector || Element.prototype.mozMatchesSelector || Element.prototype.msMatchesSelector || Element.prototype.oMatchesSelector || Element.prototype.webkitMatchesSelector;

      Rails.matches = function(element, selector) {
        if (selector.exclude != null) {
          return m.call(element, selector.selector) && !m.call(element, selector.exclude);
        } else {
          return m.call(element, selector);
        }
      };

      expando = '_ujsData';

      Rails.getData = function(element, key) {
        var ref;
        return (ref = element[expando]) != null ? ref[key] : void 0;
      };

      Rails.setData = function(element, key, value) {
        if (element[expando] == null) {
          element[expando] = {};
        }
        return element[expando][key] = value;
      };

      Rails.$ = function(selector) {
        return Array.prototype.slice.call(document.querySelectorAll(selector));
      };

    }).call(this);
    (function() {
      var $, csrfParam, csrfToken;

      $ = Rails.$;

      csrfToken = Rails.csrfToken = function() {
        var meta;
        meta = document.querySelector('meta[name=csrf-token]');
        return meta && meta.content;
      };

      csrfParam = Rails.csrfParam = function() {
        var meta;
        meta = document.querySelector('meta[name=csrf-param]');
        return meta && meta.content;
      };

      Rails.CSRFProtection = function(xhr) {
        var token;
        token = csrfToken();
        if (token != null) {
          return xhr.setRequestHeader('X-CSRF-Token', token);
        }
      };

      Rails.refreshCSRFTokens = function() {
        var param, token;
        token = csrfToken();
        param = csrfParam();
        if ((token != null) && (param != null)) {
          return $('form input[name="' + param + '"]').forEach(function(input) {
            return input.value = token;
          });
        }
      };

    }).call(this);
    (function() {
      var CustomEvent, fire, matches;

      matches = Rails.matches;

      CustomEvent = window.CustomEvent;

      if (typeof CustomEvent !== 'function') {
        CustomEvent = function(event, params) {
          var evt;
          evt = document.createEvent('CustomEvent');
          evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
          return evt;
        };
        CustomEvent.prototype = window.Event.prototype;
      }

      fire = Rails.fire = function(obj, name, data) {
        var event;
        event = new CustomEvent(name, {
          bubbles: true,
          cancelable: true,
          detail: data
        });
        obj.dispatchEvent(event);
        return !event.defaultPrevented;
      };

      Rails.stopEverything = function(e) {
        fire(e.target, 'ujs:everythingStopped');
        e.preventDefault();
        e.stopPropagation();
        return e.stopImmediatePropagation();
      };

      Rails.delegate = function(element, selector, eventType, handler) {
        return element.addEventListener(eventType, function(e) {
          var target;
          target = e.target;
          while (!(!(target instanceof Element) || matches(target, selector))) {
            target = target.parentNode;
          }
          if (target instanceof Element && handler.call(target, e) === false) {
            e.preventDefault();
            return e.stopPropagation();
          }
        });
      };

    }).call(this);
    (function() {
      var AcceptHeaders, CSRFProtection, createXHR, fire, prepareOptions, processResponse;

      CSRFProtection = Rails.CSRFProtection, fire = Rails.fire;

      AcceptHeaders = {
        '*': '*/*',
        text: 'text/plain',
        html: 'text/html',
        xml: 'application/xml, text/xml',
        json: 'application/json, text/javascript',
        script: 'text/javascript, application/javascript, application/ecmascript, application/x-ecmascript'
      };

      Rails.ajax = function(options) {
        var xhr;
        options = prepareOptions(options);
        xhr = createXHR(options, function() {
          var response;
          response = processResponse(xhr.response, xhr.getResponseHeader('Content-Type'));
          if (Math.floor(xhr.status / 100) === 2) {
            if (typeof options.success === "function") {
              options.success(response, xhr.statusText, xhr);
            }
          } else {
            if (typeof options.error === "function") {
              options.error(response, xhr.statusText, xhr);
            }
          }
          return typeof options.complete === "function" ? options.complete(xhr, xhr.statusText) : void 0;
        });
        if (typeof options.beforeSend === "function") {
          options.beforeSend(xhr, options);
        }
        if (xhr.readyState === XMLHttpRequest.OPENED) {
          return xhr.send(options.data);
        } else {
          return fire(document, 'ajaxStop');
        }
      };

      prepareOptions = function(options) {
        options.url = options.url || location.href;
        options.type = options.type.toUpperCase();
        if (options.type === 'GET' && options.data) {
          if (options.url.indexOf('?') < 0) {
            options.url += '?' + options.data;
          } else {
            options.url += '&' + options.data;
          }
        }
        if (AcceptHeaders[options.dataType] == null) {
          options.dataType = '*';
        }
        options.accept = AcceptHeaders[options.dataType];
        if (options.dataType !== '*') {
          options.accept += ', */*; q=0.01';
        }
        return options;
      };

      createXHR = function(options, done) {
        var xhr;
        xhr = new XMLHttpRequest();
        xhr.open(options.type, options.url, true);
        xhr.setRequestHeader('Accept', options.accept);
        if (typeof options.data === 'string') {
          xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
        }
        if (!options.crossDomain) {
          xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        }
        CSRFProtection(xhr);
        xhr.withCredentials = !!options.withCredentials;
        xhr.onreadystatechange = function() {
          if (xhr.readyState === XMLHttpRequest.DONE) {
            return done(xhr);
          }
        };
        return xhr;
      };

      processResponse = function(response, type) {
        var parser, script;
        if (typeof response === 'string' && typeof type === 'string') {
          if (type.match(/\bjson\b/)) {
            try {
              response = JSON.parse(response);
            } catch (error) {}
          } else if (type.match(/\b(?:java|ecma)script\b/)) {
            script = document.createElement('script');
            script.text = response;
            document.head.appendChild(script).parentNode.removeChild(script);
          } else if (type.match(/\b(xml|html|svg)\b/)) {
            parser = new DOMParser();
            type = type.replace(/;.+/, '');
            try {
              response = parser.parseFromString(response, type);
            } catch (error) {}
          }
        }
        return response;
      };

      Rails.href = function(element) {
        return element.href;
      };

      Rails.isCrossDomain = function(url) {
        var e, originAnchor, urlAnchor;
        originAnchor = document.createElement('a');
        originAnchor.href = location.href;
        urlAnchor = document.createElement('a');
        try {
          urlAnchor.href = url;
          return !(((!urlAnchor.protocol || urlAnchor.protocol === ':') && !urlAnchor.host) || (originAnchor.protocol + '//' + originAnchor.host === urlAnchor.protocol + '//' + urlAnchor.host));
        } catch (error) {
          e = error;
          return true;
        }
      };

    }).call(this);
    (function() {
      var matches, toArray;

      matches = Rails.matches;

      toArray = function(e) {
        return Array.prototype.slice.call(e);
      };

      Rails.serializeElement = function(element, additionalParam) {
        var inputs, params;
        inputs = [element];
        if (matches(element, 'form')) {
          inputs = toArray(element.elements);
        }
        params = [];
        inputs.forEach(function(input) {
          if (!input.name) {
            return;
          }
          if (matches(input, 'select')) {
            return toArray(input.options).forEach(function(option) {
              if (option.selected) {
                return params.push({
                  name: input.name,
                  value: option.value
                });
              }
            });
          } else if (input.checked || ['radio', 'checkbox', 'submit'].indexOf(input.type) === -1) {
            return params.push({
              name: input.name,
              value: input.value
            });
          }
        });
        if (additionalParam) {
          params.push(additionalParam);
        }
        return params.map(function(param) {
          if (param.name != null) {
            return (encodeURIComponent(param.name)) + "=" + (encodeURIComponent(param.value));
          } else {
            return param;
          }
        }).join('&');
      };

      Rails.formElements = function(form, selector) {
        if (matches(form, 'form')) {
          return toArray(form.elements).filter(function(el) {
            return matches(el, selector);
          });
        } else {
          return toArray(form.querySelectorAll(selector));
        }
      };

    }).call(this);
    (function() {
      var allowAction, fire, stopEverything;

      fire = Rails.fire, stopEverything = Rails.stopEverything;

      Rails.handleConfirm = function(e) {
        if (!allowAction(this)) {
          return stopEverything(e);
        }
      };

      allowAction = function(element) {
        var answer, callback, message;
        message = element.getAttribute('data-confirm');
        if (!message) {
          return true;
        }
        answer = false;
        if (fire(element, 'confirm')) {
          try {
            answer = confirm(message);
          } catch (error) {}
          callback = fire(element, 'confirm:complete', [answer]);
        }
        return answer && callback;
      };

    }).call(this);
    (function() {
      var disableFormElement, disableFormElements, disableLinkElement, enableFormElement, enableFormElements, enableLinkElement, formElements, getData, matches, setData, stopEverything;

      matches = Rails.matches, getData = Rails.getData, setData = Rails.setData, stopEverything = Rails.stopEverything, formElements = Rails.formElements;

      Rails.handleDisabledElement = function(e) {
        var element;
        element = this;
        if (element.disabled) {
          return stopEverything(e);
        }
      };

      Rails.enableElement = function(e) {
        var element;
        element = e instanceof Event ? e.target : e;
        if (matches(element, Rails.linkDisableSelector)) {
          return enableLinkElement(element);
        } else if (matches(element, Rails.buttonDisableSelector) || matches(element, Rails.formEnableSelector)) {
          return enableFormElement(element);
        } else if (matches(element, Rails.formSubmitSelector)) {
          return enableFormElements(element);
        }
      };

      Rails.disableElement = function(e) {
        var element;
        element = e instanceof Event ? e.target : e;
        if (matches(element, Rails.linkDisableSelector)) {
          return disableLinkElement(element);
        } else if (matches(element, Rails.buttonDisableSelector) || matches(element, Rails.formDisableSelector)) {
          return disableFormElement(element);
        } else if (matches(element, Rails.formSubmitSelector)) {
          return disableFormElements(element);
        }
      };

      disableLinkElement = function(element) {
        var replacement;
        replacement = element.getAttribute('data-disable-with');
        if (replacement != null) {
          setData(element, 'ujs:enable-with', element.innerHTML);
          element.innerHTML = replacement;
        }
        element.addEventListener('click', stopEverything);
        return setData(element, 'ujs:disabled', true);
      };

      enableLinkElement = function(element) {
        var originalText;
        originalText = getData(element, 'ujs:enable-with');
        if (originalText != null) {
          element.innerHTML = originalText;
          setData(element, 'ujs:enable-with', null);
        }
        element.removeEventListener('click', stopEverything);
        return setData(element, 'ujs:disabled', null);
      };

      disableFormElements = function(form) {
        return formElements(form, Rails.formDisableSelector).forEach(disableFormElement);
      };

      disableFormElement = function(element) {
        var replacement;
        replacement = element.getAttribute('data-disable-with');
        if (replacement != null) {
          if (matches(element, 'button')) {
            setData(element, 'ujs:enable-with', element.innerHTML);
            element.innerHTML = replacement;
          } else {
            setData(element, 'ujs:enable-with', element.value);
            element.value = replacement;
          }
        }
        element.disabled = true;
        return setData(element, 'ujs:disabled', true);
      };

      enableFormElements = function(form) {
        return formElements(form, Rails.formEnableSelector).forEach(enableFormElement);
      };

      enableFormElement = function(element) {
        var originalText;
        originalText = getData(element, 'ujs:enable-with');
        if (originalText != null) {
          if (matches(element, 'button')) {
            element.innerHTML = originalText;
          } else {
            element.value = originalText;
          }
          setData(element, 'ujs:enable-with', null);
        }
        element.disabled = false;
        return setData(element, 'ujs:disabled', null);
      };

    }).call(this);
    (function() {
      var stopEverything;

      stopEverything = Rails.stopEverything;

      Rails.handleMethod = function(e) {
        var csrfParam, csrfToken, form, formContent, href, link, method;
        link = this;
        method = link.getAttribute('data-method');
        if (!method) {
          return;
        }
        href = Rails.href(link);
        csrfToken = Rails.csrfToken();
        csrfParam = Rails.csrfParam();
        form = document.createElement('form');
        formContent = "<input name='_method' value='" + method + "' type='hidden' />";
        if ((csrfParam != null) && (csrfToken != null) && !Rails.isCrossDomain(href)) {
          formContent += "<input name='" + csrfParam + "' value='" + csrfToken + "' type='hidden' />";
        }
        formContent += '<input type="submit" />';
        form.method = 'post';
        form.action = href;
        form.target = link.target;
        form.innerHTML = formContent;
        form.style.display = 'none';
        document.body.appendChild(form);
        form.querySelector('[type="submit"]').click();
        return stopEverything(e);
      };

    }).call(this);
    (function() {
      var ajax, fire, getData, isCrossDomain, isRemote, matches, serializeElement, setData, stopEverything,
        slice = [].slice;

      matches = Rails.matches, getData = Rails.getData, setData = Rails.setData, fire = Rails.fire, stopEverything = Rails.stopEverything, ajax = Rails.ajax, isCrossDomain = Rails.isCrossDomain, serializeElement = Rails.serializeElement;

      isRemote = function(element) {
        var value;
        value = element.getAttribute('data-remote');
        return (value != null) && value !== 'false';
      };

      Rails.handleRemote = function(e) {
        var button, data, dataType, element, method, url, withCredentials;
        element = this;
        if (!isRemote(element)) {
          return true;
        }
        if (!fire(element, 'ajax:before')) {
          fire(element, 'ajax:stopped');
          return false;
        }
        withCredentials = element.getAttribute('data-with-credentials');
        dataType = element.getAttribute('data-type') || 'script';
        if (matches(element, Rails.formSubmitSelector)) {
          button = getData(element, 'ujs:submit-button');
          method = getData(element, 'ujs:submit-button-formmethod') || element.method;
          url = getData(element, 'ujs:submit-button-formaction') || element.getAttribute('action') || location.href;
          if (method.toUpperCase() === 'GET') {
            url = url.replace(/\?.*$/, '');
          }
          if (element.enctype === 'multipart/form-data') {
            data = new FormData(element);
            if (button != null) {
              data.append(button.name, button.value);
            }
          } else {
            data = serializeElement(element, button);
          }
          setData(element, 'ujs:submit-button', null);
          setData(element, 'ujs:submit-button-formmethod', null);
          setData(element, 'ujs:submit-button-formaction', null);
        } else if (matches(element, Rails.buttonClickSelector) || matches(element, Rails.inputChangeSelector)) {
          method = element.getAttribute('data-method');
          url = element.getAttribute('data-url');
          data = serializeElement(element, element.getAttribute('data-params'));
        } else {
          method = element.getAttribute('data-method');
          url = Rails.href(element);
          data = element.getAttribute('data-params');
        }
        ajax({
          type: method || 'GET',
          url: url,
          data: data,
          dataType: dataType,
          beforeSend: function(xhr, options) {
            if (fire(element, 'ajax:beforeSend', [xhr, options])) {
              return fire(element, 'ajax:send', [xhr]);
            } else {
              fire(element, 'ajax:stopped');
              return xhr.abort();
            }
          },
          success: function() {
            var args;
            args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
            return fire(element, 'ajax:success', args);
          },
          error: function() {
            var args;
            args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
            return fire(element, 'ajax:error', args);
          },
          complete: function() {
            var args;
            args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
            return fire(element, 'ajax:complete', args);
          },
          crossDomain: isCrossDomain(url),
          withCredentials: (withCredentials != null) && withCredentials !== 'false'
        });
        return stopEverything(e);
      };

      Rails.formSubmitButtonClick = function(e) {
        var button, form;
        button = this;
        form = button.form;
        if (!form) {
          return;
        }
        if (button.name) {
          setData(form, 'ujs:submit-button', {
            name: button.name,
            value: button.value
          });
        }
        setData(form, 'ujs:formnovalidate-button', button.formNoValidate);
        setData(form, 'ujs:submit-button-formaction', button.getAttribute('formaction'));
        return setData(form, 'ujs:submit-button-formmethod', button.getAttribute('formmethod'));
      };

      Rails.handleMetaClick = function(e) {
        var data, link, metaClick, method;
        link = this;
        method = (link.getAttribute('data-method') || 'GET').toUpperCase();
        data = link.getAttribute('data-params');
        metaClick = e.metaKey || e.ctrlKey;
        if (metaClick && method === 'GET' && !data) {
          return e.stopImmediatePropagation();
        }
      };

    }).call(this);
    (function() {
      var $, CSRFProtection, delegate, disableElement, enableElement, fire, formSubmitButtonClick, getData, handleConfirm, handleDisabledElement, handleMetaClick, handleMethod, handleRemote, refreshCSRFTokens;

      fire = Rails.fire, delegate = Rails.delegate, getData = Rails.getData, $ = Rails.$, refreshCSRFTokens = Rails.refreshCSRFTokens, CSRFProtection = Rails.CSRFProtection, enableElement = Rails.enableElement, disableElement = Rails.disableElement, handleDisabledElement = Rails.handleDisabledElement, handleConfirm = Rails.handleConfirm, handleRemote = Rails.handleRemote, formSubmitButtonClick = Rails.formSubmitButtonClick, handleMetaClick = Rails.handleMetaClick, handleMethod = Rails.handleMethod;

      if ((typeof jQuery !== "undefined" && jQuery !== null) && (jQuery.ajax != null) && !jQuery.rails) {
        jQuery.rails = Rails;
        jQuery.ajaxPrefilter(function(options, originalOptions, xhr) {
          if (!options.crossDomain) {
            return CSRFProtection(xhr);
          }
        });
      }

      Rails.start = function() {
        if (window._rails_loaded) {
          throw new Error('rails-ujs has already been loaded!');
        }
        window.addEventListener('pageshow', function() {
          $(Rails.formEnableSelector).forEach(function(el) {
            if (getData(el, 'ujs:disabled')) {
              return enableElement(el);
            }
          });
          return $(Rails.linkDisableSelector).forEach(function(el) {
            if (getData(el, 'ujs:disabled')) {
              return enableElement(el);
            }
          });
        });
        delegate(document, Rails.linkDisableSelector, 'ajax:complete', enableElement);
        delegate(document, Rails.linkDisableSelector, 'ajax:stopped', enableElement);
        delegate(document, Rails.buttonDisableSelector, 'ajax:complete', enableElement);
        delegate(document, Rails.buttonDisableSelector, 'ajax:stopped', enableElement);
        delegate(document, Rails.linkClickSelector, 'click', handleDisabledElement);
        delegate(document, Rails.linkClickSelector, 'click', handleConfirm);
        delegate(document, Rails.linkClickSelector, 'click', handleMetaClick);
        delegate(document, Rails.linkClickSelector, 'click', disableElement);
        delegate(document, Rails.linkClickSelector, 'click', handleRemote);
        delegate(document, Rails.linkClickSelector, 'click', handleMethod);
        delegate(document, Rails.buttonClickSelector, 'click', handleDisabledElement);
        delegate(document, Rails.buttonClickSelector, 'click', handleConfirm);
        delegate(document, Rails.buttonClickSelector, 'click', disableElement);
        delegate(document, Rails.buttonClickSelector, 'click', handleRemote);
        delegate(document, Rails.inputChangeSelector, 'change', handleDisabledElement);
        delegate(document, Rails.inputChangeSelector, 'change', handleConfirm);
        delegate(document, Rails.inputChangeSelector, 'change', handleRemote);
        delegate(document, Rails.formSubmitSelector, 'submit', handleDisabledElement);
        delegate(document, Rails.formSubmitSelector, 'submit', handleConfirm);
        delegate(document, Rails.formSubmitSelector, 'submit', handleRemote);
        delegate(document, Rails.formSubmitSelector, 'submit', function(e) {
          return setTimeout((function() {
            return disableElement(e);
          }), 13);
        });
        delegate(document, Rails.formSubmitSelector, 'ajax:send', disableElement);
        delegate(document, Rails.formSubmitSelector, 'ajax:complete', enableElement);
        delegate(document, Rails.formInputClickSelector, 'click', handleDisabledElement);
        delegate(document, Rails.formInputClickSelector, 'click', handleConfirm);
        delegate(document, Rails.formInputClickSelector, 'click', formSubmitButtonClick);
        document.addEventListener('DOMContentLoaded', refreshCSRFTokens);
        return window._rails_loaded = true;
      };

      if (window.Rails === Rails && fire(document, 'rails:attachBindings')) {
        Rails.start();
      }

    }).call(this);
  }).call(this);

  if (typeof module === "object" && module.exports) {
    module.exports = Rails;
  } else if (typeof define === "function" && define.amd) {
    define(Rails);
  }
}).call(this);
/*
Turbolinks 5.0.3
Copyright © 2017 Basecamp, LLC
 */

(function(){(function(){(function(){this.Turbolinks={supported:function(){return null!=window.history.pushState&&null!=window.requestAnimationFrame&&null!=window.addEventListener}(),visit:function(e,r){return t.controller.visit(e,r)},clearCache:function(){return t.controller.clearCache()}}}).call(this)}).call(this);var t=this.Turbolinks;(function(){(function(){var e,r,n=[].slice;t.copyObject=function(t){var e,r,n;r={};for(e in t)n=t[e],r[e]=n;return r},t.closest=function(t,r){return e.call(t,r)},e=function(){var t,e;return t=document.documentElement,null!=(e=t.closest)?e:function(t){var e;for(e=this;e;){if(e.nodeType===Node.ELEMENT_NODE&&r.call(e,t))return e;e=e.parentNode}}}(),t.defer=function(t){return setTimeout(t,1)},t.throttle=function(t){var e;return e=null,function(){var r;return r=1<=arguments.length?n.call(arguments,0):[],null!=e?e:e=requestAnimationFrame(function(n){return function(){return e=null,t.apply(n,r)}}(this))}},t.dispatch=function(t,e){var r,n,o,i,s;return i=null!=e?e:{},s=i.target,r=i.cancelable,n=i.data,o=document.createEvent("Events"),o.initEvent(t,!0,r===!0),o.data=null!=n?n:{},(null!=s?s:document).dispatchEvent(o),o},t.match=function(t,e){return r.call(t,e)},r=function(){var t,e,r,n;return t=document.documentElement,null!=(e=null!=(r=null!=(n=t.matchesSelector)?n:t.webkitMatchesSelector)?r:t.msMatchesSelector)?e:t.mozMatchesSelector}(),t.uuid=function(){var t,e,r;for(r="",t=e=1;36>=e;t=++e)r+=9===t||14===t||19===t||24===t?"-":15===t?"4":20===t?(Math.floor(4*Math.random())+8).toString(16):Math.floor(15*Math.random()).toString(16);return r}}).call(this),function(){t.Location=function(){function t(t){var e,r;null==t&&(t=""),r=document.createElement("a"),r.href=t.toString(),this.absoluteURL=r.href,e=r.hash.length,2>e?this.requestURL=this.absoluteURL:(this.requestURL=this.absoluteURL.slice(0,-e),this.anchor=r.hash.slice(1))}var e,r,n,o;return t.wrap=function(t){return t instanceof this?t:new this(t)},t.prototype.getOrigin=function(){return this.absoluteURL.split("/",3).join("/")},t.prototype.getPath=function(){var t,e;return null!=(t=null!=(e=this.absoluteURL.match(/\/\/[^\/]*(\/[^?;]*)/))?e[1]:void 0)?t:"/"},t.prototype.getPathComponents=function(){return this.getPath().split("/").slice(1)},t.prototype.getLastPathComponent=function(){return this.getPathComponents().slice(-1)[0]},t.prototype.getExtension=function(){var t,e;return null!=(t=null!=(e=this.getLastPathComponent().match(/\.[^.]*$/))?e[0]:void 0)?t:""},t.prototype.isHTML=function(){return this.getExtension().match(/^(?:|\.(?:htm|html|xhtml))$/)},t.prototype.isPrefixedBy=function(t){var e;return e=r(t),this.isEqualTo(t)||o(this.absoluteURL,e)},t.prototype.isEqualTo=function(t){return this.absoluteURL===(null!=t?t.absoluteURL:void 0)},t.prototype.toCacheKey=function(){return this.requestURL},t.prototype.toJSON=function(){return this.absoluteURL},t.prototype.toString=function(){return this.absoluteURL},t.prototype.valueOf=function(){return this.absoluteURL},r=function(t){return e(t.getOrigin()+t.getPath())},e=function(t){return n(t,"/")?t:t+"/"},o=function(t,e){return t.slice(0,e.length)===e},n=function(t,e){return t.slice(-e.length)===e},t}()}.call(this),function(){var e=function(t,e){return function(){return t.apply(e,arguments)}};t.HttpRequest=function(){function r(r,n,o){this.delegate=r,this.requestCanceled=e(this.requestCanceled,this),this.requestTimedOut=e(this.requestTimedOut,this),this.requestFailed=e(this.requestFailed,this),this.requestLoaded=e(this.requestLoaded,this),this.requestProgressed=e(this.requestProgressed,this),this.url=t.Location.wrap(n).requestURL,this.referrer=t.Location.wrap(o).absoluteURL,this.createXHR()}return r.NETWORK_FAILURE=0,r.TIMEOUT_FAILURE=-1,r.timeout=60,r.prototype.send=function(){var t;return this.xhr&&!this.sent?(this.notifyApplicationBeforeRequestStart(),this.setProgress(0),this.xhr.send(),this.sent=!0,"function"==typeof(t=this.delegate).requestStarted?t.requestStarted():void 0):void 0},r.prototype.cancel=function(){return this.xhr&&this.sent?this.xhr.abort():void 0},r.prototype.requestProgressed=function(t){return t.lengthComputable?this.setProgress(t.loaded/t.total):void 0},r.prototype.requestLoaded=function(){return this.endRequest(function(t){return function(){var e;return 200<=(e=t.xhr.status)&&300>e?t.delegate.requestCompletedWithResponse(t.xhr.responseText,t.xhr.getResponseHeader("Turbolinks-Location")):(t.failed=!0,t.delegate.requestFailedWithStatusCode(t.xhr.status,t.xhr.responseText))}}(this))},r.prototype.requestFailed=function(){return this.endRequest(function(t){return function(){return t.failed=!0,t.delegate.requestFailedWithStatusCode(t.constructor.NETWORK_FAILURE)}}(this))},r.prototype.requestTimedOut=function(){return this.endRequest(function(t){return function(){return t.failed=!0,t.delegate.requestFailedWithStatusCode(t.constructor.TIMEOUT_FAILURE)}}(this))},r.prototype.requestCanceled=function(){return this.endRequest()},r.prototype.notifyApplicationBeforeRequestStart=function(){return t.dispatch("turbolinks:request-start",{data:{url:this.url,xhr:this.xhr}})},r.prototype.notifyApplicationAfterRequestEnd=function(){return t.dispatch("turbolinks:request-end",{data:{url:this.url,xhr:this.xhr}})},r.prototype.createXHR=function(){return this.xhr=new XMLHttpRequest,this.xhr.open("GET",this.url,!0),this.xhr.timeout=1e3*this.constructor.timeout,this.xhr.setRequestHeader("Accept","text/html, application/xhtml+xml"),this.xhr.setRequestHeader("Turbolinks-Referrer",this.referrer),this.xhr.onprogress=this.requestProgressed,this.xhr.onload=this.requestLoaded,this.xhr.onerror=this.requestFailed,this.xhr.ontimeout=this.requestTimedOut,this.xhr.onabort=this.requestCanceled},r.prototype.endRequest=function(t){return this.xhr?(this.notifyApplicationAfterRequestEnd(),null!=t&&t.call(this),this.destroy()):void 0},r.prototype.setProgress=function(t){var e;return this.progress=t,"function"==typeof(e=this.delegate).requestProgressed?e.requestProgressed(this.progress):void 0},r.prototype.destroy=function(){var t;return this.setProgress(1),"function"==typeof(t=this.delegate).requestFinished&&t.requestFinished(),this.delegate=null,this.xhr=null},r}()}.call(this),function(){var e=function(t,e){return function(){return t.apply(e,arguments)}};t.ProgressBar=function(){function t(){this.trickle=e(this.trickle,this),this.stylesheetElement=this.createStylesheetElement(),this.progressElement=this.createProgressElement()}var r;return r=300,t.defaultCSS=".turbolinks-progress-bar {\n  position: fixed;\n  display: block;\n  top: 0;\n  left: 0;\n  height: 3px;\n  background: #0076ff;\n  z-index: 9999;\n  transition: width "+r+"ms ease-out, opacity "+r/2+"ms "+r/2+"ms ease-in;\n  transform: translate3d(0, 0, 0);\n}",t.prototype.show=function(){return this.visible?void 0:(this.visible=!0,this.installStylesheetElement(),this.installProgressElement(),this.startTrickling())},t.prototype.hide=function(){return this.visible&&!this.hiding?(this.hiding=!0,this.fadeProgressElement(function(t){return function(){return t.uninstallProgressElement(),t.stopTrickling(),t.visible=!1,t.hiding=!1}}(this))):void 0},t.prototype.setValue=function(t){return this.value=t,this.refresh()},t.prototype.installStylesheetElement=function(){return document.head.insertBefore(this.stylesheetElement,document.head.firstChild)},t.prototype.installProgressElement=function(){return this.progressElement.style.width=0,this.progressElement.style.opacity=1,document.documentElement.insertBefore(this.progressElement,document.body),this.refresh()},t.prototype.fadeProgressElement=function(t){return this.progressElement.style.opacity=0,setTimeout(t,1.5*r)},t.prototype.uninstallProgressElement=function(){return this.progressElement.parentNode?document.documentElement.removeChild(this.progressElement):void 0},t.prototype.startTrickling=function(){return null!=this.trickleInterval?this.trickleInterval:this.trickleInterval=setInterval(this.trickle,r)},t.prototype.stopTrickling=function(){return clearInterval(this.trickleInterval),this.trickleInterval=null},t.prototype.trickle=function(){return this.setValue(this.value+Math.random()/100)},t.prototype.refresh=function(){return requestAnimationFrame(function(t){return function(){return t.progressElement.style.width=10+90*t.value+"%"}}(this))},t.prototype.createStylesheetElement=function(){var t;return t=document.createElement("style"),t.type="text/css",t.textContent=this.constructor.defaultCSS,t},t.prototype.createProgressElement=function(){var t;return t=document.createElement("div"),t.className="turbolinks-progress-bar",t},t}()}.call(this),function(){var e=function(t,e){return function(){return t.apply(e,arguments)}};t.BrowserAdapter=function(){function r(r){this.controller=r,this.showProgressBar=e(this.showProgressBar,this),this.progressBar=new t.ProgressBar}var n,o,i,s;return s=t.HttpRequest,n=s.NETWORK_FAILURE,i=s.TIMEOUT_FAILURE,o=500,r.prototype.visitProposedToLocationWithAction=function(t,e){return this.controller.startVisitToLocationWithAction(t,e)},r.prototype.visitStarted=function(t){return t.issueRequest(),t.changeHistory(),t.loadCachedSnapshot()},r.prototype.visitRequestStarted=function(t){return this.progressBar.setValue(0),t.hasCachedSnapshot()||"restore"!==t.action?this.showProgressBarAfterDelay():this.showProgressBar()},r.prototype.visitRequestProgressed=function(t){return this.progressBar.setValue(t.progress)},r.prototype.visitRequestCompleted=function(t){return t.loadResponse()},r.prototype.visitRequestFailedWithStatusCode=function(t,e){switch(e){case n:case i:return this.reload();default:return t.loadResponse()}},r.prototype.visitRequestFinished=function(t){return this.hideProgressBar()},r.prototype.visitCompleted=function(t){return t.followRedirect()},r.prototype.pageInvalidated=function(){return this.reload()},r.prototype.showProgressBarAfterDelay=function(){return this.progressBarTimeout=setTimeout(this.showProgressBar,o)},r.prototype.showProgressBar=function(){return this.progressBar.show()},r.prototype.hideProgressBar=function(){return this.progressBar.hide(),clearTimeout(this.progressBarTimeout)},r.prototype.reload=function(){return window.location.reload()},r}()}.call(this),function(){var e=function(t,e){return function(){return t.apply(e,arguments)}};t.History=function(){function r(t){this.delegate=t,this.onPageLoad=e(this.onPageLoad,this),this.onPopState=e(this.onPopState,this)}return r.prototype.start=function(){return this.started?void 0:(addEventListener("popstate",this.onPopState,!1),addEventListener("load",this.onPageLoad,!1),this.started=!0)},r.prototype.stop=function(){return this.started?(removeEventListener("popstate",this.onPopState,!1),removeEventListener("load",this.onPageLoad,!1),this.started=!1):void 0},r.prototype.push=function(e,r){return e=t.Location.wrap(e),this.update("push",e,r)},r.prototype.replace=function(e,r){return e=t.Location.wrap(e),this.update("replace",e,r)},r.prototype.onPopState=function(e){var r,n,o,i;return this.shouldHandlePopState()&&(i=null!=(n=e.state)?n.turbolinks:void 0)?(r=t.Location.wrap(window.location),o=i.restorationIdentifier,this.delegate.historyPoppedToLocationWithRestorationIdentifier(r,o)):void 0},r.prototype.onPageLoad=function(e){return t.defer(function(t){return function(){return t.pageLoaded=!0}}(this))},r.prototype.shouldHandlePopState=function(){return this.pageIsLoaded()},r.prototype.pageIsLoaded=function(){return this.pageLoaded||"complete"===document.readyState},r.prototype.update=function(t,e,r){var n;return n={turbolinks:{restorationIdentifier:r}},history[t+"State"](n,null,e)},r}()}.call(this),function(){t.Snapshot=function(){function e(t){var e,r;r=t.head,e=t.body,this.head=null!=r?r:document.createElement("head"),this.body=null!=e?e:document.createElement("body")}return e.wrap=function(t){return t instanceof this?t:this.fromHTML(t)},e.fromHTML=function(t){var e;return e=document.createElement("html"),e.innerHTML=t,this.fromElement(e)},e.fromElement=function(t){return new this({head:t.querySelector("head"),body:t.querySelector("body")})},e.prototype.clone=function(){return new e({head:this.head.cloneNode(!0),body:this.body.cloneNode(!0)})},e.prototype.getRootLocation=function(){var e,r;return r=null!=(e=this.getSetting("root"))?e:"/",new t.Location(r)},e.prototype.getCacheControlValue=function(){return this.getSetting("cache-control")},e.prototype.hasAnchor=function(t){try{return null!=this.body.querySelector("[id='"+t+"']")}catch(e){}},e.prototype.isPreviewable=function(){return"no-preview"!==this.getCacheControlValue()},e.prototype.isCacheable=function(){return"no-cache"!==this.getCacheControlValue()},e.prototype.getSetting=function(t){var e,r;return r=this.head.querySelectorAll("meta[name='turbolinks-"+t+"']"),e=r[r.length-1],null!=e?e.getAttribute("content"):void 0},e}()}.call(this),function(){var e=[].slice;t.Renderer=function(){function t(){}var r;return t.render=function(){var t,r,n,o;return n=arguments[0],r=arguments[1],t=3<=arguments.length?e.call(arguments,2):[],o=function(t,e,r){r.prototype=t.prototype;var n=new r,o=t.apply(n,e);return Object(o)===o?o:n}(this,t,function(){}),o.delegate=n,o.render(r),o},t.prototype.renderView=function(t){return this.delegate.viewWillRender(this.newBody),t(),this.delegate.viewRendered(this.newBody)},t.prototype.invalidateView=function(){return this.delegate.viewInvalidated()},t.prototype.createScriptElement=function(t){var e;return"false"===t.getAttribute("data-turbolinks-eval")?t:(e=document.createElement("script"),e.textContent=t.textContent,r(e,t),e)},r=function(t,e){var r,n,o,i,s,a,u;for(i=e.attributes,a=[],r=0,n=i.length;n>r;r++)s=i[r],o=s.name,u=s.value,a.push(t.setAttribute(o,u));return a},t}()}.call(this),function(){t.HeadDetails=function(){function t(t){var e,r,i,s,a,u,l;for(this.element=t,this.elements={},l=this.element.childNodes,s=0,u=l.length;u>s;s++)i=l[s],i.nodeType===Node.ELEMENT_NODE&&(a=i.outerHTML,r=null!=(e=this.elements)[a]?e[a]:e[a]={type:o(i),tracked:n(i),elements:[]},r.elements.push(i))}var e,r,n,o;return t.prototype.hasElementWithKey=function(t){return t in this.elements},t.prototype.getTrackedElementSignature=function(){var t,e;return function(){var r,n;r=this.elements,n=[];for(t in r)e=r[t].tracked,e&&n.push(t);return n}.call(this).join("")},t.prototype.getScriptElementsNotInDetails=function(t){return this.getElementsMatchingTypeNotInDetails("script",t)},t.prototype.getStylesheetElementsNotInDetails=function(t){return this.getElementsMatchingTypeNotInDetails("stylesheet",t)},t.prototype.getElementsMatchingTypeNotInDetails=function(t,e){var r,n,o,i,s,a;o=this.elements,s=[];for(n in o)i=o[n],a=i.type,r=i.elements,a!==t||e.hasElementWithKey(n)||s.push(r[0]);return s},t.prototype.getProvisionalElements=function(){var t,e,r,n,o,i,s;r=[],n=this.elements;for(e in n)o=n[e],s=o.type,i=o.tracked,t=o.elements,null!=s||i?t.length>1&&r.push.apply(r,t.slice(1)):r.push.apply(r,t);return r},o=function(t){return e(t)?"script":r(t)?"stylesheet":void 0},n=function(t){return"reload"===t.getAttribute("data-turbolinks-track")},e=function(t){var e;return e=t.tagName.toLowerCase(),"script"===e},r=function(t){var e;return e=t.tagName.toLowerCase(),"style"===e||"link"===e&&"stylesheet"===t.getAttribute("rel")},t}()}.call(this),function(){var e=function(t,e){function n(){this.constructor=t}for(var o in e)r.call(e,o)&&(t[o]=e[o]);return n.prototype=e.prototype,t.prototype=new n,t.__super__=e.prototype,t},r={}.hasOwnProperty;t.SnapshotRenderer=function(r){function n(e,r){this.currentSnapshot=e,this.newSnapshot=r,this.currentHeadDetails=new t.HeadDetails(this.currentSnapshot.head),this.newHeadDetails=new t.HeadDetails(this.newSnapshot.head),this.newBody=this.newSnapshot.body}return e(n,r),n.prototype.render=function(t){return this.trackedElementsAreIdentical()?(this.mergeHead(),this.renderView(function(e){return function(){return e.replaceBody(),e.focusFirstAutofocusableElement(),t()}}(this))):this.invalidateView()},n.prototype.mergeHead=function(){return this.copyNewHeadStylesheetElements(),this.copyNewHeadScriptElements(),this.removeCurrentHeadProvisionalElements(),this.copyNewHeadProvisionalElements()},n.prototype.replaceBody=function(){return this.activateBodyScriptElements(),this.importBodyPermanentElements(),this.assignNewBody()},n.prototype.trackedElementsAreIdentical=function(){return this.currentHeadDetails.getTrackedElementSignature()===this.newHeadDetails.getTrackedElementSignature()},n.prototype.copyNewHeadStylesheetElements=function(){var t,e,r,n,o;for(n=this.getNewHeadStylesheetElements(),o=[],e=0,r=n.length;r>e;e++)t=n[e],o.push(document.head.appendChild(t));return o},n.prototype.copyNewHeadScriptElements=function(){var t,e,r,n,o;for(n=this.getNewHeadScriptElements(),o=[],e=0,r=n.length;r>e;e++)t=n[e],o.push(document.head.appendChild(this.createScriptElement(t)));return o},n.prototype.removeCurrentHeadProvisionalElements=function(){var t,e,r,n,o;for(n=this.getCurrentHeadProvisionalElements(),o=[],e=0,r=n.length;r>e;e++)t=n[e],o.push(document.head.removeChild(t));return o},n.prototype.copyNewHeadProvisionalElements=function(){var t,e,r,n,o;for(n=this.getNewHeadProvisionalElements(),o=[],e=0,r=n.length;r>e;e++)t=n[e],o.push(document.head.appendChild(t));return o},n.prototype.importBodyPermanentElements=function(){var t,e,r,n,o,i;for(n=this.getNewBodyPermanentElements(),i=[],e=0,r=n.length;r>e;e++)o=n[e],(t=this.findCurrentBodyPermanentElement(o))?i.push(o.parentNode.replaceChild(t,o)):i.push(void 0);return i},n.prototype.activateBodyScriptElements=function(){var t,e,r,n,o,i;for(n=this.getNewBodyScriptElements(),i=[],e=0,r=n.length;r>e;e++)o=n[e],t=this.createScriptElement(o),i.push(o.parentNode.replaceChild(t,o));return i},n.prototype.assignNewBody=function(){return document.body=this.newBody},n.prototype.focusFirstAutofocusableElement=function(){var t;return null!=(t=this.findFirstAutofocusableElement())?t.focus():void 0},n.prototype.getNewHeadStylesheetElements=function(){return this.newHeadDetails.getStylesheetElementsNotInDetails(this.currentHeadDetails)},n.prototype.getNewHeadScriptElements=function(){return this.newHeadDetails.getScriptElementsNotInDetails(this.currentHeadDetails)},n.prototype.getCurrentHeadProvisionalElements=function(){return this.currentHeadDetails.getProvisionalElements()},n.prototype.getNewHeadProvisionalElements=function(){return this.newHeadDetails.getProvisionalElements()},n.prototype.getNewBodyPermanentElements=function(){return this.newBody.querySelectorAll("[id][data-turbolinks-permanent]")},n.prototype.findCurrentBodyPermanentElement=function(t){return document.body.querySelector("#"+t.id+"[data-turbolinks-permanent]")},n.prototype.getNewBodyScriptElements=function(){return this.newBody.querySelectorAll("script")},n.prototype.findFirstAutofocusableElement=function(){return document.body.querySelector("[autofocus]")},n}(t.Renderer)}.call(this),function(){var e=function(t,e){function n(){this.constructor=t}for(var o in e)r.call(e,o)&&(t[o]=e[o]);return n.prototype=e.prototype,t.prototype=new n,t.__super__=e.prototype,t},r={}.hasOwnProperty;t.ErrorRenderer=function(t){function r(t){this.html=t}return e(r,t),r.prototype.render=function(t){return this.renderView(function(e){return function(){return e.replaceDocumentHTML(),e.activateBodyScriptElements(),t()}}(this))},r.prototype.replaceDocumentHTML=function(){return document.documentElement.innerHTML=this.html},r.prototype.activateBodyScriptElements=function(){var t,e,r,n,o,i;for(n=this.getScriptElements(),i=[],e=0,r=n.length;r>e;e++)o=n[e],t=this.createScriptElement(o),i.push(o.parentNode.replaceChild(t,o));return i},r.prototype.getScriptElements=function(){return document.documentElement.querySelectorAll("script")},r}(t.Renderer)}.call(this),function(){t.View=function(){function e(t){this.delegate=t,this.element=document.documentElement}return e.prototype.getRootLocation=function(){return this.getSnapshot().getRootLocation()},e.prototype.getSnapshot=function(){return t.Snapshot.fromElement(this.element)},e.prototype.render=function(t,e){var r,n,o;return o=t.snapshot,r=t.error,n=t.isPreview,this.markAsPreview(n),null!=o?this.renderSnapshot(o,e):this.renderError(r,e)},e.prototype.markAsPreview=function(t){return t?this.element.setAttribute("data-turbolinks-preview",""):this.element.removeAttribute("data-turbolinks-preview")},e.prototype.renderSnapshot=function(e,r){return t.SnapshotRenderer.render(this.delegate,r,this.getSnapshot(),t.Snapshot.wrap(e))},e.prototype.renderError=function(e,r){return t.ErrorRenderer.render(this.delegate,r,e)},e}()}.call(this),function(){var e=function(t,e){return function(){return t.apply(e,arguments)}};t.ScrollManager=function(){function r(r){this.delegate=r,this.onScroll=e(this.onScroll,this),this.onScroll=t.throttle(this.onScroll)}return r.prototype.start=function(){return this.started?void 0:(addEventListener("scroll",this.onScroll,!1),this.onScroll(),this.started=!0)},r.prototype.stop=function(){return this.started?(removeEventListener("scroll",this.onScroll,!1),this.started=!1):void 0},r.prototype.scrollToElement=function(t){return t.scrollIntoView()},r.prototype.scrollToPosition=function(t){var e,r;return e=t.x,r=t.y,window.scrollTo(e,r)},r.prototype.onScroll=function(t){return this.updatePosition({x:window.pageXOffset,y:window.pageYOffset})},r.prototype.updatePosition=function(t){var e;return this.position=t,null!=(e=this.delegate)?e.scrollPositionChanged(this.position):void 0},r}()}.call(this),function(){t.SnapshotCache=function(){function e(t){this.size=t,this.keys=[],this.snapshots={}}var r;return e.prototype.has=function(t){var e;return e=r(t),e in this.snapshots},e.prototype.get=function(t){var e;if(this.has(t))return e=this.read(t),this.touch(t),e},e.prototype.put=function(t,e){return this.write(t,e),this.touch(t),e},e.prototype.read=function(t){var e;return e=r(t),this.snapshots[e]},e.prototype.write=function(t,e){var n;return n=r(t),this.snapshots[n]=e},e.prototype.touch=function(t){var e,n;return n=r(t),e=this.keys.indexOf(n),e>-1&&this.keys.splice(e,1),this.keys.unshift(n),this.trim()},e.prototype.trim=function(){var t,e,r,n,o;for(n=this.keys.splice(this.size),o=[],t=0,r=n.length;r>t;t++)e=n[t],o.push(delete this.snapshots[e]);return o},r=function(e){return t.Location.wrap(e).toCacheKey()},e}()}.call(this),function(){var e=function(t,e){return function(){return t.apply(e,arguments)}};t.Visit=function(){function r(r,n,o){this.controller=r,this.action=o,this.performScroll=e(this.performScroll,this),this.identifier=t.uuid(),this.location=t.Location.wrap(n),this.adapter=this.controller.adapter,this.state="initialized",this.timingMetrics={}}var n;return r.prototype.start=function(){return"initialized"===this.state?(this.recordTimingMetric("visitStart"),this.state="started",this.adapter.visitStarted(this)):void 0},r.prototype.cancel=function(){var t;return"started"===this.state?(null!=(t=this.request)&&t.cancel(),this.cancelRender(),this.state="canceled"):void 0},r.prototype.complete=function(){var t;return"started"===this.state?(this.recordTimingMetric("visitEnd"),this.state="completed","function"==typeof(t=this.adapter).visitCompleted&&t.visitCompleted(this),this.controller.visitCompleted(this)):void 0},r.prototype.fail=function(){var t;return"started"===this.state?(this.state="failed","function"==typeof(t=this.adapter).visitFailed?t.visitFailed(this):void 0):void 0},r.prototype.changeHistory=function(){var t,e;return this.historyChanged?void 0:(t=this.location.isEqualTo(this.referrer)?"replace":this.action,e=n(t),this.controller[e](this.location,this.restorationIdentifier),this.historyChanged=!0)},r.prototype.issueRequest=function(){return this.shouldIssueRequest()&&null==this.request?(this.progress=0,this.request=new t.HttpRequest(this,this.location,this.referrer),this.request.send()):void 0},r.prototype.getCachedSnapshot=function(){var t;return!(t=this.controller.getCachedSnapshotForLocation(this.location))||null!=this.location.anchor&&!t.hasAnchor(this.location.anchor)||"restore"!==this.action&&!t.isPreviewable()?void 0:t},r.prototype.hasCachedSnapshot=function(){return null!=this.getCachedSnapshot()},r.prototype.loadCachedSnapshot=function(){var t,e;return(e=this.getCachedSnapshot())?(t=this.shouldIssueRequest(),this.render(function(){var r;return this.cacheSnapshot(),this.controller.render({snapshot:e,isPreview:t},this.performScroll),"function"==typeof(r=this.adapter).visitRendered&&r.visitRendered(this),t?void 0:this.complete()})):void 0},r.prototype.loadResponse=function(){return null!=this.response?this.render(function(){var t,e;return this.cacheSnapshot(),this.request.failed?(this.controller.render({error:this.response},this.performScroll),"function"==typeof(t=this.adapter).visitRendered&&t.visitRendered(this),this.fail()):(this.controller.render({snapshot:this.response},this.performScroll),"function"==typeof(e=this.adapter).visitRendered&&e.visitRendered(this),this.complete())}):void 0},r.prototype.followRedirect=function(){return this.redirectedToLocation&&!this.followedRedirect?(this.location=this.redirectedToLocation,this.controller.replaceHistoryWithLocationAndRestorationIdentifier(this.redirectedToLocation,this.restorationIdentifier),this.followedRedirect=!0):void 0},r.prototype.requestStarted=function(){var t;return this.recordTimingMetric("requestStart"),"function"==typeof(t=this.adapter).visitRequestStarted?t.visitRequestStarted(this):void 0},r.prototype.requestProgressed=function(t){var e;return this.progress=t,"function"==typeof(e=this.adapter).visitRequestProgressed?e.visitRequestProgressed(this):void 0},r.prototype.requestCompletedWithResponse=function(e,r){return this.response=e,null!=r&&(this.redirectedToLocation=t.Location.wrap(r)),this.adapter.visitRequestCompleted(this)},r.prototype.requestFailedWithStatusCode=function(t,e){return this.response=e,this.adapter.visitRequestFailedWithStatusCode(this,t)},r.prototype.requestFinished=function(){var t;return this.recordTimingMetric("requestEnd"),"function"==typeof(t=this.adapter).visitRequestFinished?t.visitRequestFinished(this):void 0},r.prototype.performScroll=function(){return this.scrolled?void 0:("restore"===this.action?this.scrollToRestoredPosition()||this.scrollToTop():this.scrollToAnchor()||this.scrollToTop(),this.scrolled=!0)},r.prototype.scrollToRestoredPosition=function(){var t,e;return t=null!=(e=this.restorationData)?e.scrollPosition:void 0,null!=t?(this.controller.scrollToPosition(t),!0):void 0},r.prototype.scrollToAnchor=function(){return null!=this.location.anchor?(this.controller.scrollToAnchor(this.location.anchor),!0):void 0},r.prototype.scrollToTop=function(){return this.controller.scrollToPosition({x:0,y:0})},r.prototype.recordTimingMetric=function(t){var e;return null!=(e=this.timingMetrics)[t]?e[t]:e[t]=(new Date).getTime()},r.prototype.getTimingMetrics=function(){return t.copyObject(this.timingMetrics)},n=function(t){switch(t){case"replace":return"replaceHistoryWithLocationAndRestorationIdentifier";case"advance":case"restore":return"pushHistoryWithLocationAndRestorationIdentifier"}},r.prototype.shouldIssueRequest=function(){return"restore"===this.action?!this.hasCachedSnapshot():!0},r.prototype.cacheSnapshot=function(){return this.snapshotCached?void 0:(this.controller.cacheSnapshot(),this.snapshotCached=!0)},r.prototype.render=function(t){return this.cancelRender(),this.frame=requestAnimationFrame(function(e){return function(){return e.frame=null,t.call(e)}}(this))},r.prototype.cancelRender=function(){return this.frame?cancelAnimationFrame(this.frame):void 0},r}()}.call(this),function(){var e=function(t,e){return function(){return t.apply(e,arguments)}};t.Controller=function(){function r(){this.clickBubbled=e(this.clickBubbled,this),this.clickCaptured=e(this.clickCaptured,this),this.pageLoaded=e(this.pageLoaded,this),this.history=new t.History(this),this.view=new t.View(this),this.scrollManager=new t.ScrollManager(this),this.restorationData={},this.clearCache()}return r.prototype.start=function(){return t.supported&&!this.started?(addEventListener("click",this.clickCaptured,!0),addEventListener("DOMContentLoaded",this.pageLoaded,!1),this.scrollManager.start(),this.startHistory(),this.started=!0,this.enabled=!0):void 0},r.prototype.disable=function(){return this.enabled=!1},r.prototype.stop=function(){return this.started?(removeEventListener("click",this.clickCaptured,!0),removeEventListener("DOMContentLoaded",this.pageLoaded,!1),this.scrollManager.stop(),this.stopHistory(),this.started=!1):void 0},r.prototype.clearCache=function(){return this.cache=new t.SnapshotCache(10)},r.prototype.visit=function(e,r){var n,o;return null==r&&(r={}),e=t.Location.wrap(e),this.applicationAllowsVisitingLocation(e)?this.locationIsVisitable(e)?(n=null!=(o=r.action)?o:"advance",this.adapter.visitProposedToLocationWithAction(e,n)):window.location=e:void 0},r.prototype.startVisitToLocationWithAction=function(e,r,n){var o;return t.supported?(o=this.getRestorationDataForIdentifier(n),this.startVisit(e,r,{restorationData:o})):window.location=e},r.prototype.startHistory=function(){return this.location=t.Location.wrap(window.location),this.restorationIdentifier=t.uuid(),this.history.start(),this.history.replace(this.location,this.restorationIdentifier)},r.prototype.stopHistory=function(){return this.history.stop()},r.prototype.pushHistoryWithLocationAndRestorationIdentifier=function(e,r){return this.restorationIdentifier=r,this.location=t.Location.wrap(e),this.history.push(this.location,this.restorationIdentifier)},r.prototype.replaceHistoryWithLocationAndRestorationIdentifier=function(e,r){return this.restorationIdentifier=r,this.location=t.Location.wrap(e),this.history.replace(this.location,this.restorationIdentifier)},r.prototype.historyPoppedToLocationWithRestorationIdentifier=function(e,r){var n;return this.restorationIdentifier=r,this.enabled?(n=this.getRestorationDataForIdentifier(this.restorationIdentifier),this.startVisit(e,"restore",{restorationIdentifier:this.restorationIdentifier,restorationData:n,historyChanged:!0}),this.location=t.Location.wrap(e)):this.adapter.pageInvalidated()},r.prototype.getCachedSnapshotForLocation=function(t){var e;return e=this.cache.get(t),e?e.clone():void 0},r.prototype.shouldCacheSnapshot=function(){return this.view.getSnapshot().isCacheable()},r.prototype.cacheSnapshot=function(){var t;return this.shouldCacheSnapshot()?(this.notifyApplicationBeforeCachingSnapshot(),t=this.view.getSnapshot(),this.cache.put(this.lastRenderedLocation,t.clone())):void 0},r.prototype.scrollToAnchor=function(t){var e;return(e=document.getElementById(t))?this.scrollToElement(e):this.scrollToPosition({x:0,y:0})},r.prototype.scrollToElement=function(t){return this.scrollManager.scrollToElement(t)},r.prototype.scrollToPosition=function(t){return this.scrollManager.scrollToPosition(t)},r.prototype.scrollPositionChanged=function(t){var e;return e=this.getCurrentRestorationData(),e.scrollPosition=t},r.prototype.render=function(t,e){return this.view.render(t,e)},r.prototype.viewInvalidated=function(){return this.adapter.pageInvalidated()},r.prototype.viewWillRender=function(t){return this.notifyApplicationBeforeRender(t)},r.prototype.viewRendered=function(){return this.lastRenderedLocation=this.currentVisit.location,this.notifyApplicationAfterRender()},r.prototype.pageLoaded=function(){return this.lastRenderedLocation=this.location,this.notifyApplicationAfterPageLoad()},r.prototype.clickCaptured=function(){return removeEventListener("click",this.clickBubbled,!1),addEventListener("click",this.clickBubbled,!1)},r.prototype.clickBubbled=function(t){var e,r,n;return this.enabled&&this.clickEventIsSignificant(t)&&(r=this.getVisitableLinkForNode(t.target))&&(n=this.getVisitableLocationForLink(r))&&this.applicationAllowsFollowingLinkToLocation(r,n)?(t.preventDefault(),e=this.getActionForLink(r),this.visit(n,{action:e})):void 0},r.prototype.applicationAllowsFollowingLinkToLocation=function(t,e){var r;return r=this.notifyApplicationAfterClickingLinkToLocation(t,e),!r.defaultPrevented},r.prototype.applicationAllowsVisitingLocation=function(t){var e;return e=this.notifyApplicationBeforeVisitingLocation(t),!e.defaultPrevented},r.prototype.notifyApplicationAfterClickingLinkToLocation=function(e,r){return t.dispatch("turbolinks:click",{target:e,data:{url:r.absoluteURL},cancelable:!0})},r.prototype.notifyApplicationBeforeVisitingLocation=function(e){return t.dispatch("turbolinks:before-visit",{data:{url:e.absoluteURL},cancelable:!0})},r.prototype.notifyApplicationAfterVisitingLocation=function(e){return t.dispatch("turbolinks:visit",{data:{url:e.absoluteURL}})},r.prototype.notifyApplicationBeforeCachingSnapshot=function(){return t.dispatch("turbolinks:before-cache")},r.prototype.notifyApplicationBeforeRender=function(e){
return t.dispatch("turbolinks:before-render",{data:{newBody:e}})},r.prototype.notifyApplicationAfterRender=function(){return t.dispatch("turbolinks:render")},r.prototype.notifyApplicationAfterPageLoad=function(e){return null==e&&(e={}),t.dispatch("turbolinks:load",{data:{url:this.location.absoluteURL,timing:e}})},r.prototype.startVisit=function(t,e,r){var n;return null!=(n=this.currentVisit)&&n.cancel(),this.currentVisit=this.createVisit(t,e,r),this.currentVisit.start(),this.notifyApplicationAfterVisitingLocation(t)},r.prototype.createVisit=function(e,r,n){var o,i,s,a,u;return i=null!=n?n:{},a=i.restorationIdentifier,s=i.restorationData,o=i.historyChanged,u=new t.Visit(this,e,r),u.restorationIdentifier=null!=a?a:t.uuid(),u.restorationData=t.copyObject(s),u.historyChanged=o,u.referrer=this.location,u},r.prototype.visitCompleted=function(t){return this.notifyApplicationAfterPageLoad(t.getTimingMetrics())},r.prototype.clickEventIsSignificant=function(t){return!(t.defaultPrevented||t.target.isContentEditable||t.which>1||t.altKey||t.ctrlKey||t.metaKey||t.shiftKey)},r.prototype.getVisitableLinkForNode=function(e){return this.nodeIsVisitable(e)?t.closest(e,"a[href]:not([target]):not([download])"):void 0},r.prototype.getVisitableLocationForLink=function(e){var r;return r=new t.Location(e.getAttribute("href")),this.locationIsVisitable(r)?r:void 0},r.prototype.getActionForLink=function(t){var e;return null!=(e=t.getAttribute("data-turbolinks-action"))?e:"advance"},r.prototype.nodeIsVisitable=function(e){var r;return(r=t.closest(e,"[data-turbolinks]"))?"false"!==r.getAttribute("data-turbolinks"):!0},r.prototype.locationIsVisitable=function(t){return t.isPrefixedBy(this.view.getRootLocation())&&t.isHTML()},r.prototype.getCurrentRestorationData=function(){return this.getRestorationDataForIdentifier(this.restorationIdentifier)},r.prototype.getRestorationDataForIdentifier=function(t){var e;return null!=(e=this.restorationData)[t]?e[t]:e[t]={}},r}()}.call(this),function(){var e,r,n;t.start=function(){return r()?(null==t.controller&&(t.controller=e()),t.controller.start()):void 0},r=function(){return null==window.Turbolinks&&(window.Turbolinks=t),n()},e=function(){var e;return e=new t.Controller,e.adapter=new t.BrowserAdapter(e),e},n=function(){return window.Turbolinks===t},n()&&t.start()}.call(this)}).call(this),"object"==typeof module&&module.exports?module.exports=t:"function"==typeof define&&define.amd&&define(t)}).call(this);
/*
Trix 0.11.0
Copyright © 2017 Basecamp, LLC
http://trix-editor.org/
 */

(function(){}).call(this),function(){var t;null==window.Set&&(window.Set=t=function(){function t(){this.clear()}return t.prototype.clear=function(){return this.values=[]},t.prototype.has=function(t){return-1!==this.values.indexOf(t)},t.prototype.add=function(t){return this.has(t)||this.values.push(t),this},t.prototype["delete"]=function(t){var e;return-1===(e=this.values.indexOf(t))?!1:(this.values.splice(e,1),!0)},t.prototype.forEach=function(){var t;return(t=this.values).forEach.apply(t,arguments)},t}())}.call(this),function(t){function e(){}function n(t,e){return function(){t.apply(e,arguments)}}function i(t){if("object"!=typeof this)throw new TypeError("Promises must be constructed via new");if("function"!=typeof t)throw new TypeError("not a function");this._state=0,this._handled=!1,this._value=void 0,this._deferreds=[],c(t,this)}function o(t,e){for(;3===t._state;)t=t._value;return 0===t._state?void t._deferreds.push(e):(t._handled=!0,void h(function(){var n=1===t._state?e.onFulfilled:e.onRejected;if(null===n)return void(1===t._state?r:s)(e.promise,t._value);var i;try{i=n(t._value)}catch(o){return void s(e.promise,o)}r(e.promise,i)}))}function r(t,e){try{if(e===t)throw new TypeError("A promise cannot be resolved with itself.");if(e&&("object"==typeof e||"function"==typeof e)){var o=e.then;if(e instanceof i)return t._state=3,t._value=e,void a(t);if("function"==typeof o)return void c(n(o,e),t)}t._state=1,t._value=e,a(t)}catch(r){s(t,r)}}function s(t,e){t._state=2,t._value=e,a(t)}function a(t){2===t._state&&0===t._deferreds.length&&setTimeout(function(){t._handled||p(t._value)},1);for(var e=0,n=t._deferreds.length;n>e;e++)o(t,t._deferreds[e]);t._deferreds=null}function u(t,e,n){this.onFulfilled="function"==typeof t?t:null,this.onRejected="function"==typeof e?e:null,this.promise=n}function c(t,e){var n=!1;try{t(function(t){n||(n=!0,r(e,t))},function(t){n||(n=!0,s(e,t))})}catch(i){if(n)return;n=!0,s(e,i)}}var l=setTimeout,h="function"==typeof setImmediate&&setImmediate||function(t){l(t,1)},p=function(t){"undefined"!=typeof console&&console&&console.warn("Possible Unhandled Promise Rejection:",t)};i.prototype["catch"]=function(t){return this.then(null,t)},i.prototype.then=function(t,n){var r=new i(e);return o(this,new u(t,n,r)),r},i.all=function(t){var e=Array.prototype.slice.call(t);return new i(function(t,n){function i(r,s){try{if(s&&("object"==typeof s||"function"==typeof s)){var a=s.then;if("function"==typeof a)return void a.call(s,function(t){i(r,t)},n)}e[r]=s,0===--o&&t(e)}catch(u){n(u)}}if(0===e.length)return t([]);for(var o=e.length,r=0;r<e.length;r++)i(r,e[r])})},i.resolve=function(t){return t&&"object"==typeof t&&t.constructor===i?t:new i(function(e){e(t)})},i.reject=function(t){return new i(function(e,n){n(t)})},i.race=function(t){return new i(function(e,n){for(var i=0,o=t.length;o>i;i++)t[i].then(e,n)})},i._setImmediateFn=function(t){h=t},i._setUnhandledRejectionFn=function(t){p=t},"undefined"!=typeof module&&module.exports?module.exports=i:t.Promise||(t.Promise=i)}(this),/**
 * @license
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */
"undefined"==typeof WeakMap&&!function(){var t=Object.defineProperty,e=Date.now()%1e9,n=function(){this.name="__st"+(1e9*Math.random()>>>0)+(e++ +"__")};n.prototype={set:function(e,n){var i=e[this.name];return i&&i[0]===e?i[1]=n:t(e,this.name,{value:[e,n],writable:!0}),this},get:function(t){var e;return(e=t[this.name])&&e[0]===t?e[1]:void 0},"delete":function(t){var e=t[this.name];return e&&e[0]===t?(e[0]=e[1]=void 0,!0):!1},has:function(t){var e=t[this.name];return e?e[0]===t:!1}},window.WeakMap=n}(),function(t){function e(t){A.push(t),b||(b=!0,g(i))}function n(t){return window.ShadowDOMPolyfill&&window.ShadowDOMPolyfill.wrapIfNeeded(t)||t}function i(){b=!1;var t=A;A=[],t.sort(function(t,e){return t.uid_-e.uid_});var e=!1;t.forEach(function(t){var n=t.takeRecords();o(t),n.length&&(t.callback_(n,t),e=!0)}),e&&i()}function o(t){t.nodes_.forEach(function(e){var n=m.get(e);n&&n.forEach(function(e){e.observer===t&&e.removeTransientObservers()})})}function r(t,e){for(var n=t;n;n=n.parentNode){var i=m.get(n);if(i)for(var o=0;o<i.length;o++){var r=i[o],s=r.options;if(n===t||s.subtree){var a=e(s);a&&r.enqueue(a)}}}}function s(t){this.callback_=t,this.nodes_=[],this.records_=[],this.uid_=++C}function a(t,e){this.type=t,this.target=e,this.addedNodes=[],this.removedNodes=[],this.previousSibling=null,this.nextSibling=null,this.attributeName=null,this.attributeNamespace=null,this.oldValue=null}function u(t){var e=new a(t.type,t.target);return e.addedNodes=t.addedNodes.slice(),e.removedNodes=t.removedNodes.slice(),e.previousSibling=t.previousSibling,e.nextSibling=t.nextSibling,e.attributeName=t.attributeName,e.attributeNamespace=t.attributeNamespace,e.oldValue=t.oldValue,e}function c(t,e){return x=new a(t,e)}function l(t){return w?w:(w=u(x),w.oldValue=t,w)}function h(){x=w=void 0}function p(t){return t===w||t===x}function d(t,e){return t===e?t:w&&p(t)?w:null}function f(t,e,n){this.observer=t,this.target=e,this.options=n,this.transientObservedNodes=[]}if(!t.JsMutationObserver){var g,m=new WeakMap;if(/Trident|Edge/.test(navigator.userAgent))g=setTimeout;else if(window.setImmediate)g=window.setImmediate;else{var y=[],v=String(Math.random());window.addEventListener("message",function(t){if(t.data===v){var e=y;y=[],e.forEach(function(t){t()})}}),g=function(t){y.push(t),window.postMessage(v,"*")}}var b=!1,A=[],C=0;s.prototype={observe:function(t,e){if(t=n(t),!e.childList&&!e.attributes&&!e.characterData||e.attributeOldValue&&!e.attributes||e.attributeFilter&&e.attributeFilter.length&&!e.attributes||e.characterDataOldValue&&!e.characterData)throw new SyntaxError;var i=m.get(t);i||m.set(t,i=[]);for(var o,r=0;r<i.length;r++)if(i[r].observer===this){o=i[r],o.removeListeners(),o.options=e;break}o||(o=new f(this,t,e),i.push(o),this.nodes_.push(t)),o.addListeners()},disconnect:function(){this.nodes_.forEach(function(t){for(var e=m.get(t),n=0;n<e.length;n++){var i=e[n];if(i.observer===this){i.removeListeners(),e.splice(n,1);break}}},this),this.records_=[]},takeRecords:function(){var t=this.records_;return this.records_=[],t}};var x,w;f.prototype={enqueue:function(t){var n=this.observer.records_,i=n.length;if(n.length>0){var o=n[i-1],r=d(o,t);if(r)return void(n[i-1]=r)}else e(this.observer);n[i]=t},addListeners:function(){this.addListeners_(this.target)},addListeners_:function(t){var e=this.options;e.attributes&&t.addEventListener("DOMAttrModified",this,!0),e.characterData&&t.addEventListener("DOMCharacterDataModified",this,!0),e.childList&&t.addEventListener("DOMNodeInserted",this,!0),(e.childList||e.subtree)&&t.addEventListener("DOMNodeRemoved",this,!0)},removeListeners:function(){this.removeListeners_(this.target)},removeListeners_:function(t){var e=this.options;e.attributes&&t.removeEventListener("DOMAttrModified",this,!0),e.characterData&&t.removeEventListener("DOMCharacterDataModified",this,!0),e.childList&&t.removeEventListener("DOMNodeInserted",this,!0),(e.childList||e.subtree)&&t.removeEventListener("DOMNodeRemoved",this,!0)},addTransientObserver:function(t){if(t!==this.target){this.addListeners_(t),this.transientObservedNodes.push(t);var e=m.get(t);e||m.set(t,e=[]),e.push(this)}},removeTransientObservers:function(){var t=this.transientObservedNodes;this.transientObservedNodes=[],t.forEach(function(t){this.removeListeners_(t);for(var e=m.get(t),n=0;n<e.length;n++)if(e[n]===this){e.splice(n,1);break}},this)},handleEvent:function(t){switch(t.stopImmediatePropagation(),t.type){case"DOMAttrModified":var e=t.attrName,n=t.relatedNode.namespaceURI,i=t.target,o=new c("attributes",i);o.attributeName=e,o.attributeNamespace=n;var s=t.attrChange===MutationEvent.ADDITION?null:t.prevValue;r(i,function(t){return!t.attributes||t.attributeFilter&&t.attributeFilter.length&&-1===t.attributeFilter.indexOf(e)&&-1===t.attributeFilter.indexOf(n)?void 0:t.attributeOldValue?l(s):o});break;case"DOMCharacterDataModified":var i=t.target,o=c("characterData",i),s=t.prevValue;r(i,function(t){return t.characterData?t.characterDataOldValue?l(s):o:void 0});break;case"DOMNodeRemoved":this.addTransientObserver(t.target);case"DOMNodeInserted":var a,u,p=t.target;"DOMNodeInserted"===t.type?(a=[p],u=[]):(a=[],u=[p]);var d=p.previousSibling,f=p.nextSibling,o=c("childList",t.target.parentNode);o.addedNodes=a,o.removedNodes=u,o.previousSibling=d,o.nextSibling=f,r(t.relatedNode,function(t){return t.childList?o:void 0})}h()}},t.JsMutationObserver=s,t.MutationObserver||(t.MutationObserver=s,s._isPolyfilled=!0)}}(self),function(){"use strict";if(!window.performance){var t=Date.now();window.performance={now:function(){return Date.now()-t}}}window.requestAnimationFrame||(window.requestAnimationFrame=function(){var t=window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame;return t?function(e){return t(function(){e(performance.now())})}:function(t){return window.setTimeout(t,1e3/60)}}()),window.cancelAnimationFrame||(window.cancelAnimationFrame=function(){return window.webkitCancelAnimationFrame||window.mozCancelAnimationFrame||function(t){clearTimeout(t)}}());var e=function(){var t=document.createEvent("Event");return t.initEvent("foo",!0,!0),t.preventDefault(),t.defaultPrevented}();if(!e){var n=Event.prototype.preventDefault;Event.prototype.preventDefault=function(){this.cancelable&&(n.call(this),Object.defineProperty(this,"defaultPrevented",{get:function(){return!0},configurable:!0}))}}var i=/Trident/.test(navigator.userAgent);if((!window.CustomEvent||i&&"function"!=typeof window.CustomEvent)&&(window.CustomEvent=function(t,e){e=e||{};var n=document.createEvent("CustomEvent");return n.initCustomEvent(t,Boolean(e.bubbles),Boolean(e.cancelable),e.detail),n},window.CustomEvent.prototype=window.Event.prototype),!window.Event||i&&"function"!=typeof window.Event){var o=window.Event;window.Event=function(t,e){e=e||{};var n=document.createEvent("Event");return n.initEvent(t,Boolean(e.bubbles),Boolean(e.cancelable)),n},window.Event.prototype=o.prototype}}(window.WebComponents),window.CustomElements=window.CustomElements||{flags:{}},function(t){var e=t.flags,n=[],i=function(t){n.push(t)},o=function(){n.forEach(function(e){e(t)})};t.addModule=i,t.initializeModules=o,t.hasNative=Boolean(document.registerElement),t.isIE=/Trident/.test(navigator.userAgent),t.useNative=!e.register&&t.hasNative&&!window.ShadowDOMPolyfill&&(!window.HTMLImports||window.HTMLImports.useNative)}(window.CustomElements),window.CustomElements.addModule(function(t){function e(t,e){n(t,function(t){return e(t)?!0:void i(t,e)}),i(t,e)}function n(t,e,i){var o=t.firstElementChild;if(!o)for(o=t.firstChild;o&&o.nodeType!==Node.ELEMENT_NODE;)o=o.nextSibling;for(;o;)e(o,i)!==!0&&n(o,e,i),o=o.nextElementSibling;return null}function i(t,n){for(var i=t.shadowRoot;i;)e(i,n),i=i.olderShadowRoot}function o(t,e){r(t,e,[])}function r(t,e,n){if(t=window.wrap(t),!(n.indexOf(t)>=0)){n.push(t);for(var i,o=t.querySelectorAll("link[rel="+s+"]"),a=0,u=o.length;u>a&&(i=o[a]);a++)i.import&&r(i.import,e,n);e(t)}}var s=window.HTMLImports?window.HTMLImports.IMPORT_LINK_TYPE:"none";t.forDocumentTree=o,t.forSubtree=e}),window.CustomElements.addModule(function(t){function e(t,e){return n(t,e)||i(t,e)}function n(e,n){return t.upgrade(e,n)?!0:void(n&&s(e))}function i(t,e){b(t,function(t){return n(t,e)?!0:void 0})}function o(t){w.push(t),x||(x=!0,setTimeout(r))}function r(){x=!1;for(var t,e=w,n=0,i=e.length;i>n&&(t=e[n]);n++)t();w=[]}function s(t){C?o(function(){a(t)}):a(t)}function a(t){t.__upgraded__&&!t.__attached&&(t.__attached=!0,t.attachedCallback&&t.attachedCallback())}function u(t){c(t),b(t,function(t){c(t)})}function c(t){C?o(function(){l(t)}):l(t)}function l(t){t.__upgraded__&&t.__attached&&(t.__attached=!1,t.detachedCallback&&t.detachedCallback())}function h(t){for(var e=t,n=window.wrap(document);e;){if(e==n)return!0;e=e.parentNode||e.nodeType===Node.DOCUMENT_FRAGMENT_NODE&&e.host}}function p(t){if(t.shadowRoot&&!t.shadowRoot.__watched){v.dom&&console.log("watching shadow-root for: ",t.localName);for(var e=t.shadowRoot;e;)g(e),e=e.olderShadowRoot}}function d(t,n){if(v.dom){var i=n[0];if(i&&"childList"===i.type&&i.addedNodes&&i.addedNodes){for(var o=i.addedNodes[0];o&&o!==document&&!o.host;)o=o.parentNode;var r=o&&(o.URL||o._URL||o.host&&o.host.localName)||"";r=r.split("/?").shift().split("/").pop()}console.group("mutations (%d) [%s]",n.length,r||"")}var s=h(t);n.forEach(function(t){"childList"===t.type&&(E(t.addedNodes,function(t){t.localName&&e(t,s)}),E(t.removedNodes,function(t){t.localName&&u(t)}))}),v.dom&&console.groupEnd()}function f(t){for(t=window.wrap(t),t||(t=window.wrap(document));t.parentNode;)t=t.parentNode;var e=t.__observer;e&&(d(t,e.takeRecords()),r())}function g(t){if(!t.__observer){var e=new MutationObserver(d.bind(this,t));e.observe(t,{childList:!0,subtree:!0}),t.__observer=e}}function m(t){t=window.wrap(t),v.dom&&console.group("upgradeDocument: ",t.baseURI.split("/").pop());var n=t===window.wrap(document);e(t,n),g(t),v.dom&&console.groupEnd()}function y(t){A(t,m)}var v=t.flags,b=t.forSubtree,A=t.forDocumentTree,C=window.MutationObserver._isPolyfilled&&v["throttle-attached"];t.hasPolyfillMutations=C,t.hasThrottledAttached=C;var x=!1,w=[],E=Array.prototype.forEach.call.bind(Array.prototype.forEach),S=Element.prototype.createShadowRoot;S&&(Element.prototype.createShadowRoot=function(){var t=S.call(this);return window.CustomElements.watchShadow(this),t}),t.watchShadow=p,t.upgradeDocumentTree=y,t.upgradeDocument=m,t.upgradeSubtree=i,t.upgradeAll=e,t.attached=s,t.takeRecords=f}),window.CustomElements.addModule(function(t){function e(e,i){if("template"===e.localName&&window.HTMLTemplateElement&&HTMLTemplateElement.decorate&&HTMLTemplateElement.decorate(e),!e.__upgraded__&&e.nodeType===Node.ELEMENT_NODE){var o=e.getAttribute("is"),r=t.getRegisteredDefinition(e.localName)||t.getRegisteredDefinition(o);if(r&&(o&&r.tag==e.localName||!o&&!r.extends))return n(e,r,i)}}function n(e,n,o){return s.upgrade&&console.group("upgrade:",e.localName),n.is&&e.setAttribute("is",n.is),i(e,n),e.__upgraded__=!0,r(e),o&&t.attached(e),t.upgradeSubtree(e,o),s.upgrade&&console.groupEnd(),e}function i(t,e){Object.__proto__?t.__proto__=e.prototype:(o(t,e.prototype,e.native),t.__proto__=e.prototype)}function o(t,e,n){for(var i={},o=e;o!==n&&o!==HTMLElement.prototype;){for(var r,s=Object.getOwnPropertyNames(o),a=0;r=s[a];a++)i[r]||(Object.defineProperty(t,r,Object.getOwnPropertyDescriptor(o,r)),i[r]=1);o=Object.getPrototypeOf(o)}}function r(t){t.createdCallback&&t.createdCallback()}var s=t.flags;t.upgrade=e,t.upgradeWithDefinition=n,t.implementPrototype=i}),window.CustomElements.addModule(function(t){function e(e,i){var u=i||{};if(!e)throw new Error("document.registerElement: first argument `name` must not be empty");if(e.indexOf("-")<0)throw new Error("document.registerElement: first argument ('name') must contain a dash ('-'). Argument provided was '"+String(e)+"'.");if(o(e))throw new Error("Failed to execute 'registerElement' on 'Document': Registration failed for type '"+String(e)+"'. The type name is invalid.");if(c(e))throw new Error("DuplicateDefinitionError: a type with name '"+String(e)+"' is already registered");return u.prototype||(u.prototype=Object.create(HTMLElement.prototype)),u.__name=e.toLowerCase(),u.extends&&(u.extends=u.extends.toLowerCase()),u.lifecycle=u.lifecycle||{},u.ancestry=r(u.extends),s(u),a(u),n(u.prototype),l(u.__name,u),u.ctor=h(u),u.ctor.prototype=u.prototype,u.prototype.constructor=u.ctor,t.ready&&m(document),u.ctor}function n(t){if(!t.setAttribute._polyfilled){var e=t.setAttribute;t.setAttribute=function(t,n){i.call(this,t,n,e)};var n=t.removeAttribute;t.removeAttribute=function(t){i.call(this,t,null,n)},t.setAttribute._polyfilled=!0}}function i(t,e,n){t=t.toLowerCase();var i=this.getAttribute(t);n.apply(this,arguments);var o=this.getAttribute(t);this.attributeChangedCallback&&o!==i&&this.attributeChangedCallback(t,i,o)}function o(t){for(var e=0;e<C.length;e++)if(t===C[e])return!0}function r(t){var e=c(t);return e?r(e.extends).concat([e]):[]}function s(t){for(var e,n=t.extends,i=0;e=t.ancestry[i];i++)n=e.is&&e.tag;t.tag=n||t.__name,n&&(t.is=t.__name)}function a(t){if(!Object.__proto__){var e=HTMLElement.prototype;if(t.is){var n=document.createElement(t.tag);e=Object.getPrototypeOf(n)}for(var i,o=t.prototype,r=!1;o;)o==e&&(r=!0),i=Object.getPrototypeOf(o),i&&(o.__proto__=i),o=i;r||console.warn(t.tag+" prototype not found in prototype chain for "+t.is),t.native=e}}function u(t){return v(E(t.tag),t)}function c(t){return t?x[t.toLowerCase()]:void 0}function l(t,e){x[t]=e}function h(t){return function(){return u(t)}}function p(t,e,n){return t===w?d(e,n):S(t,e)}function d(t,e){t&&(t=t.toLowerCase()),e&&(e=e.toLowerCase());var n=c(e||t);if(n){if(t==n.tag&&e==n.is)return new n.ctor;if(!e&&!n.is)return new n.ctor}var i;return e?(i=d(t),i.setAttribute("is",e),i):(i=E(t),t.indexOf("-")>=0&&b(i,HTMLElement),i)}function f(t,e){var n=t[e];t[e]=function(){var t=n.apply(this,arguments);return y(t),t}}var g,m=(t.isIE,t.upgradeDocumentTree),y=t.upgradeAll,v=t.upgradeWithDefinition,b=t.implementPrototype,A=t.useNative,C=["annotation-xml","color-profile","font-face","font-face-src","font-face-uri","font-face-format","font-face-name","missing-glyph"],x={},w="http://www.w3.org/1999/xhtml",E=document.createElement.bind(document),S=document.createElementNS.bind(document);g=Object.__proto__||A?function(t,e){return t instanceof e}:function(t,e){if(t instanceof e)return!0;for(var n=t;n;){if(n===e.prototype)return!0;n=n.__proto__}return!1},f(Node.prototype,"cloneNode"),f(document,"importNode"),document.registerElement=e,document.createElement=d,document.createElementNS=p,t.registry=x,t.instanceof=g,t.reservedTagList=C,t.getRegisteredDefinition=c,document.register=document.registerElement}),function(t){function e(){r(window.wrap(document)),window.CustomElements.ready=!0;var t=window.requestAnimationFrame||function(t){setTimeout(t,16)};t(function(){setTimeout(function(){window.CustomElements.readyTime=Date.now(),window.HTMLImports&&(window.CustomElements.elapsed=window.CustomElements.readyTime-window.HTMLImports.readyTime),document.dispatchEvent(new CustomEvent("WebComponentsReady",{bubbles:!0}))})})}{var n=t.useNative,i=t.initializeModules;t.isIE}if(n){var o=function(){};t.watchShadow=o,t.upgrade=o,t.upgradeAll=o,t.upgradeDocumentTree=o,t.upgradeSubtree=o,t.takeRecords=o,t.instanceof=function(t,e){return t instanceof e}}else i();var r=t.upgradeDocumentTree,s=t.upgradeDocument;if(window.wrap||(window.ShadowDOMPolyfill?(window.wrap=window.ShadowDOMPolyfill.wrapIfNeeded,window.unwrap=window.ShadowDOMPolyfill.unwrapIfNeeded):window.wrap=window.unwrap=function(t){return t}),window.HTMLImports&&(window.HTMLImports.__importsParsingHook=function(t){t.import&&s(wrap(t.import))}),"complete"===document.readyState||t.flags.eager)e();else if("interactive"!==document.readyState||window.attachEvent||window.HTMLImports&&!window.HTMLImports.ready){var a=window.HTMLImports&&!window.HTMLImports.ready?"HTMLImportsLoaded":"DOMContentLoaded";window.addEventListener(a,e)}else e()}(window.CustomElements),function(){}.call(this),function(){var t=this;(function(){(function(){this.Trix={VERSION:"0.11.0",ZERO_WIDTH_SPACE:"\ufeff",NON_BREAKING_SPACE:"\xa0",OBJECT_REPLACEMENT_CHARACTER:"\ufffc",config:{}}}).call(this)}).call(t);var e=t.Trix;(function(){(function(){e.BasicObject=function(){function t(){}var e,n,i;return t.proxyMethod=function(t){var i,o,r,s,a;return r=n(t),i=r.name,s=r.toMethod,a=r.toProperty,o=r.optional,this.prototype[i]=function(){var t,n;return t=null!=s?o?"function"==typeof this[s]?this[s]():void 0:this[s]():null!=a?this[a]:void 0,o?(n=null!=t?t[i]:void 0,null!=n?e.call(n,t,arguments):void 0):(n=t[i],e.call(n,t,arguments))}},n=function(t){var e,n;if(!(n=t.match(i)))throw new Error("can't parse @proxyMethod expression: "+t);return e={name:n[4]},null!=n[2]?e.toMethod=n[1]:e.toProperty=n[1],null!=n[3]&&(e.optional=!0),e},e=Function.prototype.apply,i=/^(.+?)(\(\))?(\?)?\.(.+?)$/,t}()}).call(this),function(){var t=function(t,e){function i(){this.constructor=t}for(var o in e)n.call(e,o)&&(t[o]=e[o]);return i.prototype=e.prototype,t.prototype=new i,t.__super__=e.prototype,t},n={}.hasOwnProperty;e.Object=function(n){function i(){this.id=++o}var o;return t(i,n),o=0,i.fromJSONString=function(t){return this.fromJSON(JSON.parse(t))},i.prototype.hasSameConstructorAs=function(t){return this.constructor===(null!=t?t.constructor:void 0)},i.prototype.isEqualTo=function(t){return this===t},i.prototype.inspect=function(){var t,e,n;return t=function(){var t,i,o;i=null!=(t=this.contentsForInspection())?t:{},o=[];for(e in i)n=i[e],o.push(e+"="+n);return o}.call(this),"#<"+this.constructor.name+":"+this.id+(t.length?" "+t.join(", "):"")+">"},i.prototype.contentsForInspection=function(){},i.prototype.toJSONString=function(){return JSON.stringify(this)},i.prototype.toUTF16String=function(){return e.UTF16String.box(this)},i.prototype.getCacheKey=function(){return this.id.toString()},i}(e.BasicObject)}.call(this),function(){e.extend=function(t){var e,n;for(e in t)n=t[e],this[e]=n;return this}}.call(this),function(){e.extend({defer:function(t){return setTimeout(t,1)}})}.call(this),function(){var t,n;e.extend({normalizeSpaces:function(t){return t.replace(RegExp(""+e.ZERO_WIDTH_SPACE,"g"),"").replace(RegExp(""+e.NON_BREAKING_SPACE,"g")," ")},normalizeNewlines:function(t){return t.replace(/\r\n/g,"\n")},breakableWhitespacePattern:RegExp("[^\\S"+e.NON_BREAKING_SPACE+"]"),squishBreakableWhitespace:function(t){return t.replace(RegExp(""+e.breakableWhitespacePattern.source,"g")," ").replace(/\ {2,}/g," ")},summarizeStringChange:function(t,i){var o,r,s,a;return t=e.UTF16String.box(t),i=e.UTF16String.box(i),i.length<t.length?(r=n(t,i),a=r[0],o=r[1]):(s=n(i,t),o=s[0],a=s[1]),{added:o,removed:a}}}),n=function(n,i){var o,r,s,a,u;return n.isEqualTo(i)?["",""]:(r=t(n,i),a=r.utf16String.length,s=a?(u=r.offset,r,o=n.codepoints.slice(0,u).concat(n.codepoints.slice(u+a)),t(i,e.UTF16String.fromCodepoints(o))):t(i,n),[r.utf16String.toString(),s.utf16String.toString()])},t=function(t,e){var n,i,o;for(n=0,i=t.length,o=e.length;i>n&&t.charAt(n).isEqualTo(e.charAt(n));)n++;for(;i>n+1&&t.charAt(i-1).isEqualTo(e.charAt(o-1));)i--,o--;return{utf16String:t.slice(n,i),offset:n}}}.call(this),function(){e.extend({copyObject:function(t){var e,n,i;null==t&&(t={}),n={};for(e in t)i=t[e],n[e]=i;return n},objectsAreEqual:function(t,e){var n,i;if(null==t&&(t={}),null==e&&(e={}),Object.keys(t).length!==Object.keys(e).length)return!1;for(n in t)if(i=t[n],i!==e[n])return!1;return!0}})}.call(this),function(){var t=[].slice;e.extend({arraysAreEqual:function(t,e){var n,i,o,r;if(null==t&&(t=[]),null==e&&(e=[]),t.length!==e.length)return!1;for(i=n=0,o=t.length;o>n;i=++n)if(r=t[i],r!==e[i])return!1;return!0},arrayStartsWith:function(t,n){return null==t&&(t=[]),null==n&&(n=[]),e.arraysAreEqual(t.slice(0,n.length),n)},spliceArray:function(){var e,n,i;return n=arguments[0],e=2<=arguments.length?t.call(arguments,1):[],i=n.slice(0),i.splice.apply(i,e),i},summarizeArrayChange:function(t,e){var n,i,o,r,s,a,u,c,l,h,p;for(null==t&&(t=[]),null==e&&(e=[]),n=[],h=[],o=new Set,r=0,u=t.length;u>r;r++)p=t[r],o.add(p);for(i=new Set,s=0,c=e.length;c>s;s++)p=e[s],i.add(p),o.has(p)||n.push(p);for(a=0,l=t.length;l>a;a++)p=t[a],i.has(p)||h.push(p);return{added:n,removed:h}}})}.call(this),function(){var t,n,i,o;t=null,n=null,o=null,i=null,e.extend({getAllAttributeNames:function(){return null!=t?t:t=e.getTextAttributeNames().concat(e.getBlockAttributeNames())},getBlockConfig:function(t){return e.config.blockAttributes[t]},getBlockAttributeNames:function(){return null!=n?n:n=Object.keys(e.config.blockAttributes)},getTextConfig:function(t){return e.config.textAttributes[t]},getTextAttributeNames:function(){return null!=o?o:o=Object.keys(e.config.textAttributes)},getListAttributeNames:function(){var t,n;return null!=i?i:i=function(){var i,o;i=e.config.blockAttributes,o=[];for(t in i)n=i[t].listAttribute,null!=n&&o.push(n);return o}()}})}.call(this),function(){var t,n,i,o,r,s=[].indexOf||function(t){for(var e=0,n=this.length;n>e;e++)if(e in this&&this[e]===t)return e;return-1};t=document.documentElement,n=null!=(i=null!=(o=null!=(r=t.matchesSelector)?r:t.webkitMatchesSelector)?o:t.msMatchesSelector)?i:t.mozMatchesSelector,e.extend({handleEvent:function(n,i){var o,r,s,a,u,c,l,h,p,d,f,g;return h=null!=i?i:{},c=h.onElement,u=h.matchingSelector,g=h.withCallback,a=h.inPhase,l=h.preventDefault,d=h.times,r=null!=c?c:t,p=u,o=g,f="capturing"===a,s=function(t){var n;return null!=d&&0===--d&&s.destroy(),n=e.findClosestElementFromNode(t.target,{matchingSelector:p}),null!=n&&(null!=g&&g.call(n,t,n),l)?t.preventDefault():void 0},s.destroy=function(){return r.removeEventListener(n,s,f)},r.addEventListener(n,s,f),s},handleEventOnce:function(t,n){return null==n&&(n={}),n.times=1,e.handleEvent(t,n)},triggerEvent:function(n,i){var o,r,s,a,u,c,l;return l=null!=i?i:{},c=l.onElement,r=l.bubbles,s=l.cancelable,o=l.attributes,a=null!=c?c:t,r=r!==!1,s=s!==!1,u=document.createEvent("Events"),u.initEvent(n,r,s),null!=o&&e.extend.call(u,o),a.dispatchEvent(u)},elementMatchesSelector:function(t,e){return 1===(null!=t?t.nodeType:void 0)?n.call(t,e):void 0},findClosestElementFromNode:function(t,n){var i,o,r;for(o=null!=n?n:{},i=o.matchingSelector,r=o.untilNode;null!=t&&t.nodeType!==Node.ELEMENT_NODE;)t=t.parentNode;if(null!=t){if(null==i)return t;if(t.closest&&null==r)return t.closest(i);for(;t&&t!==r;){if(e.elementMatchesSelector(t,i))return t;t=t.parentNode}}},findInnerElement:function(t){for(;null!=t?t.firstElementChild:void 0;)t=t.firstElementChild;return t},innerElementIsActive:function(t){return document.activeElement!==t&&e.elementContainsNode(t,document.activeElement)},elementContainsNode:function(t,e){if(t&&e)for(;e;){if(e===t)return!0;e=e.parentNode}},findNodeFromContainerAndOffset:function(t,e){var n;if(t)return t.nodeType===Node.TEXT_NODE?t:0===e?null!=(n=t.firstChild)?n:t:t.childNodes.item(e-1)},findElementFromContainerAndOffset:function(t,n){var i;return i=e.findNodeFromContainerAndOffset(t,n),e.findClosestElementFromNode(i)},findChildIndexOfNode:function(t){var e;if(null!=t?t.parentNode:void 0){for(e=0;t=t.previousSibling;)e++;return e}},walkTree:function(t,e){var n,i,o,r,s;return o=null!=e?e:{},i=o.onlyNodesOfType,r=o.usingFilter,n=o.expandEntityReferences,s=function(){switch(i){case"element":return NodeFilter.SHOW_ELEMENT;case"text":return NodeFilter.SHOW_TEXT;case"comment":return NodeFilter.SHOW_COMMENT;default:return NodeFilter.SHOW_ALL}}(),document.createTreeWalker(t,s,null!=r?r:null,n===!0)},tagName:function(t){var e;return null!=t&&null!=(e=t.tagName)?e.toLowerCase():void 0},makeElement:function(t,e){var n,i,o,r,s,a,u,c,l,h;if(null==e&&(e={}),"object"==typeof t?(e=t,t=e.tagName):e={attributes:e},i=document.createElement(t),null!=e.editable&&(null==e.attributes&&(e.attributes={}),e.attributes.contenteditable=e.editable),e.attributes){a=e.attributes;for(r in a)h=a[r],i.setAttribute(r,h)}if(e.style){u=e.style;for(r in u)h=u[r],i.style[r]=h}if(e.data){c=e.data;for(r in c)h=c[r],i.dataset[r]=h}if(e.className)for(l=e.className.split(" "),o=0,s=l.length;s>o;o++)n=l[o],i.classList.add(n);return e.textContent&&(i.textContent=e.textContent),i},getBlockTagNames:function(){var t,n;return null!=e.blockTagNames?e.blockTagNames:e.blockTagNames=function(){var i,o;i=e.config.blockAttributes,o=[];for(t in i)n=i[t],o.push(n.tagName);return o}()},nodeIsBlockContainer:function(t){return e.nodeIsBlockStartComment(null!=t?t.firstChild:void 0)},nodeProbablyIsBlockContainer:function(t){var n,i;return n=e.tagName(t),s.call(e.getBlockTagNames(),n)>=0&&(i=e.tagName(t.firstChild),s.call(e.getBlockTagNames(),i)<0)},nodeIsBlockStart:function(t,n){var i;return i=(null!=n?n:{strict:!0}).strict,i?e.nodeIsBlockStartComment(t):e.nodeIsBlockStartComment(t)||!e.nodeIsBlockStartComment(t.firstChild)&&e.nodeProbablyIsBlockContainer(t)},nodeIsBlockStartComment:function(t){return e.nodeIsCommentNode(t)&&"block"===(null!=t?t.data:void 0)},nodeIsCommentNode:function(t){return(null!=t?t.nodeType:void 0)===Node.COMMENT_NODE},nodeIsCursorTarget:function(t){return t?e.nodeIsTextNode(t)?t.data===e.ZERO_WIDTH_SPACE:e.nodeIsCursorTarget(t.firstChild):void 0},nodeIsAttachmentElement:function(t){return e.elementMatchesSelector(t,e.AttachmentView.attachmentSelector)},nodeIsEmptyTextNode:function(t){return e.nodeIsTextNode(t)&&""===(null!=t?t.data:void 0)},nodeIsTextNode:function(t){return(null!=t?t.nodeType:void 0)===Node.TEXT_NODE}})}.call(this),function(){var t,n,i,o,r;t=e.copyObject,o=e.objectsAreEqual,e.extend({normalizeRange:i=function(t){var e;if(null!=t)return Array.isArray(t)||(t=[t,t]),[n(t[0]),n(null!=(e=t[1])?e:t[0])]},rangeIsCollapsed:function(t){var e,n,o;if(null!=t)return n=i(t),o=n[0],e=n[1],r(o,e)},rangesAreEqual:function(t,e){var n,o,s,a,u,c;if(null!=t&&null!=e)return s=i(t),o=s[0],n=s[1],a=i(e),c=a[0],u=a[1],r(o,c)&&r(n,u)}}),n=function(e){return"number"==typeof e?e:t(e)},r=function(t,e){return"number"==typeof t?t===e:o(t,e)}}.call(this),function(){var t,n,i,o;t={extendsTagName:"div",css:"%t { display: block; }"},e.registerElement=function(e,n){var r,s,a,u,c,l,h;return null==n&&(n={}),e=e.toLowerCase(),c=o(n),u=null!=(h=c.extendsTagName)?h:t.extendsTagName,delete c.extendsTagName,s=c.defaultCSS,delete c.defaultCSS,null!=s&&u===t.extendsTagName?s+="\n"+t.css:s=t.css,i(s,e),a=Object.getPrototypeOf(document.createElement(u)),a.__super__=a,l=Object.create(a,c),r=document.registerElement(e,{prototype:l}),Object.defineProperty(l,"constructor",{value:r}),r},i=function(t,e){var i;return i=n(e),i.textContent=t.replace(/%t/g,e)},n=function(t){var e;return e=document.createElement("style"),e.setAttribute("type","text/css"),e.setAttribute("data-tag-name",t.toLowerCase()),document.head.insertBefore(e,document.head.firstChild),e},o=function(t){var e,n,i;n={};for(e in t)i=t[e],n[e]="function"==typeof i?{value:i}:i;return n}}.call(this),function(){var t,n;e.extend({getDOMSelection:function(){var t;return t=window.getSelection(),t.rangeCount>0?t:void 0},getDOMRange:function(){var n,i;return(n=null!=(i=e.getDOMSelection())?i.getRangeAt(0):void 0)&&!t(n)?n:void 0},setDOMRange:function(t){var n;return n=window.getSelection(),n.removeAllRanges(),n.addRange(t),e.selectionChangeObserver.update()}}),t=function(t){return n(t.startContainer)||n(t.endContainer)},n=function(t){return!Object.getPrototypeOf(t)}}.call(this),function(){}.call(this),function(){var t,n=function(t,e){function n(){this.constructor=t}for(var o in e)i.call(e,o)&&(t[o]=e[o]);return n.prototype=e.prototype,t.prototype=new n,t.__super__=e.prototype,t},i={}.hasOwnProperty;t=e.arraysAreEqual,e.Hash=function(i){function o(t){null==t&&(t={}),this.values=s(t),o.__super__.constructor.apply(this,arguments)}var r,s,a,u,c;return n(o,i),o.fromCommonAttributesOfObjects=function(t){var e,n,i,o,s,a;if(null==t&&(t=[]),!t.length)return new this;for(e=r(t[0]),i=e.getKeys(),a=t.slice(1),n=0,o=a.length;o>n;n++)s=a[n],i=e.getKeysCommonToHash(r(s)),e=e.slice(i);return e},o.box=function(t){return r(t)},o.prototype.add=function(t,e){return this.merge(u(t,e))},o.prototype.remove=function(t){return new e.Hash(s(this.values,t))},o.prototype.get=function(t){return this.values[t]},o.prototype.has=function(t){return t in this.values},o.prototype.merge=function(t){return new e.Hash(a(this.values,c(t)))},o.prototype.slice=function(t){var n,i,o,r;for(r={},n=0,o=t.length;o>n;n++)i=t[n],this.has(i)&&(r[i]=this.values[i]);return new e.Hash(r)},o.prototype.getKeys=function(){return Object.keys(this.values)},o.prototype.getKeysCommonToHash=function(t){var e,n,i,o,s;for(t=r(t),o=this.getKeys(),s=[],e=0,i=o.length;i>e;e++)n=o[e],this.values[n]===t.values[n]&&s.push(n);return s},o.prototype.isEqualTo=function(e){return t(this.toArray(),r(e).toArray())},o.prototype.isEmpty=function(){return 0===this.getKeys().length},o.prototype.toArray=function(){var t,e,n;return(null!=this.array?this.array:this.array=function(){var i;e=[],i=this.values;for(t in i)n=i[t],e.push(t,n);return e}.call(this)).slice(0)},o.prototype.toObject=function(){return s(this.values)},o.prototype.toJSON=function(){return this.toObject()},o.prototype.contentsForInspection=function(){return{values:JSON.stringify(this.values)}},u=function(t,e){var n;return n={},n[t]=e,n},a=function(t,e){var n,i,o;i=s(t);for(n in e)o=e[n],i[n]=o;return i},s=function(t,e){var n,i,o,r,s;for(r={},s=Object.keys(t).sort(),n=0,o=s.length;o>n;n++)i=s[n],i!==e&&(r[i]=t[i]);return r},r=function(t){return t instanceof e.Hash?t:new e.Hash(t)},c=function(t){return t instanceof e.Hash?t.values:t},o}(e.Object)}.call(this),function(){e.ObjectGroup=function(){function t(t,e){var n,i;this.objects=null!=t?t:[],i=e.depth,n=e.asTree,n&&(this.depth=i,this.objects=this.constructor.groupObjects(this.objects,{asTree:n,depth:this.depth+1}))}return t.groupObjects=function(t,e){var n,i,o,r,s,a,u,c,l;for(null==t&&(t=[]),l=null!=e?e:{},o=l.depth,n=l.asTree,n&&null==o&&(o=0),c=[],s=0,a=t.length;a>s;s++){if(u=t[s],r){if(("function"==typeof u.canBeGrouped?u.canBeGrouped(o):void 0)&&("function"==typeof(i=r[r.length-1]).canBeGroupedWith?i.canBeGroupedWith(u,o):void 0)){r.push(u);continue}c.push(new this(r,{depth:o,asTree:n})),r=null}("function"==typeof u.canBeGrouped?u.canBeGrouped(o):void 0)?r=[u]:c.push(u)}return r&&c.push(new this(r,{depth:o,asTree:n})),c},t.prototype.getObjects=function(){return this.objects},t.prototype.getDepth=function(){return this.depth},t.prototype.getCacheKey=function(){var t,e,n,i,o;for(e=["objectGroup"],o=this.getObjects(),t=0,n=o.length;n>t;t++)i=o[t],e.push(i.getCacheKey());return e.join("/")},t}()}.call(this),function(){var t=function(t,e){function i(){this.constructor=t}for(var o in e)n.call(e,o)&&(t[o]=e[o]);return i.prototype=e.prototype,t.prototype=new i,t.__super__=e.prototype,t},n={}.hasOwnProperty;e.ObjectMap=function(e){function n(t){var e,n,i,o,r;for(null==t&&(t=[]),this.objects={},i=0,o=t.length;o>i;i++)r=t[i],n=JSON.stringify(r),null==(e=this.objects)[n]&&(e[n]=r)}return t(n,e),n.prototype.find=function(t){var e;return e=JSON.stringify(t),this.objects[e]},n}(e.BasicObject)}.call(this),function(){e.ElementStore=function(){function t(t){this.reset(t)}var e;return t.prototype.add=function(t){var n;return n=e(t),this.elements[n]=t},t.prototype.remove=function(t){var n,i;return n=e(t),(i=this.elements[n])?(delete this.elements[n],i):void 0},t.prototype.reset=function(t){var e,n,i;for(null==t&&(t=[]),this.elements={},n=0,i=t.length;i>n;n++)e=t[n],this.add(e);return t},e=function(t){return t.dataset.trixStoreKey},t}()}.call(this),function(){}.call(this),function(){var t=function(t,e){function i(){this.constructor=t}for(var o in e)n.call(e,o)&&(t[o]=e[o]);return i.prototype=e.prototype,t.prototype=new i,t.__super__=e.prototype,t},n={}.hasOwnProperty;e.Operation=function(e){function n(){return n.__super__.constructor.apply(this,arguments)}return t(n,e),n.prototype.isPerforming=function(){return this.performing===!0},n.prototype.hasPerformed=function(){return this.performed===!0},n.prototype.hasSucceeded=function(){return this.performed&&this.succeeded},n.prototype.hasFailed=function(){return this.performed&&!this.succeeded},n.prototype.getPromise=function(){return null!=this.promise?this.promise:this.promise=new Promise(function(t){return function(e,n){return t.performing=!0,t.perform(function(i,o){return t.succeeded=i,t.performing=!1,t.performed=!0,t.succeeded?e(o):n(o)})}}(this))},n.prototype.perform=function(t){return t(!1)},n.prototype.release=function(){var t;return null!=(t=this.promise)&&"function"==typeof t.cancel&&t.cancel(),this.promise=null,this.performing=null,this.performed=null,this.succeeded=null},n.proxyMethod("getPromise().then"),n.proxyMethod("getPromise().catch"),n
}(e.BasicObject)}.call(this),function(){var t,n,i,o,r,s=function(t,e){function n(){this.constructor=t}for(var i in e)a.call(e,i)&&(t[i]=e[i]);return n.prototype=e.prototype,t.prototype=new n,t.__super__=e.prototype,t},a={}.hasOwnProperty;e.UTF16String=function(t){function e(t,e){this.ucs2String=t,this.codepoints=e,this.length=this.codepoints.length,this.ucs2Length=this.ucs2String.length}return s(e,t),e.box=function(t){return null==t&&(t=""),t instanceof this?t:this.fromUCS2String(null!=t?t.toString():void 0)},e.fromUCS2String=function(t){return new this(t,o(t))},e.fromCodepoints=function(t){return new this(r(t),t)},e.prototype.offsetToUCS2Offset=function(t){return r(this.codepoints.slice(0,Math.max(0,t))).length},e.prototype.offsetFromUCS2Offset=function(t){return o(this.ucs2String.slice(0,Math.max(0,t))).length},e.prototype.slice=function(){var t;return this.constructor.fromCodepoints((t=this.codepoints).slice.apply(t,arguments))},e.prototype.charAt=function(t){return this.slice(t,t+1)},e.prototype.isEqualTo=function(t){return this.constructor.box(t).ucs2String===this.ucs2String},e.prototype.toJSON=function(){return this.ucs2String},e.prototype.getCacheKey=function(){return this.ucs2String},e.prototype.toString=function(){return this.ucs2String},e}(e.BasicObject),t=1===("function"==typeof Array.from?Array.from("\ud83d\udc7c").length:void 0),n=null!=("function"==typeof" ".codePointAt?" ".codePointAt(0):void 0),i=" \ud83d\udc7c"===("function"==typeof String.fromCodePoint?String.fromCodePoint(32,128124):void 0),o=t&&n?function(t){return Array.from(t).map(function(t){return t.codePointAt(0)})}:function(t){var e,n,i,o,r;for(o=[],e=0,i=t.length;i>e;)r=t.charCodeAt(e++),r>=55296&&56319>=r&&i>e&&(n=t.charCodeAt(e++),56320===(64512&n)?r=((1023&r)<<10)+(1023&n)+65536:e--),o.push(r);return o},r=i?function(t){return String.fromCodePoint.apply(String,t)}:function(t){var e,n,i;return e=function(){var e,o,r;for(r=[],e=0,o=t.length;o>e;e++)i=t[e],n="",i>65535&&(i-=65536,n+=String.fromCharCode(i>>>10&1023|55296),i=56320|1023&i),r.push(n+String.fromCharCode(i));return r}(),e.join("")}}.call(this),function(){}.call(this),function(){}.call(this),function(){e.config.lang={bold:"Bold",bullets:"Bullets","byte":"Byte",bytes:"Bytes",captionPlaceholder:"Add a caption\u2026",code:"Code",heading1:"Heading",indent:"Increase Level",italic:"Italic",link:"Link",numbers:"Numbers",outdent:"Decrease Level",quote:"Quote",redo:"Redo",remove:"Remove",strike:"Strikethrough",undo:"Undo",unlink:"Unlink",urlPlaceholder:"Enter a URL\u2026",GB:"GB",KB:"KB",MB:"MB",PB:"PB",TB:"TB"}}.call(this),function(){e.config.css={attachment:"attachment",attachmentProgress:"attachment__progress",attachmentName:"attachment__name",attachmentSize:"attachment__size",attachmentRemove:"attachment__remove",attachmentCaption:"attachment__caption",attachmentCaptionEditor:"attachment__caption-editor"}}.call(this),function(){var t;e.config.blockAttributes=t={"default":{tagName:"div",parse:!1},quote:{tagName:"blockquote",nestable:!0},heading1:{tagName:"h1",terminal:!0,breakOnReturn:!0,group:!1},code:{tagName:"pre",terminal:!0,text:{plaintext:!0}},bulletList:{tagName:"ul",parse:!1},bullet:{tagName:"li",listAttribute:"bulletList",group:!1,nestable:!0,test:function(n){return e.tagName(n.parentNode)===t[this.listAttribute].tagName}},numberList:{tagName:"ol",parse:!1},number:{tagName:"li",listAttribute:"numberList",group:!1,nestable:!0,test:function(n){return e.tagName(n.parentNode)===t[this.listAttribute].tagName}}}}.call(this),function(){var t,n;t=e.config.lang,n=[t.bytes,t.KB,t.MB,t.GB,t.TB,t.PB],e.config.fileSize={prefix:"IEC",precision:2,formatter:function(e){var i,o,r,s,a;switch(e){case 0:return"0 "+t.bytes;case 1:return"1 "+t.byte;default:return i=function(){switch(this.prefix){case"SI":return 1e3;case"IEC":return 1024}}.call(this),o=Math.floor(Math.log(e)/Math.log(i)),r=e/Math.pow(i,o),s=r.toFixed(this.precision),a=s.replace(/0*$/,"").replace(/\.$/,""),a+" "+n[o]}}}}.call(this),function(){e.config.textAttributes={bold:{tagName:"strong",inheritable:!0,parser:function(t){var e;return e=window.getComputedStyle(t),"bold"===e.fontWeight||e.fontWeight>=600}},italic:{tagName:"em",inheritable:!0,parser:function(t){var e;return e=window.getComputedStyle(t),"italic"===e.fontStyle}},href:{groupTagName:"a",parser:function(t){var n,i,o;return n=e.AttachmentView.attachmentSelector,o="a:not("+n+")",(i=e.findClosestElementFromNode(t,{matchingSelector:o}))?i.getAttribute("href"):void 0}},strike:{tagName:"del",inheritable:!0},frozen:{style:{backgroundColor:"highlight"}}}}.call(this),function(){var t,n,i,o,r;r="[data-trix-serialize=false]",o=["contenteditable","data-trix-id","data-trix-store-key","data-trix-mutable","data-trix-placeholder"],n="data-trix-serialized-attributes",i="["+n+"]",t=new RegExp("<!--block-->","g"),e.extend({serializers:{"application/json":function(t){var n;if(t instanceof e.Document)n=t;else{if(!(t instanceof HTMLElement))throw new Error("unserializable object");n=e.Document.fromHTML(t.innerHTML)}return n.toSerializableDocument().toJSONString()},"text/html":function(s){var a,u,c,l,h,p,d,f,g,m,y,v,b,A,C,x,w;if(s instanceof e.Document)l=e.DocumentView.render(s);else{if(!(s instanceof HTMLElement))throw new Error("unserializable object");l=s.cloneNode(!0)}for(A=l.querySelectorAll(r),h=0,g=A.length;g>h;h++)c=A[h],c.parentNode.removeChild(c);for(p=0,m=o.length;m>p;p++)for(a=o[p],C=l.querySelectorAll("["+a+"]"),d=0,y=C.length;y>d;d++)c=C[d],c.removeAttribute(a);for(x=l.querySelectorAll(i),f=0,v=x.length;v>f;f++){c=x[f];try{u=JSON.parse(c.getAttribute(n)),c.removeAttribute(n);for(b in u)w=u[b],c.setAttribute(b,w)}catch(E){}}return l.innerHTML.replace(t,"")}},deserializers:{"application/json":function(t){return e.Document.fromJSONString(t)},"text/html":function(t){return e.Document.fromHTML(t)}},serializeToContentType:function(t,n){var i;if(i=e.serializers[n])return i(t);throw new Error("unknown content type: "+n)},deserializeFromContentType:function(t,n){var i;if(i=e.deserializers[n])return i(t);throw new Error("unknown content type: "+n)}})}.call(this),function(){var t;t=e.config.lang,e.config.toolbar={getDefaultHTML:function(){return'<div class="trix-button-row">\n  <span class="trix-button-group trix-button-group--text-tools" data-trix-button-group="text-tools">\n    <button type="button" class="trix-button trix-button--icon trix-button--icon-bold" data-trix-attribute="bold" data-trix-key="b" title="'+t.bold+'" tabindex="-1">'+t.bold+'</button>\n    <button type="button" class="trix-button trix-button--icon trix-button--icon-italic" data-trix-attribute="italic" data-trix-key="i" title="'+t.italic+'" tabindex="-1">'+t.italic+'</button>\n    <button type="button" class="trix-button trix-button--icon trix-button--icon-strike" data-trix-attribute="strike" title="'+t.strike+'" tabindex="-1">'+t.strike+'</button>\n    <button type="button" class="trix-button trix-button--icon trix-button--icon-link" data-trix-attribute="href" data-trix-action="link" data-trix-key="k" title="'+t.link+'" tabindex="-1">'+t.link+'</button>\n  </span>\n\n  <span class="trix-button-group trix-button-group--block-tools" data-trix-button-group="block-tools">\n    <button type="button" class="trix-button trix-button--icon trix-button--icon-heading-1" data-trix-attribute="heading1" title="'+t.heading1+'" tabindex="-1">'+t.heading1+'</button>\n    <button type="button" class="trix-button trix-button--icon trix-button--icon-quote" data-trix-attribute="quote" title="'+t.quote+'" tabindex="-1">'+t.quote+'</button>\n    <button type="button" class="trix-button trix-button--icon trix-button--icon-code" data-trix-attribute="code" title="'+t.code+'" tabindex="-1">'+t.code+'</button>\n    <button type="button" class="trix-button trix-button--icon trix-button--icon-bullet-list" data-trix-attribute="bullet" title="'+t.bullets+'" tabindex="-1">'+t.bullets+'</button>\n    <button type="button" class="trix-button trix-button--icon trix-button--icon-number-list" data-trix-attribute="number" title="'+t.numbers+'" tabindex="-1">'+t.numbers+'</button>\n    <button type="button" class="trix-button trix-button--icon trix-button--icon-decrease-nesting-level" data-trix-action="decreaseNestingLevel" title="'+t.outdent+'" tabindex="-1">'+t.outdent+'</button>\n    <button type="button" class="trix-button trix-button--icon trix-button--icon-increase-nesting-level" data-trix-action="increaseNestingLevel" title="'+t.indent+'" tabindex="-1">'+t.indent+'</button>\n  </span>\n\n  <span class="trix-button-group trix-button-group--history-tools" data-trix-button-group="history-tools">\n    <button type="button" class="trix-button trix-button--icon trix-button--icon-undo" data-trix-action="undo" data-trix-key="z" title="'+t.undo+'" tabindex="-1">'+t.undo+'</button>\n    <button type="button" class="trix-button trix-button--icon trix-button--icon-redo" data-trix-action="redo" data-trix-key="shift+z" title="'+t.redo+'" tabindex="-1">'+t.redo+'</button>\n  </span>\n</div>\n\n<div class="trix-dialogs" data-trix-dialogs>\n  <div class="trix-dialog trix-dialog--link" data-trix-dialog="href" data-trix-dialog-attribute="href">\n    <div class="trix-dialog__link-fields">\n      <input type="url" name="href" class="trix-input trix-input--dialog" placeholder="'+t.urlPlaceholder+'" required data-trix-input>\n      <div class="trix-button-group">\n        <input type="button" class="trix-button trix-button--dialog" value="'+t.link+'" data-trix-method="setAttribute">\n        <input type="button" class="trix-button trix-button--dialog" value="'+t.unlink+'" data-trix-method="removeAttribute">\n      </div>\n    </div>\n  </div>\n</div>'}}}.call(this),function(){e.config.undoInterval=5e3}.call(this),function(){e.config.attachments={preview:{caption:{name:!0,size:!0}},file:{caption:{size:!0}}}}.call(this),function(){}.call(this),function(){e.registerElement("trix-toolbar",{defaultCSS:"%t {\n  white-space: nowrap;\n}\n\n%t [data-trix-dialog] {\n  display: none;\n}\n\n%t [data-trix-dialog][data-trix-active] {\n  display: block;\n}\n\n%t [data-trix-dialog] [data-trix-validate]:invalid {\n  background-color: #ffdddd;\n}",createdCallback:function(){return""===this.innerHTML?this.innerHTML=e.config.toolbar.getDefaultHTML():void 0}})}.call(this),function(){var t=function(t,e){function i(){this.constructor=t}for(var o in e)n.call(e,o)&&(t[o]=e[o]);return i.prototype=e.prototype,t.prototype=new i,t.__super__=e.prototype,t},n={}.hasOwnProperty,i=[].indexOf||function(t){for(var e=0,n=this.length;n>e;e++)if(e in this&&this[e]===t)return e;return-1};e.ObjectView=function(n){function o(t,e){this.object=t,this.options=null!=e?e:{},this.childViews=[],this.rootView=this}return t(o,n),o.prototype.getNodes=function(){var t,e,n,i,o;for(null==this.nodes&&(this.nodes=this.createNodes()),i=this.nodes,o=[],t=0,e=i.length;e>t;t++)n=i[t],o.push(n.cloneNode(!0));return o},o.prototype.invalidate=function(){var t;return this.nodes=null,null!=(t=this.parentView)?t.invalidate():void 0},o.prototype.invalidateViewForObject=function(t){var e;return null!=(e=this.findViewForObject(t))?e.invalidate():void 0},o.prototype.findOrCreateCachedChildView=function(t,e){var n;return(n=this.getCachedViewForObject(e))?this.recordChildView(n):(n=this.createChildView.apply(this,arguments),this.cacheViewForObject(n,e)),n},o.prototype.createChildView=function(t,n,i){var o;return null==i&&(i={}),n instanceof e.ObjectGroup&&(i.viewClass=t,t=e.ObjectGroupView),o=new t(n,i),this.recordChildView(o)},o.prototype.recordChildView=function(t){return t.parentView=this,t.rootView=this.rootView,i.call(this.childViews,t)<0&&this.childViews.push(t),t},o.prototype.getAllChildViews=function(){var t,e,n,i,o;for(o=[],i=this.childViews,e=0,n=i.length;n>e;e++)t=i[e],o.push(t),o=o.concat(t.getAllChildViews());return o},o.prototype.findElement=function(){return this.findElementForObject(this.object)},o.prototype.findElementForObject=function(t){var e;return(e=null!=t?t.id:void 0)?this.rootView.element.querySelector("[data-trix-id='"+e+"']"):void 0},o.prototype.findViewForObject=function(t){var e,n,i,o;for(i=this.getAllChildViews(),e=0,n=i.length;n>e;e++)if(o=i[e],o.object===t)return o},o.prototype.getViewCache=function(){return this.rootView!==this?this.rootView.getViewCache():this.isViewCachingEnabled()?null!=this.viewCache?this.viewCache:this.viewCache={}:void 0},o.prototype.isViewCachingEnabled=function(){return this.shouldCacheViews!==!1},o.prototype.enableViewCaching=function(){return this.shouldCacheViews=!0},o.prototype.disableViewCaching=function(){return this.shouldCacheViews=!1},o.prototype.getCachedViewForObject=function(t){var e;return null!=(e=this.getViewCache())?e[t.getCacheKey()]:void 0},o.prototype.cacheViewForObject=function(t,e){var n;return null!=(n=this.getViewCache())?n[e.getCacheKey()]=t:void 0},o.prototype.garbageCollectCachedViews=function(){var t,e,n,o,r,s;if(t=this.getViewCache()){s=this.getAllChildViews().concat(this),n=function(){var t,e,n;for(n=[],t=0,e=s.length;e>t;t++)r=s[t],n.push(r.object.getCacheKey());return n}(),o=[];for(e in t)i.call(n,e)<0&&o.push(delete t[e]);return o}},o}(e.BasicObject)}.call(this),function(){var t=function(t,e){function i(){this.constructor=t}for(var o in e)n.call(e,o)&&(t[o]=e[o]);return i.prototype=e.prototype,t.prototype=new i,t.__super__=e.prototype,t},n={}.hasOwnProperty;e.ObjectGroupView=function(e){function n(){n.__super__.constructor.apply(this,arguments),this.objectGroup=this.object,this.viewClass=this.options.viewClass,delete this.options.viewClass}return t(n,e),n.prototype.getChildViews=function(){var t,e,n,i;if(!this.childViews.length)for(i=this.objectGroup.getObjects(),t=0,e=i.length;e>t;t++)n=i[t],this.findOrCreateCachedChildView(this.viewClass,n,this.options);return this.childViews},n.prototype.createNodes=function(){var t,e,n,i,o,r,s,a,u;for(t=this.createContainerElement(),s=this.getChildViews(),e=0,i=s.length;i>e;e++)for(u=s[e],a=u.getNodes(),n=0,o=a.length;o>n;n++)r=a[n],t.appendChild(r);return[t]},n.prototype.createContainerElement=function(t){return null==t&&(t=this.objectGroup.getDepth()),this.getChildViews()[0].createContainerElement(t)},n}(e.ObjectView)}.call(this),function(){var t=function(t,e){function i(){this.constructor=t}for(var o in e)n.call(e,o)&&(t[o]=e[o]);return i.prototype=e.prototype,t.prototype=new i,t.__super__=e.prototype,t},n={}.hasOwnProperty;e.Controller=function(e){function n(){return n.__super__.constructor.apply(this,arguments)}return t(n,e),n}(e.BasicObject)}.call(this),function(){var t,n,i,o,r,s,a=function(t,e){return function(){return t.apply(e,arguments)}},u=function(t,e){function n(){this.constructor=t}for(var i in e)c.call(e,i)&&(t[i]=e[i]);return n.prototype=e.prototype,t.prototype=new n,t.__super__=e.prototype,t},c={}.hasOwnProperty,l=[].indexOf||function(t){for(var e=0,n=this.length;n>e;e++)if(e in this&&this[e]===t)return e;return-1};t=e.findClosestElementFromNode,i=e.nodeIsEmptyTextNode,n=e.nodeIsBlockStartComment,o=e.normalizeSpaces,r=e.summarizeStringChange,s=e.tagName,e.MutationObserver=function(e){function c(t){this.element=t,this.didMutate=a(this.didMutate,this),this.observer=new window.MutationObserver(this.didMutate),this.start()}var h,p,d,f;return u(c,e),p="data-trix-mutable",d="["+p+"]",f={attributes:!0,childList:!0,characterData:!0,characterDataOldValue:!0,subtree:!0},c.prototype.start=function(){return this.reset(),this.observer.observe(this.element,f)},c.prototype.stop=function(){return this.observer.disconnect()},c.prototype.didMutate=function(t){var e,n;return(e=this.mutations).push.apply(e,this.findSignificantMutations(t)),this.mutations.length?(null!=(n=this.delegate)&&"function"==typeof n.elementDidMutate&&n.elementDidMutate(this.getMutationSummary()),this.reset()):void 0},c.prototype.reset=function(){return this.mutations=[]},c.prototype.findSignificantMutations=function(t){var e,n,i,o;for(o=[],e=0,n=t.length;n>e;e++)i=t[e],this.mutationIsSignificant(i)&&o.push(i);return o},c.prototype.mutationIsSignificant=function(t){var e,n,i,o;for(o=this.nodesModifiedByMutation(t),e=0,n=o.length;n>e;e++)if(i=o[e],this.nodeIsSignificant(i))return!0;return!1},c.prototype.nodeIsSignificant=function(t){return t!==this.element&&!this.nodeIsMutable(t)&&!i(t)},c.prototype.nodeIsMutable=function(e){return t(e,{matchingSelector:d})},c.prototype.nodesModifiedByMutation=function(t){var e;switch(e=[],t.type){case"attributes":t.attributeName!==p&&e.push(t.target);break;case"characterData":e.push(t.target.parentNode),e.push(t.target);break;case"childList":e.push.apply(e,t.addedNodes),e.push.apply(e,t.removedNodes)}return e},c.prototype.getMutationSummary=function(){return this.getTextMutationSummary()},c.prototype.getTextMutationSummary=function(){var t,e,n,i,o,r,s,a,u,c,h;for(a=this.getTextChangesFromCharacterData(),n=a.additions,o=a.deletions,h=this.getTextChangesFromChildList(),u=h.additions,r=0,s=u.length;s>r;r++)e=u[r],l.call(n,e)<0&&n.push(e);return o.push.apply(o,h.deletions),c={},(t=n.join(""))&&(c.textAdded=t),(i=o.join(""))&&(c.textDeleted=i),c},c.prototype.getMutationsByType=function(t){var e,n,i,o,r;for(o=this.mutations,r=[],e=0,n=o.length;n>e;e++)i=o[e],i.type===t&&r.push(i);return r},c.prototype.getTextChangesFromChildList=function(){var t,e,i,r,s,a,u,c,l,p,d;for(t=[],u=[],a=this.getMutationsByType("childList"),e=0,r=a.length;r>e;e++)s=a[e],t.push.apply(t,s.addedNodes),u.push.apply(u,s.removedNodes);return c=0===t.length&&1===u.length&&n(u[0]),c?(p=[],d=["\n"]):(p=h(t),d=h(u)),{additions:function(){var t,e,n;for(n=[],i=t=0,e=p.length;e>t;i=++t)l=p[i],l!==d[i]&&n.push(o(l));return n}(),deletions:function(){var t,e,n;for(n=[],i=t=0,e=d.length;e>t;i=++t)l=d[i],l!==p[i]&&n.push(o(l));return n}()}},c.prototype.getTextChangesFromCharacterData=function(){var t,e,n,i,s,a,u,c;return e=this.getMutationsByType("characterData"),e.length&&(c=e[0],n=e[e.length-1],s=o(c.oldValue),i=o(n.target.data),a=r(s,i),t=a.added,u=a.removed),{additions:t?[t]:[],deletions:u?[u]:[]}},h=function(t){var e,n,i,o;for(null==t&&(t=[]),o=[],e=0,n=t.length;n>e;e++)switch(i=t[e],i.nodeType){case Node.TEXT_NODE:o.push(i.data);break;case Node.ELEMENT_NODE:"br"===s(i)?o.push("\n"):o.push.apply(o,h(i.childNodes))}return o},c}(e.BasicObject)}.call(this),function(){var t=function(t,e){function i(){this.constructor=t}for(var o in e)n.call(e,o)&&(t[o]=e[o]);return i.prototype=e.prototype,t.prototype=new i,t.__super__=e.prototype,t},n={}.hasOwnProperty;e.FileVerificationOperation=function(e){function n(t){this.file=t}return t(n,e),n.prototype.perform=function(t){var e;return e=new FileReader,e.onerror=function(){return t(!1)},e.onload=function(n){return function(){e.onerror=null;try{e.abort()}catch(i){}return t(!0,n.file)}}(this),e.readAsArrayBuffer(this.file)},n}(e.Operation)}.call(this),function(){var t=function(t,e){function i(){this.constructor=t}for(var o in e)n.call(e,o)&&(t[o]=e[o]);return i.prototype=e.prototype,t.prototype=new i,t.__super__=e.prototype,t},n={}.hasOwnProperty;e.CompositionInput=function(e){function n(t){var e;this.inputController=t,e=this.inputController,this.responder=e.responder,this.delegate=e.delegate,this.inputSummary=e.inputSummary,this.data={}}return t(n,e),n.prototype.start=function(t){var e,n;return this.data.start=t,"keypress"===this.inputSummary.eventName&&this.inputSummary.textAdded&&null!=(e=this.responder)&&e.deleteInDirection("left"),this.selectionIsExpanded()||(this.insertPlaceholder(),this.requestRender()),this.range=null!=(n=this.responder)?n.getSelectedRange():void 0},n.prototype.update=function(t){var e;return this.data.update=t,(e=this.selectPlaceholder())?(this.forgetPlaceholder(),this.range=e):void 0},n.prototype.end=function(t){var e,n,i,o;return this.data.end=t,this.forgetPlaceholder(),this.canApplyToDocument()?(this.setInputSummary({preferDocument:!0}),null!=(e=this.delegate)&&e.inputControllerWillPerformTyping(),null!=(n=this.responder)&&n.setSelectedRange(this.range),null!=(i=this.responder)&&i.insertString(this.data.end),null!=(o=this.responder)?o.setSelectedRange(this.range[0]+this.data.end.length):void 0):null!=this.data.start||null!=this.data.update?(this.requestReparse(),this.inputController.reset()):void 0},n.prototype.getEndData=function(){return this.data.end},n.prototype.isEnded=function(){return null!=this.getEndData()},n.prototype.canApplyToDocument=function(){var t,e;return 0===(null!=(t=this.data.start)?t.length:void 0)&&(null!=(e=this.data.end)?e.length:void 0)>0&&null!=this.range},n.proxyMethod("inputController.setInputSummary"),n.proxyMethod("inputController.requestRender"),n.proxyMethod("inputController.requestReparse"),n.proxyMethod("responder?.selectionIsExpanded"),n.proxyMethod("responder?.insertPlaceholder"),n.proxyMethod("responder?.selectPlaceholder"),n.proxyMethod("responder?.forgetPlaceholder"),n}(e.BasicObject)}.call(this),function(){var t,n,i,o,r,s,a,u,c,l,h,p,d,f=function(t,e){function n(){this.constructor=t}for(var i in e)g.call(e,i)&&(t[i]=e[i]);return n.prototype=e.prototype,t.prototype=new n,t.__super__=e.prototype,t},g={}.hasOwnProperty,m=[].indexOf||function(t){for(var e=0,n=this.length;n>e;e++)if(e in this&&this[e]===t)return e;return-1};o=e.handleEvent,c=e.makeElement,r=e.innerElementIsActive,l=e.objectsAreEqual,p=e.tagName,e.InputController=function(p){function d(t){var n;this.element=t,this.resetInputSummary(),this.mutationObserver=new e.MutationObserver(this.element),this.mutationObserver.delegate=this;for(n in this.events)o(n,{onElement:this.element,withCallback:this.handlerFor(n),inPhase:"capturing"})}var g;return f(d,p),g=0,d.keyNames={8:"backspace",9:"tab",13:"return",37:"left",39:"right",46:"delete",68:"d",72:"h",79:"o"},d.prototype.handlerFor=function(t){return function(e){return function(n){return e.handleInput(function(){return r(this.element)?void 0:(this.eventName=t,this.events[t].call(this,n))})}}(this)},d.prototype.setInputSummary=function(t){var e,n;null==t&&(t={}),this.inputSummary.eventName=this.eventName;for(e in t)n=t[e],this.inputSummary[e]=n;return this.inputSummary},d.prototype.resetInputSummary=function(){return this.inputSummary={}},d.prototype.reset=function(){return this.resetInputSummary(),e.selectionChangeObserver.reset()},d.prototype.editorWillSyncDocumentView=function(){return this.mutationObserver.stop()},d.prototype.editorDidSyncDocumentView=function(){return this.mutationObserver.start()},d.prototype.requestRender=function(){var t;return null!=(t=this.delegate)&&"function"==typeof t.inputControllerDidRequestRender?t.inputControllerDidRequestRender():void 0},d.prototype.requestReparse=function(){var t;return null!=(t=this.delegate)&&"function"==typeof t.inputControllerDidRequestReparse&&t.inputControllerDidRequestReparse(),this.requestRender()},d.prototype.elementDidMutate=function(t){var e;return this.isComposing()?null!=(e=this.delegate)&&"function"==typeof e.inputControllerDidAllowUnhandledInput?e.inputControllerDidAllowUnhandledInput():void 0:this.handleInput(function(){return this.mutationIsSignificant(t)&&(this.mutationIsExpected(t)?this.requestRender():this.requestReparse()),this.reset()})},d.prototype.mutationIsExpected=function(t){var e,n,i,o,r,s,a,u,c,l;return a=t.textAdded,u=t.textDeleted,this.inputSummary.preferDocument?!0:(e=null!=a?a===this.inputSummary.textAdded:!this.inputSummary.textAdded,n=null!=u?this.inputSummary.didDelete:!this.inputSummary.didDelete,c=("\n"===a||" \n"===a)&&!e,l="\n"===u&&!n,s=c&&!l||l&&!c,s&&(o=this.getSelectedRange())&&(i=c?a.replace(/\n$/,"").length||-1:1,null!=(r=this.responder)?r.positionIsBlockBreak(o[1]+i):void 0)?!0:e&&n)},d.prototype.mutationIsSignificant=function(t){var e,n,i;return i=Object.keys(t).length>0,e=""===(null!=(n=this.compositionInput)?n.getEndData():void 0),i||!e},d.prototype.attachFiles=function(t){var n,i;return i=function(){var i,o,r;for(r=[],i=0,o=t.length;o>i;i++)n=t[i],r.push(new e.FileVerificationOperation(n));return r}(),Promise.all(i).then(function(t){return function(e){return t.handleInput(function(){var t,n;return null!=(t=this.delegate)&&t.inputControllerWillAttachFiles(),null!=(n=this.responder)&&n.insertFiles(e),this.requestRender()})}}(this))},d.prototype.events={keydown:function(t){var n,i,o,r,a,u,c,l,h;if(this.isComposing()||this.resetInputSummary(),r=this.constructor.keyNames[t.keyCode]){for(i=this.keys,l=["ctrl","alt","shift","meta"],o=0,u=l.length;u>o;o++)c=l[o],t[c+"Key"]&&("ctrl"===c&&(c="control"),i=null!=i?i[c]:void 0);null!=(null!=i?i[r]:void 0)&&(this.setInputSummary({keyName:r}),e.selectionChangeObserver.reset(),i[r].call(this,t))}return s(t)&&(n=String.fromCharCode(t.keyCode).toLowerCase())&&(a=function(){var e,n,i,o;for(i=["alt","shift"],o=[],e=0,n=i.length;n>e;e++)c=i[e],t[c+"Key"]&&o.push(c);return o}(),a.push(n),null!=(h=this.delegate)?h.inputControllerDidReceiveKeyboardCommand(a):void 0)?t.preventDefault():void 0},keypress:function(t){var e,n,i;if(null==this.inputSummary.eventName&&(!t.metaKey&&!t.ctrlKey||t.altKey)&&!u(t)&&!a(t))return null===t.which?e=String.fromCharCode(t.keyCode):0!==t.which&&0!==t.charCode&&(e=String.fromCharCode(t.charCode)),null!=e?(null!=(n=this.delegate)&&n.inputControllerWillPerformTyping(),null!=(i=this.responder)&&i.insertString(e),this.setInputSummary({textAdded:e,didDelete:this.selectionIsExpanded()})):void 0},textInput:function(t){var e,n,i,o;return e=t.data,o=this.inputSummary.textAdded,o&&o!==e&&o.toUpperCase()===e?(n=this.getSelectedRange(),this.setSelectedRange([n[0],n[1]+o.length]),null!=(i=this.responder)&&i.insertString(e),this.setInputSummary({textAdded:e}),this.setSelectedRange(n)):void 0},dragenter:function(t){return t.preventDefault()},dragstart:function(t){var e,n;return n=t.target,this.serializeSelectionToDataTransfer(t.dataTransfer),this.draggedRange=this.getSelectedRange(),null!=(e=this.delegate)&&"function"==typeof e.inputControllerDidStartDrag?e.inputControllerDidStartDrag():void 0},dragover:function(t){var e,n;return!this.draggedRange&&!this.canAcceptDataTransfer(t.dataTransfer)||(t.preventDefault(),e={x:t.clientX,y:t.clientY},l(e,this.draggingPoint))?void 0:(this.draggingPoint=e,null!=(n=this.delegate)&&"function"==typeof n.inputControllerDidReceiveDragOverPoint?n.inputControllerDidReceiveDragOverPoint(this.draggingPoint):void 0)},dragend:function(){var t;return null!=(t=this.delegate)&&"function"==typeof t.inputControllerDidCancelDrag&&t.inputControllerDidCancelDrag(),this.draggedRange=null,this.draggingPoint=null},drop:function(t){var n,i,o,r,s,a,u,c,l;return t.preventDefault(),o=null!=(s=t.dataTransfer)?s.files:void 0,r={x:t.clientX,y:t.clientY},null!=(a=this.responder)&&a.setLocationRangeFromPointRange(r),(null!=o?o.length:void 0)?this.attachFiles(o):this.draggedRange?(null!=(u=this.delegate)&&u.inputControllerWillMoveText(),null!=(c=this.responder)&&c.moveTextFromRange(this.draggedRange),this.draggedRange=null,this.requestRender()):(i=t.dataTransfer.getData("application/x-trix-document"))&&(n=e.Document.fromJSONString(i),null!=(l=this.responder)&&l.insertDocument(n),this.requestRender()),this.draggedRange=null,this.draggingPoint=null},cut:function(t){var e,n;return(null!=(e=this.responder)?e.selectionIsExpanded():void 0)&&(this.serializeSelectionToDataTransfer(t.clipboardData)&&t.preventDefault(),null!=(n=this.delegate)&&n.inputControllerWillCutText(),this.deleteInDirection("backward"),t.defaultPrevented)?this.requestRender():void 0},copy:function(t){var e;return(null!=(e=this.responder)?e.selectionIsExpanded():void 0)&&this.serializeSelectionToDataTransfer(t.clipboardData)?t.preventDefault():void 0},paste:function(n){var o,r,s,a,u,c,l,p,d,f,y,v,b,A,C,x,w,E,S,k,R,L,D;return c=null!=(p=n.clipboardData)?p:n.testClipboardData,l={paste:c},null==c||h(n)?void this.getPastedHTMLUsingHiddenElement(function(t){return function(e){var n,i,o;return l.html=e,null!=(n=t.delegate)&&n.inputControllerWillPasteText(l),null!=(i=t.responder)&&i.insertHTML(e),t.requestRender(),null!=(o=t.delegate)?o.inputControllerDidPaste(l):void 0}}(this)):((s=c.getData("URL"))?(D=(u=c.getData("public.url-name"))?e.squishBreakableWhitespace(u).trim():s,l.string=D,this.setInputSummary({textAdded:D,didDelete:this.selectionIsExpanded()}),null!=(d=this.delegate)&&d.inputControllerWillPasteText(l),null!=(C=this.responder)&&C.insertText(e.Text.textForStringWithAttributes(D,{href:s})),this.requestRender(),null!=(x=this.delegate)&&x.inputControllerDidPaste(l)):t(c)?(D=c.getData("text/plain"),l.string=D,this.setInputSummary({textAdded:D,didDelete:this.selectionIsExpanded()}),null!=(w=this.delegate)&&w.inputControllerWillPasteText(l),null!=(E=this.responder)&&E.insertString(D),this.requestRender(),null!=(S=this.delegate)&&S.inputControllerDidPaste(l)):(a=c.getData("text/html"))?(l.html=a,null!=(k=this.delegate)&&k.inputControllerWillPasteText(l),null!=(R=this.responder)&&R.insertHTML(a),this.requestRender(),null!=(L=this.delegate)&&L.inputControllerDidPaste(l)):m.call(c.types,"Files")>=0&&(r=null!=(f=c.items)&&null!=(y=f[0])&&"function"==typeof y.getAsFile?y.getAsFile():void 0)&&(!r.name&&(o=i(r))&&(r.name="pasted-file-"+ ++g+"."+o),l.file=r,null!=(v=this.delegate)&&v.inputControllerWillAttachFiles(),null!=(b=this.responder)&&b.insertFile(r),this.requestRender(),null!=(A=this.delegate)&&A.inputControllerDidPaste(l)),n.preventDefault())},compositionstart:function(t){return this.getCompositionInput().start(t.data)},compositionupdate:function(t){return this.getCompositionInput().update(t.data)},compositionend:function(t){return this.getCompositionInput().end(t.data)},input:function(t){return t.stopPropagation()}},d.prototype.keys={backspace:function(t){var e;return null!=(e=this.delegate)&&e.inputControllerWillPerformTyping(),this.deleteInDirection("backward",t)},"delete":function(t){var e;return null!=(e=this.delegate)&&e.inputControllerWillPerformTyping(),this.deleteInDirection("forward",t)},"return":function(){var t,e;return this.setInputSummary({preferDocument:!0}),null!=(t=this.delegate)&&t.inputControllerWillPerformTyping(),null!=(e=this.responder)?e.insertLineBreak():void 0},tab:function(t){var e,n;return(null!=(e=this.responder)?e.canIncreaseNestingLevel():void 0)?(null!=(n=this.responder)&&n.increaseNestingLevel(),this.requestRender(),t.preventDefault()):void 0},left:function(t){var e;return this.selectionIsInCursorTarget()?(t.preventDefault(),null!=(e=this.responder)?e.moveCursorInDirection("backward"):void 0):void 0},right:function(t){var e;return this.selectionIsInCursorTarget()?(t.preventDefault(),null!=(e=this.responder)?e.moveCursorInDirection("forward"):void 0):void 0},control:{d:function(t){var e;return null!=(e=this.delegate)&&e.inputControllerWillPerformTyping(),this.deleteInDirection("forward",t)},h:function(t){var e;return null!=(e=this.delegate)&&e.inputControllerWillPerformTyping(),this.deleteInDirection("backward",t)},o:function(t){var e,n;return t.preventDefault(),null!=(e=this.delegate)&&e.inputControllerWillPerformTyping(),null!=(n=this.responder)&&n.insertString("\n",{updatePosition:!1}),this.requestRender()}},shift:{"return":function(t){var e,n;return null!=(e=this.delegate)&&e.inputControllerWillPerformTyping(),null!=(n=this.responder)&&n.insertString("\n"),this.requestRender(),t.preventDefault()},tab:function(t){var e,n;return(null!=(e=this.responder)?e.canDecreaseNestingLevel():void 0)?(null!=(n=this.responder)&&n.decreaseNestingLevel(),this.requestRender(),t.preventDefault()):void 0},left:function(t){return this.selectionIsInCursorTarget()?(t.preventDefault(),this.expandSelectionInDirection("backward")):void 0},right:function(t){return this.selectionIsInCursorTarget()?(t.preventDefault(),this.expandSelectionInDirection("forward")):void 0}},alt:{backspace:function(){var t;return this.setInputSummary({preferDocument:!1}),null!=(t=this.delegate)?t.inputControllerWillPerformTyping():void 0}},meta:{backspace:function(){var t;return this.setInputSummary({preferDocument:!1}),null!=(t=this.delegate)?t.inputControllerWillPerformTyping():void 0}}},d.prototype.handleInput=function(t){var e,n;try{return null!=(e=this.delegate)&&e.inputControllerWillHandleInput(),t.call(this)}finally{null!=(n=this.delegate)&&n.inputControllerDidHandleInput()}},d.prototype.getCompositionInput=function(){return this.isComposing()?this.compositionInput:this.compositionInput=new e.CompositionInput(this)},d.prototype.isComposing=function(){return null!=this.compositionInput&&!this.compositionInput.isEnded()},d.prototype.deleteInDirection=function(t,e){var n;return(null!=(n=this.responder)?n.deleteInDirection(t):void 0)!==!1?this.setInputSummary({didDelete:!0}):e?(e.preventDefault(),this.requestRender()):void 0},d.prototype.serializeSelectionToDataTransfer=function(t){var i,o;if(n(t))return i=null!=(o=this.responder)?o.getSelectedDocument().toSerializableDocument():void 0,t.setData("application/x-trix-document",JSON.stringify(i)),t.setData("text/html",e.DocumentView.render(i).innerHTML),t.setData("text/plain",i.toString().replace(/\n$/,"")),!0
},d.prototype.canAcceptDataTransfer=function(t){var e,n,i,o,r,s;for(s={},o=null!=(i=null!=t?t.types:void 0)?i:[],e=0,n=o.length;n>e;e++)r=o[e],s[r]=!0;return s.Files||s["application/x-trix-document"]||s["text/html"]||s["text/plain"]},d.prototype.getPastedHTMLUsingHiddenElement=function(t){var e,n,i;return n=this.getSelectedRange(),i={position:"absolute",left:window.pageXOffset+"px",top:window.pageYOffset+"px",opacity:0},e=c({style:i,tagName:"div",editable:!0}),document.body.appendChild(e),e.focus(),requestAnimationFrame(function(i){return function(){var o;return o=e.innerHTML,document.body.removeChild(e),i.setSelectedRange(n),t(o)}}(this))},d.proxyMethod("responder?.getSelectedRange"),d.proxyMethod("responder?.setSelectedRange"),d.proxyMethod("responder?.expandSelectionInDirection"),d.proxyMethod("responder?.selectionIsInCursorTarget"),d.proxyMethod("responder?.selectionIsExpanded"),d}(e.BasicObject),i=function(t){var e,n;return null!=(e=t.type)&&null!=(n=e.match(/\/(\w+)$/))?n[1]:void 0},u=function(t){return t.metaKey&&t.altKey&&!t.shiftKey&&94===t.keyCode},a=function(t){return t.metaKey&&t.altKey&&t.shiftKey&&9674===t.keyCode},s=function(t){return/Mac|^iP/.test(navigator.platform)?t.metaKey:t.ctrlKey},h=function(t){var e,n,i,o;return(o=t.clipboardData)?m.call(o.types,"text/html")>=0?i=o.types.some(function(t){var e,n;return e=/^CorePasteboardFlavorType/.test(t),n=/^dyn\./.test(t)&&o.getData(t),e||n}):(e=m.call(o.types,"com.apple.webarchive")>=0,n=m.call(o.types,"com.apple.flat-rtfd")>=0,e||n):void 0},t=function(t){var e,n,i;return i=t.getData("text/plain"),n=t.getData("text/html"),i&&n?(e=c("div"),e.innerHTML=n,e.textContent===i?!e.querySelector(":not(meta)"):void 0):null!=i?i.length:void 0},d={"application/x-trix-feature-detection":"test"},n=function(t){var e,n;if(null!=(null!=t?t.setData:void 0)){for(e in d)if(n=d[e],!function(){try{return t.setData(e,n),t.getData(e)===n}catch(i){}}())return;return!0}}}.call(this),function(){var t,n,i,o,r,s,a,u=function(t,e){return function(){return t.apply(e,arguments)}},c=function(t,e){function n(){this.constructor=t}for(var i in e)l.call(e,i)&&(t[i]=e[i]);return n.prototype=e.prototype,t.prototype=new n,t.__super__=e.prototype,t},l={}.hasOwnProperty;n=e.handleEvent,r=e.makeElement,a=e.tagName,i=e.InputController.keyNames,s=e.config,o=s.lang,t=s.css,e.AttachmentEditorController=function(e){function s(t,e,n){this.attachmentPiece=t,this.element=e,this.container=n,this.didBlurCaption=u(this.didBlurCaption,this),this.didChangeCaption=u(this.didChangeCaption,this),this.didInputCaption=u(this.didInputCaption,this),this.didKeyDownCaption=u(this.didKeyDownCaption,this),this.didClickCaption=u(this.didClickCaption,this),this.didClickRemoveButton=u(this.didClickRemoveButton,this),this.attachment=this.attachmentPiece.attachment,"a"===a(this.element)&&(this.element=this.element.firstChild),this.install()}var l;return c(s,e),l=function(t){return function(){var e;return e=t.apply(this,arguments),e["do"](),null==this.undos&&(this.undos=[]),this.undos.push(e.undo)}},s.prototype.install=function(){return this.makeElementMutable(),this.attachment.isPreviewable()&&this.makeCaptionEditable(),this.addRemoveButton()},s.prototype.uninstall=function(){var t,e;for(this.savePendingCaption();e=this.undos.pop();)e();return null!=(t=this.delegate)?t.didUninstallAttachmentEditor(this):void 0},s.prototype.savePendingCaption=function(){var t,e,n;return null!=this.pendingCaption?(t=this.pendingCaption,this.pendingCaption=null,t?null!=(e=this.delegate)&&"function"==typeof e.attachmentEditorDidRequestUpdatingAttributesForAttachment?e.attachmentEditorDidRequestUpdatingAttributesForAttachment({caption:t},this.attachment):void 0:null!=(n=this.delegate)&&"function"==typeof n.attachmentEditorDidRequestRemovingAttributeForAttachment?n.attachmentEditorDidRequestRemovingAttributeForAttachment("caption",this.attachment):void 0):void 0},s.prototype.makeElementMutable=l(function(){return{"do":function(t){return function(){return t.element.dataset.trixMutable=!0}}(this),undo:function(t){return function(){return delete t.element.dataset.trixMutable}}(this)}}),s.prototype.makeCaptionEditable=l(function(){var t,e;return t=this.element.querySelector("figcaption"),e=null,{"do":function(i){return function(){return e=n("click",{onElement:t,withCallback:i.didClickCaption,inPhase:"capturing"})}}(this),undo:function(){return function(){return e.destroy()}}(this)}}),s.prototype.addRemoveButton=l(function(){var e;return e=r({tagName:"button",textContent:o.remove,className:t.attachmentRemove+" "+t.attachmentRemove+"--icon",attributes:{type:"button",title:o.remove},data:{trixMutable:!0}}),n("click",{onElement:e,withCallback:this.didClickRemoveButton}),{"do":function(t){return function(){return t.element.appendChild(e)}}(this),undo:function(t){return function(){return t.element.removeChild(e)}}(this)}}),s.prototype.editCaption=l(function(){var e,i,s,a,u;return a=r({tagName:"textarea",className:t.attachmentCaptionEditor,attributes:{placeholder:o.captionPlaceholder}}),a.value=this.attachmentPiece.getCaption(),u=a.cloneNode(),u.classList.add("trix-autoresize-clone"),e=function(){return u.value=a.value,a.style.height=u.scrollHeight+"px"},n("keydown",{onElement:a,withCallback:this.didKeyDownCaption}),n("input",{onElement:a,withCallback:this.didInputCaption}),n("change",{onElement:a,withCallback:this.didChangeCaption}),n("blur",{onElement:a,withCallback:this.didBlurCaption}),s=this.element.querySelector("figcaption"),i=s.cloneNode(),{"do":function(){return s.style.display="none",i.appendChild(a),i.appendChild(u),i.classList.add(t.attachmentCaption+"--editing"),s.parentElement.insertBefore(i,s),e(),a.focus()},undo:function(){return i.parentNode.removeChild(i),s.style.display=null}}}),s.prototype.didClickRemoveButton=function(t){var e;return t.preventDefault(),t.stopPropagation(),null!=(e=this.delegate)?e.attachmentEditorDidRequestRemovalOfAttachment(this.attachment):void 0},s.prototype.didClickCaption=function(t){return t.preventDefault(),this.editCaption()},s.prototype.didKeyDownCaption=function(t){var e;return"return"===i[t.keyCode]?(t.preventDefault(),this.savePendingCaption(),null!=(e=this.delegate)&&"function"==typeof e.attachmentEditorDidRequestDeselectingAttachment?e.attachmentEditorDidRequestDeselectingAttachment(this.attachment):void 0):void 0},s.prototype.didInputCaption=function(t){return this.pendingCaption=t.target.value.replace(/\s/g," ").trim()},s.prototype.didChangeCaption=function(){return this.savePendingCaption()},s.prototype.didBlurCaption=function(){return this.savePendingCaption()},s}(e.BasicObject)}.call(this),function(){var t,n,i,o=function(t,e){function n(){this.constructor=t}for(var i in e)r.call(e,i)&&(t[i]=e[i]);return n.prototype=e.prototype,t.prototype=new n,t.__super__=e.prototype,t},r={}.hasOwnProperty;i=e.makeElement,t=e.config.css,e.AttachmentView=function(r){function s(){s.__super__.constructor.apply(this,arguments),this.attachment=this.object,this.attachment.uploadProgressDelegate=this,this.attachmentPiece=this.options.piece}var a;return o(s,r),s.attachmentSelector="[data-trix-attachment]",s.prototype.createContentNodes=function(){return[]},s.prototype.createNodes=function(){var e,n,o,r,s,u,c,l,h,p,d;if(r=i({tagName:"figure",className:this.getClassName()}),this.attachment.hasContent())r.innerHTML=this.attachment.getContent();else for(p=this.createContentNodes(),u=0,l=p.length;l>u;u++)h=p[u],r.appendChild(h);r.appendChild(this.createCaptionElement()),n={trixAttachment:JSON.stringify(this.attachment),trixContentType:this.attachment.getContentType(),trixId:this.attachment.id},e=this.attachmentPiece.getAttributesForAttachment(),e.isEmpty()||(n.trixAttributes=JSON.stringify(e)),this.attachment.isPending()&&(this.progressElement=i({tagName:"progress",attributes:{"class":t.attachmentProgress,value:this.attachment.getUploadProgress(),max:100},data:{trixMutable:!0,trixStoreKey:["progressElement",this.attachment.id].join("/")}}),r.appendChild(this.progressElement),n.trixSerialize=!1),(s=this.getHref())?(o=i("a",{href:s}),o.appendChild(r)):o=r;for(c in n)d=n[c],o.dataset[c]=d;return o.setAttribute("contenteditable",!1),[a("left"),o,a("right")]},s.prototype.createCaptionElement=function(){var e,n,o,r,s,a,u;return o=i({tagName:"figcaption",className:t.attachmentCaption}),(e=this.attachmentPiece.getCaption())?(o.classList.add(t.attachmentCaption+"--edited"),o.textContent=e):(n=this.getCaptionConfig(),n.name&&(r=this.attachment.getFilename()),n.size&&(a=this.attachment.getFormattedFilesize()),r&&(s=i({tagName:"span",className:t.attachmentName,textContent:r}),o.appendChild(s)),a&&(r&&o.appendChild(document.createTextNode(" ")),u=i({tagName:"span",className:t.attachmentSize,textContent:a}),o.appendChild(u))),o},s.prototype.getClassName=function(){var e,n;return n=[t.attachment,t.attachment+"--"+this.attachment.getType()],(e=this.attachment.getExtension())&&n.push(t.attachment+"--"+e),n.join(" ")},s.prototype.getHref=function(){return n(this.attachment.getContent(),"a")?void 0:this.attachment.getHref()},s.prototype.getCaptionConfig=function(){var t,n,i;return i=this.attachment.getType(),t=e.copyObject(null!=(n=e.config.attachments[i])?n.caption:void 0),"file"===i&&(t.name=!0),t},s.prototype.findProgressElement=function(){var t;return null!=(t=this.findElement())?t.querySelector("progress"):void 0},a=function(t){return i({tagName:"span",textContent:e.ZERO_WIDTH_SPACE,data:{trixCursorTarget:t,trixSerialize:!1}})},s.prototype.attachmentDidChangeUploadProgress=function(){var t,e;return e=this.attachment.getUploadProgress(),null!=(t=this.findProgressElement())?t.value=e:void 0},s}(e.ObjectView),n=function(t,e){var n;return n=i("div"),n.innerHTML=null!=t?t:"",n.querySelector(e)}}.call(this),function(){var t,n=function(t,e){function n(){this.constructor=t}for(var o in e)i.call(e,o)&&(t[o]=e[o]);return n.prototype=e.prototype,t.prototype=new n,t.__super__=e.prototype,t},i={}.hasOwnProperty;t=e.makeElement,e.PreviewableAttachmentView=function(i){function o(){o.__super__.constructor.apply(this,arguments),this.attachment.previewDelegate=this}return n(o,i),o.prototype.createContentNodes=function(){return this.image=t({tagName:"img",attributes:{src:""},data:{trixMutable:!0}}),this.refresh(this.image),[this.image]},o.prototype.createCaptionElement=function(){var t;return t=o.__super__.createCaptionElement.apply(this,arguments),t.textContent||t.setAttribute("data-trix-placeholder",e.config.lang.captionPlaceholder),t},o.prototype.refresh=function(t){var e;return null==t&&(t=null!=(e=this.findElement())?e.querySelector("img"):void 0),t?this.updateAttributesForImage(t):void 0},o.prototype.updateAttributesForImage=function(t){var e,n,i,o,r,s;return r=this.attachment.getURL(),n=this.attachment.getPreviewURL(),t.src=n||r,n===r?t.removeAttribute("data-trix-serialized-attributes"):(i=JSON.stringify({src:r}),t.setAttribute("data-trix-serialized-attributes",i)),s=this.attachment.getWidth(),e=this.attachment.getHeight(),null!=s&&(t.width=s),null!=e&&(t.height=e),o=["imageElement",this.attachment.id,t.src,t.width,t.height].join("/"),t.dataset.trixStoreKey=o},o.prototype.attachmentDidChangeAttributes=function(){return this.refresh(this.image),this.refresh()},o}(e.AttachmentView)}.call(this),function(){var t,n,i,o=function(t,e){function n(){this.constructor=t}for(var i in e)r.call(e,i)&&(t[i]=e[i]);return n.prototype=e.prototype,t.prototype=new n,t.__super__=e.prototype,t},r={}.hasOwnProperty;i=e.makeElement,t=e.findInnerElement,n=e.getTextConfig,e.PieceView=function(r){function s(){var t;s.__super__.constructor.apply(this,arguments),this.piece=this.object,this.attributes=this.piece.getAttributes(),t=this.options,this.textConfig=t.textConfig,this.context=t.context,this.piece.attachment?this.attachment=this.piece.attachment:this.string=this.piece.toString()}var a;return o(s,r),s.prototype.createNodes=function(){var e,n,i,o,r,s;if(s=this.attachment?this.createAttachmentNodes():this.createStringNodes(),e=this.createElement()){for(i=t(e),n=0,o=s.length;o>n;n++)r=s[n],i.appendChild(r);s=[e]}return s},s.prototype.createAttachmentNodes=function(){var t,n;return t=this.attachment.isPreviewable()?e.PreviewableAttachmentView:e.AttachmentView,n=this.createChildView(t,this.piece.attachment,{piece:this.piece}),n.getNodes()},s.prototype.createStringNodes=function(){var t,e,n,o,r,s,a,u,c,l;if(null!=(u=this.textConfig)?u.plaintext:void 0)return[document.createTextNode(this.string)];for(a=[],c=this.string.split("\n"),n=e=0,o=c.length;o>e;n=++e)l=c[n],n>0&&(t=i("br"),a.push(t)),(r=l.length)&&(s=document.createTextNode(this.preserveSpaces(l)),a.push(s));return a},s.prototype.createElement=function(){var t,e,o,r,s,a,u,c,l;c={},a=this.attributes;for(r in a)if(l=a[r],(t=n(r))&&(t.tagName&&(s=i(t.tagName),o?(o.appendChild(s),o=s):e=o=s),t.styleProperty&&(c[t.styleProperty]=l),t.style)){u=t.style;for(r in u)l=u[r],c[r]=l}if(Object.keys(c).length){null==e&&(e=i("span"));for(r in c)l=c[r],e.style[r]=l}return e},s.prototype.createContainerElement=function(){var t,e,o,r,s;r=this.attributes;for(o in r)if(s=r[o],(e=n(o))&&e.groupTagName)return t={},t[o]=s,i(e.groupTagName,t)},a=e.NON_BREAKING_SPACE,s.prototype.preserveSpaces=function(t){return this.context.isLast&&(t=t.replace(/\ $/,a)),t=t.replace(/(\S)\ {3}(\S)/g,"$1 "+a+" $2").replace(/\ {2}/g,a+" ").replace(/\ {2}/g," "+a),(this.context.isFirst||this.context.followsWhitespace)&&(t=t.replace(/^\ /,a)),t},s}(e.ObjectView)}.call(this),function(){var t=function(t,e){function i(){this.constructor=t}for(var o in e)n.call(e,o)&&(t[o]=e[o]);return i.prototype=e.prototype,t.prototype=new i,t.__super__=e.prototype,t},n={}.hasOwnProperty;e.TextView=function(n){function i(){i.__super__.constructor.apply(this,arguments),this.text=this.object,this.textConfig=this.options.textConfig}var o;return t(i,n),i.prototype.createNodes=function(){var t,n,i,r,s,a,u,c,l,h;for(a=[],c=e.ObjectGroup.groupObjects(this.getPieces()),r=c.length-1,i=n=0,s=c.length;s>n;i=++n)u=c[i],t={},0===i&&(t.isFirst=!0),i===r&&(t.isLast=!0),o(l)&&(t.followsWhitespace=!0),h=this.findOrCreateCachedChildView(e.PieceView,u,{textConfig:this.textConfig,context:t}),a.push.apply(a,h.getNodes()),l=u;return a},i.prototype.getPieces=function(){var t,e,n,i,o;for(i=this.text.getPieces(),o=[],t=0,e=i.length;e>t;t++)n=i[t],n.hasAttribute("blockBreak")||o.push(n);return o},o=function(t){return/\s$/.test(null!=t?t.toString():void 0)},i}(e.ObjectView)}.call(this),function(){var t,n,i=function(t,e){function n(){this.constructor=t}for(var i in e)o.call(e,i)&&(t[i]=e[i]);return n.prototype=e.prototype,t.prototype=new n,t.__super__=e.prototype,t},o={}.hasOwnProperty;n=e.makeElement,t=e.getBlockConfig,e.BlockView=function(o){function r(){r.__super__.constructor.apply(this,arguments),this.block=this.object,this.attributes=this.block.getAttributes()}return i(r,o),r.prototype.createNodes=function(){var i,o,r,s,a,u,c,l,h;if(i=document.createComment("block"),u=[i],this.block.isEmpty()?u.push(n("br")):(l=null!=(c=t(this.block.getLastAttribute()))?c.text:void 0,h=this.findOrCreateCachedChildView(e.TextView,this.block.text,{textConfig:l}),u.push.apply(u,h.getNodes()),this.shouldAddExtraNewlineElement()&&u.push(n("br"))),this.attributes.length)return u;for(o=n(e.config.blockAttributes["default"].tagName),r=0,s=u.length;s>r;r++)a=u[r],o.appendChild(a);return[o]},r.prototype.createContainerElement=function(e){var i,o;return i=this.attributes[e],o=t(i),n(o.tagName)},r.prototype.shouldAddExtraNewlineElement=function(){return/\n\n$/.test(this.block.toString())},r}(e.ObjectView)}.call(this),function(){var t,n,i=function(t,e){function n(){this.constructor=t}for(var i in e)o.call(e,i)&&(t[i]=e[i]);return n.prototype=e.prototype,t.prototype=new n,t.__super__=e.prototype,t},o={}.hasOwnProperty;t=e.defer,n=e.makeElement,e.DocumentView=function(o){function r(){r.__super__.constructor.apply(this,arguments),this.element=this.options.element,this.elementStore=new e.ElementStore,this.setDocument(this.object)}var s,a,u;return i(r,o),r.render=function(t){var e,i;return e=n("div"),i=new this(t,{element:e}),i.render(),i.sync(),e},r.prototype.setDocument=function(t){return t.isEqualTo(this.document)?void 0:this.document=this.object=t},r.prototype.render=function(){var t,i,o,r,s,a,u;if(this.childViews=[],this.shadowElement=n("div"),!this.document.isEmpty()){for(s=e.ObjectGroup.groupObjects(this.document.getBlocks(),{asTree:!0}),a=[],t=0,i=s.length;i>t;t++)r=s[t],u=this.findOrCreateCachedChildView(e.BlockView,r),a.push(function(){var t,e,n,i;for(n=u.getNodes(),i=[],t=0,e=n.length;e>t;t++)o=n[t],i.push(this.shadowElement.appendChild(o));return i}.call(this));return a}},r.prototype.isSynced=function(){return s(this.shadowElement,this.element)},r.prototype.sync=function(){var t;for(t=this.createDocumentFragmentForSync();this.element.lastChild;)this.element.removeChild(this.element.lastChild);return this.element.appendChild(t),this.didSync()},r.prototype.didSync=function(){return this.elementStore.reset(a(this.element)),t(function(t){return function(){return t.garbageCollectCachedViews()}}(this))},r.prototype.createDocumentFragmentForSync=function(){var t,e,n,i,o,r,s,u,c,l;for(e=document.createDocumentFragment(),u=this.shadowElement.childNodes,n=0,o=u.length;o>n;n++)s=u[n],e.appendChild(s.cloneNode(!0));for(c=a(e),i=0,r=c.length;r>i;i++)t=c[i],(l=this.elementStore.remove(t))&&t.parentNode.replaceChild(l,t);return e},a=function(t){return t.querySelectorAll("[data-trix-store-key]")},s=function(t,e){return u(t.innerHTML)===u(e.innerHTML)},u=function(t){return t.replace(/&nbsp;/g," ")},r}(e.ObjectView)}.call(this),function(){var t,n,i,o,r=function(t,e){return function(){return t.apply(e,arguments)}},s=function(t,e){function n(){this.constructor=t}for(var i in e)a.call(e,i)&&(t[i]=e[i]);return n.prototype=e.prototype,t.prototype=new n,t.__super__=e.prototype,t},a={}.hasOwnProperty;i=e.handleEvent,o=e.innerElementIsActive,n=e.defer,t=e.AttachmentView.attachmentSelector,e.CompositionController=function(a){function u(n,o){this.element=n,this.composition=o,this.didClickAttachment=r(this.didClickAttachment,this),this.didBlur=r(this.didBlur,this),this.didFocus=r(this.didFocus,this),this.documentView=new e.DocumentView(this.composition.document,{element:this.element}),i("focus",{onElement:this.element,withCallback:this.didFocus}),i("blur",{onElement:this.element,withCallback:this.didBlur}),i("click",{onElement:this.element,matchingSelector:"a[contenteditable=false]",preventDefault:!0}),i("mousedown",{onElement:this.element,matchingSelector:t,withCallback:this.didClickAttachment}),i("click",{onElement:this.element,matchingSelector:"a"+t,preventDefault:!0})}return s(u,a),u.prototype.didFocus=function(){var t,e,n;return t=function(t){return function(){var e;return t.focused?void 0:(t.focused=!0,null!=(e=t.delegate)&&"function"==typeof e.compositionControllerDidFocus?e.compositionControllerDidFocus():void 0)}}(this),null!=(e=null!=(n=this.blurPromise)?n.then(t):void 0)?e:t()},u.prototype.didBlur=function(){return this.blurPromise=new Promise(function(t){return function(e){return n(function(){var n;return o(t.element)||(t.focused=null,null!=(n=t.delegate)&&"function"==typeof n.compositionControllerDidBlur&&n.compositionControllerDidBlur()),t.blurPromise=null,e()})}}(this))},u.prototype.didClickAttachment=function(t,e){var n,i;return n=this.findAttachmentForElement(e),null!=(i=this.delegate)&&"function"==typeof i.compositionControllerDidSelectAttachment?i.compositionControllerDidSelectAttachment(n):void 0},u.prototype.render=function(){var t,e,n;return this.revision!==this.composition.revision&&(this.documentView.setDocument(this.composition.document),this.documentView.render(),this.revision=this.composition.revision),this.documentView.isSynced()||(null!=(t=this.delegate)&&"function"==typeof t.compositionControllerWillSyncDocumentView&&t.compositionControllerWillSyncDocumentView(),this.documentView.sync(),this.reinstallAttachmentEditor(),null!=(e=this.delegate)&&"function"==typeof e.compositionControllerDidSyncDocumentView&&e.compositionControllerDidSyncDocumentView()),null!=(n=this.delegate)&&"function"==typeof n.compositionControllerDidRender?n.compositionControllerDidRender():void 0},u.prototype.rerenderViewForObject=function(t){return this.invalidateViewForObject(t),this.render()},u.prototype.invalidateViewForObject=function(t){return this.documentView.invalidateViewForObject(t)},u.prototype.isViewCachingEnabled=function(){return this.documentView.isViewCachingEnabled()},u.prototype.enableViewCaching=function(){return this.documentView.enableViewCaching()},u.prototype.disableViewCaching=function(){return this.documentView.disableViewCaching()},u.prototype.refreshViewCache=function(){return this.documentView.garbageCollectCachedViews()},u.prototype.installAttachmentEditorForAttachment=function(t){var n,i,o;if((null!=(o=this.attachmentEditor)?o.attachment:void 0)!==t&&(i=this.documentView.findElementForObject(t)))return this.uninstallAttachmentEditor(),n=this.composition.document.getAttachmentPieceForAttachment(t),this.attachmentEditor=new e.AttachmentEditorController(n,i,this.element),this.attachmentEditor.delegate=this},u.prototype.uninstallAttachmentEditor=function(){var t;return null!=(t=this.attachmentEditor)?t.uninstall():void 0},u.prototype.reinstallAttachmentEditor=function(){var t;return this.attachmentEditor?(t=this.attachmentEditor.attachment,this.uninstallAttachmentEditor(),this.installAttachmentEditorForAttachment(t)):void 0},u.prototype.editAttachmentCaption=function(){var t;return null!=(t=this.attachmentEditor)?t.editCaption():void 0},u.prototype.didUninstallAttachmentEditor=function(){return this.attachmentEditor=null,this.render()},u.prototype.attachmentEditorDidRequestUpdatingAttributesForAttachment=function(t,e){var n;return null!=(n=this.delegate)&&"function"==typeof n.compositionControllerWillUpdateAttachment&&n.compositionControllerWillUpdateAttachment(e),this.composition.updateAttributesForAttachment(t,e)},u.prototype.attachmentEditorDidRequestRemovingAttributeForAttachment=function(t,e){var n;return null!=(n=this.delegate)&&"function"==typeof n.compositionControllerWillUpdateAttachment&&n.compositionControllerWillUpdateAttachment(e),this.composition.removeAttributeForAttachment(t,e)},u.prototype.attachmentEditorDidRequestRemovalOfAttachment=function(t){var e;return null!=(e=this.delegate)&&"function"==typeof e.compositionControllerDidRequestRemovalOfAttachment?e.compositionControllerDidRequestRemovalOfAttachment(t):void 0},u.prototype.attachmentEditorDidRequestDeselectingAttachment=function(t){var e;return null!=(e=this.delegate)&&"function"==typeof e.compositionControllerDidRequestDeselectingAttachment?e.compositionControllerDidRequestDeselectingAttachment(t):void 0},u.prototype.findAttachmentForElement=function(t){return this.composition.document.getAttachmentById(parseInt(t.dataset.trixId,10))},u}(e.BasicObject)}.call(this),function(){var t,n,i,o=function(t,e){return function(){return t.apply(e,arguments)}},r=function(t,e){function n(){this.constructor=t}for(var i in e)s.call(e,i)&&(t[i]=e[i]);return n.prototype=e.prototype,t.prototype=new n,t.__super__=e.prototype,t},s={}.hasOwnProperty;n=e.handleEvent,i=e.triggerEvent,t=e.findClosestElementFromNode,e.ToolbarController=function(e){function s(t){this.element=t,this.didKeyDownDialogInput=o(this.didKeyDownDialogInput,this),this.didClickDialogButton=o(this.didClickDialogButton,this),this.didClickAttributeButton=o(this.didClickAttributeButton,this),this.didClickActionButton=o(this.didClickActionButton,this),this.attributes={},this.actions={},this.resetDialogInputs(),n("mousedown",{onElement:this.element,matchingSelector:a,withCallback:this.didClickActionButton}),n("mousedown",{onElement:this.element,matchingSelector:c,withCallback:this.didClickAttributeButton}),n("click",{onElement:this.element,matchingSelector:y,preventDefault:!0}),n("click",{onElement:this.element,matchingSelector:l,withCallback:this.didClickDialogButton}),n("keydown",{onElement:this.element,matchingSelector:h,withCallback:this.didKeyDownDialogInput})}var a,u,c,l,h,p,d,f,g,m,y;return r(s,e),c="[data-trix-attribute]",a="[data-trix-action]",y=c+", "+a,p="[data-trix-dialog]",u=p+"[data-trix-active]",l=p+" [data-trix-method]",h=p+" [data-trix-input]",s.prototype.didClickActionButton=function(t,e){var n,i,o;return null!=(i=this.delegate)&&i.toolbarDidClickButton(),t.preventDefault(),n=d(e),this.getDialog(n)?this.toggleDialog(n):null!=(o=this.delegate)?o.toolbarDidInvokeAction(n):void 0},s.prototype.didClickAttributeButton=function(t,e){var n,i,o;return null!=(i=this.delegate)&&i.toolbarDidClickButton(),t.preventDefault(),n=f(e),this.getDialog(n)?this.toggleDialog(n):null!=(o=this.delegate)&&o.toolbarDidToggleAttribute(n),this.refreshAttributeButtons()},s.prototype.didClickDialogButton=function(e,n){var i,o;return i=t(n,{matchingSelector:p}),o=n.getAttribute("data-trix-method"),this[o].call(this,i)},s.prototype.didKeyDownDialogInput=function(t,e){var n,i;return 13===t.keyCode&&(t.preventDefault(),n=e.getAttribute("name"),i=this.getDialog(n),this.setAttribute(i)),27===t.keyCode?(t.preventDefault(),this.hideDialog()):void 0},s.prototype.updateActions=function(t){return this.actions=t,this.refreshActionButtons()},s.prototype.refreshActionButtons=function(){return this.eachActionButton(function(t){return function(e,n){return e.disabled=t.actions[n]===!1}}(this))},s.prototype.eachActionButton=function(t){var e,n,i,o,r;for(o=this.element.querySelectorAll(a),r=[],n=0,i=o.length;i>n;n++)e=o[n],r.push(t(e,d(e)));return r},s.prototype.updateAttributes=function(t){return this.attributes=t,this.refreshAttributeButtons()},s.prototype.refreshAttributeButtons=function(){return this.eachAttributeButton(function(t){return function(e,n){return e.disabled=t.attributes[n]===!1,t.attributes[n]||t.dialogIsVisible(n)?(e.setAttribute("data-trix-active",""),e.classList.add("trix-active")):(e.removeAttribute("data-trix-active"),e.classList.remove("trix-active"))}}(this))},s.prototype.eachAttributeButton=function(t){var e,n,i,o,r;for(o=this.element.querySelectorAll(c),r=[],n=0,i=o.length;i>n;n++)e=o[n],r.push(t(e,f(e)));return r},s.prototype.applyKeyboardCommand=function(t){var e,n,o,r,s,a,u;for(s=JSON.stringify(t.sort()),u=this.element.querySelectorAll("[data-trix-key]"),r=0,a=u.length;a>r;r++)if(e=u[r],o=e.getAttribute("data-trix-key").split("+"),n=JSON.stringify(o.sort()),n===s)return i("mousedown",{onElement:e}),!0;return!1},s.prototype.dialogIsVisible=function(t){var e;return(e=this.getDialog(t))?e.hasAttribute("data-trix-active"):void 0},s.prototype.toggleDialog=function(t){return this.dialogIsVisible(t)?this.hideDialog():this.showDialog(t)},s.prototype.showDialog=function(t){var e,n,i,o,r,s,a,u,c,l;for(this.hideDialog(),null!=(a=this.delegate)&&a.toolbarWillShowDialog(),i=this.getDialog(t),i.setAttribute("data-trix-active",""),i.classList.add("trix-active"),u=i.querySelectorAll("input[disabled]"),o=0,s=u.length;s>o;o++)n=u[o],n.removeAttribute("disabled");return(e=f(i))&&(r=m(i,t))&&(r.value=null!=(c=this.attributes[e])?c:"",r.select()),null!=(l=this.delegate)?l.toolbarDidShowDialog(t):void 0},s.prototype.setAttribute=function(t){var e,n,i;return e=f(t),n=m(t,e),n.willValidate&&!n.checkValidity()?(n.setAttribute("data-trix-validate",""),n.classList.add("trix-validate"),n.focus()):(null!=(i=this.delegate)&&i.toolbarDidUpdateAttribute(e,n.value),this.hideDialog())},s.prototype.removeAttribute=function(t){var e,n;return e=f(t),null!=(n=this.delegate)&&n.toolbarDidRemoveAttribute(e),this.hideDialog()},s.prototype.hideDialog=function(){var t,e;return(t=this.element.querySelector(u))?(t.removeAttribute("data-trix-active"),t.classList.remove("trix-active"),this.resetDialogInputs(),null!=(e=this.delegate)?e.toolbarDidHideDialog(g(t)):void 0):void 0},s.prototype.resetDialogInputs=function(){var t,e,n,i,o;for(i=this.element.querySelectorAll(h),o=[],t=0,n=i.length;n>t;t++)e=i[t],e.setAttribute("disabled","disabled"),e.removeAttribute("data-trix-validate"),o.push(e.classList.remove("trix-validate"));return o},s.prototype.getDialog=function(t){return this.element.querySelector("[data-trix-dialog="+t+"]")},m=function(t,e){return null==e&&(e=f(t)),t.querySelector("[data-trix-input][name='"+e+"']")},d=function(t){return t.getAttribute("data-trix-action")},f=function(t){var e;return null!=(e=t.getAttribute("data-trix-attribute"))?e:t.getAttribute("data-trix-dialog-attribute")},g=function(t){return t.getAttribute("data-trix-dialog")},s}(e.BasicObject)}.call(this),function(){var t=function(t,e){function i(){this.constructor=t}for(var o in e)n.call(e,o)&&(t[o]=e[o]);return i.prototype=e.prototype,t.prototype=new i,t.__super__=e.prototype,t},n={}.hasOwnProperty;e.ImagePreloadOperation=function(e){function n(t){this.url=t}return t(n,e),n.prototype.perform=function(t){var e;return e=new Image,e.onload=function(n){return function(){return e.width=n.width=e.naturalWidth,e.height=n.height=e.naturalHeight,t(!0,e)}}(this),e.onerror=function(){return t(!1)},e.src=this.url},n}(e.Operation)}.call(this),function(){var t=function(t,e){return function(){return t.apply(e,arguments)}},n=function(t,e){function n(){this.constructor=t}for(var o in e)i.call(e,o)&&(t[o]=e[o]);return n.prototype=e.prototype,t.prototype=new n,t.__super__=e.prototype,t},i={}.hasOwnProperty;e.Attachment=function(i){function o(n){null==n&&(n={}),this.releaseFile=t(this.releaseFile,this),o.__super__.constructor.apply(this,arguments),this.attributes=e.Hash.box(n),this.didChangeAttributes()}return n(o,i),o.previewablePattern=/^image(\/(gif|png|jpe?g)|$)/,o.attachmentForFile=function(t){var e,n;return n=this.attributesForFile(t),e=new this(n),e.setFile(t),e},o.attributesForFile=function(t){return new e.Hash({filename:t.name,filesize:t.size,contentType:t.type})},o.fromJSON=function(t){return new this(t)},o.prototype.getAttribute=function(t){return this.attributes.get(t)},o.prototype.hasAttribute=function(t){return this.attributes.has(t)},o.prototype.getAttributes=function(){return this.attributes.toObject()},o.prototype.setAttributes=function(t){var e,n,i;return null==t&&(t={}),e=this.attributes.merge(t),this.attributes.isEqualTo(e)?void 0:(this.attributes=e,this.didChangeAttributes(),null!=(n=this.previewDelegate)&&"function"==typeof n.attachmentDidChangeAttributes&&n.attachmentDidChangeAttributes(this),null!=(i=this.delegate)&&"function"==typeof i.attachmentDidChangeAttributes?i.attachmentDidChangeAttributes(this):void 0)},o.prototype.didChangeAttributes=function(){return this.isPreviewable()?this.preloadURL():void 0},o.prototype.isPending=function(){return null!=this.file&&!(this.getURL()||this.getHref())},o.prototype.isPreviewable=function(){return this.attributes.has("previewable")?this.attributes.get("previewable"):this.constructor.previewablePattern.test(this.getContentType())},o.prototype.getType=function(){return this.hasContent()?"content":this.isPreviewable()?"preview":"file"},o.prototype.getURL=function(){return this.attributes.get("url")},o.prototype.getHref=function(){return this.attributes.get("href")},o.prototype.getFilename=function(){var t;return null!=(t=this.attributes.get("filename"))?t:""},o.prototype.getFilesize=function(){return this.attributes.get("filesize")},o.prototype.getFormattedFilesize=function(){var t;return t=this.attributes.get("filesize"),"number"==typeof t?e.config.fileSize.formatter(t):""},o.prototype.getExtension=function(){var t;return null!=(t=this.getFilename().match(/\.(\w+)$/))?t[1].toLowerCase():void 0},o.prototype.getContentType=function(){return this.attributes.get("contentType")},o.prototype.hasContent=function(){return this.attributes.has("content")},o.prototype.getContent=function(){return this.attributes.get("content")},o.prototype.getWidth=function(){return this.attributes.get("width")},o.prototype.getHeight=function(){return this.attributes.get("height")},o.prototype.getFile=function(){return this.file},o.prototype.setFile=function(t){return this.file=t,this.isPreviewable()?this.preloadFile():void 0},o.prototype.releaseFile=function(){return this.releasePreloadedFile(),this.file=null},o.prototype.getUploadProgress=function(){var t;return null!=(t=this.uploadProgress)?t:0},o.prototype.setUploadProgress=function(t){var e;return this.uploadProgress!==t?(this.uploadProgress=t,null!=(e=this.uploadProgressDelegate)&&"function"==typeof e.attachmentDidChangeUploadProgress?e.attachmentDidChangeUploadProgress(this):void 0):void 0},o.prototype.toJSON=function(){return this.getAttributes()},o.prototype.getCacheKey=function(){return[o.__super__.getCacheKey.apply(this,arguments),this.attributes.getCacheKey(),this.getPreviewURL()].join("/")},o.prototype.getPreviewURL=function(){return this.previewURL||this.preloadingURL
},o.prototype.setPreviewURL=function(t){var e,n;return t!==this.getPreviewURL()?(this.previewURL=t,null!=(e=this.previewDelegate)&&"function"==typeof e.attachmentDidChangeAttributes&&e.attachmentDidChangeAttributes(this),null!=(n=this.delegate)&&"function"==typeof n.attachmentDidChangePreviewURL?n.attachmentDidChangePreviewURL(this):void 0):void 0},o.prototype.preloadURL=function(){return this.preload(this.getURL(),this.releaseFile)},o.prototype.preloadFile=function(){return this.file?(this.fileObjectURL=URL.createObjectURL(this.file),this.preload(this.fileObjectURL)):void 0},o.prototype.releasePreloadedFile=function(){return this.fileObjectURL?(URL.revokeObjectURL(this.fileObjectURL),this.fileObjectURL=null):void 0},o.prototype.preload=function(t,n){var i;return t&&t!==this.getPreviewURL()?(this.preloadingURL=t,i=new e.ImagePreloadOperation(t),i.then(function(e){return function(i){var o,r;return r=i.width,o=i.height,e.setAttributes({width:r,height:o}),e.preloadingURL=null,e.setPreviewURL(t),"function"==typeof n?n():void 0}}(this))):void 0},o}(e.Object)}.call(this),function(){var t=function(t,e){function i(){this.constructor=t}for(var o in e)n.call(e,o)&&(t[o]=e[o]);return i.prototype=e.prototype,t.prototype=new i,t.__super__=e.prototype,t},n={}.hasOwnProperty;e.Piece=function(n){function i(t,n){null==n&&(n={}),i.__super__.constructor.apply(this,arguments),this.attributes=e.Hash.box(n)}return t(i,n),i.types={},i.registerType=function(t,e){return e.type=t,this.types[t]=e},i.fromJSON=function(t){var e;return(e=this.types[t.type])?e.fromJSON(t):void 0},i.prototype.copyWithAttributes=function(t){return new this.constructor(this.getValue(),t)},i.prototype.copyWithAdditionalAttributes=function(t){return this.copyWithAttributes(this.attributes.merge(t))},i.prototype.copyWithoutAttribute=function(t){return this.copyWithAttributes(this.attributes.remove(t))},i.prototype.copy=function(){return this.copyWithAttributes(this.attributes)},i.prototype.getAttribute=function(t){return this.attributes.get(t)},i.prototype.getAttributesHash=function(){return this.attributes},i.prototype.getAttributes=function(){return this.attributes.toObject()},i.prototype.getCommonAttributes=function(){var t,e,n;return(n=pieceList.getPieceAtIndex(0))?(t=n.attributes,e=t.getKeys(),pieceList.eachPiece(function(n){return e=t.getKeysCommonToHash(n.attributes),t=t.slice(e)}),t.toObject()):{}},i.prototype.hasAttribute=function(t){return this.attributes.has(t)},i.prototype.hasSameStringValueAsPiece=function(t){return null!=t&&this.toString()===t.toString()},i.prototype.hasSameAttributesAsPiece=function(t){return null!=t&&(this.attributes===t.attributes||this.attributes.isEqualTo(t.attributes))},i.prototype.isBlockBreak=function(){return!1},i.prototype.isEqualTo=function(t){return i.__super__.isEqualTo.apply(this,arguments)||this.hasSameConstructorAs(t)&&this.hasSameStringValueAsPiece(t)&&this.hasSameAttributesAsPiece(t)},i.prototype.isEmpty=function(){return 0===this.length},i.prototype.isSerializable=function(){return!0},i.prototype.toJSON=function(){return{type:this.constructor.type,attributes:this.getAttributes()}},i.prototype.contentsForInspection=function(){return{type:this.constructor.type,attributes:this.attributes.inspect()}},i.prototype.canBeGrouped=function(){return this.hasAttribute("href")},i.prototype.canBeGroupedWith=function(t){return this.getAttribute("href")===t.getAttribute("href")},i.prototype.getLength=function(){return this.length},i.prototype.canBeConsolidatedWith=function(){return!1},i}(e.Object)}.call(this),function(){var t=function(t,e){function i(){this.constructor=t}for(var o in e)n.call(e,o)&&(t[o]=e[o]);return i.prototype=e.prototype,t.prototype=new i,t.__super__=e.prototype,t},n={}.hasOwnProperty;e.Piece.registerType("attachment",e.AttachmentPiece=function(n){function i(t){this.attachment=t,i.__super__.constructor.apply(this,arguments),this.length=1,this.ensureAttachmentExclusivelyHasAttribute("href")}return t(i,n),i.fromJSON=function(t){return new this(e.Attachment.fromJSON(t.attachment),t.attributes)},i.prototype.ensureAttachmentExclusivelyHasAttribute=function(t){return this.hasAttribute(t)&&this.attachment.hasAttribute(t)?this.attributes=this.attributes.remove(t):void 0},i.prototype.getValue=function(){return this.attachment},i.prototype.isSerializable=function(){return!this.attachment.isPending()},i.prototype.getCaption=function(){var t;return null!=(t=this.attributes.get("caption"))?t:""},i.prototype.getAttributesForAttachment=function(){return this.attributes.slice(["caption"])},i.prototype.canBeGrouped=function(){return i.__super__.canBeGrouped.apply(this,arguments)&&!this.attachment.hasAttribute("href")},i.prototype.isEqualTo=function(t){var e;return i.__super__.isEqualTo.apply(this,arguments)&&this.attachment.id===(null!=t&&null!=(e=t.attachment)?e.id:void 0)},i.prototype.toString=function(){return e.OBJECT_REPLACEMENT_CHARACTER},i.prototype.toJSON=function(){var t;return t=i.__super__.toJSON.apply(this,arguments),t.attachment=this.attachment,t},i.prototype.getCacheKey=function(){return[i.__super__.getCacheKey.apply(this,arguments),this.attachment.getCacheKey()].join("/")},i.prototype.toConsole=function(){return JSON.stringify(this.toString())},i}(e.Piece))}.call(this),function(){var t,n=function(t,e){function n(){this.constructor=t}for(var o in e)i.call(e,o)&&(t[o]=e[o]);return n.prototype=e.prototype,t.prototype=new n,t.__super__=e.prototype,t},i={}.hasOwnProperty;t=e.normalizeNewlines,e.Piece.registerType("string",e.StringPiece=function(e){function i(e){i.__super__.constructor.apply(this,arguments),this.string=t(e),this.length=this.string.length}return n(i,e),i.fromJSON=function(t){return new this(t.string,t.attributes)},i.prototype.getValue=function(){return this.string},i.prototype.toString=function(){return this.string.toString()},i.prototype.isBlockBreak=function(){return"\n"===this.toString()&&this.getAttribute("blockBreak")===!0},i.prototype.toJSON=function(){var t;return t=i.__super__.toJSON.apply(this,arguments),t.string=this.string,t},i.prototype.canBeConsolidatedWith=function(t){return null!=t&&this.hasSameConstructorAs(t)&&this.hasSameAttributesAsPiece(t)},i.prototype.consolidateWith=function(t){return new this.constructor(this.toString()+t.toString(),this.attributes)},i.prototype.splitAtOffset=function(t){var e,n;return 0===t?(e=null,n=this):t===this.length?(e=this,n=null):(e=new this.constructor(this.string.slice(0,t),this.attributes),n=new this.constructor(this.string.slice(t),this.attributes)),[e,n]},i.prototype.toConsole=function(){var t;return t=this.string,t.length>15&&(t=t.slice(0,14)+"\u2026"),JSON.stringify(t.toString())},i}(e.Piece))}.call(this),function(){var t,n=function(t,e){function n(){this.constructor=t}for(var o in e)i.call(e,o)&&(t[o]=e[o]);return n.prototype=e.prototype,t.prototype=new n,t.__super__=e.prototype,t},i={}.hasOwnProperty,o=[].slice;t=e.spliceArray,e.SplittableList=function(e){function i(t){null==t&&(t=[]),i.__super__.constructor.apply(this,arguments),this.objects=t.slice(0),this.length=this.objects.length}var r,s,a;return n(i,e),i.box=function(t){return t instanceof this?t:new this(t)},i.prototype.indexOf=function(t){return this.objects.indexOf(t)},i.prototype.splice=function(){var e;return e=1<=arguments.length?o.call(arguments,0):[],new this.constructor(t.apply(null,[this.objects].concat(o.call(e))))},i.prototype.eachObject=function(t){var e,n,i,o,r,s;for(r=this.objects,s=[],n=e=0,i=r.length;i>e;n=++e)o=r[n],s.push(t(o,n));return s},i.prototype.insertObjectAtIndex=function(t,e){return this.splice(e,0,t)},i.prototype.insertSplittableListAtIndex=function(t,e){return this.splice.apply(this,[e,0].concat(o.call(t.objects)))},i.prototype.insertSplittableListAtPosition=function(t,e){var n,i,o;return o=this.splitObjectAtPosition(e),i=o[0],n=o[1],new this.constructor(i).insertSplittableListAtIndex(t,n)},i.prototype.editObjectAtIndex=function(t,e){return this.replaceObjectAtIndex(e(this.objects[t]),t)},i.prototype.replaceObjectAtIndex=function(t,e){return this.splice(e,1,t)},i.prototype.removeObjectAtIndex=function(t){return this.splice(t,1)},i.prototype.getObjectAtIndex=function(t){return this.objects[t]},i.prototype.getSplittableListInRange=function(t){var e,n,i,o;return i=this.splitObjectsAtRange(t),n=i[0],e=i[1],o=i[2],new this.constructor(n.slice(e,o+1))},i.prototype.selectSplittableList=function(t){var e,n;return n=function(){var n,i,o,r;for(o=this.objects,r=[],n=0,i=o.length;i>n;n++)e=o[n],t(e)&&r.push(e);return r}.call(this),new this.constructor(n)},i.prototype.removeObjectsInRange=function(t){var e,n,i,o;return i=this.splitObjectsAtRange(t),n=i[0],e=i[1],o=i[2],new this.constructor(n).splice(e,o-e+1)},i.prototype.transformObjectsInRange=function(t,e){var n,i,o,r,s,a,u;return s=this.splitObjectsAtRange(t),r=s[0],i=s[1],a=s[2],u=function(){var t,s,u;for(u=[],n=t=0,s=r.length;s>t;n=++t)o=r[n],u.push(n>=i&&a>=n?e(o):o);return u}(),new this.constructor(u)},i.prototype.splitObjectsAtRange=function(t){var e,n,i,o,s,u;return o=this.splitObjectAtPosition(a(t)),n=o[0],e=o[1],i=o[2],s=new this.constructor(n).splitObjectAtPosition(r(t)+i),n=s[0],u=s[1],[n,e,u-1]},i.prototype.getObjectAtPosition=function(t){var e,n,i;return i=this.findIndexAndOffsetAtPosition(t),e=i.index,n=i.offset,this.objects[e]},i.prototype.splitObjectAtPosition=function(t){var e,n,i,o,r,s,a,u,c,l;return s=this.findIndexAndOffsetAtPosition(t),e=s.index,r=s.offset,o=this.objects.slice(0),null!=e?0===r?(c=e,l=0):(i=this.getObjectAtIndex(e),a=i.splitAtOffset(r),n=a[0],u=a[1],o.splice(e,1,n,u),c=e+1,l=n.getLength()-r):(c=o.length,l=0),[o,c,l]},i.prototype.consolidate=function(){var t,e,n,i,o,r;for(i=[],o=this.objects[0],r=this.objects.slice(1),t=0,e=r.length;e>t;t++)n=r[t],("function"==typeof o.canBeConsolidatedWith?o.canBeConsolidatedWith(n):void 0)?o=o.consolidateWith(n):(i.push(o),o=n);return null!=o&&i.push(o),new this.constructor(i)},i.prototype.consolidateFromIndexToIndex=function(t,e){var n,i,r;return i=this.objects.slice(0),r=i.slice(t,e+1),n=new this.constructor(r).consolidate().toArray(),this.splice.apply(this,[t,r.length].concat(o.call(n)))},i.prototype.findIndexAndOffsetAtPosition=function(t){var e,n,i,o,r,s,a;for(e=0,a=this.objects,i=n=0,o=a.length;o>n;i=++n){if(s=a[i],r=e+s.getLength(),t>=e&&r>t)return{index:i,offset:t-e};e=r}return{index:null,offset:null}},i.prototype.findPositionAtIndexAndOffset=function(t,e){var n,i,o,r,s,a;for(s=0,a=this.objects,n=i=0,o=a.length;o>i;n=++i)if(r=a[n],t>n)s+=r.getLength();else if(n===t){s+=e;break}return s},i.prototype.getEndPosition=function(){var t,e;return null!=this.endPosition?this.endPosition:this.endPosition=function(){var n,i,o;for(e=0,o=this.objects,n=0,i=o.length;i>n;n++)t=o[n],e+=t.getLength();return e}.call(this)},i.prototype.toString=function(){return this.objects.join("")},i.prototype.toArray=function(){return this.objects.slice(0)},i.prototype.toJSON=function(){return this.toArray()},i.prototype.isEqualTo=function(t){return i.__super__.isEqualTo.apply(this,arguments)||s(this.objects,null!=t?t.objects:void 0)},s=function(t,e){var n,i,o,r,s;if(null==e&&(e=[]),t.length!==e.length)return!1;for(s=!0,i=n=0,o=t.length;o>n;i=++n)r=t[i],s&&!r.isEqualTo(e[i])&&(s=!1);return s},i.prototype.contentsForInspection=function(){var t;return{objects:"["+function(){var e,n,i,o;for(i=this.objects,o=[],e=0,n=i.length;n>e;e++)t=i[e],o.push(t.inspect());return o}.call(this).join(", ")+"]"}},a=function(t){return t[0]},r=function(t){return t[1]},i}(e.Object)}.call(this),function(){var t=function(t,e){function i(){this.constructor=t}for(var o in e)n.call(e,o)&&(t[o]=e[o]);return i.prototype=e.prototype,t.prototype=new i,t.__super__=e.prototype,t},n={}.hasOwnProperty;e.Text=function(n){function i(t){var n;null==t&&(t=[]),i.__super__.constructor.apply(this,arguments),this.pieceList=new e.SplittableList(function(){var e,i,o;for(o=[],e=0,i=t.length;i>e;e++)n=t[e],n.isEmpty()||o.push(n);return o}())}return t(i,n),i.textForAttachmentWithAttributes=function(t,n){var i;return i=new e.AttachmentPiece(t,n),new this([i])},i.textForStringWithAttributes=function(t,n){var i;return i=new e.StringPiece(t,n),new this([i])},i.fromJSON=function(t){var n,i;return i=function(){var i,o,r;for(r=[],i=0,o=t.length;o>i;i++)n=t[i],r.push(e.Piece.fromJSON(n));return r}(),new this(i)},i.prototype.copy=function(){return this.copyWithPieceList(this.pieceList)},i.prototype.copyWithPieceList=function(t){return new this.constructor(t.consolidate().toArray())},i.prototype.copyUsingObjectMap=function(t){var e,n;return n=function(){var n,i,o,r,s;for(o=this.getPieces(),s=[],n=0,i=o.length;i>n;n++)e=o[n],s.push(null!=(r=t.find(e))?r:e);return s}.call(this),new this.constructor(n)},i.prototype.appendText=function(t){return this.insertTextAtPosition(t,this.getLength())},i.prototype.insertTextAtPosition=function(t,e){return this.copyWithPieceList(this.pieceList.insertSplittableListAtPosition(t.pieceList,e))},i.prototype.removeTextAtRange=function(t){return this.copyWithPieceList(this.pieceList.removeObjectsInRange(t))},i.prototype.replaceTextAtRange=function(t,e){return this.removeTextAtRange(e).insertTextAtPosition(t,e[0])},i.prototype.moveTextFromRangeToPosition=function(t,e){var n,i;if(!(t[0]<=e&&e<=t[1]))return i=this.getTextAtRange(t),n=i.getLength(),t[0]<e&&(e-=n),this.removeTextAtRange(t).insertTextAtPosition(i,e)},i.prototype.addAttributeAtRange=function(t,e,n){var i;return i={},i[t]=e,this.addAttributesAtRange(i,n)},i.prototype.addAttributesAtRange=function(t,e){return this.copyWithPieceList(this.pieceList.transformObjectsInRange(e,function(e){return e.copyWithAdditionalAttributes(t)}))},i.prototype.removeAttributeAtRange=function(t,e){return this.copyWithPieceList(this.pieceList.transformObjectsInRange(e,function(e){return e.copyWithoutAttribute(t)}))},i.prototype.setAttributesAtRange=function(t,e){return this.copyWithPieceList(this.pieceList.transformObjectsInRange(e,function(e){return e.copyWithAttributes(t)}))},i.prototype.getAttributesAtPosition=function(t){var e,n;return null!=(e=null!=(n=this.pieceList.getObjectAtPosition(t))?n.getAttributes():void 0)?e:{}},i.prototype.getCommonAttributes=function(){var t,n;return t=function(){var t,e,i,o;for(i=this.pieceList.toArray(),o=[],t=0,e=i.length;e>t;t++)n=i[t],o.push(n.getAttributes());return o}.call(this),e.Hash.fromCommonAttributesOfObjects(t).toObject()},i.prototype.getCommonAttributesAtRange=function(t){var e;return null!=(e=this.getTextAtRange(t).getCommonAttributes())?e:{}},i.prototype.getExpandedRangeForAttributeAtOffset=function(t,e){var n,i,o;for(n=o=e,i=this.getLength();n>0&&this.getCommonAttributesAtRange([n-1,o])[t];)n--;for(;i>o&&this.getCommonAttributesAtRange([e,o+1])[t];)o++;return[n,o]},i.prototype.getTextAtRange=function(t){return this.copyWithPieceList(this.pieceList.getSplittableListInRange(t))},i.prototype.getStringAtRange=function(t){return this.pieceList.getSplittableListInRange(t).toString()},i.prototype.getStringAtPosition=function(t){return this.getStringAtRange([t,t+1])},i.prototype.startsWithString=function(t){return this.getStringAtRange([0,t.length])===t},i.prototype.endsWithString=function(t){var e;return e=this.getLength(),this.getStringAtRange([e-t.length,e])===t},i.prototype.getAttachmentPieces=function(){var t,e,n,i,o;for(i=this.pieceList.toArray(),o=[],t=0,e=i.length;e>t;t++)n=i[t],null!=n.attachment&&o.push(n);return o},i.prototype.getAttachments=function(){var t,e,n,i,o;for(i=this.getAttachmentPieces(),o=[],t=0,e=i.length;e>t;t++)n=i[t],o.push(n.attachment);return o},i.prototype.getAttachmentAndPositionById=function(t){var e,n,i,o,r,s;for(o=0,r=this.pieceList.toArray(),e=0,n=r.length;n>e;e++){if(i=r[e],(null!=(s=i.attachment)?s.id:void 0)===t)return{attachment:i.attachment,position:o};o+=i.length}return{attachment:null,position:null}},i.prototype.getAttachmentById=function(t){var e,n,i;return i=this.getAttachmentAndPositionById(t),e=i.attachment,n=i.position,e},i.prototype.getRangeOfAttachment=function(t){var e,n;return n=this.getAttachmentAndPositionById(t.id),t=n.attachment,e=n.position,null!=t?[e,e+1]:void 0},i.prototype.updateAttributesForAttachment=function(t,e){var n;return(n=this.getRangeOfAttachment(e))?this.addAttributesAtRange(t,n):this},i.prototype.getLength=function(){return this.pieceList.getEndPosition()},i.prototype.isEmpty=function(){return 0===this.getLength()},i.prototype.isEqualTo=function(t){var e;return i.__super__.isEqualTo.apply(this,arguments)||(null!=t&&null!=(e=t.pieceList)?e.isEqualTo(this.pieceList):void 0)},i.prototype.isBlockBreak=function(){return 1===this.getLength()&&this.pieceList.getObjectAtIndex(0).isBlockBreak()},i.prototype.eachPiece=function(t){return this.pieceList.eachObject(t)},i.prototype.getPieces=function(){return this.pieceList.toArray()},i.prototype.getPieceAtPosition=function(t){return this.pieceList.getObjectAtPosition(t)},i.prototype.contentsForInspection=function(){return{pieceList:this.pieceList.inspect()}},i.prototype.toSerializableText=function(){var t;return t=this.pieceList.selectSplittableList(function(t){return t.isSerializable()}),this.copyWithPieceList(t)},i.prototype.toString=function(){return this.pieceList.toString()},i.prototype.toJSON=function(){return this.pieceList.toJSON()},i.prototype.toConsole=function(){var t;return JSON.stringify(function(){var e,n,i,o;for(i=this.pieceList.toArray(),o=[],e=0,n=i.length;n>e;e++)t=i[e],o.push(JSON.parse(t.toConsole()));return o}.call(this))},i}(e.Object)}.call(this),function(){var t,n,i,o,r,s=function(t,e){function n(){this.constructor=t}for(var i in e)a.call(e,i)&&(t[i]=e[i]);return n.prototype=e.prototype,t.prototype=new n,t.__super__=e.prototype,t},a={}.hasOwnProperty,u=[].slice,c=[].indexOf||function(t){for(var e=0,n=this.length;n>e;e++)if(e in this&&this[e]===t)return e;return-1};t=e.arraysAreEqual,r=e.spliceArray,i=e.getBlockConfig,n=e.getBlockAttributeNames,o=e.getListAttributeNames,e.Block=function(n){function a(t,n){null==t&&(t=new e.Text),null==n&&(n=[]),a.__super__.constructor.apply(this,arguments),this.text=h(t),this.attributes=n}var l,h,p,d,f,g,m,y,v;return s(a,n),a.fromJSON=function(t){var n;return n=e.Text.fromJSON(t.text),new this(n,t.attributes)},a.prototype.isEmpty=function(){return this.text.isBlockBreak()},a.prototype.isEqualTo=function(e){return a.__super__.isEqualTo.apply(this,arguments)||this.text.isEqualTo(null!=e?e.text:void 0)&&t(this.attributes,null!=e?e.attributes:void 0)},a.prototype.copyWithText=function(t){return new this.constructor(t,this.attributes)},a.prototype.copyWithoutText=function(){return this.copyWithText(null)},a.prototype.copyWithAttributes=function(t){return new this.constructor(this.text,t)},a.prototype.copyUsingObjectMap=function(t){var e;return this.copyWithText((e=t.find(this.text))?e:this.text.copyUsingObjectMap(t))},a.prototype.addAttribute=function(t){var e;return e=this.attributes.concat(d(t)),this.copyWithAttributes(e)},a.prototype.removeAttribute=function(t){var e,n;return n=i(t).listAttribute,e=g(g(this.attributes,t),n),this.copyWithAttributes(e)},a.prototype.removeLastAttribute=function(){return this.removeAttribute(this.getLastAttribute())},a.prototype.getLastAttribute=function(){return f(this.attributes)},a.prototype.getAttributes=function(){return this.attributes.slice(0)},a.prototype.getAttributeLevel=function(){return this.attributes.length},a.prototype.getAttributeAtLevel=function(t){return this.attributes[t-1]},a.prototype.hasAttributes=function(){return this.getAttributeLevel()>0},a.prototype.getLastNestableAttribute=function(){return f(this.getNestableAttributes())},a.prototype.getNestableAttributes=function(){var t,e,n,o,r;for(o=this.attributes,r=[],e=0,n=o.length;n>e;e++)t=o[e],i(t).nestable&&r.push(t);return r},a.prototype.getNestingLevel=function(){return this.getNestableAttributes().length},a.prototype.decreaseNestingLevel=function(){var t;return(t=this.getLastNestableAttribute())?this.removeAttribute(t):this},a.prototype.increaseNestingLevel=function(){var t,e,n;return(t=this.getLastNestableAttribute())?(n=this.attributes.lastIndexOf(t),e=r.apply(null,[this.attributes,n+1,0].concat(u.call(d(t)))),this.copyWithAttributes(e)):this},a.prototype.getListItemAttributes=function(){var t,e,n,o,r;for(o=this.attributes,r=[],e=0,n=o.length;n>e;e++)t=o[e],i(t).listAttribute&&r.push(t);return r},a.prototype.isListItem=function(){var t;return null!=(t=i(this.getLastAttribute()))?t.listAttribute:void 0},a.prototype.isTerminalBlock=function(){var t;return null!=(t=i(this.getLastAttribute()))?t.terminal:void 0},a.prototype.breaksOnReturn=function(){var t;return null!=(t=i(this.getLastAttribute()))?t.breakOnReturn:void 0},a.prototype.findLineBreakInDirectionFromPosition=function(t,e){var n,i;return i=this.toString(),n=function(){switch(t){case"forward":return i.indexOf("\n",e);case"backward":return i.slice(0,e).lastIndexOf("\n")}}(),-1!==n?n:void 0},a.prototype.contentsForInspection=function(){return{text:this.text.inspect(),attributes:this.attributes}},a.prototype.toString=function(){return this.text.toString()},a.prototype.toJSON=function(){return{text:this.text,attributes:this.attributes}},a.prototype.getLength=function(){return this.text.getLength()},a.prototype.canBeConsolidatedWith=function(t){return!this.hasAttributes()&&!t.hasAttributes()},a.prototype.consolidateWith=function(t){var n,i;return n=e.Text.textForStringWithAttributes("\n"),i=this.getTextWithoutBlockBreak().appendText(n),this.copyWithText(i.appendText(t.text))},a.prototype.splitAtOffset=function(t){var e,n;return 0===t?(e=null,n=this):t===this.getLength()?(e=this,n=null):(e=this.copyWithText(this.text.getTextAtRange([0,t])),n=this.copyWithText(this.text.getTextAtRange([t,this.getLength()]))),[e,n]},a.prototype.getBlockBreakPosition=function(){return this.text.getLength()-1},a.prototype.getTextWithoutBlockBreak=function(){return m(this.text)?this.text.getTextAtRange([0,this.getBlockBreakPosition()]):this.text.copy()},a.prototype.canBeGrouped=function(t){return this.attributes[t]},a.prototype.canBeGroupedWith=function(t,e){var n,r,s,a;return s=t.getAttributes(),r=s[e],n=this.attributes[e],n===r&&!(i(n).group===!1&&(a=s[e+1],c.call(o(),a)<0))},h=function(t){return t=v(t),t=l(t)},v=function(t){var n,i,o,r,s,a;return r=!1,a=t.getPieces(),i=2<=a.length?u.call(a,0,n=a.length-1):(n=0,[]),o=a[n++],null==o?t:(i=function(){var t,e,n;for(n=[],t=0,e=i.length;e>t;t++)s=i[t],s.isBlockBreak()?(r=!0,n.push(y(s))):n.push(s);return n}(),r?new e.Text(u.call(i).concat([o])):t)},p=e.Text.textForStringWithAttributes("\n",{blockBreak:!0}),l=function(t){return m(t)?t:t.appendText(p)},m=function(t){var e,n;return n=t.getLength(),0===n?!1:(e=t.getTextAtRange([n-1,n]),e.isBlockBreak())},y=function(t){return t.copyWithoutAttribute("blockBreak")},d=function(t){var e;return e=i(t).listAttribute,null!=e?[e,t]:[t]},f=function(t){return t.slice(-1)[0]},g=function(t,e){var n;return n=t.lastIndexOf(e),-1===n?t:r(t,n,1)},a}(e.Object)}.call(this),function(){var t,n,i,o,r,s,a,u,c,l,h,p=function(t,e){function n(){this.constructor=t}for(var i in e)d.call(e,i)&&(t[i]=e[i]);return n.prototype=e.prototype,t.prototype=new n,t.__super__=e.prototype,t},d={}.hasOwnProperty,f=[].slice,g=[].indexOf||function(t){for(var e=0,n=this.length;n>e;e++)if(e in this&&this[e]===t)return e;return-1};t=e.arraysAreEqual,s=e.makeElement,l=e.tagName,r=e.getBlockTagNames,h=e.walkTree,o=e.findClosestElementFromNode,i=e.elementContainsNode,a=e.nodeIsAttachmentElement,u=e.normalizeSpaces,n=e.breakableWhitespacePattern,c=e.squishBreakableWhitespace,e.HTMLParser=function(d){function m(t,e){this.html=t,this.referenceElement=(null!=e?e:{}).referenceElement,this.blocks=[],this.blockElements=[],this.processedElements=[]}var y,v,b,A,C,x,w,E,S,k,R,L,D,O,T;return p(m,d),y="style href src width height class".split(" "),m.parse=function(t,e){var n;return n=new this(t,e),n.parse(),n},m.prototype.getDocument=function(){return e.Document.fromJSON(this.blocks)},m.prototype.parse=function(){var t,e;try{for(this.createHiddenContainer(),t=D(this.html),this.containerElement.innerHTML=t,e=h(this.containerElement,{usingFilter:k});e.nextNode();)this.processNode(e.currentNode);return this.translateBlockElementMarginsToNewlines()}finally{this.removeHiddenContainer()}},m.prototype.createHiddenContainer=function(){return this.referenceElement?(this.containerElement=this.referenceElement.cloneNode(!1),this.containerElement.removeAttribute("id"),this.containerElement.setAttribute("data-trix-internal",""),this.containerElement.style.display="none",this.referenceElement.parentNode.insertBefore(this.containerElement,this.referenceElement.nextSibling)):(this.containerElement=s({tagName:"div",style:{display:"none"}}),document.body.appendChild(this.containerElement))},m.prototype.removeHiddenContainer=function(){return this.containerElement.parentNode.removeChild(this.containerElement)},D=function(t){var e,n,i,o,r,s,a,u,c,l,p,d,m,v,b,C;for(t=t.replace(/<\/html[^>]*>[^]*$/i,"</html>"),n=document.implementation.createHTMLDocument(""),n.documentElement.innerHTML=t,e=n.body,i=n.head,m=i.querySelectorAll("style"),o=0,a=m.length;a>o;o++)b=m[o],e.appendChild(b);for(d=[],C=h(e);C.nextNode();)switch(p=C.currentNode,p.nodeType){case Node.ELEMENT_NODE:if(A(p))d.push(p);else for(v=f.call(p.attributes),r=0,u=v.length;u>r;r++)l=v[r].name,g.call(y,l)>=0||0===l.indexOf("data-trix")||p.removeAttribute(l);break;case Node.COMMENT_NODE:d.push(p)}for(s=0,c=d.length;c>s;s++)p=d[s],p.parentNode.removeChild(p);return e.innerHTML},A=function(t){return(null!=t?t.nodeType:void 0)!==Node.ELEMENT_NODE||a(t)?void 0:"script"===l(t)||"false"===t.getAttribute("data-trix-serialize")},k=function(t){return"style"===l(t)?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT},m.prototype.processNode=function(t){switch(t.nodeType){case Node.TEXT_NODE:return this.processTextNode(t);case Node.ELEMENT_NODE:return this.appendBlockForElement(t),this.processElement(t)}},m.prototype.appendBlockForElement=function(e){var n,o,r,s;if(r=this.isBlockElement(e),o=i(this.currentBlockElement,e),r&&!this.isBlockElement(e.firstChild)){if(!(this.isInsignificantTextNode(e.firstChild)&&this.isBlockElement(e.firstElementChild)||(n=this.getBlockAttributes(e),o&&t(n,this.currentBlock.attributes))))return this.currentBlock=this.appendBlockForAttributesWithElement(n,e),this.currentBlockElement=e}else if(this.currentBlockElement&&!o&&!r)return(s=this.findParentBlockElement(e))?this.appendBlockForElement(s):(this.currentBlock=this.appendEmptyBlock(),this.currentBlockElement=null)},m.prototype.findParentBlockElement=function(t){var e;for(e=t.parentElement;e&&e!==this.containerElement;){if(this.isBlockElement(e)&&g.call(this.blockElements,e)>=0)return e;e=e.parentElement}return null},m.prototype.processTextNode=function(t){var e,n;return this.isInsignificantTextNode(t)?void 0:(n=t.data,b(t.parentNode)||(n=c(n),O(null!=(e=t.previousSibling)?e.textContent:void 0)&&(n=E(n))),this.appendStringWithAttributes(n,this.getTextAttributes(t.parentNode)))},m.prototype.processElement=function(t){var e,n,i,o,r;if(a(t))return e=C(t),Object.keys(e).length&&(o=this.getTextAttributes(t),this.appendAttachmentWithAttributes(e,o),t.innerHTML=""),this.processedElements.push(t);switch(l(t)){case"br":return this.isExtraBR(t)||this.isBlockElement(t.nextSibling)||this.appendStringWithAttributes("\n",this.getTextAttributes(t)),this.processedElements.push(t);case"img":e={url:t.getAttribute("src"),contentType:"image"},i=w(t);for(n in i)r=i[n],e[n]=r;return this.appendAttachmentWithAttributes(e,this.getTextAttributes(t)),this.processedElements.push(t);case"tr":if(t.parentNode.firstChild!==t)return this.appendStringWithAttributes("\n");break;case"td":if(t.parentNode.firstChild!==t)return this.appendStringWithAttributes(" | ")}},m.prototype.appendBlockForAttributesWithElement=function(t,e){var n;return this.blockElements.push(e),n=v(t),this.blocks.push(n),n},m.prototype.appendEmptyBlock=function(){return this.appendBlockForAttributesWithElement([],null)},m.prototype.appendStringWithAttributes=function(t,e){return this.appendPiece(L(t,e))},m.prototype.appendAttachmentWithAttributes=function(t,e){return this.appendPiece(R(t,e))},m.prototype.appendPiece=function(t){return 0===this.blocks.length&&this.appendEmptyBlock(),this.blocks[this.blocks.length-1].text.push(t)},m.prototype.appendStringToTextAtIndex=function(t,e){var n,i;return i=this.blocks[e].text,n=i[i.length-1],"string"===(null!=n?n.type:void 0)?n.string+=t:i.push(L(t))},m.prototype.prependStringToTextAtIndex=function(t,e){var n,i;return i=this.blocks[e].text,n=i[0],"string"===(null!=n?n.type:void 0)?n.string=t+n.string:i.unshift(L(t))},L=function(t,e){var n;return null==e&&(e={}),n="string",t=u(t),{string:t,attributes:e,type:n}},R=function(t,e){var n;return null==e&&(e={}),n="attachment",{attachment:t,attributes:e,type:n}},v=function(t){var e;return null==t&&(t={}),e=[],{text:e,attributes:t}},m.prototype.getTextAttributes=function(t){var n,i,r,s,u,c,l,h,p,d,f,g,m;r={},d=e.config.textAttributes;for(n in d)if(u=d[n],u.tagName&&o(t,{matchingSelector:u.tagName,untilNode:this.containerElement}))r[n]=!0;else if(u.parser){if(m=u.parser(t)){for(i=!1,f=this.findBlockElementAncestors(t),c=0,p=f.length;p>c;c++)if(s=f[c],u.parser(s)===m){i=!0;break}i||(r[n]=m)}}else u.styleProperty&&(m=t.style[u.styleProperty])&&(r[n]=m);if(a(t)&&(l=t.getAttribute("data-trix-attributes"))){g=JSON.parse(l);for(h in g)m=g[h],r[h]=m}return r},m.prototype.getBlockAttributes=function(t){var n,i,o,r;for(i=[];t&&t!==this.containerElement;){r=e.config.blockAttributes;for(n in r)o=r[n],o.parse!==!1&&l(t)===o.tagName&&(("function"==typeof o.test?o.test(t):void 0)||!o.test)&&(i.push(n),o.listAttribute&&i.push(o.listAttribute));t=t.parentNode}return i.reverse()},m.prototype.findBlockElementAncestors=function(t){var e,n;for(e=[];t&&t!==this.containerElement;)n=l(t),g.call(r(),n)>=0&&e.push(t),t=t.parentNode;return e},C=function(t){return JSON.parse(t.getAttribute("data-trix-attachment"))},w=function(t){var e,n,i;return i=t.getAttribute("width"),n=t.getAttribute("height"),e={},i&&(e.width=parseInt(i,10)),n&&(e.height=parseInt(n,10)),e},m.prototype.isBlockElement=function(t){var e;if((null!=t?t.nodeType:void 0)===Node.ELEMENT_NODE&&!o(t,{matchingSelector:"td",untilNode:this.containerElement}))return e=l(t),g.call(r(),e)>=0||"block"===window.getComputedStyle(t).display},m.prototype.isInsignificantTextNode=function(t){var e,n,i;if((null!=t?t.nodeType:void 0)===Node.TEXT_NODE&&T(t.data)&&(n=t.parentNode,i=t.previousSibling,e=t.nextSibling,(!S(n.previousSibling)||this.isBlockElement(n.previousSibling))&&!b(n)))return!i||this.isBlockElement(i)||!e||this.isBlockElement(e)},m.prototype.isExtraBR=function(t){return"br"===l(t)&&this.isBlockElement(t.parentNode)&&t.parentNode.lastChild===t},b=function(t){var e;return e=window.getComputedStyle(t).whiteSpace,"pre"===e||"pre-wrap"===e||"pre-line"===e},S=function(t){return t&&!O(t.textContent)},m.prototype.translateBlockElementMarginsToNewlines=function(){var t,e,n,i,o,r,s,a;for(e=this.getMarginOfDefaultBlockElement(),s=this.blocks,a=[],i=n=0,o=s.length;o>n;i=++n)t=s[i],(r=this.getMarginOfBlockElementAtIndex(i))&&(r.top>2*e.top&&this.prependStringToTextAtIndex("\n",i),a.push(r.bottom>2*e.bottom?this.appendStringToTextAtIndex("\n",i):void 0));return a},m.prototype.getMarginOfBlockElementAtIndex=function(t){var e,n;return!(e=this.blockElements[t])||!e.textContent||(n=l(e),g.call(r(),n)>=0||g.call(this.processedElements,e)>=0)?void 0:x(e)},m.prototype.getMarginOfDefaultBlockElement=function(){var t;return t=s(e.config.blockAttributes["default"].tagName),this.containerElement.appendChild(t),x(t)},x=function(t){var e;return e=window.getComputedStyle(t),"block"===e.display?{top:parseInt(e.marginTop),bottom:parseInt(e.marginBottom)}:void 0},E=function(t){return t.replace(RegExp("^"+n.source+"+"),"")},T=function(t){return RegExp("^"+n.source+"*$").test(t)},O=function(t){return/\s$/.test(t)},m}(e.BasicObject)}.call(this),function(){var t,n,i,o,r=function(t,e){function n(){this.constructor=t}for(var i in e)s.call(e,i)&&(t[i]=e[i]);return n.prototype=e.prototype,t.prototype=new n,t.__super__=e.prototype,t},s={}.hasOwnProperty,a=[].slice,u=[].indexOf||function(t){for(var e=0,n=this.length;n>e;e++)if(e in this&&this[e]===t)return e;return-1};t=e.arraysAreEqual,i=e.normalizeRange,o=e.rangeIsCollapsed,n=e.getBlockConfig,e.Document=function(s){function c(t){null==t&&(t=[]),c.__super__.constructor.apply(this,arguments),0===t.length&&(t=[new e.Block]),this.blockList=e.SplittableList.box(t)}var l;return r(c,s),c.fromJSON=function(t){var n,i;return i=function(){var i,o,r;for(r=[],i=0,o=t.length;o>i;i++)n=t[i],r.push(e.Block.fromJSON(n));return r}(),new this(i)},c.fromHTML=function(t,n){return e.HTMLParser.parse(t,n).getDocument()
},c.fromString=function(t,n){var i;return i=e.Text.textForStringWithAttributes(t,n),new this([new e.Block(i)])},c.prototype.isEmpty=function(){var t;return 1===this.blockList.length&&(t=this.getBlockAtIndex(0),t.isEmpty()&&!t.hasAttributes())},c.prototype.copy=function(t){var e;return null==t&&(t={}),e=t.consolidateBlocks?this.blockList.consolidate().toArray():this.blockList.toArray(),new this.constructor(e)},c.prototype.copyUsingObjectsFromDocument=function(t){var n;return n=new e.ObjectMap(t.getObjects()),this.copyUsingObjectMap(n)},c.prototype.copyUsingObjectMap=function(t){var e,n,i;return n=function(){var n,o,r,s;for(r=this.getBlocks(),s=[],n=0,o=r.length;o>n;n++)e=r[n],s.push((i=t.find(e))?i:e.copyUsingObjectMap(t));return s}.call(this),new this.constructor(n)},c.prototype.copyWithBaseBlockAttributes=function(t){var e,n,i;return null==t&&(t=[]),i=function(){var i,o,r,s;for(r=this.getBlocks(),s=[],i=0,o=r.length;o>i;i++)n=r[i],e=t.concat(n.getAttributes()),s.push(n.copyWithAttributes(e));return s}.call(this),new this.constructor(i)},c.prototype.replaceBlock=function(t,e){var n;return n=this.blockList.indexOf(t),-1===n?this:new this.constructor(this.blockList.replaceObjectAtIndex(e,n))},c.prototype.insertDocumentAtRange=function(t,e){var n,r,s,a,u,c,l;return r=t.blockList,u=(e=i(e))[0],c=this.locationFromPosition(u),s=c.index,a=c.offset,l=this,n=this.getBlockAtPosition(u),o(e)&&n.isEmpty()&&!n.hasAttributes()?l=new this.constructor(l.blockList.removeObjectAtIndex(s)):n.getBlockBreakPosition()===a&&u++,l=l.removeTextAtRange(e),new this.constructor(l.blockList.insertSplittableListAtPosition(r,u))},c.prototype.mergeDocumentAtRange=function(e,n){var o,r,s,a,u,c,l,h,p,d,f,g;return f=(n=i(n))[0],d=this.locationFromPosition(f),r=this.getBlockAtIndex(d.index).getAttributes(),o=e.getBaseBlockAttributes(),g=r.slice(-o.length),t(o,g)?(l=r.slice(0,-o.length),c=e.copyWithBaseBlockAttributes(l)):c=e.copy({consolidateBlocks:!0}).copyWithBaseBlockAttributes(r),s=c.getBlockCount(),a=c.getBlockAtIndex(0),t(r,a.getAttributes())?(u=a.getTextWithoutBlockBreak(),p=this.insertTextAtRange(u,n),s>1&&(c=new this.constructor(c.getBlocks().slice(1)),h=f+u.getLength(),p=p.insertDocumentAtRange(c,h))):p=this.insertDocumentAtRange(c,n),p},c.prototype.insertTextAtRange=function(t,e){var n,o,r,s,a;return a=(e=i(e))[0],s=this.locationFromPosition(a),o=s.index,r=s.offset,n=this.removeTextAtRange(e),new this.constructor(n.blockList.editObjectAtIndex(o,function(e){return e.copyWithText(e.text.insertTextAtPosition(t,r))}))},c.prototype.removeTextAtRange=function(t){var e,n,r,s,a,u,c,l,h,p,d,f,g,m,y,v,b,A,C,x,w;return p=t=i(t),l=p[0],A=p[1],o(t)?this:(d=this.locationRangeFromRange(t),u=d[0],v=d[1],a=u.index,c=u.offset,s=this.getBlockAtIndex(a),y=v.index,b=v.offset,m=this.getBlockAtIndex(y),f=A-l===1&&s.getBlockBreakPosition()===c&&m.getBlockBreakPosition()!==b&&"\n"===m.text.getStringAtPosition(b),f?r=this.blockList.editObjectAtIndex(y,function(t){return t.copyWithText(t.text.removeTextAtRange([b,b+1]))}):(h=s.text.getTextAtRange([0,c]),C=m.text.getTextAtRange([b,m.getLength()]),x=h.appendText(C),g=a!==y&&0===c,w=g&&s.getAttributeLevel()>=m.getAttributeLevel(),n=w?m.copyWithText(x):s.copyWithText(x),e=y+1-a,r=this.blockList.splice(a,e,n)),new this.constructor(r))},c.prototype.moveTextFromRangeToPosition=function(t,e){var n,o,r,s,u,c,l,h,p,d;if(c=t=i(t),p=c[0],r=c[1],e>=p&&r>=e)return this;if(o=this.getDocumentAtRange(t),h=this.removeTextAtRange(t),u=e>p,u&&(e-=o.getLength()),!h.firstBlockInRangeIsEntirelySelected(t)){if(l=o.getBlocks(),s=l[0],n=2<=l.length?a.call(l,1):[],0===n.length?(d=s.getTextWithoutBlockBreak(),u&&(e+=1)):d=s.text,h=h.insertTextAtRange(d,e),0===n.length)return h;o=new this.constructor(n),e+=d.getLength()}return h.insertDocumentAtRange(o,e)},c.prototype.addAttributeAtRange=function(t,e,i){var o;return o=this.blockList,this.eachBlockAtRange(i,function(i,r,s){return o=o.editObjectAtIndex(s,function(){return n(t)?i.addAttribute(t,e):r[0]===r[1]?i:i.copyWithText(i.text.addAttributeAtRange(t,e,r))})}),new this.constructor(o)},c.prototype.addAttribute=function(t,e){var n;return n=this.blockList,this.eachBlock(function(i,o){return n=n.editObjectAtIndex(o,function(){return i.addAttribute(t,e)})}),new this.constructor(n)},c.prototype.removeAttributeAtRange=function(t,e){var i;return i=this.blockList,this.eachBlockAtRange(e,function(e,o,r){return n(t)?i=i.editObjectAtIndex(r,function(){return e.removeAttribute(t)}):o[0]!==o[1]?i=i.editObjectAtIndex(r,function(){return e.copyWithText(e.text.removeAttributeAtRange(t,o))}):void 0}),new this.constructor(i)},c.prototype.updateAttributesForAttachment=function(t,e){var n,i,o,r;return o=(i=this.getRangeOfAttachment(e))[0],n=this.locationFromPosition(o).index,r=this.getTextAtIndex(n),new this.constructor(this.blockList.editObjectAtIndex(n,function(n){return n.copyWithText(r.updateAttributesForAttachment(t,e))}))},c.prototype.removeAttributeForAttachment=function(t,e){var n;return n=this.getRangeOfAttachment(e),this.removeAttributeAtRange(t,n)},c.prototype.insertBlockBreakAtRange=function(t){var n,o,r,s;return s=(t=i(t))[0],r=this.locationFromPosition(s).offset,o=this.removeTextAtRange(t),0===r&&(n=[new e.Block]),new this.constructor(o.blockList.insertSplittableListAtPosition(new e.SplittableList(n),s))},c.prototype.applyBlockAttributeAtRange=function(t,e,i){var o,r,s,a;return s=this.expandRangeToLineBreaksAndSplitBlocks(i),r=s.document,i=s.range,o=n(t),o.listAttribute?(r=r.removeLastListAttributeAtRange(i,{exceptAttributeName:t}),a=r.convertLineBreaksToBlockBreaksInRange(i),r=a.document,i=a.range):r=o.terminal?r.removeLastTerminalAttributeAtRange(i):r.consolidateBlocksAtRange(i),r.addAttributeAtRange(t,e,i)},c.prototype.removeLastListAttributeAtRange=function(t,e){var i;return null==e&&(e={}),i=this.blockList,this.eachBlockAtRange(t,function(t,o,r){var s;if((s=t.getLastAttribute())&&n(s).listAttribute&&s!==e.exceptAttributeName)return i=i.editObjectAtIndex(r,function(){return t.removeAttribute(s)})}),new this.constructor(i)},c.prototype.removeLastTerminalAttributeAtRange=function(t){var e;return e=this.blockList,this.eachBlockAtRange(t,function(t,i,o){var r;if((r=t.getLastAttribute())&&n(r).terminal)return e=e.editObjectAtIndex(o,function(){return t.removeAttribute(r)})}),new this.constructor(e)},c.prototype.firstBlockInRangeIsEntirelySelected=function(t){var e,n,o,r,s,a;return r=t=i(t),a=r[0],e=r[1],n=this.locationFromPosition(a),s=this.locationFromPosition(e),0===n.offset&&n.index<s.index?!0:n.index===s.index?(o=this.getBlockAtIndex(n.index).getLength(),0===n.offset&&s.offset===o):!1},c.prototype.expandRangeToLineBreaksAndSplitBlocks=function(t){var e,n,o,r,s,a,u,c,l;return a=t=i(t),l=a[0],r=a[1],c=this.locationFromPosition(l),o=this.locationFromPosition(r),e=this,u=e.getBlockAtIndex(c.index),null!=(c.offset=u.findLineBreakInDirectionFromPosition("backward",c.offset))&&(s=e.positionFromLocation(c),e=e.insertBlockBreakAtRange([s,s+1]),o.index+=1,o.offset-=e.getBlockAtIndex(c.index).getLength(),c.index+=1),c.offset=0,0===o.offset&&o.index>c.index?(o.index-=1,o.offset=e.getBlockAtIndex(o.index).getBlockBreakPosition()):(n=e.getBlockAtIndex(o.index),"\n"===n.text.getStringAtRange([o.offset-1,o.offset])?o.offset-=1:o.offset=n.findLineBreakInDirectionFromPosition("forward",o.offset),o.offset!==n.getBlockBreakPosition()&&(s=e.positionFromLocation(o),e=e.insertBlockBreakAtRange([s,s+1]))),l=e.positionFromLocation(c),r=e.positionFromLocation(o),t=i([l,r]),{document:e,range:t}},c.prototype.convertLineBreaksToBlockBreaksInRange=function(t){var e,n,o;return n=(t=i(t))[0],o=this.getStringAtRange(t).slice(0,-1),e=this,o.replace(/.*?\n/g,function(t){return n+=t.length,e=e.insertBlockBreakAtRange([n-1,n])}),{document:e,range:t}},c.prototype.consolidateBlocksAtRange=function(t){var e,n,o,r,s;return o=t=i(t),s=o[0],n=o[1],r=this.locationFromPosition(s).index,e=this.locationFromPosition(n).index,new this.constructor(this.blockList.consolidateFromIndexToIndex(r,e))},c.prototype.getDocumentAtRange=function(t){var e;return t=i(t),e=this.blockList.getSplittableListInRange(t).toArray(),new this.constructor(e)},c.prototype.getStringAtRange=function(t){var e,n,o;return o=t=i(t),n=o[o.length-1],n!==this.getLength()&&(e=-1),this.getDocumentAtRange(t).toString().slice(0,e)},c.prototype.getBlockAtIndex=function(t){return this.blockList.getObjectAtIndex(t)},c.prototype.getBlockAtPosition=function(t){var e;return e=this.locationFromPosition(t).index,this.getBlockAtIndex(e)},c.prototype.getTextAtIndex=function(t){var e;return null!=(e=this.getBlockAtIndex(t))?e.text:void 0},c.prototype.getTextAtPosition=function(t){var e;return e=this.locationFromPosition(t).index,this.getTextAtIndex(e)},c.prototype.getPieceAtPosition=function(t){var e,n,i;return i=this.locationFromPosition(t),e=i.index,n=i.offset,this.getTextAtIndex(e).getPieceAtPosition(n)},c.prototype.getCharacterAtPosition=function(t){var e,n,i;return i=this.locationFromPosition(t),e=i.index,n=i.offset,this.getTextAtIndex(e).getStringAtRange([n,n+1])},c.prototype.getLength=function(){return this.blockList.getEndPosition()},c.prototype.getBlocks=function(){return this.blockList.toArray()},c.prototype.getBlockCount=function(){return this.blockList.length},c.prototype.getEditCount=function(){return this.editCount},c.prototype.eachBlock=function(t){return this.blockList.eachObject(t)},c.prototype.eachBlockAtRange=function(t,e){var n,o,r,s,a,u,c,l,h,p,d,f;if(u=t=i(t),d=u[0],r=u[1],p=this.locationFromPosition(d),o=this.locationFromPosition(r),p.index===o.index)return n=this.getBlockAtIndex(p.index),f=[p.offset,o.offset],e(n,f,p.index);for(h=[],a=s=c=p.index,l=o.index;l>=c?l>=s:s>=l;a=l>=c?++s:--s)(n=this.getBlockAtIndex(a))?(f=function(){switch(a){case p.index:return[p.offset,n.text.getLength()];case o.index:return[0,o.offset];default:return[0,n.text.getLength()]}}(),h.push(e(n,f,a))):h.push(void 0);return h},c.prototype.getCommonAttributesAtRange=function(t){var n,r,s;return r=(t=i(t))[0],o(t)?this.getCommonAttributesAtPosition(r):(s=[],n=[],this.eachBlockAtRange(t,function(t,e){return e[0]!==e[1]?(s.push(t.text.getCommonAttributesAtRange(e)),n.push(l(t))):void 0}),e.Hash.fromCommonAttributesOfObjects(s).merge(e.Hash.fromCommonAttributesOfObjects(n)).toObject())},c.prototype.getCommonAttributesAtPosition=function(t){var n,i,o,r,s,a,c,h,p,d;if(p=this.locationFromPosition(t),s=p.index,h=p.offset,o=this.getBlockAtIndex(s),!o)return{};r=l(o),n=o.text.getAttributesAtPosition(h),i=o.text.getAttributesAtPosition(h-1),a=function(){var t,n;t=e.config.textAttributes,n=[];for(c in t)d=t[c],d.inheritable&&n.push(c);return n}();for(c in i)d=i[c],(d===n[c]||u.call(a,c)>=0)&&(r[c]=d);return r},c.prototype.getRangeOfCommonAttributeAtPosition=function(t,e){var n,o,r,s,a,u,c,l,h;return a=this.locationFromPosition(e),r=a.index,s=a.offset,h=this.getTextAtIndex(r),u=h.getExpandedRangeForAttributeAtOffset(t,s),l=u[0],o=u[1],c=this.positionFromLocation({index:r,offset:l}),n=this.positionFromLocation({index:r,offset:o}),i([c,n])},c.prototype.getBaseBlockAttributes=function(){var t,e,n,i,o,r,s;for(t=this.getBlockAtIndex(0).getAttributes(),n=i=1,s=this.getBlockCount();s>=1?s>i:i>s;n=s>=1?++i:--i)e=this.getBlockAtIndex(n).getAttributes(),r=Math.min(t.length,e.length),t=function(){var n,i,s;for(s=[],o=n=0,i=r;(i>=0?i>n:n>i)&&e[o]===t[o];o=i>=0?++n:--n)s.push(e[o]);return s}();return t},l=function(t){var e,n;return n={},(e=t.getLastAttribute())&&(n[e]=!0),n},c.prototype.getAttachmentById=function(t){var e,n,i,o;for(o=this.getAttachments(),n=0,i=o.length;i>n;n++)if(e=o[n],e.id===t)return e},c.prototype.getAttachmentPieces=function(){var t;return t=[],this.blockList.eachObject(function(e){var n;return n=e.text,t=t.concat(n.getAttachmentPieces())}),t},c.prototype.getAttachments=function(){var t,e,n,i,o;for(i=this.getAttachmentPieces(),o=[],t=0,e=i.length;e>t;t++)n=i[t],o.push(n.attachment);return o},c.prototype.getRangeOfAttachment=function(t){var e,n,o,r,s,a,u;for(r=0,s=this.blockList.toArray(),n=e=0,o=s.length;o>e;n=++e){if(a=s[n].text,u=a.getRangeOfAttachment(t))return i([r+u[0],r+u[1]]);r+=a.getLength()}},c.prototype.getLocationRangeOfAttachment=function(t){var e;return e=this.getRangeOfAttachment(t),this.locationRangeFromRange(e)},c.prototype.getAttachmentPieceForAttachment=function(t){var e,n,i,o;for(o=this.getAttachmentPieces(),e=0,n=o.length;n>e;e++)if(i=o[e],i.attachment===t)return i},c.prototype.findRangesForTextAttribute=function(t,e){var n,i,o,r,s,a,u,c,l,h;for(h=(null!=e?e:{}).withValue,a=0,u=[],c=[],r=function(e){return null!=h?e.getAttribute(t)===h:e.hasAttribute(t)},l=this.getPieces(),n=0,i=l.length;i>n;n++)s=l[n],o=s.getLength(),r(s)&&(u[1]===a?u[1]=a+o:c.push(u=[a,a+o])),a+=o;return c},c.prototype.locationFromPosition=function(t){var e,n;return n=this.blockList.findIndexAndOffsetAtPosition(Math.max(0,t)),null!=n.index?n:(e=this.getBlocks(),{index:e.length-1,offset:e[e.length-1].getLength()})},c.prototype.positionFromLocation=function(t){return this.blockList.findPositionAtIndexAndOffset(t.index,t.offset)},c.prototype.locationRangeFromPosition=function(t){return i(this.locationFromPosition(t))},c.prototype.locationRangeFromRange=function(t){var e,n,o,r;if(t=i(t))return r=t[0],n=t[1],o=this.locationFromPosition(r),e=this.locationFromPosition(n),i([o,e])},c.prototype.rangeFromLocationRange=function(t){var e,n;return t=i(t),e=this.positionFromLocation(t[0]),o(t)||(n=this.positionFromLocation(t[1])),i([e,n])},c.prototype.isEqualTo=function(t){return this.blockList.isEqualTo(null!=t?t.blockList:void 0)},c.prototype.getTexts=function(){var t,e,n,i,o;for(i=this.getBlocks(),o=[],e=0,n=i.length;n>e;e++)t=i[e],o.push(t.text);return o},c.prototype.getPieces=function(){var t,e,n,i,o;for(n=[],i=this.getTexts(),t=0,e=i.length;e>t;t++)o=i[t],n.push.apply(n,o.getPieces());return n},c.prototype.getObjects=function(){return this.getBlocks().concat(this.getTexts()).concat(this.getPieces())},c.prototype.toSerializableDocument=function(){var t;return t=[],this.blockList.eachObject(function(e){return t.push(e.copyWithText(e.text.toSerializableText()))}),new this.constructor(t)},c.prototype.toString=function(){return this.blockList.toString()},c.prototype.toJSON=function(){return this.blockList.toJSON()},c.prototype.toConsole=function(){var t;return JSON.stringify(function(){var e,n,i,o;for(i=this.blockList.toArray(),o=[],e=0,n=i.length;n>e;e++)t=i[e],o.push(JSON.parse(t.text.toConsole()));return o}.call(this))},c}(e.Object)}.call(this),function(){e.LineBreakInsertion=function(){function t(t){var e;this.composition=t,this.document=this.composition.document,e=this.composition.getSelectedRange(),this.startPosition=e[0],this.endPosition=e[1],this.startLocation=this.document.locationFromPosition(this.startPosition),this.endLocation=this.document.locationFromPosition(this.endPosition),this.block=this.document.getBlockAtIndex(this.endLocation.index),this.breaksOnReturn=this.block.breaksOnReturn(),this.previousCharacter=this.block.text.getStringAtPosition(this.endLocation.offset-1),this.nextCharacter=this.block.text.getStringAtPosition(this.endLocation.offset)}return t.prototype.shouldInsertBlockBreak=function(){return this.block.hasAttributes()&&this.block.isListItem()&&!this.block.isEmpty()?0!==this.startLocation.offset:this.breaksOnReturn&&"\n"!==this.nextCharacter},t.prototype.shouldBreakFormattedBlock=function(){return this.block.hasAttributes()&&!this.block.isListItem()&&(this.breaksOnReturn&&"\n"===this.nextCharacter||"\n"===this.previousCharacter)},t.prototype.shouldDecreaseListLevel=function(){return this.block.hasAttributes()&&this.block.isListItem()&&this.block.isEmpty()},t.prototype.shouldPrependListItem=function(){return this.block.isListItem()&&0===this.startLocation.offset&&!this.block.isEmpty()},t.prototype.shouldRemoveLastBlockAttribute=function(){return this.block.hasAttributes()&&!this.block.isListItem()&&this.block.isEmpty()},t}()}.call(this),function(){var t,n,i,o,r,s,a,u,c,l,h=function(t,e){function n(){this.constructor=t}for(var i in e)p.call(e,i)&&(t[i]=e[i]);return n.prototype=e.prototype,t.prototype=new n,t.__super__=e.prototype,t},p={}.hasOwnProperty;s=e.normalizeRange,c=e.rangesAreEqual,u=e.rangeIsCollapsed,a=e.objectsAreEqual,t=e.arrayStartsWith,l=e.summarizeArrayChange,i=e.getAllAttributeNames,o=e.getBlockConfig,r=e.getTextConfig,n=e.extend,e.Composition=function(p){function d(){this.document=new e.Document,this.attachments=[],this.currentAttributes={},this.revision=0}var f;return h(d,p),d.prototype.setDocument=function(t){var e;return t.isEqualTo(this.document)?void 0:(this.document=t,this.refreshAttachments(),this.revision++,null!=(e=this.delegate)&&"function"==typeof e.compositionDidChangeDocument?e.compositionDidChangeDocument(t):void 0)},d.prototype.getSnapshot=function(){return{document:this.document,selectedRange:this.getSelectedRange()}},d.prototype.loadSnapshot=function(t){var n,i,o,r;return n=t.document,r=t.selectedRange,null!=(i=this.delegate)&&"function"==typeof i.compositionWillLoadSnapshot&&i.compositionWillLoadSnapshot(),this.setDocument(null!=n?n:new e.Document),this.setSelection(null!=r?r:[0,0]),null!=(o=this.delegate)&&"function"==typeof o.compositionDidLoadSnapshot?o.compositionDidLoadSnapshot():void 0},d.prototype.insertText=function(t,e){var n,i,o,r;return r=(null!=e?e:{updatePosition:!0}).updatePosition,i=this.getSelectedRange(),this.setDocument(this.document.insertTextAtRange(t,i)),o=i[0],n=o+t.getLength(),r&&this.setSelection(n),this.notifyDelegateOfInsertionAtRange([o,n])},d.prototype.insertBlock=function(t){var n;return null==t&&(t=new e.Block),n=new e.Document([t]),this.insertDocument(n)},d.prototype.insertDocument=function(t){var n,i,o;return null==t&&(t=new e.Document),i=this.getSelectedRange(),this.setDocument(this.document.insertDocumentAtRange(t,i)),o=i[0],n=o+t.getLength(),this.setSelection(n),this.notifyDelegateOfInsertionAtRange([o,n])},d.prototype.insertString=function(t,n){var i,o;return i=this.getCurrentTextAttributes(),o=e.Text.textForStringWithAttributes(t,i),this.insertText(o,n)},d.prototype.insertBlockBreak=function(){var t,e,n;return e=this.getSelectedRange(),this.setDocument(this.document.insertBlockBreakAtRange(e)),n=e[0],t=n+1,this.setSelection(t),this.notifyDelegateOfInsertionAtRange([n,t])},d.prototype.insertLineBreak=function(){var t,n;return n=new e.LineBreakInsertion(this),n.shouldDecreaseListLevel()?(this.decreaseListLevel(),this.setSelection(n.startPosition)):n.shouldPrependListItem()?(t=new e.Document([n.block.copyWithoutText()]),this.insertDocument(t)):n.shouldInsertBlockBreak()?this.insertBlockBreak():n.shouldRemoveLastBlockAttribute()?this.removeLastBlockAttribute():n.shouldBreakFormattedBlock()?this.breakFormattedBlock(n):this.insertString("\n")},d.prototype.insertHTML=function(t){var n,i,o,r,s;return s=this.getPosition(),r=this.document.getLength(),n=e.Document.fromHTML(t),this.setDocument(this.document.mergeDocumentAtRange(n,this.getSelectedRange())),i=this.document.getLength(),o=s+(i-r),this.setSelection(o),this.notifyDelegateOfInsertionAtRange([s,o])},d.prototype.replaceHTML=function(t){var n,i,o;return n=e.Document.fromHTML(t).copyUsingObjectsFromDocument(this.document),i=this.getLocationRange({strict:!1}),o=this.document.rangeFromLocationRange(i),this.setDocument(n),this.setSelection(o)},d.prototype.insertFile=function(t){var n,i;return(null!=(i=this.delegate)?i.compositionShouldAcceptFile(t):void 0)?(n=e.Attachment.attachmentForFile(t),this.insertAttachment(n)):void 0},d.prototype.insertFiles=function(t){var n,i,o,r,s,a,u;for(u=new e.Text,r=0,s=t.length;s>r;r++)o=t[r],(null!=(a=this.delegate)?a.compositionShouldAcceptFile(o):void 0)&&(n=e.Attachment.attachmentForFile(o),i=e.Text.textForAttachmentWithAttributes(n,this.currentAttributes),u=u.appendText(i));return this.insertText(u)},d.prototype.insertAttachment=function(t){var n;return n=e.Text.textForAttachmentWithAttributes(t,this.currentAttributes),this.insertText(n)},d.prototype.deleteInDirection=function(t){var e,n,i,o,r,s,a;return o=this.getLocationRange(),r=this.getSelectedRange(),s=u(r),s?i="backward"===t&&0===o[0].offset:a=o[0].index!==o[1].index,i&&this.canDecreaseBlockAttributeLevel()&&(n=this.getBlock(),n.isListItem()?this.decreaseListLevel():this.decreaseBlockAttributeLevel(),this.setSelection(r[0]),n.isEmpty())?!1:(s&&(r=this.getExpandedRangeInDirection(t),"backward"===t&&(e=this.getAttachmentAtRange(r))),e?(this.editAttachment(e),!1):(this.setDocument(this.document.removeTextAtRange(r)),this.setSelection(r[0]),i||a?!1:void 0))},d.prototype.moveTextFromRange=function(t){var e;return e=this.getSelectedRange()[0],this.setDocument(this.document.moveTextFromRangeToPosition(t,e)),this.setSelection(e)},d.prototype.removeAttachment=function(t){var e;return(e=this.document.getRangeOfAttachment(t))?(this.stopEditingAttachment(),this.setDocument(this.document.removeTextAtRange(e)),this.setSelection(e[0])):void 0},d.prototype.removeLastBlockAttribute=function(){var t,e,n,i;return n=this.getSelectedRange(),i=n[0],e=n[1],t=this.document.getBlockAtPosition(e),this.removeCurrentAttribute(t.getLastAttribute()),this.setSelection(i)},f=" ",d.prototype.insertPlaceholder=function(){return this.placeholderPosition=this.getPosition(),this.insertString(f)},d.prototype.selectPlaceholder=function(){return null!=this.placeholderPosition?(this.setSelectedRange([this.placeholderPosition,this.placeholderPosition+f.length]),this.getSelectedRange()):void 0},d.prototype.forgetPlaceholder=function(){return this.placeholderPosition=null},d.prototype.hasCurrentAttribute=function(t){var e;return e=this.currentAttributes[t],null!=e&&e!==!1},d.prototype.toggleCurrentAttribute=function(t){var e;return(e=!this.currentAttributes[t])?this.setCurrentAttribute(t,e):this.removeCurrentAttribute(t)},d.prototype.canSetCurrentAttribute=function(t){return o(t)?this.canSetCurrentBlockAttribute(t):this.canSetCurrentTextAttribute(t)},d.prototype.canSetCurrentTextAttribute=function(t){switch(t){case"href":return!this.selectionContainsAttachmentWithAttribute(t);default:return!0}},d.prototype.canSetCurrentBlockAttribute=function(){var t;if(t=this.getBlock())return!t.isTerminalBlock()},d.prototype.setCurrentAttribute=function(t,e){return o(t)?this.setBlockAttribute(t,e):(this.setTextAttribute(t,e),this.currentAttributes[t]=e,this.notifyDelegateOfCurrentAttributesChange())},d.prototype.setTextAttribute=function(t,n){var i,o,r,s;if(o=this.getSelectedRange())return r=o[0],i=o[1],r!==i?this.setDocument(this.document.addAttributeAtRange(t,n,o)):"href"===t?(s=e.Text.textForStringWithAttributes(n,{href:n}),this.insertText(s)):void 0},d.prototype.setBlockAttribute=function(t,e){var n,i;if(i=this.getSelectedRange())return this.canSetCurrentAttribute(t)?(n=this.getBlock(),this.setDocument(this.document.applyBlockAttributeAtRange(t,e,i)),this.setSelection(i)):void 0},d.prototype.removeCurrentAttribute=function(t){return o(t)?(this.removeBlockAttribute(t),this.updateCurrentAttributes()):(this.removeTextAttribute(t),delete this.currentAttributes[t],this.notifyDelegateOfCurrentAttributesChange())},d.prototype.removeTextAttribute=function(t){var e;if(e=this.getSelectedRange())return this.setDocument(this.document.removeAttributeAtRange(t,e))},d.prototype.removeBlockAttribute=function(t){var e;if(e=this.getSelectedRange())return this.setDocument(this.document.removeAttributeAtRange(t,e))},d.prototype.canDecreaseNestingLevel=function(){var t;return(null!=(t=this.getBlock())?t.getNestingLevel():void 0)>0},d.prototype.canIncreaseNestingLevel=function(){var e,n,i;if(e=this.getBlock())return(null!=(i=o(e.getLastNestableAttribute()))?i.listAttribute:0)?(n=this.getPreviousBlock())?t(n.getListItemAttributes(),e.getListItemAttributes()):void 0:e.getNestingLevel()>0},d.prototype.decreaseNestingLevel=function(){var t;if(t=this.getBlock())return this.setDocument(this.document.replaceBlock(t,t.decreaseNestingLevel()))},d.prototype.increaseNestingLevel=function(){var t;if(t=this.getBlock())return this.setDocument(this.document.replaceBlock(t,t.increaseNestingLevel()))},d.prototype.canDecreaseBlockAttributeLevel=function(){var t;return(null!=(t=this.getBlock())?t.getAttributeLevel():void 0)>0},d.prototype.decreaseBlockAttributeLevel=function(){var t,e;return(t=null!=(e=this.getBlock())?e.getLastAttribute():void 0)?this.removeCurrentAttribute(t):void 0},d.prototype.decreaseListLevel=function(){var t,e,n,i,o,r;for(r=this.getSelectedRange()[0],o=this.document.locationFromPosition(r).index,n=o,t=this.getBlock().getAttributeLevel();(e=this.document.getBlockAtIndex(n+1))&&e.isListItem()&&e.getAttributeLevel()>t;)n++;return r=this.document.positionFromLocation({index:o,offset:0}),i=this.document.positionFromLocation({index:n,offset:0}),this.setDocument(this.document.removeLastListAttributeAtRange([r,i]))},d.prototype.updateCurrentAttributes=function(){var t,e,n,o,r,s;if(s=this.getSelectedRange({ignoreLock:!0})){for(e=this.document.getCommonAttributesAtRange(s),r=i(),n=0,o=r.length;o>n;n++)t=r[n],e[t]||this.canSetCurrentAttribute(t)||(e[t]=!1);if(!a(e,this.currentAttributes))return this.currentAttributes=e,this.notifyDelegateOfCurrentAttributesChange()}},d.prototype.getCurrentAttributes=function(){return n.call({},this.currentAttributes)},d.prototype.getCurrentTextAttributes=function(){var t,e,n,i;t={},n=this.currentAttributes;for(e in n)i=n[e],r(e)&&(t[e]=i);return t},d.prototype.freezeSelection=function(){return this.setCurrentAttribute("frozen",!0)},d.prototype.thawSelection=function(){return this.removeCurrentAttribute("frozen")},d.prototype.hasFrozenSelection=function(){return this.hasCurrentAttribute("frozen")},d.proxyMethod("getSelectionManager().getPointRange"),d.proxyMethod("getSelectionManager().setLocationRangeFromPointRange"),d.proxyMethod("getSelectionManager().locationIsCursorTarget"),d.proxyMethod("getSelectionManager().selectionIsExpanded"),d.proxyMethod("delegate?.getSelectionManager"),d.prototype.setSelection=function(t){var e,n;return e=this.document.locationRangeFromRange(t),null!=(n=this.delegate)?n.compositionDidRequestChangingSelectionToLocationRange(e):void 0},d.prototype.getSelectedRange=function(){var t;return(t=this.getLocationRange())?this.document.rangeFromLocationRange(t):void 0},d.prototype.setSelectedRange=function(t){var e;return e=this.document.locationRangeFromRange(t),this.getSelectionManager().setLocationRange(e)},d.prototype.getPosition=function(){var t;return(t=this.getLocationRange())?this.document.positionFromLocation(t[0]):void 0},d.prototype.getLocationRange=function(t){var e;return null!=(e=this.getSelectionManager().getLocationRange(t))?e:s({index:0,offset:0})},d.prototype.getExpandedRangeInDirection=function(t){var e,n,i;return n=this.getSelectedRange(),i=n[0],e=n[1],"backward"===t?i=this.translateUTF16PositionFromOffset(i,-1):e=this.translateUTF16PositionFromOffset(e,1),s([i,e])},d.prototype.moveCursorInDirection=function(t){var e,n,i,o;return this.editingAttachment?i=this.document.getRangeOfAttachment(this.editingAttachment):(o=this.getSelectedRange(),i=this.getExpandedRangeInDirection(t),n=!c(o,i)),this.setSelectedRange("backward"===t?i[0]:i[1]),n&&(e=this.getAttachmentAtRange(i))?this.editAttachment(e):void 0},d.prototype.expandSelectionInDirection=function(t){var e;return e=this.getExpandedRangeInDirection(t),this.setSelectedRange(e)},d.prototype.expandSelectionForEditing=function(){return this.hasCurrentAttribute("href")?this.expandSelectionAroundCommonAttribute("href"):void 0},d.prototype.expandSelectionAroundCommonAttribute=function(t){var e,n;return e=this.getPosition(),n=this.document.getRangeOfCommonAttributeAtPosition(t,e),this.setSelectedRange(n)},d.prototype.selectionContainsAttachmentWithAttribute=function(t){var e,n,i,o,r;if(r=this.getSelectedRange()){for(o=this.document.getDocumentAtRange(r).getAttachments(),n=0,i=o.length;i>n;n++)if(e=o[n],e.hasAttribute(t))return!0;return!1}},d.prototype.selectionIsInCursorTarget=function(){return this.editingAttachment||this.positionIsCursorTarget(this.getPosition())},d.prototype.positionIsCursorTarget=function(t){var e;return(e=this.document.locationFromPosition(t))?this.locationIsCursorTarget(e):void 0},d.prototype.positionIsBlockBreak=function(t){var e;return null!=(e=this.document.getPieceAtPosition(t))?e.isBlockBreak():void 0},d.prototype.getSelectedDocument=function(){var t;return(t=this.getSelectedRange())?this.document.getDocumentAtRange(t):void 0},d.prototype.getAttachments=function(){return this.attachments.slice(0)},d.prototype.refreshAttachments=function(){var t,e,n,i,o,r,s,a,u,c,h,p;for(n=this.document.getAttachments(),a=l(this.attachments,n),t=a.added,h=a.removed,this.attachments=n,i=0,r=h.length;r>i;i++)e=h[i],e.delegate=null,null!=(u=this.delegate)&&"function"==typeof u.compositionDidRemoveAttachment&&u.compositionDidRemoveAttachment(e);for(p=[],o=0,s=t.length;s>o;o++)e=t[o],e.delegate=this,p.push(null!=(c=this.delegate)&&"function"==typeof c.compositionDidAddAttachment?c.compositionDidAddAttachment(e):void 0);return p},d.prototype.attachmentDidChangeAttributes=function(t){var e;return this.revision++,null!=(e=this.delegate)&&"function"==typeof e.compositionDidEditAttachment?e.compositionDidEditAttachment(t):void 0},d.prototype.attachmentDidChangePreviewURL=function(t){var e;return this.revision++,null!=(e=this.delegate)&&"function"==typeof e.compositionDidChangeAttachmentPreviewURL?e.compositionDidChangeAttachmentPreviewURL(t):void 0},d.prototype.editAttachment=function(t){var e;if(t!==this.editingAttachment)return this.stopEditingAttachment(),this.editingAttachment=t,null!=(e=this.delegate)&&"function"==typeof e.compositionDidStartEditingAttachment?e.compositionDidStartEditingAttachment(this.editingAttachment):void 0},d.prototype.stopEditingAttachment=function(){var t;if(this.editingAttachment)return null!=(t=this.delegate)&&"function"==typeof t.compositionDidStopEditingAttachment&&t.compositionDidStopEditingAttachment(this.editingAttachment),this.editingAttachment=null},d.prototype.canEditAttachmentCaption=function(){var t;return null!=(t=this.editingAttachment)?t.isPreviewable():void 0},d.prototype.updateAttributesForAttachment=function(t,e){return this.setDocument(this.document.updateAttributesForAttachment(t,e))},d.prototype.removeAttributeForAttachment=function(t,e){return this.setDocument(this.document.removeAttributeForAttachment(t,e))},d.prototype.breakFormattedBlock=function(t){var n,i,o,r,s;return i=t.document,n=t.block,r=t.startPosition,s=[r-1,r],n.getBlockBreakPosition()===t.startLocation.offset?(n.breaksOnReturn()&&"\n"===t.nextCharacter?r+=1:i=i.removeTextAtRange(s),s=[r,r]):"\n"===t.nextCharacter?"\n"===t.previousCharacter?s=[r-1,r+1]:(s=[r,r+1],r+=1):t.startLocation.offset-1!==0&&(r+=1),o=new e.Document([n.removeLastAttribute().copyWithoutText()]),this.setDocument(i.insertDocumentAtRange(o,s)),this.setSelection(r)},d.prototype.getPreviousBlock=function(){var t,e;return(e=this.getLocationRange())&&(t=e[0].index,t>0)?this.document.getBlockAtIndex(t-1):void 0},d.prototype.getBlock=function(){var t;return(t=this.getLocationRange())?this.document.getBlockAtIndex(t[0].index):void 0},d.prototype.getAttachmentAtRange=function(t){var n;return n=this.document.getDocumentAtRange(t),n.toString()===e.OBJECT_REPLACEMENT_CHARACTER+"\n"?n.getAttachments()[0]:void 0},d.prototype.notifyDelegateOfCurrentAttributesChange=function(){var t;return null!=(t=this.delegate)&&"function"==typeof t.compositionDidChangeCurrentAttributes?t.compositionDidChangeCurrentAttributes(this.currentAttributes):void 0},d.prototype.notifyDelegateOfInsertionAtRange=function(t){var e;return null!=(e=this.delegate)&&"function"==typeof e.compositionDidPerformInsertionAtRange?e.compositionDidPerformInsertionAtRange(t):void 0},d.prototype.translateUTF16PositionFromOffset=function(t,e){var n,i;return i=this.document.toUTF16String(),n=i.offsetFromUCS2Offset(t),i.offsetToUCS2Offset(n+e)},d}(e.BasicObject)}.call(this),function(){var t=function(t,e){function i(){this.constructor=t}for(var o in e)n.call(e,o)&&(t[o]=e[o]);return i.prototype=e.prototype,t.prototype=new i,t.__super__=e.prototype,t},n={}.hasOwnProperty;e.UndoManager=function(e){function n(t){this.composition=t,this.undoEntries=[],this.redoEntries=[]}var i;return t(n,e),n.prototype.recordUndoEntry=function(t,e){var n,o,r,s,a;return s=null!=e?e:{},o=s.context,n=s.consolidatable,r=this.undoEntries.slice(-1)[0],n&&i(r,t,o)?void 0:(a=this.createEntry({description:t,context:o}),this.undoEntries.push(a),this.redoEntries=[])},n.prototype.undo=function(){var t,e;return(e=this.undoEntries.pop())?(t=this.createEntry(e),this.redoEntries.push(t),this.composition.loadSnapshot(e.snapshot)):void 0},n.prototype.redo=function(){var t,e;return(t=this.redoEntries.pop())?(e=this.createEntry(t),this.undoEntries.push(e),this.composition.loadSnapshot(t.snapshot)):void 0
},n.prototype.canUndo=function(){return this.undoEntries.length>0},n.prototype.canRedo=function(){return this.redoEntries.length>0},n.prototype.createEntry=function(t){var e,n,i;return i=null!=t?t:{},n=i.description,e=i.context,{description:null!=n?n.toString():void 0,context:JSON.stringify(e),snapshot:this.composition.getSnapshot()}},i=function(t,e,n){return(null!=t?t.description:void 0)===(null!=e?e.toString():void 0)&&(null!=t?t.context:void 0)===JSON.stringify(n)},n}(e.BasicObject)}.call(this),function(){e.Editor=function(){function t(t,n,i){this.composition=t,this.selectionManager=n,this.element=i,this.undoManager=new e.UndoManager(this.composition)}return t.prototype.loadDocument=function(t){return this.loadSnapshot({document:t,selectedRange:[0,0]})},t.prototype.loadHTML=function(t){return null==t&&(t=""),this.loadDocument(e.Document.fromHTML(t,{referenceElement:this.element}))},t.prototype.loadJSON=function(t){var n,i;return n=t.document,i=t.selectedRange,n=e.Document.fromJSON(n),this.loadSnapshot({document:n,selectedRange:i})},t.prototype.loadSnapshot=function(t){return this.undoManager=new e.UndoManager(this.composition),this.composition.loadSnapshot(t)},t.prototype.getDocument=function(){return this.composition.document},t.prototype.getSelectedDocument=function(){return this.composition.getSelectedDocument()},t.prototype.getSnapshot=function(){return this.composition.getSnapshot()},t.prototype.toJSON=function(){return this.getSnapshot()},t.prototype.deleteInDirection=function(t){return this.composition.deleteInDirection(t)},t.prototype.insertAttachment=function(t){return this.composition.insertAttachment(t)},t.prototype.insertDocument=function(t){return this.composition.insertDocument(t)},t.prototype.insertFile=function(t){return this.composition.insertFile(t)},t.prototype.insertHTML=function(t){return this.composition.insertHTML(t)},t.prototype.insertString=function(t){return this.composition.insertString(t)},t.prototype.insertText=function(t){return this.composition.insertText(t)},t.prototype.insertLineBreak=function(){return this.composition.insertLineBreak()},t.prototype.getSelectedRange=function(){return this.composition.getSelectedRange()},t.prototype.getPosition=function(){return this.composition.getPosition()},t.prototype.getClientRectAtPosition=function(t){var e;return e=this.getDocument().locationRangeFromRange([t,t+1]),this.selectionManager.getClientRectAtLocationRange(e)},t.prototype.expandSelectionInDirection=function(t){return this.composition.expandSelectionInDirection(t)},t.prototype.moveCursorInDirection=function(t){return this.composition.moveCursorInDirection(t)},t.prototype.setSelectedRange=function(t){return this.composition.setSelectedRange(t)},t.prototype.activateAttribute=function(t,e){return null==e&&(e=!0),this.composition.setCurrentAttribute(t,e)},t.prototype.attributeIsActive=function(t){return this.composition.hasCurrentAttribute(t)},t.prototype.canActivateAttribute=function(t){return this.composition.canSetCurrentAttribute(t)},t.prototype.deactivateAttribute=function(t){return this.composition.removeCurrentAttribute(t)},t.prototype.canDecreaseNestingLevel=function(){return this.composition.canDecreaseNestingLevel()},t.prototype.canIncreaseNestingLevel=function(){return this.composition.canIncreaseNestingLevel()},t.prototype.decreaseNestingLevel=function(){return this.canDecreaseNestingLevel()?this.composition.decreaseNestingLevel():void 0},t.prototype.increaseNestingLevel=function(){return this.canIncreaseNestingLevel()?this.composition.increaseNestingLevel():void 0},t.prototype.canDecreaseIndentationLevel=function(){return this.canDecreaseNestingLevel()},t.prototype.canIncreaseIndentationLevel=function(){return this.canIncreaseNestingLevel()},t.prototype.decreaseIndentationLevel=function(){return this.decreaseNestingLevel()},t.prototype.increaseIndentationLevel=function(){return this.increaseNestingLevel()},t.prototype.canRedo=function(){return this.undoManager.canRedo()},t.prototype.canUndo=function(){return this.undoManager.canUndo()},t.prototype.recordUndoEntry=function(t,e){var n,i,o;return o=null!=e?e:{},i=o.context,n=o.consolidatable,this.undoManager.recordUndoEntry(t,{context:i,consolidatable:n})},t.prototype.redo=function(){return this.canRedo()?this.undoManager.redo():void 0},t.prototype.undo=function(){return this.canUndo()?this.undoManager.undo():void 0},t}()}.call(this),function(){var t=function(t,e){function i(){this.constructor=t}for(var o in e)n.call(e,o)&&(t[o]=e[o]);return i.prototype=e.prototype,t.prototype=new i,t.__super__=e.prototype,t},n={}.hasOwnProperty;e.ManagedAttachment=function(e){function n(t,e){var n;this.attachmentManager=t,this.attachment=e,n=this.attachment,this.id=n.id,this.file=n.file}return t(n,e),n.prototype.remove=function(){return this.attachmentManager.requestRemovalOfAttachment(this.attachment)},n.proxyMethod("attachment.getAttribute"),n.proxyMethod("attachment.hasAttribute"),n.proxyMethod("attachment.setAttribute"),n.proxyMethod("attachment.getAttributes"),n.proxyMethod("attachment.setAttributes"),n.proxyMethod("attachment.isPending"),n.proxyMethod("attachment.isPreviewable"),n.proxyMethod("attachment.getURL"),n.proxyMethod("attachment.getHref"),n.proxyMethod("attachment.getFilename"),n.proxyMethod("attachment.getFilesize"),n.proxyMethod("attachment.getFormattedFilesize"),n.proxyMethod("attachment.getExtension"),n.proxyMethod("attachment.getContentType"),n.proxyMethod("attachment.getFile"),n.proxyMethod("attachment.setFile"),n.proxyMethod("attachment.releaseFile"),n.proxyMethod("attachment.getUploadProgress"),n.proxyMethod("attachment.setUploadProgress"),n}(e.BasicObject)}.call(this),function(){var t=function(t,e){function i(){this.constructor=t}for(var o in e)n.call(e,o)&&(t[o]=e[o]);return i.prototype=e.prototype,t.prototype=new i,t.__super__=e.prototype,t},n={}.hasOwnProperty;e.AttachmentManager=function(n){function i(t){var e,n,i;for(null==t&&(t=[]),this.managedAttachments={},n=0,i=t.length;i>n;n++)e=t[n],this.manageAttachment(e)}return t(i,n),i.prototype.getAttachments=function(){var t,e,n,i;n=this.managedAttachments,i=[];for(e in n)t=n[e],i.push(t);return i},i.prototype.manageAttachment=function(t){var n,i;return null!=(n=this.managedAttachments)[i=t.id]?n[i]:n[i]=new e.ManagedAttachment(this,t)},i.prototype.attachmentIsManaged=function(t){return t.id in this.managedAttachments},i.prototype.requestRemovalOfAttachment=function(t){var e;return this.attachmentIsManaged(t)&&null!=(e=this.delegate)&&"function"==typeof e.attachmentManagerDidRequestRemovalOfAttachment?e.attachmentManagerDidRequestRemovalOfAttachment(t):void 0},i.prototype.unmanageAttachment=function(t){var e;return e=this.managedAttachments[t.id],delete this.managedAttachments[t.id],e},i}(e.BasicObject)}.call(this),function(){var t,n,i,o,r,s,a,u,c,l,h;t=e.elementContainsNode,n=e.findChildIndexOfNode,r=e.nodeIsBlockStart,s=e.nodeIsBlockStartComment,o=e.nodeIsBlockContainer,a=e.nodeIsCursorTarget,u=e.nodeIsEmptyTextNode,c=e.nodeIsTextNode,i=e.nodeIsAttachmentElement,l=e.tagName,h=e.walkTree,e.LocationMapper=function(){function e(t){this.element=t}var p,d,f,g;return e.prototype.findLocationFromContainerAndOffset=function(e,i,o){var s,u,l,p,g,m,y;for(m=(null!=o?o:{strict:!0}).strict,u=0,l=!1,p={index:0,offset:0},(s=this.findAttachmentElementParentForNode(e))&&(e=s.parentNode,i=n(s)),y=h(this.element,{usingFilter:f});y.nextNode();){if(g=y.currentNode,g===e&&c(e)){a(g)||(p.offset+=i);break}if(g.parentNode===e){if(u++===i)break}else if(!t(e,g)&&u>0)break;r(g,{strict:m})?(l&&p.index++,p.offset=0,l=!0):p.offset+=d(g)}return p},e.prototype.findContainerAndOffsetFromLocation=function(t){var e,i,s,a,u,l;if(0===t.index&&0===t.offset){for(e=this.element,a=0;e.firstChild;)if(e=e.firstChild,o(e)){a=1;break}return[e,a]}if(u=this.findNodeAndOffsetFromLocation(t),i=u[0],s=u[1],i){if(c(i))e=i,l=i.textContent,a=t.offset-s;else{if(e=i.parentNode,!r(i.previousSibling)&&!o(e))for(;i===e.lastChild&&(i=e,e=e.parentNode,!o(e)););a=n(i),0!==t.offset&&a++}return[e,a]}},e.prototype.findNodeAndOffsetFromLocation=function(t){var e,n,i,o,r,s,u,l;for(u=0,l=this.getSignificantNodesForIndex(t.index),n=0,i=l.length;i>n;n++){if(e=l[n],o=d(e),t.offset<=u+o)if(c(e)){if(r=e,s=u,t.offset===s&&a(r))break}else r||(r=e,s=u);if(u+=o,u>t.offset)break}return[r,s]},e.prototype.findAttachmentElementParentForNode=function(t){for(;t&&t!==this.element;){if(i(t))return t;t=t.parentNode}},e.prototype.getSignificantNodesForIndex=function(t){var e,n,i,o,r;for(i=[],r=h(this.element,{usingFilter:p}),o=!1;r.nextNode();)if(n=r.currentNode,s(n)){if("undefined"!=typeof e&&null!==e?e++:e=0,e===t)o=!0;else if(o)break}else o&&i.push(n);return i},d=function(t){var e;return t.nodeType===Node.TEXT_NODE?a(t)?0:(e=t.textContent,e.length):"br"===l(t)||i(t)?1:0},p=function(t){return g(t)===NodeFilter.FILTER_ACCEPT?f(t):NodeFilter.FILTER_REJECT},g=function(t){return u(t)?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT},f=function(t){return i(t.parentNode)?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT},e}()}.call(this),function(){var t,n,i=[].slice;t=e.getDOMRange,n=e.setDOMRange,e.PointMapper=function(){function e(){}return e.prototype.createDOMRangeFromPoint=function(e){var i,o,r,s,a,u,c,l;if(c=e.x,l=e.y,document.caretPositionFromPoint)return a=document.caretPositionFromPoint(c,l),r=a.offsetNode,o=a.offset,i=document.createRange(),i.setStart(r,o),i;if(document.caretRangeFromPoint)return document.caretRangeFromPoint(c,l);if(document.body.createTextRange){s=t();try{u=document.body.createTextRange(),u.moveToPoint(c,l),u.select()}catch(h){}return i=t(),n(s),i}},e.prototype.getClientRectsForDOMRange=function(t){var e,n,o;return n=i.call(t.getClientRects()),o=n[0],e=n[n.length-1],[o,e]},e}()}.call(this),function(){var t,n=function(t,e){return function(){return t.apply(e,arguments)}},i=function(t,e){function n(){this.constructor=t}for(var i in e)o.call(e,i)&&(t[i]=e[i]);return n.prototype=e.prototype,t.prototype=new n,t.__super__=e.prototype,t},o={}.hasOwnProperty,r=[].indexOf||function(t){for(var e=0,n=this.length;n>e;e++)if(e in this&&this[e]===t)return e;return-1};t=e.getDOMRange,e.SelectionChangeObserver=function(e){function o(){this.run=n(this.run,this),this.update=n(this.update,this),this.selectionManagers=[]}var s;return i(o,e),o.prototype.start=function(){return this.started?void 0:(this.started=!0,"onselectionchange"in document?document.addEventListener("selectionchange",this.update,!0):this.run())},o.prototype.stop=function(){return this.started?(this.started=!1,document.removeEventListener("selectionchange",this.update,!0)):void 0},o.prototype.registerSelectionManager=function(t){return r.call(this.selectionManagers,t)<0?(this.selectionManagers.push(t),this.start()):void 0},o.prototype.unregisterSelectionManager=function(t){var e;return this.selectionManagers=function(){var n,i,o,r;for(o=this.selectionManagers,r=[],n=0,i=o.length;i>n;n++)e=o[n],e!==t&&r.push(e);return r}.call(this),0===this.selectionManagers.length?this.stop():void 0},o.prototype.notifySelectionManagersOfSelectionChange=function(){var t,e,n,i,o;for(n=this.selectionManagers,i=[],t=0,e=n.length;e>t;t++)o=n[t],i.push(o.selectionDidChange());return i},o.prototype.update=function(){var e;return e=t(),s(e,this.domRange)?void 0:(this.domRange=e,this.notifySelectionManagersOfSelectionChange())},o.prototype.reset=function(){return this.domRange=null,this.update()},o.prototype.run=function(){return this.started?(this.update(),requestAnimationFrame(this.run)):void 0},s=function(t,e){return(null!=t?t.startContainer:void 0)===(null!=e?e.startContainer:void 0)&&(null!=t?t.startOffset:void 0)===(null!=e?e.startOffset:void 0)&&(null!=t?t.endContainer:void 0)===(null!=e?e.endContainer:void 0)&&(null!=t?t.endOffset:void 0)===(null!=e?e.endOffset:void 0)},o}(e.BasicObject),null==e.selectionChangeObserver&&(e.selectionChangeObserver=new e.SelectionChangeObserver)}.call(this),function(){var t,n,i,o,r,s,a,u,c,l,h=function(t,e){return function(){return t.apply(e,arguments)}},p=function(t,e){function n(){this.constructor=t}for(var i in e)d.call(e,i)&&(t[i]=e[i]);return n.prototype=e.prototype,t.prototype=new n,t.__super__=e.prototype,t},d={}.hasOwnProperty;i=e.getDOMSelection,n=e.getDOMRange,l=e.setDOMRange,t=e.elementContainsNode,s=e.nodeIsCursorTarget,r=e.innerElementIsActive,o=e.handleEvent,a=e.normalizeRange,u=e.rangeIsCollapsed,c=e.rangesAreEqual,e.SelectionManager=function(d){function f(t){this.element=t,this.selectionDidChange=h(this.selectionDidChange,this),this.didMouseDown=h(this.didMouseDown,this),this.locationMapper=new e.LocationMapper(this.element),this.pointMapper=new e.PointMapper,this.lockCount=0,o("mousedown",{onElement:this.element,withCallback:this.didMouseDown})}return p(f,d),f.prototype.getLocationRange=function(t){var e,i;return null==t&&(t={}),e=t.strict===!1?this.createLocationRangeFromDOMRange(n(),{strict:!1}):t.ignoreLock?this.currentLocationRange:null!=(i=this.lockedLocationRange)?i:this.currentLocationRange},f.prototype.setLocationRange=function(t){var e;if(!this.lockedLocationRange)return t=a(t),(e=this.createDOMRangeFromLocationRange(t))?(l(e),this.updateCurrentLocationRange(t)):void 0},f.prototype.setLocationRangeFromPointRange=function(t){var e,n;return t=a(t),n=this.getLocationAtPoint(t[0]),e=this.getLocationAtPoint(t[1]),this.setLocationRange([n,e])},f.prototype.getClientRectAtLocationRange=function(t){var e;return(e=this.createDOMRangeFromLocationRange(t))?this.getClientRectsForDOMRange(e)[1]:void 0},f.prototype.locationIsCursorTarget=function(t){var e,n,i;return i=this.findNodeAndOffsetFromLocation(t),e=i[0],n=i[1],s(e)},f.prototype.lock=function(){return 0===this.lockCount++?(this.updateCurrentLocationRange(),this.lockedLocationRange=this.getLocationRange()):void 0},f.prototype.unlock=function(){var t;return 0===--this.lockCount&&(t=this.lockedLocationRange,this.lockedLocationRange=null,null!=t)?this.setLocationRange(t):void 0},f.prototype.clearSelection=function(){var t;return null!=(t=i())?t.removeAllRanges():void 0},f.prototype.selectionIsCollapsed=function(){var t;return(null!=(t=n())?t.collapsed:void 0)===!0},f.prototype.selectionIsExpanded=function(){return!this.selectionIsCollapsed()},f.proxyMethod("locationMapper.findLocationFromContainerAndOffset"),f.proxyMethod("locationMapper.findContainerAndOffsetFromLocation"),f.proxyMethod("locationMapper.findNodeAndOffsetFromLocation"),f.proxyMethod("pointMapper.createDOMRangeFromPoint"),f.proxyMethod("pointMapper.getClientRectsForDOMRange"),f.prototype.didMouseDown=function(){return this.pauseTemporarily()},f.prototype.pauseTemporarily=function(){var e,n,i,r;return this.paused=!0,n=function(e){return function(){var n,o,s;for(e.paused=!1,clearTimeout(r),o=0,s=i.length;s>o;o++)n=i[o],n.destroy();return t(document,e.element)?e.selectionDidChange():void 0}}(this),r=setTimeout(n,200),i=function(){var t,i,r,s;for(r=["mousemove","keydown"],s=[],t=0,i=r.length;i>t;t++)e=r[t],s.push(o(e,{onElement:document,withCallback:n}));return s}()},f.prototype.selectionDidChange=function(){return this.paused||r(this.element)?void 0:this.updateCurrentLocationRange()},f.prototype.updateCurrentLocationRange=function(t){var e;return(null!=t?t:t=this.createLocationRangeFromDOMRange(n()))&&!c(t,this.currentLocationRange)?(this.currentLocationRange=t,null!=(e=this.delegate)&&"function"==typeof e.locationRangeDidChange?e.locationRangeDidChange(this.currentLocationRange.slice(0)):void 0):void 0},f.prototype.createDOMRangeFromLocationRange=function(t){var e,n,i,o;return i=this.findContainerAndOffsetFromLocation(t[0]),n=u(t)?i:null!=(o=this.findContainerAndOffsetFromLocation(t[1]))?o:i,null!=i&&null!=n?(e=document.createRange(),e.setStart.apply(e,i),e.setEnd.apply(e,n),e):void 0},f.prototype.createLocationRangeFromDOMRange=function(t,e){var n,i;if(null!=t&&this.domRangeWithinElement(t)&&(i=this.findLocationFromContainerAndOffset(t.startContainer,t.startOffset,e)))return t.collapsed||(n=this.findLocationFromContainerAndOffset(t.endContainer,t.endOffset,e)),a([i,n])},f.prototype.getLocationAtPoint=function(t){var e,n;return(e=this.createDOMRangeFromPoint(t))&&null!=(n=this.createLocationRangeFromDOMRange(e))?n[0]:void 0},f.prototype.domRangeWithinElement=function(e){return e.collapsed?t(this.element,e.startContainer):t(this.element,e.startContainer)&&t(this.element,e.endContainer)},f}(e.BasicObject)}.call(this),function(){var t,n,i,o=function(t,e){function n(){this.constructor=t}for(var i in e)r.call(e,i)&&(t[i]=e[i]);return n.prototype=e.prototype,t.prototype=new n,t.__super__=e.prototype,t},r={}.hasOwnProperty,s=[].slice;n=e.rangeIsCollapsed,i=e.rangesAreEqual,t=e.objectsAreEqual,e.EditorController=function(r){function a(t){var n,i;this.editorElement=t.editorElement,n=t.document,i=t.html,this.selectionManager=new e.SelectionManager(this.editorElement),this.selectionManager.delegate=this,this.composition=new e.Composition,this.composition.delegate=this,this.attachmentManager=new e.AttachmentManager(this.composition.getAttachments()),this.attachmentManager.delegate=this,this.inputController=new e.InputController(this.editorElement),this.inputController.delegate=this,this.inputController.responder=this.composition,this.compositionController=new e.CompositionController(this.editorElement,this.composition),this.compositionController.delegate=this,this.toolbarController=new e.ToolbarController(this.editorElement.toolbarElement),this.toolbarController.delegate=this,this.editor=new e.Editor(this.composition,this.selectionManager,this.editorElement),null!=n?this.editor.loadDocument(n):this.editor.loadHTML(i)}return o(a,r),a.prototype.registerSelectionManager=function(){return e.selectionChangeObserver.registerSelectionManager(this.selectionManager)},a.prototype.unregisterSelectionManager=function(){return e.selectionChangeObserver.unregisterSelectionManager(this.selectionManager)},a.prototype.compositionDidChangeDocument=function(){return this.editorElement.notify("document-change"),this.handlingInput?void 0:this.render()},a.prototype.compositionDidChangeCurrentAttributes=function(t){return this.currentAttributes=t,this.toolbarController.updateAttributes(this.currentAttributes),this.updateCurrentActions(),this.editorElement.notify("attributes-change",{attributes:this.currentAttributes})},a.prototype.compositionDidPerformInsertionAtRange=function(t){return this.pasting?this.pastedRange=t:void 0},a.prototype.compositionShouldAcceptFile=function(t){return this.editorElement.notify("file-accept",{file:t})},a.prototype.compositionDidAddAttachment=function(t){var e;return e=this.attachmentManager.manageAttachment(t),this.editorElement.notify("attachment-add",{attachment:e})},a.prototype.compositionDidEditAttachment=function(t){var e;return this.compositionController.rerenderViewForObject(t),e=this.attachmentManager.manageAttachment(t),this.editorElement.notify("attachment-edit",{attachment:e}),this.editorElement.notify("change")},a.prototype.compositionDidChangeAttachmentPreviewURL=function(t){return this.compositionController.invalidateViewForObject(t),this.editorElement.notify("change")},a.prototype.compositionDidRemoveAttachment=function(t){var e;return e=this.attachmentManager.unmanageAttachment(t),this.editorElement.notify("attachment-remove",{attachment:e})},a.prototype.compositionDidStartEditingAttachment=function(t){return this.attachmentLocationRange=this.composition.document.getLocationRangeOfAttachment(t),this.compositionController.installAttachmentEditorForAttachment(t),this.selectionManager.setLocationRange(this.attachmentLocationRange)},a.prototype.compositionDidStopEditingAttachment=function(){return this.compositionController.uninstallAttachmentEditor(),this.attachmentLocationRange=null},a.prototype.compositionDidRequestChangingSelectionToLocationRange=function(t){return!this.loadingSnapshot||this.isFocused()?(this.requestedLocationRange=t,this.compositionRevisionWhenLocationRangeRequested=this.composition.revision,this.handlingInput?void 0:this.render()):void 0},a.prototype.compositionWillLoadSnapshot=function(){return this.loadingSnapshot=!0},a.prototype.compositionDidLoadSnapshot=function(){return this.compositionController.refreshViewCache(),this.render(),this.loadingSnapshot=!1},a.prototype.getSelectionManager=function(){return this.selectionManager},a.proxyMethod("getSelectionManager().setLocationRange"),a.proxyMethod("getSelectionManager().getLocationRange"),a.prototype.attachmentManagerDidRequestRemovalOfAttachment=function(t){return this.removeAttachment(t)},a.prototype.compositionControllerWillSyncDocumentView=function(){return this.inputController.editorWillSyncDocumentView(),this.selectionManager.lock(),this.selectionManager.clearSelection()},a.prototype.compositionControllerDidSyncDocumentView=function(){return this.inputController.editorDidSyncDocumentView(),this.selectionManager.unlock(),this.updateCurrentActions(),this.editorElement.notify("sync")},a.prototype.compositionControllerDidRender=function(){return null!=this.requestedLocationRange&&(this.compositionRevisionWhenLocationRangeRequested===this.composition.revision&&this.selectionManager.setLocationRange(this.requestedLocationRange),this.requestedLocationRange=null,this.compositionRevisionWhenLocationRangeRequested=null),this.renderedCompositionRevision!==this.composition.revision&&(this.composition.updateCurrentAttributes(),this.editorElement.notify("render")),this.renderedCompositionRevision=this.composition.revision},a.prototype.compositionControllerDidFocus=function(){return this.toolbarController.hideDialog(),this.editorElement.notify("focus")},a.prototype.compositionControllerDidBlur=function(){return this.editorElement.notify("blur")},a.prototype.compositionControllerDidSelectAttachment=function(t){return this.composition.editAttachment(t)},a.prototype.compositionControllerDidRequestDeselectingAttachment=function(t){var e,n;return e=null!=(n=this.attachmentLocationRange)?n:this.composition.document.getLocationRangeOfAttachment(t),this.selectionManager.setLocationRange(e[1])},a.prototype.compositionControllerWillUpdateAttachment=function(t){return this.editor.recordUndoEntry("Edit Attachment",{context:t.id,consolidatable:!0})},a.prototype.compositionControllerDidRequestRemovalOfAttachment=function(t){return this.removeAttachment(t)},a.prototype.inputControllerWillHandleInput=function(){return this.handlingInput=!0,this.requestedRender=!1},a.prototype.inputControllerDidRequestRender=function(){return this.requestedRender=!0},a.prototype.inputControllerDidHandleInput=function(){return this.handlingInput=!1,this.requestedRender?(this.requestedRender=!1,this.render()):void 0},a.prototype.inputControllerDidAllowUnhandledInput=function(){return this.editorElement.notify("change")},a.prototype.inputControllerDidRequestReparse=function(){return this.reparse()},a.prototype.inputControllerWillPerformTyping=function(){return this.recordTypingUndoEntry()},a.prototype.inputControllerWillCutText=function(){return this.editor.recordUndoEntry("Cut")},a.prototype.inputControllerWillPasteText=function(){return this.editor.recordUndoEntry("Paste"),this.pasting=!0},a.prototype.inputControllerDidPaste=function(t){var e;return e=this.pastedRange,this.pastedRange=null,this.pasting=null,this.editorElement.notify("paste",{pasteData:t,range:e})},a.prototype.inputControllerWillMoveText=function(){return this.editor.recordUndoEntry("Move")},a.prototype.inputControllerWillAttachFiles=function(){return this.editor.recordUndoEntry("Drop Files")},a.prototype.inputControllerDidReceiveKeyboardCommand=function(t){return this.toolbarController.applyKeyboardCommand(t)},a.prototype.inputControllerDidStartDrag=function(){return this.locationRangeBeforeDrag=this.selectionManager.getLocationRange()},a.prototype.inputControllerDidReceiveDragOverPoint=function(t){return this.selectionManager.setLocationRangeFromPointRange(t)},a.prototype.inputControllerDidCancelDrag=function(){return this.selectionManager.setLocationRange(this.locationRangeBeforeDrag),this.locationRangeBeforeDrag=null},a.prototype.locationRangeDidChange=function(t){return this.composition.updateCurrentAttributes(),this.updateCurrentActions(),this.attachmentLocationRange&&!i(this.attachmentLocationRange,t)&&this.composition.stopEditingAttachment(),this.editorElement.notify("selection-change")},a.prototype.toolbarDidClickButton=function(){return this.getLocationRange()?void 0:this.setLocationRange({index:0,offset:0})},a.prototype.toolbarDidInvokeAction=function(t){return this.invokeAction(t)},a.prototype.toolbarDidToggleAttribute=function(t){return this.recordFormattingUndoEntry(),this.composition.toggleCurrentAttribute(t),this.render(),this.selectionFrozen?void 0:this.editorElement.focus()},a.prototype.toolbarDidUpdateAttribute=function(t,e){return this.recordFormattingUndoEntry(),this.composition.setCurrentAttribute(t,e),this.render(),this.selectionFrozen?void 0:this.editorElement.focus()},a.prototype.toolbarDidRemoveAttribute=function(t){return this.recordFormattingUndoEntry(),this.composition.removeCurrentAttribute(t),this.render(),this.selectionFrozen?void 0:this.editorElement.focus()},a.prototype.toolbarWillShowDialog=function(){return this.composition.expandSelectionForEditing(),this.freezeSelection()},a.prototype.toolbarDidShowDialog=function(t){return this.editorElement.notify("toolbar-dialog-show",{dialogName:t})},a.prototype.toolbarDidHideDialog=function(t){return this.thawSelection(),this.editorElement.focus(),this.editorElement.notify("toolbar-dialog-hide",{dialogName:t})},a.prototype.freezeSelection=function(){return this.selectionFrozen?void 0:(this.selectionManager.lock(),this.composition.freezeSelection(),this.selectionFrozen=!0,this.render())},a.prototype.thawSelection=function(){return this.selectionFrozen?(this.composition.thawSelection(),this.selectionManager.unlock(),this.selectionFrozen=!1,this.render()):void 0},a.prototype.actions={undo:{test:function(){return this.editor.canUndo()},perform:function(){return this.editor.undo()}},redo:{test:function(){return this.editor.canRedo()},perform:function(){return this.editor.redo()}},link:{test:function(){return this.editor.canActivateAttribute("href")}},increaseNestingLevel:{test:function(){return this.editor.canIncreaseNestingLevel()},perform:function(){return this.editor.increaseNestingLevel()&&this.render()}},decreaseNestingLevel:{test:function(){return this.editor.canDecreaseNestingLevel()},perform:function(){return this.editor.decreaseNestingLevel()&&this.render()}},increaseBlockLevel:{test:function(){return this.editor.canIncreaseNestingLevel()},perform:function(){return this.editor.increaseNestingLevel()&&this.render()}},decreaseBlockLevel:{test:function(){return this.editor.canDecreaseNestingLevel()},perform:function(){return this.editor.decreaseNestingLevel()&&this.render()}}},a.prototype.canInvokeAction=function(t){var e,n;return this.actionIsExternal(t)?!0:!!(null!=(e=this.actions[t])&&null!=(n=e.test)?n.call(this):void 0)},a.prototype.invokeAction=function(t){var e,n;return this.actionIsExternal(t)?this.editorElement.notify("action-invoke",{actionName:t}):null!=(e=this.actions[t])&&null!=(n=e.perform)?n.call(this):void 0},a.prototype.actionIsExternal=function(t){return/^x-./.test(t)},a.prototype.getCurrentActions=function(){var t,e;e={};for(t in this.actions)e[t]=this.canInvokeAction(t);return e},a.prototype.updateCurrentActions=function(){var e;return e=this.getCurrentActions(),t(e,this.currentActions)?void 0:(this.currentActions=e,this.toolbarController.updateActions(this.currentActions),this.editorElement.notify("actions-change",{actions:this.currentActions}))},a.prototype.reparse=function(){return this.composition.replaceHTML(this.editorElement.innerHTML)},a.prototype.render=function(){return this.compositionController.render()},a.prototype.removeAttachment=function(t){return this.editor.recordUndoEntry("Delete Attachment"),this.composition.removeAttachment(t),this.render()},a.prototype.recordFormattingUndoEntry=function(){var t;return t=this.selectionManager.getLocationRange(),n(t)?void 0:this.editor.recordUndoEntry("Formatting",{context:this.getUndoContext(),consolidatable:!0})},a.prototype.recordTypingUndoEntry=function(){return this.editor.recordUndoEntry("Typing",{context:this.getUndoContext(this.currentAttributes),consolidatable:!0})},a.prototype.getUndoContext=function(){var t;return t=1<=arguments.length?s.call(arguments,0):[],[this.getLocationContext(),this.getTimeContext()].concat(s.call(t))},a.prototype.getLocationContext=function(){var t;return t=this.selectionManager.getLocationRange(),n(t)?t[0].index:t},a.prototype.getTimeContext=function(){return e.config.undoInterval>0?Math.floor((new Date).getTime()/e.config.undoInterval):0},a.prototype.isFocused=function(){var t;return this.editorElement===(null!=(t=this.editorElement.ownerDocument)?t.activeElement:void 0)},a}(e.Controller)}.call(this),function(){var t,n,i,o,r;o=e.makeElement,r=e.triggerEvent,n=e.handleEvent,i=e.handleEventOnce,t=e.AttachmentView.attachmentSelector,e.registerElement("trix-editor",function(){var s,a,u,c,l,h,p,d;return h=0,s=function(t){return!document.querySelector(":focus")&&t.hasAttribute("autofocus")&&document.querySelector("[autofocus]")===t?t.focus():void 0},p=function(t){return t.hasAttribute("contenteditable")?void 0:(t.setAttribute("contenteditable",""),i("focus",{onElement:t,withCallback:function(){return u(t)}}))},u=function(t){return l(t),d(t)},l=function(t){return("function"==typeof document.queryCommandSupported?document.queryCommandSupported("enableObjectResizing"):void 0)?(document.execCommand("enableObjectResizing",!1,!1),n("mscontrolselect",{onElement:t,preventDefault:!0})):void 0},d=function(){var t;return("function"==typeof document.queryCommandSupported?document.queryCommandSupported("DefaultParagraphSeparator"):void 0)&&(t=e.config.blockAttributes["default"].tagName,"div"===t||"p"===t)?document.execCommand("DefaultParagraphSeparator",!1,t):void 0},a=/Trident.*rv:11/.test(navigator.userAgent),c=function(){return a?{display:"inline",width:"auto"}:{display:"inline-block",width:"1px"}}(),{defaultCSS:"%t:empty:not(:focus)::before {\n  content: attr(placeholder);\n  color: graytext;\n}\n\n%t a[contenteditable=false] {\n  cursor: text;\n}\n\n%t img {\n  max-width: 100%;\n  height: auto;\n}\n\n%t "+t+" figcaption textarea {\n  resize: none;\n}\n\n%t "+t+" figcaption textarea.trix-autoresize-clone {\n  position: absolute;\n  left: -9999px;\n  max-height: 0px;\n}\n\n%t "+t+" figcaption[data-trix-placeholder]:empty::before {\n  content: attr(data-trix-placeholder);\n  color: graytext;\n}\n\n%t [data-trix-cursor-target] {\n  display: "+c.display+" !important;\n  width: "+c.width+" !important;\n  padding: 0 !important;\n  margin: 0 !important;\n  border: none !important;\n}\n\n%t [data-trix-cursor-target=left] {\n  vertical-align: top !important;\n  margin-left: -1px !important;\n}\n\n%t [data-trix-cursor-target=right] {\n  vertical-align: bottom !important;\n  margin-right: -1px !important;\n}",trixId:{get:function(){return this.hasAttribute("trix-id")?this.getAttribute("trix-id"):(this.setAttribute("trix-id",++h),this.trixId)}},toolbarElement:{get:function(){var t,e,n;return this.hasAttribute("toolbar")?null!=(e=this.ownerDocument)?e.getElementById(this.getAttribute("toolbar")):void 0:this.parentNode?(n="trix-toolbar-"+this.trixId,this.setAttribute("toolbar",n),t=o("trix-toolbar",{id:n}),this.parentNode.insertBefore(t,this),t):void 0}},inputElement:{get:function(){var t,e,n;return this.hasAttribute("input")?null!=(n=this.ownerDocument)?n.getElementById(this.getAttribute("input")):void 0:this.parentNode?(e="trix-input-"+this.trixId,this.setAttribute("input",e),t=o("input",{type:"hidden",id:e}),this.parentNode.insertBefore(t,this.nextElementSibling),t):void 0}},editor:{get:function(){var t;return null!=(t=this.editorController)?t.editor:void 0}},name:{get:function(){var t;return null!=(t=this.inputElement)?t.name:void 0}},value:{get:function(){var t;return null!=(t=this.inputElement)?t.value:void 0},set:function(t){var e;return this.defaultValue=t,null!=(e=this.editor)?e.loadHTML(this.defaultValue):void 0}},notify:function(t,n){var i;switch(t){case"document-change":this.documentChangedSinceLastRender=!0;break;case"render":this.documentChangedSinceLastRender&&(this.documentChangedSinceLastRender=!1,this.notify("change"));break;case"change":case"attachment-add":case"attachment-edit":case"attachment-remove":null!=(i=this.inputElement)&&(i.value=e.serializeToContentType(this,"text/html"))}return this.editorController?r("trix-"+t,{onElement:this,attributes:n}):void 0},createdCallback:function(){return p(this)},attachedCallback:function(){return this.hasAttribute("data-trix-internal")?void 0:(null==this.editorController&&(this.editorController=new e.EditorController({editorElement:this,html:this.defaultValue=this.value})),this.editorController.registerSelectionManager(),this.registerResetListener(),s(this),requestAnimationFrame(function(t){return function(){return t.notify("initialize")
}}(this)))},detachedCallback:function(){var t;return null!=(t=this.editorController)&&t.unregisterSelectionManager(),this.unregisterResetListener()},registerResetListener:function(){return this.resetListener=this.resetBubbled.bind(this),window.addEventListener("reset",this.resetListener,!1)},unregisterResetListener:function(){return window.removeEventListener("reset",this.resetListener,!1)},resetBubbled:function(t){var e;return t.target!==(null!=(e=this.inputElement)?e.form:void 0)||t.defaultPrevented?void 0:this.reset()},reset:function(){return this.value=this.defaultValue}}}())}.call(this),function(){}.call(this)}).call(this),"object"==typeof module&&module.exports?module.exports=e:"function"==typeof define&&define.amd&&define(e)}.call(this);
(function() {
  (function() {
    (function() {
      var slice = [].slice;

      this.ActionCable = {
        INTERNAL: {
          "message_types": {
            "welcome": "welcome",
            "ping": "ping",
            "confirmation": "confirm_subscription",
            "rejection": "reject_subscription"
          },
          "default_mount_path": "/cable",
          "protocols": ["actioncable-v1-json", "actioncable-unsupported"]
        },
        WebSocket: window.WebSocket,
        logger: window.console,
        createConsumer: function(url) {
          var ref;
          if (url == null) {
            url = (ref = this.getConfig("url")) != null ? ref : this.INTERNAL.default_mount_path;
          }
          return new ActionCable.Consumer(this.createWebSocketURL(url));
        },
        getConfig: function(name) {
          var element;
          element = document.head.querySelector("meta[name='action-cable-" + name + "']");
          return element != null ? element.getAttribute("content") : void 0;
        },
        createWebSocketURL: function(url) {
          var a;
          if (url && !/^wss?:/i.test(url)) {
            a = document.createElement("a");
            a.href = url;
            a.href = a.href;
            a.protocol = a.protocol.replace("http", "ws");
            return a.href;
          } else {
            return url;
          }
        },
        startDebugging: function() {
          return this.debugging = true;
        },
        stopDebugging: function() {
          return this.debugging = null;
        },
        log: function() {
          var messages, ref;
          messages = 1 <= arguments.length ? slice.call(arguments, 0) : [];
          if (this.debugging) {
            messages.push(Date.now());
            return (ref = this.logger).log.apply(ref, ["[ActionCable]"].concat(slice.call(messages)));
          }
        }
      };

    }).call(this);
  }).call(this);

  var ActionCable = this.ActionCable;

  (function() {
    (function() {
      var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

      ActionCable.ConnectionMonitor = (function() {
        var clamp, now, secondsSince;

        ConnectionMonitor.pollInterval = {
          min: 3,
          max: 30
        };

        ConnectionMonitor.staleThreshold = 6;

        function ConnectionMonitor(connection) {
          this.connection = connection;
          this.visibilityDidChange = bind(this.visibilityDidChange, this);
          this.reconnectAttempts = 0;
        }

        ConnectionMonitor.prototype.start = function() {
          if (!this.isRunning()) {
            this.startedAt = now();
            delete this.stoppedAt;
            this.startPolling();
            document.addEventListener("visibilitychange", this.visibilityDidChange);
            return ActionCable.log("ConnectionMonitor started. pollInterval = " + (this.getPollInterval()) + " ms");
          }
        };

        ConnectionMonitor.prototype.stop = function() {
          if (this.isRunning()) {
            this.stoppedAt = now();
            this.stopPolling();
            document.removeEventListener("visibilitychange", this.visibilityDidChange);
            return ActionCable.log("ConnectionMonitor stopped");
          }
        };

        ConnectionMonitor.prototype.isRunning = function() {
          return (this.startedAt != null) && (this.stoppedAt == null);
        };

        ConnectionMonitor.prototype.recordPing = function() {
          return this.pingedAt = now();
        };

        ConnectionMonitor.prototype.recordConnect = function() {
          this.reconnectAttempts = 0;
          this.recordPing();
          delete this.disconnectedAt;
          return ActionCable.log("ConnectionMonitor recorded connect");
        };

        ConnectionMonitor.prototype.recordDisconnect = function() {
          this.disconnectedAt = now();
          return ActionCable.log("ConnectionMonitor recorded disconnect");
        };

        ConnectionMonitor.prototype.startPolling = function() {
          this.stopPolling();
          return this.poll();
        };

        ConnectionMonitor.prototype.stopPolling = function() {
          return clearTimeout(this.pollTimeout);
        };

        ConnectionMonitor.prototype.poll = function() {
          return this.pollTimeout = setTimeout((function(_this) {
            return function() {
              _this.reconnectIfStale();
              return _this.poll();
            };
          })(this), this.getPollInterval());
        };

        ConnectionMonitor.prototype.getPollInterval = function() {
          var interval, max, min, ref;
          ref = this.constructor.pollInterval, min = ref.min, max = ref.max;
          interval = 5 * Math.log(this.reconnectAttempts + 1);
          return Math.round(clamp(interval, min, max) * 1000);
        };

        ConnectionMonitor.prototype.reconnectIfStale = function() {
          if (this.connectionIsStale()) {
            ActionCable.log("ConnectionMonitor detected stale connection. reconnectAttempts = " + this.reconnectAttempts + ", pollInterval = " + (this.getPollInterval()) + " ms, time disconnected = " + (secondsSince(this.disconnectedAt)) + " s, stale threshold = " + this.constructor.staleThreshold + " s");
            this.reconnectAttempts++;
            if (this.disconnectedRecently()) {
              return ActionCable.log("ConnectionMonitor skipping reopening recent disconnect");
            } else {
              ActionCable.log("ConnectionMonitor reopening");
              return this.connection.reopen();
            }
          }
        };

        ConnectionMonitor.prototype.connectionIsStale = function() {
          var ref;
          return secondsSince((ref = this.pingedAt) != null ? ref : this.startedAt) > this.constructor.staleThreshold;
        };

        ConnectionMonitor.prototype.disconnectedRecently = function() {
          return this.disconnectedAt && secondsSince(this.disconnectedAt) < this.constructor.staleThreshold;
        };

        ConnectionMonitor.prototype.visibilityDidChange = function() {
          if (document.visibilityState === "visible") {
            return setTimeout((function(_this) {
              return function() {
                if (_this.connectionIsStale() || !_this.connection.isOpen()) {
                  ActionCable.log("ConnectionMonitor reopening stale connection on visibilitychange. visbilityState = " + document.visibilityState);
                  return _this.connection.reopen();
                }
              };
            })(this), 200);
          }
        };

        now = function() {
          return new Date().getTime();
        };

        secondsSince = function(time) {
          return (now() - time) / 1000;
        };

        clamp = function(number, min, max) {
          return Math.max(min, Math.min(max, number));
        };

        return ConnectionMonitor;

      })();

    }).call(this);
    (function() {
      var i, message_types, protocols, ref, supportedProtocols, unsupportedProtocol,
        slice = [].slice,
        bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
        indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

      ref = ActionCable.INTERNAL, message_types = ref.message_types, protocols = ref.protocols;

      supportedProtocols = 2 <= protocols.length ? slice.call(protocols, 0, i = protocols.length - 1) : (i = 0, []), unsupportedProtocol = protocols[i++];

      ActionCable.Connection = (function() {
        Connection.reopenDelay = 500;

        function Connection(consumer) {
          this.consumer = consumer;
          this.open = bind(this.open, this);
          this.subscriptions = this.consumer.subscriptions;
          this.monitor = new ActionCable.ConnectionMonitor(this);
          this.disconnected = true;
        }

        Connection.prototype.send = function(data) {
          if (this.isOpen()) {
            this.webSocket.send(JSON.stringify(data));
            return true;
          } else {
            return false;
          }
        };

        Connection.prototype.open = function() {
          if (this.isActive()) {
            ActionCable.log("Attempted to open WebSocket, but existing socket is " + (this.getState()));
            return false;
          } else {
            ActionCable.log("Opening WebSocket, current state is " + (this.getState()) + ", subprotocols: " + protocols);
            if (this.webSocket != null) {
              this.uninstallEventHandlers();
            }
            this.webSocket = new ActionCable.WebSocket(this.consumer.url, protocols);
            this.installEventHandlers();
            this.monitor.start();
            return true;
          }
        };

        Connection.prototype.close = function(arg) {
          var allowReconnect, ref1;
          allowReconnect = (arg != null ? arg : {
            allowReconnect: true
          }).allowReconnect;
          if (!allowReconnect) {
            this.monitor.stop();
          }
          if (this.isActive()) {
            return (ref1 = this.webSocket) != null ? ref1.close() : void 0;
          }
        };

        Connection.prototype.reopen = function() {
          var error;
          ActionCable.log("Reopening WebSocket, current state is " + (this.getState()));
          if (this.isActive()) {
            try {
              return this.close();
            } catch (error1) {
              error = error1;
              return ActionCable.log("Failed to reopen WebSocket", error);
            } finally {
              ActionCable.log("Reopening WebSocket in " + this.constructor.reopenDelay + "ms");
              setTimeout(this.open, this.constructor.reopenDelay);
            }
          } else {
            return this.open();
          }
        };

        Connection.prototype.getProtocol = function() {
          var ref1;
          return (ref1 = this.webSocket) != null ? ref1.protocol : void 0;
        };

        Connection.prototype.isOpen = function() {
          return this.isState("open");
        };

        Connection.prototype.isActive = function() {
          return this.isState("open", "connecting");
        };

        Connection.prototype.isProtocolSupported = function() {
          var ref1;
          return ref1 = this.getProtocol(), indexOf.call(supportedProtocols, ref1) >= 0;
        };

        Connection.prototype.isState = function() {
          var ref1, states;
          states = 1 <= arguments.length ? slice.call(arguments, 0) : [];
          return ref1 = this.getState(), indexOf.call(states, ref1) >= 0;
        };

        Connection.prototype.getState = function() {
          var ref1, state, value;
          for (state in WebSocket) {
            value = WebSocket[state];
            if (value === ((ref1 = this.webSocket) != null ? ref1.readyState : void 0)) {
              return state.toLowerCase();
            }
          }
          return null;
        };

        Connection.prototype.installEventHandlers = function() {
          var eventName, handler;
          for (eventName in this.events) {
            handler = this.events[eventName].bind(this);
            this.webSocket["on" + eventName] = handler;
          }
        };

        Connection.prototype.uninstallEventHandlers = function() {
          var eventName;
          for (eventName in this.events) {
            this.webSocket["on" + eventName] = function() {};
          }
        };

        Connection.prototype.events = {
          message: function(event) {
            var identifier, message, ref1, type;
            if (!this.isProtocolSupported()) {
              return;
            }
            ref1 = JSON.parse(event.data), identifier = ref1.identifier, message = ref1.message, type = ref1.type;
            switch (type) {
              case message_types.welcome:
                this.monitor.recordConnect();
                return this.subscriptions.reload();
              case message_types.ping:
                return this.monitor.recordPing();
              case message_types.confirmation:
                return this.subscriptions.notify(identifier, "connected");
              case message_types.rejection:
                return this.subscriptions.reject(identifier);
              default:
                return this.subscriptions.notify(identifier, "received", message);
            }
          },
          open: function() {
            ActionCable.log("WebSocket onopen event, using '" + (this.getProtocol()) + "' subprotocol");
            this.disconnected = false;
            if (!this.isProtocolSupported()) {
              ActionCable.log("Protocol is unsupported. Stopping monitor and disconnecting.");
              return this.close({
                allowReconnect: false
              });
            }
          },
          close: function(event) {
            ActionCable.log("WebSocket onclose event");
            if (this.disconnected) {
              return;
            }
            this.disconnected = true;
            this.monitor.recordDisconnect();
            return this.subscriptions.notifyAll("disconnected", {
              willAttemptReconnect: this.monitor.isRunning()
            });
          },
          error: function() {
            return ActionCable.log("WebSocket onerror event");
          }
        };

        return Connection;

      })();

    }).call(this);
    (function() {
      var slice = [].slice;

      ActionCable.Subscriptions = (function() {
        function Subscriptions(consumer) {
          this.consumer = consumer;
          this.subscriptions = [];
        }

        Subscriptions.prototype.create = function(channelName, mixin) {
          var channel, params, subscription;
          channel = channelName;
          params = typeof channel === "object" ? channel : {
            channel: channel
          };
          subscription = new ActionCable.Subscription(this.consumer, params, mixin);
          return this.add(subscription);
        };

        Subscriptions.prototype.add = function(subscription) {
          this.subscriptions.push(subscription);
          this.consumer.ensureActiveConnection();
          this.notify(subscription, "initialized");
          this.sendCommand(subscription, "subscribe");
          return subscription;
        };

        Subscriptions.prototype.remove = function(subscription) {
          this.forget(subscription);
          if (!this.findAll(subscription.identifier).length) {
            this.sendCommand(subscription, "unsubscribe");
          }
          return subscription;
        };

        Subscriptions.prototype.reject = function(identifier) {
          var i, len, ref, results, subscription;
          ref = this.findAll(identifier);
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            subscription = ref[i];
            this.forget(subscription);
            this.notify(subscription, "rejected");
            results.push(subscription);
          }
          return results;
        };

        Subscriptions.prototype.forget = function(subscription) {
          var s;
          this.subscriptions = (function() {
            var i, len, ref, results;
            ref = this.subscriptions;
            results = [];
            for (i = 0, len = ref.length; i < len; i++) {
              s = ref[i];
              if (s !== subscription) {
                results.push(s);
              }
            }
            return results;
          }).call(this);
          return subscription;
        };

        Subscriptions.prototype.findAll = function(identifier) {
          var i, len, ref, results, s;
          ref = this.subscriptions;
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            s = ref[i];
            if (s.identifier === identifier) {
              results.push(s);
            }
          }
          return results;
        };

        Subscriptions.prototype.reload = function() {
          var i, len, ref, results, subscription;
          ref = this.subscriptions;
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            subscription = ref[i];
            results.push(this.sendCommand(subscription, "subscribe"));
          }
          return results;
        };

        Subscriptions.prototype.notifyAll = function() {
          var args, callbackName, i, len, ref, results, subscription;
          callbackName = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
          ref = this.subscriptions;
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            subscription = ref[i];
            results.push(this.notify.apply(this, [subscription, callbackName].concat(slice.call(args))));
          }
          return results;
        };

        Subscriptions.prototype.notify = function() {
          var args, callbackName, i, len, results, subscription, subscriptions;
          subscription = arguments[0], callbackName = arguments[1], args = 3 <= arguments.length ? slice.call(arguments, 2) : [];
          if (typeof subscription === "string") {
            subscriptions = this.findAll(subscription);
          } else {
            subscriptions = [subscription];
          }
          results = [];
          for (i = 0, len = subscriptions.length; i < len; i++) {
            subscription = subscriptions[i];
            results.push(typeof subscription[callbackName] === "function" ? subscription[callbackName].apply(subscription, args) : void 0);
          }
          return results;
        };

        Subscriptions.prototype.sendCommand = function(subscription, command) {
          var identifier;
          identifier = subscription.identifier;
          return this.consumer.send({
            command: command,
            identifier: identifier
          });
        };

        return Subscriptions;

      })();

    }).call(this);
    (function() {
      ActionCable.Subscription = (function() {
        var extend;

        function Subscription(consumer, params, mixin) {
          this.consumer = consumer;
          if (params == null) {
            params = {};
          }
          this.identifier = JSON.stringify(params);
          extend(this, mixin);
        }

        Subscription.prototype.perform = function(action, data) {
          if (data == null) {
            data = {};
          }
          data.action = action;
          return this.send(data);
        };

        Subscription.prototype.send = function(data) {
          return this.consumer.send({
            command: "message",
            identifier: this.identifier,
            data: JSON.stringify(data)
          });
        };

        Subscription.prototype.unsubscribe = function() {
          return this.consumer.subscriptions.remove(this);
        };

        extend = function(object, properties) {
          var key, value;
          if (properties != null) {
            for (key in properties) {
              value = properties[key];
              object[key] = value;
            }
          }
          return object;
        };

        return Subscription;

      })();

    }).call(this);
    (function() {
      ActionCable.Consumer = (function() {
        function Consumer(url) {
          this.url = url;
          this.subscriptions = new ActionCable.Subscriptions(this);
          this.connection = new ActionCable.Connection(this);
        }

        Consumer.prototype.send = function(data) {
          return this.connection.send(data);
        };

        Consumer.prototype.connect = function() {
          return this.connection.open();
        };

        Consumer.prototype.disconnect = function() {
          return this.connection.close({
            allowReconnect: false
          });
        };

        Consumer.prototype.ensureActiveConnection = function() {
          if (!this.connection.isActive()) {
            return this.connection.open();
          }
        };

        return Consumer;

      })();

    }).call(this);
  }).call(this);

  if (typeof module === "object" && module.exports) {
    module.exports = ActionCable;
  } else if (typeof define === "function" && define.amd) {
    define(ActionCable);
  }
}).call(this);
// Action Cable provides the framework to deal with WebSockets in Rails.
// You can generate new channels where WebSocket features live using the `rails generate channel` command.
//




(function() {
  this.App || (this.App = {});

  App.cable = ActionCable.createConsumer();

}).call(this);
(function() {
  jQuery(function() {
    return $('#post_category_id').autocomplete;
  });

}).call(this);
(function() {
  $(function() {
    var deleteFile, sendFile;
    document.addEventListener('trix-attachment-add', function(event) {
      var attachment;
      attachment = event.attachment;
      if (attachment.file) {
        return sendFile(attachment);
      }
    });
    document.addEventListener('trix-attachment-remove', function(event) {
      var attachment;
      attachment = event.attachment;
      return deleteFile(attachment);
    });
    sendFile = function(attachment) {
      var file, form, xhr;
      file = attachment.file;
      form = new FormData;
      form.append('Content-Type', file.type);
      form.append('picture[image]', file);
      xhr = new XMLHttpRequest;
      xhr.open('POST', '/admin/pictures', true);
      alert('Мы в sendFile');
      xhr.upload.onprogress = function(event) {
        var progress;
        progress = event.loaded / event.total * 100;
        return attachment.setUploadProgress(progress);
      };
      xhr.onload = function() {
        var response;
        response = JSON.parse(this.responseText);
        return attachment.setAttributes({
          url: response.url,
          picture_id: response.picture_id,
          href: response.url
        }, alert('Мы в sendFile222'));
      };
      return xhr.send(form);
    };
    deleteFile = function(n) {
      return $.ajax({
        type: 'DELETE',
        url: '/admin/pictures/' + n.attachment.attributes.values.picture_id,
        cache: false,
        contentType: false,
        processData: false
      });
    };
  });

}).call(this);
(function() {


}).call(this);
(function() {
  window.onload = function() {
    var e, options;
    try {
      options = {
        depth: 0.5,
        textFont: 'Impact,"Arial Black",sans-serif',
        textColour: null,
        maxSpeed: 0.05,
        outlineMethod: 'colour',
        outlineColour: '#0275d8',
        shuffleTags: true
      };
      TagCanvas.Start('myCanvas', '', options);
    } catch (error) {
      e = error;
      alert(e);
      document.getElementById('myCanvasContainer').style.display = 'none';
    }
  };

}).call(this);
( function( factory ) {
	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define( [ "jquery" ], factory );
	} else {

		// Browser globals
		factory( jQuery );
	}
} ( function( $ ) {

$.ui = $.ui || {};

return $.ui.version = "1.12.1";

} ) );


/*!
 * jQuery UI Keycode 1.12.1
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

//>>label: Keycode
//>>group: Core
//>>description: Provide keycodes as keynames
//>>docs: http://api.jqueryui.com/jQuery.ui.keyCode/

( function( factory ) {
	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define( [ "jquery", "./version" ], factory );
	} else {

		// Browser globals
		factory( jQuery );
	}
} ( function( $ ) {
return $.ui.keyCode = {
	BACKSPACE: 8,
	COMMA: 188,
	DELETE: 46,
	DOWN: 40,
	END: 35,
	ENTER: 13,
	ESCAPE: 27,
	HOME: 36,
	LEFT: 37,
	PAGE_DOWN: 34,
	PAGE_UP: 33,
	PERIOD: 190,
	RIGHT: 39,
	SPACE: 32,
	TAB: 9,
	UP: 38
};

} ) );


/*!
 * jQuery UI Position 1.12.1
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/position/
 */

//>>label: Position
//>>group: Core
//>>description: Positions elements relative to other elements.
//>>docs: http://api.jqueryui.com/position/
//>>demos: http://jqueryui.com/position/

( function( factory ) {
	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define( [ "jquery", "./version" ], factory );
	} else {

		// Browser globals
		factory( jQuery );
	}
}( function( $ ) {
( function() {
var cachedScrollbarWidth,
	max = Math.max,
	abs = Math.abs,
	rhorizontal = /left|center|right/,
	rvertical = /top|center|bottom/,
	roffset = /[\+\-]\d+(\.[\d]+)?%?/,
	rposition = /^\w+/,
	rpercent = /%$/,
	_position = $.fn.position;

function getOffsets( offsets, width, height ) {
	return [
		parseFloat( offsets[ 0 ] ) * ( rpercent.test( offsets[ 0 ] ) ? width / 100 : 1 ),
		parseFloat( offsets[ 1 ] ) * ( rpercent.test( offsets[ 1 ] ) ? height / 100 : 1 )
	];
}

function parseCss( element, property ) {
	return parseInt( $.css( element, property ), 10 ) || 0;
}

function getDimensions( elem ) {
	var raw = elem[ 0 ];
	if ( raw.nodeType === 9 ) {
		return {
			width: elem.width(),
			height: elem.height(),
			offset: { top: 0, left: 0 }
		};
	}
	if ( $.isWindow( raw ) ) {
		return {
			width: elem.width(),
			height: elem.height(),
			offset: { top: elem.scrollTop(), left: elem.scrollLeft() }
		};
	}
	if ( raw.preventDefault ) {
		return {
			width: 0,
			height: 0,
			offset: { top: raw.pageY, left: raw.pageX }
		};
	}
	return {
		width: elem.outerWidth(),
		height: elem.outerHeight(),
		offset: elem.offset()
	};
}

$.position = {
	scrollbarWidth: function() {
		if ( cachedScrollbarWidth !== undefined ) {
			return cachedScrollbarWidth;
		}
		var w1, w2,
			div = $( "<div " +
				"style='display:block;position:absolute;width:50px;height:50px;overflow:hidden;'>" +
				"<div style='height:100px;width:auto;'></div></div>" ),
			innerDiv = div.children()[ 0 ];

		$( "body" ).append( div );
		w1 = innerDiv.offsetWidth;
		div.css( "overflow", "scroll" );

		w2 = innerDiv.offsetWidth;

		if ( w1 === w2 ) {
			w2 = div[ 0 ].clientWidth;
		}

		div.remove();

		return ( cachedScrollbarWidth = w1 - w2 );
	},
	getScrollInfo: function( within ) {
		var overflowX = within.isWindow || within.isDocument ? "" :
				within.element.css( "overflow-x" ),
			overflowY = within.isWindow || within.isDocument ? "" :
				within.element.css( "overflow-y" ),
			hasOverflowX = overflowX === "scroll" ||
				( overflowX === "auto" && within.width < within.element[ 0 ].scrollWidth ),
			hasOverflowY = overflowY === "scroll" ||
				( overflowY === "auto" && within.height < within.element[ 0 ].scrollHeight );
		return {
			width: hasOverflowY ? $.position.scrollbarWidth() : 0,
			height: hasOverflowX ? $.position.scrollbarWidth() : 0
		};
	},
	getWithinInfo: function( element ) {
		var withinElement = $( element || window ),
			isWindow = $.isWindow( withinElement[ 0 ] ),
			isDocument = !!withinElement[ 0 ] && withinElement[ 0 ].nodeType === 9,
			hasOffset = !isWindow && !isDocument;
		return {
			element: withinElement,
			isWindow: isWindow,
			isDocument: isDocument,
			offset: hasOffset ? $( element ).offset() : { left: 0, top: 0 },
			scrollLeft: withinElement.scrollLeft(),
			scrollTop: withinElement.scrollTop(),
			width: withinElement.outerWidth(),
			height: withinElement.outerHeight()
		};
	}
};

$.fn.position = function( options ) {
	if ( !options || !options.of ) {
		return _position.apply( this, arguments );
	}

	// Make a copy, we don't want to modify arguments
	options = $.extend( {}, options );

	var atOffset, targetWidth, targetHeight, targetOffset, basePosition, dimensions,
		target = $( options.of ),
		within = $.position.getWithinInfo( options.within ),
		scrollInfo = $.position.getScrollInfo( within ),
		collision = ( options.collision || "flip" ).split( " " ),
		offsets = {};

	dimensions = getDimensions( target );
	if ( target[ 0 ].preventDefault ) {

		// Force left top to allow flipping
		options.at = "left top";
	}
	targetWidth = dimensions.width;
	targetHeight = dimensions.height;
	targetOffset = dimensions.offset;

	// Clone to reuse original targetOffset later
	basePosition = $.extend( {}, targetOffset );

	// Force my and at to have valid horizontal and vertical positions
	// if a value is missing or invalid, it will be converted to center
	$.each( [ "my", "at" ], function() {
		var pos = ( options[ this ] || "" ).split( " " ),
			horizontalOffset,
			verticalOffset;

		if ( pos.length === 1 ) {
			pos = rhorizontal.test( pos[ 0 ] ) ?
				pos.concat( [ "center" ] ) :
				rvertical.test( pos[ 0 ] ) ?
					[ "center" ].concat( pos ) :
					[ "center", "center" ];
		}
		pos[ 0 ] = rhorizontal.test( pos[ 0 ] ) ? pos[ 0 ] : "center";
		pos[ 1 ] = rvertical.test( pos[ 1 ] ) ? pos[ 1 ] : "center";

		// Calculate offsets
		horizontalOffset = roffset.exec( pos[ 0 ] );
		verticalOffset = roffset.exec( pos[ 1 ] );
		offsets[ this ] = [
			horizontalOffset ? horizontalOffset[ 0 ] : 0,
			verticalOffset ? verticalOffset[ 0 ] : 0
		];

		// Reduce to just the positions without the offsets
		options[ this ] = [
			rposition.exec( pos[ 0 ] )[ 0 ],
			rposition.exec( pos[ 1 ] )[ 0 ]
		];
	} );

	// Normalize collision option
	if ( collision.length === 1 ) {
		collision[ 1 ] = collision[ 0 ];
	}

	if ( options.at[ 0 ] === "right" ) {
		basePosition.left += targetWidth;
	} else if ( options.at[ 0 ] === "center" ) {
		basePosition.left += targetWidth / 2;
	}

	if ( options.at[ 1 ] === "bottom" ) {
		basePosition.top += targetHeight;
	} else if ( options.at[ 1 ] === "center" ) {
		basePosition.top += targetHeight / 2;
	}

	atOffset = getOffsets( offsets.at, targetWidth, targetHeight );
	basePosition.left += atOffset[ 0 ];
	basePosition.top += atOffset[ 1 ];

	return this.each( function() {
		var collisionPosition, using,
			elem = $( this ),
			elemWidth = elem.outerWidth(),
			elemHeight = elem.outerHeight(),
			marginLeft = parseCss( this, "marginLeft" ),
			marginTop = parseCss( this, "marginTop" ),
			collisionWidth = elemWidth + marginLeft + parseCss( this, "marginRight" ) +
				scrollInfo.width,
			collisionHeight = elemHeight + marginTop + parseCss( this, "marginBottom" ) +
				scrollInfo.height,
			position = $.extend( {}, basePosition ),
			myOffset = getOffsets( offsets.my, elem.outerWidth(), elem.outerHeight() );

		if ( options.my[ 0 ] === "right" ) {
			position.left -= elemWidth;
		} else if ( options.my[ 0 ] === "center" ) {
			position.left -= elemWidth / 2;
		}

		if ( options.my[ 1 ] === "bottom" ) {
			position.top -= elemHeight;
		} else if ( options.my[ 1 ] === "center" ) {
			position.top -= elemHeight / 2;
		}

		position.left += myOffset[ 0 ];
		position.top += myOffset[ 1 ];

		collisionPosition = {
			marginLeft: marginLeft,
			marginTop: marginTop
		};

		$.each( [ "left", "top" ], function( i, dir ) {
			if ( $.ui.position[ collision[ i ] ] ) {
				$.ui.position[ collision[ i ] ][ dir ]( position, {
					targetWidth: targetWidth,
					targetHeight: targetHeight,
					elemWidth: elemWidth,
					elemHeight: elemHeight,
					collisionPosition: collisionPosition,
					collisionWidth: collisionWidth,
					collisionHeight: collisionHeight,
					offset: [ atOffset[ 0 ] + myOffset[ 0 ], atOffset [ 1 ] + myOffset[ 1 ] ],
					my: options.my,
					at: options.at,
					within: within,
					elem: elem
				} );
			}
		} );

		if ( options.using ) {

			// Adds feedback as second argument to using callback, if present
			using = function( props ) {
				var left = targetOffset.left - position.left,
					right = left + targetWidth - elemWidth,
					top = targetOffset.top - position.top,
					bottom = top + targetHeight - elemHeight,
					feedback = {
						target: {
							element: target,
							left: targetOffset.left,
							top: targetOffset.top,
							width: targetWidth,
							height: targetHeight
						},
						element: {
							element: elem,
							left: position.left,
							top: position.top,
							width: elemWidth,
							height: elemHeight
						},
						horizontal: right < 0 ? "left" : left > 0 ? "right" : "center",
						vertical: bottom < 0 ? "top" : top > 0 ? "bottom" : "middle"
					};
				if ( targetWidth < elemWidth && abs( left + right ) < targetWidth ) {
					feedback.horizontal = "center";
				}
				if ( targetHeight < elemHeight && abs( top + bottom ) < targetHeight ) {
					feedback.vertical = "middle";
				}
				if ( max( abs( left ), abs( right ) ) > max( abs( top ), abs( bottom ) ) ) {
					feedback.important = "horizontal";
				} else {
					feedback.important = "vertical";
				}
				options.using.call( this, props, feedback );
			};
		}

		elem.offset( $.extend( position, { using: using } ) );
	} );
};

$.ui.position = {
	fit: {
		left: function( position, data ) {
			var within = data.within,
				withinOffset = within.isWindow ? within.scrollLeft : within.offset.left,
				outerWidth = within.width,
				collisionPosLeft = position.left - data.collisionPosition.marginLeft,
				overLeft = withinOffset - collisionPosLeft,
				overRight = collisionPosLeft + data.collisionWidth - outerWidth - withinOffset,
				newOverRight;

			// Element is wider than within
			if ( data.collisionWidth > outerWidth ) {

				// Element is initially over the left side of within
				if ( overLeft > 0 && overRight <= 0 ) {
					newOverRight = position.left + overLeft + data.collisionWidth - outerWidth -
						withinOffset;
					position.left += overLeft - newOverRight;

				// Element is initially over right side of within
				} else if ( overRight > 0 && overLeft <= 0 ) {
					position.left = withinOffset;

				// Element is initially over both left and right sides of within
				} else {
					if ( overLeft > overRight ) {
						position.left = withinOffset + outerWidth - data.collisionWidth;
					} else {
						position.left = withinOffset;
					}
				}

			// Too far left -> align with left edge
			} else if ( overLeft > 0 ) {
				position.left += overLeft;

			// Too far right -> align with right edge
			} else if ( overRight > 0 ) {
				position.left -= overRight;

			// Adjust based on position and margin
			} else {
				position.left = max( position.left - collisionPosLeft, position.left );
			}
		},
		top: function( position, data ) {
			var within = data.within,
				withinOffset = within.isWindow ? within.scrollTop : within.offset.top,
				outerHeight = data.within.height,
				collisionPosTop = position.top - data.collisionPosition.marginTop,
				overTop = withinOffset - collisionPosTop,
				overBottom = collisionPosTop + data.collisionHeight - outerHeight - withinOffset,
				newOverBottom;

			// Element is taller than within
			if ( data.collisionHeight > outerHeight ) {

				// Element is initially over the top of within
				if ( overTop > 0 && overBottom <= 0 ) {
					newOverBottom = position.top + overTop + data.collisionHeight - outerHeight -
						withinOffset;
					position.top += overTop - newOverBottom;

				// Element is initially over bottom of within
				} else if ( overBottom > 0 && overTop <= 0 ) {
					position.top = withinOffset;

				// Element is initially over both top and bottom of within
				} else {
					if ( overTop > overBottom ) {
						position.top = withinOffset + outerHeight - data.collisionHeight;
					} else {
						position.top = withinOffset;
					}
				}

			// Too far up -> align with top
			} else if ( overTop > 0 ) {
				position.top += overTop;

			// Too far down -> align with bottom edge
			} else if ( overBottom > 0 ) {
				position.top -= overBottom;

			// Adjust based on position and margin
			} else {
				position.top = max( position.top - collisionPosTop, position.top );
			}
		}
	},
	flip: {
		left: function( position, data ) {
			var within = data.within,
				withinOffset = within.offset.left + within.scrollLeft,
				outerWidth = within.width,
				offsetLeft = within.isWindow ? within.scrollLeft : within.offset.left,
				collisionPosLeft = position.left - data.collisionPosition.marginLeft,
				overLeft = collisionPosLeft - offsetLeft,
				overRight = collisionPosLeft + data.collisionWidth - outerWidth - offsetLeft,
				myOffset = data.my[ 0 ] === "left" ?
					-data.elemWidth :
					data.my[ 0 ] === "right" ?
						data.elemWidth :
						0,
				atOffset = data.at[ 0 ] === "left" ?
					data.targetWidth :
					data.at[ 0 ] === "right" ?
						-data.targetWidth :
						0,
				offset = -2 * data.offset[ 0 ],
				newOverRight,
				newOverLeft;

			if ( overLeft < 0 ) {
				newOverRight = position.left + myOffset + atOffset + offset + data.collisionWidth -
					outerWidth - withinOffset;
				if ( newOverRight < 0 || newOverRight < abs( overLeft ) ) {
					position.left += myOffset + atOffset + offset;
				}
			} else if ( overRight > 0 ) {
				newOverLeft = position.left - data.collisionPosition.marginLeft + myOffset +
					atOffset + offset - offsetLeft;
				if ( newOverLeft > 0 || abs( newOverLeft ) < overRight ) {
					position.left += myOffset + atOffset + offset;
				}
			}
		},
		top: function( position, data ) {
			var within = data.within,
				withinOffset = within.offset.top + within.scrollTop,
				outerHeight = within.height,
				offsetTop = within.isWindow ? within.scrollTop : within.offset.top,
				collisionPosTop = position.top - data.collisionPosition.marginTop,
				overTop = collisionPosTop - offsetTop,
				overBottom = collisionPosTop + data.collisionHeight - outerHeight - offsetTop,
				top = data.my[ 1 ] === "top",
				myOffset = top ?
					-data.elemHeight :
					data.my[ 1 ] === "bottom" ?
						data.elemHeight :
						0,
				atOffset = data.at[ 1 ] === "top" ?
					data.targetHeight :
					data.at[ 1 ] === "bottom" ?
						-data.targetHeight :
						0,
				offset = -2 * data.offset[ 1 ],
				newOverTop,
				newOverBottom;
			if ( overTop < 0 ) {
				newOverBottom = position.top + myOffset + atOffset + offset + data.collisionHeight -
					outerHeight - withinOffset;
				if ( newOverBottom < 0 || newOverBottom < abs( overTop ) ) {
					position.top += myOffset + atOffset + offset;
				}
			} else if ( overBottom > 0 ) {
				newOverTop = position.top - data.collisionPosition.marginTop + myOffset + atOffset +
					offset - offsetTop;
				if ( newOverTop > 0 || abs( newOverTop ) < overBottom ) {
					position.top += myOffset + atOffset + offset;
				}
			}
		}
	},
	flipfit: {
		left: function() {
			$.ui.position.flip.left.apply( this, arguments );
			$.ui.position.fit.left.apply( this, arguments );
		},
		top: function() {
			$.ui.position.flip.top.apply( this, arguments );
			$.ui.position.fit.top.apply( this, arguments );
		}
	}
};

} )();

return $.ui.position;

} ) );

( function( factory ) {
	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define( [ "jquery", "./version" ], factory );
	} else {

		// Browser globals
		factory( jQuery );
	}
} ( function( $ ) {
return $.ui.safeActiveElement = function( document ) {
	var activeElement;

	// Support: IE 9 only
	// IE9 throws an "Unspecified error" accessing document.activeElement from an <iframe>
	try {
		activeElement = document.activeElement;
	} catch ( error ) {
		activeElement = document.body;
	}

	// Support: IE 9 - 11 only
	// IE may return null instead of an element
	// Interestingly, this only seems to occur when NOT in an iframe
	if ( !activeElement ) {
		activeElement = document.body;
	}

	// Support: IE 11 only
	// IE11 returns a seemingly empty object in some cases when accessing
	// document.activeElement from an <iframe>
	if ( !activeElement.nodeName ) {
		activeElement = document.body;
	}

	return activeElement;
};

} ) );


/*!
 * jQuery UI Unique ID 1.12.1
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

//>>label: uniqueId
//>>group: Core
//>>description: Functions to generate and remove uniqueId's
//>>docs: http://api.jqueryui.com/uniqueId/

( function( factory ) {
	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define( [ "jquery", "./version" ], factory );
	} else {

		// Browser globals
		factory( jQuery );
	}
} ( function( $ ) {

return $.fn.extend( {
	uniqueId: ( function() {
		var uuid = 0;

		return function() {
			return this.each( function() {
				if ( !this.id ) {
					this.id = "ui-id-" + ( ++uuid );
				}
			} );
		};
	} )(),

	removeUniqueId: function() {
		return this.each( function() {
			if ( /^ui-id-\d+$/.test( this.id ) ) {
				$( this ).removeAttr( "id" );
			}
		} );
	}
} );

} ) );


/*!
 * jQuery UI Widget 1.12.1
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

//>>label: Widget
//>>group: Core
//>>description: Provides a factory for creating stateful widgets with a common API.
//>>docs: http://api.jqueryui.com/jQuery.widget/
//>>demos: http://jqueryui.com/widget/

( function( factory ) {
	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define( [ "jquery", "./version" ], factory );
	} else {

		// Browser globals
		factory( jQuery );
	}
}( function( $ ) {

var widgetUuid = 0;
var widgetSlice = Array.prototype.slice;

$.cleanData = ( function( orig ) {
	return function( elems ) {
		var events, elem, i;
		for ( i = 0; ( elem = elems[ i ] ) != null; i++ ) {
			try {

				// Only trigger remove when necessary to save time
				events = $._data( elem, "events" );
				if ( events && events.remove ) {
					$( elem ).triggerHandler( "remove" );
				}

			// Http://bugs.jquery.com/ticket/8235
			} catch ( e ) {}
		}
		orig( elems );
	};
} )( $.cleanData );

$.widget = function( name, base, prototype ) {
	var existingConstructor, constructor, basePrototype;

	// ProxiedPrototype allows the provided prototype to remain unmodified
	// so that it can be used as a mixin for multiple widgets (#8876)
	var proxiedPrototype = {};

	var namespace = name.split( "." )[ 0 ];
	name = name.split( "." )[ 1 ];
	var fullName = namespace + "-" + name;

	if ( !prototype ) {
		prototype = base;
		base = $.Widget;
	}

	if ( $.isArray( prototype ) ) {
		prototype = $.extend.apply( null, [ {} ].concat( prototype ) );
	}

	// Create selector for plugin
	$.expr[ ":" ][ fullName.toLowerCase() ] = function( elem ) {
		return !!$.data( elem, fullName );
	};

	$[ namespace ] = $[ namespace ] || {};
	existingConstructor = $[ namespace ][ name ];
	constructor = $[ namespace ][ name ] = function( options, element ) {

		// Allow instantiation without "new" keyword
		if ( !this._createWidget ) {
			return new constructor( options, element );
		}

		// Allow instantiation without initializing for simple inheritance
		// must use "new" keyword (the code above always passes args)
		if ( arguments.length ) {
			this._createWidget( options, element );
		}
	};

	// Extend with the existing constructor to carry over any static properties
	$.extend( constructor, existingConstructor, {
		version: prototype.version,

		// Copy the object used to create the prototype in case we need to
		// redefine the widget later
		_proto: $.extend( {}, prototype ),

		// Track widgets that inherit from this widget in case this widget is
		// redefined after a widget inherits from it
		_childConstructors: []
	} );

	basePrototype = new base();

	// We need to make the options hash a property directly on the new instance
	// otherwise we'll modify the options hash on the prototype that we're
	// inheriting from
	basePrototype.options = $.widget.extend( {}, basePrototype.options );
	$.each( prototype, function( prop, value ) {
		if ( !$.isFunction( value ) ) {
			proxiedPrototype[ prop ] = value;
			return;
		}
		proxiedPrototype[ prop ] = ( function() {
			function _super() {
				return base.prototype[ prop ].apply( this, arguments );
			}

			function _superApply( args ) {
				return base.prototype[ prop ].apply( this, args );
			}

			return function() {
				var __super = this._super;
				var __superApply = this._superApply;
				var returnValue;

				this._super = _super;
				this._superApply = _superApply;

				returnValue = value.apply( this, arguments );

				this._super = __super;
				this._superApply = __superApply;

				return returnValue;
			};
		} )();
	} );
	constructor.prototype = $.widget.extend( basePrototype, {

		// TODO: remove support for widgetEventPrefix
		// always use the name + a colon as the prefix, e.g., draggable:start
		// don't prefix for widgets that aren't DOM-based
		widgetEventPrefix: existingConstructor ? ( basePrototype.widgetEventPrefix || name ) : name
	}, proxiedPrototype, {
		constructor: constructor,
		namespace: namespace,
		widgetName: name,
		widgetFullName: fullName
	} );

	// If this widget is being redefined then we need to find all widgets that
	// are inheriting from it and redefine all of them so that they inherit from
	// the new version of this widget. We're essentially trying to replace one
	// level in the prototype chain.
	if ( existingConstructor ) {
		$.each( existingConstructor._childConstructors, function( i, child ) {
			var childPrototype = child.prototype;

			// Redefine the child widget using the same prototype that was
			// originally used, but inherit from the new version of the base
			$.widget( childPrototype.namespace + "." + childPrototype.widgetName, constructor,
				child._proto );
		} );

		// Remove the list of existing child constructors from the old constructor
		// so the old child constructors can be garbage collected
		delete existingConstructor._childConstructors;
	} else {
		base._childConstructors.push( constructor );
	}

	$.widget.bridge( name, constructor );

	return constructor;
};

$.widget.extend = function( target ) {
	var input = widgetSlice.call( arguments, 1 );
	var inputIndex = 0;
	var inputLength = input.length;
	var key;
	var value;

	for ( ; inputIndex < inputLength; inputIndex++ ) {
		for ( key in input[ inputIndex ] ) {
			value = input[ inputIndex ][ key ];
			if ( input[ inputIndex ].hasOwnProperty( key ) && value !== undefined ) {

				// Clone objects
				if ( $.isPlainObject( value ) ) {
					target[ key ] = $.isPlainObject( target[ key ] ) ?
						$.widget.extend( {}, target[ key ], value ) :

						// Don't extend strings, arrays, etc. with objects
						$.widget.extend( {}, value );

				// Copy everything else by reference
				} else {
					target[ key ] = value;
				}
			}
		}
	}
	return target;
};

$.widget.bridge = function( name, object ) {
	var fullName = object.prototype.widgetFullName || name;
	$.fn[ name ] = function( options ) {
		var isMethodCall = typeof options === "string";
		var args = widgetSlice.call( arguments, 1 );
		var returnValue = this;

		if ( isMethodCall ) {

			// If this is an empty collection, we need to have the instance method
			// return undefined instead of the jQuery instance
			if ( !this.length && options === "instance" ) {
				returnValue = undefined;
			} else {
				this.each( function() {
					var methodValue;
					var instance = $.data( this, fullName );

					if ( options === "instance" ) {
						returnValue = instance;
						return false;
					}

					if ( !instance ) {
						return $.error( "cannot call methods on " + name +
							" prior to initialization; " +
							"attempted to call method '" + options + "'" );
					}

					if ( !$.isFunction( instance[ options ] ) || options.charAt( 0 ) === "_" ) {
						return $.error( "no such method '" + options + "' for " + name +
							" widget instance" );
					}

					methodValue = instance[ options ].apply( instance, args );

					if ( methodValue !== instance && methodValue !== undefined ) {
						returnValue = methodValue && methodValue.jquery ?
							returnValue.pushStack( methodValue.get() ) :
							methodValue;
						return false;
					}
				} );
			}
		} else {

			// Allow multiple hashes to be passed on init
			if ( args.length ) {
				options = $.widget.extend.apply( null, [ options ].concat( args ) );
			}

			this.each( function() {
				var instance = $.data( this, fullName );
				if ( instance ) {
					instance.option( options || {} );
					if ( instance._init ) {
						instance._init();
					}
				} else {
					$.data( this, fullName, new object( options, this ) );
				}
			} );
		}

		return returnValue;
	};
};

$.Widget = function( /* options, element */ ) {};
$.Widget._childConstructors = [];

$.Widget.prototype = {
	widgetName: "widget",
	widgetEventPrefix: "",
	defaultElement: "<div>",

	options: {
		classes: {},
		disabled: false,

		// Callbacks
		create: null
	},

	_createWidget: function( options, element ) {
		element = $( element || this.defaultElement || this )[ 0 ];
		this.element = $( element );
		this.uuid = widgetUuid++;
		this.eventNamespace = "." + this.widgetName + this.uuid;

		this.bindings = $();
		this.hoverable = $();
		this.focusable = $();
		this.classesElementLookup = {};

		if ( element !== this ) {
			$.data( element, this.widgetFullName, this );
			this._on( true, this.element, {
				remove: function( event ) {
					if ( event.target === element ) {
						this.destroy();
					}
				}
			} );
			this.document = $( element.style ?

				// Element within the document
				element.ownerDocument :

				// Element is window or document
				element.document || element );
			this.window = $( this.document[ 0 ].defaultView || this.document[ 0 ].parentWindow );
		}

		this.options = $.widget.extend( {},
			this.options,
			this._getCreateOptions(),
			options );

		this._create();

		if ( this.options.disabled ) {
			this._setOptionDisabled( this.options.disabled );
		}

		this._trigger( "create", null, this._getCreateEventData() );
		this._init();
	},

	_getCreateOptions: function() {
		return {};
	},

	_getCreateEventData: $.noop,

	_create: $.noop,

	_init: $.noop,

	destroy: function() {
		var that = this;

		this._destroy();
		$.each( this.classesElementLookup, function( key, value ) {
			that._removeClass( value, key );
		} );

		// We can probably remove the unbind calls in 2.0
		// all event bindings should go through this._on()
		this.element
			.off( this.eventNamespace )
			.removeData( this.widgetFullName );
		this.widget()
			.off( this.eventNamespace )
			.removeAttr( "aria-disabled" );

		// Clean up events and states
		this.bindings.off( this.eventNamespace );
	},

	_destroy: $.noop,

	widget: function() {
		return this.element;
	},

	option: function( key, value ) {
		var options = key;
		var parts;
		var curOption;
		var i;

		if ( arguments.length === 0 ) {

			// Don't return a reference to the internal hash
			return $.widget.extend( {}, this.options );
		}

		if ( typeof key === "string" ) {

			// Handle nested keys, e.g., "foo.bar" => { foo: { bar: ___ } }
			options = {};
			parts = key.split( "." );
			key = parts.shift();
			if ( parts.length ) {
				curOption = options[ key ] = $.widget.extend( {}, this.options[ key ] );
				for ( i = 0; i < parts.length - 1; i++ ) {
					curOption[ parts[ i ] ] = curOption[ parts[ i ] ] || {};
					curOption = curOption[ parts[ i ] ];
				}
				key = parts.pop();
				if ( arguments.length === 1 ) {
					return curOption[ key ] === undefined ? null : curOption[ key ];
				}
				curOption[ key ] = value;
			} else {
				if ( arguments.length === 1 ) {
					return this.options[ key ] === undefined ? null : this.options[ key ];
				}
				options[ key ] = value;
			}
		}

		this._setOptions( options );

		return this;
	},

	_setOptions: function( options ) {
		var key;

		for ( key in options ) {
			this._setOption( key, options[ key ] );
		}

		return this;
	},

	_setOption: function( key, value ) {
		if ( key === "classes" ) {
			this._setOptionClasses( value );
		}

		this.options[ key ] = value;

		if ( key === "disabled" ) {
			this._setOptionDisabled( value );
		}

		return this;
	},

	_setOptionClasses: function( value ) {
		var classKey, elements, currentElements;

		for ( classKey in value ) {
			currentElements = this.classesElementLookup[ classKey ];
			if ( value[ classKey ] === this.options.classes[ classKey ] ||
					!currentElements ||
					!currentElements.length ) {
				continue;
			}

			// We are doing this to create a new jQuery object because the _removeClass() call
			// on the next line is going to destroy the reference to the current elements being
			// tracked. We need to save a copy of this collection so that we can add the new classes
			// below.
			elements = $( currentElements.get() );
			this._removeClass( currentElements, classKey );

			// We don't use _addClass() here, because that uses this.options.classes
			// for generating the string of classes. We want to use the value passed in from
			// _setOption(), this is the new value of the classes option which was passed to
			// _setOption(). We pass this value directly to _classes().
			elements.addClass( this._classes( {
				element: elements,
				keys: classKey,
				classes: value,
				add: true
			} ) );
		}
	},

	_setOptionDisabled: function( value ) {
		this._toggleClass( this.widget(), this.widgetFullName + "-disabled", null, !!value );

		// If the widget is becoming disabled, then nothing is interactive
		if ( value ) {
			this._removeClass( this.hoverable, null, "ui-state-hover" );
			this._removeClass( this.focusable, null, "ui-state-focus" );
		}
	},

	enable: function() {
		return this._setOptions( { disabled: false } );
	},

	disable: function() {
		return this._setOptions( { disabled: true } );
	},

	_classes: function( options ) {
		var full = [];
		var that = this;

		options = $.extend( {
			element: this.element,
			classes: this.options.classes || {}
		}, options );

		function processClassString( classes, checkOption ) {
			var current, i;
			for ( i = 0; i < classes.length; i++ ) {
				current = that.classesElementLookup[ classes[ i ] ] || $();
				if ( options.add ) {
					current = $( $.unique( current.get().concat( options.element.get() ) ) );
				} else {
					current = $( current.not( options.element ).get() );
				}
				that.classesElementLookup[ classes[ i ] ] = current;
				full.push( classes[ i ] );
				if ( checkOption && options.classes[ classes[ i ] ] ) {
					full.push( options.classes[ classes[ i ] ] );
				}
			}
		}

		this._on( options.element, {
			"remove": "_untrackClassesElement"
		} );

		if ( options.keys ) {
			processClassString( options.keys.match( /\S+/g ) || [], true );
		}
		if ( options.extra ) {
			processClassString( options.extra.match( /\S+/g ) || [] );
		}

		return full.join( " " );
	},

	_untrackClassesElement: function( event ) {
		var that = this;
		$.each( that.classesElementLookup, function( key, value ) {
			if ( $.inArray( event.target, value ) !== -1 ) {
				that.classesElementLookup[ key ] = $( value.not( event.target ).get() );
			}
		} );
	},

	_removeClass: function( element, keys, extra ) {
		return this._toggleClass( element, keys, extra, false );
	},

	_addClass: function( element, keys, extra ) {
		return this._toggleClass( element, keys, extra, true );
	},

	_toggleClass: function( element, keys, extra, add ) {
		add = ( typeof add === "boolean" ) ? add : extra;
		var shift = ( typeof element === "string" || element === null ),
			options = {
				extra: shift ? keys : extra,
				keys: shift ? element : keys,
				element: shift ? this.element : element,
				add: add
			};
		options.element.toggleClass( this._classes( options ), add );
		return this;
	},

	_on: function( suppressDisabledCheck, element, handlers ) {
		var delegateElement;
		var instance = this;

		// No suppressDisabledCheck flag, shuffle arguments
		if ( typeof suppressDisabledCheck !== "boolean" ) {
			handlers = element;
			element = suppressDisabledCheck;
			suppressDisabledCheck = false;
		}

		// No element argument, shuffle and use this.element
		if ( !handlers ) {
			handlers = element;
			element = this.element;
			delegateElement = this.widget();
		} else {
			element = delegateElement = $( element );
			this.bindings = this.bindings.add( element );
		}

		$.each( handlers, function( event, handler ) {
			function handlerProxy() {

				// Allow widgets to customize the disabled handling
				// - disabled as an array instead of boolean
				// - disabled class as method for disabling individual parts
				if ( !suppressDisabledCheck &&
						( instance.options.disabled === true ||
						$( this ).hasClass( "ui-state-disabled" ) ) ) {
					return;
				}
				return ( typeof handler === "string" ? instance[ handler ] : handler )
					.apply( instance, arguments );
			}

			// Copy the guid so direct unbinding works
			if ( typeof handler !== "string" ) {
				handlerProxy.guid = handler.guid =
					handler.guid || handlerProxy.guid || $.guid++;
			}

			var match = event.match( /^([\w:-]*)\s*(.*)$/ );
			var eventName = match[ 1 ] + instance.eventNamespace;
			var selector = match[ 2 ];

			if ( selector ) {
				delegateElement.on( eventName, selector, handlerProxy );
			} else {
				element.on( eventName, handlerProxy );
			}
		} );
	},

	_off: function( element, eventName ) {
		eventName = ( eventName || "" ).split( " " ).join( this.eventNamespace + " " ) +
			this.eventNamespace;
		element.off( eventName ).off( eventName );

		// Clear the stack to avoid memory leaks (#10056)
		this.bindings = $( this.bindings.not( element ).get() );
		this.focusable = $( this.focusable.not( element ).get() );
		this.hoverable = $( this.hoverable.not( element ).get() );
	},

	_delay: function( handler, delay ) {
		function handlerProxy() {
			return ( typeof handler === "string" ? instance[ handler ] : handler )
				.apply( instance, arguments );
		}
		var instance = this;
		return setTimeout( handlerProxy, delay || 0 );
	},

	_hoverable: function( element ) {
		this.hoverable = this.hoverable.add( element );
		this._on( element, {
			mouseenter: function( event ) {
				this._addClass( $( event.currentTarget ), null, "ui-state-hover" );
			},
			mouseleave: function( event ) {
				this._removeClass( $( event.currentTarget ), null, "ui-state-hover" );
			}
		} );
	},

	_focusable: function( element ) {
		this.focusable = this.focusable.add( element );
		this._on( element, {
			focusin: function( event ) {
				this._addClass( $( event.currentTarget ), null, "ui-state-focus" );
			},
			focusout: function( event ) {
				this._removeClass( $( event.currentTarget ), null, "ui-state-focus" );
			}
		} );
	},

	_trigger: function( type, event, data ) {
		var prop, orig;
		var callback = this.options[ type ];

		data = data || {};
		event = $.Event( event );
		event.type = ( type === this.widgetEventPrefix ?
			type :
			this.widgetEventPrefix + type ).toLowerCase();

		// The original event may come from any element
		// so we need to reset the target on the new event
		event.target = this.element[ 0 ];

		// Copy original event properties over to the new event
		orig = event.originalEvent;
		if ( orig ) {
			for ( prop in orig ) {
				if ( !( prop in event ) ) {
					event[ prop ] = orig[ prop ];
				}
			}
		}

		this.element.trigger( event, data );
		return !( $.isFunction( callback ) &&
			callback.apply( this.element[ 0 ], [ event ].concat( data ) ) === false ||
			event.isDefaultPrevented() );
	}
};

$.each( { show: "fadeIn", hide: "fadeOut" }, function( method, defaultEffect ) {
	$.Widget.prototype[ "_" + method ] = function( element, options, callback ) {
		if ( typeof options === "string" ) {
			options = { effect: options };
		}

		var hasOptions;
		var effectName = !options ?
			method :
			options === true || typeof options === "number" ?
				defaultEffect :
				options.effect || defaultEffect;

		options = options || {};
		if ( typeof options === "number" ) {
			options = { duration: options };
		}

		hasOptions = !$.isEmptyObject( options );
		options.complete = callback;

		if ( options.delay ) {
			element.delay( options.delay );
		}

		if ( hasOptions && $.effects && $.effects.effect[ effectName ] ) {
			element[ method ]( options );
		} else if ( effectName !== method && element[ effectName ] ) {
			element[ effectName ]( options.duration, options.easing, callback );
		} else {
			element.queue( function( next ) {
				$( this )[ method ]();
				if ( callback ) {
					callback.call( element[ 0 ] );
				}
				next();
			} );
		}
	};
} );

return $.widget;

} ) );







/*!
 * jQuery UI Menu 1.12.1
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

//>>label: Menu
//>>group: Widgets
//>>description: Creates nestable menus.
//>>docs: http://api.jqueryui.com/menu/
//>>demos: http://jqueryui.com/menu/
//>>css.structure: ../../themes/base/core.css
//>>css.structure: ../../themes/base/menu.css
//>>css.theme: ../../themes/base/theme.css

( function( factory ) {
	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define( [
			"jquery",
			"../keycode",
			"../position",
			"../safe-active-element",
			"../unique-id",
			"../version",
			"../widget"
		], factory );
	} else {

		// Browser globals
		factory( jQuery );
	}
}( function( $ ) {

return $.widget( "ui.menu", {
	version: "1.12.1",
	defaultElement: "<ul>",
	delay: 300,
	options: {
		icons: {
			submenu: "ui-icon-caret-1-e"
		},
		items: "> *",
		menus: "ul",
		position: {
			my: "left top",
			at: "right top"
		},
		role: "menu",

		// Callbacks
		blur: null,
		focus: null,
		select: null
	},

	_create: function() {
		this.activeMenu = this.element;

		// Flag used to prevent firing of the click handler
		// as the event bubbles up through nested menus
		this.mouseHandled = false;
		this.element
			.uniqueId()
			.attr( {
				role: this.options.role,
				tabIndex: 0
			} );

		this._addClass( "ui-menu", "ui-widget ui-widget-content" );
		this._on( {

			// Prevent focus from sticking to links inside menu after clicking
			// them (focus should always stay on UL during navigation).
			"mousedown .ui-menu-item": function( event ) {
				event.preventDefault();
			},
			"click .ui-menu-item": function( event ) {
				var target = $( event.target );
				var active = $( $.ui.safeActiveElement( this.document[ 0 ] ) );
				if ( !this.mouseHandled && target.not( ".ui-state-disabled" ).length ) {
					this.select( event );

					// Only set the mouseHandled flag if the event will bubble, see #9469.
					if ( !event.isPropagationStopped() ) {
						this.mouseHandled = true;
					}

					// Open submenu on click
					if ( target.has( ".ui-menu" ).length ) {
						this.expand( event );
					} else if ( !this.element.is( ":focus" ) &&
							active.closest( ".ui-menu" ).length ) {

						// Redirect focus to the menu
						this.element.trigger( "focus", [ true ] );

						// If the active item is on the top level, let it stay active.
						// Otherwise, blur the active item since it is no longer visible.
						if ( this.active && this.active.parents( ".ui-menu" ).length === 1 ) {
							clearTimeout( this.timer );
						}
					}
				}
			},
			"mouseenter .ui-menu-item": function( event ) {

				// Ignore mouse events while typeahead is active, see #10458.
				// Prevents focusing the wrong item when typeahead causes a scroll while the mouse
				// is over an item in the menu
				if ( this.previousFilter ) {
					return;
				}

				var actualTarget = $( event.target ).closest( ".ui-menu-item" ),
					target = $( event.currentTarget );

				// Ignore bubbled events on parent items, see #11641
				if ( actualTarget[ 0 ] !== target[ 0 ] ) {
					return;
				}

				// Remove ui-state-active class from siblings of the newly focused menu item
				// to avoid a jump caused by adjacent elements both having a class with a border
				this._removeClass( target.siblings().children( ".ui-state-active" ),
					null, "ui-state-active" );
				this.focus( event, target );
			},
			mouseleave: "collapseAll",
			"mouseleave .ui-menu": "collapseAll",
			focus: function( event, keepActiveItem ) {

				// If there's already an active item, keep it active
				// If not, activate the first item
				var item = this.active || this.element.find( this.options.items ).eq( 0 );

				if ( !keepActiveItem ) {
					this.focus( event, item );
				}
			},
			blur: function( event ) {
				this._delay( function() {
					var notContained = !$.contains(
						this.element[ 0 ],
						$.ui.safeActiveElement( this.document[ 0 ] )
					);
					if ( notContained ) {
						this.collapseAll( event );
					}
				} );
			},
			keydown: "_keydown"
		} );

		this.refresh();

		// Clicks outside of a menu collapse any open menus
		this._on( this.document, {
			click: function( event ) {
				if ( this._closeOnDocumentClick( event ) ) {
					this.collapseAll( event );
				}

				// Reset the mouseHandled flag
				this.mouseHandled = false;
			}
		} );
	},

	_destroy: function() {
		var items = this.element.find( ".ui-menu-item" )
				.removeAttr( "role aria-disabled" ),
			submenus = items.children( ".ui-menu-item-wrapper" )
				.removeUniqueId()
				.removeAttr( "tabIndex role aria-haspopup" );

		// Destroy (sub)menus
		this.element
			.removeAttr( "aria-activedescendant" )
			.find( ".ui-menu" ).addBack()
				.removeAttr( "role aria-labelledby aria-expanded aria-hidden aria-disabled " +
					"tabIndex" )
				.removeUniqueId()
				.show();

		submenus.children().each( function() {
			var elem = $( this );
			if ( elem.data( "ui-menu-submenu-caret" ) ) {
				elem.remove();
			}
		} );
	},

	_keydown: function( event ) {
		var match, prev, character, skip,
			preventDefault = true;

		switch ( event.keyCode ) {
		case $.ui.keyCode.PAGE_UP:
			this.previousPage( event );
			break;
		case $.ui.keyCode.PAGE_DOWN:
			this.nextPage( event );
			break;
		case $.ui.keyCode.HOME:
			this._move( "first", "first", event );
			break;
		case $.ui.keyCode.END:
			this._move( "last", "last", event );
			break;
		case $.ui.keyCode.UP:
			this.previous( event );
			break;
		case $.ui.keyCode.DOWN:
			this.next( event );
			break;
		case $.ui.keyCode.LEFT:
			this.collapse( event );
			break;
		case $.ui.keyCode.RIGHT:
			if ( this.active && !this.active.is( ".ui-state-disabled" ) ) {
				this.expand( event );
			}
			break;
		case $.ui.keyCode.ENTER:
		case $.ui.keyCode.SPACE:
			this._activate( event );
			break;
		case $.ui.keyCode.ESCAPE:
			this.collapse( event );
			break;
		default:
			preventDefault = false;
			prev = this.previousFilter || "";
			skip = false;

			// Support number pad values
			character = event.keyCode >= 96 && event.keyCode <= 105 ?
				( event.keyCode - 96 ).toString() : String.fromCharCode( event.keyCode );

			clearTimeout( this.filterTimer );

			if ( character === prev ) {
				skip = true;
			} else {
				character = prev + character;
			}

			match = this._filterMenuItems( character );
			match = skip && match.index( this.active.next() ) !== -1 ?
				this.active.nextAll( ".ui-menu-item" ) :
				match;

			// If no matches on the current filter, reset to the last character pressed
			// to move down the menu to the first item that starts with that character
			if ( !match.length ) {
				character = String.fromCharCode( event.keyCode );
				match = this._filterMenuItems( character );
			}

			if ( match.length ) {
				this.focus( event, match );
				this.previousFilter = character;
				this.filterTimer = this._delay( function() {
					delete this.previousFilter;
				}, 1000 );
			} else {
				delete this.previousFilter;
			}
		}

		if ( preventDefault ) {
			event.preventDefault();
		}
	},

	_activate: function( event ) {
		if ( this.active && !this.active.is( ".ui-state-disabled" ) ) {
			if ( this.active.children( "[aria-haspopup='true']" ).length ) {
				this.expand( event );
			} else {
				this.select( event );
			}
		}
	},

	refresh: function() {
		var menus, items, newSubmenus, newItems, newWrappers,
			that = this,
			icon = this.options.icons.submenu,
			submenus = this.element.find( this.options.menus );

		this._toggleClass( "ui-menu-icons", null, !!this.element.find( ".ui-icon" ).length );

		// Initialize nested menus
		newSubmenus = submenus.filter( ":not(.ui-menu)" )
			.hide()
			.attr( {
				role: this.options.role,
				"aria-hidden": "true",
				"aria-expanded": "false"
			} )
			.each( function() {
				var menu = $( this ),
					item = menu.prev(),
					submenuCaret = $( "<span>" ).data( "ui-menu-submenu-caret", true );

				that._addClass( submenuCaret, "ui-menu-icon", "ui-icon " + icon );
				item
					.attr( "aria-haspopup", "true" )
					.prepend( submenuCaret );
				menu.attr( "aria-labelledby", item.attr( "id" ) );
			} );

		this._addClass( newSubmenus, "ui-menu", "ui-widget ui-widget-content ui-front" );

		menus = submenus.add( this.element );
		items = menus.find( this.options.items );

		// Initialize menu-items containing spaces and/or dashes only as dividers
		items.not( ".ui-menu-item" ).each( function() {
			var item = $( this );
			if ( that._isDivider( item ) ) {
				that._addClass( item, "ui-menu-divider", "ui-widget-content" );
			}
		} );

		// Don't refresh list items that are already adapted
		newItems = items.not( ".ui-menu-item, .ui-menu-divider" );
		newWrappers = newItems.children()
			.not( ".ui-menu" )
				.uniqueId()
				.attr( {
					tabIndex: -1,
					role: this._itemRole()
				} );
		this._addClass( newItems, "ui-menu-item" )
			._addClass( newWrappers, "ui-menu-item-wrapper" );

		// Add aria-disabled attribute to any disabled menu item
		items.filter( ".ui-state-disabled" ).attr( "aria-disabled", "true" );

		// If the active item has been removed, blur the menu
		if ( this.active && !$.contains( this.element[ 0 ], this.active[ 0 ] ) ) {
			this.blur();
		}
	},

	_itemRole: function() {
		return {
			menu: "menuitem",
			listbox: "option"
		}[ this.options.role ];
	},

	_setOption: function( key, value ) {
		if ( key === "icons" ) {
			var icons = this.element.find( ".ui-menu-icon" );
			this._removeClass( icons, null, this.options.icons.submenu )
				._addClass( icons, null, value.submenu );
		}
		this._super( key, value );
	},

	_setOptionDisabled: function( value ) {
		this._super( value );

		this.element.attr( "aria-disabled", String( value ) );
		this._toggleClass( null, "ui-state-disabled", !!value );
	},

	focus: function( event, item ) {
		var nested, focused, activeParent;
		this.blur( event, event && event.type === "focus" );

		this._scrollIntoView( item );

		this.active = item.first();

		focused = this.active.children( ".ui-menu-item-wrapper" );
		this._addClass( focused, null, "ui-state-active" );

		// Only update aria-activedescendant if there's a role
		// otherwise we assume focus is managed elsewhere
		if ( this.options.role ) {
			this.element.attr( "aria-activedescendant", focused.attr( "id" ) );
		}

		// Highlight active parent menu item, if any
		activeParent = this.active
			.parent()
				.closest( ".ui-menu-item" )
					.children( ".ui-menu-item-wrapper" );
		this._addClass( activeParent, null, "ui-state-active" );

		if ( event && event.type === "keydown" ) {
			this._close();
		} else {
			this.timer = this._delay( function() {
				this._close();
			}, this.delay );
		}

		nested = item.children( ".ui-menu" );
		if ( nested.length && event && ( /^mouse/.test( event.type ) ) ) {
			this._startOpening( nested );
		}
		this.activeMenu = item.parent();

		this._trigger( "focus", event, { item: item } );
	},

	_scrollIntoView: function( item ) {
		var borderTop, paddingTop, offset, scroll, elementHeight, itemHeight;
		if ( this._hasScroll() ) {
			borderTop = parseFloat( $.css( this.activeMenu[ 0 ], "borderTopWidth" ) ) || 0;
			paddingTop = parseFloat( $.css( this.activeMenu[ 0 ], "paddingTop" ) ) || 0;
			offset = item.offset().top - this.activeMenu.offset().top - borderTop - paddingTop;
			scroll = this.activeMenu.scrollTop();
			elementHeight = this.activeMenu.height();
			itemHeight = item.outerHeight();

			if ( offset < 0 ) {
				this.activeMenu.scrollTop( scroll + offset );
			} else if ( offset + itemHeight > elementHeight ) {
				this.activeMenu.scrollTop( scroll + offset - elementHeight + itemHeight );
			}
		}
	},

	blur: function( event, fromFocus ) {
		if ( !fromFocus ) {
			clearTimeout( this.timer );
		}

		if ( !this.active ) {
			return;
		}

		this._removeClass( this.active.children( ".ui-menu-item-wrapper" ),
			null, "ui-state-active" );

		this._trigger( "blur", event, { item: this.active } );
		this.active = null;
	},

	_startOpening: function( submenu ) {
		clearTimeout( this.timer );

		// Don't open if already open fixes a Firefox bug that caused a .5 pixel
		// shift in the submenu position when mousing over the caret icon
		if ( submenu.attr( "aria-hidden" ) !== "true" ) {
			return;
		}

		this.timer = this._delay( function() {
			this._close();
			this._open( submenu );
		}, this.delay );
	},

	_open: function( submenu ) {
		var position = $.extend( {
			of: this.active
		}, this.options.position );

		clearTimeout( this.timer );
		this.element.find( ".ui-menu" ).not( submenu.parents( ".ui-menu" ) )
			.hide()
			.attr( "aria-hidden", "true" );

		submenu
			.show()
			.removeAttr( "aria-hidden" )
			.attr( "aria-expanded", "true" )
			.position( position );
	},

	collapseAll: function( event, all ) {
		clearTimeout( this.timer );
		this.timer = this._delay( function() {

			// If we were passed an event, look for the submenu that contains the event
			var currentMenu = all ? this.element :
				$( event && event.target ).closest( this.element.find( ".ui-menu" ) );

			// If we found no valid submenu ancestor, use the main menu to close all
			// sub menus anyway
			if ( !currentMenu.length ) {
				currentMenu = this.element;
			}

			this._close( currentMenu );

			this.blur( event );

			// Work around active item staying active after menu is blurred
			this._removeClass( currentMenu.find( ".ui-state-active" ), null, "ui-state-active" );

			this.activeMenu = currentMenu;
		}, this.delay );
	},

	// With no arguments, closes the currently active menu - if nothing is active
	// it closes all menus.  If passed an argument, it will search for menus BELOW
	_close: function( startMenu ) {
		if ( !startMenu ) {
			startMenu = this.active ? this.active.parent() : this.element;
		}

		startMenu.find( ".ui-menu" )
			.hide()
			.attr( "aria-hidden", "true" )
			.attr( "aria-expanded", "false" );
	},

	_closeOnDocumentClick: function( event ) {
		return !$( event.target ).closest( ".ui-menu" ).length;
	},

	_isDivider: function( item ) {

		// Match hyphen, em dash, en dash
		return !/[^\-\u2014\u2013\s]/.test( item.text() );
	},

	collapse: function( event ) {
		var newItem = this.active &&
			this.active.parent().closest( ".ui-menu-item", this.element );
		if ( newItem && newItem.length ) {
			this._close();
			this.focus( event, newItem );
		}
	},

	expand: function( event ) {
		var newItem = this.active &&
			this.active
				.children( ".ui-menu " )
					.find( this.options.items )
						.first();

		if ( newItem && newItem.length ) {
			this._open( newItem.parent() );

			// Delay so Firefox will not hide activedescendant change in expanding submenu from AT
			this._delay( function() {
				this.focus( event, newItem );
			} );
		}
	},

	next: function( event ) {
		this._move( "next", "first", event );
	},

	previous: function( event ) {
		this._move( "prev", "last", event );
	},

	isFirstItem: function() {
		return this.active && !this.active.prevAll( ".ui-menu-item" ).length;
	},

	isLastItem: function() {
		return this.active && !this.active.nextAll( ".ui-menu-item" ).length;
	},

	_move: function( direction, filter, event ) {
		var next;
		if ( this.active ) {
			if ( direction === "first" || direction === "last" ) {
				next = this.active
					[ direction === "first" ? "prevAll" : "nextAll" ]( ".ui-menu-item" )
					.eq( -1 );
			} else {
				next = this.active
					[ direction + "All" ]( ".ui-menu-item" )
					.eq( 0 );
			}
		}
		if ( !next || !next.length || !this.active ) {
			next = this.activeMenu.find( this.options.items )[ filter ]();
		}

		this.focus( event, next );
	},

	nextPage: function( event ) {
		var item, base, height;

		if ( !this.active ) {
			this.next( event );
			return;
		}
		if ( this.isLastItem() ) {
			return;
		}
		if ( this._hasScroll() ) {
			base = this.active.offset().top;
			height = this.element.height();
			this.active.nextAll( ".ui-menu-item" ).each( function() {
				item = $( this );
				return item.offset().top - base - height < 0;
			} );

			this.focus( event, item );
		} else {
			this.focus( event, this.activeMenu.find( this.options.items )
				[ !this.active ? "first" : "last" ]() );
		}
	},

	previousPage: function( event ) {
		var item, base, height;
		if ( !this.active ) {
			this.next( event );
			return;
		}
		if ( this.isFirstItem() ) {
			return;
		}
		if ( this._hasScroll() ) {
			base = this.active.offset().top;
			height = this.element.height();
			this.active.prevAll( ".ui-menu-item" ).each( function() {
				item = $( this );
				return item.offset().top - base + height > 0;
			} );

			this.focus( event, item );
		} else {
			this.focus( event, this.activeMenu.find( this.options.items ).first() );
		}
	},

	_hasScroll: function() {
		return this.element.outerHeight() < this.element.prop( "scrollHeight" );
	},

	select: function( event ) {

		// TODO: It should never be possible to not have an active item at this
		// point, but the tests don't trigger mouseenter before click.
		this.active = this.active || $( event.target ).closest( ".ui-menu-item" );
		var ui = { item: this.active };
		if ( !this.active.has( ".ui-menu" ).length ) {
			this.collapseAll( event, true );
		}
		this._trigger( "select", event, ui );
	},

	_filterMenuItems: function( character ) {
		var escapedCharacter = character.replace( /[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&" ),
			regex = new RegExp( "^" + escapedCharacter, "i" );

		return this.activeMenu
			.find( this.options.items )

				// Only match on items, not dividers or other content (#10571)
				.filter( ".ui-menu-item" )
					.filter( function() {
						return regex.test(
							$.trim( $( this ).children( ".ui-menu-item-wrapper" ).text() ) );
					} );
	}
} );

} ) );







/*!
 * jQuery UI Autocomplete 1.12.1
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

//>>label: Autocomplete
//>>group: Widgets
//>>description: Lists suggested words as the user is typing.
//>>docs: http://api.jqueryui.com/autocomplete/
//>>demos: http://jqueryui.com/autocomplete/
//>>css.structure: ../../themes/base/core.css
//>>css.structure: ../../themes/base/autocomplete.css
//>>css.theme: ../../themes/base/theme.css

( function( factory ) {
	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define( [
			"jquery",
			"./menu",
			"../keycode",
			"../position",
			"../safe-active-element",
			"../version",
			"../widget"
		], factory );
	} else {

		// Browser globals
		factory( jQuery );
	}
}( function( $ ) {

$.widget( "ui.autocomplete", {
	version: "1.12.1",
	defaultElement: "<input>",
	options: {
		appendTo: null,
		autoFocus: false,
		delay: 300,
		minLength: 1,
		position: {
			my: "left top",
			at: "left bottom",
			collision: "none"
		},
		source: null,

		// Callbacks
		change: null,
		close: null,
		focus: null,
		open: null,
		response: null,
		search: null,
		select: null
	},

	requestIndex: 0,
	pending: 0,

	_create: function() {

		// Some browsers only repeat keydown events, not keypress events,
		// so we use the suppressKeyPress flag to determine if we've already
		// handled the keydown event. #7269
		// Unfortunately the code for & in keypress is the same as the up arrow,
		// so we use the suppressKeyPressRepeat flag to avoid handling keypress
		// events when we know the keydown event was used to modify the
		// search term. #7799
		var suppressKeyPress, suppressKeyPressRepeat, suppressInput,
			nodeName = this.element[ 0 ].nodeName.toLowerCase(),
			isTextarea = nodeName === "textarea",
			isInput = nodeName === "input";

		// Textareas are always multi-line
		// Inputs are always single-line, even if inside a contentEditable element
		// IE also treats inputs as contentEditable
		// All other element types are determined by whether or not they're contentEditable
		this.isMultiLine = isTextarea || !isInput && this._isContentEditable( this.element );

		this.valueMethod = this.element[ isTextarea || isInput ? "val" : "text" ];
		this.isNewMenu = true;

		this._addClass( "ui-autocomplete-input" );
		this.element.attr( "autocomplete", "off" );

		this._on( this.element, {
			keydown: function( event ) {
				if ( this.element.prop( "readOnly" ) ) {
					suppressKeyPress = true;
					suppressInput = true;
					suppressKeyPressRepeat = true;
					return;
				}

				suppressKeyPress = false;
				suppressInput = false;
				suppressKeyPressRepeat = false;
				var keyCode = $.ui.keyCode;
				switch ( event.keyCode ) {
				case keyCode.PAGE_UP:
					suppressKeyPress = true;
					this._move( "previousPage", event );
					break;
				case keyCode.PAGE_DOWN:
					suppressKeyPress = true;
					this._move( "nextPage", event );
					break;
				case keyCode.UP:
					suppressKeyPress = true;
					this._keyEvent( "previous", event );
					break;
				case keyCode.DOWN:
					suppressKeyPress = true;
					this._keyEvent( "next", event );
					break;
				case keyCode.ENTER:

					// when menu is open and has focus
					if ( this.menu.active ) {

						// #6055 - Opera still allows the keypress to occur
						// which causes forms to submit
						suppressKeyPress = true;
						event.preventDefault();
						this.menu.select( event );
					}
					break;
				case keyCode.TAB:
					if ( this.menu.active ) {
						this.menu.select( event );
					}
					break;
				case keyCode.ESCAPE:
					if ( this.menu.element.is( ":visible" ) ) {
						if ( !this.isMultiLine ) {
							this._value( this.term );
						}
						this.close( event );

						// Different browsers have different default behavior for escape
						// Single press can mean undo or clear
						// Double press in IE means clear the whole form
						event.preventDefault();
					}
					break;
				default:
					suppressKeyPressRepeat = true;

					// search timeout should be triggered before the input value is changed
					this._searchTimeout( event );
					break;
				}
			},
			keypress: function( event ) {
				if ( suppressKeyPress ) {
					suppressKeyPress = false;
					if ( !this.isMultiLine || this.menu.element.is( ":visible" ) ) {
						event.preventDefault();
					}
					return;
				}
				if ( suppressKeyPressRepeat ) {
					return;
				}

				// Replicate some key handlers to allow them to repeat in Firefox and Opera
				var keyCode = $.ui.keyCode;
				switch ( event.keyCode ) {
				case keyCode.PAGE_UP:
					this._move( "previousPage", event );
					break;
				case keyCode.PAGE_DOWN:
					this._move( "nextPage", event );
					break;
				case keyCode.UP:
					this._keyEvent( "previous", event );
					break;
				case keyCode.DOWN:
					this._keyEvent( "next", event );
					break;
				}
			},
			input: function( event ) {
				if ( suppressInput ) {
					suppressInput = false;
					event.preventDefault();
					return;
				}
				this._searchTimeout( event );
			},
			focus: function() {
				this.selectedItem = null;
				this.previous = this._value();
			},
			blur: function( event ) {
				if ( this.cancelBlur ) {
					delete this.cancelBlur;
					return;
				}

				clearTimeout( this.searching );
				this.close( event );
				this._change( event );
			}
		} );

		this._initSource();
		this.menu = $( "<ul>" )
			.appendTo( this._appendTo() )
			.menu( {

				// disable ARIA support, the live region takes care of that
				role: null
			} )
			.hide()
			.menu( "instance" );

		this._addClass( this.menu.element, "ui-autocomplete", "ui-front" );
		this._on( this.menu.element, {
			mousedown: function( event ) {

				// prevent moving focus out of the text field
				event.preventDefault();

				// IE doesn't prevent moving focus even with event.preventDefault()
				// so we set a flag to know when we should ignore the blur event
				this.cancelBlur = true;
				this._delay( function() {
					delete this.cancelBlur;

					// Support: IE 8 only
					// Right clicking a menu item or selecting text from the menu items will
					// result in focus moving out of the input. However, we've already received
					// and ignored the blur event because of the cancelBlur flag set above. So
					// we restore focus to ensure that the menu closes properly based on the user's
					// next actions.
					if ( this.element[ 0 ] !== $.ui.safeActiveElement( this.document[ 0 ] ) ) {
						this.element.trigger( "focus" );
					}
				} );
			},
			menufocus: function( event, ui ) {
				var label, item;

				// support: Firefox
				// Prevent accidental activation of menu items in Firefox (#7024 #9118)
				if ( this.isNewMenu ) {
					this.isNewMenu = false;
					if ( event.originalEvent && /^mouse/.test( event.originalEvent.type ) ) {
						this.menu.blur();

						this.document.one( "mousemove", function() {
							$( event.target ).trigger( event.originalEvent );
						} );

						return;
					}
				}

				item = ui.item.data( "ui-autocomplete-item" );
				if ( false !== this._trigger( "focus", event, { item: item } ) ) {

					// use value to match what will end up in the input, if it was a key event
					if ( event.originalEvent && /^key/.test( event.originalEvent.type ) ) {
						this._value( item.value );
					}
				}

				// Announce the value in the liveRegion
				label = ui.item.attr( "aria-label" ) || item.value;
				if ( label && $.trim( label ).length ) {
					this.liveRegion.children().hide();
					$( "<div>" ).text( label ).appendTo( this.liveRegion );
				}
			},
			menuselect: function( event, ui ) {
				var item = ui.item.data( "ui-autocomplete-item" ),
					previous = this.previous;

				// Only trigger when focus was lost (click on menu)
				if ( this.element[ 0 ] !== $.ui.safeActiveElement( this.document[ 0 ] ) ) {
					this.element.trigger( "focus" );
					this.previous = previous;

					// #6109 - IE triggers two focus events and the second
					// is asynchronous, so we need to reset the previous
					// term synchronously and asynchronously :-(
					this._delay( function() {
						this.previous = previous;
						this.selectedItem = item;
					} );
				}

				if ( false !== this._trigger( "select", event, { item: item } ) ) {
					this._value( item.value );
				}

				// reset the term after the select event
				// this allows custom select handling to work properly
				this.term = this._value();

				this.close( event );
				this.selectedItem = item;
			}
		} );

		this.liveRegion = $( "<div>", {
			role: "status",
			"aria-live": "assertive",
			"aria-relevant": "additions"
		} )
			.appendTo( this.document[ 0 ].body );

		this._addClass( this.liveRegion, null, "ui-helper-hidden-accessible" );

		// Turning off autocomplete prevents the browser from remembering the
		// value when navigating through history, so we re-enable autocomplete
		// if the page is unloaded before the widget is destroyed. #7790
		this._on( this.window, {
			beforeunload: function() {
				this.element.removeAttr( "autocomplete" );
			}
		} );
	},

	_destroy: function() {
		clearTimeout( this.searching );
		this.element.removeAttr( "autocomplete" );
		this.menu.element.remove();
		this.liveRegion.remove();
	},

	_setOption: function( key, value ) {
		this._super( key, value );
		if ( key === "source" ) {
			this._initSource();
		}
		if ( key === "appendTo" ) {
			this.menu.element.appendTo( this._appendTo() );
		}
		if ( key === "disabled" && value && this.xhr ) {
			this.xhr.abort();
		}
	},

	_isEventTargetInWidget: function( event ) {
		var menuElement = this.menu.element[ 0 ];

		return event.target === this.element[ 0 ] ||
			event.target === menuElement ||
			$.contains( menuElement, event.target );
	},

	_closeOnClickOutside: function( event ) {
		if ( !this._isEventTargetInWidget( event ) ) {
			this.close();
		}
	},

	_appendTo: function() {
		var element = this.options.appendTo;

		if ( element ) {
			element = element.jquery || element.nodeType ?
				$( element ) :
				this.document.find( element ).eq( 0 );
		}

		if ( !element || !element[ 0 ] ) {
			element = this.element.closest( ".ui-front, dialog" );
		}

		if ( !element.length ) {
			element = this.document[ 0 ].body;
		}

		return element;
	},

	_initSource: function() {
		var array, url,
			that = this;
		if ( $.isArray( this.options.source ) ) {
			array = this.options.source;
			this.source = function( request, response ) {
				response( $.ui.autocomplete.filter( array, request.term ) );
			};
		} else if ( typeof this.options.source === "string" ) {
			url = this.options.source;
			this.source = function( request, response ) {
				if ( that.xhr ) {
					that.xhr.abort();
				}
				that.xhr = $.ajax( {
					url: url,
					data: request,
					dataType: "json",
					success: function( data ) {
						response( data );
					},
					error: function() {
						response( [] );
					}
				} );
			};
		} else {
			this.source = this.options.source;
		}
	},

	_searchTimeout: function( event ) {
		clearTimeout( this.searching );
		this.searching = this._delay( function() {

			// Search if the value has changed, or if the user retypes the same value (see #7434)
			var equalValues = this.term === this._value(),
				menuVisible = this.menu.element.is( ":visible" ),
				modifierKey = event.altKey || event.ctrlKey || event.metaKey || event.shiftKey;

			if ( !equalValues || ( equalValues && !menuVisible && !modifierKey ) ) {
				this.selectedItem = null;
				this.search( null, event );
			}
		}, this.options.delay );
	},

	search: function( value, event ) {
		value = value != null ? value : this._value();

		// Always save the actual value, not the one passed as an argument
		this.term = this._value();

		if ( value.length < this.options.minLength ) {
			return this.close( event );
		}

		if ( this._trigger( "search", event ) === false ) {
			return;
		}

		return this._search( value );
	},

	_search: function( value ) {
		this.pending++;
		this._addClass( "ui-autocomplete-loading" );
		this.cancelSearch = false;

		this.source( { term: value }, this._response() );
	},

	_response: function() {
		var index = ++this.requestIndex;

		return $.proxy( function( content ) {
			if ( index === this.requestIndex ) {
				this.__response( content );
			}

			this.pending--;
			if ( !this.pending ) {
				this._removeClass( "ui-autocomplete-loading" );
			}
		}, this );
	},

	__response: function( content ) {
		if ( content ) {
			content = this._normalize( content );
		}
		this._trigger( "response", null, { content: content } );
		if ( !this.options.disabled && content && content.length && !this.cancelSearch ) {
			this._suggest( content );
			this._trigger( "open" );
		} else {

			// use ._close() instead of .close() so we don't cancel future searches
			this._close();
		}
	},

	close: function( event ) {
		this.cancelSearch = true;
		this._close( event );
	},

	_close: function( event ) {

		// Remove the handler that closes the menu on outside clicks
		this._off( this.document, "mousedown" );

		if ( this.menu.element.is( ":visible" ) ) {
			this.menu.element.hide();
			this.menu.blur();
			this.isNewMenu = true;
			this._trigger( "close", event );
		}
	},

	_change: function( event ) {
		if ( this.previous !== this._value() ) {
			this._trigger( "change", event, { item: this.selectedItem } );
		}
	},

	_normalize: function( items ) {

		// assume all items have the right format when the first item is complete
		if ( items.length && items[ 0 ].label && items[ 0 ].value ) {
			return items;
		}
		return $.map( items, function( item ) {
			if ( typeof item === "string" ) {
				return {
					label: item,
					value: item
				};
			}
			return $.extend( {}, item, {
				label: item.label || item.value,
				value: item.value || item.label
			} );
		} );
	},

	_suggest: function( items ) {
		var ul = this.menu.element.empty();
		this._renderMenu( ul, items );
		this.isNewMenu = true;
		this.menu.refresh();

		// Size and position menu
		ul.show();
		this._resizeMenu();
		ul.position( $.extend( {
			of: this.element
		}, this.options.position ) );

		if ( this.options.autoFocus ) {
			this.menu.next();
		}

		// Listen for interactions outside of the widget (#6642)
		this._on( this.document, {
			mousedown: "_closeOnClickOutside"
		} );
	},

	_resizeMenu: function() {
		var ul = this.menu.element;
		ul.outerWidth( Math.max(

			// Firefox wraps long text (possibly a rounding bug)
			// so we add 1px to avoid the wrapping (#7513)
			ul.width( "" ).outerWidth() + 1,
			this.element.outerWidth()
		) );
	},

	_renderMenu: function( ul, items ) {
		var that = this;
		$.each( items, function( index, item ) {
			that._renderItemData( ul, item );
		} );
	},

	_renderItemData: function( ul, item ) {
		return this._renderItem( ul, item ).data( "ui-autocomplete-item", item );
	},

	_renderItem: function( ul, item ) {
		return $( "<li>" )
			.append( $( "<div>" ).text( item.label ) )
			.appendTo( ul );
	},

	_move: function( direction, event ) {
		if ( !this.menu.element.is( ":visible" ) ) {
			this.search( null, event );
			return;
		}
		if ( this.menu.isFirstItem() && /^previous/.test( direction ) ||
				this.menu.isLastItem() && /^next/.test( direction ) ) {

			if ( !this.isMultiLine ) {
				this._value( this.term );
			}

			this.menu.blur();
			return;
		}
		this.menu[ direction ]( event );
	},

	widget: function() {
		return this.menu.element;
	},

	_value: function() {
		return this.valueMethod.apply( this.element, arguments );
	},

	_keyEvent: function( keyEvent, event ) {
		if ( !this.isMultiLine || this.menu.element.is( ":visible" ) ) {
			this._move( keyEvent, event );

			// Prevents moving cursor to beginning/end of the text field in some browsers
			event.preventDefault();
		}
	},

	// Support: Chrome <=50
	// We should be able to just use this.element.prop( "isContentEditable" )
	// but hidden elements always report false in Chrome.
	// https://code.google.com/p/chromium/issues/detail?id=313082
	_isContentEditable: function( element ) {
		if ( !element.length ) {
			return false;
		}

		var editable = element.prop( "contentEditable" );

		if ( editable === "inherit" ) {
		  return this._isContentEditable( element.parent() );
		}

		return editable === "true";
	}
} );

$.extend( $.ui.autocomplete, {
	escapeRegex: function( value ) {
		return value.replace( /[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&" );
	},
	filter: function( array, term ) {
		var matcher = new RegExp( $.ui.autocomplete.escapeRegex( term ), "i" );
		return $.grep( array, function( value ) {
			return matcher.test( value.label || value.value || value );
		} );
	}
} );

// Live region extension, adding a `messages` option
// NOTE: This is an experimental API. We are still investigating
// a full solution for string manipulation and internationalization.
$.widget( "ui.autocomplete", $.ui.autocomplete, {
	options: {
		messages: {
			noResults: "No search results.",
			results: function( amount ) {
				return amount + ( amount > 1 ? " results are" : " result is" ) +
					" available, use up and down arrow keys to navigate.";
			}
		}
	},

	__response: function( content ) {
		var message;
		this._superApply( arguments );
		if ( this.options.disabled || this.cancelSearch ) {
			return;
		}
		if ( content && content.length ) {
			message = this.options.messages.results( content.length );
		} else {
			message = this.options.messages.noResults;
		}
		this.liveRegion.children().hide();
		$( "<div>" ).text( message ).appendTo( this.liveRegion );
	}
} );

return $.ui.autocomplete;

} ) );
/*!
 * jQuery JavaScript Library v1.12.4
 * http://jquery.com/
 *
 * Includes Sizzle.js
 * http://sizzlejs.com/
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license
 * http://jquery.org/license
 *
 * Date: 2016-05-20T17:17Z
 */


(function( global, factory ) {

	if ( typeof module === "object" && typeof module.exports === "object" ) {
		// For CommonJS and CommonJS-like environments where a proper `window`
		// is present, execute the factory and get jQuery.
		// For environments that do not have a `window` with a `document`
		// (such as Node.js), expose a factory as module.exports.
		// This accentuates the need for the creation of a real `window`.
		// e.g. var jQuery = require("jquery")(window);
		// See ticket #14549 for more info.
		module.exports = global.document ?
			factory( global, true ) :
			function( w ) {
				if ( !w.document ) {
					throw new Error( "jQuery requires a window with a document" );
				}
				return factory( w );
			};
	} else {
		factory( global );
	}

// Pass this if window is not defined yet
}(typeof window !== "undefined" ? window : this, function( window, noGlobal ) {

// Support: Firefox 18+
// Can't be in strict mode, several libs including ASP.NET trace
// the stack via arguments.caller.callee and Firefox dies if
// you try to trace through "use strict" call chains. (#13335)
//"use strict";
var deletedIds = [];

var document = window.document;

var slice = deletedIds.slice;

var concat = deletedIds.concat;

var push = deletedIds.push;

var indexOf = deletedIds.indexOf;

var class2type = {};

var toString = class2type.toString;

var hasOwn = class2type.hasOwnProperty;

var support = {};



var
	version = "1.12.4",

	// Define a local copy of jQuery
	jQuery = function( selector, context ) {

		// The jQuery object is actually just the init constructor 'enhanced'
		// Need init if jQuery is called (just allow error to be thrown if not included)
		return new jQuery.fn.init( selector, context );
	},

	// Support: Android<4.1, IE<9
	// Make sure we trim BOM and NBSP
	rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,

	// Matches dashed string for camelizing
	rmsPrefix = /^-ms-/,
	rdashAlpha = /-([\da-z])/gi,

	// Used by jQuery.camelCase as callback to replace()
	fcamelCase = function( all, letter ) {
		return letter.toUpperCase();
	};

jQuery.fn = jQuery.prototype = {

	// The current version of jQuery being used
	jquery: version,

	constructor: jQuery,

	// Start with an empty selector
	selector: "",

	// The default length of a jQuery object is 0
	length: 0,

	toArray: function() {
		return slice.call( this );
	},

	// Get the Nth element in the matched element set OR
	// Get the whole matched element set as a clean array
	get: function( num ) {
		return num != null ?

			// Return just the one element from the set
			( num < 0 ? this[ num + this.length ] : this[ num ] ) :

			// Return all the elements in a clean array
			slice.call( this );
	},

	// Take an array of elements and push it onto the stack
	// (returning the new matched element set)
	pushStack: function( elems ) {

		// Build a new jQuery matched element set
		var ret = jQuery.merge( this.constructor(), elems );

		// Add the old object onto the stack (as a reference)
		ret.prevObject = this;
		ret.context = this.context;

		// Return the newly-formed element set
		return ret;
	},

	// Execute a callback for every element in the matched set.
	each: function( callback ) {
		return jQuery.each( this, callback );
	},

	map: function( callback ) {
		return this.pushStack( jQuery.map( this, function( elem, i ) {
			return callback.call( elem, i, elem );
		} ) );
	},

	slice: function() {
		return this.pushStack( slice.apply( this, arguments ) );
	},

	first: function() {
		return this.eq( 0 );
	},

	last: function() {
		return this.eq( -1 );
	},

	eq: function( i ) {
		var len = this.length,
			j = +i + ( i < 0 ? len : 0 );
		return this.pushStack( j >= 0 && j < len ? [ this[ j ] ] : [] );
	},

	end: function() {
		return this.prevObject || this.constructor();
	},

	// For internal use only.
	// Behaves like an Array's method, not like a jQuery method.
	push: push,
	sort: deletedIds.sort,
	splice: deletedIds.splice
};

jQuery.extend = jQuery.fn.extend = function() {
	var src, copyIsArray, copy, name, options, clone,
		target = arguments[ 0 ] || {},
		i = 1,
		length = arguments.length,
		deep = false;

	// Handle a deep copy situation
	if ( typeof target === "boolean" ) {
		deep = target;

		// skip the boolean and the target
		target = arguments[ i ] || {};
		i++;
	}

	// Handle case when target is a string or something (possible in deep copy)
	if ( typeof target !== "object" && !jQuery.isFunction( target ) ) {
		target = {};
	}

	// extend jQuery itself if only one argument is passed
	if ( i === length ) {
		target = this;
		i--;
	}

	for ( ; i < length; i++ ) {

		// Only deal with non-null/undefined values
		if ( ( options = arguments[ i ] ) != null ) {

			// Extend the base object
			for ( name in options ) {
				src = target[ name ];
				copy = options[ name ];

				// Prevent never-ending loop
				if ( target === copy ) {
					continue;
				}

				// Recurse if we're merging plain objects or arrays
				if ( deep && copy && ( jQuery.isPlainObject( copy ) ||
					( copyIsArray = jQuery.isArray( copy ) ) ) ) {

					if ( copyIsArray ) {
						copyIsArray = false;
						clone = src && jQuery.isArray( src ) ? src : [];

					} else {
						clone = src && jQuery.isPlainObject( src ) ? src : {};
					}

					// Never move original objects, clone them
					target[ name ] = jQuery.extend( deep, clone, copy );

				// Don't bring in undefined values
				} else if ( copy !== undefined ) {
					target[ name ] = copy;
				}
			}
		}
	}

	// Return the modified object
	return target;
};

jQuery.extend( {

	// Unique for each copy of jQuery on the page
	expando: "jQuery" + ( version + Math.random() ).replace( /\D/g, "" ),

	// Assume jQuery is ready without the ready module
	isReady: true,

	error: function( msg ) {
		throw new Error( msg );
	},

	noop: function() {},

	// See test/unit/core.js for details concerning isFunction.
	// Since version 1.3, DOM methods and functions like alert
	// aren't supported. They return false on IE (#2968).
	isFunction: function( obj ) {
		return jQuery.type( obj ) === "function";
	},

	isArray: Array.isArray || function( obj ) {
		return jQuery.type( obj ) === "array";
	},

	isWindow: function( obj ) {
		/* jshint eqeqeq: false */
		return obj != null && obj == obj.window;
	},

	isNumeric: function( obj ) {

		// parseFloat NaNs numeric-cast false positives (null|true|false|"")
		// ...but misinterprets leading-number strings, particularly hex literals ("0x...")
		// subtraction forces infinities to NaN
		// adding 1 corrects loss of precision from parseFloat (#15100)
		var realStringObj = obj && obj.toString();
		return !jQuery.isArray( obj ) && ( realStringObj - parseFloat( realStringObj ) + 1 ) >= 0;
	},

	isEmptyObject: function( obj ) {
		var name;
		for ( name in obj ) {
			return false;
		}
		return true;
	},

	isPlainObject: function( obj ) {
		var key;

		// Must be an Object.
		// Because of IE, we also have to check the presence of the constructor property.
		// Make sure that DOM nodes and window objects don't pass through, as well
		if ( !obj || jQuery.type( obj ) !== "object" || obj.nodeType || jQuery.isWindow( obj ) ) {
			return false;
		}

		try {

			// Not own constructor property must be Object
			if ( obj.constructor &&
				!hasOwn.call( obj, "constructor" ) &&
				!hasOwn.call( obj.constructor.prototype, "isPrototypeOf" ) ) {
				return false;
			}
		} catch ( e ) {

			// IE8,9 Will throw exceptions on certain host objects #9897
			return false;
		}

		// Support: IE<9
		// Handle iteration over inherited properties before own properties.
		if ( !support.ownFirst ) {
			for ( key in obj ) {
				return hasOwn.call( obj, key );
			}
		}

		// Own properties are enumerated firstly, so to speed up,
		// if last one is own, then all properties are own.
		for ( key in obj ) {}

		return key === undefined || hasOwn.call( obj, key );
	},

	type: function( obj ) {
		if ( obj == null ) {
			return obj + "";
		}
		return typeof obj === "object" || typeof obj === "function" ?
			class2type[ toString.call( obj ) ] || "object" :
			typeof obj;
	},

	// Workarounds based on findings by Jim Driscoll
	// http://weblogs.java.net/blog/driscoll/archive/2009/09/08/eval-javascript-global-context
	globalEval: function( data ) {
		if ( data && jQuery.trim( data ) ) {

			// We use execScript on Internet Explorer
			// We use an anonymous function so that context is window
			// rather than jQuery in Firefox
			( window.execScript || function( data ) {
				window[ "eval" ].call( window, data ); // jscs:ignore requireDotNotation
			} )( data );
		}
	},

	// Convert dashed to camelCase; used by the css and data modules
	// Microsoft forgot to hump their vendor prefix (#9572)
	camelCase: function( string ) {
		return string.replace( rmsPrefix, "ms-" ).replace( rdashAlpha, fcamelCase );
	},

	nodeName: function( elem, name ) {
		return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase();
	},

	each: function( obj, callback ) {
		var length, i = 0;

		if ( isArrayLike( obj ) ) {
			length = obj.length;
			for ( ; i < length; i++ ) {
				if ( callback.call( obj[ i ], i, obj[ i ] ) === false ) {
					break;
				}
			}
		} else {
			for ( i in obj ) {
				if ( callback.call( obj[ i ], i, obj[ i ] ) === false ) {
					break;
				}
			}
		}

		return obj;
	},

	// Support: Android<4.1, IE<9
	trim: function( text ) {
		return text == null ?
			"" :
			( text + "" ).replace( rtrim, "" );
	},

	// results is for internal usage only
	makeArray: function( arr, results ) {
		var ret = results || [];

		if ( arr != null ) {
			if ( isArrayLike( Object( arr ) ) ) {
				jQuery.merge( ret,
					typeof arr === "string" ?
					[ arr ] : arr
				);
			} else {
				push.call( ret, arr );
			}
		}

		return ret;
	},

	inArray: function( elem, arr, i ) {
		var len;

		if ( arr ) {
			if ( indexOf ) {
				return indexOf.call( arr, elem, i );
			}

			len = arr.length;
			i = i ? i < 0 ? Math.max( 0, len + i ) : i : 0;

			for ( ; i < len; i++ ) {

				// Skip accessing in sparse arrays
				if ( i in arr && arr[ i ] === elem ) {
					return i;
				}
			}
		}

		return -1;
	},

	merge: function( first, second ) {
		var len = +second.length,
			j = 0,
			i = first.length;

		while ( j < len ) {
			first[ i++ ] = second[ j++ ];
		}

		// Support: IE<9
		// Workaround casting of .length to NaN on otherwise arraylike objects (e.g., NodeLists)
		if ( len !== len ) {
			while ( second[ j ] !== undefined ) {
				first[ i++ ] = second[ j++ ];
			}
		}

		first.length = i;

		return first;
	},

	grep: function( elems, callback, invert ) {
		var callbackInverse,
			matches = [],
			i = 0,
			length = elems.length,
			callbackExpect = !invert;

		// Go through the array, only saving the items
		// that pass the validator function
		for ( ; i < length; i++ ) {
			callbackInverse = !callback( elems[ i ], i );
			if ( callbackInverse !== callbackExpect ) {
				matches.push( elems[ i ] );
			}
		}

		return matches;
	},

	// arg is for internal usage only
	map: function( elems, callback, arg ) {
		var length, value,
			i = 0,
			ret = [];

		// Go through the array, translating each of the items to their new values
		if ( isArrayLike( elems ) ) {
			length = elems.length;
			for ( ; i < length; i++ ) {
				value = callback( elems[ i ], i, arg );

				if ( value != null ) {
					ret.push( value );
				}
			}

		// Go through every key on the object,
		} else {
			for ( i in elems ) {
				value = callback( elems[ i ], i, arg );

				if ( value != null ) {
					ret.push( value );
				}
			}
		}

		// Flatten any nested arrays
		return concat.apply( [], ret );
	},

	// A global GUID counter for objects
	guid: 1,

	// Bind a function to a context, optionally partially applying any
	// arguments.
	proxy: function( fn, context ) {
		var args, proxy, tmp;

		if ( typeof context === "string" ) {
			tmp = fn[ context ];
			context = fn;
			fn = tmp;
		}

		// Quick check to determine if target is callable, in the spec
		// this throws a TypeError, but we will just return undefined.
		if ( !jQuery.isFunction( fn ) ) {
			return undefined;
		}

		// Simulated bind
		args = slice.call( arguments, 2 );
		proxy = function() {
			return fn.apply( context || this, args.concat( slice.call( arguments ) ) );
		};

		// Set the guid of unique handler to the same of original handler, so it can be removed
		proxy.guid = fn.guid = fn.guid || jQuery.guid++;

		return proxy;
	},

	now: function() {
		return +( new Date() );
	},

	// jQuery.support is not used in Core but other projects attach their
	// properties to it so it needs to exist.
	support: support
} );

// JSHint would error on this code due to the Symbol not being defined in ES5.
// Defining this global in .jshintrc would create a danger of using the global
// unguarded in another place, it seems safer to just disable JSHint for these
// three lines.
/* jshint ignore: start */
if ( typeof Symbol === "function" ) {
	jQuery.fn[ Symbol.iterator ] = deletedIds[ Symbol.iterator ];
}
/* jshint ignore: end */

// Populate the class2type map
jQuery.each( "Boolean Number String Function Array Date RegExp Object Error Symbol".split( " " ),
function( i, name ) {
	class2type[ "[object " + name + "]" ] = name.toLowerCase();
} );

function isArrayLike( obj ) {

	// Support: iOS 8.2 (not reproducible in simulator)
	// `in` check used to prevent JIT error (gh-2145)
	// hasOwn isn't used here due to false negatives
	// regarding Nodelist length in IE
	var length = !!obj && "length" in obj && obj.length,
		type = jQuery.type( obj );

	if ( type === "function" || jQuery.isWindow( obj ) ) {
		return false;
	}

	return type === "array" || length === 0 ||
		typeof length === "number" && length > 0 && ( length - 1 ) in obj;
}
var Sizzle =
/*!
 * Sizzle CSS Selector Engine v2.2.1
 * http://sizzlejs.com/
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license
 * http://jquery.org/license
 *
 * Date: 2015-10-17
 */
(function( window ) {

var i,
	support,
	Expr,
	getText,
	isXML,
	tokenize,
	compile,
	select,
	outermostContext,
	sortInput,
	hasDuplicate,

	// Local document vars
	setDocument,
	document,
	docElem,
	documentIsHTML,
	rbuggyQSA,
	rbuggyMatches,
	matches,
	contains,

	// Instance-specific data
	expando = "sizzle" + 1 * new Date(),
	preferredDoc = window.document,
	dirruns = 0,
	done = 0,
	classCache = createCache(),
	tokenCache = createCache(),
	compilerCache = createCache(),
	sortOrder = function( a, b ) {
		if ( a === b ) {
			hasDuplicate = true;
		}
		return 0;
	},

	// General-purpose constants
	MAX_NEGATIVE = 1 << 31,

	// Instance methods
	hasOwn = ({}).hasOwnProperty,
	arr = [],
	pop = arr.pop,
	push_native = arr.push,
	push = arr.push,
	slice = arr.slice,
	// Use a stripped-down indexOf as it's faster than native
	// http://jsperf.com/thor-indexof-vs-for/5
	indexOf = function( list, elem ) {
		var i = 0,
			len = list.length;
		for ( ; i < len; i++ ) {
			if ( list[i] === elem ) {
				return i;
			}
		}
		return -1;
	},

	booleans = "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",

	// Regular expressions

	// http://www.w3.org/TR/css3-selectors/#whitespace
	whitespace = "[\\x20\\t\\r\\n\\f]",

	// http://www.w3.org/TR/CSS21/syndata.html#value-def-identifier
	identifier = "(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+",

	// Attribute selectors: http://www.w3.org/TR/selectors/#attribute-selectors
	attributes = "\\[" + whitespace + "*(" + identifier + ")(?:" + whitespace +
		// Operator (capture 2)
		"*([*^$|!~]?=)" + whitespace +
		// "Attribute values must be CSS identifiers [capture 5] or strings [capture 3 or capture 4]"
		"*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|(" + identifier + "))|)" + whitespace +
		"*\\]",

	pseudos = ":(" + identifier + ")(?:\\((" +
		// To reduce the number of selectors needing tokenize in the preFilter, prefer arguments:
		// 1. quoted (capture 3; capture 4 or capture 5)
		"('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|" +
		// 2. simple (capture 6)
		"((?:\\\\.|[^\\\\()[\\]]|" + attributes + ")*)|" +
		// 3. anything else (capture 2)
		".*" +
		")\\)|)",

	// Leading and non-escaped trailing whitespace, capturing some non-whitespace characters preceding the latter
	rwhitespace = new RegExp( whitespace + "+", "g" ),
	rtrim = new RegExp( "^" + whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" + whitespace + "+$", "g" ),

	rcomma = new RegExp( "^" + whitespace + "*," + whitespace + "*" ),
	rcombinators = new RegExp( "^" + whitespace + "*([>+~]|" + whitespace + ")" + whitespace + "*" ),

	rattributeQuotes = new RegExp( "=" + whitespace + "*([^\\]'\"]*?)" + whitespace + "*\\]", "g" ),

	rpseudo = new RegExp( pseudos ),
	ridentifier = new RegExp( "^" + identifier + "$" ),

	matchExpr = {
		"ID": new RegExp( "^#(" + identifier + ")" ),
		"CLASS": new RegExp( "^\\.(" + identifier + ")" ),
		"TAG": new RegExp( "^(" + identifier + "|[*])" ),
		"ATTR": new RegExp( "^" + attributes ),
		"PSEUDO": new RegExp( "^" + pseudos ),
		"CHILD": new RegExp( "^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" + whitespace +
			"*(even|odd|(([+-]|)(\\d*)n|)" + whitespace + "*(?:([+-]|)" + whitespace +
			"*(\\d+)|))" + whitespace + "*\\)|)", "i" ),
		"bool": new RegExp( "^(?:" + booleans + ")$", "i" ),
		// For use in libraries implementing .is()
		// We use this for POS matching in `select`
		"needsContext": new RegExp( "^" + whitespace + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" +
			whitespace + "*((?:-\\d)?\\d*)" + whitespace + "*\\)|)(?=[^-]|$)", "i" )
	},

	rinputs = /^(?:input|select|textarea|button)$/i,
	rheader = /^h\d$/i,

	rnative = /^[^{]+\{\s*\[native \w/,

	// Easily-parseable/retrievable ID or TAG or CLASS selectors
	rquickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,

	rsibling = /[+~]/,
	rescape = /'|\\/g,

	// CSS escapes http://www.w3.org/TR/CSS21/syndata.html#escaped-characters
	runescape = new RegExp( "\\\\([\\da-f]{1,6}" + whitespace + "?|(" + whitespace + ")|.)", "ig" ),
	funescape = function( _, escaped, escapedWhitespace ) {
		var high = "0x" + escaped - 0x10000;
		// NaN means non-codepoint
		// Support: Firefox<24
		// Workaround erroneous numeric interpretation of +"0x"
		return high !== high || escapedWhitespace ?
			escaped :
			high < 0 ?
				// BMP codepoint
				String.fromCharCode( high + 0x10000 ) :
				// Supplemental Plane codepoint (surrogate pair)
				String.fromCharCode( high >> 10 | 0xD800, high & 0x3FF | 0xDC00 );
	},

	// Used for iframes
	// See setDocument()
	// Removing the function wrapper causes a "Permission Denied"
	// error in IE
	unloadHandler = function() {
		setDocument();
	};

// Optimize for push.apply( _, NodeList )
try {
	push.apply(
		(arr = slice.call( preferredDoc.childNodes )),
		preferredDoc.childNodes
	);
	// Support: Android<4.0
	// Detect silently failing push.apply
	arr[ preferredDoc.childNodes.length ].nodeType;
} catch ( e ) {
	push = { apply: arr.length ?

		// Leverage slice if possible
		function( target, els ) {
			push_native.apply( target, slice.call(els) );
		} :

		// Support: IE<9
		// Otherwise append directly
		function( target, els ) {
			var j = target.length,
				i = 0;
			// Can't trust NodeList.length
			while ( (target[j++] = els[i++]) ) {}
			target.length = j - 1;
		}
	};
}

function Sizzle( selector, context, results, seed ) {
	var m, i, elem, nid, nidselect, match, groups, newSelector,
		newContext = context && context.ownerDocument,

		// nodeType defaults to 9, since context defaults to document
		nodeType = context ? context.nodeType : 9;

	results = results || [];

	// Return early from calls with invalid selector or context
	if ( typeof selector !== "string" || !selector ||
		nodeType !== 1 && nodeType !== 9 && nodeType !== 11 ) {

		return results;
	}

	// Try to shortcut find operations (as opposed to filters) in HTML documents
	if ( !seed ) {

		if ( ( context ? context.ownerDocument || context : preferredDoc ) !== document ) {
			setDocument( context );
		}
		context = context || document;

		if ( documentIsHTML ) {

			// If the selector is sufficiently simple, try using a "get*By*" DOM method
			// (excepting DocumentFragment context, where the methods don't exist)
			if ( nodeType !== 11 && (match = rquickExpr.exec( selector )) ) {

				// ID selector
				if ( (m = match[1]) ) {

					// Document context
					if ( nodeType === 9 ) {
						if ( (elem = context.getElementById( m )) ) {

							// Support: IE, Opera, Webkit
							// TODO: identify versions
							// getElementById can match elements by name instead of ID
							if ( elem.id === m ) {
								results.push( elem );
								return results;
							}
						} else {
							return results;
						}

					// Element context
					} else {

						// Support: IE, Opera, Webkit
						// TODO: identify versions
						// getElementById can match elements by name instead of ID
						if ( newContext && (elem = newContext.getElementById( m )) &&
							contains( context, elem ) &&
							elem.id === m ) {

							results.push( elem );
							return results;
						}
					}

				// Type selector
				} else if ( match[2] ) {
					push.apply( results, context.getElementsByTagName( selector ) );
					return results;

				// Class selector
				} else if ( (m = match[3]) && support.getElementsByClassName &&
					context.getElementsByClassName ) {

					push.apply( results, context.getElementsByClassName( m ) );
					return results;
				}
			}

			// Take advantage of querySelectorAll
			if ( support.qsa &&
				!compilerCache[ selector + " " ] &&
				(!rbuggyQSA || !rbuggyQSA.test( selector )) ) {

				if ( nodeType !== 1 ) {
					newContext = context;
					newSelector = selector;

				// qSA looks outside Element context, which is not what we want
				// Thanks to Andrew Dupont for this workaround technique
				// Support: IE <=8
				// Exclude object elements
				} else if ( context.nodeName.toLowerCase() !== "object" ) {

					// Capture the context ID, setting it first if necessary
					if ( (nid = context.getAttribute( "id" )) ) {
						nid = nid.replace( rescape, "\\$&" );
					} else {
						context.setAttribute( "id", (nid = expando) );
					}

					// Prefix every selector in the list
					groups = tokenize( selector );
					i = groups.length;
					nidselect = ridentifier.test( nid ) ? "#" + nid : "[id='" + nid + "']";
					while ( i-- ) {
						groups[i] = nidselect + " " + toSelector( groups[i] );
					}
					newSelector = groups.join( "," );

					// Expand context for sibling selectors
					newContext = rsibling.test( selector ) && testContext( context.parentNode ) ||
						context;
				}

				if ( newSelector ) {
					try {
						push.apply( results,
							newContext.querySelectorAll( newSelector )
						);
						return results;
					} catch ( qsaError ) {
					} finally {
						if ( nid === expando ) {
							context.removeAttribute( "id" );
						}
					}
				}
			}
		}
	}

	// All others
	return select( selector.replace( rtrim, "$1" ), context, results, seed );
}

/**
 * Create key-value caches of limited size
 * @returns {function(string, object)} Returns the Object data after storing it on itself with
 *	property name the (space-suffixed) string and (if the cache is larger than Expr.cacheLength)
 *	deleting the oldest entry
 */
function createCache() {
	var keys = [];

	function cache( key, value ) {
		// Use (key + " ") to avoid collision with native prototype properties (see Issue #157)
		if ( keys.push( key + " " ) > Expr.cacheLength ) {
			// Only keep the most recent entries
			delete cache[ keys.shift() ];
		}
		return (cache[ key + " " ] = value);
	}
	return cache;
}

/**
 * Mark a function for special use by Sizzle
 * @param {Function} fn The function to mark
 */
function markFunction( fn ) {
	fn[ expando ] = true;
	return fn;
}

/**
 * Support testing using an element
 * @param {Function} fn Passed the created div and expects a boolean result
 */
function assert( fn ) {
	var div = document.createElement("div");

	try {
		return !!fn( div );
	} catch (e) {
		return false;
	} finally {
		// Remove from its parent by default
		if ( div.parentNode ) {
			div.parentNode.removeChild( div );
		}
		// release memory in IE
		div = null;
	}
}

/**
 * Adds the same handler for all of the specified attrs
 * @param {String} attrs Pipe-separated list of attributes
 * @param {Function} handler The method that will be applied
 */
function addHandle( attrs, handler ) {
	var arr = attrs.split("|"),
		i = arr.length;

	while ( i-- ) {
		Expr.attrHandle[ arr[i] ] = handler;
	}
}

/**
 * Checks document order of two siblings
 * @param {Element} a
 * @param {Element} b
 * @returns {Number} Returns less than 0 if a precedes b, greater than 0 if a follows b
 */
function siblingCheck( a, b ) {
	var cur = b && a,
		diff = cur && a.nodeType === 1 && b.nodeType === 1 &&
			( ~b.sourceIndex || MAX_NEGATIVE ) -
			( ~a.sourceIndex || MAX_NEGATIVE );

	// Use IE sourceIndex if available on both nodes
	if ( diff ) {
		return diff;
	}

	// Check if b follows a
	if ( cur ) {
		while ( (cur = cur.nextSibling) ) {
			if ( cur === b ) {
				return -1;
			}
		}
	}

	return a ? 1 : -1;
}

/**
 * Returns a function to use in pseudos for input types
 * @param {String} type
 */
function createInputPseudo( type ) {
	return function( elem ) {
		var name = elem.nodeName.toLowerCase();
		return name === "input" && elem.type === type;
	};
}

/**
 * Returns a function to use in pseudos for buttons
 * @param {String} type
 */
function createButtonPseudo( type ) {
	return function( elem ) {
		var name = elem.nodeName.toLowerCase();
		return (name === "input" || name === "button") && elem.type === type;
	};
}

/**
 * Returns a function to use in pseudos for positionals
 * @param {Function} fn
 */
function createPositionalPseudo( fn ) {
	return markFunction(function( argument ) {
		argument = +argument;
		return markFunction(function( seed, matches ) {
			var j,
				matchIndexes = fn( [], seed.length, argument ),
				i = matchIndexes.length;

			// Match elements found at the specified indexes
			while ( i-- ) {
				if ( seed[ (j = matchIndexes[i]) ] ) {
					seed[j] = !(matches[j] = seed[j]);
				}
			}
		});
	});
}

/**
 * Checks a node for validity as a Sizzle context
 * @param {Element|Object=} context
 * @returns {Element|Object|Boolean} The input node if acceptable, otherwise a falsy value
 */
function testContext( context ) {
	return context && typeof context.getElementsByTagName !== "undefined" && context;
}

// Expose support vars for convenience
support = Sizzle.support = {};

/**
 * Detects XML nodes
 * @param {Element|Object} elem An element or a document
 * @returns {Boolean} True iff elem is a non-HTML XML node
 */
isXML = Sizzle.isXML = function( elem ) {
	// documentElement is verified for cases where it doesn't yet exist
	// (such as loading iframes in IE - #4833)
	var documentElement = elem && (elem.ownerDocument || elem).documentElement;
	return documentElement ? documentElement.nodeName !== "HTML" : false;
};

/**
 * Sets document-related variables once based on the current document
 * @param {Element|Object} [doc] An element or document object to use to set the document
 * @returns {Object} Returns the current document
 */
setDocument = Sizzle.setDocument = function( node ) {
	var hasCompare, parent,
		doc = node ? node.ownerDocument || node : preferredDoc;

	// Return early if doc is invalid or already selected
	if ( doc === document || doc.nodeType !== 9 || !doc.documentElement ) {
		return document;
	}

	// Update global variables
	document = doc;
	docElem = document.documentElement;
	documentIsHTML = !isXML( document );

	// Support: IE 9-11, Edge
	// Accessing iframe documents after unload throws "permission denied" errors (jQuery #13936)
	if ( (parent = document.defaultView) && parent.top !== parent ) {
		// Support: IE 11
		if ( parent.addEventListener ) {
			parent.addEventListener( "unload", unloadHandler, false );

		// Support: IE 9 - 10 only
		} else if ( parent.attachEvent ) {
			parent.attachEvent( "onunload", unloadHandler );
		}
	}

	/* Attributes
	---------------------------------------------------------------------- */

	// Support: IE<8
	// Verify that getAttribute really returns attributes and not properties
	// (excepting IE8 booleans)
	support.attributes = assert(function( div ) {
		div.className = "i";
		return !div.getAttribute("className");
	});

	/* getElement(s)By*
	---------------------------------------------------------------------- */

	// Check if getElementsByTagName("*") returns only elements
	support.getElementsByTagName = assert(function( div ) {
		div.appendChild( document.createComment("") );
		return !div.getElementsByTagName("*").length;
	});

	// Support: IE<9
	support.getElementsByClassName = rnative.test( document.getElementsByClassName );

	// Support: IE<10
	// Check if getElementById returns elements by name
	// The broken getElementById methods don't pick up programatically-set names,
	// so use a roundabout getElementsByName test
	support.getById = assert(function( div ) {
		docElem.appendChild( div ).id = expando;
		return !document.getElementsByName || !document.getElementsByName( expando ).length;
	});

	// ID find and filter
	if ( support.getById ) {
		Expr.find["ID"] = function( id, context ) {
			if ( typeof context.getElementById !== "undefined" && documentIsHTML ) {
				var m = context.getElementById( id );
				return m ? [ m ] : [];
			}
		};
		Expr.filter["ID"] = function( id ) {
			var attrId = id.replace( runescape, funescape );
			return function( elem ) {
				return elem.getAttribute("id") === attrId;
			};
		};
	} else {
		// Support: IE6/7
		// getElementById is not reliable as a find shortcut
		delete Expr.find["ID"];

		Expr.filter["ID"] =  function( id ) {
			var attrId = id.replace( runescape, funescape );
			return function( elem ) {
				var node = typeof elem.getAttributeNode !== "undefined" &&
					elem.getAttributeNode("id");
				return node && node.value === attrId;
			};
		};
	}

	// Tag
	Expr.find["TAG"] = support.getElementsByTagName ?
		function( tag, context ) {
			if ( typeof context.getElementsByTagName !== "undefined" ) {
				return context.getElementsByTagName( tag );

			// DocumentFragment nodes don't have gEBTN
			} else if ( support.qsa ) {
				return context.querySelectorAll( tag );
			}
		} :

		function( tag, context ) {
			var elem,
				tmp = [],
				i = 0,
				// By happy coincidence, a (broken) gEBTN appears on DocumentFragment nodes too
				results = context.getElementsByTagName( tag );

			// Filter out possible comments
			if ( tag === "*" ) {
				while ( (elem = results[i++]) ) {
					if ( elem.nodeType === 1 ) {
						tmp.push( elem );
					}
				}

				return tmp;
			}
			return results;
		};

	// Class
	Expr.find["CLASS"] = support.getElementsByClassName && function( className, context ) {
		if ( typeof context.getElementsByClassName !== "undefined" && documentIsHTML ) {
			return context.getElementsByClassName( className );
		}
	};

	/* QSA/matchesSelector
	---------------------------------------------------------------------- */

	// QSA and matchesSelector support

	// matchesSelector(:active) reports false when true (IE9/Opera 11.5)
	rbuggyMatches = [];

	// qSa(:focus) reports false when true (Chrome 21)
	// We allow this because of a bug in IE8/9 that throws an error
	// whenever `document.activeElement` is accessed on an iframe
	// So, we allow :focus to pass through QSA all the time to avoid the IE error
	// See http://bugs.jquery.com/ticket/13378
	rbuggyQSA = [];

	if ( (support.qsa = rnative.test( document.querySelectorAll )) ) {
		// Build QSA regex
		// Regex strategy adopted from Diego Perini
		assert(function( div ) {
			// Select is set to empty string on purpose
			// This is to test IE's treatment of not explicitly
			// setting a boolean content attribute,
			// since its presence should be enough
			// http://bugs.jquery.com/ticket/12359
			docElem.appendChild( div ).innerHTML = "<a id='" + expando + "'></a>" +
				"<select id='" + expando + "-\r\\' msallowcapture=''>" +
				"<option selected=''></option></select>";

			// Support: IE8, Opera 11-12.16
			// Nothing should be selected when empty strings follow ^= or $= or *=
			// The test attribute must be unknown in Opera but "safe" for WinRT
			// http://msdn.microsoft.com/en-us/library/ie/hh465388.aspx#attribute_section
			if ( div.querySelectorAll("[msallowcapture^='']").length ) {
				rbuggyQSA.push( "[*^$]=" + whitespace + "*(?:''|\"\")" );
			}

			// Support: IE8
			// Boolean attributes and "value" are not treated correctly
			if ( !div.querySelectorAll("[selected]").length ) {
				rbuggyQSA.push( "\\[" + whitespace + "*(?:value|" + booleans + ")" );
			}

			// Support: Chrome<29, Android<4.4, Safari<7.0+, iOS<7.0+, PhantomJS<1.9.8+
			if ( !div.querySelectorAll( "[id~=" + expando + "-]" ).length ) {
				rbuggyQSA.push("~=");
			}

			// Webkit/Opera - :checked should return selected option elements
			// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
			// IE8 throws error here and will not see later tests
			if ( !div.querySelectorAll(":checked").length ) {
				rbuggyQSA.push(":checked");
			}

			// Support: Safari 8+, iOS 8+
			// https://bugs.webkit.org/show_bug.cgi?id=136851
			// In-page `selector#id sibing-combinator selector` fails
			if ( !div.querySelectorAll( "a#" + expando + "+*" ).length ) {
				rbuggyQSA.push(".#.+[+~]");
			}
		});

		assert(function( div ) {
			// Support: Windows 8 Native Apps
			// The type and name attributes are restricted during .innerHTML assignment
			var input = document.createElement("input");
			input.setAttribute( "type", "hidden" );
			div.appendChild( input ).setAttribute( "name", "D" );

			// Support: IE8
			// Enforce case-sensitivity of name attribute
			if ( div.querySelectorAll("[name=d]").length ) {
				rbuggyQSA.push( "name" + whitespace + "*[*^$|!~]?=" );
			}

			// FF 3.5 - :enabled/:disabled and hidden elements (hidden elements are still enabled)
			// IE8 throws error here and will not see later tests
			if ( !div.querySelectorAll(":enabled").length ) {
				rbuggyQSA.push( ":enabled", ":disabled" );
			}

			// Opera 10-11 does not throw on post-comma invalid pseudos
			div.querySelectorAll("*,:x");
			rbuggyQSA.push(",.*:");
		});
	}

	if ( (support.matchesSelector = rnative.test( (matches = docElem.matches ||
		docElem.webkitMatchesSelector ||
		docElem.mozMatchesSelector ||
		docElem.oMatchesSelector ||
		docElem.msMatchesSelector) )) ) {

		assert(function( div ) {
			// Check to see if it's possible to do matchesSelector
			// on a disconnected node (IE 9)
			support.disconnectedMatch = matches.call( div, "div" );

			// This should fail with an exception
			// Gecko does not error, returns false instead
			matches.call( div, "[s!='']:x" );
			rbuggyMatches.push( "!=", pseudos );
		});
	}

	rbuggyQSA = rbuggyQSA.length && new RegExp( rbuggyQSA.join("|") );
	rbuggyMatches = rbuggyMatches.length && new RegExp( rbuggyMatches.join("|") );

	/* Contains
	---------------------------------------------------------------------- */
	hasCompare = rnative.test( docElem.compareDocumentPosition );

	// Element contains another
	// Purposefully self-exclusive
	// As in, an element does not contain itself
	contains = hasCompare || rnative.test( docElem.contains ) ?
		function( a, b ) {
			var adown = a.nodeType === 9 ? a.documentElement : a,
				bup = b && b.parentNode;
			return a === bup || !!( bup && bup.nodeType === 1 && (
				adown.contains ?
					adown.contains( bup ) :
					a.compareDocumentPosition && a.compareDocumentPosition( bup ) & 16
			));
		} :
		function( a, b ) {
			if ( b ) {
				while ( (b = b.parentNode) ) {
					if ( b === a ) {
						return true;
					}
				}
			}
			return false;
		};

	/* Sorting
	---------------------------------------------------------------------- */

	// Document order sorting
	sortOrder = hasCompare ?
	function( a, b ) {

		// Flag for duplicate removal
		if ( a === b ) {
			hasDuplicate = true;
			return 0;
		}

		// Sort on method existence if only one input has compareDocumentPosition
		var compare = !a.compareDocumentPosition - !b.compareDocumentPosition;
		if ( compare ) {
			return compare;
		}

		// Calculate position if both inputs belong to the same document
		compare = ( a.ownerDocument || a ) === ( b.ownerDocument || b ) ?
			a.compareDocumentPosition( b ) :

			// Otherwise we know they are disconnected
			1;

		// Disconnected nodes
		if ( compare & 1 ||
			(!support.sortDetached && b.compareDocumentPosition( a ) === compare) ) {

			// Choose the first element that is related to our preferred document
			if ( a === document || a.ownerDocument === preferredDoc && contains(preferredDoc, a) ) {
				return -1;
			}
			if ( b === document || b.ownerDocument === preferredDoc && contains(preferredDoc, b) ) {
				return 1;
			}

			// Maintain original order
			return sortInput ?
				( indexOf( sortInput, a ) - indexOf( sortInput, b ) ) :
				0;
		}

		return compare & 4 ? -1 : 1;
	} :
	function( a, b ) {
		// Exit early if the nodes are identical
		if ( a === b ) {
			hasDuplicate = true;
			return 0;
		}

		var cur,
			i = 0,
			aup = a.parentNode,
			bup = b.parentNode,
			ap = [ a ],
			bp = [ b ];

		// Parentless nodes are either documents or disconnected
		if ( !aup || !bup ) {
			return a === document ? -1 :
				b === document ? 1 :
				aup ? -1 :
				bup ? 1 :
				sortInput ?
				( indexOf( sortInput, a ) - indexOf( sortInput, b ) ) :
				0;

		// If the nodes are siblings, we can do a quick check
		} else if ( aup === bup ) {
			return siblingCheck( a, b );
		}

		// Otherwise we need full lists of their ancestors for comparison
		cur = a;
		while ( (cur = cur.parentNode) ) {
			ap.unshift( cur );
		}
		cur = b;
		while ( (cur = cur.parentNode) ) {
			bp.unshift( cur );
		}

		// Walk down the tree looking for a discrepancy
		while ( ap[i] === bp[i] ) {
			i++;
		}

		return i ?
			// Do a sibling check if the nodes have a common ancestor
			siblingCheck( ap[i], bp[i] ) :

			// Otherwise nodes in our document sort first
			ap[i] === preferredDoc ? -1 :
			bp[i] === preferredDoc ? 1 :
			0;
	};

	return document;
};

Sizzle.matches = function( expr, elements ) {
	return Sizzle( expr, null, null, elements );
};

Sizzle.matchesSelector = function( elem, expr ) {
	// Set document vars if needed
	if ( ( elem.ownerDocument || elem ) !== document ) {
		setDocument( elem );
	}

	// Make sure that attribute selectors are quoted
	expr = expr.replace( rattributeQuotes, "='$1']" );

	if ( support.matchesSelector && documentIsHTML &&
		!compilerCache[ expr + " " ] &&
		( !rbuggyMatches || !rbuggyMatches.test( expr ) ) &&
		( !rbuggyQSA     || !rbuggyQSA.test( expr ) ) ) {

		try {
			var ret = matches.call( elem, expr );

			// IE 9's matchesSelector returns false on disconnected nodes
			if ( ret || support.disconnectedMatch ||
					// As well, disconnected nodes are said to be in a document
					// fragment in IE 9
					elem.document && elem.document.nodeType !== 11 ) {
				return ret;
			}
		} catch (e) {}
	}

	return Sizzle( expr, document, null, [ elem ] ).length > 0;
};

Sizzle.contains = function( context, elem ) {
	// Set document vars if needed
	if ( ( context.ownerDocument || context ) !== document ) {
		setDocument( context );
	}
	return contains( context, elem );
};

Sizzle.attr = function( elem, name ) {
	// Set document vars if needed
	if ( ( elem.ownerDocument || elem ) !== document ) {
		setDocument( elem );
	}

	var fn = Expr.attrHandle[ name.toLowerCase() ],
		// Don't get fooled by Object.prototype properties (jQuery #13807)
		val = fn && hasOwn.call( Expr.attrHandle, name.toLowerCase() ) ?
			fn( elem, name, !documentIsHTML ) :
			undefined;

	return val !== undefined ?
		val :
		support.attributes || !documentIsHTML ?
			elem.getAttribute( name ) :
			(val = elem.getAttributeNode(name)) && val.specified ?
				val.value :
				null;
};

Sizzle.error = function( msg ) {
	throw new Error( "Syntax error, unrecognized expression: " + msg );
};

/**
 * Document sorting and removing duplicates
 * @param {ArrayLike} results
 */
Sizzle.uniqueSort = function( results ) {
	var elem,
		duplicates = [],
		j = 0,
		i = 0;

	// Unless we *know* we can detect duplicates, assume their presence
	hasDuplicate = !support.detectDuplicates;
	sortInput = !support.sortStable && results.slice( 0 );
	results.sort( sortOrder );

	if ( hasDuplicate ) {
		while ( (elem = results[i++]) ) {
			if ( elem === results[ i ] ) {
				j = duplicates.push( i );
			}
		}
		while ( j-- ) {
			results.splice( duplicates[ j ], 1 );
		}
	}

	// Clear input after sorting to release objects
	// See https://github.com/jquery/sizzle/pull/225
	sortInput = null;

	return results;
};

/**
 * Utility function for retrieving the text value of an array of DOM nodes
 * @param {Array|Element} elem
 */
getText = Sizzle.getText = function( elem ) {
	var node,
		ret = "",
		i = 0,
		nodeType = elem.nodeType;

	if ( !nodeType ) {
		// If no nodeType, this is expected to be an array
		while ( (node = elem[i++]) ) {
			// Do not traverse comment nodes
			ret += getText( node );
		}
	} else if ( nodeType === 1 || nodeType === 9 || nodeType === 11 ) {
		// Use textContent for elements
		// innerText usage removed for consistency of new lines (jQuery #11153)
		if ( typeof elem.textContent === "string" ) {
			return elem.textContent;
		} else {
			// Traverse its children
			for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
				ret += getText( elem );
			}
		}
	} else if ( nodeType === 3 || nodeType === 4 ) {
		return elem.nodeValue;
	}
	// Do not include comment or processing instruction nodes

	return ret;
};

Expr = Sizzle.selectors = {

	// Can be adjusted by the user
	cacheLength: 50,

	createPseudo: markFunction,

	match: matchExpr,

	attrHandle: {},

	find: {},

	relative: {
		">": { dir: "parentNode", first: true },
		" ": { dir: "parentNode" },
		"+": { dir: "previousSibling", first: true },
		"~": { dir: "previousSibling" }
	},

	preFilter: {
		"ATTR": function( match ) {
			match[1] = match[1].replace( runescape, funescape );

			// Move the given value to match[3] whether quoted or unquoted
			match[3] = ( match[3] || match[4] || match[5] || "" ).replace( runescape, funescape );

			if ( match[2] === "~=" ) {
				match[3] = " " + match[3] + " ";
			}

			return match.slice( 0, 4 );
		},

		"CHILD": function( match ) {
			/* matches from matchExpr["CHILD"]
				1 type (only|nth|...)
				2 what (child|of-type)
				3 argument (even|odd|\d*|\d*n([+-]\d+)?|...)
				4 xn-component of xn+y argument ([+-]?\d*n|)
				5 sign of xn-component
				6 x of xn-component
				7 sign of y-component
				8 y of y-component
			*/
			match[1] = match[1].toLowerCase();

			if ( match[1].slice( 0, 3 ) === "nth" ) {
				// nth-* requires argument
				if ( !match[3] ) {
					Sizzle.error( match[0] );
				}

				// numeric x and y parameters for Expr.filter.CHILD
				// remember that false/true cast respectively to 0/1
				match[4] = +( match[4] ? match[5] + (match[6] || 1) : 2 * ( match[3] === "even" || match[3] === "odd" ) );
				match[5] = +( ( match[7] + match[8] ) || match[3] === "odd" );

			// other types prohibit arguments
			} else if ( match[3] ) {
				Sizzle.error( match[0] );
			}

			return match;
		},

		"PSEUDO": function( match ) {
			var excess,
				unquoted = !match[6] && match[2];

			if ( matchExpr["CHILD"].test( match[0] ) ) {
				return null;
			}

			// Accept quoted arguments as-is
			if ( match[3] ) {
				match[2] = match[4] || match[5] || "";

			// Strip excess characters from unquoted arguments
			} else if ( unquoted && rpseudo.test( unquoted ) &&
				// Get excess from tokenize (recursively)
				(excess = tokenize( unquoted, true )) &&
				// advance to the next closing parenthesis
				(excess = unquoted.indexOf( ")", unquoted.length - excess ) - unquoted.length) ) {

				// excess is a negative index
				match[0] = match[0].slice( 0, excess );
				match[2] = unquoted.slice( 0, excess );
			}

			// Return only captures needed by the pseudo filter method (type and argument)
			return match.slice( 0, 3 );
		}
	},

	filter: {

		"TAG": function( nodeNameSelector ) {
			var nodeName = nodeNameSelector.replace( runescape, funescape ).toLowerCase();
			return nodeNameSelector === "*" ?
				function() { return true; } :
				function( elem ) {
					return elem.nodeName && elem.nodeName.toLowerCase() === nodeName;
				};
		},

		"CLASS": function( className ) {
			var pattern = classCache[ className + " " ];

			return pattern ||
				(pattern = new RegExp( "(^|" + whitespace + ")" + className + "(" + whitespace + "|$)" )) &&
				classCache( className, function( elem ) {
					return pattern.test( typeof elem.className === "string" && elem.className || typeof elem.getAttribute !== "undefined" && elem.getAttribute("class") || "" );
				});
		},

		"ATTR": function( name, operator, check ) {
			return function( elem ) {
				var result = Sizzle.attr( elem, name );

				if ( result == null ) {
					return operator === "!=";
				}
				if ( !operator ) {
					return true;
				}

				result += "";

				return operator === "=" ? result === check :
					operator === "!=" ? result !== check :
					operator === "^=" ? check && result.indexOf( check ) === 0 :
					operator === "*=" ? check && result.indexOf( check ) > -1 :
					operator === "$=" ? check && result.slice( -check.length ) === check :
					operator === "~=" ? ( " " + result.replace( rwhitespace, " " ) + " " ).indexOf( check ) > -1 :
					operator === "|=" ? result === check || result.slice( 0, check.length + 1 ) === check + "-" :
					false;
			};
		},

		"CHILD": function( type, what, argument, first, last ) {
			var simple = type.slice( 0, 3 ) !== "nth",
				forward = type.slice( -4 ) !== "last",
				ofType = what === "of-type";

			return first === 1 && last === 0 ?

				// Shortcut for :nth-*(n)
				function( elem ) {
					return !!elem.parentNode;
				} :

				function( elem, context, xml ) {
					var cache, uniqueCache, outerCache, node, nodeIndex, start,
						dir = simple !== forward ? "nextSibling" : "previousSibling",
						parent = elem.parentNode,
						name = ofType && elem.nodeName.toLowerCase(),
						useCache = !xml && !ofType,
						diff = false;

					if ( parent ) {

						// :(first|last|only)-(child|of-type)
						if ( simple ) {
							while ( dir ) {
								node = elem;
								while ( (node = node[ dir ]) ) {
									if ( ofType ?
										node.nodeName.toLowerCase() === name :
										node.nodeType === 1 ) {

										return false;
									}
								}
								// Reverse direction for :only-* (if we haven't yet done so)
								start = dir = type === "only" && !start && "nextSibling";
							}
							return true;
						}

						start = [ forward ? parent.firstChild : parent.lastChild ];

						// non-xml :nth-child(...) stores cache data on `parent`
						if ( forward && useCache ) {

							// Seek `elem` from a previously-cached index

							// ...in a gzip-friendly way
							node = parent;
							outerCache = node[ expando ] || (node[ expando ] = {});

							// Support: IE <9 only
							// Defend against cloned attroperties (jQuery gh-1709)
							uniqueCache = outerCache[ node.uniqueID ] ||
								(outerCache[ node.uniqueID ] = {});

							cache = uniqueCache[ type ] || [];
							nodeIndex = cache[ 0 ] === dirruns && cache[ 1 ];
							diff = nodeIndex && cache[ 2 ];
							node = nodeIndex && parent.childNodes[ nodeIndex ];

							while ( (node = ++nodeIndex && node && node[ dir ] ||

								// Fallback to seeking `elem` from the start
								(diff = nodeIndex = 0) || start.pop()) ) {

								// When found, cache indexes on `parent` and break
								if ( node.nodeType === 1 && ++diff && node === elem ) {
									uniqueCache[ type ] = [ dirruns, nodeIndex, diff ];
									break;
								}
							}

						} else {
							// Use previously-cached element index if available
							if ( useCache ) {
								// ...in a gzip-friendly way
								node = elem;
								outerCache = node[ expando ] || (node[ expando ] = {});

								// Support: IE <9 only
								// Defend against cloned attroperties (jQuery gh-1709)
								uniqueCache = outerCache[ node.uniqueID ] ||
									(outerCache[ node.uniqueID ] = {});

								cache = uniqueCache[ type ] || [];
								nodeIndex = cache[ 0 ] === dirruns && cache[ 1 ];
								diff = nodeIndex;
							}

							// xml :nth-child(...)
							// or :nth-last-child(...) or :nth(-last)?-of-type(...)
							if ( diff === false ) {
								// Use the same loop as above to seek `elem` from the start
								while ( (node = ++nodeIndex && node && node[ dir ] ||
									(diff = nodeIndex = 0) || start.pop()) ) {

									if ( ( ofType ?
										node.nodeName.toLowerCase() === name :
										node.nodeType === 1 ) &&
										++diff ) {

										// Cache the index of each encountered element
										if ( useCache ) {
											outerCache = node[ expando ] || (node[ expando ] = {});

											// Support: IE <9 only
											// Defend against cloned attroperties (jQuery gh-1709)
											uniqueCache = outerCache[ node.uniqueID ] ||
												(outerCache[ node.uniqueID ] = {});

											uniqueCache[ type ] = [ dirruns, diff ];
										}

										if ( node === elem ) {
											break;
										}
									}
								}
							}
						}

						// Incorporate the offset, then check against cycle size
						diff -= last;
						return diff === first || ( diff % first === 0 && diff / first >= 0 );
					}
				};
		},

		"PSEUDO": function( pseudo, argument ) {
			// pseudo-class names are case-insensitive
			// http://www.w3.org/TR/selectors/#pseudo-classes
			// Prioritize by case sensitivity in case custom pseudos are added with uppercase letters
			// Remember that setFilters inherits from pseudos
			var args,
				fn = Expr.pseudos[ pseudo ] || Expr.setFilters[ pseudo.toLowerCase() ] ||
					Sizzle.error( "unsupported pseudo: " + pseudo );

			// The user may use createPseudo to indicate that
			// arguments are needed to create the filter function
			// just as Sizzle does
			if ( fn[ expando ] ) {
				return fn( argument );
			}

			// But maintain support for old signatures
			if ( fn.length > 1 ) {
				args = [ pseudo, pseudo, "", argument ];
				return Expr.setFilters.hasOwnProperty( pseudo.toLowerCase() ) ?
					markFunction(function( seed, matches ) {
						var idx,
							matched = fn( seed, argument ),
							i = matched.length;
						while ( i-- ) {
							idx = indexOf( seed, matched[i] );
							seed[ idx ] = !( matches[ idx ] = matched[i] );
						}
					}) :
					function( elem ) {
						return fn( elem, 0, args );
					};
			}

			return fn;
		}
	},

	pseudos: {
		// Potentially complex pseudos
		"not": markFunction(function( selector ) {
			// Trim the selector passed to compile
			// to avoid treating leading and trailing
			// spaces as combinators
			var input = [],
				results = [],
				matcher = compile( selector.replace( rtrim, "$1" ) );

			return matcher[ expando ] ?
				markFunction(function( seed, matches, context, xml ) {
					var elem,
						unmatched = matcher( seed, null, xml, [] ),
						i = seed.length;

					// Match elements unmatched by `matcher`
					while ( i-- ) {
						if ( (elem = unmatched[i]) ) {
							seed[i] = !(matches[i] = elem);
						}
					}
				}) :
				function( elem, context, xml ) {
					input[0] = elem;
					matcher( input, null, xml, results );
					// Don't keep the element (issue #299)
					input[0] = null;
					return !results.pop();
				};
		}),

		"has": markFunction(function( selector ) {
			return function( elem ) {
				return Sizzle( selector, elem ).length > 0;
			};
		}),

		"contains": markFunction(function( text ) {
			text = text.replace( runescape, funescape );
			return function( elem ) {
				return ( elem.textContent || elem.innerText || getText( elem ) ).indexOf( text ) > -1;
			};
		}),

		// "Whether an element is represented by a :lang() selector
		// is based solely on the element's language value
		// being equal to the identifier C,
		// or beginning with the identifier C immediately followed by "-".
		// The matching of C against the element's language value is performed case-insensitively.
		// The identifier C does not have to be a valid language name."
		// http://www.w3.org/TR/selectors/#lang-pseudo
		"lang": markFunction( function( lang ) {
			// lang value must be a valid identifier
			if ( !ridentifier.test(lang || "") ) {
				Sizzle.error( "unsupported lang: " + lang );
			}
			lang = lang.replace( runescape, funescape ).toLowerCase();
			return function( elem ) {
				var elemLang;
				do {
					if ( (elemLang = documentIsHTML ?
						elem.lang :
						elem.getAttribute("xml:lang") || elem.getAttribute("lang")) ) {

						elemLang = elemLang.toLowerCase();
						return elemLang === lang || elemLang.indexOf( lang + "-" ) === 0;
					}
				} while ( (elem = elem.parentNode) && elem.nodeType === 1 );
				return false;
			};
		}),

		// Miscellaneous
		"target": function( elem ) {
			var hash = window.location && window.location.hash;
			return hash && hash.slice( 1 ) === elem.id;
		},

		"root": function( elem ) {
			return elem === docElem;
		},

		"focus": function( elem ) {
			return elem === document.activeElement && (!document.hasFocus || document.hasFocus()) && !!(elem.type || elem.href || ~elem.tabIndex);
		},

		// Boolean properties
		"enabled": function( elem ) {
			return elem.disabled === false;
		},

		"disabled": function( elem ) {
			return elem.disabled === true;
		},

		"checked": function( elem ) {
			// In CSS3, :checked should return both checked and selected elements
			// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
			var nodeName = elem.nodeName.toLowerCase();
			return (nodeName === "input" && !!elem.checked) || (nodeName === "option" && !!elem.selected);
		},

		"selected": function( elem ) {
			// Accessing this property makes selected-by-default
			// options in Safari work properly
			if ( elem.parentNode ) {
				elem.parentNode.selectedIndex;
			}

			return elem.selected === true;
		},

		// Contents
		"empty": function( elem ) {
			// http://www.w3.org/TR/selectors/#empty-pseudo
			// :empty is negated by element (1) or content nodes (text: 3; cdata: 4; entity ref: 5),
			//   but not by others (comment: 8; processing instruction: 7; etc.)
			// nodeType < 6 works because attributes (2) do not appear as children
			for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
				if ( elem.nodeType < 6 ) {
					return false;
				}
			}
			return true;
		},

		"parent": function( elem ) {
			return !Expr.pseudos["empty"]( elem );
		},

		// Element/input types
		"header": function( elem ) {
			return rheader.test( elem.nodeName );
		},

		"input": function( elem ) {
			return rinputs.test( elem.nodeName );
		},

		"button": function( elem ) {
			var name = elem.nodeName.toLowerCase();
			return name === "input" && elem.type === "button" || name === "button";
		},

		"text": function( elem ) {
			var attr;
			return elem.nodeName.toLowerCase() === "input" &&
				elem.type === "text" &&

				// Support: IE<8
				// New HTML5 attribute values (e.g., "search") appear with elem.type === "text"
				( (attr = elem.getAttribute("type")) == null || attr.toLowerCase() === "text" );
		},

		// Position-in-collection
		"first": createPositionalPseudo(function() {
			return [ 0 ];
		}),

		"last": createPositionalPseudo(function( matchIndexes, length ) {
			return [ length - 1 ];
		}),

		"eq": createPositionalPseudo(function( matchIndexes, length, argument ) {
			return [ argument < 0 ? argument + length : argument ];
		}),

		"even": createPositionalPseudo(function( matchIndexes, length ) {
			var i = 0;
			for ( ; i < length; i += 2 ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"odd": createPositionalPseudo(function( matchIndexes, length ) {
			var i = 1;
			for ( ; i < length; i += 2 ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"lt": createPositionalPseudo(function( matchIndexes, length, argument ) {
			var i = argument < 0 ? argument + length : argument;
			for ( ; --i >= 0; ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"gt": createPositionalPseudo(function( matchIndexes, length, argument ) {
			var i = argument < 0 ? argument + length : argument;
			for ( ; ++i < length; ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		})
	}
};

Expr.pseudos["nth"] = Expr.pseudos["eq"];

// Add button/input type pseudos
for ( i in { radio: true, checkbox: true, file: true, password: true, image: true } ) {
	Expr.pseudos[ i ] = createInputPseudo( i );
}
for ( i in { submit: true, reset: true } ) {
	Expr.pseudos[ i ] = createButtonPseudo( i );
}

// Easy API for creating new setFilters
function setFilters() {}
setFilters.prototype = Expr.filters = Expr.pseudos;
Expr.setFilters = new setFilters();

tokenize = Sizzle.tokenize = function( selector, parseOnly ) {
	var matched, match, tokens, type,
		soFar, groups, preFilters,
		cached = tokenCache[ selector + " " ];

	if ( cached ) {
		return parseOnly ? 0 : cached.slice( 0 );
	}

	soFar = selector;
	groups = [];
	preFilters = Expr.preFilter;

	while ( soFar ) {

		// Comma and first run
		if ( !matched || (match = rcomma.exec( soFar )) ) {
			if ( match ) {
				// Don't consume trailing commas as valid
				soFar = soFar.slice( match[0].length ) || soFar;
			}
			groups.push( (tokens = []) );
		}

		matched = false;

		// Combinators
		if ( (match = rcombinators.exec( soFar )) ) {
			matched = match.shift();
			tokens.push({
				value: matched,
				// Cast descendant combinators to space
				type: match[0].replace( rtrim, " " )
			});
			soFar = soFar.slice( matched.length );
		}

		// Filters
		for ( type in Expr.filter ) {
			if ( (match = matchExpr[ type ].exec( soFar )) && (!preFilters[ type ] ||
				(match = preFilters[ type ]( match ))) ) {
				matched = match.shift();
				tokens.push({
					value: matched,
					type: type,
					matches: match
				});
				soFar = soFar.slice( matched.length );
			}
		}

		if ( !matched ) {
			break;
		}
	}

	// Return the length of the invalid excess
	// if we're just parsing
	// Otherwise, throw an error or return tokens
	return parseOnly ?
		soFar.length :
		soFar ?
			Sizzle.error( selector ) :
			// Cache the tokens
			tokenCache( selector, groups ).slice( 0 );
};

function toSelector( tokens ) {
	var i = 0,
		len = tokens.length,
		selector = "";
	for ( ; i < len; i++ ) {
		selector += tokens[i].value;
	}
	return selector;
}

function addCombinator( matcher, combinator, base ) {
	var dir = combinator.dir,
		checkNonElements = base && dir === "parentNode",
		doneName = done++;

	return combinator.first ?
		// Check against closest ancestor/preceding element
		function( elem, context, xml ) {
			while ( (elem = elem[ dir ]) ) {
				if ( elem.nodeType === 1 || checkNonElements ) {
					return matcher( elem, context, xml );
				}
			}
		} :

		// Check against all ancestor/preceding elements
		function( elem, context, xml ) {
			var oldCache, uniqueCache, outerCache,
				newCache = [ dirruns, doneName ];

			// We can't set arbitrary data on XML nodes, so they don't benefit from combinator caching
			if ( xml ) {
				while ( (elem = elem[ dir ]) ) {
					if ( elem.nodeType === 1 || checkNonElements ) {
						if ( matcher( elem, context, xml ) ) {
							return true;
						}
					}
				}
			} else {
				while ( (elem = elem[ dir ]) ) {
					if ( elem.nodeType === 1 || checkNonElements ) {
						outerCache = elem[ expando ] || (elem[ expando ] = {});

						// Support: IE <9 only
						// Defend against cloned attroperties (jQuery gh-1709)
						uniqueCache = outerCache[ elem.uniqueID ] || (outerCache[ elem.uniqueID ] = {});

						if ( (oldCache = uniqueCache[ dir ]) &&
							oldCache[ 0 ] === dirruns && oldCache[ 1 ] === doneName ) {

							// Assign to newCache so results back-propagate to previous elements
							return (newCache[ 2 ] = oldCache[ 2 ]);
						} else {
							// Reuse newcache so results back-propagate to previous elements
							uniqueCache[ dir ] = newCache;

							// A match means we're done; a fail means we have to keep checking
							if ( (newCache[ 2 ] = matcher( elem, context, xml )) ) {
								return true;
							}
						}
					}
				}
			}
		};
}

function elementMatcher( matchers ) {
	return matchers.length > 1 ?
		function( elem, context, xml ) {
			var i = matchers.length;
			while ( i-- ) {
				if ( !matchers[i]( elem, context, xml ) ) {
					return false;
				}
			}
			return true;
		} :
		matchers[0];
}

function multipleContexts( selector, contexts, results ) {
	var i = 0,
		len = contexts.length;
	for ( ; i < len; i++ ) {
		Sizzle( selector, contexts[i], results );
	}
	return results;
}

function condense( unmatched, map, filter, context, xml ) {
	var elem,
		newUnmatched = [],
		i = 0,
		len = unmatched.length,
		mapped = map != null;

	for ( ; i < len; i++ ) {
		if ( (elem = unmatched[i]) ) {
			if ( !filter || filter( elem, context, xml ) ) {
				newUnmatched.push( elem );
				if ( mapped ) {
					map.push( i );
				}
			}
		}
	}

	return newUnmatched;
}

function setMatcher( preFilter, selector, matcher, postFilter, postFinder, postSelector ) {
	if ( postFilter && !postFilter[ expando ] ) {
		postFilter = setMatcher( postFilter );
	}
	if ( postFinder && !postFinder[ expando ] ) {
		postFinder = setMatcher( postFinder, postSelector );
	}
	return markFunction(function( seed, results, context, xml ) {
		var temp, i, elem,
			preMap = [],
			postMap = [],
			preexisting = results.length,

			// Get initial elements from seed or context
			elems = seed || multipleContexts( selector || "*", context.nodeType ? [ context ] : context, [] ),

			// Prefilter to get matcher input, preserving a map for seed-results synchronization
			matcherIn = preFilter && ( seed || !selector ) ?
				condense( elems, preMap, preFilter, context, xml ) :
				elems,

			matcherOut = matcher ?
				// If we have a postFinder, or filtered seed, or non-seed postFilter or preexisting results,
				postFinder || ( seed ? preFilter : preexisting || postFilter ) ?

					// ...intermediate processing is necessary
					[] :

					// ...otherwise use results directly
					results :
				matcherIn;

		// Find primary matches
		if ( matcher ) {
			matcher( matcherIn, matcherOut, context, xml );
		}

		// Apply postFilter
		if ( postFilter ) {
			temp = condense( matcherOut, postMap );
			postFilter( temp, [], context, xml );

			// Un-match failing elements by moving them back to matcherIn
			i = temp.length;
			while ( i-- ) {
				if ( (elem = temp[i]) ) {
					matcherOut[ postMap[i] ] = !(matcherIn[ postMap[i] ] = elem);
				}
			}
		}

		if ( seed ) {
			if ( postFinder || preFilter ) {
				if ( postFinder ) {
					// Get the final matcherOut by condensing this intermediate into postFinder contexts
					temp = [];
					i = matcherOut.length;
					while ( i-- ) {
						if ( (elem = matcherOut[i]) ) {
							// Restore matcherIn since elem is not yet a final match
							temp.push( (matcherIn[i] = elem) );
						}
					}
					postFinder( null, (matcherOut = []), temp, xml );
				}

				// Move matched elements from seed to results to keep them synchronized
				i = matcherOut.length;
				while ( i-- ) {
					if ( (elem = matcherOut[i]) &&
						(temp = postFinder ? indexOf( seed, elem ) : preMap[i]) > -1 ) {

						seed[temp] = !(results[temp] = elem);
					}
				}
			}

		// Add elements to results, through postFinder if defined
		} else {
			matcherOut = condense(
				matcherOut === results ?
					matcherOut.splice( preexisting, matcherOut.length ) :
					matcherOut
			);
			if ( postFinder ) {
				postFinder( null, results, matcherOut, xml );
			} else {
				push.apply( results, matcherOut );
			}
		}
	});
}

function matcherFromTokens( tokens ) {
	var checkContext, matcher, j,
		len = tokens.length,
		leadingRelative = Expr.relative[ tokens[0].type ],
		implicitRelative = leadingRelative || Expr.relative[" "],
		i = leadingRelative ? 1 : 0,

		// The foundational matcher ensures that elements are reachable from top-level context(s)
		matchContext = addCombinator( function( elem ) {
			return elem === checkContext;
		}, implicitRelative, true ),
		matchAnyContext = addCombinator( function( elem ) {
			return indexOf( checkContext, elem ) > -1;
		}, implicitRelative, true ),
		matchers = [ function( elem, context, xml ) {
			var ret = ( !leadingRelative && ( xml || context !== outermostContext ) ) || (
				(checkContext = context).nodeType ?
					matchContext( elem, context, xml ) :
					matchAnyContext( elem, context, xml ) );
			// Avoid hanging onto element (issue #299)
			checkContext = null;
			return ret;
		} ];

	for ( ; i < len; i++ ) {
		if ( (matcher = Expr.relative[ tokens[i].type ]) ) {
			matchers = [ addCombinator(elementMatcher( matchers ), matcher) ];
		} else {
			matcher = Expr.filter[ tokens[i].type ].apply( null, tokens[i].matches );

			// Return special upon seeing a positional matcher
			if ( matcher[ expando ] ) {
				// Find the next relative operator (if any) for proper handling
				j = ++i;
				for ( ; j < len; j++ ) {
					if ( Expr.relative[ tokens[j].type ] ) {
						break;
					}
				}
				return setMatcher(
					i > 1 && elementMatcher( matchers ),
					i > 1 && toSelector(
						// If the preceding token was a descendant combinator, insert an implicit any-element `*`
						tokens.slice( 0, i - 1 ).concat({ value: tokens[ i - 2 ].type === " " ? "*" : "" })
					).replace( rtrim, "$1" ),
					matcher,
					i < j && matcherFromTokens( tokens.slice( i, j ) ),
					j < len && matcherFromTokens( (tokens = tokens.slice( j )) ),
					j < len && toSelector( tokens )
				);
			}
			matchers.push( matcher );
		}
	}

	return elementMatcher( matchers );
}

function matcherFromGroupMatchers( elementMatchers, setMatchers ) {
	var bySet = setMatchers.length > 0,
		byElement = elementMatchers.length > 0,
		superMatcher = function( seed, context, xml, results, outermost ) {
			var elem, j, matcher,
				matchedCount = 0,
				i = "0",
				unmatched = seed && [],
				setMatched = [],
				contextBackup = outermostContext,
				// We must always have either seed elements or outermost context
				elems = seed || byElement && Expr.find["TAG"]( "*", outermost ),
				// Use integer dirruns iff this is the outermost matcher
				dirrunsUnique = (dirruns += contextBackup == null ? 1 : Math.random() || 0.1),
				len = elems.length;

			if ( outermost ) {
				outermostContext = context === document || context || outermost;
			}

			// Add elements passing elementMatchers directly to results
			// Support: IE<9, Safari
			// Tolerate NodeList properties (IE: "length"; Safari: <number>) matching elements by id
			for ( ; i !== len && (elem = elems[i]) != null; i++ ) {
				if ( byElement && elem ) {
					j = 0;
					if ( !context && elem.ownerDocument !== document ) {
						setDocument( elem );
						xml = !documentIsHTML;
					}
					while ( (matcher = elementMatchers[j++]) ) {
						if ( matcher( elem, context || document, xml) ) {
							results.push( elem );
							break;
						}
					}
					if ( outermost ) {
						dirruns = dirrunsUnique;
					}
				}

				// Track unmatched elements for set filters
				if ( bySet ) {
					// They will have gone through all possible matchers
					if ( (elem = !matcher && elem) ) {
						matchedCount--;
					}

					// Lengthen the array for every element, matched or not
					if ( seed ) {
						unmatched.push( elem );
					}
				}
			}

			// `i` is now the count of elements visited above, and adding it to `matchedCount`
			// makes the latter nonnegative.
			matchedCount += i;

			// Apply set filters to unmatched elements
			// NOTE: This can be skipped if there are no unmatched elements (i.e., `matchedCount`
			// equals `i`), unless we didn't visit _any_ elements in the above loop because we have
			// no element matchers and no seed.
			// Incrementing an initially-string "0" `i` allows `i` to remain a string only in that
			// case, which will result in a "00" `matchedCount` that differs from `i` but is also
			// numerically zero.
			if ( bySet && i !== matchedCount ) {
				j = 0;
				while ( (matcher = setMatchers[j++]) ) {
					matcher( unmatched, setMatched, context, xml );
				}

				if ( seed ) {
					// Reintegrate element matches to eliminate the need for sorting
					if ( matchedCount > 0 ) {
						while ( i-- ) {
							if ( !(unmatched[i] || setMatched[i]) ) {
								setMatched[i] = pop.call( results );
							}
						}
					}

					// Discard index placeholder values to get only actual matches
					setMatched = condense( setMatched );
				}

				// Add matches to results
				push.apply( results, setMatched );

				// Seedless set matches succeeding multiple successful matchers stipulate sorting
				if ( outermost && !seed && setMatched.length > 0 &&
					( matchedCount + setMatchers.length ) > 1 ) {

					Sizzle.uniqueSort( results );
				}
			}

			// Override manipulation of globals by nested matchers
			if ( outermost ) {
				dirruns = dirrunsUnique;
				outermostContext = contextBackup;
			}

			return unmatched;
		};

	return bySet ?
		markFunction( superMatcher ) :
		superMatcher;
}

compile = Sizzle.compile = function( selector, match /* Internal Use Only */ ) {
	var i,
		setMatchers = [],
		elementMatchers = [],
		cached = compilerCache[ selector + " " ];

	if ( !cached ) {
		// Generate a function of recursive functions that can be used to check each element
		if ( !match ) {
			match = tokenize( selector );
		}
		i = match.length;
		while ( i-- ) {
			cached = matcherFromTokens( match[i] );
			if ( cached[ expando ] ) {
				setMatchers.push( cached );
			} else {
				elementMatchers.push( cached );
			}
		}

		// Cache the compiled function
		cached = compilerCache( selector, matcherFromGroupMatchers( elementMatchers, setMatchers ) );

		// Save selector and tokenization
		cached.selector = selector;
	}
	return cached;
};

/**
 * A low-level selection function that works with Sizzle's compiled
 *  selector functions
 * @param {String|Function} selector A selector or a pre-compiled
 *  selector function built with Sizzle.compile
 * @param {Element} context
 * @param {Array} [results]
 * @param {Array} [seed] A set of elements to match against
 */
select = Sizzle.select = function( selector, context, results, seed ) {
	var i, tokens, token, type, find,
		compiled = typeof selector === "function" && selector,
		match = !seed && tokenize( (selector = compiled.selector || selector) );

	results = results || [];

	// Try to minimize operations if there is only one selector in the list and no seed
	// (the latter of which guarantees us context)
	if ( match.length === 1 ) {

		// Reduce context if the leading compound selector is an ID
		tokens = match[0] = match[0].slice( 0 );
		if ( tokens.length > 2 && (token = tokens[0]).type === "ID" &&
				support.getById && context.nodeType === 9 && documentIsHTML &&
				Expr.relative[ tokens[1].type ] ) {

			context = ( Expr.find["ID"]( token.matches[0].replace(runescape, funescape), context ) || [] )[0];
			if ( !context ) {
				return results;

			// Precompiled matchers will still verify ancestry, so step up a level
			} else if ( compiled ) {
				context = context.parentNode;
			}

			selector = selector.slice( tokens.shift().value.length );
		}

		// Fetch a seed set for right-to-left matching
		i = matchExpr["needsContext"].test( selector ) ? 0 : tokens.length;
		while ( i-- ) {
			token = tokens[i];

			// Abort if we hit a combinator
			if ( Expr.relative[ (type = token.type) ] ) {
				break;
			}
			if ( (find = Expr.find[ type ]) ) {
				// Search, expanding context for leading sibling combinators
				if ( (seed = find(
					token.matches[0].replace( runescape, funescape ),
					rsibling.test( tokens[0].type ) && testContext( context.parentNode ) || context
				)) ) {

					// If seed is empty or no tokens remain, we can return early
					tokens.splice( i, 1 );
					selector = seed.length && toSelector( tokens );
					if ( !selector ) {
						push.apply( results, seed );
						return results;
					}

					break;
				}
			}
		}
	}

	// Compile and execute a filtering function if one is not provided
	// Provide `match` to avoid retokenization if we modified the selector above
	( compiled || compile( selector, match ) )(
		seed,
		context,
		!documentIsHTML,
		results,
		!context || rsibling.test( selector ) && testContext( context.parentNode ) || context
	);
	return results;
};

// One-time assignments

// Sort stability
support.sortStable = expando.split("").sort( sortOrder ).join("") === expando;

// Support: Chrome 14-35+
// Always assume duplicates if they aren't passed to the comparison function
support.detectDuplicates = !!hasDuplicate;

// Initialize against the default document
setDocument();

// Support: Webkit<537.32 - Safari 6.0.3/Chrome 25 (fixed in Chrome 27)
// Detached nodes confoundingly follow *each other*
support.sortDetached = assert(function( div1 ) {
	// Should return 1, but returns 4 (following)
	return div1.compareDocumentPosition( document.createElement("div") ) & 1;
});

// Support: IE<8
// Prevent attribute/property "interpolation"
// http://msdn.microsoft.com/en-us/library/ms536429%28VS.85%29.aspx
if ( !assert(function( div ) {
	div.innerHTML = "<a href='#'></a>";
	return div.firstChild.getAttribute("href") === "#" ;
}) ) {
	addHandle( "type|href|height|width", function( elem, name, isXML ) {
		if ( !isXML ) {
			return elem.getAttribute( name, name.toLowerCase() === "type" ? 1 : 2 );
		}
	});
}

// Support: IE<9
// Use defaultValue in place of getAttribute("value")
if ( !support.attributes || !assert(function( div ) {
	div.innerHTML = "<input/>";
	div.firstChild.setAttribute( "value", "" );
	return div.firstChild.getAttribute( "value" ) === "";
}) ) {
	addHandle( "value", function( elem, name, isXML ) {
		if ( !isXML && elem.nodeName.toLowerCase() === "input" ) {
			return elem.defaultValue;
		}
	});
}

// Support: IE<9
// Use getAttributeNode to fetch booleans when getAttribute lies
if ( !assert(function( div ) {
	return div.getAttribute("disabled") == null;
}) ) {
	addHandle( booleans, function( elem, name, isXML ) {
		var val;
		if ( !isXML ) {
			return elem[ name ] === true ? name.toLowerCase() :
					(val = elem.getAttributeNode( name )) && val.specified ?
					val.value :
				null;
		}
	});
}

return Sizzle;

})( window );



jQuery.find = Sizzle;
jQuery.expr = Sizzle.selectors;
jQuery.expr[ ":" ] = jQuery.expr.pseudos;
jQuery.uniqueSort = jQuery.unique = Sizzle.uniqueSort;
jQuery.text = Sizzle.getText;
jQuery.isXMLDoc = Sizzle.isXML;
jQuery.contains = Sizzle.contains;



var dir = function( elem, dir, until ) {
	var matched = [],
		truncate = until !== undefined;

	while ( ( elem = elem[ dir ] ) && elem.nodeType !== 9 ) {
		if ( elem.nodeType === 1 ) {
			if ( truncate && jQuery( elem ).is( until ) ) {
				break;
			}
			matched.push( elem );
		}
	}
	return matched;
};


var siblings = function( n, elem ) {
	var matched = [];

	for ( ; n; n = n.nextSibling ) {
		if ( n.nodeType === 1 && n !== elem ) {
			matched.push( n );
		}
	}

	return matched;
};


var rneedsContext = jQuery.expr.match.needsContext;

var rsingleTag = ( /^<([\w-]+)\s*\/?>(?:<\/\1>|)$/ );



var risSimple = /^.[^:#\[\.,]*$/;

// Implement the identical functionality for filter and not
function winnow( elements, qualifier, not ) {
	if ( jQuery.isFunction( qualifier ) ) {
		return jQuery.grep( elements, function( elem, i ) {
			/* jshint -W018 */
			return !!qualifier.call( elem, i, elem ) !== not;
		} );

	}

	if ( qualifier.nodeType ) {
		return jQuery.grep( elements, function( elem ) {
			return ( elem === qualifier ) !== not;
		} );

	}

	if ( typeof qualifier === "string" ) {
		if ( risSimple.test( qualifier ) ) {
			return jQuery.filter( qualifier, elements, not );
		}

		qualifier = jQuery.filter( qualifier, elements );
	}

	return jQuery.grep( elements, function( elem ) {
		return ( jQuery.inArray( elem, qualifier ) > -1 ) !== not;
	} );
}

jQuery.filter = function( expr, elems, not ) {
	var elem = elems[ 0 ];

	if ( not ) {
		expr = ":not(" + expr + ")";
	}

	return elems.length === 1 && elem.nodeType === 1 ?
		jQuery.find.matchesSelector( elem, expr ) ? [ elem ] : [] :
		jQuery.find.matches( expr, jQuery.grep( elems, function( elem ) {
			return elem.nodeType === 1;
		} ) );
};

jQuery.fn.extend( {
	find: function( selector ) {
		var i,
			ret = [],
			self = this,
			len = self.length;

		if ( typeof selector !== "string" ) {
			return this.pushStack( jQuery( selector ).filter( function() {
				for ( i = 0; i < len; i++ ) {
					if ( jQuery.contains( self[ i ], this ) ) {
						return true;
					}
				}
			} ) );
		}

		for ( i = 0; i < len; i++ ) {
			jQuery.find( selector, self[ i ], ret );
		}

		// Needed because $( selector, context ) becomes $( context ).find( selector )
		ret = this.pushStack( len > 1 ? jQuery.unique( ret ) : ret );
		ret.selector = this.selector ? this.selector + " " + selector : selector;
		return ret;
	},
	filter: function( selector ) {
		return this.pushStack( winnow( this, selector || [], false ) );
	},
	not: function( selector ) {
		return this.pushStack( winnow( this, selector || [], true ) );
	},
	is: function( selector ) {
		return !!winnow(
			this,

			// If this is a positional/relative selector, check membership in the returned set
			// so $("p:first").is("p:last") won't return true for a doc with two "p".
			typeof selector === "string" && rneedsContext.test( selector ) ?
				jQuery( selector ) :
				selector || [],
			false
		).length;
	}
} );


// Initialize a jQuery object


// A central reference to the root jQuery(document)
var rootjQuery,

	// A simple way to check for HTML strings
	// Prioritize #id over <tag> to avoid XSS via location.hash (#9521)
	// Strict HTML recognition (#11290: must start with <)
	rquickExpr = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/,

	init = jQuery.fn.init = function( selector, context, root ) {
		var match, elem;

		// HANDLE: $(""), $(null), $(undefined), $(false)
		if ( !selector ) {
			return this;
		}

		// init accepts an alternate rootjQuery
		// so migrate can support jQuery.sub (gh-2101)
		root = root || rootjQuery;

		// Handle HTML strings
		if ( typeof selector === "string" ) {
			if ( selector.charAt( 0 ) === "<" &&
				selector.charAt( selector.length - 1 ) === ">" &&
				selector.length >= 3 ) {

				// Assume that strings that start and end with <> are HTML and skip the regex check
				match = [ null, selector, null ];

			} else {
				match = rquickExpr.exec( selector );
			}

			// Match html or make sure no context is specified for #id
			if ( match && ( match[ 1 ] || !context ) ) {

				// HANDLE: $(html) -> $(array)
				if ( match[ 1 ] ) {
					context = context instanceof jQuery ? context[ 0 ] : context;

					// scripts is true for back-compat
					// Intentionally let the error be thrown if parseHTML is not present
					jQuery.merge( this, jQuery.parseHTML(
						match[ 1 ],
						context && context.nodeType ? context.ownerDocument || context : document,
						true
					) );

					// HANDLE: $(html, props)
					if ( rsingleTag.test( match[ 1 ] ) && jQuery.isPlainObject( context ) ) {
						for ( match in context ) {

							// Properties of context are called as methods if possible
							if ( jQuery.isFunction( this[ match ] ) ) {
								this[ match ]( context[ match ] );

							// ...and otherwise set as attributes
							} else {
								this.attr( match, context[ match ] );
							}
						}
					}

					return this;

				// HANDLE: $(#id)
				} else {
					elem = document.getElementById( match[ 2 ] );

					// Check parentNode to catch when Blackberry 4.6 returns
					// nodes that are no longer in the document #6963
					if ( elem && elem.parentNode ) {

						// Handle the case where IE and Opera return items
						// by name instead of ID
						if ( elem.id !== match[ 2 ] ) {
							return rootjQuery.find( selector );
						}

						// Otherwise, we inject the element directly into the jQuery object
						this.length = 1;
						this[ 0 ] = elem;
					}

					this.context = document;
					this.selector = selector;
					return this;
				}

			// HANDLE: $(expr, $(...))
			} else if ( !context || context.jquery ) {
				return ( context || root ).find( selector );

			// HANDLE: $(expr, context)
			// (which is just equivalent to: $(context).find(expr)
			} else {
				return this.constructor( context ).find( selector );
			}

		// HANDLE: $(DOMElement)
		} else if ( selector.nodeType ) {
			this.context = this[ 0 ] = selector;
			this.length = 1;
			return this;

		// HANDLE: $(function)
		// Shortcut for document ready
		} else if ( jQuery.isFunction( selector ) ) {
			return typeof root.ready !== "undefined" ?
				root.ready( selector ) :

				// Execute immediately if ready is not present
				selector( jQuery );
		}

		if ( selector.selector !== undefined ) {
			this.selector = selector.selector;
			this.context = selector.context;
		}

		return jQuery.makeArray( selector, this );
	};

// Give the init function the jQuery prototype for later instantiation
init.prototype = jQuery.fn;

// Initialize central reference
rootjQuery = jQuery( document );


var rparentsprev = /^(?:parents|prev(?:Until|All))/,

	// methods guaranteed to produce a unique set when starting from a unique set
	guaranteedUnique = {
		children: true,
		contents: true,
		next: true,
		prev: true
	};

jQuery.fn.extend( {
	has: function( target ) {
		var i,
			targets = jQuery( target, this ),
			len = targets.length;

		return this.filter( function() {
			for ( i = 0; i < len; i++ ) {
				if ( jQuery.contains( this, targets[ i ] ) ) {
					return true;
				}
			}
		} );
	},

	closest: function( selectors, context ) {
		var cur,
			i = 0,
			l = this.length,
			matched = [],
			pos = rneedsContext.test( selectors ) || typeof selectors !== "string" ?
				jQuery( selectors, context || this.context ) :
				0;

		for ( ; i < l; i++ ) {
			for ( cur = this[ i ]; cur && cur !== context; cur = cur.parentNode ) {

				// Always skip document fragments
				if ( cur.nodeType < 11 && ( pos ?
					pos.index( cur ) > -1 :

					// Don't pass non-elements to Sizzle
					cur.nodeType === 1 &&
						jQuery.find.matchesSelector( cur, selectors ) ) ) {

					matched.push( cur );
					break;
				}
			}
		}

		return this.pushStack( matched.length > 1 ? jQuery.uniqueSort( matched ) : matched );
	},

	// Determine the position of an element within
	// the matched set of elements
	index: function( elem ) {

		// No argument, return index in parent
		if ( !elem ) {
			return ( this[ 0 ] && this[ 0 ].parentNode ) ? this.first().prevAll().length : -1;
		}

		// index in selector
		if ( typeof elem === "string" ) {
			return jQuery.inArray( this[ 0 ], jQuery( elem ) );
		}

		// Locate the position of the desired element
		return jQuery.inArray(

			// If it receives a jQuery object, the first element is used
			elem.jquery ? elem[ 0 ] : elem, this );
	},

	add: function( selector, context ) {
		return this.pushStack(
			jQuery.uniqueSort(
				jQuery.merge( this.get(), jQuery( selector, context ) )
			)
		);
	},

	addBack: function( selector ) {
		return this.add( selector == null ?
			this.prevObject : this.prevObject.filter( selector )
		);
	}
} );

function sibling( cur, dir ) {
	do {
		cur = cur[ dir ];
	} while ( cur && cur.nodeType !== 1 );

	return cur;
}

jQuery.each( {
	parent: function( elem ) {
		var parent = elem.parentNode;
		return parent && parent.nodeType !== 11 ? parent : null;
	},
	parents: function( elem ) {
		return dir( elem, "parentNode" );
	},
	parentsUntil: function( elem, i, until ) {
		return dir( elem, "parentNode", until );
	},
	next: function( elem ) {
		return sibling( elem, "nextSibling" );
	},
	prev: function( elem ) {
		return sibling( elem, "previousSibling" );
	},
	nextAll: function( elem ) {
		return dir( elem, "nextSibling" );
	},
	prevAll: function( elem ) {
		return dir( elem, "previousSibling" );
	},
	nextUntil: function( elem, i, until ) {
		return dir( elem, "nextSibling", until );
	},
	prevUntil: function( elem, i, until ) {
		return dir( elem, "previousSibling", until );
	},
	siblings: function( elem ) {
		return siblings( ( elem.parentNode || {} ).firstChild, elem );
	},
	children: function( elem ) {
		return siblings( elem.firstChild );
	},
	contents: function( elem ) {
		return jQuery.nodeName( elem, "iframe" ) ?
			elem.contentDocument || elem.contentWindow.document :
			jQuery.merge( [], elem.childNodes );
	}
}, function( name, fn ) {
	jQuery.fn[ name ] = function( until, selector ) {
		var ret = jQuery.map( this, fn, until );

		if ( name.slice( -5 ) !== "Until" ) {
			selector = until;
		}

		if ( selector && typeof selector === "string" ) {
			ret = jQuery.filter( selector, ret );
		}

		if ( this.length > 1 ) {

			// Remove duplicates
			if ( !guaranteedUnique[ name ] ) {
				ret = jQuery.uniqueSort( ret );
			}

			// Reverse order for parents* and prev-derivatives
			if ( rparentsprev.test( name ) ) {
				ret = ret.reverse();
			}
		}

		return this.pushStack( ret );
	};
} );
var rnotwhite = ( /\S+/g );



// Convert String-formatted options into Object-formatted ones
function createOptions( options ) {
	var object = {};
	jQuery.each( options.match( rnotwhite ) || [], function( _, flag ) {
		object[ flag ] = true;
	} );
	return object;
}

/*
 * Create a callback list using the following parameters:
 *
 *	options: an optional list of space-separated options that will change how
 *			the callback list behaves or a more traditional option object
 *
 * By default a callback list will act like an event callback list and can be
 * "fired" multiple times.
 *
 * Possible options:
 *
 *	once:			will ensure the callback list can only be fired once (like a Deferred)
 *
 *	memory:			will keep track of previous values and will call any callback added
 *					after the list has been fired right away with the latest "memorized"
 *					values (like a Deferred)
 *
 *	unique:			will ensure a callback can only be added once (no duplicate in the list)
 *
 *	stopOnFalse:	interrupt callings when a callback returns false
 *
 */
jQuery.Callbacks = function( options ) {

	// Convert options from String-formatted to Object-formatted if needed
	// (we check in cache first)
	options = typeof options === "string" ?
		createOptions( options ) :
		jQuery.extend( {}, options );

	var // Flag to know if list is currently firing
		firing,

		// Last fire value for non-forgettable lists
		memory,

		// Flag to know if list was already fired
		fired,

		// Flag to prevent firing
		locked,

		// Actual callback list
		list = [],

		// Queue of execution data for repeatable lists
		queue = [],

		// Index of currently firing callback (modified by add/remove as needed)
		firingIndex = -1,

		// Fire callbacks
		fire = function() {

			// Enforce single-firing
			locked = options.once;

			// Execute callbacks for all pending executions,
			// respecting firingIndex overrides and runtime changes
			fired = firing = true;
			for ( ; queue.length; firingIndex = -1 ) {
				memory = queue.shift();
				while ( ++firingIndex < list.length ) {

					// Run callback and check for early termination
					if ( list[ firingIndex ].apply( memory[ 0 ], memory[ 1 ] ) === false &&
						options.stopOnFalse ) {

						// Jump to end and forget the data so .add doesn't re-fire
						firingIndex = list.length;
						memory = false;
					}
				}
			}

			// Forget the data if we're done with it
			if ( !options.memory ) {
				memory = false;
			}

			firing = false;

			// Clean up if we're done firing for good
			if ( locked ) {

				// Keep an empty list if we have data for future add calls
				if ( memory ) {
					list = [];

				// Otherwise, this object is spent
				} else {
					list = "";
				}
			}
		},

		// Actual Callbacks object
		self = {

			// Add a callback or a collection of callbacks to the list
			add: function() {
				if ( list ) {

					// If we have memory from a past run, we should fire after adding
					if ( memory && !firing ) {
						firingIndex = list.length - 1;
						queue.push( memory );
					}

					( function add( args ) {
						jQuery.each( args, function( _, arg ) {
							if ( jQuery.isFunction( arg ) ) {
								if ( !options.unique || !self.has( arg ) ) {
									list.push( arg );
								}
							} else if ( arg && arg.length && jQuery.type( arg ) !== "string" ) {

								// Inspect recursively
								add( arg );
							}
						} );
					} )( arguments );

					if ( memory && !firing ) {
						fire();
					}
				}
				return this;
			},

			// Remove a callback from the list
			remove: function() {
				jQuery.each( arguments, function( _, arg ) {
					var index;
					while ( ( index = jQuery.inArray( arg, list, index ) ) > -1 ) {
						list.splice( index, 1 );

						// Handle firing indexes
						if ( index <= firingIndex ) {
							firingIndex--;
						}
					}
				} );
				return this;
			},

			// Check if a given callback is in the list.
			// If no argument is given, return whether or not list has callbacks attached.
			has: function( fn ) {
				return fn ?
					jQuery.inArray( fn, list ) > -1 :
					list.length > 0;
			},

			// Remove all callbacks from the list
			empty: function() {
				if ( list ) {
					list = [];
				}
				return this;
			},

			// Disable .fire and .add
			// Abort any current/pending executions
			// Clear all callbacks and values
			disable: function() {
				locked = queue = [];
				list = memory = "";
				return this;
			},
			disabled: function() {
				return !list;
			},

			// Disable .fire
			// Also disable .add unless we have memory (since it would have no effect)
			// Abort any pending executions
			lock: function() {
				locked = true;
				if ( !memory ) {
					self.disable();
				}
				return this;
			},
			locked: function() {
				return !!locked;
			},

			// Call all callbacks with the given context and arguments
			fireWith: function( context, args ) {
				if ( !locked ) {
					args = args || [];
					args = [ context, args.slice ? args.slice() : args ];
					queue.push( args );
					if ( !firing ) {
						fire();
					}
				}
				return this;
			},

			// Call all the callbacks with the given arguments
			fire: function() {
				self.fireWith( this, arguments );
				return this;
			},

			// To know if the callbacks have already been called at least once
			fired: function() {
				return !!fired;
			}
		};

	return self;
};


jQuery.extend( {

	Deferred: function( func ) {
		var tuples = [

				// action, add listener, listener list, final state
				[ "resolve", "done", jQuery.Callbacks( "once memory" ), "resolved" ],
				[ "reject", "fail", jQuery.Callbacks( "once memory" ), "rejected" ],
				[ "notify", "progress", jQuery.Callbacks( "memory" ) ]
			],
			state = "pending",
			promise = {
				state: function() {
					return state;
				},
				always: function() {
					deferred.done( arguments ).fail( arguments );
					return this;
				},
				then: function( /* fnDone, fnFail, fnProgress */ ) {
					var fns = arguments;
					return jQuery.Deferred( function( newDefer ) {
						jQuery.each( tuples, function( i, tuple ) {
							var fn = jQuery.isFunction( fns[ i ] ) && fns[ i ];

							// deferred[ done | fail | progress ] for forwarding actions to newDefer
							deferred[ tuple[ 1 ] ]( function() {
								var returned = fn && fn.apply( this, arguments );
								if ( returned && jQuery.isFunction( returned.promise ) ) {
									returned.promise()
										.progress( newDefer.notify )
										.done( newDefer.resolve )
										.fail( newDefer.reject );
								} else {
									newDefer[ tuple[ 0 ] + "With" ](
										this === promise ? newDefer.promise() : this,
										fn ? [ returned ] : arguments
									);
								}
							} );
						} );
						fns = null;
					} ).promise();
				},

				// Get a promise for this deferred
				// If obj is provided, the promise aspect is added to the object
				promise: function( obj ) {
					return obj != null ? jQuery.extend( obj, promise ) : promise;
				}
			},
			deferred = {};

		// Keep pipe for back-compat
		promise.pipe = promise.then;

		// Add list-specific methods
		jQuery.each( tuples, function( i, tuple ) {
			var list = tuple[ 2 ],
				stateString = tuple[ 3 ];

			// promise[ done | fail | progress ] = list.add
			promise[ tuple[ 1 ] ] = list.add;

			// Handle state
			if ( stateString ) {
				list.add( function() {

					// state = [ resolved | rejected ]
					state = stateString;

				// [ reject_list | resolve_list ].disable; progress_list.lock
				}, tuples[ i ^ 1 ][ 2 ].disable, tuples[ 2 ][ 2 ].lock );
			}

			// deferred[ resolve | reject | notify ]
			deferred[ tuple[ 0 ] ] = function() {
				deferred[ tuple[ 0 ] + "With" ]( this === deferred ? promise : this, arguments );
				return this;
			};
			deferred[ tuple[ 0 ] + "With" ] = list.fireWith;
		} );

		// Make the deferred a promise
		promise.promise( deferred );

		// Call given func if any
		if ( func ) {
			func.call( deferred, deferred );
		}

		// All done!
		return deferred;
	},

	// Deferred helper
	when: function( subordinate /* , ..., subordinateN */ ) {
		var i = 0,
			resolveValues = slice.call( arguments ),
			length = resolveValues.length,

			// the count of uncompleted subordinates
			remaining = length !== 1 ||
				( subordinate && jQuery.isFunction( subordinate.promise ) ) ? length : 0,

			// the master Deferred.
			// If resolveValues consist of only a single Deferred, just use that.
			deferred = remaining === 1 ? subordinate : jQuery.Deferred(),

			// Update function for both resolve and progress values
			updateFunc = function( i, contexts, values ) {
				return function( value ) {
					contexts[ i ] = this;
					values[ i ] = arguments.length > 1 ? slice.call( arguments ) : value;
					if ( values === progressValues ) {
						deferred.notifyWith( contexts, values );

					} else if ( !( --remaining ) ) {
						deferred.resolveWith( contexts, values );
					}
				};
			},

			progressValues, progressContexts, resolveContexts;

		// add listeners to Deferred subordinates; treat others as resolved
		if ( length > 1 ) {
			progressValues = new Array( length );
			progressContexts = new Array( length );
			resolveContexts = new Array( length );
			for ( ; i < length; i++ ) {
				if ( resolveValues[ i ] && jQuery.isFunction( resolveValues[ i ].promise ) ) {
					resolveValues[ i ].promise()
						.progress( updateFunc( i, progressContexts, progressValues ) )
						.done( updateFunc( i, resolveContexts, resolveValues ) )
						.fail( deferred.reject );
				} else {
					--remaining;
				}
			}
		}

		// if we're not waiting on anything, resolve the master
		if ( !remaining ) {
			deferred.resolveWith( resolveContexts, resolveValues );
		}

		return deferred.promise();
	}
} );


// The deferred used on DOM ready
var readyList;

jQuery.fn.ready = function( fn ) {

	// Add the callback
	jQuery.ready.promise().done( fn );

	return this;
};

jQuery.extend( {

	// Is the DOM ready to be used? Set to true once it occurs.
	isReady: false,

	// A counter to track how many items to wait for before
	// the ready event fires. See #6781
	readyWait: 1,

	// Hold (or release) the ready event
	holdReady: function( hold ) {
		if ( hold ) {
			jQuery.readyWait++;
		} else {
			jQuery.ready( true );
		}
	},

	// Handle when the DOM is ready
	ready: function( wait ) {

		// Abort if there are pending holds or we're already ready
		if ( wait === true ? --jQuery.readyWait : jQuery.isReady ) {
			return;
		}

		// Remember that the DOM is ready
		jQuery.isReady = true;

		// If a normal DOM Ready event fired, decrement, and wait if need be
		if ( wait !== true && --jQuery.readyWait > 0 ) {
			return;
		}

		// If there are functions bound, to execute
		readyList.resolveWith( document, [ jQuery ] );

		// Trigger any bound ready events
		if ( jQuery.fn.triggerHandler ) {
			jQuery( document ).triggerHandler( "ready" );
			jQuery( document ).off( "ready" );
		}
	}
} );

/**
 * Clean-up method for dom ready events
 */
function detach() {
	if ( document.addEventListener ) {
		document.removeEventListener( "DOMContentLoaded", completed );
		window.removeEventListener( "load", completed );

	} else {
		document.detachEvent( "onreadystatechange", completed );
		window.detachEvent( "onload", completed );
	}
}

/**
 * The ready event handler and self cleanup method
 */
function completed() {

	// readyState === "complete" is good enough for us to call the dom ready in oldIE
	if ( document.addEventListener ||
		window.event.type === "load" ||
		document.readyState === "complete" ) {

		detach();
		jQuery.ready();
	}
}

jQuery.ready.promise = function( obj ) {
	if ( !readyList ) {

		readyList = jQuery.Deferred();

		// Catch cases where $(document).ready() is called
		// after the browser event has already occurred.
		// Support: IE6-10
		// Older IE sometimes signals "interactive" too soon
		if ( document.readyState === "complete" ||
			( document.readyState !== "loading" && !document.documentElement.doScroll ) ) {

			// Handle it asynchronously to allow scripts the opportunity to delay ready
			window.setTimeout( jQuery.ready );

		// Standards-based browsers support DOMContentLoaded
		} else if ( document.addEventListener ) {

			// Use the handy event callback
			document.addEventListener( "DOMContentLoaded", completed );

			// A fallback to window.onload, that will always work
			window.addEventListener( "load", completed );

		// If IE event model is used
		} else {

			// Ensure firing before onload, maybe late but safe also for iframes
			document.attachEvent( "onreadystatechange", completed );

			// A fallback to window.onload, that will always work
			window.attachEvent( "onload", completed );

			// If IE and not a frame
			// continually check to see if the document is ready
			var top = false;

			try {
				top = window.frameElement == null && document.documentElement;
			} catch ( e ) {}

			if ( top && top.doScroll ) {
				( function doScrollCheck() {
					if ( !jQuery.isReady ) {

						try {

							// Use the trick by Diego Perini
							// http://javascript.nwbox.com/IEContentLoaded/
							top.doScroll( "left" );
						} catch ( e ) {
							return window.setTimeout( doScrollCheck, 50 );
						}

						// detach all dom ready events
						detach();

						// and execute any waiting functions
						jQuery.ready();
					}
				} )();
			}
		}
	}
	return readyList.promise( obj );
};

// Kick off the DOM ready check even if the user does not
jQuery.ready.promise();




// Support: IE<9
// Iteration over object's inherited properties before its own
var i;
for ( i in jQuery( support ) ) {
	break;
}
support.ownFirst = i === "0";

// Note: most support tests are defined in their respective modules.
// false until the test is run
support.inlineBlockNeedsLayout = false;

// Execute ASAP in case we need to set body.style.zoom
jQuery( function() {

	// Minified: var a,b,c,d
	var val, div, body, container;

	body = document.getElementsByTagName( "body" )[ 0 ];
	if ( !body || !body.style ) {

		// Return for frameset docs that don't have a body
		return;
	}

	// Setup
	div = document.createElement( "div" );
	container = document.createElement( "div" );
	container.style.cssText = "position:absolute;border:0;width:0;height:0;top:0;left:-9999px";
	body.appendChild( container ).appendChild( div );

	if ( typeof div.style.zoom !== "undefined" ) {

		// Support: IE<8
		// Check if natively block-level elements act like inline-block
		// elements when setting their display to 'inline' and giving
		// them layout
		div.style.cssText = "display:inline;margin:0;border:0;padding:1px;width:1px;zoom:1";

		support.inlineBlockNeedsLayout = val = div.offsetWidth === 3;
		if ( val ) {

			// Prevent IE 6 from affecting layout for positioned elements #11048
			// Prevent IE from shrinking the body in IE 7 mode #12869
			// Support: IE<8
			body.style.zoom = 1;
		}
	}

	body.removeChild( container );
} );


( function() {
	var div = document.createElement( "div" );

	// Support: IE<9
	support.deleteExpando = true;
	try {
		delete div.test;
	} catch ( e ) {
		support.deleteExpando = false;
	}

	// Null elements to avoid leaks in IE.
	div = null;
} )();
var acceptData = function( elem ) {
	var noData = jQuery.noData[ ( elem.nodeName + " " ).toLowerCase() ],
		nodeType = +elem.nodeType || 1;

	// Do not set data on non-element DOM nodes because it will not be cleared (#8335).
	return nodeType !== 1 && nodeType !== 9 ?
		false :

		// Nodes accept data unless otherwise specified; rejection can be conditional
		!noData || noData !== true && elem.getAttribute( "classid" ) === noData;
};




var rbrace = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,
	rmultiDash = /([A-Z])/g;

function dataAttr( elem, key, data ) {

	// If nothing was found internally, try to fetch any
	// data from the HTML5 data-* attribute
	if ( data === undefined && elem.nodeType === 1 ) {

		var name = "data-" + key.replace( rmultiDash, "-$1" ).toLowerCase();

		data = elem.getAttribute( name );

		if ( typeof data === "string" ) {
			try {
				data = data === "true" ? true :
					data === "false" ? false :
					data === "null" ? null :

					// Only convert to a number if it doesn't change the string
					+data + "" === data ? +data :
					rbrace.test( data ) ? jQuery.parseJSON( data ) :
					data;
			} catch ( e ) {}

			// Make sure we set the data so it isn't changed later
			jQuery.data( elem, key, data );

		} else {
			data = undefined;
		}
	}

	return data;
}

// checks a cache object for emptiness
function isEmptyDataObject( obj ) {
	var name;
	for ( name in obj ) {

		// if the public data object is empty, the private is still empty
		if ( name === "data" && jQuery.isEmptyObject( obj[ name ] ) ) {
			continue;
		}
		if ( name !== "toJSON" ) {
			return false;
		}
	}

	return true;
}

function internalData( elem, name, data, pvt /* Internal Use Only */ ) {
	if ( !acceptData( elem ) ) {
		return;
	}

	var ret, thisCache,
		internalKey = jQuery.expando,

		// We have to handle DOM nodes and JS objects differently because IE6-7
		// can't GC object references properly across the DOM-JS boundary
		isNode = elem.nodeType,

		// Only DOM nodes need the global jQuery cache; JS object data is
		// attached directly to the object so GC can occur automatically
		cache = isNode ? jQuery.cache : elem,

		// Only defining an ID for JS objects if its cache already exists allows
		// the code to shortcut on the same path as a DOM node with no cache
		id = isNode ? elem[ internalKey ] : elem[ internalKey ] && internalKey;

	// Avoid doing any more work than we need to when trying to get data on an
	// object that has no data at all
	if ( ( !id || !cache[ id ] || ( !pvt && !cache[ id ].data ) ) &&
		data === undefined && typeof name === "string" ) {
		return;
	}

	if ( !id ) {

		// Only DOM nodes need a new unique ID for each element since their data
		// ends up in the global cache
		if ( isNode ) {
			id = elem[ internalKey ] = deletedIds.pop() || jQuery.guid++;
		} else {
			id = internalKey;
		}
	}

	if ( !cache[ id ] ) {

		// Avoid exposing jQuery metadata on plain JS objects when the object
		// is serialized using JSON.stringify
		cache[ id ] = isNode ? {} : { toJSON: jQuery.noop };
	}

	// An object can be passed to jQuery.data instead of a key/value pair; this gets
	// shallow copied over onto the existing cache
	if ( typeof name === "object" || typeof name === "function" ) {
		if ( pvt ) {
			cache[ id ] = jQuery.extend( cache[ id ], name );
		} else {
			cache[ id ].data = jQuery.extend( cache[ id ].data, name );
		}
	}

	thisCache = cache[ id ];

	// jQuery data() is stored in a separate object inside the object's internal data
	// cache in order to avoid key collisions between internal data and user-defined
	// data.
	if ( !pvt ) {
		if ( !thisCache.data ) {
			thisCache.data = {};
		}

		thisCache = thisCache.data;
	}

	if ( data !== undefined ) {
		thisCache[ jQuery.camelCase( name ) ] = data;
	}

	// Check for both converted-to-camel and non-converted data property names
	// If a data property was specified
	if ( typeof name === "string" ) {

		// First Try to find as-is property data
		ret = thisCache[ name ];

		// Test for null|undefined property data
		if ( ret == null ) {

			// Try to find the camelCased property
			ret = thisCache[ jQuery.camelCase( name ) ];
		}
	} else {
		ret = thisCache;
	}

	return ret;
}

function internalRemoveData( elem, name, pvt ) {
	if ( !acceptData( elem ) ) {
		return;
	}

	var thisCache, i,
		isNode = elem.nodeType,

		// See jQuery.data for more information
		cache = isNode ? jQuery.cache : elem,
		id = isNode ? elem[ jQuery.expando ] : jQuery.expando;

	// If there is already no cache entry for this object, there is no
	// purpose in continuing
	if ( !cache[ id ] ) {
		return;
	}

	if ( name ) {

		thisCache = pvt ? cache[ id ] : cache[ id ].data;

		if ( thisCache ) {

			// Support array or space separated string names for data keys
			if ( !jQuery.isArray( name ) ) {

				// try the string as a key before any manipulation
				if ( name in thisCache ) {
					name = [ name ];
				} else {

					// split the camel cased version by spaces unless a key with the spaces exists
					name = jQuery.camelCase( name );
					if ( name in thisCache ) {
						name = [ name ];
					} else {
						name = name.split( " " );
					}
				}
			} else {

				// If "name" is an array of keys...
				// When data is initially created, via ("key", "val") signature,
				// keys will be converted to camelCase.
				// Since there is no way to tell _how_ a key was added, remove
				// both plain key and camelCase key. #12786
				// This will only penalize the array argument path.
				name = name.concat( jQuery.map( name, jQuery.camelCase ) );
			}

			i = name.length;
			while ( i-- ) {
				delete thisCache[ name[ i ] ];
			}

			// If there is no data left in the cache, we want to continue
			// and let the cache object itself get destroyed
			if ( pvt ? !isEmptyDataObject( thisCache ) : !jQuery.isEmptyObject( thisCache ) ) {
				return;
			}
		}
	}

	// See jQuery.data for more information
	if ( !pvt ) {
		delete cache[ id ].data;

		// Don't destroy the parent cache unless the internal data object
		// had been the only thing left in it
		if ( !isEmptyDataObject( cache[ id ] ) ) {
			return;
		}
	}

	// Destroy the cache
	if ( isNode ) {
		jQuery.cleanData( [ elem ], true );

	// Use delete when supported for expandos or `cache` is not a window per isWindow (#10080)
	/* jshint eqeqeq: false */
	} else if ( support.deleteExpando || cache != cache.window ) {
		/* jshint eqeqeq: true */
		delete cache[ id ];

	// When all else fails, undefined
	} else {
		cache[ id ] = undefined;
	}
}

jQuery.extend( {
	cache: {},

	// The following elements (space-suffixed to avoid Object.prototype collisions)
	// throw uncatchable exceptions if you attempt to set expando properties
	noData: {
		"applet ": true,
		"embed ": true,

		// ...but Flash objects (which have this classid) *can* handle expandos
		"object ": "clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"
	},

	hasData: function( elem ) {
		elem = elem.nodeType ? jQuery.cache[ elem[ jQuery.expando ] ] : elem[ jQuery.expando ];
		return !!elem && !isEmptyDataObject( elem );
	},

	data: function( elem, name, data ) {
		return internalData( elem, name, data );
	},

	removeData: function( elem, name ) {
		return internalRemoveData( elem, name );
	},

	// For internal use only.
	_data: function( elem, name, data ) {
		return internalData( elem, name, data, true );
	},

	_removeData: function( elem, name ) {
		return internalRemoveData( elem, name, true );
	}
} );

jQuery.fn.extend( {
	data: function( key, value ) {
		var i, name, data,
			elem = this[ 0 ],
			attrs = elem && elem.attributes;

		// Special expections of .data basically thwart jQuery.access,
		// so implement the relevant behavior ourselves

		// Gets all values
		if ( key === undefined ) {
			if ( this.length ) {
				data = jQuery.data( elem );

				if ( elem.nodeType === 1 && !jQuery._data( elem, "parsedAttrs" ) ) {
					i = attrs.length;
					while ( i-- ) {

						// Support: IE11+
						// The attrs elements can be null (#14894)
						if ( attrs[ i ] ) {
							name = attrs[ i ].name;
							if ( name.indexOf( "data-" ) === 0 ) {
								name = jQuery.camelCase( name.slice( 5 ) );
								dataAttr( elem, name, data[ name ] );
							}
						}
					}
					jQuery._data( elem, "parsedAttrs", true );
				}
			}

			return data;
		}

		// Sets multiple values
		if ( typeof key === "object" ) {
			return this.each( function() {
				jQuery.data( this, key );
			} );
		}

		return arguments.length > 1 ?

			// Sets one value
			this.each( function() {
				jQuery.data( this, key, value );
			} ) :

			// Gets one value
			// Try to fetch any internally stored data first
			elem ? dataAttr( elem, key, jQuery.data( elem, key ) ) : undefined;
	},

	removeData: function( key ) {
		return this.each( function() {
			jQuery.removeData( this, key );
		} );
	}
} );


jQuery.extend( {
	queue: function( elem, type, data ) {
		var queue;

		if ( elem ) {
			type = ( type || "fx" ) + "queue";
			queue = jQuery._data( elem, type );

			// Speed up dequeue by getting out quickly if this is just a lookup
			if ( data ) {
				if ( !queue || jQuery.isArray( data ) ) {
					queue = jQuery._data( elem, type, jQuery.makeArray( data ) );
				} else {
					queue.push( data );
				}
			}
			return queue || [];
		}
	},

	dequeue: function( elem, type ) {
		type = type || "fx";

		var queue = jQuery.queue( elem, type ),
			startLength = queue.length,
			fn = queue.shift(),
			hooks = jQuery._queueHooks( elem, type ),
			next = function() {
				jQuery.dequeue( elem, type );
			};

		// If the fx queue is dequeued, always remove the progress sentinel
		if ( fn === "inprogress" ) {
			fn = queue.shift();
			startLength--;
		}

		if ( fn ) {

			// Add a progress sentinel to prevent the fx queue from being
			// automatically dequeued
			if ( type === "fx" ) {
				queue.unshift( "inprogress" );
			}

			// clear up the last queue stop function
			delete hooks.stop;
			fn.call( elem, next, hooks );
		}

		if ( !startLength && hooks ) {
			hooks.empty.fire();
		}
	},

	// not intended for public consumption - generates a queueHooks object,
	// or returns the current one
	_queueHooks: function( elem, type ) {
		var key = type + "queueHooks";
		return jQuery._data( elem, key ) || jQuery._data( elem, key, {
			empty: jQuery.Callbacks( "once memory" ).add( function() {
				jQuery._removeData( elem, type + "queue" );
				jQuery._removeData( elem, key );
			} )
		} );
	}
} );

jQuery.fn.extend( {
	queue: function( type, data ) {
		var setter = 2;

		if ( typeof type !== "string" ) {
			data = type;
			type = "fx";
			setter--;
		}

		if ( arguments.length < setter ) {
			return jQuery.queue( this[ 0 ], type );
		}

		return data === undefined ?
			this :
			this.each( function() {
				var queue = jQuery.queue( this, type, data );

				// ensure a hooks for this queue
				jQuery._queueHooks( this, type );

				if ( type === "fx" && queue[ 0 ] !== "inprogress" ) {
					jQuery.dequeue( this, type );
				}
			} );
	},
	dequeue: function( type ) {
		return this.each( function() {
			jQuery.dequeue( this, type );
		} );
	},
	clearQueue: function( type ) {
		return this.queue( type || "fx", [] );
	},

	// Get a promise resolved when queues of a certain type
	// are emptied (fx is the type by default)
	promise: function( type, obj ) {
		var tmp,
			count = 1,
			defer = jQuery.Deferred(),
			elements = this,
			i = this.length,
			resolve = function() {
				if ( !( --count ) ) {
					defer.resolveWith( elements, [ elements ] );
				}
			};

		if ( typeof type !== "string" ) {
			obj = type;
			type = undefined;
		}
		type = type || "fx";

		while ( i-- ) {
			tmp = jQuery._data( elements[ i ], type + "queueHooks" );
			if ( tmp && tmp.empty ) {
				count++;
				tmp.empty.add( resolve );
			}
		}
		resolve();
		return defer.promise( obj );
	}
} );


( function() {
	var shrinkWrapBlocksVal;

	support.shrinkWrapBlocks = function() {
		if ( shrinkWrapBlocksVal != null ) {
			return shrinkWrapBlocksVal;
		}

		// Will be changed later if needed.
		shrinkWrapBlocksVal = false;

		// Minified: var b,c,d
		var div, body, container;

		body = document.getElementsByTagName( "body" )[ 0 ];
		if ( !body || !body.style ) {

			// Test fired too early or in an unsupported environment, exit.
			return;
		}

		// Setup
		div = document.createElement( "div" );
		container = document.createElement( "div" );
		container.style.cssText = "position:absolute;border:0;width:0;height:0;top:0;left:-9999px";
		body.appendChild( container ).appendChild( div );

		// Support: IE6
		// Check if elements with layout shrink-wrap their children
		if ( typeof div.style.zoom !== "undefined" ) {

			// Reset CSS: box-sizing; display; margin; border
			div.style.cssText =

				// Support: Firefox<29, Android 2.3
				// Vendor-prefix box-sizing
				"-webkit-box-sizing:content-box;-moz-box-sizing:content-box;" +
				"box-sizing:content-box;display:block;margin:0;border:0;" +
				"padding:1px;width:1px;zoom:1";
			div.appendChild( document.createElement( "div" ) ).style.width = "5px";
			shrinkWrapBlocksVal = div.offsetWidth !== 3;
		}

		body.removeChild( container );

		return shrinkWrapBlocksVal;
	};

} )();
var pnum = ( /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/ ).source;

var rcssNum = new RegExp( "^(?:([+-])=|)(" + pnum + ")([a-z%]*)$", "i" );


var cssExpand = [ "Top", "Right", "Bottom", "Left" ];

var isHidden = function( elem, el ) {

		// isHidden might be called from jQuery#filter function;
		// in that case, element will be second argument
		elem = el || elem;
		return jQuery.css( elem, "display" ) === "none" ||
			!jQuery.contains( elem.ownerDocument, elem );
	};



function adjustCSS( elem, prop, valueParts, tween ) {
	var adjusted,
		scale = 1,
		maxIterations = 20,
		currentValue = tween ?
			function() { return tween.cur(); } :
			function() { return jQuery.css( elem, prop, "" ); },
		initial = currentValue(),
		unit = valueParts && valueParts[ 3 ] || ( jQuery.cssNumber[ prop ] ? "" : "px" ),

		// Starting value computation is required for potential unit mismatches
		initialInUnit = ( jQuery.cssNumber[ prop ] || unit !== "px" && +initial ) &&
			rcssNum.exec( jQuery.css( elem, prop ) );

	if ( initialInUnit && initialInUnit[ 3 ] !== unit ) {

		// Trust units reported by jQuery.css
		unit = unit || initialInUnit[ 3 ];

		// Make sure we update the tween properties later on
		valueParts = valueParts || [];

		// Iteratively approximate from a nonzero starting point
		initialInUnit = +initial || 1;

		do {

			// If previous iteration zeroed out, double until we get *something*.
			// Use string for doubling so we don't accidentally see scale as unchanged below
			scale = scale || ".5";

			// Adjust and apply
			initialInUnit = initialInUnit / scale;
			jQuery.style( elem, prop, initialInUnit + unit );

		// Update scale, tolerating zero or NaN from tween.cur()
		// Break the loop if scale is unchanged or perfect, or if we've just had enough.
		} while (
			scale !== ( scale = currentValue() / initial ) && scale !== 1 && --maxIterations
		);
	}

	if ( valueParts ) {
		initialInUnit = +initialInUnit || +initial || 0;

		// Apply relative offset (+=/-=) if specified
		adjusted = valueParts[ 1 ] ?
			initialInUnit + ( valueParts[ 1 ] + 1 ) * valueParts[ 2 ] :
			+valueParts[ 2 ];
		if ( tween ) {
			tween.unit = unit;
			tween.start = initialInUnit;
			tween.end = adjusted;
		}
	}
	return adjusted;
}


// Multifunctional method to get and set values of a collection
// The value/s can optionally be executed if it's a function
var access = function( elems, fn, key, value, chainable, emptyGet, raw ) {
	var i = 0,
		length = elems.length,
		bulk = key == null;

	// Sets many values
	if ( jQuery.type( key ) === "object" ) {
		chainable = true;
		for ( i in key ) {
			access( elems, fn, i, key[ i ], true, emptyGet, raw );
		}

	// Sets one value
	} else if ( value !== undefined ) {
		chainable = true;

		if ( !jQuery.isFunction( value ) ) {
			raw = true;
		}

		if ( bulk ) {

			// Bulk operations run against the entire set
			if ( raw ) {
				fn.call( elems, value );
				fn = null;

			// ...except when executing function values
			} else {
				bulk = fn;
				fn = function( elem, key, value ) {
					return bulk.call( jQuery( elem ), value );
				};
			}
		}

		if ( fn ) {
			for ( ; i < length; i++ ) {
				fn(
					elems[ i ],
					key,
					raw ? value : value.call( elems[ i ], i, fn( elems[ i ], key ) )
				);
			}
		}
	}

	return chainable ?
		elems :

		// Gets
		bulk ?
			fn.call( elems ) :
			length ? fn( elems[ 0 ], key ) : emptyGet;
};
var rcheckableType = ( /^(?:checkbox|radio)$/i );

var rtagName = ( /<([\w:-]+)/ );

var rscriptType = ( /^$|\/(?:java|ecma)script/i );

var rleadingWhitespace = ( /^\s+/ );

var nodeNames = "abbr|article|aside|audio|bdi|canvas|data|datalist|" +
		"details|dialog|figcaption|figure|footer|header|hgroup|main|" +
		"mark|meter|nav|output|picture|progress|section|summary|template|time|video";



function createSafeFragment( document ) {
	var list = nodeNames.split( "|" ),
		safeFrag = document.createDocumentFragment();

	if ( safeFrag.createElement ) {
		while ( list.length ) {
			safeFrag.createElement(
				list.pop()
			);
		}
	}
	return safeFrag;
}


( function() {
	var div = document.createElement( "div" ),
		fragment = document.createDocumentFragment(),
		input = document.createElement( "input" );

	// Setup
	div.innerHTML = "  <link/><table></table><a href='/a'>a</a><input type='checkbox'/>";

	// IE strips leading whitespace when .innerHTML is used
	support.leadingWhitespace = div.firstChild.nodeType === 3;

	// Make sure that tbody elements aren't automatically inserted
	// IE will insert them into empty tables
	support.tbody = !div.getElementsByTagName( "tbody" ).length;

	// Make sure that link elements get serialized correctly by innerHTML
	// This requires a wrapper element in IE
	support.htmlSerialize = !!div.getElementsByTagName( "link" ).length;

	// Makes sure cloning an html5 element does not cause problems
	// Where outerHTML is undefined, this still works
	support.html5Clone =
		document.createElement( "nav" ).cloneNode( true ).outerHTML !== "<:nav></:nav>";

	// Check if a disconnected checkbox will retain its checked
	// value of true after appended to the DOM (IE6/7)
	input.type = "checkbox";
	input.checked = true;
	fragment.appendChild( input );
	support.appendChecked = input.checked;

	// Make sure textarea (and checkbox) defaultValue is properly cloned
	// Support: IE6-IE11+
	div.innerHTML = "<textarea>x</textarea>";
	support.noCloneChecked = !!div.cloneNode( true ).lastChild.defaultValue;

	// #11217 - WebKit loses check when the name is after the checked attribute
	fragment.appendChild( div );

	// Support: Windows Web Apps (WWA)
	// `name` and `type` must use .setAttribute for WWA (#14901)
	input = document.createElement( "input" );
	input.setAttribute( "type", "radio" );
	input.setAttribute( "checked", "checked" );
	input.setAttribute( "name", "t" );

	div.appendChild( input );

	// Support: Safari 5.1, iOS 5.1, Android 4.x, Android 2.3
	// old WebKit doesn't clone checked state correctly in fragments
	support.checkClone = div.cloneNode( true ).cloneNode( true ).lastChild.checked;

	// Support: IE<9
	// Cloned elements keep attachEvent handlers, we use addEventListener on IE9+
	support.noCloneEvent = !!div.addEventListener;

	// Support: IE<9
	// Since attributes and properties are the same in IE,
	// cleanData must set properties to undefined rather than use removeAttribute
	div[ jQuery.expando ] = 1;
	support.attributes = !div.getAttribute( jQuery.expando );
} )();


// We have to close these tags to support XHTML (#13200)
var wrapMap = {
	option: [ 1, "<select multiple='multiple'>", "</select>" ],
	legend: [ 1, "<fieldset>", "</fieldset>" ],
	area: [ 1, "<map>", "</map>" ],

	// Support: IE8
	param: [ 1, "<object>", "</object>" ],
	thead: [ 1, "<table>", "</table>" ],
	tr: [ 2, "<table><tbody>", "</tbody></table>" ],
	col: [ 2, "<table><tbody></tbody><colgroup>", "</colgroup></table>" ],
	td: [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ],

	// IE6-8 can't serialize link, script, style, or any html5 (NoScope) tags,
	// unless wrapped in a div with non-breaking characters in front of it.
	_default: support.htmlSerialize ? [ 0, "", "" ] : [ 1, "X<div>", "</div>" ]
};

// Support: IE8-IE9
wrapMap.optgroup = wrapMap.option;

wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
wrapMap.th = wrapMap.td;


function getAll( context, tag ) {
	var elems, elem,
		i = 0,
		found = typeof context.getElementsByTagName !== "undefined" ?
			context.getElementsByTagName( tag || "*" ) :
			typeof context.querySelectorAll !== "undefined" ?
				context.querySelectorAll( tag || "*" ) :
				undefined;

	if ( !found ) {
		for ( found = [], elems = context.childNodes || context;
			( elem = elems[ i ] ) != null;
			i++
		) {
			if ( !tag || jQuery.nodeName( elem, tag ) ) {
				found.push( elem );
			} else {
				jQuery.merge( found, getAll( elem, tag ) );
			}
		}
	}

	return tag === undefined || tag && jQuery.nodeName( context, tag ) ?
		jQuery.merge( [ context ], found ) :
		found;
}


// Mark scripts as having already been evaluated
function setGlobalEval( elems, refElements ) {
	var elem,
		i = 0;
	for ( ; ( elem = elems[ i ] ) != null; i++ ) {
		jQuery._data(
			elem,
			"globalEval",
			!refElements || jQuery._data( refElements[ i ], "globalEval" )
		);
	}
}


var rhtml = /<|&#?\w+;/,
	rtbody = /<tbody/i;

function fixDefaultChecked( elem ) {
	if ( rcheckableType.test( elem.type ) ) {
		elem.defaultChecked = elem.checked;
	}
}

function buildFragment( elems, context, scripts, selection, ignored ) {
	var j, elem, contains,
		tmp, tag, tbody, wrap,
		l = elems.length,

		// Ensure a safe fragment
		safe = createSafeFragment( context ),

		nodes = [],
		i = 0;

	for ( ; i < l; i++ ) {
		elem = elems[ i ];

		if ( elem || elem === 0 ) {

			// Add nodes directly
			if ( jQuery.type( elem ) === "object" ) {
				jQuery.merge( nodes, elem.nodeType ? [ elem ] : elem );

			// Convert non-html into a text node
			} else if ( !rhtml.test( elem ) ) {
				nodes.push( context.createTextNode( elem ) );

			// Convert html into DOM nodes
			} else {
				tmp = tmp || safe.appendChild( context.createElement( "div" ) );

				// Deserialize a standard representation
				tag = ( rtagName.exec( elem ) || [ "", "" ] )[ 1 ].toLowerCase();
				wrap = wrapMap[ tag ] || wrapMap._default;

				tmp.innerHTML = wrap[ 1 ] + jQuery.htmlPrefilter( elem ) + wrap[ 2 ];

				// Descend through wrappers to the right content
				j = wrap[ 0 ];
				while ( j-- ) {
					tmp = tmp.lastChild;
				}

				// Manually add leading whitespace removed by IE
				if ( !support.leadingWhitespace && rleadingWhitespace.test( elem ) ) {
					nodes.push( context.createTextNode( rleadingWhitespace.exec( elem )[ 0 ] ) );
				}

				// Remove IE's autoinserted <tbody> from table fragments
				if ( !support.tbody ) {

					// String was a <table>, *may* have spurious <tbody>
					elem = tag === "table" && !rtbody.test( elem ) ?
						tmp.firstChild :

						// String was a bare <thead> or <tfoot>
						wrap[ 1 ] === "<table>" && !rtbody.test( elem ) ?
							tmp :
							0;

					j = elem && elem.childNodes.length;
					while ( j-- ) {
						if ( jQuery.nodeName( ( tbody = elem.childNodes[ j ] ), "tbody" ) &&
							!tbody.childNodes.length ) {

							elem.removeChild( tbody );
						}
					}
				}

				jQuery.merge( nodes, tmp.childNodes );

				// Fix #12392 for WebKit and IE > 9
				tmp.textContent = "";

				// Fix #12392 for oldIE
				while ( tmp.firstChild ) {
					tmp.removeChild( tmp.firstChild );
				}

				// Remember the top-level container for proper cleanup
				tmp = safe.lastChild;
			}
		}
	}

	// Fix #11356: Clear elements from fragment
	if ( tmp ) {
		safe.removeChild( tmp );
	}

	// Reset defaultChecked for any radios and checkboxes
	// about to be appended to the DOM in IE 6/7 (#8060)
	if ( !support.appendChecked ) {
		jQuery.grep( getAll( nodes, "input" ), fixDefaultChecked );
	}

	i = 0;
	while ( ( elem = nodes[ i++ ] ) ) {

		// Skip elements already in the context collection (trac-4087)
		if ( selection && jQuery.inArray( elem, selection ) > -1 ) {
			if ( ignored ) {
				ignored.push( elem );
			}

			continue;
		}

		contains = jQuery.contains( elem.ownerDocument, elem );

		// Append to fragment
		tmp = getAll( safe.appendChild( elem ), "script" );

		// Preserve script evaluation history
		if ( contains ) {
			setGlobalEval( tmp );
		}

		// Capture executables
		if ( scripts ) {
			j = 0;
			while ( ( elem = tmp[ j++ ] ) ) {
				if ( rscriptType.test( elem.type || "" ) ) {
					scripts.push( elem );
				}
			}
		}
	}

	tmp = null;

	return safe;
}


( function() {
	var i, eventName,
		div = document.createElement( "div" );

	// Support: IE<9 (lack submit/change bubble), Firefox (lack focus(in | out) events)
	for ( i in { submit: true, change: true, focusin: true } ) {
		eventName = "on" + i;

		if ( !( support[ i ] = eventName in window ) ) {

			// Beware of CSP restrictions (https://developer.mozilla.org/en/Security/CSP)
			div.setAttribute( eventName, "t" );
			support[ i ] = div.attributes[ eventName ].expando === false;
		}
	}

	// Null elements to avoid leaks in IE.
	div = null;
} )();


var rformElems = /^(?:input|select|textarea)$/i,
	rkeyEvent = /^key/,
	rmouseEvent = /^(?:mouse|pointer|contextmenu|drag|drop)|click/,
	rfocusMorph = /^(?:focusinfocus|focusoutblur)$/,
	rtypenamespace = /^([^.]*)(?:\.(.+)|)/;

function returnTrue() {
	return true;
}

function returnFalse() {
	return false;
}

// Support: IE9
// See #13393 for more info
function safeActiveElement() {
	try {
		return document.activeElement;
	} catch ( err ) { }
}

function on( elem, types, selector, data, fn, one ) {
	var origFn, type;

	// Types can be a map of types/handlers
	if ( typeof types === "object" ) {

		// ( types-Object, selector, data )
		if ( typeof selector !== "string" ) {

			// ( types-Object, data )
			data = data || selector;
			selector = undefined;
		}
		for ( type in types ) {
			on( elem, type, selector, data, types[ type ], one );
		}
		return elem;
	}

	if ( data == null && fn == null ) {

		// ( types, fn )
		fn = selector;
		data = selector = undefined;
	} else if ( fn == null ) {
		if ( typeof selector === "string" ) {

			// ( types, selector, fn )
			fn = data;
			data = undefined;
		} else {

			// ( types, data, fn )
			fn = data;
			data = selector;
			selector = undefined;
		}
	}
	if ( fn === false ) {
		fn = returnFalse;
	} else if ( !fn ) {
		return elem;
	}

	if ( one === 1 ) {
		origFn = fn;
		fn = function( event ) {

			// Can use an empty set, since event contains the info
			jQuery().off( event );
			return origFn.apply( this, arguments );
		};

		// Use same guid so caller can remove using origFn
		fn.guid = origFn.guid || ( origFn.guid = jQuery.guid++ );
	}
	return elem.each( function() {
		jQuery.event.add( this, types, fn, data, selector );
	} );
}

/*
 * Helper functions for managing events -- not part of the public interface.
 * Props to Dean Edwards' addEvent library for many of the ideas.
 */
jQuery.event = {

	global: {},

	add: function( elem, types, handler, data, selector ) {
		var tmp, events, t, handleObjIn,
			special, eventHandle, handleObj,
			handlers, type, namespaces, origType,
			elemData = jQuery._data( elem );

		// Don't attach events to noData or text/comment nodes (but allow plain objects)
		if ( !elemData ) {
			return;
		}

		// Caller can pass in an object of custom data in lieu of the handler
		if ( handler.handler ) {
			handleObjIn = handler;
			handler = handleObjIn.handler;
			selector = handleObjIn.selector;
		}

		// Make sure that the handler has a unique ID, used to find/remove it later
		if ( !handler.guid ) {
			handler.guid = jQuery.guid++;
		}

		// Init the element's event structure and main handler, if this is the first
		if ( !( events = elemData.events ) ) {
			events = elemData.events = {};
		}
		if ( !( eventHandle = elemData.handle ) ) {
			eventHandle = elemData.handle = function( e ) {

				// Discard the second event of a jQuery.event.trigger() and
				// when an event is called after a page has unloaded
				return typeof jQuery !== "undefined" &&
					( !e || jQuery.event.triggered !== e.type ) ?
					jQuery.event.dispatch.apply( eventHandle.elem, arguments ) :
					undefined;
			};

			// Add elem as a property of the handle fn to prevent a memory leak
			// with IE non-native events
			eventHandle.elem = elem;
		}

		// Handle multiple events separated by a space
		types = ( types || "" ).match( rnotwhite ) || [ "" ];
		t = types.length;
		while ( t-- ) {
			tmp = rtypenamespace.exec( types[ t ] ) || [];
			type = origType = tmp[ 1 ];
			namespaces = ( tmp[ 2 ] || "" ).split( "." ).sort();

			// There *must* be a type, no attaching namespace-only handlers
			if ( !type ) {
				continue;
			}

			// If event changes its type, use the special event handlers for the changed type
			special = jQuery.event.special[ type ] || {};

			// If selector defined, determine special event api type, otherwise given type
			type = ( selector ? special.delegateType : special.bindType ) || type;

			// Update special based on newly reset type
			special = jQuery.event.special[ type ] || {};

			// handleObj is passed to all event handlers
			handleObj = jQuery.extend( {
				type: type,
				origType: origType,
				data: data,
				handler: handler,
				guid: handler.guid,
				selector: selector,
				needsContext: selector && jQuery.expr.match.needsContext.test( selector ),
				namespace: namespaces.join( "." )
			}, handleObjIn );

			// Init the event handler queue if we're the first
			if ( !( handlers = events[ type ] ) ) {
				handlers = events[ type ] = [];
				handlers.delegateCount = 0;

				// Only use addEventListener/attachEvent if the special events handler returns false
				if ( !special.setup ||
					special.setup.call( elem, data, namespaces, eventHandle ) === false ) {

					// Bind the global event handler to the element
					if ( elem.addEventListener ) {
						elem.addEventListener( type, eventHandle, false );

					} else if ( elem.attachEvent ) {
						elem.attachEvent( "on" + type, eventHandle );
					}
				}
			}

			if ( special.add ) {
				special.add.call( elem, handleObj );

				if ( !handleObj.handler.guid ) {
					handleObj.handler.guid = handler.guid;
				}
			}

			// Add to the element's handler list, delegates in front
			if ( selector ) {
				handlers.splice( handlers.delegateCount++, 0, handleObj );
			} else {
				handlers.push( handleObj );
			}

			// Keep track of which events have ever been used, for event optimization
			jQuery.event.global[ type ] = true;
		}

		// Nullify elem to prevent memory leaks in IE
		elem = null;
	},

	// Detach an event or set of events from an element
	remove: function( elem, types, handler, selector, mappedTypes ) {
		var j, handleObj, tmp,
			origCount, t, events,
			special, handlers, type,
			namespaces, origType,
			elemData = jQuery.hasData( elem ) && jQuery._data( elem );

		if ( !elemData || !( events = elemData.events ) ) {
			return;
		}

		// Once for each type.namespace in types; type may be omitted
		types = ( types || "" ).match( rnotwhite ) || [ "" ];
		t = types.length;
		while ( t-- ) {
			tmp = rtypenamespace.exec( types[ t ] ) || [];
			type = origType = tmp[ 1 ];
			namespaces = ( tmp[ 2 ] || "" ).split( "." ).sort();

			// Unbind all events (on this namespace, if provided) for the element
			if ( !type ) {
				for ( type in events ) {
					jQuery.event.remove( elem, type + types[ t ], handler, selector, true );
				}
				continue;
			}

			special = jQuery.event.special[ type ] || {};
			type = ( selector ? special.delegateType : special.bindType ) || type;
			handlers = events[ type ] || [];
			tmp = tmp[ 2 ] &&
				new RegExp( "(^|\\.)" + namespaces.join( "\\.(?:.*\\.|)" ) + "(\\.|$)" );

			// Remove matching events
			origCount = j = handlers.length;
			while ( j-- ) {
				handleObj = handlers[ j ];

				if ( ( mappedTypes || origType === handleObj.origType ) &&
					( !handler || handler.guid === handleObj.guid ) &&
					( !tmp || tmp.test( handleObj.namespace ) ) &&
					( !selector || selector === handleObj.selector ||
						selector === "**" && handleObj.selector ) ) {
					handlers.splice( j, 1 );

					if ( handleObj.selector ) {
						handlers.delegateCount--;
					}
					if ( special.remove ) {
						special.remove.call( elem, handleObj );
					}
				}
			}

			// Remove generic event handler if we removed something and no more handlers exist
			// (avoids potential for endless recursion during removal of special event handlers)
			if ( origCount && !handlers.length ) {
				if ( !special.teardown ||
					special.teardown.call( elem, namespaces, elemData.handle ) === false ) {

					jQuery.removeEvent( elem, type, elemData.handle );
				}

				delete events[ type ];
			}
		}

		// Remove the expando if it's no longer used
		if ( jQuery.isEmptyObject( events ) ) {
			delete elemData.handle;

			// removeData also checks for emptiness and clears the expando if empty
			// so use it instead of delete
			jQuery._removeData( elem, "events" );
		}
	},

	trigger: function( event, data, elem, onlyHandlers ) {
		var handle, ontype, cur,
			bubbleType, special, tmp, i,
			eventPath = [ elem || document ],
			type = hasOwn.call( event, "type" ) ? event.type : event,
			namespaces = hasOwn.call( event, "namespace" ) ? event.namespace.split( "." ) : [];

		cur = tmp = elem = elem || document;

		// Don't do events on text and comment nodes
		if ( elem.nodeType === 3 || elem.nodeType === 8 ) {
			return;
		}

		// focus/blur morphs to focusin/out; ensure we're not firing them right now
		if ( rfocusMorph.test( type + jQuery.event.triggered ) ) {
			return;
		}

		if ( type.indexOf( "." ) > -1 ) {

			// Namespaced trigger; create a regexp to match event type in handle()
			namespaces = type.split( "." );
			type = namespaces.shift();
			namespaces.sort();
		}
		ontype = type.indexOf( ":" ) < 0 && "on" + type;

		// Caller can pass in a jQuery.Event object, Object, or just an event type string
		event = event[ jQuery.expando ] ?
			event :
			new jQuery.Event( type, typeof event === "object" && event );

		// Trigger bitmask: & 1 for native handlers; & 2 for jQuery (always true)
		event.isTrigger = onlyHandlers ? 2 : 3;
		event.namespace = namespaces.join( "." );
		event.rnamespace = event.namespace ?
			new RegExp( "(^|\\.)" + namespaces.join( "\\.(?:.*\\.|)" ) + "(\\.|$)" ) :
			null;

		// Clean up the event in case it is being reused
		event.result = undefined;
		if ( !event.target ) {
			event.target = elem;
		}

		// Clone any incoming data and prepend the event, creating the handler arg list
		data = data == null ?
			[ event ] :
			jQuery.makeArray( data, [ event ] );

		// Allow special events to draw outside the lines
		special = jQuery.event.special[ type ] || {};
		if ( !onlyHandlers && special.trigger && special.trigger.apply( elem, data ) === false ) {
			return;
		}

		// Determine event propagation path in advance, per W3C events spec (#9951)
		// Bubble up to document, then to window; watch for a global ownerDocument var (#9724)
		if ( !onlyHandlers && !special.noBubble && !jQuery.isWindow( elem ) ) {

			bubbleType = special.delegateType || type;
			if ( !rfocusMorph.test( bubbleType + type ) ) {
				cur = cur.parentNode;
			}
			for ( ; cur; cur = cur.parentNode ) {
				eventPath.push( cur );
				tmp = cur;
			}

			// Only add window if we got to document (e.g., not plain obj or detached DOM)
			if ( tmp === ( elem.ownerDocument || document ) ) {
				eventPath.push( tmp.defaultView || tmp.parentWindow || window );
			}
		}

		// Fire handlers on the event path
		i = 0;
		while ( ( cur = eventPath[ i++ ] ) && !event.isPropagationStopped() ) {

			event.type = i > 1 ?
				bubbleType :
				special.bindType || type;

			// jQuery handler
			handle = ( jQuery._data( cur, "events" ) || {} )[ event.type ] &&
				jQuery._data( cur, "handle" );

			if ( handle ) {
				handle.apply( cur, data );
			}

			// Native handler
			handle = ontype && cur[ ontype ];
			if ( handle && handle.apply && acceptData( cur ) ) {
				event.result = handle.apply( cur, data );
				if ( event.result === false ) {
					event.preventDefault();
				}
			}
		}
		event.type = type;

		// If nobody prevented the default action, do it now
		if ( !onlyHandlers && !event.isDefaultPrevented() ) {

			if (
				( !special._default ||
				 special._default.apply( eventPath.pop(), data ) === false
				) && acceptData( elem )
			) {

				// Call a native DOM method on the target with the same name name as the event.
				// Can't use an .isFunction() check here because IE6/7 fails that test.
				// Don't do default actions on window, that's where global variables be (#6170)
				if ( ontype && elem[ type ] && !jQuery.isWindow( elem ) ) {

					// Don't re-trigger an onFOO event when we call its FOO() method
					tmp = elem[ ontype ];

					if ( tmp ) {
						elem[ ontype ] = null;
					}

					// Prevent re-triggering of the same event, since we already bubbled it above
					jQuery.event.triggered = type;
					try {
						elem[ type ]();
					} catch ( e ) {

						// IE<9 dies on focus/blur to hidden element (#1486,#12518)
						// only reproducible on winXP IE8 native, not IE9 in IE8 mode
					}
					jQuery.event.triggered = undefined;

					if ( tmp ) {
						elem[ ontype ] = tmp;
					}
				}
			}
		}

		return event.result;
	},

	dispatch: function( event ) {

		// Make a writable jQuery.Event from the native event object
		event = jQuery.event.fix( event );

		var i, j, ret, matched, handleObj,
			handlerQueue = [],
			args = slice.call( arguments ),
			handlers = ( jQuery._data( this, "events" ) || {} )[ event.type ] || [],
			special = jQuery.event.special[ event.type ] || {};

		// Use the fix-ed jQuery.Event rather than the (read-only) native event
		args[ 0 ] = event;
		event.delegateTarget = this;

		// Call the preDispatch hook for the mapped type, and let it bail if desired
		if ( special.preDispatch && special.preDispatch.call( this, event ) === false ) {
			return;
		}

		// Determine handlers
		handlerQueue = jQuery.event.handlers.call( this, event, handlers );

		// Run delegates first; they may want to stop propagation beneath us
		i = 0;
		while ( ( matched = handlerQueue[ i++ ] ) && !event.isPropagationStopped() ) {
			event.currentTarget = matched.elem;

			j = 0;
			while ( ( handleObj = matched.handlers[ j++ ] ) &&
				!event.isImmediatePropagationStopped() ) {

				// Triggered event must either 1) have no namespace, or 2) have namespace(s)
				// a subset or equal to those in the bound event (both can have no namespace).
				if ( !event.rnamespace || event.rnamespace.test( handleObj.namespace ) ) {

					event.handleObj = handleObj;
					event.data = handleObj.data;

					ret = ( ( jQuery.event.special[ handleObj.origType ] || {} ).handle ||
						handleObj.handler ).apply( matched.elem, args );

					if ( ret !== undefined ) {
						if ( ( event.result = ret ) === false ) {
							event.preventDefault();
							event.stopPropagation();
						}
					}
				}
			}
		}

		// Call the postDispatch hook for the mapped type
		if ( special.postDispatch ) {
			special.postDispatch.call( this, event );
		}

		return event.result;
	},

	handlers: function( event, handlers ) {
		var i, matches, sel, handleObj,
			handlerQueue = [],
			delegateCount = handlers.delegateCount,
			cur = event.target;

		// Support (at least): Chrome, IE9
		// Find delegate handlers
		// Black-hole SVG <use> instance trees (#13180)
		//
		// Support: Firefox<=42+
		// Avoid non-left-click in FF but don't block IE radio events (#3861, gh-2343)
		if ( delegateCount && cur.nodeType &&
			( event.type !== "click" || isNaN( event.button ) || event.button < 1 ) ) {

			/* jshint eqeqeq: false */
			for ( ; cur != this; cur = cur.parentNode || this ) {
				/* jshint eqeqeq: true */

				// Don't check non-elements (#13208)
				// Don't process clicks on disabled elements (#6911, #8165, #11382, #11764)
				if ( cur.nodeType === 1 && ( cur.disabled !== true || event.type !== "click" ) ) {
					matches = [];
					for ( i = 0; i < delegateCount; i++ ) {
						handleObj = handlers[ i ];

						// Don't conflict with Object.prototype properties (#13203)
						sel = handleObj.selector + " ";

						if ( matches[ sel ] === undefined ) {
							matches[ sel ] = handleObj.needsContext ?
								jQuery( sel, this ).index( cur ) > -1 :
								jQuery.find( sel, this, null, [ cur ] ).length;
						}
						if ( matches[ sel ] ) {
							matches.push( handleObj );
						}
					}
					if ( matches.length ) {
						handlerQueue.push( { elem: cur, handlers: matches } );
					}
				}
			}
		}

		// Add the remaining (directly-bound) handlers
		if ( delegateCount < handlers.length ) {
			handlerQueue.push( { elem: this, handlers: handlers.slice( delegateCount ) } );
		}

		return handlerQueue;
	},

	fix: function( event ) {
		if ( event[ jQuery.expando ] ) {
			return event;
		}

		// Create a writable copy of the event object and normalize some properties
		var i, prop, copy,
			type = event.type,
			originalEvent = event,
			fixHook = this.fixHooks[ type ];

		if ( !fixHook ) {
			this.fixHooks[ type ] = fixHook =
				rmouseEvent.test( type ) ? this.mouseHooks :
				rkeyEvent.test( type ) ? this.keyHooks :
				{};
		}
		copy = fixHook.props ? this.props.concat( fixHook.props ) : this.props;

		event = new jQuery.Event( originalEvent );

		i = copy.length;
		while ( i-- ) {
			prop = copy[ i ];
			event[ prop ] = originalEvent[ prop ];
		}

		// Support: IE<9
		// Fix target property (#1925)
		if ( !event.target ) {
			event.target = originalEvent.srcElement || document;
		}

		// Support: Safari 6-8+
		// Target should not be a text node (#504, #13143)
		if ( event.target.nodeType === 3 ) {
			event.target = event.target.parentNode;
		}

		// Support: IE<9
		// For mouse/key events, metaKey==false if it's undefined (#3368, #11328)
		event.metaKey = !!event.metaKey;

		return fixHook.filter ? fixHook.filter( event, originalEvent ) : event;
	},

	// Includes some event props shared by KeyEvent and MouseEvent
	props: ( "altKey bubbles cancelable ctrlKey currentTarget detail eventPhase " +
		"metaKey relatedTarget shiftKey target timeStamp view which" ).split( " " ),

	fixHooks: {},

	keyHooks: {
		props: "char charCode key keyCode".split( " " ),
		filter: function( event, original ) {

			// Add which for key events
			if ( event.which == null ) {
				event.which = original.charCode != null ? original.charCode : original.keyCode;
			}

			return event;
		}
	},

	mouseHooks: {
		props: ( "button buttons clientX clientY fromElement offsetX offsetY " +
			"pageX pageY screenX screenY toElement" ).split( " " ),
		filter: function( event, original ) {
			var body, eventDoc, doc,
				button = original.button,
				fromElement = original.fromElement;

			// Calculate pageX/Y if missing and clientX/Y available
			if ( event.pageX == null && original.clientX != null ) {
				eventDoc = event.target.ownerDocument || document;
				doc = eventDoc.documentElement;
				body = eventDoc.body;

				event.pageX = original.clientX +
					( doc && doc.scrollLeft || body && body.scrollLeft || 0 ) -
					( doc && doc.clientLeft || body && body.clientLeft || 0 );
				event.pageY = original.clientY +
					( doc && doc.scrollTop  || body && body.scrollTop  || 0 ) -
					( doc && doc.clientTop  || body && body.clientTop  || 0 );
			}

			// Add relatedTarget, if necessary
			if ( !event.relatedTarget && fromElement ) {
				event.relatedTarget = fromElement === event.target ?
					original.toElement :
					fromElement;
			}

			// Add which for click: 1 === left; 2 === middle; 3 === right
			// Note: button is not normalized, so don't use it
			if ( !event.which && button !== undefined ) {
				event.which = ( button & 1 ? 1 : ( button & 2 ? 3 : ( button & 4 ? 2 : 0 ) ) );
			}

			return event;
		}
	},

	special: {
		load: {

			// Prevent triggered image.load events from bubbling to window.load
			noBubble: true
		},
		focus: {

			// Fire native event if possible so blur/focus sequence is correct
			trigger: function() {
				if ( this !== safeActiveElement() && this.focus ) {
					try {
						this.focus();
						return false;
					} catch ( e ) {

						// Support: IE<9
						// If we error on focus to hidden element (#1486, #12518),
						// let .trigger() run the handlers
					}
				}
			},
			delegateType: "focusin"
		},
		blur: {
			trigger: function() {
				if ( this === safeActiveElement() && this.blur ) {
					this.blur();
					return false;
				}
			},
			delegateType: "focusout"
		},
		click: {

			// For checkbox, fire native event so checked state will be right
			trigger: function() {
				if ( jQuery.nodeName( this, "input" ) && this.type === "checkbox" && this.click ) {
					this.click();
					return false;
				}
			},

			// For cross-browser consistency, don't fire native .click() on links
			_default: function( event ) {
				return jQuery.nodeName( event.target, "a" );
			}
		},

		beforeunload: {
			postDispatch: function( event ) {

				// Support: Firefox 20+
				// Firefox doesn't alert if the returnValue field is not set.
				if ( event.result !== undefined && event.originalEvent ) {
					event.originalEvent.returnValue = event.result;
				}
			}
		}
	},

	// Piggyback on a donor event to simulate a different one
	simulate: function( type, elem, event ) {
		var e = jQuery.extend(
			new jQuery.Event(),
			event,
			{
				type: type,
				isSimulated: true

				// Previously, `originalEvent: {}` was set here, so stopPropagation call
				// would not be triggered on donor event, since in our own
				// jQuery.event.stopPropagation function we had a check for existence of
				// originalEvent.stopPropagation method, so, consequently it would be a noop.
				//
				// Guard for simulated events was moved to jQuery.event.stopPropagation function
				// since `originalEvent` should point to the original event for the
				// constancy with other events and for more focused logic
			}
		);

		jQuery.event.trigger( e, null, elem );

		if ( e.isDefaultPrevented() ) {
			event.preventDefault();
		}
	}
};

jQuery.removeEvent = document.removeEventListener ?
	function( elem, type, handle ) {

		// This "if" is needed for plain objects
		if ( elem.removeEventListener ) {
			elem.removeEventListener( type, handle );
		}
	} :
	function( elem, type, handle ) {
		var name = "on" + type;

		if ( elem.detachEvent ) {

			// #8545, #7054, preventing memory leaks for custom events in IE6-8
			// detachEvent needed property on element, by name of that event,
			// to properly expose it to GC
			if ( typeof elem[ name ] === "undefined" ) {
				elem[ name ] = null;
			}

			elem.detachEvent( name, handle );
		}
	};

jQuery.Event = function( src, props ) {

	// Allow instantiation without the 'new' keyword
	if ( !( this instanceof jQuery.Event ) ) {
		return new jQuery.Event( src, props );
	}

	// Event object
	if ( src && src.type ) {
		this.originalEvent = src;
		this.type = src.type;

		// Events bubbling up the document may have been marked as prevented
		// by a handler lower down the tree; reflect the correct value.
		this.isDefaultPrevented = src.defaultPrevented ||
				src.defaultPrevented === undefined &&

				// Support: IE < 9, Android < 4.0
				src.returnValue === false ?
			returnTrue :
			returnFalse;

	// Event type
	} else {
		this.type = src;
	}

	// Put explicitly provided properties onto the event object
	if ( props ) {
		jQuery.extend( this, props );
	}

	// Create a timestamp if incoming event doesn't have one
	this.timeStamp = src && src.timeStamp || jQuery.now();

	// Mark it as fixed
	this[ jQuery.expando ] = true;
};

// jQuery.Event is based on DOM3 Events as specified by the ECMAScript Language Binding
// http://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
jQuery.Event.prototype = {
	constructor: jQuery.Event,
	isDefaultPrevented: returnFalse,
	isPropagationStopped: returnFalse,
	isImmediatePropagationStopped: returnFalse,

	preventDefault: function() {
		var e = this.originalEvent;

		this.isDefaultPrevented = returnTrue;
		if ( !e ) {
			return;
		}

		// If preventDefault exists, run it on the original event
		if ( e.preventDefault ) {
			e.preventDefault();

		// Support: IE
		// Otherwise set the returnValue property of the original event to false
		} else {
			e.returnValue = false;
		}
	},
	stopPropagation: function() {
		var e = this.originalEvent;

		this.isPropagationStopped = returnTrue;

		if ( !e || this.isSimulated ) {
			return;
		}

		// If stopPropagation exists, run it on the original event
		if ( e.stopPropagation ) {
			e.stopPropagation();
		}

		// Support: IE
		// Set the cancelBubble property of the original event to true
		e.cancelBubble = true;
	},
	stopImmediatePropagation: function() {
		var e = this.originalEvent;

		this.isImmediatePropagationStopped = returnTrue;

		if ( e && e.stopImmediatePropagation ) {
			e.stopImmediatePropagation();
		}

		this.stopPropagation();
	}
};

// Create mouseenter/leave events using mouseover/out and event-time checks
// so that event delegation works in jQuery.
// Do the same for pointerenter/pointerleave and pointerover/pointerout
//
// Support: Safari 7 only
// Safari sends mouseenter too often; see:
// https://code.google.com/p/chromium/issues/detail?id=470258
// for the description of the bug (it existed in older Chrome versions as well).
jQuery.each( {
	mouseenter: "mouseover",
	mouseleave: "mouseout",
	pointerenter: "pointerover",
	pointerleave: "pointerout"
}, function( orig, fix ) {
	jQuery.event.special[ orig ] = {
		delegateType: fix,
		bindType: fix,

		handle: function( event ) {
			var ret,
				target = this,
				related = event.relatedTarget,
				handleObj = event.handleObj;

			// For mouseenter/leave call the handler if related is outside the target.
			// NB: No relatedTarget if the mouse left/entered the browser window
			if ( !related || ( related !== target && !jQuery.contains( target, related ) ) ) {
				event.type = handleObj.origType;
				ret = handleObj.handler.apply( this, arguments );
				event.type = fix;
			}
			return ret;
		}
	};
} );

// IE submit delegation
if ( !support.submit ) {

	jQuery.event.special.submit = {
		setup: function() {

			// Only need this for delegated form submit events
			if ( jQuery.nodeName( this, "form" ) ) {
				return false;
			}

			// Lazy-add a submit handler when a descendant form may potentially be submitted
			jQuery.event.add( this, "click._submit keypress._submit", function( e ) {

				// Node name check avoids a VML-related crash in IE (#9807)
				var elem = e.target,
					form = jQuery.nodeName( elem, "input" ) || jQuery.nodeName( elem, "button" ) ?

						// Support: IE <=8
						// We use jQuery.prop instead of elem.form
						// to allow fixing the IE8 delegated submit issue (gh-2332)
						// by 3rd party polyfills/workarounds.
						jQuery.prop( elem, "form" ) :
						undefined;

				if ( form && !jQuery._data( form, "submit" ) ) {
					jQuery.event.add( form, "submit._submit", function( event ) {
						event._submitBubble = true;
					} );
					jQuery._data( form, "submit", true );
				}
			} );

			// return undefined since we don't need an event listener
		},

		postDispatch: function( event ) {

			// If form was submitted by the user, bubble the event up the tree
			if ( event._submitBubble ) {
				delete event._submitBubble;
				if ( this.parentNode && !event.isTrigger ) {
					jQuery.event.simulate( "submit", this.parentNode, event );
				}
			}
		},

		teardown: function() {

			// Only need this for delegated form submit events
			if ( jQuery.nodeName( this, "form" ) ) {
				return false;
			}

			// Remove delegated handlers; cleanData eventually reaps submit handlers attached above
			jQuery.event.remove( this, "._submit" );
		}
	};
}

// IE change delegation and checkbox/radio fix
if ( !support.change ) {

	jQuery.event.special.change = {

		setup: function() {

			if ( rformElems.test( this.nodeName ) ) {

				// IE doesn't fire change on a check/radio until blur; trigger it on click
				// after a propertychange. Eat the blur-change in special.change.handle.
				// This still fires onchange a second time for check/radio after blur.
				if ( this.type === "checkbox" || this.type === "radio" ) {
					jQuery.event.add( this, "propertychange._change", function( event ) {
						if ( event.originalEvent.propertyName === "checked" ) {
							this._justChanged = true;
						}
					} );
					jQuery.event.add( this, "click._change", function( event ) {
						if ( this._justChanged && !event.isTrigger ) {
							this._justChanged = false;
						}

						// Allow triggered, simulated change events (#11500)
						jQuery.event.simulate( "change", this, event );
					} );
				}
				return false;
			}

			// Delegated event; lazy-add a change handler on descendant inputs
			jQuery.event.add( this, "beforeactivate._change", function( e ) {
				var elem = e.target;

				if ( rformElems.test( elem.nodeName ) && !jQuery._data( elem, "change" ) ) {
					jQuery.event.add( elem, "change._change", function( event ) {
						if ( this.parentNode && !event.isSimulated && !event.isTrigger ) {
							jQuery.event.simulate( "change", this.parentNode, event );
						}
					} );
					jQuery._data( elem, "change", true );
				}
			} );
		},

		handle: function( event ) {
			var elem = event.target;

			// Swallow native change events from checkbox/radio, we already triggered them above
			if ( this !== elem || event.isSimulated || event.isTrigger ||
				( elem.type !== "radio" && elem.type !== "checkbox" ) ) {

				return event.handleObj.handler.apply( this, arguments );
			}
		},

		teardown: function() {
			jQuery.event.remove( this, "._change" );

			return !rformElems.test( this.nodeName );
		}
	};
}

// Support: Firefox
// Firefox doesn't have focus(in | out) events
// Related ticket - https://bugzilla.mozilla.org/show_bug.cgi?id=687787
//
// Support: Chrome, Safari
// focus(in | out) events fire after focus & blur events,
// which is spec violation - http://www.w3.org/TR/DOM-Level-3-Events/#events-focusevent-event-order
// Related ticket - https://code.google.com/p/chromium/issues/detail?id=449857
if ( !support.focusin ) {
	jQuery.each( { focus: "focusin", blur: "focusout" }, function( orig, fix ) {

		// Attach a single capturing handler on the document while someone wants focusin/focusout
		var handler = function( event ) {
			jQuery.event.simulate( fix, event.target, jQuery.event.fix( event ) );
		};

		jQuery.event.special[ fix ] = {
			setup: function() {
				var doc = this.ownerDocument || this,
					attaches = jQuery._data( doc, fix );

				if ( !attaches ) {
					doc.addEventListener( orig, handler, true );
				}
				jQuery._data( doc, fix, ( attaches || 0 ) + 1 );
			},
			teardown: function() {
				var doc = this.ownerDocument || this,
					attaches = jQuery._data( doc, fix ) - 1;

				if ( !attaches ) {
					doc.removeEventListener( orig, handler, true );
					jQuery._removeData( doc, fix );
				} else {
					jQuery._data( doc, fix, attaches );
				}
			}
		};
	} );
}

jQuery.fn.extend( {

	on: function( types, selector, data, fn ) {
		return on( this, types, selector, data, fn );
	},
	one: function( types, selector, data, fn ) {
		return on( this, types, selector, data, fn, 1 );
	},
	off: function( types, selector, fn ) {
		var handleObj, type;
		if ( types && types.preventDefault && types.handleObj ) {

			// ( event )  dispatched jQuery.Event
			handleObj = types.handleObj;
			jQuery( types.delegateTarget ).off(
				handleObj.namespace ?
					handleObj.origType + "." + handleObj.namespace :
					handleObj.origType,
				handleObj.selector,
				handleObj.handler
			);
			return this;
		}
		if ( typeof types === "object" ) {

			// ( types-object [, selector] )
			for ( type in types ) {
				this.off( type, selector, types[ type ] );
			}
			return this;
		}
		if ( selector === false || typeof selector === "function" ) {

			// ( types [, fn] )
			fn = selector;
			selector = undefined;
		}
		if ( fn === false ) {
			fn = returnFalse;
		}
		return this.each( function() {
			jQuery.event.remove( this, types, fn, selector );
		} );
	},

	trigger: function( type, data ) {
		return this.each( function() {
			jQuery.event.trigger( type, data, this );
		} );
	},
	triggerHandler: function( type, data ) {
		var elem = this[ 0 ];
		if ( elem ) {
			return jQuery.event.trigger( type, data, elem, true );
		}
	}
} );


var rinlinejQuery = / jQuery\d+="(?:null|\d+)"/g,
	rnoshimcache = new RegExp( "<(?:" + nodeNames + ")[\\s/>]", "i" ),
	rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:-]+)[^>]*)\/>/gi,

	// Support: IE 10-11, Edge 10240+
	// In IE/Edge using regex groups here causes severe slowdowns.
	// See https://connect.microsoft.com/IE/feedback/details/1736512/
	rnoInnerhtml = /<script|<style|<link/i,

	// checked="checked" or checked
	rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i,
	rscriptTypeMasked = /^true\/(.*)/,
	rcleanScript = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g,
	safeFragment = createSafeFragment( document ),
	fragmentDiv = safeFragment.appendChild( document.createElement( "div" ) );

// Support: IE<8
// Manipulating tables requires a tbody
function manipulationTarget( elem, content ) {
	return jQuery.nodeName( elem, "table" ) &&
		jQuery.nodeName( content.nodeType !== 11 ? content : content.firstChild, "tr" ) ?

		elem.getElementsByTagName( "tbody" )[ 0 ] ||
			elem.appendChild( elem.ownerDocument.createElement( "tbody" ) ) :
		elem;
}

// Replace/restore the type attribute of script elements for safe DOM manipulation
function disableScript( elem ) {
	elem.type = ( jQuery.find.attr( elem, "type" ) !== null ) + "/" + elem.type;
	return elem;
}
function restoreScript( elem ) {
	var match = rscriptTypeMasked.exec( elem.type );
	if ( match ) {
		elem.type = match[ 1 ];
	} else {
		elem.removeAttribute( "type" );
	}
	return elem;
}

function cloneCopyEvent( src, dest ) {
	if ( dest.nodeType !== 1 || !jQuery.hasData( src ) ) {
		return;
	}

	var type, i, l,
		oldData = jQuery._data( src ),
		curData = jQuery._data( dest, oldData ),
		events = oldData.events;

	if ( events ) {
		delete curData.handle;
		curData.events = {};

		for ( type in events ) {
			for ( i = 0, l = events[ type ].length; i < l; i++ ) {
				jQuery.event.add( dest, type, events[ type ][ i ] );
			}
		}
	}

	// make the cloned public data object a copy from the original
	if ( curData.data ) {
		curData.data = jQuery.extend( {}, curData.data );
	}
}

function fixCloneNodeIssues( src, dest ) {
	var nodeName, e, data;

	// We do not need to do anything for non-Elements
	if ( dest.nodeType !== 1 ) {
		return;
	}

	nodeName = dest.nodeName.toLowerCase();

	// IE6-8 copies events bound via attachEvent when using cloneNode.
	if ( !support.noCloneEvent && dest[ jQuery.expando ] ) {
		data = jQuery._data( dest );

		for ( e in data.events ) {
			jQuery.removeEvent( dest, e, data.handle );
		}

		// Event data gets referenced instead of copied if the expando gets copied too
		dest.removeAttribute( jQuery.expando );
	}

	// IE blanks contents when cloning scripts, and tries to evaluate newly-set text
	if ( nodeName === "script" && dest.text !== src.text ) {
		disableScript( dest ).text = src.text;
		restoreScript( dest );

	// IE6-10 improperly clones children of object elements using classid.
	// IE10 throws NoModificationAllowedError if parent is null, #12132.
	} else if ( nodeName === "object" ) {
		if ( dest.parentNode ) {
			dest.outerHTML = src.outerHTML;
		}

		// This path appears unavoidable for IE9. When cloning an object
		// element in IE9, the outerHTML strategy above is not sufficient.
		// If the src has innerHTML and the destination does not,
		// copy the src.innerHTML into the dest.innerHTML. #10324
		if ( support.html5Clone && ( src.innerHTML && !jQuery.trim( dest.innerHTML ) ) ) {
			dest.innerHTML = src.innerHTML;
		}

	} else if ( nodeName === "input" && rcheckableType.test( src.type ) ) {

		// IE6-8 fails to persist the checked state of a cloned checkbox
		// or radio button. Worse, IE6-7 fail to give the cloned element
		// a checked appearance if the defaultChecked value isn't also set

		dest.defaultChecked = dest.checked = src.checked;

		// IE6-7 get confused and end up setting the value of a cloned
		// checkbox/radio button to an empty string instead of "on"
		if ( dest.value !== src.value ) {
			dest.value = src.value;
		}

	// IE6-8 fails to return the selected option to the default selected
	// state when cloning options
	} else if ( nodeName === "option" ) {
		dest.defaultSelected = dest.selected = src.defaultSelected;

	// IE6-8 fails to set the defaultValue to the correct value when
	// cloning other types of input fields
	} else if ( nodeName === "input" || nodeName === "textarea" ) {
		dest.defaultValue = src.defaultValue;
	}
}

function domManip( collection, args, callback, ignored ) {

	// Flatten any nested arrays
	args = concat.apply( [], args );

	var first, node, hasScripts,
		scripts, doc, fragment,
		i = 0,
		l = collection.length,
		iNoClone = l - 1,
		value = args[ 0 ],
		isFunction = jQuery.isFunction( value );

	// We can't cloneNode fragments that contain checked, in WebKit
	if ( isFunction ||
			( l > 1 && typeof value === "string" &&
				!support.checkClone && rchecked.test( value ) ) ) {
		return collection.each( function( index ) {
			var self = collection.eq( index );
			if ( isFunction ) {
				args[ 0 ] = value.call( this, index, self.html() );
			}
			domManip( self, args, callback, ignored );
		} );
	}

	if ( l ) {
		fragment = buildFragment( args, collection[ 0 ].ownerDocument, false, collection, ignored );
		first = fragment.firstChild;

		if ( fragment.childNodes.length === 1 ) {
			fragment = first;
		}

		// Require either new content or an interest in ignored elements to invoke the callback
		if ( first || ignored ) {
			scripts = jQuery.map( getAll( fragment, "script" ), disableScript );
			hasScripts = scripts.length;

			// Use the original fragment for the last item
			// instead of the first because it can end up
			// being emptied incorrectly in certain situations (#8070).
			for ( ; i < l; i++ ) {
				node = fragment;

				if ( i !== iNoClone ) {
					node = jQuery.clone( node, true, true );

					// Keep references to cloned scripts for later restoration
					if ( hasScripts ) {

						// Support: Android<4.1, PhantomJS<2
						// push.apply(_, arraylike) throws on ancient WebKit
						jQuery.merge( scripts, getAll( node, "script" ) );
					}
				}

				callback.call( collection[ i ], node, i );
			}

			if ( hasScripts ) {
				doc = scripts[ scripts.length - 1 ].ownerDocument;

				// Reenable scripts
				jQuery.map( scripts, restoreScript );

				// Evaluate executable scripts on first document insertion
				for ( i = 0; i < hasScripts; i++ ) {
					node = scripts[ i ];
					if ( rscriptType.test( node.type || "" ) &&
						!jQuery._data( node, "globalEval" ) &&
						jQuery.contains( doc, node ) ) {

						if ( node.src ) {

							// Optional AJAX dependency, but won't run scripts if not present
							if ( jQuery._evalUrl ) {
								jQuery._evalUrl( node.src );
							}
						} else {
							jQuery.globalEval(
								( node.text || node.textContent || node.innerHTML || "" )
									.replace( rcleanScript, "" )
							);
						}
					}
				}
			}

			// Fix #11809: Avoid leaking memory
			fragment = first = null;
		}
	}

	return collection;
}

function remove( elem, selector, keepData ) {
	var node,
		elems = selector ? jQuery.filter( selector, elem ) : elem,
		i = 0;

	for ( ; ( node = elems[ i ] ) != null; i++ ) {

		if ( !keepData && node.nodeType === 1 ) {
			jQuery.cleanData( getAll( node ) );
		}

		if ( node.parentNode ) {
			if ( keepData && jQuery.contains( node.ownerDocument, node ) ) {
				setGlobalEval( getAll( node, "script" ) );
			}
			node.parentNode.removeChild( node );
		}
	}

	return elem;
}

jQuery.extend( {
	htmlPrefilter: function( html ) {
		return html.replace( rxhtmlTag, "<$1></$2>" );
	},

	clone: function( elem, dataAndEvents, deepDataAndEvents ) {
		var destElements, node, clone, i, srcElements,
			inPage = jQuery.contains( elem.ownerDocument, elem );

		if ( support.html5Clone || jQuery.isXMLDoc( elem ) ||
			!rnoshimcache.test( "<" + elem.nodeName + ">" ) ) {

			clone = elem.cloneNode( true );

		// IE<=8 does not properly clone detached, unknown element nodes
		} else {
			fragmentDiv.innerHTML = elem.outerHTML;
			fragmentDiv.removeChild( clone = fragmentDiv.firstChild );
		}

		if ( ( !support.noCloneEvent || !support.noCloneChecked ) &&
				( elem.nodeType === 1 || elem.nodeType === 11 ) && !jQuery.isXMLDoc( elem ) ) {

			// We eschew Sizzle here for performance reasons: http://jsperf.com/getall-vs-sizzle/2
			destElements = getAll( clone );
			srcElements = getAll( elem );

			// Fix all IE cloning issues
			for ( i = 0; ( node = srcElements[ i ] ) != null; ++i ) {

				// Ensure that the destination node is not null; Fixes #9587
				if ( destElements[ i ] ) {
					fixCloneNodeIssues( node, destElements[ i ] );
				}
			}
		}

		// Copy the events from the original to the clone
		if ( dataAndEvents ) {
			if ( deepDataAndEvents ) {
				srcElements = srcElements || getAll( elem );
				destElements = destElements || getAll( clone );

				for ( i = 0; ( node = srcElements[ i ] ) != null; i++ ) {
					cloneCopyEvent( node, destElements[ i ] );
				}
			} else {
				cloneCopyEvent( elem, clone );
			}
		}

		// Preserve script evaluation history
		destElements = getAll( clone, "script" );
		if ( destElements.length > 0 ) {
			setGlobalEval( destElements, !inPage && getAll( elem, "script" ) );
		}

		destElements = srcElements = node = null;

		// Return the cloned set
		return clone;
	},

	cleanData: function( elems, /* internal */ forceAcceptData ) {
		var elem, type, id, data,
			i = 0,
			internalKey = jQuery.expando,
			cache = jQuery.cache,
			attributes = support.attributes,
			special = jQuery.event.special;

		for ( ; ( elem = elems[ i ] ) != null; i++ ) {
			if ( forceAcceptData || acceptData( elem ) ) {

				id = elem[ internalKey ];
				data = id && cache[ id ];

				if ( data ) {
					if ( data.events ) {
						for ( type in data.events ) {
							if ( special[ type ] ) {
								jQuery.event.remove( elem, type );

							// This is a shortcut to avoid jQuery.event.remove's overhead
							} else {
								jQuery.removeEvent( elem, type, data.handle );
							}
						}
					}

					// Remove cache only if it was not already removed by jQuery.event.remove
					if ( cache[ id ] ) {

						delete cache[ id ];

						// Support: IE<9
						// IE does not allow us to delete expando properties from nodes
						// IE creates expando attributes along with the property
						// IE does not have a removeAttribute function on Document nodes
						if ( !attributes && typeof elem.removeAttribute !== "undefined" ) {
							elem.removeAttribute( internalKey );

						// Webkit & Blink performance suffers when deleting properties
						// from DOM nodes, so set to undefined instead
						// https://code.google.com/p/chromium/issues/detail?id=378607
						} else {
							elem[ internalKey ] = undefined;
						}

						deletedIds.push( id );
					}
				}
			}
		}
	}
} );

jQuery.fn.extend( {

	// Keep domManip exposed until 3.0 (gh-2225)
	domManip: domManip,

	detach: function( selector ) {
		return remove( this, selector, true );
	},

	remove: function( selector ) {
		return remove( this, selector );
	},

	text: function( value ) {
		return access( this, function( value ) {
			return value === undefined ?
				jQuery.text( this ) :
				this.empty().append(
					( this[ 0 ] && this[ 0 ].ownerDocument || document ).createTextNode( value )
				);
		}, null, value, arguments.length );
	},

	append: function() {
		return domManip( this, arguments, function( elem ) {
			if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
				var target = manipulationTarget( this, elem );
				target.appendChild( elem );
			}
		} );
	},

	prepend: function() {
		return domManip( this, arguments, function( elem ) {
			if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
				var target = manipulationTarget( this, elem );
				target.insertBefore( elem, target.firstChild );
			}
		} );
	},

	before: function() {
		return domManip( this, arguments, function( elem ) {
			if ( this.parentNode ) {
				this.parentNode.insertBefore( elem, this );
			}
		} );
	},

	after: function() {
		return domManip( this, arguments, function( elem ) {
			if ( this.parentNode ) {
				this.parentNode.insertBefore( elem, this.nextSibling );
			}
		} );
	},

	empty: function() {
		var elem,
			i = 0;

		for ( ; ( elem = this[ i ] ) != null; i++ ) {

			// Remove element nodes and prevent memory leaks
			if ( elem.nodeType === 1 ) {
				jQuery.cleanData( getAll( elem, false ) );
			}

			// Remove any remaining nodes
			while ( elem.firstChild ) {
				elem.removeChild( elem.firstChild );
			}

			// If this is a select, ensure that it displays empty (#12336)
			// Support: IE<9
			if ( elem.options && jQuery.nodeName( elem, "select" ) ) {
				elem.options.length = 0;
			}
		}

		return this;
	},

	clone: function( dataAndEvents, deepDataAndEvents ) {
		dataAndEvents = dataAndEvents == null ? false : dataAndEvents;
		deepDataAndEvents = deepDataAndEvents == null ? dataAndEvents : deepDataAndEvents;

		return this.map( function() {
			return jQuery.clone( this, dataAndEvents, deepDataAndEvents );
		} );
	},

	html: function( value ) {
		return access( this, function( value ) {
			var elem = this[ 0 ] || {},
				i = 0,
				l = this.length;

			if ( value === undefined ) {
				return elem.nodeType === 1 ?
					elem.innerHTML.replace( rinlinejQuery, "" ) :
					undefined;
			}

			// See if we can take a shortcut and just use innerHTML
			if ( typeof value === "string" && !rnoInnerhtml.test( value ) &&
				( support.htmlSerialize || !rnoshimcache.test( value )  ) &&
				( support.leadingWhitespace || !rleadingWhitespace.test( value ) ) &&
				!wrapMap[ ( rtagName.exec( value ) || [ "", "" ] )[ 1 ].toLowerCase() ] ) {

				value = jQuery.htmlPrefilter( value );

				try {
					for ( ; i < l; i++ ) {

						// Remove element nodes and prevent memory leaks
						elem = this[ i ] || {};
						if ( elem.nodeType === 1 ) {
							jQuery.cleanData( getAll( elem, false ) );
							elem.innerHTML = value;
						}
					}

					elem = 0;

				// If using innerHTML throws an exception, use the fallback method
				} catch ( e ) {}
			}

			if ( elem ) {
				this.empty().append( value );
			}
		}, null, value, arguments.length );
	},

	replaceWith: function() {
		var ignored = [];

		// Make the changes, replacing each non-ignored context element with the new content
		return domManip( this, arguments, function( elem ) {
			var parent = this.parentNode;

			if ( jQuery.inArray( this, ignored ) < 0 ) {
				jQuery.cleanData( getAll( this ) );
				if ( parent ) {
					parent.replaceChild( elem, this );
				}
			}

		// Force callback invocation
		}, ignored );
	}
} );

jQuery.each( {
	appendTo: "append",
	prependTo: "prepend",
	insertBefore: "before",
	insertAfter: "after",
	replaceAll: "replaceWith"
}, function( name, original ) {
	jQuery.fn[ name ] = function( selector ) {
		var elems,
			i = 0,
			ret = [],
			insert = jQuery( selector ),
			last = insert.length - 1;

		for ( ; i <= last; i++ ) {
			elems = i === last ? this : this.clone( true );
			jQuery( insert[ i ] )[ original ]( elems );

			// Modern browsers can apply jQuery collections as arrays, but oldIE needs a .get()
			push.apply( ret, elems.get() );
		}

		return this.pushStack( ret );
	};
} );


var iframe,
	elemdisplay = {

		// Support: Firefox
		// We have to pre-define these values for FF (#10227)
		HTML: "block",
		BODY: "block"
	};

/**
 * Retrieve the actual display of a element
 * @param {String} name nodeName of the element
 * @param {Object} doc Document object
 */

// Called only from within defaultDisplay
function actualDisplay( name, doc ) {
	var elem = jQuery( doc.createElement( name ) ).appendTo( doc.body ),

		display = jQuery.css( elem[ 0 ], "display" );

	// We don't have any data stored on the element,
	// so use "detach" method as fast way to get rid of the element
	elem.detach();

	return display;
}

/**
 * Try to determine the default display value of an element
 * @param {String} nodeName
 */
function defaultDisplay( nodeName ) {
	var doc = document,
		display = elemdisplay[ nodeName ];

	if ( !display ) {
		display = actualDisplay( nodeName, doc );

		// If the simple way fails, read from inside an iframe
		if ( display === "none" || !display ) {

			// Use the already-created iframe if possible
			iframe = ( iframe || jQuery( "<iframe frameborder='0' width='0' height='0'/>" ) )
				.appendTo( doc.documentElement );

			// Always write a new HTML skeleton so Webkit and Firefox don't choke on reuse
			doc = ( iframe[ 0 ].contentWindow || iframe[ 0 ].contentDocument ).document;

			// Support: IE
			doc.write();
			doc.close();

			display = actualDisplay( nodeName, doc );
			iframe.detach();
		}

		// Store the correct default display
		elemdisplay[ nodeName ] = display;
	}

	return display;
}
var rmargin = ( /^margin/ );

var rnumnonpx = new RegExp( "^(" + pnum + ")(?!px)[a-z%]+$", "i" );

var swap = function( elem, options, callback, args ) {
	var ret, name,
		old = {};

	// Remember the old values, and insert the new ones
	for ( name in options ) {
		old[ name ] = elem.style[ name ];
		elem.style[ name ] = options[ name ];
	}

	ret = callback.apply( elem, args || [] );

	// Revert the old values
	for ( name in options ) {
		elem.style[ name ] = old[ name ];
	}

	return ret;
};


var documentElement = document.documentElement;



( function() {
	var pixelPositionVal, pixelMarginRightVal, boxSizingReliableVal,
		reliableHiddenOffsetsVal, reliableMarginRightVal, reliableMarginLeftVal,
		container = document.createElement( "div" ),
		div = document.createElement( "div" );

	// Finish early in limited (non-browser) environments
	if ( !div.style ) {
		return;
	}

	div.style.cssText = "float:left;opacity:.5";

	// Support: IE<9
	// Make sure that element opacity exists (as opposed to filter)
	support.opacity = div.style.opacity === "0.5";

	// Verify style float existence
	// (IE uses styleFloat instead of cssFloat)
	support.cssFloat = !!div.style.cssFloat;

	div.style.backgroundClip = "content-box";
	div.cloneNode( true ).style.backgroundClip = "";
	support.clearCloneStyle = div.style.backgroundClip === "content-box";

	container = document.createElement( "div" );
	container.style.cssText = "border:0;width:8px;height:0;top:0;left:-9999px;" +
		"padding:0;margin-top:1px;position:absolute";
	div.innerHTML = "";
	container.appendChild( div );

	// Support: Firefox<29, Android 2.3
	// Vendor-prefix box-sizing
	support.boxSizing = div.style.boxSizing === "" || div.style.MozBoxSizing === "" ||
		div.style.WebkitBoxSizing === "";

	jQuery.extend( support, {
		reliableHiddenOffsets: function() {
			if ( pixelPositionVal == null ) {
				computeStyleTests();
			}
			return reliableHiddenOffsetsVal;
		},

		boxSizingReliable: function() {

			// We're checking for pixelPositionVal here instead of boxSizingReliableVal
			// since that compresses better and they're computed together anyway.
			if ( pixelPositionVal == null ) {
				computeStyleTests();
			}
			return boxSizingReliableVal;
		},

		pixelMarginRight: function() {

			// Support: Android 4.0-4.3
			if ( pixelPositionVal == null ) {
				computeStyleTests();
			}
			return pixelMarginRightVal;
		},

		pixelPosition: function() {
			if ( pixelPositionVal == null ) {
				computeStyleTests();
			}
			return pixelPositionVal;
		},

		reliableMarginRight: function() {

			// Support: Android 2.3
			if ( pixelPositionVal == null ) {
				computeStyleTests();
			}
			return reliableMarginRightVal;
		},

		reliableMarginLeft: function() {

			// Support: IE <=8 only, Android 4.0 - 4.3 only, Firefox <=3 - 37
			if ( pixelPositionVal == null ) {
				computeStyleTests();
			}
			return reliableMarginLeftVal;
		}
	} );

	function computeStyleTests() {
		var contents, divStyle,
			documentElement = document.documentElement;

		// Setup
		documentElement.appendChild( container );

		div.style.cssText =

			// Support: Android 2.3
			// Vendor-prefix box-sizing
			"-webkit-box-sizing:border-box;box-sizing:border-box;" +
			"position:relative;display:block;" +
			"margin:auto;border:1px;padding:1px;" +
			"top:1%;width:50%";

		// Support: IE<9
		// Assume reasonable values in the absence of getComputedStyle
		pixelPositionVal = boxSizingReliableVal = reliableMarginLeftVal = false;
		pixelMarginRightVal = reliableMarginRightVal = true;

		// Check for getComputedStyle so that this code is not run in IE<9.
		if ( window.getComputedStyle ) {
			divStyle = window.getComputedStyle( div );
			pixelPositionVal = ( divStyle || {} ).top !== "1%";
			reliableMarginLeftVal = ( divStyle || {} ).marginLeft === "2px";
			boxSizingReliableVal = ( divStyle || { width: "4px" } ).width === "4px";

			// Support: Android 4.0 - 4.3 only
			// Some styles come back with percentage values, even though they shouldn't
			div.style.marginRight = "50%";
			pixelMarginRightVal = ( divStyle || { marginRight: "4px" } ).marginRight === "4px";

			// Support: Android 2.3 only
			// Div with explicit width and no margin-right incorrectly
			// gets computed margin-right based on width of container (#3333)
			// WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
			contents = div.appendChild( document.createElement( "div" ) );

			// Reset CSS: box-sizing; display; margin; border; padding
			contents.style.cssText = div.style.cssText =

				// Support: Android 2.3
				// Vendor-prefix box-sizing
				"-webkit-box-sizing:content-box;-moz-box-sizing:content-box;" +
				"box-sizing:content-box;display:block;margin:0;border:0;padding:0";
			contents.style.marginRight = contents.style.width = "0";
			div.style.width = "1px";

			reliableMarginRightVal =
				!parseFloat( ( window.getComputedStyle( contents ) || {} ).marginRight );

			div.removeChild( contents );
		}

		// Support: IE6-8
		// First check that getClientRects works as expected
		// Check if table cells still have offsetWidth/Height when they are set
		// to display:none and there are still other visible table cells in a
		// table row; if so, offsetWidth/Height are not reliable for use when
		// determining if an element has been hidden directly using
		// display:none (it is still safe to use offsets if a parent element is
		// hidden; don safety goggles and see bug #4512 for more information).
		div.style.display = "none";
		reliableHiddenOffsetsVal = div.getClientRects().length === 0;
		if ( reliableHiddenOffsetsVal ) {
			div.style.display = "";
			div.innerHTML = "<table><tr><td></td><td>t</td></tr></table>";
			div.childNodes[ 0 ].style.borderCollapse = "separate";
			contents = div.getElementsByTagName( "td" );
			contents[ 0 ].style.cssText = "margin:0;border:0;padding:0;display:none";
			reliableHiddenOffsetsVal = contents[ 0 ].offsetHeight === 0;
			if ( reliableHiddenOffsetsVal ) {
				contents[ 0 ].style.display = "";
				contents[ 1 ].style.display = "none";
				reliableHiddenOffsetsVal = contents[ 0 ].offsetHeight === 0;
			}
		}

		// Teardown
		documentElement.removeChild( container );
	}

} )();


var getStyles, curCSS,
	rposition = /^(top|right|bottom|left)$/;

if ( window.getComputedStyle ) {
	getStyles = function( elem ) {

		// Support: IE<=11+, Firefox<=30+ (#15098, #14150)
		// IE throws on elements created in popups
		// FF meanwhile throws on frame elements through "defaultView.getComputedStyle"
		var view = elem.ownerDocument.defaultView;

		if ( !view || !view.opener ) {
			view = window;
		}

		return view.getComputedStyle( elem );
	};

	curCSS = function( elem, name, computed ) {
		var width, minWidth, maxWidth, ret,
			style = elem.style;

		computed = computed || getStyles( elem );

		// getPropertyValue is only needed for .css('filter') in IE9, see #12537
		ret = computed ? computed.getPropertyValue( name ) || computed[ name ] : undefined;

		// Support: Opera 12.1x only
		// Fall back to style even without computed
		// computed is undefined for elems on document fragments
		if ( ( ret === "" || ret === undefined ) && !jQuery.contains( elem.ownerDocument, elem ) ) {
			ret = jQuery.style( elem, name );
		}

		if ( computed ) {

			// A tribute to the "awesome hack by Dean Edwards"
			// Chrome < 17 and Safari 5.0 uses "computed value"
			// instead of "used value" for margin-right
			// Safari 5.1.7 (at least) returns percentage for a larger set of values,
			// but width seems to be reliably pixels
			// this is against the CSSOM draft spec:
			// http://dev.w3.org/csswg/cssom/#resolved-values
			if ( !support.pixelMarginRight() && rnumnonpx.test( ret ) && rmargin.test( name ) ) {

				// Remember the original values
				width = style.width;
				minWidth = style.minWidth;
				maxWidth = style.maxWidth;

				// Put in the new values to get a computed value out
				style.minWidth = style.maxWidth = style.width = ret;
				ret = computed.width;

				// Revert the changed values
				style.width = width;
				style.minWidth = minWidth;
				style.maxWidth = maxWidth;
			}
		}

		// Support: IE
		// IE returns zIndex value as an integer.
		return ret === undefined ?
			ret :
			ret + "";
	};
} else if ( documentElement.currentStyle ) {
	getStyles = function( elem ) {
		return elem.currentStyle;
	};

	curCSS = function( elem, name, computed ) {
		var left, rs, rsLeft, ret,
			style = elem.style;

		computed = computed || getStyles( elem );
		ret = computed ? computed[ name ] : undefined;

		// Avoid setting ret to empty string here
		// so we don't default to auto
		if ( ret == null && style && style[ name ] ) {
			ret = style[ name ];
		}

		// From the awesome hack by Dean Edwards
		// http://erik.eae.net/archives/2007/07/27/18.54.15/#comment-102291

		// If we're not dealing with a regular pixel number
		// but a number that has a weird ending, we need to convert it to pixels
		// but not position css attributes, as those are
		// proportional to the parent element instead
		// and we can't measure the parent instead because it
		// might trigger a "stacking dolls" problem
		if ( rnumnonpx.test( ret ) && !rposition.test( name ) ) {

			// Remember the original values
			left = style.left;
			rs = elem.runtimeStyle;
			rsLeft = rs && rs.left;

			// Put in the new values to get a computed value out
			if ( rsLeft ) {
				rs.left = elem.currentStyle.left;
			}
			style.left = name === "fontSize" ? "1em" : ret;
			ret = style.pixelLeft + "px";

			// Revert the changed values
			style.left = left;
			if ( rsLeft ) {
				rs.left = rsLeft;
			}
		}

		// Support: IE
		// IE returns zIndex value as an integer.
		return ret === undefined ?
			ret :
			ret + "" || "auto";
	};
}




function addGetHookIf( conditionFn, hookFn ) {

	// Define the hook, we'll check on the first run if it's really needed.
	return {
		get: function() {
			if ( conditionFn() ) {

				// Hook not needed (or it's not possible to use it due
				// to missing dependency), remove it.
				delete this.get;
				return;
			}

			// Hook needed; redefine it so that the support test is not executed again.
			return ( this.get = hookFn ).apply( this, arguments );
		}
	};
}


var

		ralpha = /alpha\([^)]*\)/i,
	ropacity = /opacity\s*=\s*([^)]*)/i,

	// swappable if display is none or starts with table except
	// "table", "table-cell", or "table-caption"
	// see here for display values:
	// https://developer.mozilla.org/en-US/docs/CSS/display
	rdisplayswap = /^(none|table(?!-c[ea]).+)/,
	rnumsplit = new RegExp( "^(" + pnum + ")(.*)$", "i" ),

	cssShow = { position: "absolute", visibility: "hidden", display: "block" },
	cssNormalTransform = {
		letterSpacing: "0",
		fontWeight: "400"
	},

	cssPrefixes = [ "Webkit", "O", "Moz", "ms" ],
	emptyStyle = document.createElement( "div" ).style;


// return a css property mapped to a potentially vendor prefixed property
function vendorPropName( name ) {

	// shortcut for names that are not vendor prefixed
	if ( name in emptyStyle ) {
		return name;
	}

	// check for vendor prefixed names
	var capName = name.charAt( 0 ).toUpperCase() + name.slice( 1 ),
		i = cssPrefixes.length;

	while ( i-- ) {
		name = cssPrefixes[ i ] + capName;
		if ( name in emptyStyle ) {
			return name;
		}
	}
}

function showHide( elements, show ) {
	var display, elem, hidden,
		values = [],
		index = 0,
		length = elements.length;

	for ( ; index < length; index++ ) {
		elem = elements[ index ];
		if ( !elem.style ) {
			continue;
		}

		values[ index ] = jQuery._data( elem, "olddisplay" );
		display = elem.style.display;
		if ( show ) {

			// Reset the inline display of this element to learn if it is
			// being hidden by cascaded rules or not
			if ( !values[ index ] && display === "none" ) {
				elem.style.display = "";
			}

			// Set elements which have been overridden with display: none
			// in a stylesheet to whatever the default browser style is
			// for such an element
			if ( elem.style.display === "" && isHidden( elem ) ) {
				values[ index ] =
					jQuery._data( elem, "olddisplay", defaultDisplay( elem.nodeName ) );
			}
		} else {
			hidden = isHidden( elem );

			if ( display && display !== "none" || !hidden ) {
				jQuery._data(
					elem,
					"olddisplay",
					hidden ? display : jQuery.css( elem, "display" )
				);
			}
		}
	}

	// Set the display of most of the elements in a second loop
	// to avoid the constant reflow
	for ( index = 0; index < length; index++ ) {
		elem = elements[ index ];
		if ( !elem.style ) {
			continue;
		}
		if ( !show || elem.style.display === "none" || elem.style.display === "" ) {
			elem.style.display = show ? values[ index ] || "" : "none";
		}
	}

	return elements;
}

function setPositiveNumber( elem, value, subtract ) {
	var matches = rnumsplit.exec( value );
	return matches ?

		// Guard against undefined "subtract", e.g., when used as in cssHooks
		Math.max( 0, matches[ 1 ] - ( subtract || 0 ) ) + ( matches[ 2 ] || "px" ) :
		value;
}

function augmentWidthOrHeight( elem, name, extra, isBorderBox, styles ) {
	var i = extra === ( isBorderBox ? "border" : "content" ) ?

		// If we already have the right measurement, avoid augmentation
		4 :

		// Otherwise initialize for horizontal or vertical properties
		name === "width" ? 1 : 0,

		val = 0;

	for ( ; i < 4; i += 2 ) {

		// both box models exclude margin, so add it if we want it
		if ( extra === "margin" ) {
			val += jQuery.css( elem, extra + cssExpand[ i ], true, styles );
		}

		if ( isBorderBox ) {

			// border-box includes padding, so remove it if we want content
			if ( extra === "content" ) {
				val -= jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );
			}

			// at this point, extra isn't border nor margin, so remove border
			if ( extra !== "margin" ) {
				val -= jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
			}
		} else {

			// at this point, extra isn't content, so add padding
			val += jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );

			// at this point, extra isn't content nor padding, so add border
			if ( extra !== "padding" ) {
				val += jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
			}
		}
	}

	return val;
}

function getWidthOrHeight( elem, name, extra ) {

	// Start with offset property, which is equivalent to the border-box value
	var valueIsBorderBox = true,
		val = name === "width" ? elem.offsetWidth : elem.offsetHeight,
		styles = getStyles( elem ),
		isBorderBox = support.boxSizing &&
			jQuery.css( elem, "boxSizing", false, styles ) === "border-box";

	// some non-html elements return undefined for offsetWidth, so check for null/undefined
	// svg - https://bugzilla.mozilla.org/show_bug.cgi?id=649285
	// MathML - https://bugzilla.mozilla.org/show_bug.cgi?id=491668
	if ( val <= 0 || val == null ) {

		// Fall back to computed then uncomputed css if necessary
		val = curCSS( elem, name, styles );
		if ( val < 0 || val == null ) {
			val = elem.style[ name ];
		}

		// Computed unit is not pixels. Stop here and return.
		if ( rnumnonpx.test( val ) ) {
			return val;
		}

		// we need the check for style in case a browser which returns unreliable values
		// for getComputedStyle silently falls back to the reliable elem.style
		valueIsBorderBox = isBorderBox &&
			( support.boxSizingReliable() || val === elem.style[ name ] );

		// Normalize "", auto, and prepare for extra
		val = parseFloat( val ) || 0;
	}

	// use the active box-sizing model to add/subtract irrelevant styles
	return ( val +
		augmentWidthOrHeight(
			elem,
			name,
			extra || ( isBorderBox ? "border" : "content" ),
			valueIsBorderBox,
			styles
		)
	) + "px";
}

jQuery.extend( {

	// Add in style property hooks for overriding the default
	// behavior of getting and setting a style property
	cssHooks: {
		opacity: {
			get: function( elem, computed ) {
				if ( computed ) {

					// We should always get a number back from opacity
					var ret = curCSS( elem, "opacity" );
					return ret === "" ? "1" : ret;
				}
			}
		}
	},

	// Don't automatically add "px" to these possibly-unitless properties
	cssNumber: {
		"animationIterationCount": true,
		"columnCount": true,
		"fillOpacity": true,
		"flexGrow": true,
		"flexShrink": true,
		"fontWeight": true,
		"lineHeight": true,
		"opacity": true,
		"order": true,
		"orphans": true,
		"widows": true,
		"zIndex": true,
		"zoom": true
	},

	// Add in properties whose names you wish to fix before
	// setting or getting the value
	cssProps: {

		// normalize float css property
		"float": support.cssFloat ? "cssFloat" : "styleFloat"
	},

	// Get and set the style property on a DOM Node
	style: function( elem, name, value, extra ) {

		// Don't set styles on text and comment nodes
		if ( !elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style ) {
			return;
		}

		// Make sure that we're working with the right name
		var ret, type, hooks,
			origName = jQuery.camelCase( name ),
			style = elem.style;

		name = jQuery.cssProps[ origName ] ||
			( jQuery.cssProps[ origName ] = vendorPropName( origName ) || origName );

		// gets hook for the prefixed version
		// followed by the unprefixed version
		hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

		// Check if we're setting a value
		if ( value !== undefined ) {
			type = typeof value;

			// Convert "+=" or "-=" to relative numbers (#7345)
			if ( type === "string" && ( ret = rcssNum.exec( value ) ) && ret[ 1 ] ) {
				value = adjustCSS( elem, name, ret );

				// Fixes bug #9237
				type = "number";
			}

			// Make sure that null and NaN values aren't set. See: #7116
			if ( value == null || value !== value ) {
				return;
			}

			// If a number was passed in, add the unit (except for certain CSS properties)
			if ( type === "number" ) {
				value += ret && ret[ 3 ] || ( jQuery.cssNumber[ origName ] ? "" : "px" );
			}

			// Fixes #8908, it can be done more correctly by specifing setters in cssHooks,
			// but it would mean to define eight
			// (for every problematic property) identical functions
			if ( !support.clearCloneStyle && value === "" && name.indexOf( "background" ) === 0 ) {
				style[ name ] = "inherit";
			}

			// If a hook was provided, use that value, otherwise just set the specified value
			if ( !hooks || !( "set" in hooks ) ||
				( value = hooks.set( elem, value, extra ) ) !== undefined ) {

				// Support: IE
				// Swallow errors from 'invalid' CSS values (#5509)
				try {
					style[ name ] = value;
				} catch ( e ) {}
			}

		} else {

			// If a hook was provided get the non-computed value from there
			if ( hooks && "get" in hooks &&
				( ret = hooks.get( elem, false, extra ) ) !== undefined ) {

				return ret;
			}

			// Otherwise just get the value from the style object
			return style[ name ];
		}
	},

	css: function( elem, name, extra, styles ) {
		var num, val, hooks,
			origName = jQuery.camelCase( name );

		// Make sure that we're working with the right name
		name = jQuery.cssProps[ origName ] ||
			( jQuery.cssProps[ origName ] = vendorPropName( origName ) || origName );

		// gets hook for the prefixed version
		// followed by the unprefixed version
		hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

		// If a hook was provided get the computed value from there
		if ( hooks && "get" in hooks ) {
			val = hooks.get( elem, true, extra );
		}

		// Otherwise, if a way to get the computed value exists, use that
		if ( val === undefined ) {
			val = curCSS( elem, name, styles );
		}

		//convert "normal" to computed value
		if ( val === "normal" && name in cssNormalTransform ) {
			val = cssNormalTransform[ name ];
		}

		// Return, converting to number if forced or a qualifier was provided and val looks numeric
		if ( extra === "" || extra ) {
			num = parseFloat( val );
			return extra === true || isFinite( num ) ? num || 0 : val;
		}
		return val;
	}
} );

jQuery.each( [ "height", "width" ], function( i, name ) {
	jQuery.cssHooks[ name ] = {
		get: function( elem, computed, extra ) {
			if ( computed ) {

				// certain elements can have dimension info if we invisibly show them
				// however, it must have a current display style that would benefit from this
				return rdisplayswap.test( jQuery.css( elem, "display" ) ) &&
					elem.offsetWidth === 0 ?
						swap( elem, cssShow, function() {
							return getWidthOrHeight( elem, name, extra );
						} ) :
						getWidthOrHeight( elem, name, extra );
			}
		},

		set: function( elem, value, extra ) {
			var styles = extra && getStyles( elem );
			return setPositiveNumber( elem, value, extra ?
				augmentWidthOrHeight(
					elem,
					name,
					extra,
					support.boxSizing &&
						jQuery.css( elem, "boxSizing", false, styles ) === "border-box",
					styles
				) : 0
			);
		}
	};
} );

if ( !support.opacity ) {
	jQuery.cssHooks.opacity = {
		get: function( elem, computed ) {

			// IE uses filters for opacity
			return ropacity.test( ( computed && elem.currentStyle ?
				elem.currentStyle.filter :
				elem.style.filter ) || "" ) ?
					( 0.01 * parseFloat( RegExp.$1 ) ) + "" :
					computed ? "1" : "";
		},

		set: function( elem, value ) {
			var style = elem.style,
				currentStyle = elem.currentStyle,
				opacity = jQuery.isNumeric( value ) ? "alpha(opacity=" + value * 100 + ")" : "",
				filter = currentStyle && currentStyle.filter || style.filter || "";

			// IE has trouble with opacity if it does not have layout
			// Force it by setting the zoom level
			style.zoom = 1;

			// if setting opacity to 1, and no other filters exist -
			// attempt to remove filter attribute #6652
			// if value === "", then remove inline opacity #12685
			if ( ( value >= 1 || value === "" ) &&
					jQuery.trim( filter.replace( ralpha, "" ) ) === "" &&
					style.removeAttribute ) {

				// Setting style.filter to null, "" & " " still leave "filter:" in the cssText
				// if "filter:" is present at all, clearType is disabled, we want to avoid this
				// style.removeAttribute is IE Only, but so apparently is this code path...
				style.removeAttribute( "filter" );

				// if there is no filter style applied in a css rule
				// or unset inline opacity, we are done
				if ( value === "" || currentStyle && !currentStyle.filter ) {
					return;
				}
			}

			// otherwise, set new filter values
			style.filter = ralpha.test( filter ) ?
				filter.replace( ralpha, opacity ) :
				filter + " " + opacity;
		}
	};
}

jQuery.cssHooks.marginRight = addGetHookIf( support.reliableMarginRight,
	function( elem, computed ) {
		if ( computed ) {
			return swap( elem, { "display": "inline-block" },
				curCSS, [ elem, "marginRight" ] );
		}
	}
);

jQuery.cssHooks.marginLeft = addGetHookIf( support.reliableMarginLeft,
	function( elem, computed ) {
		if ( computed ) {
			return (
				parseFloat( curCSS( elem, "marginLeft" ) ) ||

				// Support: IE<=11+
				// Running getBoundingClientRect on a disconnected node in IE throws an error
				// Support: IE8 only
				// getClientRects() errors on disconnected elems
				( jQuery.contains( elem.ownerDocument, elem ) ?
					elem.getBoundingClientRect().left -
						swap( elem, { marginLeft: 0 }, function() {
							return elem.getBoundingClientRect().left;
						} ) :
					0
				)
			) + "px";
		}
	}
);

// These hooks are used by animate to expand properties
jQuery.each( {
	margin: "",
	padding: "",
	border: "Width"
}, function( prefix, suffix ) {
	jQuery.cssHooks[ prefix + suffix ] = {
		expand: function( value ) {
			var i = 0,
				expanded = {},

				// assumes a single number if not a string
				parts = typeof value === "string" ? value.split( " " ) : [ value ];

			for ( ; i < 4; i++ ) {
				expanded[ prefix + cssExpand[ i ] + suffix ] =
					parts[ i ] || parts[ i - 2 ] || parts[ 0 ];
			}

			return expanded;
		}
	};

	if ( !rmargin.test( prefix ) ) {
		jQuery.cssHooks[ prefix + suffix ].set = setPositiveNumber;
	}
} );

jQuery.fn.extend( {
	css: function( name, value ) {
		return access( this, function( elem, name, value ) {
			var styles, len,
				map = {},
				i = 0;

			if ( jQuery.isArray( name ) ) {
				styles = getStyles( elem );
				len = name.length;

				for ( ; i < len; i++ ) {
					map[ name[ i ] ] = jQuery.css( elem, name[ i ], false, styles );
				}

				return map;
			}

			return value !== undefined ?
				jQuery.style( elem, name, value ) :
				jQuery.css( elem, name );
		}, name, value, arguments.length > 1 );
	},
	show: function() {
		return showHide( this, true );
	},
	hide: function() {
		return showHide( this );
	},
	toggle: function( state ) {
		if ( typeof state === "boolean" ) {
			return state ? this.show() : this.hide();
		}

		return this.each( function() {
			if ( isHidden( this ) ) {
				jQuery( this ).show();
			} else {
				jQuery( this ).hide();
			}
		} );
	}
} );


function Tween( elem, options, prop, end, easing ) {
	return new Tween.prototype.init( elem, options, prop, end, easing );
}
jQuery.Tween = Tween;

Tween.prototype = {
	constructor: Tween,
	init: function( elem, options, prop, end, easing, unit ) {
		this.elem = elem;
		this.prop = prop;
		this.easing = easing || jQuery.easing._default;
		this.options = options;
		this.start = this.now = this.cur();
		this.end = end;
		this.unit = unit || ( jQuery.cssNumber[ prop ] ? "" : "px" );
	},
	cur: function() {
		var hooks = Tween.propHooks[ this.prop ];

		return hooks && hooks.get ?
			hooks.get( this ) :
			Tween.propHooks._default.get( this );
	},
	run: function( percent ) {
		var eased,
			hooks = Tween.propHooks[ this.prop ];

		if ( this.options.duration ) {
			this.pos = eased = jQuery.easing[ this.easing ](
				percent, this.options.duration * percent, 0, 1, this.options.duration
			);
		} else {
			this.pos = eased = percent;
		}
		this.now = ( this.end - this.start ) * eased + this.start;

		if ( this.options.step ) {
			this.options.step.call( this.elem, this.now, this );
		}

		if ( hooks && hooks.set ) {
			hooks.set( this );
		} else {
			Tween.propHooks._default.set( this );
		}
		return this;
	}
};

Tween.prototype.init.prototype = Tween.prototype;

Tween.propHooks = {
	_default: {
		get: function( tween ) {
			var result;

			// Use a property on the element directly when it is not a DOM element,
			// or when there is no matching style property that exists.
			if ( tween.elem.nodeType !== 1 ||
				tween.elem[ tween.prop ] != null && tween.elem.style[ tween.prop ] == null ) {
				return tween.elem[ tween.prop ];
			}

			// passing an empty string as a 3rd parameter to .css will automatically
			// attempt a parseFloat and fallback to a string if the parse fails
			// so, simple values such as "10px" are parsed to Float.
			// complex values such as "rotate(1rad)" are returned as is.
			result = jQuery.css( tween.elem, tween.prop, "" );

			// Empty strings, null, undefined and "auto" are converted to 0.
			return !result || result === "auto" ? 0 : result;
		},
		set: function( tween ) {

			// use step hook for back compat - use cssHook if its there - use .style if its
			// available and use plain properties where available
			if ( jQuery.fx.step[ tween.prop ] ) {
				jQuery.fx.step[ tween.prop ]( tween );
			} else if ( tween.elem.nodeType === 1 &&
				( tween.elem.style[ jQuery.cssProps[ tween.prop ] ] != null ||
					jQuery.cssHooks[ tween.prop ] ) ) {
				jQuery.style( tween.elem, tween.prop, tween.now + tween.unit );
			} else {
				tween.elem[ tween.prop ] = tween.now;
			}
		}
	}
};

// Support: IE <=9
// Panic based approach to setting things on disconnected nodes

Tween.propHooks.scrollTop = Tween.propHooks.scrollLeft = {
	set: function( tween ) {
		if ( tween.elem.nodeType && tween.elem.parentNode ) {
			tween.elem[ tween.prop ] = tween.now;
		}
	}
};

jQuery.easing = {
	linear: function( p ) {
		return p;
	},
	swing: function( p ) {
		return 0.5 - Math.cos( p * Math.PI ) / 2;
	},
	_default: "swing"
};

jQuery.fx = Tween.prototype.init;

// Back Compat <1.8 extension point
jQuery.fx.step = {};




var
	fxNow, timerId,
	rfxtypes = /^(?:toggle|show|hide)$/,
	rrun = /queueHooks$/;

// Animations created synchronously will run synchronously
function createFxNow() {
	window.setTimeout( function() {
		fxNow = undefined;
	} );
	return ( fxNow = jQuery.now() );
}

// Generate parameters to create a standard animation
function genFx( type, includeWidth ) {
	var which,
		attrs = { height: type },
		i = 0;

	// if we include width, step value is 1 to do all cssExpand values,
	// if we don't include width, step value is 2 to skip over Left and Right
	includeWidth = includeWidth ? 1 : 0;
	for ( ; i < 4 ; i += 2 - includeWidth ) {
		which = cssExpand[ i ];
		attrs[ "margin" + which ] = attrs[ "padding" + which ] = type;
	}

	if ( includeWidth ) {
		attrs.opacity = attrs.width = type;
	}

	return attrs;
}

function createTween( value, prop, animation ) {
	var tween,
		collection = ( Animation.tweeners[ prop ] || [] ).concat( Animation.tweeners[ "*" ] ),
		index = 0,
		length = collection.length;
	for ( ; index < length; index++ ) {
		if ( ( tween = collection[ index ].call( animation, prop, value ) ) ) {

			// we're done with this property
			return tween;
		}
	}
}

function defaultPrefilter( elem, props, opts ) {
	/* jshint validthis: true */
	var prop, value, toggle, tween, hooks, oldfire, display, checkDisplay,
		anim = this,
		orig = {},
		style = elem.style,
		hidden = elem.nodeType && isHidden( elem ),
		dataShow = jQuery._data( elem, "fxshow" );

	// handle queue: false promises
	if ( !opts.queue ) {
		hooks = jQuery._queueHooks( elem, "fx" );
		if ( hooks.unqueued == null ) {
			hooks.unqueued = 0;
			oldfire = hooks.empty.fire;
			hooks.empty.fire = function() {
				if ( !hooks.unqueued ) {
					oldfire();
				}
			};
		}
		hooks.unqueued++;

		anim.always( function() {

			// doing this makes sure that the complete handler will be called
			// before this completes
			anim.always( function() {
				hooks.unqueued--;
				if ( !jQuery.queue( elem, "fx" ).length ) {
					hooks.empty.fire();
				}
			} );
		} );
	}

	// height/width overflow pass
	if ( elem.nodeType === 1 && ( "height" in props || "width" in props ) ) {

		// Make sure that nothing sneaks out
		// Record all 3 overflow attributes because IE does not
		// change the overflow attribute when overflowX and
		// overflowY are set to the same value
		opts.overflow = [ style.overflow, style.overflowX, style.overflowY ];

		// Set display property to inline-block for height/width
		// animations on inline elements that are having width/height animated
		display = jQuery.css( elem, "display" );

		// Test default display if display is currently "none"
		checkDisplay = display === "none" ?
			jQuery._data( elem, "olddisplay" ) || defaultDisplay( elem.nodeName ) : display;

		if ( checkDisplay === "inline" && jQuery.css( elem, "float" ) === "none" ) {

			// inline-level elements accept inline-block;
			// block-level elements need to be inline with layout
			if ( !support.inlineBlockNeedsLayout || defaultDisplay( elem.nodeName ) === "inline" ) {
				style.display = "inline-block";
			} else {
				style.zoom = 1;
			}
		}
	}

	if ( opts.overflow ) {
		style.overflow = "hidden";
		if ( !support.shrinkWrapBlocks() ) {
			anim.always( function() {
				style.overflow = opts.overflow[ 0 ];
				style.overflowX = opts.overflow[ 1 ];
				style.overflowY = opts.overflow[ 2 ];
			} );
		}
	}

	// show/hide pass
	for ( prop in props ) {
		value = props[ prop ];
		if ( rfxtypes.exec( value ) ) {
			delete props[ prop ];
			toggle = toggle || value === "toggle";
			if ( value === ( hidden ? "hide" : "show" ) ) {

				// If there is dataShow left over from a stopped hide or show
				// and we are going to proceed with show, we should pretend to be hidden
				if ( value === "show" && dataShow && dataShow[ prop ] !== undefined ) {
					hidden = true;
				} else {
					continue;
				}
			}
			orig[ prop ] = dataShow && dataShow[ prop ] || jQuery.style( elem, prop );

		// Any non-fx value stops us from restoring the original display value
		} else {
			display = undefined;
		}
	}

	if ( !jQuery.isEmptyObject( orig ) ) {
		if ( dataShow ) {
			if ( "hidden" in dataShow ) {
				hidden = dataShow.hidden;
			}
		} else {
			dataShow = jQuery._data( elem, "fxshow", {} );
		}

		// store state if its toggle - enables .stop().toggle() to "reverse"
		if ( toggle ) {
			dataShow.hidden = !hidden;
		}
		if ( hidden ) {
			jQuery( elem ).show();
		} else {
			anim.done( function() {
				jQuery( elem ).hide();
			} );
		}
		anim.done( function() {
			var prop;
			jQuery._removeData( elem, "fxshow" );
			for ( prop in orig ) {
				jQuery.style( elem, prop, orig[ prop ] );
			}
		} );
		for ( prop in orig ) {
			tween = createTween( hidden ? dataShow[ prop ] : 0, prop, anim );

			if ( !( prop in dataShow ) ) {
				dataShow[ prop ] = tween.start;
				if ( hidden ) {
					tween.end = tween.start;
					tween.start = prop === "width" || prop === "height" ? 1 : 0;
				}
			}
		}

	// If this is a noop like .hide().hide(), restore an overwritten display value
	} else if ( ( display === "none" ? defaultDisplay( elem.nodeName ) : display ) === "inline" ) {
		style.display = display;
	}
}

function propFilter( props, specialEasing ) {
	var index, name, easing, value, hooks;

	// camelCase, specialEasing and expand cssHook pass
	for ( index in props ) {
		name = jQuery.camelCase( index );
		easing = specialEasing[ name ];
		value = props[ index ];
		if ( jQuery.isArray( value ) ) {
			easing = value[ 1 ];
			value = props[ index ] = value[ 0 ];
		}

		if ( index !== name ) {
			props[ name ] = value;
			delete props[ index ];
		}

		hooks = jQuery.cssHooks[ name ];
		if ( hooks && "expand" in hooks ) {
			value = hooks.expand( value );
			delete props[ name ];

			// not quite $.extend, this wont overwrite keys already present.
			// also - reusing 'index' from above because we have the correct "name"
			for ( index in value ) {
				if ( !( index in props ) ) {
					props[ index ] = value[ index ];
					specialEasing[ index ] = easing;
				}
			}
		} else {
			specialEasing[ name ] = easing;
		}
	}
}

function Animation( elem, properties, options ) {
	var result,
		stopped,
		index = 0,
		length = Animation.prefilters.length,
		deferred = jQuery.Deferred().always( function() {

			// don't match elem in the :animated selector
			delete tick.elem;
		} ),
		tick = function() {
			if ( stopped ) {
				return false;
			}
			var currentTime = fxNow || createFxNow(),
				remaining = Math.max( 0, animation.startTime + animation.duration - currentTime ),

				// Support: Android 2.3
				// Archaic crash bug won't allow us to use `1 - ( 0.5 || 0 )` (#12497)
				temp = remaining / animation.duration || 0,
				percent = 1 - temp,
				index = 0,
				length = animation.tweens.length;

			for ( ; index < length ; index++ ) {
				animation.tweens[ index ].run( percent );
			}

			deferred.notifyWith( elem, [ animation, percent, remaining ] );

			if ( percent < 1 && length ) {
				return remaining;
			} else {
				deferred.resolveWith( elem, [ animation ] );
				return false;
			}
		},
		animation = deferred.promise( {
			elem: elem,
			props: jQuery.extend( {}, properties ),
			opts: jQuery.extend( true, {
				specialEasing: {},
				easing: jQuery.easing._default
			}, options ),
			originalProperties: properties,
			originalOptions: options,
			startTime: fxNow || createFxNow(),
			duration: options.duration,
			tweens: [],
			createTween: function( prop, end ) {
				var tween = jQuery.Tween( elem, animation.opts, prop, end,
						animation.opts.specialEasing[ prop ] || animation.opts.easing );
				animation.tweens.push( tween );
				return tween;
			},
			stop: function( gotoEnd ) {
				var index = 0,

					// if we are going to the end, we want to run all the tweens
					// otherwise we skip this part
					length = gotoEnd ? animation.tweens.length : 0;
				if ( stopped ) {
					return this;
				}
				stopped = true;
				for ( ; index < length ; index++ ) {
					animation.tweens[ index ].run( 1 );
				}

				// resolve when we played the last frame
				// otherwise, reject
				if ( gotoEnd ) {
					deferred.notifyWith( elem, [ animation, 1, 0 ] );
					deferred.resolveWith( elem, [ animation, gotoEnd ] );
				} else {
					deferred.rejectWith( elem, [ animation, gotoEnd ] );
				}
				return this;
			}
		} ),
		props = animation.props;

	propFilter( props, animation.opts.specialEasing );

	for ( ; index < length ; index++ ) {
		result = Animation.prefilters[ index ].call( animation, elem, props, animation.opts );
		if ( result ) {
			if ( jQuery.isFunction( result.stop ) ) {
				jQuery._queueHooks( animation.elem, animation.opts.queue ).stop =
					jQuery.proxy( result.stop, result );
			}
			return result;
		}
	}

	jQuery.map( props, createTween, animation );

	if ( jQuery.isFunction( animation.opts.start ) ) {
		animation.opts.start.call( elem, animation );
	}

	jQuery.fx.timer(
		jQuery.extend( tick, {
			elem: elem,
			anim: animation,
			queue: animation.opts.queue
		} )
	);

	// attach callbacks from options
	return animation.progress( animation.opts.progress )
		.done( animation.opts.done, animation.opts.complete )
		.fail( animation.opts.fail )
		.always( animation.opts.always );
}

jQuery.Animation = jQuery.extend( Animation, {

	tweeners: {
		"*": [ function( prop, value ) {
			var tween = this.createTween( prop, value );
			adjustCSS( tween.elem, prop, rcssNum.exec( value ), tween );
			return tween;
		} ]
	},

	tweener: function( props, callback ) {
		if ( jQuery.isFunction( props ) ) {
			callback = props;
			props = [ "*" ];
		} else {
			props = props.match( rnotwhite );
		}

		var prop,
			index = 0,
			length = props.length;

		for ( ; index < length ; index++ ) {
			prop = props[ index ];
			Animation.tweeners[ prop ] = Animation.tweeners[ prop ] || [];
			Animation.tweeners[ prop ].unshift( callback );
		}
	},

	prefilters: [ defaultPrefilter ],

	prefilter: function( callback, prepend ) {
		if ( prepend ) {
			Animation.prefilters.unshift( callback );
		} else {
			Animation.prefilters.push( callback );
		}
	}
} );

jQuery.speed = function( speed, easing, fn ) {
	var opt = speed && typeof speed === "object" ? jQuery.extend( {}, speed ) : {
		complete: fn || !fn && easing ||
			jQuery.isFunction( speed ) && speed,
		duration: speed,
		easing: fn && easing || easing && !jQuery.isFunction( easing ) && easing
	};

	opt.duration = jQuery.fx.off ? 0 : typeof opt.duration === "number" ? opt.duration :
		opt.duration in jQuery.fx.speeds ?
			jQuery.fx.speeds[ opt.duration ] : jQuery.fx.speeds._default;

	// normalize opt.queue - true/undefined/null -> "fx"
	if ( opt.queue == null || opt.queue === true ) {
		opt.queue = "fx";
	}

	// Queueing
	opt.old = opt.complete;

	opt.complete = function() {
		if ( jQuery.isFunction( opt.old ) ) {
			opt.old.call( this );
		}

		if ( opt.queue ) {
			jQuery.dequeue( this, opt.queue );
		}
	};

	return opt;
};

jQuery.fn.extend( {
	fadeTo: function( speed, to, easing, callback ) {

		// show any hidden elements after setting opacity to 0
		return this.filter( isHidden ).css( "opacity", 0 ).show()

			// animate to the value specified
			.end().animate( { opacity: to }, speed, easing, callback );
	},
	animate: function( prop, speed, easing, callback ) {
		var empty = jQuery.isEmptyObject( prop ),
			optall = jQuery.speed( speed, easing, callback ),
			doAnimation = function() {

				// Operate on a copy of prop so per-property easing won't be lost
				var anim = Animation( this, jQuery.extend( {}, prop ), optall );

				// Empty animations, or finishing resolves immediately
				if ( empty || jQuery._data( this, "finish" ) ) {
					anim.stop( true );
				}
			};
			doAnimation.finish = doAnimation;

		return empty || optall.queue === false ?
			this.each( doAnimation ) :
			this.queue( optall.queue, doAnimation );
	},
	stop: function( type, clearQueue, gotoEnd ) {
		var stopQueue = function( hooks ) {
			var stop = hooks.stop;
			delete hooks.stop;
			stop( gotoEnd );
		};

		if ( typeof type !== "string" ) {
			gotoEnd = clearQueue;
			clearQueue = type;
			type = undefined;
		}
		if ( clearQueue && type !== false ) {
			this.queue( type || "fx", [] );
		}

		return this.each( function() {
			var dequeue = true,
				index = type != null && type + "queueHooks",
				timers = jQuery.timers,
				data = jQuery._data( this );

			if ( index ) {
				if ( data[ index ] && data[ index ].stop ) {
					stopQueue( data[ index ] );
				}
			} else {
				for ( index in data ) {
					if ( data[ index ] && data[ index ].stop && rrun.test( index ) ) {
						stopQueue( data[ index ] );
					}
				}
			}

			for ( index = timers.length; index--; ) {
				if ( timers[ index ].elem === this &&
					( type == null || timers[ index ].queue === type ) ) {

					timers[ index ].anim.stop( gotoEnd );
					dequeue = false;
					timers.splice( index, 1 );
				}
			}

			// start the next in the queue if the last step wasn't forced
			// timers currently will call their complete callbacks, which will dequeue
			// but only if they were gotoEnd
			if ( dequeue || !gotoEnd ) {
				jQuery.dequeue( this, type );
			}
		} );
	},
	finish: function( type ) {
		if ( type !== false ) {
			type = type || "fx";
		}
		return this.each( function() {
			var index,
				data = jQuery._data( this ),
				queue = data[ type + "queue" ],
				hooks = data[ type + "queueHooks" ],
				timers = jQuery.timers,
				length = queue ? queue.length : 0;

			// enable finishing flag on private data
			data.finish = true;

			// empty the queue first
			jQuery.queue( this, type, [] );

			if ( hooks && hooks.stop ) {
				hooks.stop.call( this, true );
			}

			// look for any active animations, and finish them
			for ( index = timers.length; index--; ) {
				if ( timers[ index ].elem === this && timers[ index ].queue === type ) {
					timers[ index ].anim.stop( true );
					timers.splice( index, 1 );
				}
			}

			// look for any animations in the old queue and finish them
			for ( index = 0; index < length; index++ ) {
				if ( queue[ index ] && queue[ index ].finish ) {
					queue[ index ].finish.call( this );
				}
			}

			// turn off finishing flag
			delete data.finish;
		} );
	}
} );

jQuery.each( [ "toggle", "show", "hide" ], function( i, name ) {
	var cssFn = jQuery.fn[ name ];
	jQuery.fn[ name ] = function( speed, easing, callback ) {
		return speed == null || typeof speed === "boolean" ?
			cssFn.apply( this, arguments ) :
			this.animate( genFx( name, true ), speed, easing, callback );
	};
} );

// Generate shortcuts for custom animations
jQuery.each( {
	slideDown: genFx( "show" ),
	slideUp: genFx( "hide" ),
	slideToggle: genFx( "toggle" ),
	fadeIn: { opacity: "show" },
	fadeOut: { opacity: "hide" },
	fadeToggle: { opacity: "toggle" }
}, function( name, props ) {
	jQuery.fn[ name ] = function( speed, easing, callback ) {
		return this.animate( props, speed, easing, callback );
	};
} );

jQuery.timers = [];
jQuery.fx.tick = function() {
	var timer,
		timers = jQuery.timers,
		i = 0;

	fxNow = jQuery.now();

	for ( ; i < timers.length; i++ ) {
		timer = timers[ i ];

		// Checks the timer has not already been removed
		if ( !timer() && timers[ i ] === timer ) {
			timers.splice( i--, 1 );
		}
	}

	if ( !timers.length ) {
		jQuery.fx.stop();
	}
	fxNow = undefined;
};

jQuery.fx.timer = function( timer ) {
	jQuery.timers.push( timer );
	if ( timer() ) {
		jQuery.fx.start();
	} else {
		jQuery.timers.pop();
	}
};

jQuery.fx.interval = 13;

jQuery.fx.start = function() {
	if ( !timerId ) {
		timerId = window.setInterval( jQuery.fx.tick, jQuery.fx.interval );
	}
};

jQuery.fx.stop = function() {
	window.clearInterval( timerId );
	timerId = null;
};

jQuery.fx.speeds = {
	slow: 600,
	fast: 200,

	// Default speed
	_default: 400
};


// Based off of the plugin by Clint Helfers, with permission.
// http://web.archive.org/web/20100324014747/http://blindsignals.com/index.php/2009/07/jquery-delay/
jQuery.fn.delay = function( time, type ) {
	time = jQuery.fx ? jQuery.fx.speeds[ time ] || time : time;
	type = type || "fx";

	return this.queue( type, function( next, hooks ) {
		var timeout = window.setTimeout( next, time );
		hooks.stop = function() {
			window.clearTimeout( timeout );
		};
	} );
};


( function() {
	var a,
		input = document.createElement( "input" ),
		div = document.createElement( "div" ),
		select = document.createElement( "select" ),
		opt = select.appendChild( document.createElement( "option" ) );

	// Setup
	div = document.createElement( "div" );
	div.setAttribute( "className", "t" );
	div.innerHTML = "  <link/><table></table><a href='/a'>a</a><input type='checkbox'/>";
	a = div.getElementsByTagName( "a" )[ 0 ];

	// Support: Windows Web Apps (WWA)
	// `type` must use .setAttribute for WWA (#14901)
	input.setAttribute( "type", "checkbox" );
	div.appendChild( input );

	a = div.getElementsByTagName( "a" )[ 0 ];

	// First batch of tests.
	a.style.cssText = "top:1px";

	// Test setAttribute on camelCase class.
	// If it works, we need attrFixes when doing get/setAttribute (ie6/7)
	support.getSetAttribute = div.className !== "t";

	// Get the style information from getAttribute
	// (IE uses .cssText instead)
	support.style = /top/.test( a.getAttribute( "style" ) );

	// Make sure that URLs aren't manipulated
	// (IE normalizes it by default)
	support.hrefNormalized = a.getAttribute( "href" ) === "/a";

	// Check the default checkbox/radio value ("" on WebKit; "on" elsewhere)
	support.checkOn = !!input.value;

	// Make sure that a selected-by-default option has a working selected property.
	// (WebKit defaults to false instead of true, IE too, if it's in an optgroup)
	support.optSelected = opt.selected;

	// Tests for enctype support on a form (#6743)
	support.enctype = !!document.createElement( "form" ).enctype;

	// Make sure that the options inside disabled selects aren't marked as disabled
	// (WebKit marks them as disabled)
	select.disabled = true;
	support.optDisabled = !opt.disabled;

	// Support: IE8 only
	// Check if we can trust getAttribute("value")
	input = document.createElement( "input" );
	input.setAttribute( "value", "" );
	support.input = input.getAttribute( "value" ) === "";

	// Check if an input maintains its value after becoming a radio
	input.value = "t";
	input.setAttribute( "type", "radio" );
	support.radioValue = input.value === "t";
} )();


var rreturn = /\r/g,
	rspaces = /[\x20\t\r\n\f]+/g;

jQuery.fn.extend( {
	val: function( value ) {
		var hooks, ret, isFunction,
			elem = this[ 0 ];

		if ( !arguments.length ) {
			if ( elem ) {
				hooks = jQuery.valHooks[ elem.type ] ||
					jQuery.valHooks[ elem.nodeName.toLowerCase() ];

				if (
					hooks &&
					"get" in hooks &&
					( ret = hooks.get( elem, "value" ) ) !== undefined
				) {
					return ret;
				}

				ret = elem.value;

				return typeof ret === "string" ?

					// handle most common string cases
					ret.replace( rreturn, "" ) :

					// handle cases where value is null/undef or number
					ret == null ? "" : ret;
			}

			return;
		}

		isFunction = jQuery.isFunction( value );

		return this.each( function( i ) {
			var val;

			if ( this.nodeType !== 1 ) {
				return;
			}

			if ( isFunction ) {
				val = value.call( this, i, jQuery( this ).val() );
			} else {
				val = value;
			}

			// Treat null/undefined as ""; convert numbers to string
			if ( val == null ) {
				val = "";
			} else if ( typeof val === "number" ) {
				val += "";
			} else if ( jQuery.isArray( val ) ) {
				val = jQuery.map( val, function( value ) {
					return value == null ? "" : value + "";
				} );
			}

			hooks = jQuery.valHooks[ this.type ] || jQuery.valHooks[ this.nodeName.toLowerCase() ];

			// If set returns undefined, fall back to normal setting
			if ( !hooks || !( "set" in hooks ) || hooks.set( this, val, "value" ) === undefined ) {
				this.value = val;
			}
		} );
	}
} );

jQuery.extend( {
	valHooks: {
		option: {
			get: function( elem ) {
				var val = jQuery.find.attr( elem, "value" );
				return val != null ?
					val :

					// Support: IE10-11+
					// option.text throws exceptions (#14686, #14858)
					// Strip and collapse whitespace
					// https://html.spec.whatwg.org/#strip-and-collapse-whitespace
					jQuery.trim( jQuery.text( elem ) ).replace( rspaces, " " );
			}
		},
		select: {
			get: function( elem ) {
				var value, option,
					options = elem.options,
					index = elem.selectedIndex,
					one = elem.type === "select-one" || index < 0,
					values = one ? null : [],
					max = one ? index + 1 : options.length,
					i = index < 0 ?
						max :
						one ? index : 0;

				// Loop through all the selected options
				for ( ; i < max; i++ ) {
					option = options[ i ];

					// oldIE doesn't update selected after form reset (#2551)
					if ( ( option.selected || i === index ) &&

							// Don't return options that are disabled or in a disabled optgroup
							( support.optDisabled ?
								!option.disabled :
								option.getAttribute( "disabled" ) === null ) &&
							( !option.parentNode.disabled ||
								!jQuery.nodeName( option.parentNode, "optgroup" ) ) ) {

						// Get the specific value for the option
						value = jQuery( option ).val();

						// We don't need an array for one selects
						if ( one ) {
							return value;
						}

						// Multi-Selects return an array
						values.push( value );
					}
				}

				return values;
			},

			set: function( elem, value ) {
				var optionSet, option,
					options = elem.options,
					values = jQuery.makeArray( value ),
					i = options.length;

				while ( i-- ) {
					option = options[ i ];

					if ( jQuery.inArray( jQuery.valHooks.option.get( option ), values ) > -1 ) {

						// Support: IE6
						// When new option element is added to select box we need to
						// force reflow of newly added node in order to workaround delay
						// of initialization properties
						try {
							option.selected = optionSet = true;

						} catch ( _ ) {

							// Will be executed only in IE6
							option.scrollHeight;
						}

					} else {
						option.selected = false;
					}
				}

				// Force browsers to behave consistently when non-matching value is set
				if ( !optionSet ) {
					elem.selectedIndex = -1;
				}

				return options;
			}
		}
	}
} );

// Radios and checkboxes getter/setter
jQuery.each( [ "radio", "checkbox" ], function() {
	jQuery.valHooks[ this ] = {
		set: function( elem, value ) {
			if ( jQuery.isArray( value ) ) {
				return ( elem.checked = jQuery.inArray( jQuery( elem ).val(), value ) > -1 );
			}
		}
	};
	if ( !support.checkOn ) {
		jQuery.valHooks[ this ].get = function( elem ) {
			return elem.getAttribute( "value" ) === null ? "on" : elem.value;
		};
	}
} );




var nodeHook, boolHook,
	attrHandle = jQuery.expr.attrHandle,
	ruseDefault = /^(?:checked|selected)$/i,
	getSetAttribute = support.getSetAttribute,
	getSetInput = support.input;

jQuery.fn.extend( {
	attr: function( name, value ) {
		return access( this, jQuery.attr, name, value, arguments.length > 1 );
	},

	removeAttr: function( name ) {
		return this.each( function() {
			jQuery.removeAttr( this, name );
		} );
	}
} );

jQuery.extend( {
	attr: function( elem, name, value ) {
		var ret, hooks,
			nType = elem.nodeType;

		// Don't get/set attributes on text, comment and attribute nodes
		if ( nType === 3 || nType === 8 || nType === 2 ) {
			return;
		}

		// Fallback to prop when attributes are not supported
		if ( typeof elem.getAttribute === "undefined" ) {
			return jQuery.prop( elem, name, value );
		}

		// All attributes are lowercase
		// Grab necessary hook if one is defined
		if ( nType !== 1 || !jQuery.isXMLDoc( elem ) ) {
			name = name.toLowerCase();
			hooks = jQuery.attrHooks[ name ] ||
				( jQuery.expr.match.bool.test( name ) ? boolHook : nodeHook );
		}

		if ( value !== undefined ) {
			if ( value === null ) {
				jQuery.removeAttr( elem, name );
				return;
			}

			if ( hooks && "set" in hooks &&
				( ret = hooks.set( elem, value, name ) ) !== undefined ) {
				return ret;
			}

			elem.setAttribute( name, value + "" );
			return value;
		}

		if ( hooks && "get" in hooks && ( ret = hooks.get( elem, name ) ) !== null ) {
			return ret;
		}

		ret = jQuery.find.attr( elem, name );

		// Non-existent attributes return null, we normalize to undefined
		return ret == null ? undefined : ret;
	},

	attrHooks: {
		type: {
			set: function( elem, value ) {
				if ( !support.radioValue && value === "radio" &&
					jQuery.nodeName( elem, "input" ) ) {

					// Setting the type on a radio button after the value resets the value in IE8-9
					// Reset value to default in case type is set after value during creation
					var val = elem.value;
					elem.setAttribute( "type", value );
					if ( val ) {
						elem.value = val;
					}
					return value;
				}
			}
		}
	},

	removeAttr: function( elem, value ) {
		var name, propName,
			i = 0,
			attrNames = value && value.match( rnotwhite );

		if ( attrNames && elem.nodeType === 1 ) {
			while ( ( name = attrNames[ i++ ] ) ) {
				propName = jQuery.propFix[ name ] || name;

				// Boolean attributes get special treatment (#10870)
				if ( jQuery.expr.match.bool.test( name ) ) {

					// Set corresponding property to false
					if ( getSetInput && getSetAttribute || !ruseDefault.test( name ) ) {
						elem[ propName ] = false;

					// Support: IE<9
					// Also clear defaultChecked/defaultSelected (if appropriate)
					} else {
						elem[ jQuery.camelCase( "default-" + name ) ] =
							elem[ propName ] = false;
					}

				// See #9699 for explanation of this approach (setting first, then removal)
				} else {
					jQuery.attr( elem, name, "" );
				}

				elem.removeAttribute( getSetAttribute ? name : propName );
			}
		}
	}
} );

// Hooks for boolean attributes
boolHook = {
	set: function( elem, value, name ) {
		if ( value === false ) {

			// Remove boolean attributes when set to false
			jQuery.removeAttr( elem, name );
		} else if ( getSetInput && getSetAttribute || !ruseDefault.test( name ) ) {

			// IE<8 needs the *property* name
			elem.setAttribute( !getSetAttribute && jQuery.propFix[ name ] || name, name );

		} else {

			// Support: IE<9
			// Use defaultChecked and defaultSelected for oldIE
			elem[ jQuery.camelCase( "default-" + name ) ] = elem[ name ] = true;
		}
		return name;
	}
};

jQuery.each( jQuery.expr.match.bool.source.match( /\w+/g ), function( i, name ) {
	var getter = attrHandle[ name ] || jQuery.find.attr;

	if ( getSetInput && getSetAttribute || !ruseDefault.test( name ) ) {
		attrHandle[ name ] = function( elem, name, isXML ) {
			var ret, handle;
			if ( !isXML ) {

				// Avoid an infinite loop by temporarily removing this function from the getter
				handle = attrHandle[ name ];
				attrHandle[ name ] = ret;
				ret = getter( elem, name, isXML ) != null ?
					name.toLowerCase() :
					null;
				attrHandle[ name ] = handle;
			}
			return ret;
		};
	} else {
		attrHandle[ name ] = function( elem, name, isXML ) {
			if ( !isXML ) {
				return elem[ jQuery.camelCase( "default-" + name ) ] ?
					name.toLowerCase() :
					null;
			}
		};
	}
} );

// fix oldIE attroperties
if ( !getSetInput || !getSetAttribute ) {
	jQuery.attrHooks.value = {
		set: function( elem, value, name ) {
			if ( jQuery.nodeName( elem, "input" ) ) {

				// Does not return so that setAttribute is also used
				elem.defaultValue = value;
			} else {

				// Use nodeHook if defined (#1954); otherwise setAttribute is fine
				return nodeHook && nodeHook.set( elem, value, name );
			}
		}
	};
}

// IE6/7 do not support getting/setting some attributes with get/setAttribute
if ( !getSetAttribute ) {

	// Use this for any attribute in IE6/7
	// This fixes almost every IE6/7 issue
	nodeHook = {
		set: function( elem, value, name ) {

			// Set the existing or create a new attribute node
			var ret = elem.getAttributeNode( name );
			if ( !ret ) {
				elem.setAttributeNode(
					( ret = elem.ownerDocument.createAttribute( name ) )
				);
			}

			ret.value = value += "";

			// Break association with cloned elements by also using setAttribute (#9646)
			if ( name === "value" || value === elem.getAttribute( name ) ) {
				return value;
			}
		}
	};

	// Some attributes are constructed with empty-string values when not defined
	attrHandle.id = attrHandle.name = attrHandle.coords =
		function( elem, name, isXML ) {
			var ret;
			if ( !isXML ) {
				return ( ret = elem.getAttributeNode( name ) ) && ret.value !== "" ?
					ret.value :
					null;
			}
		};

	// Fixing value retrieval on a button requires this module
	jQuery.valHooks.button = {
		get: function( elem, name ) {
			var ret = elem.getAttributeNode( name );
			if ( ret && ret.specified ) {
				return ret.value;
			}
		},
		set: nodeHook.set
	};

	// Set contenteditable to false on removals(#10429)
	// Setting to empty string throws an error as an invalid value
	jQuery.attrHooks.contenteditable = {
		set: function( elem, value, name ) {
			nodeHook.set( elem, value === "" ? false : value, name );
		}
	};

	// Set width and height to auto instead of 0 on empty string( Bug #8150 )
	// This is for removals
	jQuery.each( [ "width", "height" ], function( i, name ) {
		jQuery.attrHooks[ name ] = {
			set: function( elem, value ) {
				if ( value === "" ) {
					elem.setAttribute( name, "auto" );
					return value;
				}
			}
		};
	} );
}

if ( !support.style ) {
	jQuery.attrHooks.style = {
		get: function( elem ) {

			// Return undefined in the case of empty string
			// Note: IE uppercases css property names, but if we were to .toLowerCase()
			// .cssText, that would destroy case sensitivity in URL's, like in "background"
			return elem.style.cssText || undefined;
		},
		set: function( elem, value ) {
			return ( elem.style.cssText = value + "" );
		}
	};
}




var rfocusable = /^(?:input|select|textarea|button|object)$/i,
	rclickable = /^(?:a|area)$/i;

jQuery.fn.extend( {
	prop: function( name, value ) {
		return access( this, jQuery.prop, name, value, arguments.length > 1 );
	},

	removeProp: function( name ) {
		name = jQuery.propFix[ name ] || name;
		return this.each( function() {

			// try/catch handles cases where IE balks (such as removing a property on window)
			try {
				this[ name ] = undefined;
				delete this[ name ];
			} catch ( e ) {}
		} );
	}
} );

jQuery.extend( {
	prop: function( elem, name, value ) {
		var ret, hooks,
			nType = elem.nodeType;

		// Don't get/set properties on text, comment and attribute nodes
		if ( nType === 3 || nType === 8 || nType === 2 ) {
			return;
		}

		if ( nType !== 1 || !jQuery.isXMLDoc( elem ) ) {

			// Fix name and attach hooks
			name = jQuery.propFix[ name ] || name;
			hooks = jQuery.propHooks[ name ];
		}

		if ( value !== undefined ) {
			if ( hooks && "set" in hooks &&
				( ret = hooks.set( elem, value, name ) ) !== undefined ) {
				return ret;
			}

			return ( elem[ name ] = value );
		}

		if ( hooks && "get" in hooks && ( ret = hooks.get( elem, name ) ) !== null ) {
			return ret;
		}

		return elem[ name ];
	},

	propHooks: {
		tabIndex: {
			get: function( elem ) {

				// elem.tabIndex doesn't always return the
				// correct value when it hasn't been explicitly set
				// http://fluidproject.org/blog/2008/01/09/getting-setting-and-removing-tabindex-values-with-javascript/
				// Use proper attribute retrieval(#12072)
				var tabindex = jQuery.find.attr( elem, "tabindex" );

				return tabindex ?
					parseInt( tabindex, 10 ) :
					rfocusable.test( elem.nodeName ) ||
						rclickable.test( elem.nodeName ) && elem.href ?
							0 :
							-1;
			}
		}
	},

	propFix: {
		"for": "htmlFor",
		"class": "className"
	}
} );

// Some attributes require a special call on IE
// http://msdn.microsoft.com/en-us/library/ms536429%28VS.85%29.aspx
if ( !support.hrefNormalized ) {

	// href/src property should get the full normalized URL (#10299/#12915)
	jQuery.each( [ "href", "src" ], function( i, name ) {
		jQuery.propHooks[ name ] = {
			get: function( elem ) {
				return elem.getAttribute( name, 4 );
			}
		};
	} );
}

// Support: Safari, IE9+
// Accessing the selectedIndex property
// forces the browser to respect setting selected
// on the option
// The getter ensures a default option is selected
// when in an optgroup
if ( !support.optSelected ) {
	jQuery.propHooks.selected = {
		get: function( elem ) {
			var parent = elem.parentNode;

			if ( parent ) {
				parent.selectedIndex;

				// Make sure that it also works with optgroups, see #5701
				if ( parent.parentNode ) {
					parent.parentNode.selectedIndex;
				}
			}
			return null;
		},
		set: function( elem ) {
			var parent = elem.parentNode;
			if ( parent ) {
				parent.selectedIndex;

				if ( parent.parentNode ) {
					parent.parentNode.selectedIndex;
				}
			}
		}
	};
}

jQuery.each( [
	"tabIndex",
	"readOnly",
	"maxLength",
	"cellSpacing",
	"cellPadding",
	"rowSpan",
	"colSpan",
	"useMap",
	"frameBorder",
	"contentEditable"
], function() {
	jQuery.propFix[ this.toLowerCase() ] = this;
} );

// IE6/7 call enctype encoding
if ( !support.enctype ) {
	jQuery.propFix.enctype = "encoding";
}




var rclass = /[\t\r\n\f]/g;

function getClass( elem ) {
	return jQuery.attr( elem, "class" ) || "";
}

jQuery.fn.extend( {
	addClass: function( value ) {
		var classes, elem, cur, curValue, clazz, j, finalValue,
			i = 0;

		if ( jQuery.isFunction( value ) ) {
			return this.each( function( j ) {
				jQuery( this ).addClass( value.call( this, j, getClass( this ) ) );
			} );
		}

		if ( typeof value === "string" && value ) {
			classes = value.match( rnotwhite ) || [];

			while ( ( elem = this[ i++ ] ) ) {
				curValue = getClass( elem );
				cur = elem.nodeType === 1 &&
					( " " + curValue + " " ).replace( rclass, " " );

				if ( cur ) {
					j = 0;
					while ( ( clazz = classes[ j++ ] ) ) {
						if ( cur.indexOf( " " + clazz + " " ) < 0 ) {
							cur += clazz + " ";
						}
					}

					// only assign if different to avoid unneeded rendering.
					finalValue = jQuery.trim( cur );
					if ( curValue !== finalValue ) {
						jQuery.attr( elem, "class", finalValue );
					}
				}
			}
		}

		return this;
	},

	removeClass: function( value ) {
		var classes, elem, cur, curValue, clazz, j, finalValue,
			i = 0;

		if ( jQuery.isFunction( value ) ) {
			return this.each( function( j ) {
				jQuery( this ).removeClass( value.call( this, j, getClass( this ) ) );
			} );
		}

		if ( !arguments.length ) {
			return this.attr( "class", "" );
		}

		if ( typeof value === "string" && value ) {
			classes = value.match( rnotwhite ) || [];

			while ( ( elem = this[ i++ ] ) ) {
				curValue = getClass( elem );

				// This expression is here for better compressibility (see addClass)
				cur = elem.nodeType === 1 &&
					( " " + curValue + " " ).replace( rclass, " " );

				if ( cur ) {
					j = 0;
					while ( ( clazz = classes[ j++ ] ) ) {

						// Remove *all* instances
						while ( cur.indexOf( " " + clazz + " " ) > -1 ) {
							cur = cur.replace( " " + clazz + " ", " " );
						}
					}

					// Only assign if different to avoid unneeded rendering.
					finalValue = jQuery.trim( cur );
					if ( curValue !== finalValue ) {
						jQuery.attr( elem, "class", finalValue );
					}
				}
			}
		}

		return this;
	},

	toggleClass: function( value, stateVal ) {
		var type = typeof value;

		if ( typeof stateVal === "boolean" && type === "string" ) {
			return stateVal ? this.addClass( value ) : this.removeClass( value );
		}

		if ( jQuery.isFunction( value ) ) {
			return this.each( function( i ) {
				jQuery( this ).toggleClass(
					value.call( this, i, getClass( this ), stateVal ),
					stateVal
				);
			} );
		}

		return this.each( function() {
			var className, i, self, classNames;

			if ( type === "string" ) {

				// Toggle individual class names
				i = 0;
				self = jQuery( this );
				classNames = value.match( rnotwhite ) || [];

				while ( ( className = classNames[ i++ ] ) ) {

					// Check each className given, space separated list
					if ( self.hasClass( className ) ) {
						self.removeClass( className );
					} else {
						self.addClass( className );
					}
				}

			// Toggle whole class name
			} else if ( value === undefined || type === "boolean" ) {
				className = getClass( this );
				if ( className ) {

					// store className if set
					jQuery._data( this, "__className__", className );
				}

				// If the element has a class name or if we're passed "false",
				// then remove the whole classname (if there was one, the above saved it).
				// Otherwise bring back whatever was previously saved (if anything),
				// falling back to the empty string if nothing was stored.
				jQuery.attr( this, "class",
					className || value === false ?
					"" :
					jQuery._data( this, "__className__" ) || ""
				);
			}
		} );
	},

	hasClass: function( selector ) {
		var className, elem,
			i = 0;

		className = " " + selector + " ";
		while ( ( elem = this[ i++ ] ) ) {
			if ( elem.nodeType === 1 &&
				( " " + getClass( elem ) + " " ).replace( rclass, " " )
					.indexOf( className ) > -1
			) {
				return true;
			}
		}

		return false;
	}
} );




// Return jQuery for attributes-only inclusion


jQuery.each( ( "blur focus focusin focusout load resize scroll unload click dblclick " +
	"mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
	"change select submit keydown keypress keyup error contextmenu" ).split( " " ),
	function( i, name ) {

	// Handle event binding
	jQuery.fn[ name ] = function( data, fn ) {
		return arguments.length > 0 ?
			this.on( name, null, data, fn ) :
			this.trigger( name );
	};
} );

jQuery.fn.extend( {
	hover: function( fnOver, fnOut ) {
		return this.mouseenter( fnOver ).mouseleave( fnOut || fnOver );
	}
} );


var location = window.location;

var nonce = jQuery.now();

var rquery = ( /\?/ );



var rvalidtokens = /(,)|(\[|{)|(}|])|"(?:[^"\\\r\n]|\\["\\\/bfnrt]|\\u[\da-fA-F]{4})*"\s*:?|true|false|null|-?(?!0\d)\d+(?:\.\d+|)(?:[eE][+-]?\d+|)/g;

jQuery.parseJSON = function( data ) {

	// Attempt to parse using the native JSON parser first
	if ( window.JSON && window.JSON.parse ) {

		// Support: Android 2.3
		// Workaround failure to string-cast null input
		return window.JSON.parse( data + "" );
	}

	var requireNonComma,
		depth = null,
		str = jQuery.trim( data + "" );

	// Guard against invalid (and possibly dangerous) input by ensuring that nothing remains
	// after removing valid tokens
	return str && !jQuery.trim( str.replace( rvalidtokens, function( token, comma, open, close ) {

		// Force termination if we see a misplaced comma
		if ( requireNonComma && comma ) {
			depth = 0;
		}

		// Perform no more replacements after returning to outermost depth
		if ( depth === 0 ) {
			return token;
		}

		// Commas must not follow "[", "{", or ","
		requireNonComma = open || comma;

		// Determine new depth
		// array/object open ("[" or "{"): depth += true - false (increment)
		// array/object close ("]" or "}"): depth += false - true (decrement)
		// other cases ("," or primitive): depth += true - true (numeric cast)
		depth += !close - !open;

		// Remove this token
		return "";
	} ) ) ?
		( Function( "return " + str ) )() :
		jQuery.error( "Invalid JSON: " + data );
};


// Cross-browser xml parsing
jQuery.parseXML = function( data ) {
	var xml, tmp;
	if ( !data || typeof data !== "string" ) {
		return null;
	}
	try {
		if ( window.DOMParser ) { // Standard
			tmp = new window.DOMParser();
			xml = tmp.parseFromString( data, "text/xml" );
		} else { // IE
			xml = new window.ActiveXObject( "Microsoft.XMLDOM" );
			xml.async = "false";
			xml.loadXML( data );
		}
	} catch ( e ) {
		xml = undefined;
	}
	if ( !xml || !xml.documentElement || xml.getElementsByTagName( "parsererror" ).length ) {
		jQuery.error( "Invalid XML: " + data );
	}
	return xml;
};


var
	rhash = /#.*$/,
	rts = /([?&])_=[^&]*/,

	// IE leaves an \r character at EOL
	rheaders = /^(.*?):[ \t]*([^\r\n]*)\r?$/mg,

	// #7653, #8125, #8152: local protocol detection
	rlocalProtocol = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/,
	rnoContent = /^(?:GET|HEAD)$/,
	rprotocol = /^\/\//,
	rurl = /^([\w.+-]+:)(?:\/\/(?:[^\/?#]*@|)([^\/?#:]*)(?::(\d+)|)|)/,

	/* Prefilters
	 * 1) They are useful to introduce custom dataTypes (see ajax/jsonp.js for an example)
	 * 2) These are called:
	 *    - BEFORE asking for a transport
	 *    - AFTER param serialization (s.data is a string if s.processData is true)
	 * 3) key is the dataType
	 * 4) the catchall symbol "*" can be used
	 * 5) execution will start with transport dataType and THEN continue down to "*" if needed
	 */
	prefilters = {},

	/* Transports bindings
	 * 1) key is the dataType
	 * 2) the catchall symbol "*" can be used
	 * 3) selection will start with transport dataType and THEN go to "*" if needed
	 */
	transports = {},

	// Avoid comment-prolog char sequence (#10098); must appease lint and evade compression
	allTypes = "*/".concat( "*" ),

	// Document location
	ajaxLocation = location.href,

	// Segment location into parts
	ajaxLocParts = rurl.exec( ajaxLocation.toLowerCase() ) || [];

// Base "constructor" for jQuery.ajaxPrefilter and jQuery.ajaxTransport
function addToPrefiltersOrTransports( structure ) {

	// dataTypeExpression is optional and defaults to "*"
	return function( dataTypeExpression, func ) {

		if ( typeof dataTypeExpression !== "string" ) {
			func = dataTypeExpression;
			dataTypeExpression = "*";
		}

		var dataType,
			i = 0,
			dataTypes = dataTypeExpression.toLowerCase().match( rnotwhite ) || [];

		if ( jQuery.isFunction( func ) ) {

			// For each dataType in the dataTypeExpression
			while ( ( dataType = dataTypes[ i++ ] ) ) {

				// Prepend if requested
				if ( dataType.charAt( 0 ) === "+" ) {
					dataType = dataType.slice( 1 ) || "*";
					( structure[ dataType ] = structure[ dataType ] || [] ).unshift( func );

				// Otherwise append
				} else {
					( structure[ dataType ] = structure[ dataType ] || [] ).push( func );
				}
			}
		}
	};
}

// Base inspection function for prefilters and transports
function inspectPrefiltersOrTransports( structure, options, originalOptions, jqXHR ) {

	var inspected = {},
		seekingTransport = ( structure === transports );

	function inspect( dataType ) {
		var selected;
		inspected[ dataType ] = true;
		jQuery.each( structure[ dataType ] || [], function( _, prefilterOrFactory ) {
			var dataTypeOrTransport = prefilterOrFactory( options, originalOptions, jqXHR );
			if ( typeof dataTypeOrTransport === "string" &&
				!seekingTransport && !inspected[ dataTypeOrTransport ] ) {

				options.dataTypes.unshift( dataTypeOrTransport );
				inspect( dataTypeOrTransport );
				return false;
			} else if ( seekingTransport ) {
				return !( selected = dataTypeOrTransport );
			}
		} );
		return selected;
	}

	return inspect( options.dataTypes[ 0 ] ) || !inspected[ "*" ] && inspect( "*" );
}

// A special extend for ajax options
// that takes "flat" options (not to be deep extended)
// Fixes #9887
function ajaxExtend( target, src ) {
	var deep, key,
		flatOptions = jQuery.ajaxSettings.flatOptions || {};

	for ( key in src ) {
		if ( src[ key ] !== undefined ) {
			( flatOptions[ key ] ? target : ( deep || ( deep = {} ) ) )[ key ] = src[ key ];
		}
	}
	if ( deep ) {
		jQuery.extend( true, target, deep );
	}

	return target;
}

/* Handles responses to an ajax request:
 * - finds the right dataType (mediates between content-type and expected dataType)
 * - returns the corresponding response
 */
function ajaxHandleResponses( s, jqXHR, responses ) {
	var firstDataType, ct, finalDataType, type,
		contents = s.contents,
		dataTypes = s.dataTypes;

	// Remove auto dataType and get content-type in the process
	while ( dataTypes[ 0 ] === "*" ) {
		dataTypes.shift();
		if ( ct === undefined ) {
			ct = s.mimeType || jqXHR.getResponseHeader( "Content-Type" );
		}
	}

	// Check if we're dealing with a known content-type
	if ( ct ) {
		for ( type in contents ) {
			if ( contents[ type ] && contents[ type ].test( ct ) ) {
				dataTypes.unshift( type );
				break;
			}
		}
	}

	// Check to see if we have a response for the expected dataType
	if ( dataTypes[ 0 ] in responses ) {
		finalDataType = dataTypes[ 0 ];
	} else {

		// Try convertible dataTypes
		for ( type in responses ) {
			if ( !dataTypes[ 0 ] || s.converters[ type + " " + dataTypes[ 0 ] ] ) {
				finalDataType = type;
				break;
			}
			if ( !firstDataType ) {
				firstDataType = type;
			}
		}

		// Or just use first one
		finalDataType = finalDataType || firstDataType;
	}

	// If we found a dataType
	// We add the dataType to the list if needed
	// and return the corresponding response
	if ( finalDataType ) {
		if ( finalDataType !== dataTypes[ 0 ] ) {
			dataTypes.unshift( finalDataType );
		}
		return responses[ finalDataType ];
	}
}

/* Chain conversions given the request and the original response
 * Also sets the responseXXX fields on the jqXHR instance
 */
function ajaxConvert( s, response, jqXHR, isSuccess ) {
	var conv2, current, conv, tmp, prev,
		converters = {},

		// Work with a copy of dataTypes in case we need to modify it for conversion
		dataTypes = s.dataTypes.slice();

	// Create converters map with lowercased keys
	if ( dataTypes[ 1 ] ) {
		for ( conv in s.converters ) {
			converters[ conv.toLowerCase() ] = s.converters[ conv ];
		}
	}

	current = dataTypes.shift();

	// Convert to each sequential dataType
	while ( current ) {

		if ( s.responseFields[ current ] ) {
			jqXHR[ s.responseFields[ current ] ] = response;
		}

		// Apply the dataFilter if provided
		if ( !prev && isSuccess && s.dataFilter ) {
			response = s.dataFilter( response, s.dataType );
		}

		prev = current;
		current = dataTypes.shift();

		if ( current ) {

			// There's only work to do if current dataType is non-auto
			if ( current === "*" ) {

				current = prev;

			// Convert response if prev dataType is non-auto and differs from current
			} else if ( prev !== "*" && prev !== current ) {

				// Seek a direct converter
				conv = converters[ prev + " " + current ] || converters[ "* " + current ];

				// If none found, seek a pair
				if ( !conv ) {
					for ( conv2 in converters ) {

						// If conv2 outputs current
						tmp = conv2.split( " " );
						if ( tmp[ 1 ] === current ) {

							// If prev can be converted to accepted input
							conv = converters[ prev + " " + tmp[ 0 ] ] ||
								converters[ "* " + tmp[ 0 ] ];
							if ( conv ) {

								// Condense equivalence converters
								if ( conv === true ) {
									conv = converters[ conv2 ];

								// Otherwise, insert the intermediate dataType
								} else if ( converters[ conv2 ] !== true ) {
									current = tmp[ 0 ];
									dataTypes.unshift( tmp[ 1 ] );
								}
								break;
							}
						}
					}
				}

				// Apply converter (if not an equivalence)
				if ( conv !== true ) {

					// Unless errors are allowed to bubble, catch and return them
					if ( conv && s[ "throws" ] ) { // jscs:ignore requireDotNotation
						response = conv( response );
					} else {
						try {
							response = conv( response );
						} catch ( e ) {
							return {
								state: "parsererror",
								error: conv ? e : "No conversion from " + prev + " to " + current
							};
						}
					}
				}
			}
		}
	}

	return { state: "success", data: response };
}

jQuery.extend( {

	// Counter for holding the number of active queries
	active: 0,

	// Last-Modified header cache for next request
	lastModified: {},
	etag: {},

	ajaxSettings: {
		url: ajaxLocation,
		type: "GET",
		isLocal: rlocalProtocol.test( ajaxLocParts[ 1 ] ),
		global: true,
		processData: true,
		async: true,
		contentType: "application/x-www-form-urlencoded; charset=UTF-8",
		/*
		timeout: 0,
		data: null,
		dataType: null,
		username: null,
		password: null,
		cache: null,
		throws: false,
		traditional: false,
		headers: {},
		*/

		accepts: {
			"*": allTypes,
			text: "text/plain",
			html: "text/html",
			xml: "application/xml, text/xml",
			json: "application/json, text/javascript"
		},

		contents: {
			xml: /\bxml\b/,
			html: /\bhtml/,
			json: /\bjson\b/
		},

		responseFields: {
			xml: "responseXML",
			text: "responseText",
			json: "responseJSON"
		},

		// Data converters
		// Keys separate source (or catchall "*") and destination types with a single space
		converters: {

			// Convert anything to text
			"* text": String,

			// Text to html (true = no transformation)
			"text html": true,

			// Evaluate text as a json expression
			"text json": jQuery.parseJSON,

			// Parse text as xml
			"text xml": jQuery.parseXML
		},

		// For options that shouldn't be deep extended:
		// you can add your own custom options here if
		// and when you create one that shouldn't be
		// deep extended (see ajaxExtend)
		flatOptions: {
			url: true,
			context: true
		}
	},

	// Creates a full fledged settings object into target
	// with both ajaxSettings and settings fields.
	// If target is omitted, writes into ajaxSettings.
	ajaxSetup: function( target, settings ) {
		return settings ?

			// Building a settings object
			ajaxExtend( ajaxExtend( target, jQuery.ajaxSettings ), settings ) :

			// Extending ajaxSettings
			ajaxExtend( jQuery.ajaxSettings, target );
	},

	ajaxPrefilter: addToPrefiltersOrTransports( prefilters ),
	ajaxTransport: addToPrefiltersOrTransports( transports ),

	// Main method
	ajax: function( url, options ) {

		// If url is an object, simulate pre-1.5 signature
		if ( typeof url === "object" ) {
			options = url;
			url = undefined;
		}

		// Force options to be an object
		options = options || {};

		var

			// Cross-domain detection vars
			parts,

			// Loop variable
			i,

			// URL without anti-cache param
			cacheURL,

			// Response headers as string
			responseHeadersString,

			// timeout handle
			timeoutTimer,

			// To know if global events are to be dispatched
			fireGlobals,

			transport,

			// Response headers
			responseHeaders,

			// Create the final options object
			s = jQuery.ajaxSetup( {}, options ),

			// Callbacks context
			callbackContext = s.context || s,

			// Context for global events is callbackContext if it is a DOM node or jQuery collection
			globalEventContext = s.context &&
				( callbackContext.nodeType || callbackContext.jquery ) ?
					jQuery( callbackContext ) :
					jQuery.event,

			// Deferreds
			deferred = jQuery.Deferred(),
			completeDeferred = jQuery.Callbacks( "once memory" ),

			// Status-dependent callbacks
			statusCode = s.statusCode || {},

			// Headers (they are sent all at once)
			requestHeaders = {},
			requestHeadersNames = {},

			// The jqXHR state
			state = 0,

			// Default abort message
			strAbort = "canceled",

			// Fake xhr
			jqXHR = {
				readyState: 0,

				// Builds headers hashtable if needed
				getResponseHeader: function( key ) {
					var match;
					if ( state === 2 ) {
						if ( !responseHeaders ) {
							responseHeaders = {};
							while ( ( match = rheaders.exec( responseHeadersString ) ) ) {
								responseHeaders[ match[ 1 ].toLowerCase() ] = match[ 2 ];
							}
						}
						match = responseHeaders[ key.toLowerCase() ];
					}
					return match == null ? null : match;
				},

				// Raw string
				getAllResponseHeaders: function() {
					return state === 2 ? responseHeadersString : null;
				},

				// Caches the header
				setRequestHeader: function( name, value ) {
					var lname = name.toLowerCase();
					if ( !state ) {
						name = requestHeadersNames[ lname ] = requestHeadersNames[ lname ] || name;
						requestHeaders[ name ] = value;
					}
					return this;
				},

				// Overrides response content-type header
				overrideMimeType: function( type ) {
					if ( !state ) {
						s.mimeType = type;
					}
					return this;
				},

				// Status-dependent callbacks
				statusCode: function( map ) {
					var code;
					if ( map ) {
						if ( state < 2 ) {
							for ( code in map ) {

								// Lazy-add the new callback in a way that preserves old ones
								statusCode[ code ] = [ statusCode[ code ], map[ code ] ];
							}
						} else {

							// Execute the appropriate callbacks
							jqXHR.always( map[ jqXHR.status ] );
						}
					}
					return this;
				},

				// Cancel the request
				abort: function( statusText ) {
					var finalText = statusText || strAbort;
					if ( transport ) {
						transport.abort( finalText );
					}
					done( 0, finalText );
					return this;
				}
			};

		// Attach deferreds
		deferred.promise( jqXHR ).complete = completeDeferred.add;
		jqXHR.success = jqXHR.done;
		jqXHR.error = jqXHR.fail;

		// Remove hash character (#7531: and string promotion)
		// Add protocol if not provided (#5866: IE7 issue with protocol-less urls)
		// Handle falsy url in the settings object (#10093: consistency with old signature)
		// We also use the url parameter if available
		s.url = ( ( url || s.url || ajaxLocation ) + "" )
			.replace( rhash, "" )
			.replace( rprotocol, ajaxLocParts[ 1 ] + "//" );

		// Alias method option to type as per ticket #12004
		s.type = options.method || options.type || s.method || s.type;

		// Extract dataTypes list
		s.dataTypes = jQuery.trim( s.dataType || "*" ).toLowerCase().match( rnotwhite ) || [ "" ];

		// A cross-domain request is in order when we have a protocol:host:port mismatch
		if ( s.crossDomain == null ) {
			parts = rurl.exec( s.url.toLowerCase() );
			s.crossDomain = !!( parts &&
				( parts[ 1 ] !== ajaxLocParts[ 1 ] || parts[ 2 ] !== ajaxLocParts[ 2 ] ||
					( parts[ 3 ] || ( parts[ 1 ] === "http:" ? "80" : "443" ) ) !==
						( ajaxLocParts[ 3 ] || ( ajaxLocParts[ 1 ] === "http:" ? "80" : "443" ) ) )
			);
		}

		// Convert data if not already a string
		if ( s.data && s.processData && typeof s.data !== "string" ) {
			s.data = jQuery.param( s.data, s.traditional );
		}

		// Apply prefilters
		inspectPrefiltersOrTransports( prefilters, s, options, jqXHR );

		// If request was aborted inside a prefilter, stop there
		if ( state === 2 ) {
			return jqXHR;
		}

		// We can fire global events as of now if asked to
		// Don't fire events if jQuery.event is undefined in an AMD-usage scenario (#15118)
		fireGlobals = jQuery.event && s.global;

		// Watch for a new set of requests
		if ( fireGlobals && jQuery.active++ === 0 ) {
			jQuery.event.trigger( "ajaxStart" );
		}

		// Uppercase the type
		s.type = s.type.toUpperCase();

		// Determine if request has content
		s.hasContent = !rnoContent.test( s.type );

		// Save the URL in case we're toying with the If-Modified-Since
		// and/or If-None-Match header later on
		cacheURL = s.url;

		// More options handling for requests with no content
		if ( !s.hasContent ) {

			// If data is available, append data to url
			if ( s.data ) {
				cacheURL = ( s.url += ( rquery.test( cacheURL ) ? "&" : "?" ) + s.data );

				// #9682: remove data so that it's not used in an eventual retry
				delete s.data;
			}

			// Add anti-cache in url if needed
			if ( s.cache === false ) {
				s.url = rts.test( cacheURL ) ?

					// If there is already a '_' parameter, set its value
					cacheURL.replace( rts, "$1_=" + nonce++ ) :

					// Otherwise add one to the end
					cacheURL + ( rquery.test( cacheURL ) ? "&" : "?" ) + "_=" + nonce++;
			}
		}

		// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
		if ( s.ifModified ) {
			if ( jQuery.lastModified[ cacheURL ] ) {
				jqXHR.setRequestHeader( "If-Modified-Since", jQuery.lastModified[ cacheURL ] );
			}
			if ( jQuery.etag[ cacheURL ] ) {
				jqXHR.setRequestHeader( "If-None-Match", jQuery.etag[ cacheURL ] );
			}
		}

		// Set the correct header, if data is being sent
		if ( s.data && s.hasContent && s.contentType !== false || options.contentType ) {
			jqXHR.setRequestHeader( "Content-Type", s.contentType );
		}

		// Set the Accepts header for the server, depending on the dataType
		jqXHR.setRequestHeader(
			"Accept",
			s.dataTypes[ 0 ] && s.accepts[ s.dataTypes[ 0 ] ] ?
				s.accepts[ s.dataTypes[ 0 ] ] +
					( s.dataTypes[ 0 ] !== "*" ? ", " + allTypes + "; q=0.01" : "" ) :
				s.accepts[ "*" ]
		);

		// Check for headers option
		for ( i in s.headers ) {
			jqXHR.setRequestHeader( i, s.headers[ i ] );
		}

		// Allow custom headers/mimetypes and early abort
		if ( s.beforeSend &&
			( s.beforeSend.call( callbackContext, jqXHR, s ) === false || state === 2 ) ) {

			// Abort if not done already and return
			return jqXHR.abort();
		}

		// aborting is no longer a cancellation
		strAbort = "abort";

		// Install callbacks on deferreds
		for ( i in { success: 1, error: 1, complete: 1 } ) {
			jqXHR[ i ]( s[ i ] );
		}

		// Get transport
		transport = inspectPrefiltersOrTransports( transports, s, options, jqXHR );

		// If no transport, we auto-abort
		if ( !transport ) {
			done( -1, "No Transport" );
		} else {
			jqXHR.readyState = 1;

			// Send global event
			if ( fireGlobals ) {
				globalEventContext.trigger( "ajaxSend", [ jqXHR, s ] );
			}

			// If request was aborted inside ajaxSend, stop there
			if ( state === 2 ) {
				return jqXHR;
			}

			// Timeout
			if ( s.async && s.timeout > 0 ) {
				timeoutTimer = window.setTimeout( function() {
					jqXHR.abort( "timeout" );
				}, s.timeout );
			}

			try {
				state = 1;
				transport.send( requestHeaders, done );
			} catch ( e ) {

				// Propagate exception as error if not done
				if ( state < 2 ) {
					done( -1, e );

				// Simply rethrow otherwise
				} else {
					throw e;
				}
			}
		}

		// Callback for when everything is done
		function done( status, nativeStatusText, responses, headers ) {
			var isSuccess, success, error, response, modified,
				statusText = nativeStatusText;

			// Called once
			if ( state === 2 ) {
				return;
			}

			// State is "done" now
			state = 2;

			// Clear timeout if it exists
			if ( timeoutTimer ) {
				window.clearTimeout( timeoutTimer );
			}

			// Dereference transport for early garbage collection
			// (no matter how long the jqXHR object will be used)
			transport = undefined;

			// Cache response headers
			responseHeadersString = headers || "";

			// Set readyState
			jqXHR.readyState = status > 0 ? 4 : 0;

			// Determine if successful
			isSuccess = status >= 200 && status < 300 || status === 304;

			// Get response data
			if ( responses ) {
				response = ajaxHandleResponses( s, jqXHR, responses );
			}

			// Convert no matter what (that way responseXXX fields are always set)
			response = ajaxConvert( s, response, jqXHR, isSuccess );

			// If successful, handle type chaining
			if ( isSuccess ) {

				// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
				if ( s.ifModified ) {
					modified = jqXHR.getResponseHeader( "Last-Modified" );
					if ( modified ) {
						jQuery.lastModified[ cacheURL ] = modified;
					}
					modified = jqXHR.getResponseHeader( "etag" );
					if ( modified ) {
						jQuery.etag[ cacheURL ] = modified;
					}
				}

				// if no content
				if ( status === 204 || s.type === "HEAD" ) {
					statusText = "nocontent";

				// if not modified
				} else if ( status === 304 ) {
					statusText = "notmodified";

				// If we have data, let's convert it
				} else {
					statusText = response.state;
					success = response.data;
					error = response.error;
					isSuccess = !error;
				}
			} else {

				// We extract error from statusText
				// then normalize statusText and status for non-aborts
				error = statusText;
				if ( status || !statusText ) {
					statusText = "error";
					if ( status < 0 ) {
						status = 0;
					}
				}
			}

			// Set data for the fake xhr object
			jqXHR.status = status;
			jqXHR.statusText = ( nativeStatusText || statusText ) + "";

			// Success/Error
			if ( isSuccess ) {
				deferred.resolveWith( callbackContext, [ success, statusText, jqXHR ] );
			} else {
				deferred.rejectWith( callbackContext, [ jqXHR, statusText, error ] );
			}

			// Status-dependent callbacks
			jqXHR.statusCode( statusCode );
			statusCode = undefined;

			if ( fireGlobals ) {
				globalEventContext.trigger( isSuccess ? "ajaxSuccess" : "ajaxError",
					[ jqXHR, s, isSuccess ? success : error ] );
			}

			// Complete
			completeDeferred.fireWith( callbackContext, [ jqXHR, statusText ] );

			if ( fireGlobals ) {
				globalEventContext.trigger( "ajaxComplete", [ jqXHR, s ] );

				// Handle the global AJAX counter
				if ( !( --jQuery.active ) ) {
					jQuery.event.trigger( "ajaxStop" );
				}
			}
		}

		return jqXHR;
	},

	getJSON: function( url, data, callback ) {
		return jQuery.get( url, data, callback, "json" );
	},

	getScript: function( url, callback ) {
		return jQuery.get( url, undefined, callback, "script" );
	}
} );

jQuery.each( [ "get", "post" ], function( i, method ) {
	jQuery[ method ] = function( url, data, callback, type ) {

		// shift arguments if data argument was omitted
		if ( jQuery.isFunction( data ) ) {
			type = type || callback;
			callback = data;
			data = undefined;
		}

		// The url can be an options object (which then must have .url)
		return jQuery.ajax( jQuery.extend( {
			url: url,
			type: method,
			dataType: type,
			data: data,
			success: callback
		}, jQuery.isPlainObject( url ) && url ) );
	};
} );


jQuery._evalUrl = function( url ) {
	return jQuery.ajax( {
		url: url,

		// Make this explicit, since user can override this through ajaxSetup (#11264)
		type: "GET",
		dataType: "script",
		cache: true,
		async: false,
		global: false,
		"throws": true
	} );
};


jQuery.fn.extend( {
	wrapAll: function( html ) {
		if ( jQuery.isFunction( html ) ) {
			return this.each( function( i ) {
				jQuery( this ).wrapAll( html.call( this, i ) );
			} );
		}

		if ( this[ 0 ] ) {

			// The elements to wrap the target around
			var wrap = jQuery( html, this[ 0 ].ownerDocument ).eq( 0 ).clone( true );

			if ( this[ 0 ].parentNode ) {
				wrap.insertBefore( this[ 0 ] );
			}

			wrap.map( function() {
				var elem = this;

				while ( elem.firstChild && elem.firstChild.nodeType === 1 ) {
					elem = elem.firstChild;
				}

				return elem;
			} ).append( this );
		}

		return this;
	},

	wrapInner: function( html ) {
		if ( jQuery.isFunction( html ) ) {
			return this.each( function( i ) {
				jQuery( this ).wrapInner( html.call( this, i ) );
			} );
		}

		return this.each( function() {
			var self = jQuery( this ),
				contents = self.contents();

			if ( contents.length ) {
				contents.wrapAll( html );

			} else {
				self.append( html );
			}
		} );
	},

	wrap: function( html ) {
		var isFunction = jQuery.isFunction( html );

		return this.each( function( i ) {
			jQuery( this ).wrapAll( isFunction ? html.call( this, i ) : html );
		} );
	},

	unwrap: function() {
		return this.parent().each( function() {
			if ( !jQuery.nodeName( this, "body" ) ) {
				jQuery( this ).replaceWith( this.childNodes );
			}
		} ).end();
	}
} );


function getDisplay( elem ) {
	return elem.style && elem.style.display || jQuery.css( elem, "display" );
}

function filterHidden( elem ) {

	// Disconnected elements are considered hidden
	if ( !jQuery.contains( elem.ownerDocument || document, elem ) ) {
		return true;
	}
	while ( elem && elem.nodeType === 1 ) {
		if ( getDisplay( elem ) === "none" || elem.type === "hidden" ) {
			return true;
		}
		elem = elem.parentNode;
	}
	return false;
}

jQuery.expr.filters.hidden = function( elem ) {

	// Support: Opera <= 12.12
	// Opera reports offsetWidths and offsetHeights less than zero on some elements
	return support.reliableHiddenOffsets() ?
		( elem.offsetWidth <= 0 && elem.offsetHeight <= 0 &&
			!elem.getClientRects().length ) :
			filterHidden( elem );
};

jQuery.expr.filters.visible = function( elem ) {
	return !jQuery.expr.filters.hidden( elem );
};




var r20 = /%20/g,
	rbracket = /\[\]$/,
	rCRLF = /\r?\n/g,
	rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i,
	rsubmittable = /^(?:input|select|textarea|keygen)/i;

function buildParams( prefix, obj, traditional, add ) {
	var name;

	if ( jQuery.isArray( obj ) ) {

		// Serialize array item.
		jQuery.each( obj, function( i, v ) {
			if ( traditional || rbracket.test( prefix ) ) {

				// Treat each array item as a scalar.
				add( prefix, v );

			} else {

				// Item is non-scalar (array or object), encode its numeric index.
				buildParams(
					prefix + "[" + ( typeof v === "object" && v != null ? i : "" ) + "]",
					v,
					traditional,
					add
				);
			}
		} );

	} else if ( !traditional && jQuery.type( obj ) === "object" ) {

		// Serialize object item.
		for ( name in obj ) {
			buildParams( prefix + "[" + name + "]", obj[ name ], traditional, add );
		}

	} else {

		// Serialize scalar item.
		add( prefix, obj );
	}
}

// Serialize an array of form elements or a set of
// key/values into a query string
jQuery.param = function( a, traditional ) {
	var prefix,
		s = [],
		add = function( key, value ) {

			// If value is a function, invoke it and return its value
			value = jQuery.isFunction( value ) ? value() : ( value == null ? "" : value );
			s[ s.length ] = encodeURIComponent( key ) + "=" + encodeURIComponent( value );
		};

	// Set traditional to true for jQuery <= 1.3.2 behavior.
	if ( traditional === undefined ) {
		traditional = jQuery.ajaxSettings && jQuery.ajaxSettings.traditional;
	}

	// If an array was passed in, assume that it is an array of form elements.
	if ( jQuery.isArray( a ) || ( a.jquery && !jQuery.isPlainObject( a ) ) ) {

		// Serialize the form elements
		jQuery.each( a, function() {
			add( this.name, this.value );
		} );

	} else {

		// If traditional, encode the "old" way (the way 1.3.2 or older
		// did it), otherwise encode params recursively.
		for ( prefix in a ) {
			buildParams( prefix, a[ prefix ], traditional, add );
		}
	}

	// Return the resulting serialization
	return s.join( "&" ).replace( r20, "+" );
};

jQuery.fn.extend( {
	serialize: function() {
		return jQuery.param( this.serializeArray() );
	},
	serializeArray: function() {
		return this.map( function() {

			// Can add propHook for "elements" to filter or add form elements
			var elements = jQuery.prop( this, "elements" );
			return elements ? jQuery.makeArray( elements ) : this;
		} )
		.filter( function() {
			var type = this.type;

			// Use .is(":disabled") so that fieldset[disabled] works
			return this.name && !jQuery( this ).is( ":disabled" ) &&
				rsubmittable.test( this.nodeName ) && !rsubmitterTypes.test( type ) &&
				( this.checked || !rcheckableType.test( type ) );
		} )
		.map( function( i, elem ) {
			var val = jQuery( this ).val();

			return val == null ?
				null :
				jQuery.isArray( val ) ?
					jQuery.map( val, function( val ) {
						return { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
					} ) :
					{ name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
		} ).get();
	}
} );


// Create the request object
// (This is still attached to ajaxSettings for backward compatibility)
jQuery.ajaxSettings.xhr = window.ActiveXObject !== undefined ?

	// Support: IE6-IE8
	function() {

		// XHR cannot access local files, always use ActiveX for that case
		if ( this.isLocal ) {
			return createActiveXHR();
		}

		// Support: IE 9-11
		// IE seems to error on cross-domain PATCH requests when ActiveX XHR
		// is used. In IE 9+ always use the native XHR.
		// Note: this condition won't catch Edge as it doesn't define
		// document.documentMode but it also doesn't support ActiveX so it won't
		// reach this code.
		if ( document.documentMode > 8 ) {
			return createStandardXHR();
		}

		// Support: IE<9
		// oldIE XHR does not support non-RFC2616 methods (#13240)
		// See http://msdn.microsoft.com/en-us/library/ie/ms536648(v=vs.85).aspx
		// and http://www.w3.org/Protocols/rfc2616/rfc2616-sec9.html#sec9
		// Although this check for six methods instead of eight
		// since IE also does not support "trace" and "connect"
		return /^(get|post|head|put|delete|options)$/i.test( this.type ) &&
			createStandardXHR() || createActiveXHR();
	} :

	// For all other browsers, use the standard XMLHttpRequest object
	createStandardXHR;

var xhrId = 0,
	xhrCallbacks = {},
	xhrSupported = jQuery.ajaxSettings.xhr();

// Support: IE<10
// Open requests must be manually aborted on unload (#5280)
// See https://support.microsoft.com/kb/2856746 for more info
if ( window.attachEvent ) {
	window.attachEvent( "onunload", function() {
		for ( var key in xhrCallbacks ) {
			xhrCallbacks[ key ]( undefined, true );
		}
	} );
}

// Determine support properties
support.cors = !!xhrSupported && ( "withCredentials" in xhrSupported );
xhrSupported = support.ajax = !!xhrSupported;

// Create transport if the browser can provide an xhr
if ( xhrSupported ) {

	jQuery.ajaxTransport( function( options ) {

		// Cross domain only allowed if supported through XMLHttpRequest
		if ( !options.crossDomain || support.cors ) {

			var callback;

			return {
				send: function( headers, complete ) {
					var i,
						xhr = options.xhr(),
						id = ++xhrId;

					// Open the socket
					xhr.open(
						options.type,
						options.url,
						options.async,
						options.username,
						options.password
					);

					// Apply custom fields if provided
					if ( options.xhrFields ) {
						for ( i in options.xhrFields ) {
							xhr[ i ] = options.xhrFields[ i ];
						}
					}

					// Override mime type if needed
					if ( options.mimeType && xhr.overrideMimeType ) {
						xhr.overrideMimeType( options.mimeType );
					}

					// X-Requested-With header
					// For cross-domain requests, seeing as conditions for a preflight are
					// akin to a jigsaw puzzle, we simply never set it to be sure.
					// (it can always be set on a per-request basis or even using ajaxSetup)
					// For same-domain requests, won't change header if already provided.
					if ( !options.crossDomain && !headers[ "X-Requested-With" ] ) {
						headers[ "X-Requested-With" ] = "XMLHttpRequest";
					}

					// Set headers
					for ( i in headers ) {

						// Support: IE<9
						// IE's ActiveXObject throws a 'Type Mismatch' exception when setting
						// request header to a null-value.
						//
						// To keep consistent with other XHR implementations, cast the value
						// to string and ignore `undefined`.
						if ( headers[ i ] !== undefined ) {
							xhr.setRequestHeader( i, headers[ i ] + "" );
						}
					}

					// Do send the request
					// This may raise an exception which is actually
					// handled in jQuery.ajax (so no try/catch here)
					xhr.send( ( options.hasContent && options.data ) || null );

					// Listener
					callback = function( _, isAbort ) {
						var status, statusText, responses;

						// Was never called and is aborted or complete
						if ( callback && ( isAbort || xhr.readyState === 4 ) ) {

							// Clean up
							delete xhrCallbacks[ id ];
							callback = undefined;
							xhr.onreadystatechange = jQuery.noop;

							// Abort manually if needed
							if ( isAbort ) {
								if ( xhr.readyState !== 4 ) {
									xhr.abort();
								}
							} else {
								responses = {};
								status = xhr.status;

								// Support: IE<10
								// Accessing binary-data responseText throws an exception
								// (#11426)
								if ( typeof xhr.responseText === "string" ) {
									responses.text = xhr.responseText;
								}

								// Firefox throws an exception when accessing
								// statusText for faulty cross-domain requests
								try {
									statusText = xhr.statusText;
								} catch ( e ) {

									// We normalize with Webkit giving an empty statusText
									statusText = "";
								}

								// Filter status for non standard behaviors

								// If the request is local and we have data: assume a success
								// (success with no data won't get notified, that's the best we
								// can do given current implementations)
								if ( !status && options.isLocal && !options.crossDomain ) {
									status = responses.text ? 200 : 404;

								// IE - #1450: sometimes returns 1223 when it should be 204
								} else if ( status === 1223 ) {
									status = 204;
								}
							}
						}

						// Call complete if needed
						if ( responses ) {
							complete( status, statusText, responses, xhr.getAllResponseHeaders() );
						}
					};

					// Do send the request
					// `xhr.send` may raise an exception, but it will be
					// handled in jQuery.ajax (so no try/catch here)
					if ( !options.async ) {

						// If we're in sync mode we fire the callback
						callback();
					} else if ( xhr.readyState === 4 ) {

						// (IE6 & IE7) if it's in cache and has been
						// retrieved directly we need to fire the callback
						window.setTimeout( callback );
					} else {

						// Register the callback, but delay it in case `xhr.send` throws
						// Add to the list of active xhr callbacks
						xhr.onreadystatechange = xhrCallbacks[ id ] = callback;
					}
				},

				abort: function() {
					if ( callback ) {
						callback( undefined, true );
					}
				}
			};
		}
	} );
}

// Functions to create xhrs
function createStandardXHR() {
	try {
		return new window.XMLHttpRequest();
	} catch ( e ) {}
}

function createActiveXHR() {
	try {
		return new window.ActiveXObject( "Microsoft.XMLHTTP" );
	} catch ( e ) {}
}




// Install script dataType
jQuery.ajaxSetup( {
	accepts: {
		script: "text/javascript, application/javascript, " +
			"application/ecmascript, application/x-ecmascript"
	},
	contents: {
		script: /\b(?:java|ecma)script\b/
	},
	converters: {
		"text script": function( text ) {
			jQuery.globalEval( text );
			return text;
		}
	}
} );

// Handle cache's special case and global
jQuery.ajaxPrefilter( "script", function( s ) {
	if ( s.cache === undefined ) {
		s.cache = false;
	}
	if ( s.crossDomain ) {
		s.type = "GET";
		s.global = false;
	}
} );

// Bind script tag hack transport
jQuery.ajaxTransport( "script", function( s ) {

	// This transport only deals with cross domain requests
	if ( s.crossDomain ) {

		var script,
			head = document.head || jQuery( "head" )[ 0 ] || document.documentElement;

		return {

			send: function( _, callback ) {

				script = document.createElement( "script" );

				script.async = true;

				if ( s.scriptCharset ) {
					script.charset = s.scriptCharset;
				}

				script.src = s.url;

				// Attach handlers for all browsers
				script.onload = script.onreadystatechange = function( _, isAbort ) {

					if ( isAbort || !script.readyState || /loaded|complete/.test( script.readyState ) ) {

						// Handle memory leak in IE
						script.onload = script.onreadystatechange = null;

						// Remove the script
						if ( script.parentNode ) {
							script.parentNode.removeChild( script );
						}

						// Dereference the script
						script = null;

						// Callback if not abort
						if ( !isAbort ) {
							callback( 200, "success" );
						}
					}
				};

				// Circumvent IE6 bugs with base elements (#2709 and #4378) by prepending
				// Use native DOM manipulation to avoid our domManip AJAX trickery
				head.insertBefore( script, head.firstChild );
			},

			abort: function() {
				if ( script ) {
					script.onload( undefined, true );
				}
			}
		};
	}
} );




var oldCallbacks = [],
	rjsonp = /(=)\?(?=&|$)|\?\?/;

// Default jsonp settings
jQuery.ajaxSetup( {
	jsonp: "callback",
	jsonpCallback: function() {
		var callback = oldCallbacks.pop() || ( jQuery.expando + "_" + ( nonce++ ) );
		this[ callback ] = true;
		return callback;
	}
} );

// Detect, normalize options and install callbacks for jsonp requests
jQuery.ajaxPrefilter( "json jsonp", function( s, originalSettings, jqXHR ) {

	var callbackName, overwritten, responseContainer,
		jsonProp = s.jsonp !== false && ( rjsonp.test( s.url ) ?
			"url" :
			typeof s.data === "string" &&
				( s.contentType || "" )
					.indexOf( "application/x-www-form-urlencoded" ) === 0 &&
				rjsonp.test( s.data ) && "data"
		);

	// Handle iff the expected data type is "jsonp" or we have a parameter to set
	if ( jsonProp || s.dataTypes[ 0 ] === "jsonp" ) {

		// Get callback name, remembering preexisting value associated with it
		callbackName = s.jsonpCallback = jQuery.isFunction( s.jsonpCallback ) ?
			s.jsonpCallback() :
			s.jsonpCallback;

		// Insert callback into url or form data
		if ( jsonProp ) {
			s[ jsonProp ] = s[ jsonProp ].replace( rjsonp, "$1" + callbackName );
		} else if ( s.jsonp !== false ) {
			s.url += ( rquery.test( s.url ) ? "&" : "?" ) + s.jsonp + "=" + callbackName;
		}

		// Use data converter to retrieve json after script execution
		s.converters[ "script json" ] = function() {
			if ( !responseContainer ) {
				jQuery.error( callbackName + " was not called" );
			}
			return responseContainer[ 0 ];
		};

		// force json dataType
		s.dataTypes[ 0 ] = "json";

		// Install callback
		overwritten = window[ callbackName ];
		window[ callbackName ] = function() {
			responseContainer = arguments;
		};

		// Clean-up function (fires after converters)
		jqXHR.always( function() {

			// If previous value didn't exist - remove it
			if ( overwritten === undefined ) {
				jQuery( window ).removeProp( callbackName );

			// Otherwise restore preexisting value
			} else {
				window[ callbackName ] = overwritten;
			}

			// Save back as free
			if ( s[ callbackName ] ) {

				// make sure that re-using the options doesn't screw things around
				s.jsonpCallback = originalSettings.jsonpCallback;

				// save the callback name for future use
				oldCallbacks.push( callbackName );
			}

			// Call if it was a function and we have a response
			if ( responseContainer && jQuery.isFunction( overwritten ) ) {
				overwritten( responseContainer[ 0 ] );
			}

			responseContainer = overwritten = undefined;
		} );

		// Delegate to script
		return "script";
	}
} );




// data: string of html
// context (optional): If specified, the fragment will be created in this context,
// defaults to document
// keepScripts (optional): If true, will include scripts passed in the html string
jQuery.parseHTML = function( data, context, keepScripts ) {
	if ( !data || typeof data !== "string" ) {
		return null;
	}
	if ( typeof context === "boolean" ) {
		keepScripts = context;
		context = false;
	}
	context = context || document;

	var parsed = rsingleTag.exec( data ),
		scripts = !keepScripts && [];

	// Single tag
	if ( parsed ) {
		return [ context.createElement( parsed[ 1 ] ) ];
	}

	parsed = buildFragment( [ data ], context, scripts );

	if ( scripts && scripts.length ) {
		jQuery( scripts ).remove();
	}

	return jQuery.merge( [], parsed.childNodes );
};


// Keep a copy of the old load method
var _load = jQuery.fn.load;

/**
 * Load a url into a page
 */
jQuery.fn.load = function( url, params, callback ) {
	if ( typeof url !== "string" && _load ) {
		return _load.apply( this, arguments );
	}

	var selector, type, response,
		self = this,
		off = url.indexOf( " " );

	if ( off > -1 ) {
		selector = jQuery.trim( url.slice( off, url.length ) );
		url = url.slice( 0, off );
	}

	// If it's a function
	if ( jQuery.isFunction( params ) ) {

		// We assume that it's the callback
		callback = params;
		params = undefined;

	// Otherwise, build a param string
	} else if ( params && typeof params === "object" ) {
		type = "POST";
	}

	// If we have elements to modify, make the request
	if ( self.length > 0 ) {
		jQuery.ajax( {
			url: url,

			// If "type" variable is undefined, then "GET" method will be used.
			// Make value of this field explicit since
			// user can override it through ajaxSetup method
			type: type || "GET",
			dataType: "html",
			data: params
		} ).done( function( responseText ) {

			// Save response for use in complete callback
			response = arguments;

			self.html( selector ?

				// If a selector was specified, locate the right elements in a dummy div
				// Exclude scripts to avoid IE 'Permission Denied' errors
				jQuery( "<div>" ).append( jQuery.parseHTML( responseText ) ).find( selector ) :

				// Otherwise use the full result
				responseText );

		// If the request succeeds, this function gets "data", "status", "jqXHR"
		// but they are ignored because response was set above.
		// If it fails, this function gets "jqXHR", "status", "error"
		} ).always( callback && function( jqXHR, status ) {
			self.each( function() {
				callback.apply( this, response || [ jqXHR.responseText, status, jqXHR ] );
			} );
		} );
	}

	return this;
};




// Attach a bunch of functions for handling common AJAX events
jQuery.each( [
	"ajaxStart",
	"ajaxStop",
	"ajaxComplete",
	"ajaxError",
	"ajaxSuccess",
	"ajaxSend"
], function( i, type ) {
	jQuery.fn[ type ] = function( fn ) {
		return this.on( type, fn );
	};
} );




jQuery.expr.filters.animated = function( elem ) {
	return jQuery.grep( jQuery.timers, function( fn ) {
		return elem === fn.elem;
	} ).length;
};





/**
 * Gets a window from an element
 */
function getWindow( elem ) {
	return jQuery.isWindow( elem ) ?
		elem :
		elem.nodeType === 9 ?
			elem.defaultView || elem.parentWindow :
			false;
}

jQuery.offset = {
	setOffset: function( elem, options, i ) {
		var curPosition, curLeft, curCSSTop, curTop, curOffset, curCSSLeft, calculatePosition,
			position = jQuery.css( elem, "position" ),
			curElem = jQuery( elem ),
			props = {};

		// set position first, in-case top/left are set even on static elem
		if ( position === "static" ) {
			elem.style.position = "relative";
		}

		curOffset = curElem.offset();
		curCSSTop = jQuery.css( elem, "top" );
		curCSSLeft = jQuery.css( elem, "left" );
		calculatePosition = ( position === "absolute" || position === "fixed" ) &&
			jQuery.inArray( "auto", [ curCSSTop, curCSSLeft ] ) > -1;

		// need to be able to calculate position if either top or left
		// is auto and position is either absolute or fixed
		if ( calculatePosition ) {
			curPosition = curElem.position();
			curTop = curPosition.top;
			curLeft = curPosition.left;
		} else {
			curTop = parseFloat( curCSSTop ) || 0;
			curLeft = parseFloat( curCSSLeft ) || 0;
		}

		if ( jQuery.isFunction( options ) ) {

			// Use jQuery.extend here to allow modification of coordinates argument (gh-1848)
			options = options.call( elem, i, jQuery.extend( {}, curOffset ) );
		}

		if ( options.top != null ) {
			props.top = ( options.top - curOffset.top ) + curTop;
		}
		if ( options.left != null ) {
			props.left = ( options.left - curOffset.left ) + curLeft;
		}

		if ( "using" in options ) {
			options.using.call( elem, props );
		} else {
			curElem.css( props );
		}
	}
};

jQuery.fn.extend( {
	offset: function( options ) {
		if ( arguments.length ) {
			return options === undefined ?
				this :
				this.each( function( i ) {
					jQuery.offset.setOffset( this, options, i );
				} );
		}

		var docElem, win,
			box = { top: 0, left: 0 },
			elem = this[ 0 ],
			doc = elem && elem.ownerDocument;

		if ( !doc ) {
			return;
		}

		docElem = doc.documentElement;

		// Make sure it's not a disconnected DOM node
		if ( !jQuery.contains( docElem, elem ) ) {
			return box;
		}

		// If we don't have gBCR, just use 0,0 rather than error
		// BlackBerry 5, iOS 3 (original iPhone)
		if ( typeof elem.getBoundingClientRect !== "undefined" ) {
			box = elem.getBoundingClientRect();
		}
		win = getWindow( doc );
		return {
			top: box.top  + ( win.pageYOffset || docElem.scrollTop )  - ( docElem.clientTop  || 0 ),
			left: box.left + ( win.pageXOffset || docElem.scrollLeft ) - ( docElem.clientLeft || 0 )
		};
	},

	position: function() {
		if ( !this[ 0 ] ) {
			return;
		}

		var offsetParent, offset,
			parentOffset = { top: 0, left: 0 },
			elem = this[ 0 ];

		// Fixed elements are offset from window (parentOffset = {top:0, left: 0},
		// because it is its only offset parent
		if ( jQuery.css( elem, "position" ) === "fixed" ) {

			// we assume that getBoundingClientRect is available when computed position is fixed
			offset = elem.getBoundingClientRect();
		} else {

			// Get *real* offsetParent
			offsetParent = this.offsetParent();

			// Get correct offsets
			offset = this.offset();
			if ( !jQuery.nodeName( offsetParent[ 0 ], "html" ) ) {
				parentOffset = offsetParent.offset();
			}

			// Add offsetParent borders
			parentOffset.top  += jQuery.css( offsetParent[ 0 ], "borderTopWidth", true );
			parentOffset.left += jQuery.css( offsetParent[ 0 ], "borderLeftWidth", true );
		}

		// Subtract parent offsets and element margins
		// note: when an element has margin: auto the offsetLeft and marginLeft
		// are the same in Safari causing offset.left to incorrectly be 0
		return {
			top:  offset.top  - parentOffset.top - jQuery.css( elem, "marginTop", true ),
			left: offset.left - parentOffset.left - jQuery.css( elem, "marginLeft", true )
		};
	},

	offsetParent: function() {
		return this.map( function() {
			var offsetParent = this.offsetParent;

			while ( offsetParent && ( !jQuery.nodeName( offsetParent, "html" ) &&
				jQuery.css( offsetParent, "position" ) === "static" ) ) {
				offsetParent = offsetParent.offsetParent;
			}
			return offsetParent || documentElement;
		} );
	}
} );

// Create scrollLeft and scrollTop methods
jQuery.each( { scrollLeft: "pageXOffset", scrollTop: "pageYOffset" }, function( method, prop ) {
	var top = /Y/.test( prop );

	jQuery.fn[ method ] = function( val ) {
		return access( this, function( elem, method, val ) {
			var win = getWindow( elem );

			if ( val === undefined ) {
				return win ? ( prop in win ) ? win[ prop ] :
					win.document.documentElement[ method ] :
					elem[ method ];
			}

			if ( win ) {
				win.scrollTo(
					!top ? val : jQuery( win ).scrollLeft(),
					top ? val : jQuery( win ).scrollTop()
				);

			} else {
				elem[ method ] = val;
			}
		}, method, val, arguments.length, null );
	};
} );

// Support: Safari<7-8+, Chrome<37-44+
// Add the top/left cssHooks using jQuery.fn.position
// Webkit bug: https://bugs.webkit.org/show_bug.cgi?id=29084
// getComputedStyle returns percent when specified for top/left/bottom/right
// rather than make the css module depend on the offset module, we just check for it here
jQuery.each( [ "top", "left" ], function( i, prop ) {
	jQuery.cssHooks[ prop ] = addGetHookIf( support.pixelPosition,
		function( elem, computed ) {
			if ( computed ) {
				computed = curCSS( elem, prop );

				// if curCSS returns percentage, fallback to offset
				return rnumnonpx.test( computed ) ?
					jQuery( elem ).position()[ prop ] + "px" :
					computed;
			}
		}
	);
} );


// Create innerHeight, innerWidth, height, width, outerHeight and outerWidth methods
jQuery.each( { Height: "height", Width: "width" }, function( name, type ) {
	jQuery.each( { padding: "inner" + name, content: type, "": "outer" + name },
	function( defaultExtra, funcName ) {

		// margin is only for outerHeight, outerWidth
		jQuery.fn[ funcName ] = function( margin, value ) {
			var chainable = arguments.length && ( defaultExtra || typeof margin !== "boolean" ),
				extra = defaultExtra || ( margin === true || value === true ? "margin" : "border" );

			return access( this, function( elem, type, value ) {
				var doc;

				if ( jQuery.isWindow( elem ) ) {

					// As of 5/8/2012 this will yield incorrect results for Mobile Safari, but there
					// isn't a whole lot we can do. See pull request at this URL for discussion:
					// https://github.com/jquery/jquery/pull/764
					return elem.document.documentElement[ "client" + name ];
				}

				// Get document width or height
				if ( elem.nodeType === 9 ) {
					doc = elem.documentElement;

					// Either scroll[Width/Height] or offset[Width/Height] or client[Width/Height],
					// whichever is greatest
					// unfortunately, this causes bug #3838 in IE6/8 only,
					// but there is currently no good, small way to fix it.
					return Math.max(
						elem.body[ "scroll" + name ], doc[ "scroll" + name ],
						elem.body[ "offset" + name ], doc[ "offset" + name ],
						doc[ "client" + name ]
					);
				}

				return value === undefined ?

					// Get width or height on the element, requesting but not forcing parseFloat
					jQuery.css( elem, type, extra ) :

					// Set width or height on the element
					jQuery.style( elem, type, value, extra );
			}, type, chainable ? margin : undefined, chainable, null );
		};
	} );
} );


jQuery.fn.extend( {

	bind: function( types, data, fn ) {
		return this.on( types, null, data, fn );
	},
	unbind: function( types, fn ) {
		return this.off( types, null, fn );
	},

	delegate: function( selector, types, data, fn ) {
		return this.on( types, selector, data, fn );
	},
	undelegate: function( selector, types, fn ) {

		// ( namespace ) or ( selector, types [, fn] )
		return arguments.length === 1 ?
			this.off( selector, "**" ) :
			this.off( types, selector || "**", fn );
	}
} );

// The number of elements contained in the matched element set
jQuery.fn.size = function() {
	return this.length;
};

jQuery.fn.andSelf = jQuery.fn.addBack;




// Register as a named AMD module, since jQuery can be concatenated with other
// files that may use define, but not via a proper concatenation script that
// understands anonymous AMD modules. A named AMD is safest and most robust
// way to register. Lowercase jquery is used because AMD module names are
// derived from file names, and jQuery is normally delivered in a lowercase
// file name. Do this after creating the global so that if an AMD module wants
// to call noConflict to hide this version of jQuery, it will work.

// Note that for maximum portability, libraries that are not jQuery should
// declare themselves as anonymous modules, and avoid setting a global if an
// AMD loader is present. jQuery is a special case. For more information, see
// https://github.com/jrburke/requirejs/wiki/Updating-existing-libraries#wiki-anon

if ( typeof define === "function" && define.amd ) {
	define( "jquery", [], function() {
		return jQuery;
	} );
}



var

	// Map over jQuery in case of overwrite
	_jQuery = window.jQuery,

	// Map over the $ in case of overwrite
	_$ = window.$;

jQuery.noConflict = function( deep ) {
	if ( window.$ === jQuery ) {
		window.$ = _$;
	}

	if ( deep && window.jQuery === jQuery ) {
		window.jQuery = _jQuery;
	}

	return jQuery;
};

// Expose jQuery and $ identifiers, even in
// AMD (#7102#comment:10, https://github.com/jquery/jquery/pull/557)
// and CommonJS for browser emulators (#13566)
if ( !noGlobal ) {
	window.jQuery = window.$ = jQuery;
}

return jQuery;
}));
function buildMap(){var a=[],b=[];for(var c in Config.emoji_data){for(var d=0;d<Config.emoji_data[c][0].length;d++)a.push(Config.escape_rx(":"+Config.emoji_data[c][3][0])+":"),b.push(Config.emoji_data[c][0][0]),Config.map[Config.emoji_data[c][3][0]]=Config.emoji_data[c][0][0],Config.mapcolon[":"+Config.emoji_data[c][3][0]+":"]=Config.emoji_data[c][0][0],Config.reversemap[Config.emoji_data[c][0][0]]=Config.emoji_data[c][3][0];Config.rx_colons=new RegExp("("+a.join("|")+")","g"),Config.rx_codes=new RegExp("("+b.join("|")+")","g")}}function cancelEvent(a){return a=a||window.event,a&&(a=a.originalEvent||a,a.stopPropagation&&a.stopPropagation(),a.preventDefault&&a.preventDefault()),!1}function getGuid(){return"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,function(a){var b=16*Math.random()|0,c="x"==a?b:3&b|8;return c.toString(16)})}!function(a){return"function"==typeof define&&define.amd?define(["jquery"],function(b){return a(b,window,document)}):"object"==typeof exports?module.exports=a(require("jquery"),window,document):a(jQuery,window,document)}(function(a,b,c){"use strict";var d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z,A,B,C,D,E,F,G,H;z={paneClass:"nano-pane",sliderClass:"nano-slider",contentClass:"nano-content",enabledClass:"has-scrollbar",flashedClass:"flashed",activeClass:"active",iOSNativeScrolling:!1,preventPageScrolling:!1,disableResize:!1,alwaysVisible:!1,flashDelay:1500,sliderMinHeight:20,sliderMaxHeight:null,documentContext:null,windowContext:null},u="scrollbar",t="scroll",l="mousedown",m="mouseenter",n="mousemove",p="mousewheel",o="mouseup",s="resize",h="drag",i="enter",w="up",r="panedown",f="DOMMouseScroll",g="down",x="wheel",j="keydown",k="keyup",v="touchmove",d="Microsoft Internet Explorer"===b.navigator.appName&&/msie 7./i.test(b.navigator.appVersion)&&b.ActiveXObject,e=null,D=b.requestAnimationFrame,y=b.cancelAnimationFrame,F=c.createElement("div").style,H=function(){var a,b,c,d,e,f;for(d=["t","webkitT","MozT","msT","OT"],a=e=0,f=d.length;f>e;a=++e)if(c=d[a],b=d[a]+"ransform",b in F)return d[a].substr(0,d[a].length-1);return!1}(),G=function(a){return H===!1?!1:""===H?a:H+a.charAt(0).toUpperCase()+a.substr(1)},E=G("transform"),B=E!==!1,A=function(){var a,b,d;return a=c.createElement("div"),b=a.style,b.position="absolute",b.width="100px",b.height="100px",b.overflow=t,b.top="-9999px",c.body.appendChild(a),d=a.offsetWidth-a.clientWidth,c.body.removeChild(a),d},C=function(){var a,c,d;return c=b.navigator.userAgent,(a=/(?=.+Mac OS X)(?=.+Firefox)/.test(c))?(d=/Firefox\/\d{2}\./.exec(c),d&&(d=d[0].replace(/\D+/g,"")),a&&+d>23):!1},q=function(){function j(d,f){this.el=d,this.options=f,e||(e=A()),this.$el=a(this.el),this.doc=a(this.options.documentContext||c),this.win=a(this.options.windowContext||b),this.body=this.doc.find("body"),this.$content=this.$el.children("."+this.options.contentClass),this.$content.attr("tabindex",this.options.tabIndex||0),this.content=this.$content[0],this.previousPosition=0,this.options.iOSNativeScrolling&&null!=this.el.style.WebkitOverflowScrolling?this.nativeScrolling():this.generate(),this.createEvents(),this.addEvents(),this.reset()}return j.prototype.preventScrolling=function(a,b){if(this.isActive)if(a.type===f)(b===g&&a.originalEvent.detail>0||b===w&&a.originalEvent.detail<0)&&a.preventDefault();else if(a.type===p){if(!a.originalEvent||!a.originalEvent.wheelDelta)return;(b===g&&a.originalEvent.wheelDelta<0||b===w&&a.originalEvent.wheelDelta>0)&&a.preventDefault()}},j.prototype.nativeScrolling=function(){this.$content.css({WebkitOverflowScrolling:"touch"}),this.iOSNativeScrolling=!0,this.isActive=!0},j.prototype.updateScrollValues=function(){var a,b;a=this.content,this.maxScrollTop=a.scrollHeight-a.clientHeight,this.prevScrollTop=this.contentScrollTop||0,this.contentScrollTop=a.scrollTop,b=this.contentScrollTop>this.previousPosition?"down":this.contentScrollTop<this.previousPosition?"up":"same",this.previousPosition=this.contentScrollTop,"same"!==b&&this.$el.trigger("update",{position:this.contentScrollTop,maximum:this.maxScrollTop,direction:b}),this.iOSNativeScrolling||(this.maxSliderTop=this.paneHeight-this.sliderHeight,this.sliderTop=0===this.maxScrollTop?0:this.contentScrollTop*this.maxSliderTop/this.maxScrollTop)},j.prototype.setOnScrollStyles=function(){var a;B?(a={},a[E]="translate(0, "+this.sliderTop+"px)"):a={top:this.sliderTop},D?(y&&this.scrollRAF&&y(this.scrollRAF),this.scrollRAF=D(function(b){return function(){return b.scrollRAF=null,b.slider.css(a)}}(this))):this.slider.css(a)},j.prototype.createEvents=function(){this.events={down:function(a){return function(b){return a.isBeingDragged=!0,a.offsetY=b.pageY-a.slider.offset().top,a.slider.is(b.target)||(a.offsetY=0),a.pane.addClass(a.options.activeClass),a.doc.bind(n,a.events[h]).bind(o,a.events[w]),a.body.bind(m,a.events[i]),!1}}(this),drag:function(a){return function(b){return a.sliderY=b.pageY-a.$el.offset().top-a.paneTop-(a.offsetY||.5*a.sliderHeight),a.scroll(),a.contentScrollTop>=a.maxScrollTop&&a.prevScrollTop!==a.maxScrollTop?a.$el.trigger("scrollend"):0===a.contentScrollTop&&0!==a.prevScrollTop&&a.$el.trigger("scrolltop"),!1}}(this),up:function(a){return function(b){return a.isBeingDragged=!1,a.pane.removeClass(a.options.activeClass),a.doc.unbind(n,a.events[h]).unbind(o,a.events[w]),a.body.unbind(m,a.events[i]),!1}}(this),resize:function(a){return function(b){a.reset()}}(this),panedown:function(a){return function(b){return a.sliderY=(b.offsetY||b.originalEvent.layerY)-.5*a.sliderHeight,a.scroll(),a.events.down(b),!1}}(this),scroll:function(a){return function(b){a.updateScrollValues(),a.isBeingDragged||(a.iOSNativeScrolling||(a.sliderY=a.sliderTop,a.setOnScrollStyles()),null!=b&&(a.contentScrollTop>=a.maxScrollTop?(a.options.preventPageScrolling&&a.preventScrolling(b,g),a.prevScrollTop!==a.maxScrollTop&&a.$el.trigger("scrollend")):0===a.contentScrollTop&&(a.options.preventPageScrolling&&a.preventScrolling(b,w),0!==a.prevScrollTop&&a.$el.trigger("scrolltop"))))}}(this),wheel:function(a){return function(b){var c;return null!=b?(c=b.delta||b.wheelDelta||b.originalEvent&&b.originalEvent.wheelDelta||-b.detail||b.originalEvent&&-b.originalEvent.detail,c&&(a.sliderY+=-c/3),a.scroll(),!1):void 0}}(this),enter:function(a){return function(b){var c;return a.isBeingDragged&&1!==(b.buttons||b.which)?(c=a.events)[w].apply(c,arguments):void 0}}(this)}},j.prototype.addEvents=function(){var a;this.removeEvents(),a=this.events,this.options.disableResize||this.win.bind(s,a[s]),this.iOSNativeScrolling||(this.slider.bind(l,a[g]),this.pane.bind(l,a[r]).bind(""+p+" "+f,a[x])),this.$content.bind(""+t+" "+p+" "+f+" "+v,a[t])},j.prototype.removeEvents=function(){var a;a=this.events,this.win.unbind(s,a[s]),this.iOSNativeScrolling||(this.slider.unbind(),this.pane.unbind()),this.$content.unbind(""+t+" "+p+" "+f+" "+v,a[t])},j.prototype.generate=function(){var a,c,d,f,g,h,i;return f=this.options,h=f.paneClass,i=f.sliderClass,a=f.contentClass,(g=this.$el.children("."+h)).length||g.children("."+i).length||this.$el.append('<div class="'+h+'"><div class="'+i+'" /></div>'),this.pane=this.$el.children("."+h),this.slider=this.pane.find("."+i),0===e&&C()?(d=b.getComputedStyle(this.content,null).getPropertyValue("padding-right").replace(/[^0-9.]+/g,""),c={right:-14,paddingRight:+d+14}):e&&(c={right:-e},this.$el.addClass(f.enabledClass)),null!=c&&this.$content.css(c),this},j.prototype.restore=function(){this.stopped=!1,this.iOSNativeScrolling||this.pane.show(),this.addEvents()},j.prototype.reset=function(){var a,b,c,f,g,h,i,j,k,l,m,n;return this.iOSNativeScrolling?void(this.contentHeight=this.content.scrollHeight):(this.$el.find("."+this.options.paneClass).length||this.generate().stop(),this.stopped&&this.restore(),a=this.content,f=a.style,g=f.overflowY,d&&this.$content.css({height:this.$content.height()}),b=a.scrollHeight+e,l=parseInt(this.$el.css("max-height"),10),l>0&&(this.$el.height(""),this.$el.height(a.scrollHeight>l?l:a.scrollHeight)),i=this.pane.outerHeight(!1),k=parseInt(this.pane.css("top"),10),h=parseInt(this.pane.css("bottom"),10),j=i+k+h,n=Math.round(j/b*i),n<this.options.sliderMinHeight?n=this.options.sliderMinHeight:null!=this.options.sliderMaxHeight&&n>this.options.sliderMaxHeight&&(n=this.options.sliderMaxHeight),g===t&&f.overflowX!==t&&(n+=e),this.maxSliderTop=j-n,this.contentHeight=b,this.paneHeight=i,this.paneOuterHeight=j,this.sliderHeight=n,this.paneTop=k,this.slider.height(n),this.events.scroll(),this.pane.show(),this.isActive=!0,a.scrollHeight===a.clientHeight||this.pane.outerHeight(!0)>=a.scrollHeight&&g!==t?(this.pane.hide(),this.isActive=!1):this.el.clientHeight===a.scrollHeight&&g===t?this.slider.hide():this.slider.show(),this.pane.css({opacity:this.options.alwaysVisible?1:"",visibility:this.options.alwaysVisible?"visible":""}),c=this.$content.css("position"),("static"===c||"relative"===c)&&(m=parseInt(this.$content.css("right"),10),m&&this.$content.css({right:"",marginRight:m})),this)},j.prototype.scroll=function(){return this.isActive?(this.sliderY=Math.max(0,this.sliderY),this.sliderY=Math.min(this.maxSliderTop,this.sliderY),this.$content.scrollTop(this.maxScrollTop*this.sliderY/this.maxSliderTop),this.iOSNativeScrolling||(this.updateScrollValues(),this.setOnScrollStyles()),this):void 0},j.prototype.scrollBottom=function(a){return this.isActive?(this.$content.scrollTop(this.contentHeight-this.$content.height()-a).trigger(p),this.stop().restore(),this):void 0},j.prototype.scrollTop=function(a){return this.isActive?(this.$content.scrollTop(+a).trigger(p),this.stop().restore(),this):void 0},j.prototype.scrollTo=function(a){return this.isActive?(this.scrollTop(this.$el.find(a).get(0).offsetTop),this):void 0},j.prototype.stop=function(){return y&&this.scrollRAF&&(y(this.scrollRAF),this.scrollRAF=null),this.stopped=!0,this.removeEvents(),this.iOSNativeScrolling||this.pane.hide(),this},j.prototype.destroy=function(){return this.stopped||this.stop(),!this.iOSNativeScrolling&&this.pane.length&&this.pane.remove(),d&&this.$content.height(""),this.$content.removeAttr("tabindex"),this.$el.hasClass(this.options.enabledClass)&&(this.$el.removeClass(this.options.enabledClass),this.$content.css({right:""})),this},j.prototype.flash=function(){return!this.iOSNativeScrolling&&this.isActive?(this.reset(),this.pane.addClass(this.options.flashedClass),setTimeout(function(a){return function(){a.pane.removeClass(a.options.flashedClass)}}(this),this.options.flashDelay),this):void 0},j}(),a.fn.nanoScroller=function(b){return this.each(function(){var c,d;if((d=this.nanoscroller)||(c=a.extend({},z,b),this.nanoscroller=d=new q(this,c)),b&&"object"==typeof b){if(a.extend(d.options,b),null!=b.scrollBottom)return d.scrollBottom(b.scrollBottom);if(null!=b.scrollTop)return d.scrollTop(b.scrollTop);if(b.scrollTo)return d.scrollTo(b.scrollTo);if("bottom"===b.scroll)return d.scrollBottom(0);if("top"===b.scroll)return d.scrollTop(0);if(b.scroll&&b.scroll instanceof a)return d.scrollTo(b.scroll);if(b.stop)return d.stop();if(b.destroy)return d.destroy();if(b.flash)return d.flash()}return d.reset()})},a.fn.nanoScroller.Constructor=q}),!function(a,b){"function"==typeof define&&define.amd?define(b):"object"==typeof exports?module.exports=b(require,exports,module):a.Tether=b()}(this,function(a,b,c){"use strict";function d(a,b){if(!(a instanceof b))throw new TypeError("Cannot call a class as a function")}function e(a){var b=getComputedStyle(a),c=b.position;if("fixed"===c)return a;for(var d=a;d=d.parentNode;){var e=void 0;try{e=getComputedStyle(d)}catch(f){}if("undefined"==typeof e||null===e)return d;var g=e.overflow,h=e.overflowX,i=e.overflowY;if(/(auto|scroll)/.test(g+i+h)&&("absolute"!==c||["relative","absolute","fixed"].indexOf(e.position)>=0))return d}return document.body}function f(a){var b=void 0;a===document?(b=document,a=document.documentElement):b=a.ownerDocument;var c=b.documentElement,d={},e=a.getBoundingClientRect();for(var f in e)d[f]=e[f];var g=y(b);return d.top-=g.top,d.left-=g.left,"undefined"==typeof d.width&&(d.width=document.body.scrollWidth-d.left-d.right),"undefined"==typeof d.height&&(d.height=document.body.scrollHeight-d.top-d.bottom),d.top=d.top-c.clientTop,d.left=d.left-c.clientLeft,d.right=b.body.clientWidth-d.width-d.left,d.bottom=b.body.clientHeight-d.height-d.top,d}function g(a){return a.offsetParent||document.documentElement}function h(){var a=document.createElement("div");a.style.width="100%",a.style.height="200px";var b=document.createElement("div");i(b.style,{position:"absolute",top:0,left:0,pointerEvents:"none",visibility:"hidden",width:"200px",height:"150px",overflow:"hidden"}),b.appendChild(a),document.body.appendChild(b);var c=a.offsetWidth;b.style.overflow="scroll";var d=a.offsetWidth;c===d&&(d=b.clientWidth),document.body.removeChild(b);var e=c-d;return{width:e,height:e}}function i(){var a=arguments.length<=0||void 0===arguments[0]?{}:arguments[0],b=[];return Array.prototype.push.apply(b,arguments),b.slice(1).forEach(function(b){if(b)for(var c in b)({}).hasOwnProperty.call(b,c)&&(a[c]=b[c])}),a}function j(a,b){if("undefined"!=typeof a.classList)b.split(" ").forEach(function(b){b.trim()&&a.classList.remove(b)});else{var c=new RegExp("(^| )"+b.split(" ").join("|")+"( |$)","gi"),d=m(a).replace(c," ");n(a,d)}}function k(a,b){if("undefined"!=typeof a.classList)b.split(" ").forEach(function(b){b.trim()&&a.classList.add(b)});else{j(a,b);var c=m(a)+(" "+b);n(a,c)}}function l(a,b){if("undefined"!=typeof a.classList)return a.classList.contains(b);var c=m(a);return new RegExp("(^| )"+b+"( |$)","gi").test(c)}function m(a){return a.className instanceof SVGAnimatedString?a.className.baseVal:a.className}function n(a,b){a.setAttribute("class",b)}function o(a,b,c){c.forEach(function(c){-1===b.indexOf(c)&&l(a,c)&&j(a,c)}),b.forEach(function(b){l(a,b)||k(a,b)})}function d(a,b){if(!(a instanceof b))throw new TypeError("Cannot call a class as a function")}function p(a,b){var c=arguments.length<=2||void 0===arguments[2]?1:arguments[2];return a+c>=b&&b>=a-c}function q(){return"undefined"!=typeof performance&&"undefined"!=typeof performance.now?performance.now():+new Date}function r(){for(var a={top:0,left:0},b=arguments.length,c=Array(b),d=0;b>d;d++)c[d]=arguments[d];return c.forEach(function(b){var c=b.top,d=b.left;"string"==typeof c&&(c=parseFloat(c,10)),"string"==typeof d&&(d=parseFloat(d,10)),a.top+=c,a.left+=d}),a}function s(a,b){return"string"==typeof a.left&&-1!==a.left.indexOf("%")&&(a.left=parseFloat(a.left,10)/100*b.width),"string"==typeof a.top&&-1!==a.top.indexOf("%")&&(a.top=parseFloat(a.top,10)/100*b.height),a}function t(a,b){return"scrollParent"===b?b=a.scrollParent:"window"===b&&(b=[pageXOffset,pageYOffset,innerWidth+pageXOffset,innerHeight+pageYOffset]),b===document&&(b=b.documentElement),"undefined"!=typeof b.nodeType&&!function(){var a=f(b),c=a,d=getComputedStyle(b);b=[c.left,c.top,a.width+c.left,a.height+c.top],R.forEach(function(a,c){a=a[0].toUpperCase()+a.substr(1),"Top"===a||"Left"===a?b[c]+=parseFloat(d["border"+a+"Width"]):b[c]-=parseFloat(d["border"+a+"Width"])})}(),b}var u=function(){function a(a,b){for(var c=0;c<b.length;c++){var d=b[c];d.enumerable=d.enumerable||!1,d.configurable=!0,"value"in d&&(d.writable=!0),Object.defineProperty(a,d.key,d)}}return function(b,c,d){return c&&a(b.prototype,c),d&&a(b,d),b}}(),v=void 0;"undefined"==typeof v&&(v={modules:[]});var w=function(){var a=0;return function(){return++a}}(),x={},y=function(a){var b=a._tetherZeroElement;"undefined"==typeof b&&(b=a.createElement("div"),b.setAttribute("data-tether-id",w()),i(b.style,{top:0,left:0,position:"absolute"}),a.body.appendChild(b),a._tetherZeroElement=b);var c=b.getAttribute("data-tether-id");if("undefined"==typeof x[c]){x[c]={};var d=b.getBoundingClientRect();for(var e in d)x[c][e]=d[e];A(function(){delete x[c]})}return x[c]},z=[],A=function(a){z.push(a)},B=function(){for(var a=void 0;a=z.pop();)a()},C=function(){function a(){d(this,a)}return u(a,[{key:"on",value:function(a,b,c){var d=arguments.length<=3||void 0===arguments[3]?!1:arguments[3];"undefined"==typeof this.bindings&&(this.bindings={}),"undefined"==typeof this.bindings[a]&&(this.bindings[a]=[]),this.bindings[a].push({handler:b,ctx:c,once:d})}},{key:"once",value:function(a,b,c){this.on(a,b,c,!0)}},{key:"off",value:function(a,b){if("undefined"==typeof this.bindings||"undefined"==typeof this.bindings[a])if("undefined"==typeof b)delete this.bindings[a];else for(var c=0;c<this.bindings[a].length;)this.bindings[a][c].handler===b?this.bindings[a].splice(c,1):++c}},{key:"trigger",value:function(a){if("undefined"!=typeof this.bindings&&this.bindings[a])for(var b=0;b<this.bindings[a].length;){var c=this.bindings[a][b],d=c.handler,e=c.ctx,f=c.once,g=e;"undefined"==typeof g&&(g=this);for(var h=arguments.length,i=Array(h>1?h-1:0),j=1;h>j;j++)i[j-1]=arguments[j];d.apply(g,i),f?this.bindings[a].splice(b,1):++b}}}]),a}();v.Utils={getScrollParent:e,getBounds:f,getOffsetParent:g,extend:i,addClass:k,removeClass:j,hasClass:l,updateClasses:o,defer:A,flush:B,uniqueId:w,Evented:C,getScrollBarSize:h};var D=function(){function a(a,b){var c=[],d=!0,e=!1,f=void 0;try{for(var g,h=a[Symbol.iterator]();!(d=(g=h.next()).done)&&(c.push(g.value),!b||c.length!==b);d=!0);}catch(i){e=!0,f=i}finally{try{!d&&h["return"]&&h["return"]()}finally{if(e)throw f}}return c}return function(b,c){if(Array.isArray(b))return b;if(Symbol.iterator in Object(b))return a(b,c);throw new TypeError("Invalid attempt to destructure non-iterable instance")}}(),u=function(){function a(a,b){for(var c=0;c<b.length;c++){var d=b[c];d.enumerable=d.enumerable||!1,d.configurable=!0,"value"in d&&(d.writable=!0),Object.defineProperty(a,d.key,d)}}return function(b,c,d){return c&&a(b.prototype,c),d&&a(b,d),b}}();if("undefined"==typeof v)throw new Error("You must include the utils.js file before tether.js");var E=v.Utils,e=E.getScrollParent,f=E.getBounds,g=E.getOffsetParent,i=E.extend,k=E.addClass,j=E.removeClass,o=E.updateClasses,A=E.defer,B=E.flush,h=E.getScrollBarSize,F=function(){for(var a=document.createElement("div"),b=["transform","webkitTransform","OTransform","MozTransform","msTransform"],c=0;c<b.length;++c){var d=b[c];if(void 0!==a.style[d])return d}}(),G=[],H=function(){G.forEach(function(a){a.position(!1)}),B()};!function(){var a=null,b=null,c=null,d=function e(){return"undefined"!=typeof b&&b>16?(b=Math.min(b-16,250),void(c=setTimeout(e,250))):void("undefined"!=typeof a&&q()-a<10||("undefined"!=typeof c&&(clearTimeout(c),c=null),a=q(),H(),b=q()-a))};["resize","scroll","touchmove"].forEach(function(a){window.addEventListener(a,d)})}();var I={center:"center",left:"right",right:"left"},J={middle:"middle",top:"bottom",bottom:"top"},K={top:0,left:0,middle:"50%",center:"50%",bottom:"100%",right:"100%"},L=function(a,b){var c=a.left,d=a.top;return"auto"===c&&(c=I[b.left]),"auto"===d&&(d=J[b.top]),{left:c,top:d}},M=function(a){var b=a.left,c=a.top;return"undefined"!=typeof K[a.left]&&(b=K[a.left]),"undefined"!=typeof K[a.top]&&(c=K[a.top]),{left:b,top:c}},N=function(a){var b=a.split(" "),c=D(b,2),d=c[0],e=c[1];return{top:d,left:e}},O=N,P=function(){function a(b){var c=this;d(this,a),this.position=this.position.bind(this),G.push(this),this.history=[],this.setOptions(b,!1),v.modules.forEach(function(a){"undefined"!=typeof a.initialize&&a.initialize.call(c)}),this.position()}return u(a,[{key:"getClass",value:function(){var a=arguments.length<=0||void 0===arguments[0]?"":arguments[0],b=this.options.classes;return"undefined"!=typeof b&&b[a]?this.options.classes[a]:this.options.classPrefix?this.options.classPrefix+"-"+a:a}},{key:"setOptions",value:function(a){var b=this,c=arguments.length<=1||void 0===arguments[1]?!0:arguments[1],d={offset:"0 0",targetOffset:"0 0",targetAttachment:"auto auto",classPrefix:"tether"};this.options=i(d,a);var f=this.options,g=f.element,h=f.target,j=f.targetModifier;if(this.element=g,this.target=h,this.targetModifier=j,"viewport"===this.target?(this.target=document.body,this.targetModifier="visible"):"scroll-handle"===this.target&&(this.target=document.body,this.targetModifier="scroll-handle"),["element","target"].forEach(function(a){if("undefined"==typeof b[a])throw new Error("Tether Error: Both element and target must be defined");"undefined"!=typeof b[a].jquery?b[a]=b[a][0]:"string"==typeof b[a]&&(b[a]=document.querySelector(b[a]))}),k(this.element,this.getClass("element")),this.options.addTargetClasses!==!1&&k(this.target,this.getClass("target")),!this.options.attachment)throw new Error("Tether Error: You must provide an attachment");this.targetAttachment=O(this.options.targetAttachment),this.attachment=O(this.options.attachment),this.offset=N(this.options.offset),this.targetOffset=N(this.options.targetOffset),"undefined"!=typeof this.scrollParent&&this.disable(),this.scrollParent="scroll-handle"===this.targetModifier?this.target:e(this.target),this.options.enabled!==!1&&this.enable(c)}},{key:"getTargetBounds",value:function(){if("undefined"==typeof this.targetModifier)return f(this.target);if("visible"===this.targetModifier){if(this.target===document.body)return{top:pageYOffset,left:pageXOffset,height:innerHeight,width:innerWidth};var a=f(this.target),b={height:a.height,width:a.width,top:a.top,left:a.left};return b.height=Math.min(b.height,a.height-(pageYOffset-a.top)),b.height=Math.min(b.height,a.height-(a.top+a.height-(pageYOffset+innerHeight))),b.height=Math.min(innerHeight,b.height),b.height-=2,b.width=Math.min(b.width,a.width-(pageXOffset-a.left)),b.width=Math.min(b.width,a.width-(a.left+a.width-(pageXOffset+innerWidth))),b.width=Math.min(innerWidth,b.width),b.width-=2,b.top<pageYOffset&&(b.top=pageYOffset),b.left<pageXOffset&&(b.left=pageXOffset),b}if("scroll-handle"===this.targetModifier){var a=void 0,c=this.target;c===document.body?(c=document.documentElement,a={left:pageXOffset,top:pageYOffset,height:innerHeight,width:innerWidth}):a=f(c);var d=getComputedStyle(c),e=c.scrollWidth>c.clientWidth||[d.overflow,d.overflowX].indexOf("scroll")>=0||this.target!==document.body,g=0;e&&(g=15);var h=a.height-parseFloat(d.borderTopWidth)-parseFloat(d.borderBottomWidth)-g,b={width:15,height:.975*h*(h/c.scrollHeight),left:a.left+a.width-parseFloat(d.borderLeftWidth)-15},i=0;408>h&&this.target===document.body&&(i=-11e-5*Math.pow(h,2)-.00727*h+22.58),this.target!==document.body&&(b.height=Math.max(b.height,24));var j=this.target.scrollTop/(c.scrollHeight-h);return b.top=j*(h-b.height-i)+a.top+parseFloat(d.borderTopWidth),this.target===document.body&&(b.height=Math.max(b.height,24)),b}}},{key:"clearCache",value:function(){this._cache={}}},{key:"cache",value:function(a,b){return"undefined"==typeof this._cache&&(this._cache={}),"undefined"==typeof this._cache[a]&&(this._cache[a]=b.call(this)),this._cache[a]}},{key:"enable",value:function(){var a=arguments.length<=0||void 0===arguments[0]?!0:arguments[0];this.options.addTargetClasses!==!1&&k(this.target,this.getClass("enabled")),k(this.element,this.getClass("enabled")),this.enabled=!0,this.scrollParent!==document&&this.scrollParent.addEventListener("scroll",this.position),a&&this.position()}},{key:"disable",value:function(){j(this.target,this.getClass("enabled")),j(this.element,this.getClass("enabled")),this.enabled=!1,"undefined"!=typeof this.scrollParent&&this.scrollParent.removeEventListener("scroll",this.position)}},{key:"destroy",value:function(){var a=this;this.disable(),G.forEach(function(b,c){return b===a?void G.splice(c,1):void 0})}},{key:"updateAttachClasses",value:function(a,b){var c=this;a=a||this.attachment,b=b||this.targetAttachment;var d=["left","top","bottom","right","middle","center"];"undefined"!=typeof this._addAttachClasses&&this._addAttachClasses.length&&this._addAttachClasses.splice(0,this._addAttachClasses.length),"undefined"==typeof this._addAttachClasses&&(this._addAttachClasses=[]);var e=this._addAttachClasses;a.top&&e.push(this.getClass("element-attached")+"-"+a.top),a.left&&e.push(this.getClass("element-attached")+"-"+a.left),b.top&&e.push(this.getClass("target-attached")+"-"+b.top),b.left&&e.push(this.getClass("target-attached")+"-"+b.left);var f=[];d.forEach(function(a){f.push(c.getClass("element-attached")+"-"+a),f.push(c.getClass("target-attached")+"-"+a)}),A(function(){"undefined"!=typeof c._addAttachClasses&&(o(c.element,c._addAttachClasses,f),c.options.addTargetClasses!==!1&&o(c.target,c._addAttachClasses,f),delete c._addAttachClasses)})}},{key:"position",value:function(){var a=this,b=arguments.length<=0||void 0===arguments[0]?!0:arguments[0];if(this.enabled){this.clearCache();var c=L(this.targetAttachment,this.attachment);this.updateAttachClasses(this.attachment,c);var d=this.cache("element-bounds",function(){return f(a.element)}),e=d.width,i=d.height;if(0===e&&0===i&&"undefined"!=typeof this.lastSize){var j=this.lastSize;e=j.width,i=j.height}else this.lastSize={width:e,height:i};var k=this.cache("target-bounds",function(){return a.getTargetBounds()}),l=k,m=s(M(this.attachment),{width:e,height:i}),n=s(M(c),l),o=s(this.offset,{width:e,height:i}),p=s(this.targetOffset,l);m=r(m,o),n=r(n,p);for(var q=k.left+n.left-m.left,t=k.top+n.top-m.top,u=0;u<v.modules.length;++u){var w=v.modules[u],x=w.position.call(this,{left:q,top:t,targetAttachment:c,targetPos:k,elementPos:d,offset:m,targetOffset:n,manualOffset:o,manualTargetOffset:p,scrollbarSize:z,attachment:this.attachment});if(x===!1)return!1;"undefined"!=typeof x&&"object"==typeof x&&(t=x.top,q=x.left)}var y={page:{top:t,left:q},viewport:{top:t-pageYOffset,bottom:pageYOffset-t-i+innerHeight,left:q-pageXOffset,right:pageXOffset-q-e+innerWidth}},z=void 0;return document.body.scrollWidth>window.innerWidth&&(z=this.cache("scrollbar-size",h),y.viewport.bottom-=z.height),document.body.scrollHeight>window.innerHeight&&(z=this.cache("scrollbar-size",h),y.viewport.right-=z.width),(-1===["","static"].indexOf(document.body.style.position)||-1===["","static"].indexOf(document.body.parentElement.style.position))&&(y.page.bottom=document.body.scrollHeight-t-i,y.page.right=document.body.scrollWidth-q-e),"undefined"!=typeof this.options.optimizations&&this.options.optimizations.moveElement!==!1&&"undefined"==typeof this.targetModifier&&!function(){var b=a.cache("target-offsetparent",function(){return g(a.target)}),c=a.cache("target-offsetparent-bounds",function(){return f(b)}),d=getComputedStyle(b),e=c,h={};if(["Top","Left","Bottom","Right"].forEach(function(a){h[a.toLowerCase()]=parseFloat(d["border"+a+"Width"])}),c.right=document.body.scrollWidth-c.left-e.width+h.right,c.bottom=document.body.scrollHeight-c.top-e.height+h.bottom,y.page.top>=c.top+h.top&&y.page.bottom>=c.bottom&&y.page.left>=c.left+h.left&&y.page.right>=c.right){var i=b.scrollTop,j=b.scrollLeft;y.offset={top:y.page.top-c.top+i-h.top,left:y.page.left-c.left+j-h.left}}}(),this.move(y),this.history.unshift(y),this.history.length>3&&this.history.pop(),b&&B(),!0}}},{key:"move",value:function(a){var b=this;if("undefined"!=typeof this.element.parentNode){var c={};for(var d in a){c[d]={};for(var e in a[d]){for(var f=!1,h=0;h<this.history.length;++h){var j=this.history[h];if("undefined"!=typeof j[d]&&!p(j[d][e],a[d][e])){f=!0;break}}f||(c[d][e]=!0)}}var k={top:"",left:"",right:"",bottom:""},l=function(a,c){var d="undefined"!=typeof b.options.optimizations,e=d?b.options.optimizations.gpu:null;if(e!==!1){var f=void 0,g=void 0;a.top?(k.top=0,f=c.top):(k.bottom=0,f=-c.bottom),a.left?(k.left=0,g=c.left):(k.right=0,g=-c.right),k[F]="translateX("+Math.round(g)+"px) translateY("+Math.round(f)+"px)","msTransform"!==F&&(k[F]+=" translateZ(0)")}else a.top?k.top=c.top+"px":k.bottom=c.bottom+"px",a.left?k.left=c.left+"px":k.right=c.right+"px"},m=!1;if((c.page.top||c.page.bottom)&&(c.page.left||c.page.right)?(k.position="absolute",l(c.page,a.page)):(c.viewport.top||c.viewport.bottom)&&(c.viewport.left||c.viewport.right)?(k.position="fixed",l(c.viewport,a.viewport)):"undefined"!=typeof c.offset&&c.offset.top&&c.offset.left?!function(){k.position="absolute";var d=b.cache("target-offsetparent",function(){return g(b.target)});g(b.element)!==d&&A(function(){b.element.parentNode.removeChild(b.element),d.appendChild(b.element)}),l(c.offset,a.offset),m=!0}():(k.position="absolute",l({top:!0,left:!0},a.page)),!m){for(var n=!0,o=this.element.parentNode;o&&"BODY"!==o.tagName;){if("static"!==getComputedStyle(o).position){n=!1;break}o=o.parentNode}n||(this.element.parentNode.removeChild(this.element),document.body.appendChild(this.element))}var q={},r=!1;for(var e in k){var s=k[e],t=this.element.style[e];""!==t&&""!==s&&["top","left","bottom","right"].indexOf(e)>=0&&(t=parseFloat(t),s=parseFloat(s)),t!==s&&(r=!0,q[e]=s)}r&&A(function(){i(b.element.style,q)})}}}]),a}();P.modules=[],v.position=H;var Q=i(P,v),D=function(){function a(a,b){var c=[],d=!0,e=!1,f=void 0;try{for(var g,h=a[Symbol.iterator]();!(d=(g=h.next()).done)&&(c.push(g.value),!b||c.length!==b);d=!0);}catch(i){e=!0,f=i}finally{try{!d&&h["return"]&&h["return"]()}finally{if(e)throw f}}return c}return function(b,c){if(Array.isArray(b))return b;if(Symbol.iterator in Object(b))return a(b,c);throw new TypeError("Invalid attempt to destructure non-iterable instance")}}(),E=v.Utils,f=E.getBounds,i=E.extend,o=E.updateClasses,A=E.defer,R=["left","top","right","bottom"];v.modules.push({position:function(a){var b=this,c=a.top,d=a.left,e=a.targetAttachment;if(!this.options.constraints)return!0;var g=this.cache("element-bounds",function(){return f(b.element)}),h=g.height,j=g.width;if(0===j&&0===h&&"undefined"!=typeof this.lastSize){var k=this.lastSize;j=k.width,h=k.height}var l=this.cache("target-bounds",function(){return b.getTargetBounds()}),m=l.height,n=l.width,p=[this.getClass("pinned"),this.getClass("out-of-bounds")];this.options.constraints.forEach(function(a){var b=a.outOfBoundsClass,c=a.pinnedClass;b&&p.push(b),c&&p.push(c)}),p.forEach(function(a){["left","top","right","bottom"].forEach(function(b){p.push(a+"-"+b)})});var q=[],r=i({},e),s=i({},this.attachment);return this.options.constraints.forEach(function(a){var f=a.to,g=a.attachment,i=a.pin;"undefined"==typeof g&&(g="");var k=void 0,l=void 0;if(g.indexOf(" ")>=0){var o=g.split(" "),p=D(o,2);l=p[0],k=p[1]}else k=l=g;var u=t(b,f);("target"===l||"both"===l)&&(c<u[1]&&"top"===r.top&&(c+=m,r.top="bottom"),c+h>u[3]&&"bottom"===r.top&&(c-=m,r.top="top")),"together"===l&&(c<u[1]&&"top"===r.top&&("bottom"===s.top?(c+=m,r.top="bottom",c+=h,s.top="top"):"top"===s.top&&(c+=m,r.top="bottom",c-=h,s.top="bottom")),c+h>u[3]&&"bottom"===r.top&&("top"===s.top?(c-=m,r.top="top",c-=h,s.top="bottom"):"bottom"===s.top&&(c-=m,r.top="top",c+=h,s.top="top")),"middle"===r.top&&(c+h>u[3]&&"top"===s.top?(c-=h,s.top="bottom"):c<u[1]&&"bottom"===s.top&&(c+=h,s.top="top"))),("target"===k||"both"===k)&&(d<u[0]&&"left"===r.left&&(d+=n,r.left="right"),d+j>u[2]&&"right"===r.left&&(d-=n,r.left="left")),"together"===k&&(d<u[0]&&"left"===r.left?"right"===s.left?(d+=n,r.left="right",d+=j,s.left="left"):"left"===s.left&&(d+=n,r.left="right",d-=j,s.left="right"):d+j>u[2]&&"right"===r.left?"left"===s.left?(d-=n,r.left="left",d-=j,s.left="right"):"right"===s.left&&(d-=n,r.left="left",d+=j,s.left="left"):"center"===r.left&&(d+j>u[2]&&"left"===s.left?(d-=j,s.left="right"):d<u[0]&&"right"===s.left&&(d+=j,s.left="left"))),("element"===l||"both"===l)&&(c<u[1]&&"bottom"===s.top&&(c+=h,s.top="top"),c+h>u[3]&&"top"===s.top&&(c-=h,s.top="bottom")),("element"===k||"both"===k)&&(d<u[0]&&"right"===s.left&&(d+=j,s.left="left"),d+j>u[2]&&"left"===s.left&&(d-=j,s.left="right")),"string"==typeof i?i=i.split(",").map(function(a){return a.trim()}):i===!0&&(i=["top","left","right","bottom"]),i=i||[];var v=[],w=[];c<u[1]&&(i.indexOf("top")>=0?(c=u[1],v.push("top")):w.push("top")),c+h>u[3]&&(i.indexOf("bottom")>=0?(c=u[3]-h,v.push("bottom")):w.push("bottom")),d<u[0]&&(i.indexOf("left")>=0?(d=u[0],v.push("left")):w.push("left")),d+j>u[2]&&(i.indexOf("right")>=0?(d=u[2]-j,v.push("right")):w.push("right")),v.length&&!function(){var a=void 0;a="undefined"!=typeof b.options.pinnedClass?b.options.pinnedClass:b.getClass("pinned"),
q.push(a),v.forEach(function(b){q.push(a+"-"+b)})}(),w.length&&!function(){var a=void 0;a="undefined"!=typeof b.options.outOfBoundsClass?b.options.outOfBoundsClass:b.getClass("out-of-bounds"),q.push(a),w.forEach(function(b){q.push(a+"-"+b)})}(),(v.indexOf("left")>=0||v.indexOf("right")>=0)&&(s.left=r.left=!1),(v.indexOf("top")>=0||v.indexOf("bottom")>=0)&&(s.top=r.top=!1),(r.top!==e.top||r.left!==e.left||s.top!==b.attachment.top||s.left!==b.attachment.left)&&b.updateAttachClasses(s,r)}),A(function(){b.options.addTargetClasses!==!1&&o(b.target,q,p),o(b.element,q,p)}),{top:c,left:d}}});var E=v.Utils,f=E.getBounds,o=E.updateClasses,A=E.defer;v.modules.push({position:function(a){var b=this,c=a.top,d=a.left,e=this.cache("element-bounds",function(){return f(b.element)}),g=e.height,h=e.width,i=this.getTargetBounds(),j=c+g,k=d+h,l=[];c<=i.bottom&&j>=i.top&&["left","right"].forEach(function(a){var b=i[a];(b===d||b===k)&&l.push(a)}),d<=i.right&&k>=i.left&&["top","bottom"].forEach(function(a){var b=i[a];(b===c||b===j)&&l.push(a)});var m=[],n=[],p=["left","top","right","bottom"];return m.push(this.getClass("abutted")),p.forEach(function(a){m.push(b.getClass("abutted")+"-"+a)}),l.length&&n.push(this.getClass("abutted")),l.forEach(function(a){n.push(b.getClass("abutted")+"-"+a)}),A(function(){b.options.addTargetClasses!==!1&&o(b.target,n,m),o(b.element,n,m)}),!0}});var D=function(){function a(a,b){var c=[],d=!0,e=!1,f=void 0;try{for(var g,h=a[Symbol.iterator]();!(d=(g=h.next()).done)&&(c.push(g.value),!b||c.length!==b);d=!0);}catch(i){e=!0,f=i}finally{try{!d&&h["return"]&&h["return"]()}finally{if(e)throw f}}return c}return function(b,c){if(Array.isArray(b))return b;if(Symbol.iterator in Object(b))return a(b,c);throw new TypeError("Invalid attempt to destructure non-iterable instance")}}();return v.modules.push({position:function(a){var b=a.top,c=a.left;if(this.options.shift){var d=this.options.shift;"function"==typeof this.options.shift&&(d=this.options.shift.call(this,{top:b,left:c}));var e=void 0,f=void 0;if("string"==typeof d){d=d.split(" "),d[1]=d[1]||d[0];var g=D(d,2);e=g[0],f=g[1],e=parseFloat(e,10),f=parseFloat(f,10)}else e=d.top,f=d.left;return b+=e,c+=f,{top:b,left:c}}}}),Q});var Config={};Config.Emoji={"00a9":["\xa9",["copyright"]],"00ae":["\xae",["registered"]],"203c":["\u203c",["bangbang"]],2049:["\u2049",["interrobang"]],2122:["\u2122",["tm"]],2139:["\u2139",["information_source"]],2194:["\u2194",["left_right_arrow"]],2195:["\u2195",["arrow_up_down"]],2196:["\u2196",["arrow_upper_left"]],2197:["\u2197",["arrow_upper_right"]],2198:["\u2198",["arrow_lower_right"]],2199:["\u2199",["arrow_lower_left"]],"21a9":["\u21a9",["leftwards_arrow_with_hook"]],"21aa":["\u21aa",["arrow_right_hook"]],"231a":["\u231a",["watch"]],"231b":["\u231b",["hourglass"]],"23e9":["\u23e9",["fast_forward"]],"23ea":["\u23ea",["rewind"]],"23eb":["\u23eb",["arrow_double_up"]],"23ec":["\u23ec",["arrow_double_down"]],"23f0":["\u23f0",["alarm_clock"]],"23f3":["\u23f3",["hourglass_flowing_sand"]],"24c2":["\u24c2",["m"]],"25aa":["\u25aa",["black_small_square"]],"25ab":["\u25ab",["white_small_square"]],"25b6":["\u25b6",["arrow_forward"]],"25c0":["\u25c0",["arrow_backward"]],"25fb":["\u25fb",["white_medium_square"]],"25fc":["\u25fc",["black_medium_square"]],"25fd":["\u25fd",["white_medium_small_square"]],"25fe":["\u25fe",["black_medium_small_square"]],2600:["\u2600",["sunny"]],2601:["\u2601",["cloud"]],"260e":["\u260e",["phone","telephone"]],2611:["\u2611",["ballot_box_with_check"]],2614:["\u2614",["umbrella"]],2615:["\u2615",["coffee"]],"261d":["\u261d",["point_up"]],"263a":["\u263a",["relaxed"]],2648:["\u2648",["aries"]],2649:["\u2649",["taurus"]],"264a":["\u264a",["gemini"]],"264b":["\u264b",["cancer"]],"264c":["\u264c",["leo"]],"264d":["\u264d",["virgo"]],"264e":["\u264e",["libra"]],"264f":["\u264f",["scorpius"]],2650:["\u2650",["sagittarius"]],2651:["\u2651",["capricorn"]],2652:["\u2652",["aquarius"]],2653:["\u2653",["pisces"]],2660:["\u2660",["spades"]],2663:["\u2663",["clubs"]],2665:["\u2665",["hearts"]],2666:["\u2666",["diamonds"]],2668:["\u2668",["hotsprings"]],"267b":["\u267b",["recycle"]],"267f":["\u267f",["wheelchair"]],2693:["\u2693",["anchor"]],"26a0":["\u26a0",["warning"]],"26a1":["\u26a1",["zap"]],"26aa":["\u26aa",["white_circle"]],"26ab":["\u26ab",["black_circle"]],"26bd":["\u26bd",["soccer"]],"26be":["\u26be",["baseball"]],"26c4":["\u26c4",["snowman"]],"26c5":["\u26c5",["partly_sunny"]],"26ce":["\u26ce",["ophiuchus"]],"26d4":["\u26d4",["no_entry"]],"26ea":["\u26ea",["church"]],"26f2":["\u26f2",["fountain"]],"26f3":["\u26f3",["golf"]],"26f5":["\u26f5",["boat","sailboat"]],"26fa":["\u26fa",["tent"]],"26fd":["\u26fd",["fuelpump"]],2702:["\u2702",["scissors"]],2705:["\u2705",["white_check_mark"]],2708:["\u2708",["airplane"]],2709:["\u2709",["email","envelope"]],"270a":["\u270a",["fist"]],"270b":["\u270b",["hand","raised_hand"]],"270c":["\u270c",["v"]],"270f":["\u270f",["pencil2"]],2712:["\u2712",["black_nib"]],2714:["\u2714",["heavy_check_mark"]],2716:["\u2716",["heavy_multiplication_x"]],2728:["\u2728",["sparkles"]],2733:["\u2733",["eight_spoked_asterisk"]],2734:["\u2734",["eight_pointed_black_star"]],2744:["\u2744",["snowflake"]],2747:["\u2747",["sparkle"]],"274c":["\u274c",["x"]],"274e":["\u274e",["negative_squared_cross_mark"]],2753:["\u2753",["question"]],2754:["\u2754",["grey_question"]],2755:["\u2755",["grey_exclamation"]],2757:["\u2757",["exclamation","heavy_exclamation_mark"]],2764:["\u2764",["heart"],"<3"],2795:["\u2795",["heavy_plus_sign"]],2796:["\u2796",["heavy_minus_sign"]],2797:["\u2797",["heavy_division_sign"]],"27a1":["\u27a1",["arrow_right"]],"27b0":["\u27b0",["curly_loop"]],"27bf":["\u27bf",["loop"]],2934:["\u2934",["arrow_heading_up"]],2935:["\u2935",["arrow_heading_down"]],"2b05":["\u2b05",["arrow_left"]],"2b06":["\u2b06",["arrow_up"]],"2b07":["\u2b07",["arrow_down"]],"2b1b":["\u2b1b",["black_large_square"]],"2b1c":["\u2b1c",["white_large_square"]],"2b50":["\u2b50",["star"]],"2b55":["\u2b55",["o"]],3030:["\u3030",["wavy_dash"]],"303d":["\u303d",["part_alternation_mark"]],3297:["\u3297",["congratulations"]],3299:["\u3299",["secret"]],"1f004":["\ud83c\udc04",["mahjong"]],"1f0cf":["\ud83c\udccf",["black_joker"]],"1f170":["\ud83c\udd70",["a"]],"1f171":["\ud83c\udd71",["b"]],"1f17e":["\ud83c\udd7e",["o2"]],"1f17f":["\ud83c\udd7f",["parking"]],"1f18e":["\ud83c\udd8e",["ab"]],"1f191":["\ud83c\udd91",["cl"]],"1f192":["\ud83c\udd92",["cool"]],"1f193":["\ud83c\udd93",["free"]],"1f194":["\ud83c\udd94",["id"]],"1f195":["\ud83c\udd95",["new"]],"1f196":["\ud83c\udd96",["ng"]],"1f197":["\ud83c\udd97",["ok"]],"1f198":["\ud83c\udd98",["sos"]],"1f199":["\ud83c\udd99",["up"]],"1f19a":["\ud83c\udd9a",["vs"]],"1f201":["\ud83c\ude01",["koko"]],"1f202":["\ud83c\ude02",["sa"]],"1f21a":["\ud83c\ude1a",["u7121"]],"1f22f":["\ud83c\ude2f",["u6307"]],"1f232":["\ud83c\ude32",["u7981"]],"1f233":["\ud83c\ude33",["u7a7a"]],"1f234":["\ud83c\ude34",["u5408"]],"1f235":["\ud83c\ude35",["u6e80"]],"1f236":["\ud83c\ude36",["u6709"]],"1f237":["\ud83c\ude37",["u6708"]],"1f238":["\ud83c\ude38",["u7533"]],"1f239":["\ud83c\ude39",["u5272"]],"1f23a":["\ud83c\ude3a",["u55b6"]],"1f250":["\ud83c\ude50",["ideograph_advantage"]],"1f251":["\ud83c\ude51",["accept"]],"1f300":["\ud83c\udf00",["cyclone"]],"1f301":["\ud83c\udf01",["foggy"]],"1f302":["\ud83c\udf02",["closed_umbrella"]],"1f303":["\ud83c\udf03",["night_with_stars"]],"1f304":["\ud83c\udf04",["sunrise_over_mountains"]],"1f305":["\ud83c\udf05",["sunrise"]],"1f306":["\ud83c\udf06",["city_sunset"]],"1f307":["\ud83c\udf07",["city_sunrise"]],"1f308":["\ud83c\udf08",["rainbow"]],"1f309":["\ud83c\udf09",["bridge_at_night"]],"1f30a":["\ud83c\udf0a",["ocean"]],"1f30b":["\ud83c\udf0b",["volcano"]],"1f30c":["\ud83c\udf0c",["milky_way"]],"1f30d":["\ud83c\udf0d",["earth_africa"]],"1f30e":["\ud83c\udf0e",["earth_americas"]],"1f30f":["\ud83c\udf0f",["earth_asia"]],"1f310":["\ud83c\udf10",["globe_with_meridians"]],"1f311":["\ud83c\udf11",["new_moon"]],"1f312":["\ud83c\udf12",["waxing_crescent_moon"]],"1f313":["\ud83c\udf13",["first_quarter_moon"]],"1f314":["\ud83c\udf14",["moon","waxing_gibbous_moon"]],"1f315":["\ud83c\udf15",["full_moon"]],"1f316":["\ud83c\udf16",["waning_gibbous_moon"]],"1f317":["\ud83c\udf17",["last_quarter_moon"]],"1f318":["\ud83c\udf18",["waning_crescent_moon"]],"1f319":["\ud83c\udf19",["crescent_moon"]],"1f320":["\ud83c\udf20",["stars"]],"1f31a":["\ud83c\udf1a",["new_moon_with_face"]],"1f31b":["\ud83c\udf1b",["first_quarter_moon_with_face"]],"1f31c":["\ud83c\udf1c",["last_quarter_moon_with_face"]],"1f31d":["\ud83c\udf1d",["full_moon_with_face"]],"1f31e":["\ud83c\udf1e",["sun_with_face"]],"1f31f":["\ud83c\udf1f",["star2"]],"1f330":["\ud83c\udf30",["chestnut"]],"1f331":["\ud83c\udf31",["seedling"]],"1f332":["\ud83c\udf32",["evergreen_tree"]],"1f333":["\ud83c\udf33",["deciduous_tree"]],"1f334":["\ud83c\udf34",["palm_tree"]],"1f335":["\ud83c\udf35",["cactus"]],"1f337":["\ud83c\udf37",["tulip"]],"1f338":["\ud83c\udf38",["cherry_blossom"]],"1f339":["\ud83c\udf39",["rose"]],"1f33a":["\ud83c\udf3a",["hibiscus"]],"1f33b":["\ud83c\udf3b",["sunflower"]],"1f33c":["\ud83c\udf3c",["blossom"]],"1f33d":["\ud83c\udf3d",["corn"]],"1f33e":["\ud83c\udf3e",["ear_of_rice"]],"1f33f":["\ud83c\udf3f",["herb"]],"1f340":["\ud83c\udf40",["four_leaf_clover"]],"1f341":["\ud83c\udf41",["maple_leaf"]],"1f342":["\ud83c\udf42",["fallen_leaf"]],"1f343":["\ud83c\udf43",["leaves"]],"1f344":["\ud83c\udf44",["mushroom"]],"1f345":["\ud83c\udf45",["tomato"]],"1f346":["\ud83c\udf46",["eggplant"]],"1f347":["\ud83c\udf47",["grapes"]],"1f348":["\ud83c\udf48",["melon"]],"1f349":["\ud83c\udf49",["watermelon"]],"1f34a":["\ud83c\udf4a",["tangerine"]],"1f34b":["\ud83c\udf4b",["lemon"]],"1f34c":["\ud83c\udf4c",["banana"]],"1f34d":["\ud83c\udf4d",["pineapple"]],"1f34e":["\ud83c\udf4e",["apple"]],"1f34f":["\ud83c\udf4f",["green_apple"]],"1f350":["\ud83c\udf50",["pear"]],"1f351":["\ud83c\udf51",["peach"]],"1f352":["\ud83c\udf52",["cherries"]],"1f353":["\ud83c\udf53",["strawberry"]],"1f354":["\ud83c\udf54",["hamburger"]],"1f355":["\ud83c\udf55",["pizza"]],"1f356":["\ud83c\udf56",["meat_on_bone"]],"1f357":["\ud83c\udf57",["poultry_leg"]],"1f358":["\ud83c\udf58",["rice_cracker"]],"1f359":["\ud83c\udf59",["rice_ball"]],"1f35a":["\ud83c\udf5a",["rice"]],"1f35b":["\ud83c\udf5b",["curry"]],"1f35c":["\ud83c\udf5c",["ramen"]],"1f35d":["\ud83c\udf5d",["spaghetti"]],"1f35e":["\ud83c\udf5e",["bread"]],"1f35f":["\ud83c\udf5f",["fries"]],"1f360":["\ud83c\udf60",["sweet_potato"]],"1f361":["\ud83c\udf61",["dango"]],"1f362":["\ud83c\udf62",["oden"]],"1f363":["\ud83c\udf63",["sushi"]],"1f364":["\ud83c\udf64",["fried_shrimp"]],"1f365":["\ud83c\udf65",["fish_cake"]],"1f366":["\ud83c\udf66",["icecream"]],"1f367":["\ud83c\udf67",["shaved_ice"]],"1f368":["\ud83c\udf68",["ice_cream"]],"1f369":["\ud83c\udf69",["doughnut"]],"1f36a":["\ud83c\udf6a",["cookie"]],"1f36b":["\ud83c\udf6b",["chocolate_bar"]],"1f36c":["\ud83c\udf6c",["candy"]],"1f36d":["\ud83c\udf6d",["lollipop"]],"1f36e":["\ud83c\udf6e",["custard"]],"1f36f":["\ud83c\udf6f",["honey_pot"]],"1f370":["\ud83c\udf70",["cake"]],"1f371":["\ud83c\udf71",["bento"]],"1f372":["\ud83c\udf72",["stew"]],"1f373":["\ud83c\udf73",["egg"]],"1f374":["\ud83c\udf74",["fork_and_knife"]],"1f375":["\ud83c\udf75",["tea"]],"1f376":["\ud83c\udf76",["sake"]],"1f377":["\ud83c\udf77",["wine_glass"]],"1f378":["\ud83c\udf78",["cocktail"]],"1f379":["\ud83c\udf79",["tropical_drink"]],"1f37a":["\ud83c\udf7a",["beer"]],"1f37b":["\ud83c\udf7b",["beers"]],"1f37c":["\ud83c\udf7c",["baby_bottle"]],"1f380":["\ud83c\udf80",["ribbon"]],"1f381":["\ud83c\udf81",["gift"]],"1f382":["\ud83c\udf82",["birthday"]],"1f383":["\ud83c\udf83",["jack_o_lantern"]],"1f384":["\ud83c\udf84",["christmas_tree"]],"1f385":["\ud83c\udf85",["santa"]],"1f386":["\ud83c\udf86",["fireworks"]],"1f387":["\ud83c\udf87",["sparkler"]],"1f388":["\ud83c\udf88",["balloon"]],"1f389":["\ud83c\udf89",["tada"]],"1f38a":["\ud83c\udf8a",["confetti_ball"]],"1f38b":["\ud83c\udf8b",["tanabata_tree"]],"1f38c":["\ud83c\udf8c",["crossed_flags"]],"1f38d":["\ud83c\udf8d",["bamboo"]],"1f38e":["\ud83c\udf8e",["dolls"]],"1f38f":["\ud83c\udf8f",["flags"]],"1f390":["\ud83c\udf90",["wind_chime"]],"1f391":["\ud83c\udf91",["rice_scene"]],"1f392":["\ud83c\udf92",["school_satchel"]],"1f393":["\ud83c\udf93",["mortar_board"]],"1f3a0":["\ud83c\udfa0",["carousel_horse"]],"1f3a1":["\ud83c\udfa1",["ferris_wheel"]],"1f3a2":["\ud83c\udfa2",["roller_coaster"]],"1f3a3":["\ud83c\udfa3",["fishing_pole_and_fish"]],"1f3a4":["\ud83c\udfa4",["microphone"]],"1f3a5":["\ud83c\udfa5",["movie_camera"]],"1f3a6":["\ud83c\udfa6",["cinema"]],"1f3a7":["\ud83c\udfa7",["headphones"]],"1f3a8":["\ud83c\udfa8",["art"]],"1f3a9":["\ud83c\udfa9",["tophat"]],"1f3aa":["\ud83c\udfaa",["circus_tent"]],"1f3ab":["\ud83c\udfab",["ticket"]],"1f3ac":["\ud83c\udfac",["clapper"]],"1f3ad":["\ud83c\udfad",["performing_arts"]],"1f3ae":["\ud83c\udfae",["video_game"]],"1f3af":["\ud83c\udfaf",["dart"]],"1f3b0":["\ud83c\udfb0",["slot_machine"]],"1f3b1":["\ud83c\udfb1",["8ball"]],"1f3b2":["\ud83c\udfb2",["game_die"]],"1f3b3":["\ud83c\udfb3",["bowling"]],"1f3b4":["\ud83c\udfb4",["flower_playing_cards"]],"1f3b5":["\ud83c\udfb5",["musical_note"]],"1f3b6":["\ud83c\udfb6",["notes"]],"1f3b7":["\ud83c\udfb7",["saxophone"]],"1f3b8":["\ud83c\udfb8",["guitar"]],"1f3b9":["\ud83c\udfb9",["musical_keyboard"]],"1f3ba":["\ud83c\udfba",["trumpet"]],"1f3bb":["\ud83c\udfbb",["violin"]],"1f3bc":["\ud83c\udfbc",["musical_score"]],"1f3bd":["\ud83c\udfbd",["running_shirt_with_sash"]],"1f3be":["\ud83c\udfbe",["tennis"]],"1f3bf":["\ud83c\udfbf",["ski"]],"1f3c0":["\ud83c\udfc0",["basketball"]],"1f3c1":["\ud83c\udfc1",["checkered_flag"]],"1f3c2":["\ud83c\udfc2",["snowboarder"]],"1f3c3":["\ud83c\udfc3",["runner","running"]],"1f3c4":["\ud83c\udfc4",["surfer"]],"1f3c6":["\ud83c\udfc6",["trophy"]],"1f3c7":["\ud83c\udfc7",["horse_racing"]],"1f3c8":["\ud83c\udfc8",["football"]],"1f3c9":["\ud83c\udfc9",["rugby_football"]],"1f3ca":["\ud83c\udfca",["swimmer"]],"1f3e0":["\ud83c\udfe0",["house"]],"1f3e1":["\ud83c\udfe1",["house_with_garden"]],"1f3e2":["\ud83c\udfe2",["office"]],"1f3e3":["\ud83c\udfe3",["post_office"]],"1f3e4":["\ud83c\udfe4",["european_post_office"]],"1f3e5":["\ud83c\udfe5",["hospital"]],"1f3e6":["\ud83c\udfe6",["bank"]],"1f3e7":["\ud83c\udfe7",["atm"]],"1f3e8":["\ud83c\udfe8",["hotel"]],"1f3e9":["\ud83c\udfe9",["love_hotel"]],"1f3ea":["\ud83c\udfea",["convenience_store"]],"1f3eb":["\ud83c\udfeb",["school"]],"1f3ec":["\ud83c\udfec",["department_store"]],"1f3ed":["\ud83c\udfed",["factory"]],"1f3ee":["\ud83c\udfee",["izakaya_lantern","lantern"]],"1f3ef":["\ud83c\udfef",["japanese_castle"]],"1f3f0":["\ud83c\udff0",["european_castle"]],"1f400":["\ud83d\udc00",["rat"]],"1f401":["\ud83d\udc01",["mouse2"]],"1f402":["\ud83d\udc02",["ox"]],"1f403":["\ud83d\udc03",["water_buffalo"]],"1f404":["\ud83d\udc04",["cow2"]],"1f405":["\ud83d\udc05",["tiger2"]],"1f406":["\ud83d\udc06",["leopard"]],"1f407":["\ud83d\udc07",["rabbit2"]],"1f408":["\ud83d\udc08",["cat2"]],"1f409":["\ud83d\udc09",["dragon"]],"1f40a":["\ud83d\udc0a",["crocodile"]],"1f40b":["\ud83d\udc0b",["whale2"]],"1f40c":["\ud83d\udc0c",["snail"]],"1f40d":["\ud83d\udc0d",["snake"]],"1f40e":["\ud83d\udc0e",["racehorse"]],"1f40f":["\ud83d\udc0f",["ram"]],"1f410":["\ud83d\udc10",["goat"]],"1f411":["\ud83d\udc11",["sheep"]],"1f412":["\ud83d\udc12",["monkey"]],"1f413":["\ud83d\udc13",["rooster"]],"1f414":["\ud83d\udc14",["chicken"]],"1f415":["\ud83d\udc15",["dog2"]],"1f416":["\ud83d\udc16",["pig2"]],"1f417":["\ud83d\udc17",["boar"]],"1f418":["\ud83d\udc18",["elephant"]],"1f419":["\ud83d\udc19",["octopus"]],"1f41a":["\ud83d\udc1a",["shell"]],"1f41b":["\ud83d\udc1b",["bug"]],"1f41c":["\ud83d\udc1c",["ant"]],"1f41d":["\ud83d\udc1d",["bee","honeybee"]],"1f41e":["\ud83d\udc1e",["beetle"]],"1f41f":["\ud83d\udc1f",["fish"]],"1f420":["\ud83d\udc20",["tropical_fish"]],"1f421":["\ud83d\udc21",["blowfish"]],"1f422":["\ud83d\udc22",["turtle"]],"1f423":["\ud83d\udc23",["hatching_chick"]],"1f424":["\ud83d\udc24",["baby_chick"]],"1f425":["\ud83d\udc25",["hatched_chick"]],"1f426":["\ud83d\udc26",["bird"]],"1f427":["\ud83d\udc27",["penguin"]],"1f428":["\ud83d\udc28",["koala"]],"1f429":["\ud83d\udc29",["poodle"]],"1f42a":["\ud83d\udc2a",["dromedary_camel"]],"1f42b":["\ud83d\udc2b",["camel"]],"1f42c":["\ud83d\udc2c",["dolphin","flipper"]],"1f42d":["\ud83d\udc2d",["mouse"]],"1f42e":["\ud83d\udc2e",["cow"]],"1f42f":["\ud83d\udc2f",["tiger"]],"1f430":["\ud83d\udc30",["rabbit"]],"1f431":["\ud83d\udc31",["cat"]],"1f432":["\ud83d\udc32",["dragon_face"]],"1f433":["\ud83d\udc33",["whale"]],"1f434":["\ud83d\udc34",["horse"]],"1f435":["\ud83d\udc35",["monkey_face"]],"1f436":["\ud83d\udc36",["dog"]],"1f437":["\ud83d\udc37",["pig"]],"1f438":["\ud83d\udc38",["frog"]],"1f439":["\ud83d\udc39",["hamster"]],"1f43a":["\ud83d\udc3a",["wolf"]],"1f43b":["\ud83d\udc3b",["bear"]],"1f43c":["\ud83d\udc3c",["panda_face"]],"1f43d":["\ud83d\udc3d",["pig_nose"]],"1f43e":["\ud83d\udc3e",["feet","paw_prints"]],"1f440":["\ud83d\udc40",["eyes"]],"1f442":["\ud83d\udc42",["ear"]],"1f443":["\ud83d\udc43",["nose"]],"1f444":["\ud83d\udc44",["lips"]],"1f445":["\ud83d\udc45",["tongue"]],"1f446":["\ud83d\udc46",["point_up_2"]],"1f447":["\ud83d\udc47",["point_down"]],"1f448":["\ud83d\udc48",["point_left"]],"1f449":["\ud83d\udc49",["point_right"]],"1f44a":["\ud83d\udc4a",["facepunch","punch"]],"1f44b":["\ud83d\udc4b",["wave"]],"1f44c":["\ud83d\udc4c",["ok_hand"]],"1f44d":["\ud83d\udc4d",["+1","thumbsup"]],"1f44e":["\ud83d\udc4e",["-1","thumbsdown"]],"1f44f":["\ud83d\udc4f",["clap"]],"1f450":["\ud83d\udc50",["open_hands"]],"1f451":["\ud83d\udc51",["crown"]],"1f452":["\ud83d\udc52",["womans_hat"]],"1f453":["\ud83d\udc53",["eyeglasses"]],"1f454":["\ud83d\udc54",["necktie"]],"1f455":["\ud83d\udc55",["shirt","tshirt"]],"1f456":["\ud83d\udc56",["jeans"]],"1f457":["\ud83d\udc57",["dress"]],"1f458":["\ud83d\udc58",["kimono"]],"1f459":["\ud83d\udc59",["bikini"]],"1f45a":["\ud83d\udc5a",["womans_clothes"]],"1f45b":["\ud83d\udc5b",["purse"]],"1f45c":["\ud83d\udc5c",["handbag"]],"1f45d":["\ud83d\udc5d",["pouch"]],"1f45e":["\ud83d\udc5e",["mans_shoe","shoe"]],"1f45f":["\ud83d\udc5f",["athletic_shoe"]],"1f460":["\ud83d\udc60",["high_heel"]],"1f461":["\ud83d\udc61",["sandal"]],"1f462":["\ud83d\udc62",["boot"]],"1f463":["\ud83d\udc63",["footprints"]],"1f464":["\ud83d\udc64",["bust_in_silhouette"]],"1f465":["\ud83d\udc65",["busts_in_silhouette"]],"1f466":["\ud83d\udc66",["boy"]],"1f467":["\ud83d\udc67",["girl"]],"1f468":["\ud83d\udc68",["man"]],"1f469":["\ud83d\udc69",["woman"]],"1f46a":["\ud83d\udc6a",["family"]],"1f46b":["\ud83d\udc6b",["couple"]],"1f46c":["\ud83d\udc6c",["two_men_holding_hands"]],"1f46d":["\ud83d\udc6d",["two_women_holding_hands"]],"1f46e":["\ud83d\udc6e",["cop"]],"1f46f":["\ud83d\udc6f",["dancers"]],"1f470":["\ud83d\udc70",["bride_with_veil"]],"1f471":["\ud83d\udc71",["person_with_blond_hair"]],"1f472":["\ud83d\udc72",["man_with_gua_pi_mao"]],"1f473":["\ud83d\udc73",["man_with_turban"]],"1f474":["\ud83d\udc74",["older_man"]],"1f475":["\ud83d\udc75",["older_woman"]],"1f476":["\ud83d\udc76",["baby"]],"1f477":["\ud83d\udc77",["construction_worker"]],"1f478":["\ud83d\udc78",["princess"]],"1f479":["\ud83d\udc79",["japanese_ogre"]],"1f47a":["\ud83d\udc7a",["japanese_goblin"]],"1f47b":["\ud83d\udc7b",["ghost"]],"1f47c":["\ud83d\udc7c",["angel"]],"1f47d":["\ud83d\udc7d",["alien"]],"1f47e":["\ud83d\udc7e",["space_invader"]],"1f47f":["\ud83d\udc7f",["imp"]],"1f480":["\ud83d\udc80",["skull"]],"1f481":["\ud83d\udc81",["information_desk_person"]],"1f482":["\ud83d\udc82",["guardsman"]],"1f483":["\ud83d\udc83",["dancer"]],"1f484":["\ud83d\udc84",["lipstick"]],"1f485":["\ud83d\udc85",["nail_care"]],"1f486":["\ud83d\udc86",["massage"]],"1f487":["\ud83d\udc87",["haircut"]],"1f488":["\ud83d\udc88",["barber"]],"1f489":["\ud83d\udc89",["syringe"]],"1f48a":["\ud83d\udc8a",["pill"]],"1f48b":["\ud83d\udc8b",["kiss"]],"1f48c":["\ud83d\udc8c",["love_letter"]],"1f48d":["\ud83d\udc8d",["ring"]],"1f48e":["\ud83d\udc8e",["gem"]],"1f48f":["\ud83d\udc8f",["couplekiss"]],"1f490":["\ud83d\udc90",["bouquet"]],"1f491":["\ud83d\udc91",["couple_with_heart"]],"1f492":["\ud83d\udc92",["wedding"]],"1f493":["\ud83d\udc93",["heartbeat"]],"1f494":["\ud83d\udc94",["broken_heart"],"</3"],"1f495":["\ud83d\udc95",["two_hearts"]],"1f496":["\ud83d\udc96",["sparkling_heart"]],"1f497":["\ud83d\udc97",["heartpulse"]],"1f498":["\ud83d\udc98",["cupid"]],"1f499":["\ud83d\udc99",["blue_heart"],"<3"],"1f49a":["\ud83d\udc9a",["green_heart"],"<3"],"1f49b":["\ud83d\udc9b",["yellow_heart"],"<3"],"1f49c":["\ud83d\udc9c",["purple_heart"],"<3"],"1f49d":["\ud83d\udc9d",["gift_heart"]],"1f49e":["\ud83d\udc9e",["revolving_hearts"]],"1f49f":["\ud83d\udc9f",["heart_decoration"]],"1f4a0":["\ud83d\udca0",["diamond_shape_with_a_dot_inside"]],"1f4a1":["\ud83d\udca1",["bulb"]],"1f4a2":["\ud83d\udca2",["anger"]],"1f4a3":["\ud83d\udca3",["bomb"]],"1f4a4":["\ud83d\udca4",["zzz"]],"1f4a5":["\ud83d\udca5",["boom","collision"]],"1f4a6":["\ud83d\udca6",["sweat_drops"]],"1f4a7":["\ud83d\udca7",["droplet"]],"1f4a8":["\ud83d\udca8",["dash"]],"1f4a9":["\ud83d\udca9",["hankey","poop","shit"]],"1f4aa":["\ud83d\udcaa",["muscle"]],"1f4ab":["\ud83d\udcab",["dizzy"]],"1f4ac":["\ud83d\udcac",["speech_balloon"]],"1f4ad":["\ud83d\udcad",["thought_balloon"]],"1f4ae":["\ud83d\udcae",["white_flower"]],"1f4af":["\ud83d\udcaf",["100"]],"1f4b0":["\ud83d\udcb0",["moneybag"]],"1f4b1":["\ud83d\udcb1",["currency_exchange"]],"1f4b2":["\ud83d\udcb2",["heavy_dollar_sign"]],"1f4b3":["\ud83d\udcb3",["credit_card"]],"1f4b4":["\ud83d\udcb4",["yen"]],"1f4b5":["\ud83d\udcb5",["dollar"]],"1f4b6":["\ud83d\udcb6",["euro"]],"1f4b7":["\ud83d\udcb7",["pound"]],"1f4b8":["\ud83d\udcb8",["money_with_wings"]],"1f4b9":["\ud83d\udcb9",["chart"]],"1f4ba":["\ud83d\udcba",["seat"]],"1f4bb":["\ud83d\udcbb",["computer"]],"1f4bc":["\ud83d\udcbc",["briefcase"]],"1f4bd":["\ud83d\udcbd",["minidisc"]],"1f4be":["\ud83d\udcbe",["floppy_disk"]],"1f4bf":["\ud83d\udcbf",["cd"]],"1f4c0":["\ud83d\udcc0",["dvd"]],"1f4c1":["\ud83d\udcc1",["file_folder"]],"1f4c2":["\ud83d\udcc2",["open_file_folder"]],"1f4c3":["\ud83d\udcc3",["page_with_curl"]],"1f4c4":["\ud83d\udcc4",["page_facing_up"]],"1f4c5":["\ud83d\udcc5",["date"]],"1f4c6":["\ud83d\udcc6",["calendar"]],"1f4c7":["\ud83d\udcc7",["card_index"]],"1f4c8":["\ud83d\udcc8",["chart_with_upwards_trend"]],"1f4c9":["\ud83d\udcc9",["chart_with_downwards_trend"]],"1f4ca":["\ud83d\udcca",["bar_chart"]],"1f4cb":["\ud83d\udccb",["clipboard"]],"1f4cc":["\ud83d\udccc",["pushpin"]],"1f4cd":["\ud83d\udccd",["round_pushpin"]],"1f4ce":["\ud83d\udcce",["paperclip"]],"1f4cf":["\ud83d\udccf",["straight_ruler"]],"1f4d0":["\ud83d\udcd0",["triangular_ruler"]],"1f4d1":["\ud83d\udcd1",["bookmark_tabs"]],"1f4d2":["\ud83d\udcd2",["ledger"]],"1f4d3":["\ud83d\udcd3",["notebook"]],"1f4d4":["\ud83d\udcd4",["notebook_with_decorative_cover"]],"1f4d5":["\ud83d\udcd5",["closed_book"]],"1f4d6":["\ud83d\udcd6",["book","open_book"]],"1f4d7":["\ud83d\udcd7",["green_book"]],"1f4d8":["\ud83d\udcd8",["blue_book"]],"1f4d9":["\ud83d\udcd9",["orange_book"]],"1f4da":["\ud83d\udcda",["books"]],"1f4db":["\ud83d\udcdb",["name_badge"]],"1f4dc":["\ud83d\udcdc",["scroll"]],"1f4dd":["\ud83d\udcdd",["memo","pencil"]],"1f4de":["\ud83d\udcde",["telephone_receiver"]],"1f4df":["\ud83d\udcdf",["pager"]],"1f4e0":["\ud83d\udce0",["fax"]],"1f4e1":["\ud83d\udce1",["satellite"]],"1f4e2":["\ud83d\udce2",["loudspeaker"]],"1f4e3":["\ud83d\udce3",["mega"]],"1f4e4":["\ud83d\udce4",["outbox_tray"]],"1f4e5":["\ud83d\udce5",["inbox_tray"]],"1f4e6":["\ud83d\udce6",["package"]],"1f4e7":["\ud83d\udce7",["e-mail"]],"1f4e8":["\ud83d\udce8",["incoming_envelope"]],"1f4e9":["\ud83d\udce9",["envelope_with_arrow"]],"1f4ea":["\ud83d\udcea",["mailbox_closed"]],"1f4eb":["\ud83d\udceb",["mailbox"]],"1f4ec":["\ud83d\udcec",["mailbox_with_mail"]],"1f4ed":["\ud83d\udced",["mailbox_with_no_mail"]],"1f4ee":["\ud83d\udcee",["postbox"]],"1f4ef":["\ud83d\udcef",["postal_horn"]],"1f4f0":["\ud83d\udcf0",["newspaper"]],"1f4f1":["\ud83d\udcf1",["iphone"]],"1f4f2":["\ud83d\udcf2",["calling"]],"1f4f3":["\ud83d\udcf3",["vibration_mode"]],"1f4f4":["\ud83d\udcf4",["mobile_phone_off"]],"1f4f5":["\ud83d\udcf5",["no_mobile_phones"]],"1f4f6":["\ud83d\udcf6",["signal_strength"]],"1f4f7":["\ud83d\udcf7",["camera"]],"1f4f9":["\ud83d\udcf9",["video_camera"]],"1f4fa":["\ud83d\udcfa",["tv"]],"1f4fb":["\ud83d\udcfb",["radio"]],"1f4fc":["\ud83d\udcfc",["vhs"]],"1f500":["\ud83d\udd00",["twisted_rightwards_arrows"]],"1f501":["\ud83d\udd01",["repeat"]],"1f502":["\ud83d\udd02",["repeat_one"]],"1f503":["\ud83d\udd03",["arrows_clockwise"]],"1f504":["\ud83d\udd04",["arrows_counterclockwise"]],"1f505":["\ud83d\udd05",["low_brightness"]],"1f506":["\ud83d\udd06",["high_brightness"]],"1f507":["\ud83d\udd07",["mute"]],"1f508":["\ud83d\udd09",["speaker"]],"1f509":["\ud83d\udd09",["sound"]],"1f50a":["\ud83d\udd0a",["loud_sound"]],"1f50b":["\ud83d\udd0b",["battery"]],"1f50c":["\ud83d\udd0c",["electric_plug"]],"1f50d":["\ud83d\udd0d",["mag"]],"1f50e":["\ud83d\udd0e",["mag_right"]],"1f50f":["\ud83d\udd0f",["lock_with_ink_pen"]],"1f510":["\ud83d\udd10",["closed_lock_with_key"]],"1f511":["\ud83d\udd11",["key"]],"1f512":["\ud83d\udd12",["lock"]],"1f513":["\ud83d\udd13",["unlock"]],"1f514":["\ud83d\udd14",["bell"]],"1f515":["\ud83d\udd15",["no_bell"]],"1f516":["\ud83d\udd16",["bookmark"]],"1f517":["\ud83d\udd17",["link"]],"1f518":["\ud83d\udd18",["radio_button"]],"1f519":["\ud83d\udd19",["back"]],"1f51a":["\ud83d\udd1a",["end"]],"1f51b":["\ud83d\udd1b",["on"]],"1f51c":["\ud83d\udd1c",["soon"]],"1f51d":["\ud83d\udd1d",["top"]],"1f51e":["\ud83d\udd1e",["underage"]],"1f51f":["\ud83d\udd1f",["keycap_ten"]],"1f520":["\ud83d\udd20",["capital_abcd"]],"1f521":["\ud83d\udd21",["abcd"]],"1f522":["\ud83d\udd22",["1234"]],"1f523":["\ud83d\udd23",["symbols"]],"1f524":["\ud83d\udd24",["abc"]],"1f525":["\ud83d\udd25",["fire"]],"1f526":["\ud83d\udd26",["flashlight"]],"1f527":["\ud83d\udd27",["wrench"]],"1f528":["\ud83d\udd28",["hammer"]],"1f529":["\ud83d\udd29",["nut_and_bolt"]],"1f52a":["\ud83d\udd2a",["hocho"]],"1f52b":["\ud83d\udd2b",["gun"]],"1f52c":["\ud83d\udd2c",["microscope"]],"1f52d":["\ud83d\udd2d",["telescope"]],"1f52e":["\ud83d\udd2e",["crystal_ball"]],"1f52f":["\ud83d\udd2f",["six_pointed_star"]],"1f530":["\ud83d\udd30",["beginner"]],"1f531":["\ud83d\udd31",["trident"]],"1f532":["\ud83d\udd32",["black_square_button"]],"1f533":["\ud83d\udd33",["white_square_button"]],"1f534":["\ud83d\udd34",["red_circle"]],"1f535":["\ud83d\udd35",["large_blue_circle"]],"1f536":["\ud83d\udd36",["large_orange_diamond"]],"1f537":["\ud83d\udd37",["large_blue_diamond"]],"1f538":["\ud83d\udd38",["small_orange_diamond"]],"1f539":["\ud83d\udd39",["small_blue_diamond"]],"1f53a":["\ud83d\udd3a",["small_red_triangle"]],"1f53b":["\ud83d\udd3b",["small_red_triangle_down"]],"1f53c":["\ud83d\udd3c",["arrow_up_small"]],"1f53d":["\ud83d\udd3d",["arrow_down_small"]],"1f550":["\ud83d\udd50",["clock1"]],"1f551":["\ud83d\udd51",["clock2"]],"1f552":["\ud83d\udd52",["clock3"]],"1f553":["\ud83d\udd53",["clock4"]],"1f554":["\ud83d\udd54",["clock5"]],"1f555":["\ud83d\udd55",["clock6"]],"1f556":["\ud83d\udd56",["clock7"]],"1f557":["\ud83d\udd57",["clock8"]],"1f558":["\ud83d\udd58",["clock9"]],"1f559":["\ud83d\udd59",["clock10"]],"1f55a":["\ud83d\udd5a",["clock11"]],"1f55b":["\ud83d\udd5b",["clock12"]],"1f55c":["\ud83d\udd5c",["clock130"]],"1f55d":["\ud83d\udd5d",["clock230"]],"1f55e":["\ud83d\udd5e",["clock330"]],"1f55f":["\ud83d\udd5f",["clock430"]],"1f560":["\ud83d\udd60",["clock530"]],"1f561":["\ud83d\udd61",["clock630"]],"1f562":["\ud83d\udd62",["clock730"]],"1f563":["\ud83d\udd63",["clock830"]],"1f564":["\ud83d\udd64",["clock930"]],"1f565":["\ud83d\udd65",["clock1030"]],"1f566":["\ud83d\udd66",["clock1130"]],"1f567":["\ud83d\udd67",["clock1230"]],"1f5fb":["\ud83d\uddfb",["mount_fuji"]],"1f5fc":["\ud83d\uddfc",["tokyo_tower"]],"1f5fd":["\ud83d\uddfd",["statue_of_liberty"]],"1f5fe":["\ud83d\uddfe",["japan"]],"1f5ff":["\ud83d\uddff",["moyai"]],"1f600":["\ud83d\ude00",["grinning"]],"1f601":["\ud83d\ude01",["grin"]],"1f602":["\ud83d\ude02",["joy"]],"1f603":["\ud83d\ude03",["smiley"],":)"],"1f604":["\ud83d\ude04",["smile"],":)"],"1f605":["\ud83d\ude05",["sweat_smile"]],"1f606":["\ud83d\ude06",["satisfied"]],"1f607":["\ud83d\ude07",["innocent"]],"1f608":["\ud83d\ude08",["smiling_imp"]],"1f609":["\ud83d\ude09",["wink"],";)"],"1f60a":["\ud83d\ude0a",["blush"]],"1f60b":["\ud83d\ude0b",["yum"]],"1f60c":["\ud83d\ude0c",["relieved"]],"1f60d":["\ud83d\ude0d",["heart_eyes"]],"1f60e":["\ud83d\ude0e",["sunglasses"]],"1f60f":["\ud83d\ude0f",["smirk"]],"1f610":["\ud83d\ude10",["neutral_face"]],"1f611":["\ud83d\ude11",["expressionless"]],"1f612":["\ud83d\ude12",["unamused"]],"1f613":["\ud83d\ude13",["sweat"]],"1f614":["\ud83d\ude14",["pensive"]],"1f615":["\ud83d\ude15",["confused"]],"1f616":["\ud83d\ude16",["confounded"]],"1f617":["\ud83d\ude17",["kissing"]],"1f618":["\ud83d\ude18",["kissing_heart"]],"1f619":["\ud83d\ude19",["kissing_smiling_eyes"]],"1f61a":["\ud83d\ude1a",["kissing_closed_eyes"]],"1f61b":["\ud83d\ude1b",["stuck_out_tongue"]],"1f61c":["\ud83d\ude1c",["stuck_out_tongue_winking_eye"],";p"],"1f61d":["\ud83d\ude1d",["stuck_out_tongue_closed_eyes"]],"1f61e":["\ud83d\ude1e",["disappointed"],":("],"1f61f":["\ud83d\ude1f",["worried"]],"1f620":["\ud83d\ude20",["angry"]],"1f621":["\ud83d\ude21",["rage"]],"1f622":["\ud83d\ude22",["cry"],":'("],"1f623":["\ud83d\ude23",["persevere"]],"1f624":["\ud83d\ude24",["triumph"]],"1f625":["\ud83d\ude25",["disappointed_relieved"]],"1f626":["\ud83d\ude26",["frowning"]],"1f627":["\ud83d\ude27",["anguished"]],"1f628":["\ud83d\ude28",["fearful"]],"1f629":["\ud83d\ude29",["weary"]],"1f62a":["\ud83d\ude2a",["sleepy"]],"1f62b":["\ud83d\ude2b",["tired_face"]],"1f62c":["\ud83d\ude2c",["grimacing"]],"1f62d":["\ud83d\ude2d",["sob"],":'("],"1f62e":["\ud83d\ude2e",["open_mouth"]],"1f62f":["\ud83d\ude2f",["hushed"]],"1f630":["\ud83d\ude30",["cold_sweat"]],"1f631":["\ud83d\ude31",["scream"]],"1f632":["\ud83d\ude32",["astonished"]],"1f633":["\ud83d\ude33",["flushed"]],"1f634":["\ud83d\ude34",["sleeping"]],"1f635":["\ud83d\ude35",["dizzy_face"]],"1f636":["\ud83d\ude36",["no_mouth"]],"1f637":["\ud83d\ude37",["mask"]],"1f638":["\ud83d\ude38",["smile_cat"]],"1f639":["\ud83d\ude39",["joy_cat"]],"1f63a":["\ud83d\ude3a",["smiley_cat"]],"1f63b":["\ud83d\ude3b",["heart_eyes_cat"]],"1f63c":["\ud83d\ude3c",["smirk_cat"]],"1f63d":["\ud83d\ude3d",["kissing_cat"]],"1f63e":["\ud83d\ude3e",["pouting_cat"]],"1f63f":["\ud83d\ude3f",["crying_cat_face"]],"1f640":["\ud83d\ude40",["scream_cat"]],"1f645":["\ud83d\ude45",["no_good"]],"1f646":["\ud83d\ude46",["ok_woman"]],"1f647":["\ud83d\ude47",["bow"]],"1f648":["\ud83d\ude48",["see_no_evil"]],"1f649":["\ud83d\ude49",["hear_no_evil"]],"1f64a":["\ud83d\ude4a",["speak_no_evil"]],"1f64b":["\ud83d\ude4b",["raising_hand"]],"1f64c":["\ud83d\ude4c",["raised_hands"]],"1f64d":["\ud83d\ude4d",["person_frowning"]],"1f64e":["\ud83d\ude4e",["person_with_pouting_face"]],"1f64f":["\ud83d\ude4f",["pray"]],"1f680":["\ud83d\ude80",["rocket"]],"1f681":["\ud83d\ude81",["helicopter"]],"1f682":["\ud83d\ude82",["steam_locomotive"]],"1f683":["\ud83d\ude83",["railway_car"]],"1f68b":["\ud83d\ude8b",["train"]],"1f684":["\ud83d\ude84",["bullettrain_side"]],"1f685":["\ud83d\ude85",["bullettrain_front"]],"1f686":["\ud83d\ude86",["train2"]],"1f687":["\ud83d\ude87",["metro"]],"1f688":["\ud83d\ude88",["light_rail"]],"1f689":["\ud83d\ude89",["station"]],"1f68a":["\ud83d\ude8a",["tram"]],"1f68c":["\ud83d\ude8c",["bus"]],"1f68d":["\ud83d\ude8d",["oncoming_bus"]],"1f68e":["\ud83d\ude8e",["trolleybus"]],"1f68f":["\ud83d\ude8f",["busstop"]],"1f690":["\ud83d\ude90",["minibus"]],"1f691":["\ud83d\ude91",["ambulance"]],"1f692":["\ud83d\ude92",["fire_engine"]],"1f693":["\ud83d\ude93",["police_car"]],"1f694":["\ud83d\ude94",["oncoming_police_car"]],"1f695":["\ud83d\ude95",["taxi"]],
"1f696":["\ud83d\ude96",["oncoming_taxi"]],"1f697":["\ud83d\ude97",["car","red_car"]],"1f698":["\ud83d\ude98",["oncoming_automobile"]],"1f699":["\ud83d\ude99",["blue_car"]],"1f69a":["\ud83d\ude9a",["truck"]],"1f69b":["\ud83d\ude9b",["articulated_lorry"]],"1f69c":["\ud83d\ude9c",["tractor"]],"1f69d":["\ud83d\ude9d",["monorail"]],"1f69e":["\ud83d\ude9e",["mountain_railway"]],"1f69f":["\ud83d\ude9f",["suspension_railway"]],"1f6a0":["\ud83d\udea0",["mountain_cableway"]],"1f6a1":["\ud83d\udea1",["aerial_tramway"]],"1f6a2":["\ud83d\udea2",["ship"]],"1f6a3":["\ud83d\udea3",["rowboat"]],"1f6a4":["\ud83d\udea4",["speedboat"]],"1f6a5":["\ud83d\udea5",["traffic_light"]],"1f6a6":["\ud83d\udea6",["vertical_traffic_light"]],"1f6a7":["\ud83d\udea7",["construction"]],"1f6a8":["\ud83d\udea8",["rotating_light"]],"1f6a9":["\ud83d\udea9",["triangular_flag_on_post"]],"1f6aa":["\ud83d\udeaa",["door"]],"1f6ab":["\ud83d\udeab",["no_entry_sign"]],"1f6ac":["\ud83d\udeac",["smoking"]],"1f6ad":["\ud83d\udead",["no_smoking"]],"1f6ae":["\ud83d\udeae",["put_litter_in_its_place"]],"1f6af":["\ud83d\udeaf",["do_not_litter"]],"1f6b0":["\ud83d\udeb0",["potable_water"]],"1f6b1":["\ud83d\udeb1",["non-potable_water"]],"1f6b2":["\ud83d\udeb2",["bike"]],"1f6b3":["\ud83d\udeb3",["no_bicycles"]],"1f6b4":["\ud83d\udeb4",["bicyclist"]],"1f6b5":["\ud83d\udeb5",["mountain_bicyclist"]],"1f6b6":["\ud83d\udeb6",["walking"]],"1f6b7":["\ud83d\udeb7",["no_pedestrians"]],"1f6b8":["\ud83d\udeb8",["children_crossing"]],"1f6b9":["\ud83d\udeb9",["mens"]],"1f6ba":["\ud83d\udeba",["womens"]],"1f6bb":["\ud83d\udebb",["restroom"]],"1f6bc":["\ud83d\udebc",["baby_symbol"]],"1f6bd":["\ud83d\udebd",["toilet"]],"1f6be":["\ud83d\udebe",["wc"]],"1f6bf":["\ud83d\udebf",["shower"]],"1f6c0":["\ud83d\udec0",["bath"]],"1f6c1":["\ud83d\udec1",["bathtub"]],"1f6c2":["\ud83d\udec2",["passport_control"]],"1f6c3":["\ud83d\udec3",["customs"]],"1f6c4":["\ud83d\udec4",["baggage_claim"]],"1f6c5":["\ud83d\udec5",["left_luggage"]],"0023":["#\u20e3",["hash"]],"0030":["0\u20e3",["zero"]],"0031":["1\u20e3",["one"]],"0032":["2\u20e3",["two"]],"0033":["3\u20e3",["three"]],"0034":["4\u20e3",["four"]],"0035":["5\u20e3",["five"]],"0036":["6\u20e3",["six"]],"0037":["7\u20e3",["seven"]],"0038":["8\u20e3",["eight"]],"0039":["9\u20e3",["nine"]],"1f1e8-1f1f3":["\ud83c\udde8\ud83c\uddf3",["cn"]],"1f1e9-1f1ea":["\ud83c\udde9\ud83c\uddea",["de"]],"1f1ea-1f1f8":["\ud83c\uddea\ud83c\uddf8",["es"]],"1f1eb-1f1f7":["\ud83c\uddeb\ud83c\uddf7",["fr"]],"1f1ec-1f1e7":["\ud83c\uddec\ud83c\udde7",["gb","uk"]],"1f1ee-1f1f9":["\ud83c\uddee\ud83c\uddf9",["it"]],"1f1ef-1f1f5":["\ud83c\uddef\ud83c\uddf5",["jp"]],"1f1f0-1f1f7":["\ud83c\uddf0\ud83c\uddf7",["kr"]],"1f1f7-1f1fa":["\ud83c\uddf7\ud83c\uddfa",["ru"]],"1f1fa-1f1f8":["\ud83c\uddfa\ud83c\uddf8",["us"]]},Config.EmojiCategories=[["1f604","1f603","1f600","1f60a","263a","1f609","1f60d","1f618","1f61a","1f617","1f619","1f61c","1f61d","1f61b","1f633","1f601","1f614","1f60c","1f612","1f61e","1f623","1f622","1f602","1f62d","1f62a","1f625","1f630","1f605","1f613","1f629","1f62b","1f628","1f631","1f620","1f621","1f624","1f616","1f606","1f60b","1f637","1f60e","1f634","1f635","1f632","1f61f","1f626","1f627","1f608","1f47f","1f62e","1f62c","1f610","1f615","1f62f","1f636","1f607","1f60f","1f611","1f472","1f473","1f46e","1f477","1f482","1f476","1f466","1f467","1f468","1f469","1f474","1f475","1f471","1f47c","1f478","1f63a","1f638","1f63b","1f63d","1f63c","1f640","1f63f","1f639","1f63e","1f479","1f47a","1f648","1f649","1f64a","1f480","1f47d","1f4a9","1f525","2728","1f31f","1f4ab","1f4a5","1f4a2","1f4a6","1f4a7","1f4a4","1f4a8","1f442","1f440","1f443","1f445","1f444","1f44d","1f44e","1f44c","1f44a","270a","270c","1f44b","270b","1f450","1f446","1f447","1f449","1f448","1f64c","1f64f","261d","1f44f","1f4aa","1f6b6","1f3c3","1f483","1f46b","1f46a","1f46c","1f46d","1f48f","1f491","1f46f","1f646","1f645","1f481","1f64b","1f486","1f487","1f485","1f470","1f64e","1f64d","1f647","1f3a9","1f451","1f452","1f45f","1f45e","1f461","1f460","1f462","1f455","1f454","1f45a","1f457","1f3bd","1f456","1f458","1f459","1f4bc","1f45c","1f45d","1f45b","1f453","1f380","1f302","1f484","1f49b","1f499","1f49c","1f49a","2764","1f494","1f497","1f493","1f495","1f496","1f49e","1f498","1f48c","1f48b","1f48d","1f48e","1f464","1f465","1f4ac","1f463","1f4ad"],["1f436","1f43a","1f431","1f42d","1f439","1f430","1f438","1f42f","1f428","1f43b","1f437","1f43d","1f42e","1f417","1f435","1f412","1f434","1f411","1f418","1f43c","1f427","1f426","1f424","1f425","1f423","1f414","1f40d","1f422","1f41b","1f41d","1f41c","1f41e","1f40c","1f419","1f41a","1f420","1f41f","1f42c","1f433","1f40b","1f404","1f40f","1f400","1f403","1f405","1f407","1f409","1f40e","1f410","1f413","1f415","1f416","1f401","1f402","1f432","1f421","1f40a","1f42b","1f42a","1f406","1f408","1f429","1f43e","1f490","1f338","1f337","1f340","1f339","1f33b","1f33a","1f341","1f343","1f342","1f33f","1f33e","1f344","1f335","1f334","1f332","1f333","1f330","1f331","1f33c","1f310","1f31e","1f31d","1f31a","1f311","1f312","1f313","1f314","1f315","1f316","1f317","1f318","1f31c","1f31b","1f319","1f30d","1f30e","1f30f","1f30b","1f30c","1f320","2b50","2600","26c5","2601","26a1","2614","2744","26c4","1f300","1f301","1f308","1f30a"],["1f38d","1f49d","1f38e","1f392","1f393","1f38f","1f386","1f387","1f390","1f391","1f383","1f47b","1f385","1f384","1f381","1f38b","1f389","1f38a","1f388","1f38c","1f52e","1f3a5","1f4f7","1f4f9","1f4fc","1f4bf","1f4c0","1f4bd","1f4be","1f4bb","1f4f1","260e","1f4de","1f4df","1f4e0","1f4e1","1f4fa","1f4fb","1f50a","1f509","1f508","1f507","1f514","1f515","1f4e3","1f4e2","23f3","231b","23f0","231a","1f513","1f512","1f50f","1f510","1f511","1f50e","1f4a1","1f526","1f506","1f505","1f50c","1f50b","1f50d","1f6c0","1f6c1","1f6bf","1f6bd","1f527","1f529","1f528","1f6aa","1f6ac","1f4a3","1f52b","1f52a","1f48a","1f489","1f4b0","1f4b4","1f4b5","1f4b7","1f4b6","1f4b3","1f4b8","1f4f2","1f4e7","1f4e5","1f4e4","2709","1f4e9","1f4e8","1f4ef","1f4eb","1f4ea","1f4ec","1f4ed","1f4ee","1f4e6","1f4dd","1f4c4","1f4c3","1f4d1","1f4ca","1f4c8","1f4c9","1f4dc","1f4cb","1f4c5","1f4c6","1f4c7","1f4c1","1f4c2","2702","1f4cc","1f4ce","2712","270f","1f4cf","1f4d0","1f4d5","1f4d7","1f4d8","1f4d9","1f4d3","1f4d4","1f4d2","1f4da","1f4d6","1f516","1f4db","1f52c","1f52d","1f4f0","1f3a8","1f3ac","1f3a4","1f3a7","1f3bc","1f3b5","1f3b6","1f3b9","1f3bb","1f3ba","1f3b7","1f3b8","1f47e","1f3ae","1f0cf","1f3b4","1f004","1f3b2","1f3af","1f3c8","1f3c0","26bd","26be","1f3be","1f3b1","1f3c9","1f3b3","26f3","1f6b5","1f6b4","1f3c1","1f3c7","1f3c6","1f3bf","1f3c2","1f3ca","1f3c4","1f3a3","2615","1f375","1f376","1f37c","1f37a","1f37b","1f378","1f379","1f377","1f374","1f355","1f354","1f35f","1f357","1f356","1f35d","1f35b","1f364","1f371","1f363","1f365","1f359","1f358","1f35a","1f35c","1f372","1f362","1f361","1f373","1f35e","1f369","1f36e","1f366","1f368","1f367","1f382","1f370","1f36a","1f36b","1f36c","1f36d","1f36f","1f34e","1f34f","1f34a","1f34b","1f352","1f347","1f349","1f353","1f351","1f348","1f34c","1f350","1f34d","1f360","1f346","1f345","1f33d"],["1f3e0","1f3e1","1f3eb","1f3e2","1f3e3","1f3e5","1f3e6","1f3ea","1f3e9","1f3e8","1f492","26ea","1f3ec","1f3e4","1f307","1f306","1f3ef","1f3f0","26fa","1f3ed","1f5fc","1f5fe","1f5fb","1f304","1f305","1f303","1f5fd","1f309","1f3a0","1f3a1","26f2","1f3a2","1f6a2","26f5","1f6a4","1f6a3","2693","1f680","2708","1f4ba","1f681","1f682","1f68a","1f689","1f69e","1f686","1f684","1f685","1f688","1f687","1f69d","1f683","1f68b","1f68e","1f68c","1f68d","1f699","1f698","1f697","1f695","1f696","1f69b","1f69a","1f6a8","1f693","1f694","1f692","1f691","1f690","1f6b2","1f6a1","1f69f","1f6a0","1f69c","1f488","1f68f","1f3ab","1f6a6","1f6a5","26a0","1f6a7","1f530","26fd","1f3ee","1f3b0","2668","1f5ff","1f3aa","1f3ad","1f4cd","1f6a9","1f1ef-1f1f5","1f1f0-1f1f7","1f1e9-1f1ea","1f1e8-1f1f3","1f1fa-1f1f8","1f1eb-1f1f7","1f1ea-1f1f8","1f1ee-1f1f9","1f1f7-1f1fa","1f1ec-1f1e7"],["0031","0032","0033","0034","0035","0036","0037","0038","0039","0030","1f51f","1f522","0023","1f523","2b06","2b07","2b05","27a1","1f520","1f521","1f524","2197","2196","2198","2199","2194","2195","1f504","25c0","25b6","1f53c","1f53d","21a9","21aa","2139","23ea","23e9","23eb","23ec","2935","2934","1f197","1f500","1f501","1f502","1f195","1f199","1f192","1f193","1f196","1f4f6","1f3a6","1f201","1f22f","1f233","1f235","1f234","1f232","1f250","1f239","1f23a","1f236","1f21a","1f6bb","1f6b9","1f6ba","1f6bc","1f6be","1f6b0","1f6ae","1f17f","267f","1f6ad","1f237","1f238","1f202","24c2","1f6c2","1f6c4","1f6c5","1f6c3","1f251","3299","3297","1f191","1f198","1f194","1f6ab","1f51e","1f4f5","1f6af","1f6b1","1f6b3","1f6b7","1f6b8","26d4","2733","2747","274e","2705","2734","1f49f","1f19a","1f4f3","1f4f4","1f170","1f171","1f18e","1f17e","1f4a0","27bf","267b","2648","2649","264a","264b","264c","264d","264e","264f","2650","2651","2652","2653","26ce","1f52f","1f3e7","1f4b9","1f4b2","1f4b1","00a9","00ae","2122","274c","203c","2049","2757","2753","2755","2754","2b55","1f51d","1f51a","1f519","1f51b","1f51c","1f503","1f55b","1f567","1f550","1f55c","1f551","1f55d","1f552","1f55e","1f553","1f55f","1f554","1f560","1f555","1f556","1f557","1f558","1f559","1f55a","1f561","1f562","1f563","1f564","1f565","1f566","2716","2795","2796","2797","2660","2665","2663","2666","1f4ae","1f4af","2714","2611","1f518","1f517","27b0","3030","303d","1f531","25fc","25fb","25fe","25fd","25aa","25ab","1f53a","1f532","1f533","26ab","26aa","1f534","1f535","1f53b","2b1c","2b1b","1f536","1f537","1f538","1f539"]],Config.EmojiCategorySpritesheetDimens=[[7,27],[4,29],[7,33],[3,34],[7,34]],Config.emoji_data={"00a9":[["\xa9"],"\ue24e","\udbba\udf29",["copyright"],0,0],"00ae":[["\xae"],"\ue24f","\udbba\udf2d",["registered"],0,1],"203c":[["\u203c\ufe0f","\u203c"],"","\udbba\udf06",["bangbang"],0,2],2049:[["\u2049\ufe0f","\u2049"],"","\udbba\udf05",["interrobang"],0,3],2122:[["\u2122"],"\ue537","\udbba\udf2a",["tm"],0,4],2139:[["\u2139\ufe0f","\u2139"],"","\udbba\udf47",["information_source"],0,5],2194:[["\u2194\ufe0f","\u2194"],"","\udbba\udef6",["left_right_arrow"],0,6],2195:[["\u2195\ufe0f","\u2195"],"","\udbba\udef7",["arrow_up_down"],0,7],2196:[["\u2196\ufe0f","\u2196"],"\ue237","\udbba\udef2",["arrow_upper_left"],0,8],2197:[["\u2197\ufe0f","\u2197"],"\ue236","\udbba\udef0",["arrow_upper_right"],0,9],2198:[["\u2198\ufe0f","\u2198"],"\ue238","\udbba\udef1",["arrow_lower_right"],0,10],2199:[["\u2199\ufe0f","\u2199"],"\ue239","\udbba\udef3",["arrow_lower_left"],0,11],"21a9":[["\u21a9\ufe0f","\u21a9"],"","\udbba\udf83",["leftwards_arrow_with_hook"],0,12],"21aa":[["\u21aa\ufe0f","\u21aa"],"","\udbba\udf88",["arrow_right_hook"],0,13],"231a":[["\u231a\ufe0f","\u231a"],"","\udbb8\udc1d",["watch"],0,14],"231b":[["\u231b\ufe0f","\u231b"],"","\udbb8\udc1c",["hourglass"],0,15],"23e9":[["\u23e9"],"\ue23c","\udbba\udefe",["fast_forward"],0,16],"23ea":[["\u23ea"],"\ue23d","\udbba\udeff",["rewind"],0,17],"23eb":[["\u23eb"],"","\udbba\udf03",["arrow_double_up"],0,18],"23ec":[["\u23ec"],"","\udbba\udf02",["arrow_double_down"],0,19],"23f0":[["\u23f0"],"\ue02d","\udbb8\udc2a",["alarm_clock"],0,20],"23f3":[["\u23f3"],"","\udbb8\udc1b",["hourglass_flowing_sand"],0,21],"24c2":[["\u24c2\ufe0f","\u24c2"],"\ue434","\udbb9\udfe1",["m"],0,22],"25aa":[["\u25aa\ufe0f","\u25aa"],"\ue21a","\udbba\udf6e",["black_small_square"],0,23],"25ab":[["\u25ab\ufe0f","\u25ab"],"\ue21b","\udbba\udf6d",["white_small_square"],0,24],"25b6":[["\u25b6\ufe0f","\u25b6"],"\ue23a","\udbba\udefc",["arrow_forward"],0,25],"25c0":[["\u25c0\ufe0f","\u25c0"],"\ue23b","\udbba\udefd",["arrow_backward"],0,26],"25fb":[["\u25fb\ufe0f","\u25fb"],"\ue21b","\udbba\udf71",["white_medium_square"],0,27],"25fc":[["\u25fc\ufe0f","\u25fc"],"\ue21a","\udbba\udf72",["black_medium_square"],0,28],"25fd":[["\u25fd\ufe0f","\u25fd"],"\ue21b","\udbba\udf6f",["white_medium_small_square"],0,29],"25fe":[["\u25fe\ufe0f","\u25fe"],"\ue21a","\udbba\udf70",["black_medium_small_square"],1,0],2600:[["\u2600\ufe0f","\u2600"],"\ue04a","\udbb8\udc00",["sunny"],1,1],2601:[["\u2601\ufe0f","\u2601"],"\ue049","\udbb8\udc01",["cloud"],1,2],"260e":[["\u260e\ufe0f","\u260e"],"\ue009","\udbb9\udd23",["phone","telephone"],1,3],2611:[["\u2611\ufe0f","\u2611"],"","\udbba\udf8b",["ballot_box_with_check"],1,4],2614:[["\u2614\ufe0f","\u2614"],"\ue04b","\udbb8\udc02",["umbrella"],1,5],2615:[["\u2615\ufe0f","\u2615"],"\ue045","\udbba\udd81",["coffee"],1,6],"261d":[["\u261d\ufe0f","\u261d"],"\ue00f","\udbba\udf98",["point_up"],1,7],"263a":[["\u263a\ufe0f","\u263a"],"\ue414","\udbb8\udf36",["relaxed"],1,8],2648:[["\u2648\ufe0f","\u2648"],"\ue23f","\udbb8\udc2b",["aries"],1,9],2649:[["\u2649\ufe0f","\u2649"],"\ue240","\udbb8\udc2c",["taurus"],1,10],"264a":[["\u264a\ufe0f","\u264a"],"\ue241","\udbb8\udc2d",["gemini"],1,11],"264b":[["\u264b\ufe0f","\u264b"],"\ue242","\udbb8\udc2e",["cancer"],1,12],"264c":[["\u264c\ufe0f","\u264c"],"\ue243","\udbb8\udc2f",["leo"],1,13],"264d":[["\u264d\ufe0f","\u264d"],"\ue244","\udbb8\udc30",["virgo"],1,14],"264e":[["\u264e\ufe0f","\u264e"],"\ue245","\udbb8\udc31",["libra"],1,15],"264f":[["\u264f\ufe0f","\u264f"],"\ue246","\udbb8\udc32",["scorpius"],1,16],2650:[["\u2650\ufe0f","\u2650"],"\ue247","\udbb8\udc33",["sagittarius"],1,17],2651:[["\u2651\ufe0f","\u2651"],"\ue248","\udbb8\udc34",["capricorn"],1,18],2652:[["\u2652\ufe0f","\u2652"],"\ue249","\udbb8\udc35",["aquarius"],1,19],2653:[["\u2653\ufe0f","\u2653"],"\ue24a","\udbb8\udc36",["pisces"],1,20],2660:[["\u2660\ufe0f","\u2660"],"\ue20e","\udbba\udf1b",["spades"],1,21],2663:[["\u2663\ufe0f","\u2663"],"\ue20f","\udbba\udf1d",["clubs"],1,22],2665:[["\u2665\ufe0f","\u2665"],"\ue20c","\udbba\udf1a",["hearts"],1,23],2666:[["\u2666\ufe0f","\u2666"],"\ue20d","\udbba\udf1c",["diamonds"],1,24],2668:[["\u2668\ufe0f","\u2668"],"\ue123","\udbb9\udffa",["hotsprings"],1,25],"267b":[["\u267b\ufe0f","\u267b"],"","\udbba\udf2c",["recycle"],1,26],"267f":[["\u267f\ufe0f","\u267f"],"\ue20a","\udbba\udf20",["wheelchair"],1,27],2693:[["\u2693\ufe0f","\u2693"],"\ue202","\udbb9\udcc1",["anchor"],1,28],"26a0":[["\u26a0\ufe0f","\u26a0"],"\ue252","\udbba\udf23",["warning"],1,29],"26a1":[["\u26a1\ufe0f","\u26a1"],"\ue13d","\udbb8\udc04",["zap"],2,0],"26aa":[["\u26aa\ufe0f","\u26aa"],"\ue219","\udbba\udf65",["white_circle"],2,1],"26ab":[["\u26ab\ufe0f","\u26ab"],"\ue219","\udbba\udf66",["black_circle"],2,2],"26bd":[["\u26bd\ufe0f","\u26bd"],"\ue018","\udbb9\udfd4",["soccer"],2,3],"26be":[["\u26be\ufe0f","\u26be"],"\ue016","\udbb9\udfd1",["baseball"],2,4],"26c4":[["\u26c4\ufe0f","\u26c4"],"\ue048","\udbb8\udc03",["snowman"],2,5],"26c5":[["\u26c5\ufe0f","\u26c5"],"\ue04a\ue049","\udbb8\udc0f",["partly_sunny"],2,6],"26ce":[["\u26ce"],"\ue24b","\udbb8\udc37",["ophiuchus"],2,7],"26d4":[["\u26d4\ufe0f","\u26d4"],"\ue137","\udbba\udf26",["no_entry"],2,8],"26ea":[["\u26ea\ufe0f","\u26ea"],"\ue037","\udbb9\udcbb",["church"],2,9],"26f2":[["\u26f2\ufe0f","\u26f2"],"\ue121","\udbb9\udcbc",["fountain"],2,10],"26f3":[["\u26f3\ufe0f","\u26f3"],"\ue014","\udbb9\udfd2",["golf"],2,11],"26f5":[["\u26f5\ufe0f","\u26f5"],"\ue01c","\udbb9\udfea",["boat","sailboat"],2,12],"26fa":[["\u26fa\ufe0f","\u26fa"],"\ue122","\udbb9\udffb",["tent"],2,13],"26fd":[["\u26fd\ufe0f","\u26fd"],"\ue03a","\udbb9\udff5",["fuelpump"],2,14],2702:[["\u2702\ufe0f","\u2702"],"\ue313","\udbb9\udd3e",["scissors"],2,15],2705:[["\u2705"],"","\udbba\udf4a",["white_check_mark"],2,16],2708:[["\u2708\ufe0f","\u2708"],"\ue01d","\udbb9\udfe9",["airplane"],2,17],2709:[["\u2709\ufe0f","\u2709"],"\ue103","\udbb9\udd29",["email","envelope"],2,18],"270a":[["\u270a"],"\ue010","\udbba\udf93",["fist"],2,19],"270b":[["\u270b"],"\ue012","\udbba\udf95",["hand","raised_hand"],2,20],"270c":[["\u270c\ufe0f","\u270c"],"\ue011","\udbba\udf94",["v"],2,21],"270f":[["\u270f\ufe0f","\u270f"],"\ue301","\udbb9\udd39",["pencil2"],2,22],2712:[["\u2712\ufe0f","\u2712"],"","\udbb9\udd36",["black_nib"],2,23],2714:[["\u2714\ufe0f","\u2714"],"","\udbba\udf49",["heavy_check_mark"],2,24],2716:[["\u2716\ufe0f","\u2716"],"\ue333","\udbba\udf53",["heavy_multiplication_x"],2,25],2728:[["\u2728"],"\ue32e","\udbba\udf60",["sparkles"],2,26],2733:[["\u2733\ufe0f","\u2733"],"\ue206","\udbba\udf62",["eight_spoked_asterisk"],2,27],2734:[["\u2734\ufe0f","\u2734"],"\ue205","\udbba\udf61",["eight_pointed_black_star"],2,28],2744:[["\u2744\ufe0f","\u2744"],"","\udbb8\udc0e",["snowflake"],2,29],2747:[["\u2747\ufe0f","\u2747"],"\ue32e","\udbba\udf77",["sparkle"],3,0],"274c":[["\u274c"],"\ue333","\udbba\udf45",["x"],3,1],"274e":[["\u274e"],"\ue333","\udbba\udf46",["negative_squared_cross_mark"],3,2],2753:[["\u2753"],"\ue020","\udbba\udf09",["question"],3,3],2754:[["\u2754"],"\ue336","\udbba\udf0a",["grey_question"],3,4],2755:[["\u2755"],"\ue337","\udbba\udf0b",["grey_exclamation"],3,5],2757:[["\u2757\ufe0f","\u2757"],"\ue021","\udbba\udf04",["exclamation","heavy_exclamation_mark"],3,6],2764:[["\u2764\ufe0f","\u2764"],"\ue022","\udbba\udf0c",["heart"],3,7,"<3"],2795:[["\u2795"],"","\udbba\udf51",["heavy_plus_sign"],3,8],2796:[["\u2796"],"","\udbba\udf52",["heavy_minus_sign"],3,9],2797:[["\u2797"],"","\udbba\udf54",["heavy_division_sign"],3,10],"27a1":[["\u27a1\ufe0f","\u27a1"],"\ue234","\udbba\udefa",["arrow_right"],3,11],"27b0":[["\u27b0"],"","\udbba\udf08",["curly_loop"],3,12],"27bf":[["\u27bf"],"\ue211","\udbba\udc2b",["loop"],3,13],2934:[["\u2934\ufe0f","\u2934"],"\ue236","\udbba\udef4",["arrow_heading_up"],3,14],2935:[["\u2935\ufe0f","\u2935"],"\ue238","\udbba\udef5",["arrow_heading_down"],3,15],"2b05":[["\u2b05\ufe0f","\u2b05"],"\ue235","\udbba\udefb",["arrow_left"],3,16],"2b06":[["\u2b06\ufe0f","\u2b06"],"\ue232","\udbba\udef8",["arrow_up"],3,17],"2b07":[["\u2b07\ufe0f","\u2b07"],"\ue233","\udbba\udef9",["arrow_down"],3,18],"2b1b":[["\u2b1b\ufe0f","\u2b1b"],"\ue21a","\udbba\udf6c",["black_large_square"],3,19],"2b1c":[["\u2b1c\ufe0f","\u2b1c"],"\ue21b","\udbba\udf6b",["white_large_square"],3,20],"2b50":[["\u2b50\ufe0f","\u2b50"],"\ue32f","\udbba\udf68",["star"],3,21],"2b55":[["\u2b55\ufe0f","\u2b55"],"\ue332","\udbba\udf44",["o"],3,22],3030:[["\u3030"],"","\udbba\udf07",["wavy_dash"],3,23],"303d":[["\u303d\ufe0f","\u303d"],"\ue12c","\udbba\udc1b",["part_alternation_mark"],3,24],3297:[["\u3297\ufe0f","\u3297"],"\ue30d","\udbba\udf43",["congratulations"],3,25],3299:[["\u3299\ufe0f","\u3299"],"\ue315","\udbba\udf2b",["secret"],3,26],"1f004":[["\ud83c\udc04\ufe0f","\ud83c\udc04"],"\ue12d","\udbba\udc0b",["mahjong"],3,27],"1f0cf":[["\ud83c\udccf"],"","\udbba\udc12",["black_joker"],3,28],"1f170":[["\ud83c\udd70"],"\ue532","\udbb9\udd0b",["a"],3,29],"1f171":[["\ud83c\udd71"],"\ue533","\udbb9\udd0c",["b"],4,0],"1f17e":[["\ud83c\udd7e"],"\ue535","\udbb9\udd0e",["o2"],4,1],"1f17f":[["\ud83c\udd7f\ufe0f","\ud83c\udd7f"],"\ue14f","\udbb9\udff6",["parking"],4,2],"1f18e":[["\ud83c\udd8e"],"\ue534","\udbb9\udd0d",["ab"],4,3],"1f191":[["\ud83c\udd91"],"","\udbba\udf84",["cl"],4,4],"1f192":[["\ud83c\udd92"],"\ue214","\udbba\udf38",["cool"],4,5],"1f193":[["\ud83c\udd93"],"","\udbba\udf21",["free"],4,6],"1f194":[["\ud83c\udd94"],"\ue229","\udbba\udf81",["id"],4,7],"1f195":[["\ud83c\udd95"],"\ue212","\udbba\udf36",["new"],4,8],"1f196":[["\ud83c\udd96"],"","\udbba\udf28",["ng"],4,9],"1f197":[["\ud83c\udd97"],"\ue24d","\udbba\udf27",["ok"],4,10],"1f198":[["\ud83c\udd98"],"","\udbba\udf4f",["sos"],4,11],"1f199":[["\ud83c\udd99"],"\ue213","\udbba\udf37",["up"],4,12],"1f19a":[["\ud83c\udd9a"],"\ue12e","\udbba\udf32",["vs"],4,13],"1f201":[["\ud83c\ude01"],"\ue203","\udbba\udf24",["koko"],4,14],"1f202":[["\ud83c\ude02"],"\ue228","\udbba\udf3f",["sa"],4,15],"1f21a":[["\ud83c\ude1a\ufe0f","\ud83c\ude1a"],"\ue216","\udbba\udf3a",["u7121"],4,16],"1f22f":[["\ud83c\ude2f\ufe0f","\ud83c\ude2f"],"\ue22c","\udbba\udf40",["u6307"],4,17],"1f232":[["\ud83c\ude32"],"","\udbba\udf2e",["u7981"],4,18],"1f233":[["\ud83c\ude33"],"\ue22b","\udbba\udf2f",["u7a7a"],4,19],"1f234":[["\ud83c\ude34"],"","\udbba\udf30",["u5408"],4,20],"1f235":[["\ud83c\ude35"],"\ue22a","\udbba\udf31",["u6e80"],4,21],"1f236":[["\ud83c\ude36"],"\ue215","\udbba\udf39",["u6709"],4,22],"1f237":[["\ud83c\ude37"],"\ue217","\udbba\udf3b",["u6708"],4,23],"1f238":[["\ud83c\ude38"],"\ue218","\udbba\udf3c",["u7533"],4,24],"1f239":[["\ud83c\ude39"],"\ue227","\udbba\udf3e",["u5272"],4,25],"1f23a":[["\ud83c\ude3a"],"\ue22d","\udbba\udf41",["u55b6"],4,26],"1f250":[["\ud83c\ude50"],"\ue226","\udbba\udf3d",["ideograph_advantage"],4,27],"1f251":[["\ud83c\ude51"],"","\udbba\udf50",["accept"],4,28],"1f300":[["\ud83c\udf00"],"\ue443","\udbb8\udc05",["cyclone"],4,29],"1f301":[["\ud83c\udf01"],"","\udbb8\udc06",["foggy"],5,0],"1f302":[["\ud83c\udf02"],"\ue43c","\udbb8\udc07",["closed_umbrella"],5,1],"1f303":[["\ud83c\udf03"],"\ue44b","\udbb8\udc08",["night_with_stars"],5,2],"1f304":[["\ud83c\udf04"],"\ue04d","\udbb8\udc09",["sunrise_over_mountains"],5,3],"1f305":[["\ud83c\udf05"],"\ue449","\udbb8\udc0a",["sunrise"],5,4],"1f306":[["\ud83c\udf06"],"\ue146","\udbb8\udc0b",["city_sunset"],5,5],"1f307":[["\ud83c\udf07"],"\ue44a","\udbb8\udc0c",["city_sunrise"],5,6],"1f308":[["\ud83c\udf08"],"\ue44c","\udbb8\udc0d",["rainbow"],5,7],"1f309":[["\ud83c\udf09"],"\ue44b","\udbb8\udc10",["bridge_at_night"],5,8],"1f30a":[["\ud83c\udf0a"],"\ue43e","\udbb8\udc38",["ocean"],5,9],"1f30b":[["\ud83c\udf0b"],"","\udbb8\udc3a",["volcano"],5,10],"1f30c":[["\ud83c\udf0c"],"\ue44b","\udbb8\udc3b",["milky_way"],5,11],"1f30d":[["\ud83c\udf0d"],"","",["earth_africa"],5,12],"1f30e":[["\ud83c\udf0e"],"","",["earth_americas"],5,13],"1f30f":[["\ud83c\udf0f"],"","\udbb8\udc39",["earth_asia"],5,14],"1f310":[["\ud83c\udf10"],"","",["globe_with_meridians"],5,15],"1f311":[["\ud83c\udf11"],"","\udbb8\udc11",["new_moon"],5,16],"1f312":[["\ud83c\udf12"],"","",["waxing_crescent_moon"],5,17],"1f313":[["\ud83c\udf13"],"\ue04c","\udbb8\udc13",["first_quarter_moon"],5,18],"1f314":[["\ud83c\udf14"],"\ue04c","\udbb8\udc12",["moon","waxing_gibbous_moon"],5,19],"1f315":[["\ud83c\udf15"],"","\udbb8\udc15",["full_moon"],5,20],"1f316":[["\ud83c\udf16"],"","",["waning_gibbous_moon"],5,21],"1f317":[["\ud83c\udf17"],"","",["last_quarter_moon"],5,22],"1f318":[["\ud83c\udf18"],"","",["waning_crescent_moon"],5,23],"1f319":[["\ud83c\udf19"],"\ue04c","\udbb8\udc14",["crescent_moon"],5,24],"1f31a":[["\ud83c\udf1a"],"","",["new_moon_with_face"],5,25],"1f31b":[["\ud83c\udf1b"],"\ue04c","\udbb8\udc16",["first_quarter_moon_with_face"],5,26],"1f31c":[["\ud83c\udf1c"],"","",["last_quarter_moon_with_face"],5,27],"1f31d":[["\ud83c\udf1d"],"","",["full_moon_with_face"],5,28],"1f31e":[["\ud83c\udf1e"],"","",["sun_with_face"],5,29],"1f31f":[["\ud83c\udf1f"],"\ue335","\udbba\udf69",["star2"],6,0],"1f320":[["\ud83c\udf20"],"","\udbba\udf6a",["stars"],6,1],"1f330":[["\ud83c\udf30"],"","\udbb8\udc4c",["chestnut"],6,2],"1f331":[["\ud83c\udf31"],"\ue110","\udbb8\udc3e",["seedling"],6,3],"1f332":[["\ud83c\udf32"],"","",["evergreen_tree"],6,4],"1f333":[["\ud83c\udf33"],"","",["deciduous_tree"],6,5],"1f334":[["\ud83c\udf34"],"\ue307","\udbb8\udc47",["palm_tree"],6,6],"1f335":[["\ud83c\udf35"],"\ue308","\udbb8\udc48",["cactus"],6,7],"1f337":[["\ud83c\udf37"],"\ue304","\udbb8\udc3d",["tulip"],6,8],"1f338":[["\ud83c\udf38"],"\ue030","\udbb8\udc40",["cherry_blossom"],6,9],"1f339":[["\ud83c\udf39"],"\ue032","\udbb8\udc41",["rose"],6,10],"1f33a":[["\ud83c\udf3a"],"\ue303","\udbb8\udc45",["hibiscus"],6,11],"1f33b":[["\ud83c\udf3b"],"\ue305","\udbb8\udc46",["sunflower"],6,12],"1f33c":[["\ud83c\udf3c"],"\ue305","\udbb8\udc4d",["blossom"],6,13],"1f33d":[["\ud83c\udf3d"],"","\udbb8\udc4a",["corn"],6,14],"1f33e":[["\ud83c\udf3e"],"\ue444","\udbb8\udc49",["ear_of_rice"],6,15],"1f33f":[["\ud83c\udf3f"],"\ue110","\udbb8\udc4e",["herb"],6,16],"1f340":[["\ud83c\udf40"],"\ue110","\udbb8\udc3c",["four_leaf_clover"],6,17],"1f341":[["\ud83c\udf41"],"\ue118","\udbb8\udc3f",["maple_leaf"],6,18],"1f342":[["\ud83c\udf42"],"\ue119","\udbb8\udc42",["fallen_leaf"],6,19],"1f343":[["\ud83c\udf43"],"\ue447","\udbb8\udc43",["leaves"],6,20],"1f344":[["\ud83c\udf44"],"","\udbb8\udc4b",["mushroom"],6,21],"1f345":[["\ud83c\udf45"],"\ue349","\udbb8\udc55",["tomato"],6,22],"1f346":[["\ud83c\udf46"],"\ue34a","\udbb8\udc56",["eggplant"],6,23],"1f347":[["\ud83c\udf47"],"","\udbb8\udc59",["grapes"],6,24],"1f348":[["\ud83c\udf48"],"","\udbb8\udc57",["melon"],6,25],"1f349":[["\ud83c\udf49"],"\ue348","\udbb8\udc54",["watermelon"],6,26],"1f34a":[["\ud83c\udf4a"],"\ue346","\udbb8\udc52",["tangerine"],6,27],"1f34b":[["\ud83c\udf4b"],"","",["lemon"],6,28],"1f34c":[["\ud83c\udf4c"],"","\udbb8\udc50",["banana"],6,29],"1f34d":[["\ud83c\udf4d"],"","\udbb8\udc58",["pineapple"],7,0],"1f34e":[["\ud83c\udf4e"],"\ue345","\udbb8\udc51",["apple"],7,1],"1f34f":[["\ud83c\udf4f"],"\ue345","\udbb8\udc5b",["green_apple"],7,2],"1f350":[["\ud83c\udf50"],"","",["pear"],7,3],"1f351":[["\ud83c\udf51"],"","\udbb8\udc5a",["peach"],7,4],"1f352":[["\ud83c\udf52"],"","\udbb8\udc4f",["cherries"],7,5],"1f353":[["\ud83c\udf53"],"\ue347","\udbb8\udc53",["strawberry"],7,6],"1f354":[["\ud83c\udf54"],"\ue120","\udbba\udd60",["hamburger"],7,7],"1f355":[["\ud83c\udf55"],"","\udbba\udd75",["pizza"],7,8],"1f356":[["\ud83c\udf56"],"","\udbba\udd72",["meat_on_bone"],7,9],"1f357":[["\ud83c\udf57"],"","\udbba\udd76",["poultry_leg"],7,10],"1f358":[["\ud83c\udf58"],"\ue33d","\udbba\udd69",["rice_cracker"],7,11],"1f359":[["\ud83c\udf59"],"\ue342","\udbba\udd61",["rice_ball"],7,12],"1f35a":[["\ud83c\udf5a"],"\ue33e","\udbba\udd6a",["rice"],7,13],"1f35b":[["\ud83c\udf5b"],"\ue341","\udbba\udd6c",["curry"],7,14],"1f35c":[["\ud83c\udf5c"],"\ue340","\udbba\udd63",["ramen"],7,15],"1f35d":[["\ud83c\udf5d"],"\ue33f","\udbba\udd6b",["spaghetti"],7,16],"1f35e":[["\ud83c\udf5e"],"\ue339","\udbba\udd64",["bread"],7,17],"1f35f":[["\ud83c\udf5f"],"\ue33b","\udbba\udd67",["fries"],7,18],"1f360":[["\ud83c\udf60"],"","\udbba\udd74",["sweet_potato"],7,19],"1f361":[["\ud83c\udf61"],"\ue33c","\udbba\udd68",["dango"],7,20],"1f362":[["\ud83c\udf62"],"\ue343","\udbba\udd6d",["oden"],7,21],"1f363":[["\ud83c\udf63"],"\ue344","\udbba\udd6e",["sushi"],7,22],"1f364":[["\ud83c\udf64"],"","\udbba\udd7f",["fried_shrimp"],7,23],"1f365":[["\ud83c\udf65"],"","\udbba\udd73",["fish_cake"],7,24],"1f366":[["\ud83c\udf66"],"\ue33a","\udbba\udd66",["icecream"],7,25],"1f367":[["\ud83c\udf67"],"\ue43f","\udbba\udd71",["shaved_ice"],7,26],"1f368":[["\ud83c\udf68"],"","\udbba\udd77",["ice_cream"],7,27],"1f369":[["\ud83c\udf69"],"","\udbba\udd78",["doughnut"],7,28],"1f36a":[["\ud83c\udf6a"],"","\udbba\udd79",["cookie"],7,29],"1f36b":[["\ud83c\udf6b"],"","\udbba\udd7a",["chocolate_bar"],8,0],"1f36c":[["\ud83c\udf6c"],"","\udbba\udd7b",["candy"],8,1],"1f36d":[["\ud83c\udf6d"],"","\udbba\udd7c",["lollipop"],8,2],"1f36e":[["\ud83c\udf6e"],"","\udbba\udd7d",["custard"],8,3],"1f36f":[["\ud83c\udf6f"],"","\udbba\udd7e",["honey_pot"],8,4],"1f370":[["\ud83c\udf70"],"\ue046","\udbba\udd62",["cake"],8,5],"1f371":[["\ud83c\udf71"],"\ue34c","\udbba\udd6f",["bento"],8,6],"1f372":[["\ud83c\udf72"],"\ue34d","\udbba\udd70",["stew"],8,7],"1f373":[["\ud83c\udf73"],"\ue147","\udbba\udd65",["egg"],8,8],"1f374":[["\ud83c\udf74"],"\ue043","\udbba\udd80",["fork_and_knife"],8,9],"1f375":[["\ud83c\udf75"],"\ue338","\udbba\udd84",["tea"],8,10],"1f376":[["\ud83c\udf76"],"\ue30b","\udbba\udd85",["sake"],8,11],"1f377":[["\ud83c\udf77"],"\ue044","\udbba\udd86",["wine_glass"],8,12],"1f378":[["\ud83c\udf78"],"\ue044","\udbba\udd82",["cocktail"],8,13],"1f379":[["\ud83c\udf79"],"\ue044","\udbba\udd88",["tropical_drink"],8,14],"1f37a":[["\ud83c\udf7a"],"\ue047","\udbba\udd83",["beer"],8,15],"1f37b":[["\ud83c\udf7b"],"\ue30c","\udbba\udd87",["beers"],8,16],"1f37c":[["\ud83c\udf7c"],"","",["baby_bottle"],8,17],"1f380":[["\ud83c\udf80"],"\ue314","\udbb9\udd0f",["ribbon"],8,18],"1f381":[["\ud83c\udf81"],"\ue112","\udbb9\udd10",["gift"],8,19],"1f382":[["\ud83c\udf82"],"\ue34b","\udbb9\udd11",["birthday"],8,20],"1f383":[["\ud83c\udf83"],"\ue445","\udbb9\udd1f",["jack_o_lantern"],8,21],"1f384":[["\ud83c\udf84"],"\ue033","\udbb9\udd12",["christmas_tree"],8,22],"1f385":[["\ud83c\udf85"],"\ue448","\udbb9\udd13",["santa"],8,23],"1f386":[["\ud83c\udf86"],"\ue117","\udbb9\udd15",["fireworks"],8,24],"1f387":[["\ud83c\udf87"],"\ue440","\udbb9\udd1d",["sparkler"],8,25],"1f388":[["\ud83c\udf88"],"\ue310","\udbb9\udd16",["balloon"],8,26],"1f389":[["\ud83c\udf89"],"\ue312","\udbb9\udd17",["tada"],8,27],"1f38a":[["\ud83c\udf8a"],"","\udbb9\udd20",["confetti_ball"],8,28],"1f38b":[["\ud83c\udf8b"],"","\udbb9\udd21",["tanabata_tree"],8,29],"1f38c":[["\ud83c\udf8c"],"\ue143","\udbb9\udd14",["crossed_flags"],9,0],"1f38d":[["\ud83c\udf8d"],"\ue436","\udbb9\udd18",["bamboo"],9,1],"1f38e":[["\ud83c\udf8e"],"\ue438","\udbb9\udd19",["dolls"],9,2],"1f38f":[["\ud83c\udf8f"],"\ue43b","\udbb9\udd1c",["flags"],9,3],"1f390":[["\ud83c\udf90"],"\ue442","\udbb9\udd1e",["wind_chime"],9,4],"1f391":[["\ud83c\udf91"],"\ue446","\udbb8\udc17",["rice_scene"],9,5],"1f392":[["\ud83c\udf92"],"\ue43a","\udbb9\udd1b",["school_satchel"],9,6],"1f393":[["\ud83c\udf93"],"\ue439","\udbb9\udd1a",["mortar_board"],9,7],"1f3a0":[["\ud83c\udfa0"],"","\udbb9\udffc",["carousel_horse"],9,8],"1f3a1":[["\ud83c\udfa1"],"\ue124","\udbb9\udffd",["ferris_wheel"],9,9],"1f3a2":[["\ud83c\udfa2"],"\ue433","\udbb9\udffe",["roller_coaster"],9,10],"1f3a3":[["\ud83c\udfa3"],"\ue019","\udbb9\udfff",["fishing_pole_and_fish"],9,11],"1f3a4":[["\ud83c\udfa4"],"\ue03c","\udbba\udc00",["microphone"],9,12],"1f3a5":[["\ud83c\udfa5"],"\ue03d","\udbba\udc01",["movie_camera"],9,13],"1f3a6":[["\ud83c\udfa6"],"\ue507","\udbba\udc02",["cinema"],9,14],"1f3a7":[["\ud83c\udfa7"],"\ue30a","\udbba\udc03",["headphones"],9,15],"1f3a8":[["\ud83c\udfa8"],"\ue502","\udbba\udc04",["art"],9,16],"1f3a9":[["\ud83c\udfa9"],"\ue503","\udbba\udc05",["tophat"],9,17],"1f3aa":[["\ud83c\udfaa"],"","\udbba\udc06",["circus_tent"],9,18],"1f3ab":[["\ud83c\udfab"],"\ue125","\udbba\udc07",["ticket"],9,19],"1f3ac":[["\ud83c\udfac"],"\ue324","\udbba\udc08",["clapper"],9,20],"1f3ad":[["\ud83c\udfad"],"\ue503","\udbba\udc09",["performing_arts"],9,21],"1f3ae":[["\ud83c\udfae"],"","\udbba\udc0a",["video_game"],9,22],"1f3af":[["\ud83c\udfaf"],"\ue130","\udbba\udc0c",["dart"],9,23],"1f3b0":[["\ud83c\udfb0"],"\ue133","\udbba\udc0d",["slot_machine"],9,24],"1f3b1":[["\ud83c\udfb1"],"\ue42c","\udbba\udc0e",["8ball"],9,25],"1f3b2":[["\ud83c\udfb2"],"","\udbba\udc0f",["game_die"],9,26],"1f3b3":[["\ud83c\udfb3"],"","\udbba\udc10",["bowling"],9,27],"1f3b4":[["\ud83c\udfb4"],"","\udbba\udc11",["flower_playing_cards"],9,28],"1f3b5":[["\ud83c\udfb5"],"\ue03e","\udbba\udc13",["musical_note"],9,29],"1f3b6":[["\ud83c\udfb6"],"\ue326","\udbba\udc14",["notes"],10,0],"1f3b7":[["\ud83c\udfb7"],"\ue040","\udbba\udc15",["saxophone"],10,1],"1f3b8":[["\ud83c\udfb8"],"\ue041","\udbba\udc16",["guitar"],10,2],"1f3b9":[["\ud83c\udfb9"],"","\udbba\udc17",["musical_keyboard"],10,3],"1f3ba":[["\ud83c\udfba"],"\ue042","\udbba\udc18",["trumpet"],10,4],"1f3bb":[["\ud83c\udfbb"],"","\udbba\udc19",["violin"],10,5],"1f3bc":[["\ud83c\udfbc"],"\ue326","\udbba\udc1a",["musical_score"],10,6],"1f3bd":[["\ud83c\udfbd"],"","\udbb9\udfd0",["running_shirt_with_sash"],10,7],"1f3be":[["\ud83c\udfbe"],"\ue015","\udbb9\udfd3",["tennis"],10,8],"1f3bf":[["\ud83c\udfbf"],"\ue013","\udbb9\udfd5",["ski"],10,9],"1f3c0":[["\ud83c\udfc0"],"\ue42a","\udbb9\udfd6",["basketball"],10,10],"1f3c1":[["\ud83c\udfc1"],"\ue132","\udbb9\udfd7",["checkered_flag"],10,11],"1f3c2":[["\ud83c\udfc2"],"","\udbb9\udfd8",["snowboarder"],10,12],"1f3c3":[["\ud83c\udfc3"],"\ue115","\udbb9\udfd9",["runner","running"],10,13],"1f3c4":[["\ud83c\udfc4"],"\ue017","\udbb9\udfda",["surfer"],10,14],"1f3c6":[["\ud83c\udfc6"],"\ue131","\udbb9\udfdb",["trophy"],10,15],"1f3c7":[["\ud83c\udfc7"],"","",["horse_racing"],10,16],"1f3c8":[["\ud83c\udfc8"],"\ue42b","\udbb9\udfdd",["football"],10,17],"1f3c9":[["\ud83c\udfc9"],"","",["rugby_football"],10,18],"1f3ca":[["\ud83c\udfca"],"\ue42d","\udbb9\udfde",["swimmer"],10,19],"1f3e0":[["\ud83c\udfe0"],"\ue036","\udbb9\udcb0",["house"],10,20],
"1f3e1":[["\ud83c\udfe1"],"\ue036","\udbb9\udcb1",["house_with_garden"],10,21],"1f3e2":[["\ud83c\udfe2"],"\ue038","\udbb9\udcb2",["office"],10,22],"1f3e3":[["\ud83c\udfe3"],"\ue153","\udbb9\udcb3",["post_office"],10,23],"1f3e4":[["\ud83c\udfe4"],"","",["european_post_office"],10,24],"1f3e5":[["\ud83c\udfe5"],"\ue155","\udbb9\udcb4",["hospital"],10,25],"1f3e6":[["\ud83c\udfe6"],"\ue14d","\udbb9\udcb5",["bank"],10,26],"1f3e7":[["\ud83c\udfe7"],"\ue154","\udbb9\udcb6",["atm"],10,27],"1f3e8":[["\ud83c\udfe8"],"\ue158","\udbb9\udcb7",["hotel"],10,28],"1f3e9":[["\ud83c\udfe9"],"\ue501","\udbb9\udcb8",["love_hotel"],10,29],"1f3ea":[["\ud83c\udfea"],"\ue156","\udbb9\udcb9",["convenience_store"],11,0],"1f3eb":[["\ud83c\udfeb"],"\ue157","\udbb9\udcba",["school"],11,1],"1f3ec":[["\ud83c\udfec"],"\ue504","\udbb9\udcbd",["department_store"],11,2],"1f3ed":[["\ud83c\udfed"],"\ue508","\udbb9\udcc0",["factory"],11,3],"1f3ee":[["\ud83c\udfee"],"\ue30b","\udbb9\udcc2",["izakaya_lantern","lantern"],11,4],"1f3ef":[["\ud83c\udfef"],"\ue505","\udbb9\udcbe",["japanese_castle"],11,5],"1f3f0":[["\ud83c\udff0"],"\ue506","\udbb9\udcbf",["european_castle"],11,6],"1f400":[["\ud83d\udc00"],"","",["rat"],11,7],"1f401":[["\ud83d\udc01"],"","",["mouse2"],11,8],"1f402":[["\ud83d\udc02"],"","",["ox"],11,9],"1f403":[["\ud83d\udc03"],"","",["water_buffalo"],11,10],"1f404":[["\ud83d\udc04"],"","",["cow2"],11,11],"1f405":[["\ud83d\udc05"],"","",["tiger2"],11,12],"1f406":[["\ud83d\udc06"],"","",["leopard"],11,13],"1f407":[["\ud83d\udc07"],"","",["rabbit2"],11,14],"1f408":[["\ud83d\udc08"],"","",["cat2"],11,15],"1f409":[["\ud83d\udc09"],"","",["dragon"],11,16],"1f40a":[["\ud83d\udc0a"],"","",["crocodile"],11,17],"1f40b":[["\ud83d\udc0b"],"","",["whale2"],11,18],"1f40c":[["\ud83d\udc0c"],"","\udbb8\uddb9",["snail"],11,19],"1f40d":[["\ud83d\udc0d"],"\ue52d","\udbb8\uddd3",["snake"],11,20],"1f40e":[["\ud83d\udc0e"],"\ue134","\udbb9\udfdc",["racehorse"],11,21],"1f40f":[["\ud83d\udc0f"],"","",["ram"],11,22],"1f410":[["\ud83d\udc10"],"","",["goat"],11,23],"1f411":[["\ud83d\udc11"],"\ue529","\udbb8\uddcf",["sheep"],11,24],"1f412":[["\ud83d\udc12"],"\ue528","\udbb8\uddce",["monkey"],11,25],"1f413":[["\ud83d\udc13"],"","",["rooster"],11,26],"1f414":[["\ud83d\udc14"],"\ue52e","\udbb8\uddd4",["chicken"],11,27],"1f415":[["\ud83d\udc15"],"","",["dog2"],11,28],"1f416":[["\ud83d\udc16"],"","",["pig2"],11,29],"1f417":[["\ud83d\udc17"],"\ue52f","\udbb8\uddd5",["boar"],12,0],"1f418":[["\ud83d\udc18"],"\ue526","\udbb8\uddcc",["elephant"],12,1],"1f419":[["\ud83d\udc19"],"\ue10a","\udbb8\uddc5",["octopus"],12,2],"1f41a":[["\ud83d\udc1a"],"\ue441","\udbb8\uddc6",["shell"],12,3],"1f41b":[["\ud83d\udc1b"],"\ue525","\udbb8\uddcb",["bug"],12,4],"1f41c":[["\ud83d\udc1c"],"","\udbb8\uddda",["ant"],12,5],"1f41d":[["\ud83d\udc1d"],"","\udbb8\udde1",["bee","honeybee"],12,6],"1f41e":[["\ud83d\udc1e"],"","\udbb8\udde2",["beetle"],12,7],"1f41f":[["\ud83d\udc1f"],"\ue019","\udbb8\uddbd",["fish"],12,8],"1f420":[["\ud83d\udc20"],"\ue522","\udbb8\uddc9",["tropical_fish"],12,9],"1f421":[["\ud83d\udc21"],"\ue019","\udbb8\uddd9",["blowfish"],12,10],"1f422":[["\ud83d\udc22"],"","\udbb8\udddc",["turtle"],12,11],"1f423":[["\ud83d\udc23"],"\ue523","\udbb8\udddd",["hatching_chick"],12,12],"1f424":[["\ud83d\udc24"],"\ue523","\udbb8\uddba",["baby_chick"],12,13],"1f425":[["\ud83d\udc25"],"\ue523","\udbb8\uddbb",["hatched_chick"],12,14],"1f426":[["\ud83d\udc26"],"\ue521","\udbb8\uddc8",["bird"],12,15],"1f427":[["\ud83d\udc27"],"\ue055","\udbb8\uddbc",["penguin"],12,16],"1f428":[["\ud83d\udc28"],"\ue527","\udbb8\uddcd",["koala"],12,17],"1f429":[["\ud83d\udc29"],"\ue052","\udbb8\uddd8",["poodle"],12,18],"1f42a":[["\ud83d\udc2a"],"","",["dromedary_camel"],12,19],"1f42b":[["\ud83d\udc2b"],"\ue530","\udbb8\uddd6",["camel"],12,20],"1f42c":[["\ud83d\udc2c"],"\ue520","\udbb8\uddc7",["dolphin","flipper"],12,21],"1f42d":[["\ud83d\udc2d"],"\ue053","\udbb8\uddc2",["mouse"],12,22],"1f42e":[["\ud83d\udc2e"],"\ue52b","\udbb8\uddd1",["cow"],12,23],"1f42f":[["\ud83d\udc2f"],"\ue050","\udbb8\uddc0",["tiger"],12,24],"1f430":[["\ud83d\udc30"],"\ue52c","\udbb8\uddd2",["rabbit"],12,25],"1f431":[["\ud83d\udc31"],"\ue04f","\udbb8\uddb8",["cat"],12,26],"1f432":[["\ud83d\udc32"],"","\udbb8\uddde",["dragon_face"],12,27],"1f433":[["\ud83d\udc33"],"\ue054","\udbb8\uddc3",["whale"],12,28],"1f434":[["\ud83d\udc34"],"\ue01a","\udbb8\uddbe",["horse"],12,29],"1f435":[["\ud83d\udc35"],"\ue109","\udbb8\uddc4",["monkey_face"],13,0],"1f436":[["\ud83d\udc36"],"\ue052","\udbb8\uddb7",["dog"],13,1],"1f437":[["\ud83d\udc37"],"\ue10b","\udbb8\uddbf",["pig"],13,2],"1f438":[["\ud83d\udc38"],"\ue531","\udbb8\uddd7",["frog"],13,3],"1f439":[["\ud83d\udc39"],"\ue524","\udbb8\uddca",["hamster"],13,4],"1f43a":[["\ud83d\udc3a"],"\ue52a","\udbb8\uddd0",["wolf"],13,5],"1f43b":[["\ud83d\udc3b"],"\ue051","\udbb8\uddc1",["bear"],13,6],"1f43c":[["\ud83d\udc3c"],"","\udbb8\udddf",["panda_face"],13,7],"1f43d":[["\ud83d\udc3d"],"\ue10b","\udbb8\udde0",["pig_nose"],13,8],"1f43e":[["\ud83d\udc3e"],"\ue536","\udbb8\udddb",["feet","paw_prints"],13,9],"1f440":[["\ud83d\udc40"],"\ue419","\udbb8\udd90",["eyes"],13,10],"1f442":[["\ud83d\udc42"],"\ue41b","\udbb8\udd91",["ear"],13,11],"1f443":[["\ud83d\udc43"],"\ue41a","\udbb8\udd92",["nose"],13,12],"1f444":[["\ud83d\udc44"],"\ue41c","\udbb8\udd93",["lips"],13,13],"1f445":[["\ud83d\udc45"],"\ue409","\udbb8\udd94",["tongue"],13,14],"1f446":[["\ud83d\udc46"],"\ue22e","\udbba\udf99",["point_up_2"],13,15],"1f447":[["\ud83d\udc47"],"\ue22f","\udbba\udf9a",["point_down"],13,16],"1f448":[["\ud83d\udc48"],"\ue230","\udbba\udf9b",["point_left"],13,17],"1f449":[["\ud83d\udc49"],"\ue231","\udbba\udf9c",["point_right"],13,18],"1f44a":[["\ud83d\udc4a"],"\ue00d","\udbba\udf96",["facepunch","punch"],13,19],"1f44b":[["\ud83d\udc4b"],"\ue41e","\udbba\udf9d",["wave"],13,20],"1f44c":[["\ud83d\udc4c"],"\ue420","\udbba\udf9f",["ok_hand"],13,21],"1f44d":[["\ud83d\udc4d"],"\ue00e","\udbba\udf97",["+1","thumbsup"],13,22],"1f44e":[["\ud83d\udc4e"],"\ue421","\udbba\udfa0",["-1","thumbsdown"],13,23],"1f44f":[["\ud83d\udc4f"],"\ue41f","\udbba\udf9e",["clap"],13,24],"1f450":[["\ud83d\udc50"],"\ue422","\udbba\udfa1",["open_hands"],13,25],"1f451":[["\ud83d\udc51"],"\ue10e","\udbb9\udcd1",["crown"],13,26],"1f452":[["\ud83d\udc52"],"\ue318","\udbb9\udcd4",["womans_hat"],13,27],"1f453":[["\ud83d\udc53"],"","\udbb9\udcce",["eyeglasses"],13,28],"1f454":[["\ud83d\udc54"],"\ue302","\udbb9\udcd3",["necktie"],13,29],"1f455":[["\ud83d\udc55"],"\ue006","\udbb9\udccf",["shirt","tshirt"],14,0],"1f456":[["\ud83d\udc56"],"","\udbb9\udcd0",["jeans"],14,1],"1f457":[["\ud83d\udc57"],"\ue319","\udbb9\udcd5",["dress"],14,2],"1f458":[["\ud83d\udc58"],"\ue321","\udbb9\udcd9",["kimono"],14,3],"1f459":[["\ud83d\udc59"],"\ue322","\udbb9\udcda",["bikini"],14,4],"1f45a":[["\ud83d\udc5a"],"\ue006","\udbb9\udcdb",["womans_clothes"],14,5],"1f45b":[["\ud83d\udc5b"],"","\udbb9\udcdc",["purse"],14,6],"1f45c":[["\ud83d\udc5c"],"\ue323","\udbb9\udcf0",["handbag"],14,7],"1f45d":[["\ud83d\udc5d"],"","\udbb9\udcf1",["pouch"],14,8],"1f45e":[["\ud83d\udc5e"],"\ue007","\udbb9\udccc",["mans_shoe","shoe"],14,9],"1f45f":[["\ud83d\udc5f"],"\ue007","\udbb9\udccd",["athletic_shoe"],14,10],"1f460":[["\ud83d\udc60"],"\ue13e","\udbb9\udcd6",["high_heel"],14,11],"1f461":[["\ud83d\udc61"],"\ue31a","\udbb9\udcd7",["sandal"],14,12],"1f462":[["\ud83d\udc62"],"\ue31b","\udbb9\udcd8",["boot"],14,13],"1f463":[["\ud83d\udc63"],"\ue536","\udbb9\udd53",["footprints"],14,14],"1f464":[["\ud83d\udc64"],"","\udbb8\udd9a",["bust_in_silhouette"],14,15],"1f465":[["\ud83d\udc65"],"","",["busts_in_silhouette"],14,16],"1f466":[["\ud83d\udc66"],"\ue001","\udbb8\udd9b",["boy"],14,17],"1f467":[["\ud83d\udc67"],"\ue002","\udbb8\udd9c",["girl"],14,18],"1f468":[["\ud83d\udc68"],"\ue004","\udbb8\udd9d",["man"],14,19],"1f469":[["\ud83d\udc69"],"\ue005","\udbb8\udd9e",["woman"],14,20],"1f46a":[["\ud83d\udc6a"],"","\udbb8\udd9f",["family"],14,21],"1f46b":[["\ud83d\udc6b"],"\ue428","\udbb8\udda0",["couple"],14,22],"1f46c":[["\ud83d\udc6c"],"","",["two_men_holding_hands"],14,23],"1f46d":[["\ud83d\udc6d"],"","",["two_women_holding_hands"],14,24],"1f46e":[["\ud83d\udc6e"],"\ue152","\udbb8\udda1",["cop"],14,25],"1f46f":[["\ud83d\udc6f"],"\ue429","\udbb8\udda2",["dancers"],14,26],"1f470":[["\ud83d\udc70"],"","\udbb8\udda3",["bride_with_veil"],14,27],"1f471":[["\ud83d\udc71"],"\ue515","\udbb8\udda4",["person_with_blond_hair"],14,28],"1f472":[["\ud83d\udc72"],"\ue516","\udbb8\udda5",["man_with_gua_pi_mao"],14,29],"1f473":[["\ud83d\udc73"],"\ue517","\udbb8\udda6",["man_with_turban"],15,0],"1f474":[["\ud83d\udc74"],"\ue518","\udbb8\udda7",["older_man"],15,1],"1f475":[["\ud83d\udc75"],"\ue519","\udbb8\udda8",["older_woman"],15,2],"1f476":[["\ud83d\udc76"],"\ue51a","\udbb8\udda9",["baby"],15,3],"1f477":[["\ud83d\udc77"],"\ue51b","\udbb8\uddaa",["construction_worker"],15,4],"1f478":[["\ud83d\udc78"],"\ue51c","\udbb8\uddab",["princess"],15,5],"1f479":[["\ud83d\udc79"],"","\udbb8\uddac",["japanese_ogre"],15,6],"1f47a":[["\ud83d\udc7a"],"","\udbb8\uddad",["japanese_goblin"],15,7],"1f47b":[["\ud83d\udc7b"],"\ue11b","\udbb8\uddae",["ghost"],15,8],"1f47c":[["\ud83d\udc7c"],"\ue04e","\udbb8\uddaf",["angel"],15,9],"1f47d":[["\ud83d\udc7d"],"\ue10c","\udbb8\uddb0",["alien"],15,10],"1f47e":[["\ud83d\udc7e"],"\ue12b","\udbb8\uddb1",["space_invader"],15,11],"1f47f":[["\ud83d\udc7f"],"\ue11a","\udbb8\uddb2",["imp"],15,12],"1f480":[["\ud83d\udc80"],"\ue11c","\udbb8\uddb3",["skull"],15,13],"1f481":[["\ud83d\udc81"],"\ue253","\udbb8\uddb4",["information_desk_person"],15,14],"1f482":[["\ud83d\udc82"],"\ue51e","\udbb8\uddb5",["guardsman"],15,15],"1f483":[["\ud83d\udc83"],"\ue51f","\udbb8\uddb6",["dancer"],15,16],"1f484":[["\ud83d\udc84"],"\ue31c","\udbb8\udd95",["lipstick"],15,17],"1f485":[["\ud83d\udc85"],"\ue31d","\udbb8\udd96",["nail_care"],15,18],"1f486":[["\ud83d\udc86"],"\ue31e","\udbb8\udd97",["massage"],15,19],"1f487":[["\ud83d\udc87"],"\ue31f","\udbb8\udd98",["haircut"],15,20],"1f488":[["\ud83d\udc88"],"\ue320","\udbb8\udd99",["barber"],15,21],"1f489":[["\ud83d\udc89"],"\ue13b","\udbb9\udd09",["syringe"],15,22],"1f48a":[["\ud83d\udc8a"],"\ue30f","\udbb9\udd0a",["pill"],15,23],"1f48b":[["\ud83d\udc8b"],"\ue003","\udbba\udc23",["kiss"],15,24],"1f48c":[["\ud83d\udc8c"],"\ue103\ue328","\udbba\udc24",["love_letter"],15,25],"1f48d":[["\ud83d\udc8d"],"\ue034","\udbba\udc25",["ring"],15,26],"1f48e":[["\ud83d\udc8e"],"\ue035","\udbba\udc26",["gem"],15,27],"1f48f":[["\ud83d\udc8f"],"\ue111","\udbba\udc27",["couplekiss"],15,28],"1f490":[["\ud83d\udc90"],"\ue306","\udbba\udc28",["bouquet"],15,29],"1f491":[["\ud83d\udc91"],"\ue425","\udbba\udc29",["couple_with_heart"],16,0],"1f492":[["\ud83d\udc92"],"\ue43d","\udbba\udc2a",["wedding"],16,1],"1f493":[["\ud83d\udc93"],"\ue327","\udbba\udf0d",["heartbeat"],16,2],"1f494":[["\ud83d\udc94"],"\ue023","\udbba\udf0e",["broken_heart"],16,3,"</3"],"1f495":[["\ud83d\udc95"],"\ue327","\udbba\udf0f",["two_hearts"],16,4],"1f496":[["\ud83d\udc96"],"\ue327","\udbba\udf10",["sparkling_heart"],16,5],"1f497":[["\ud83d\udc97"],"\ue328","\udbba\udf11",["heartpulse"],16,6],"1f498":[["\ud83d\udc98"],"\ue329","\udbba\udf12",["cupid"],16,7],"1f499":[["\ud83d\udc99"],"\ue32a","\udbba\udf13",["blue_heart"],16,8,"<3"],"1f49a":[["\ud83d\udc9a"],"\ue32b","\udbba\udf14",["green_heart"],16,9,"<3"],"1f49b":[["\ud83d\udc9b"],"\ue32c","\udbba\udf15",["yellow_heart"],16,10,"<3"],"1f49c":[["\ud83d\udc9c"],"\ue32d","\udbba\udf16",["purple_heart"],16,11,"<3"],"1f49d":[["\ud83d\udc9d"],"\ue437","\udbba\udf17",["gift_heart"],16,12],"1f49e":[["\ud83d\udc9e"],"\ue327","\udbba\udf18",["revolving_hearts"],16,13],"1f49f":[["\ud83d\udc9f"],"\ue204","\udbba\udf19",["heart_decoration"],16,14],"1f4a0":[["\ud83d\udca0"],"","\udbba\udf55",["diamond_shape_with_a_dot_inside"],16,15],"1f4a1":[["\ud83d\udca1"],"\ue10f","\udbba\udf56",["bulb"],16,16],"1f4a2":[["\ud83d\udca2"],"\ue334","\udbba\udf57",["anger"],16,17],"1f4a3":[["\ud83d\udca3"],"\ue311","\udbba\udf58",["bomb"],16,18],"1f4a4":[["\ud83d\udca4"],"\ue13c","\udbba\udf59",["zzz"],16,19],"1f4a5":[["\ud83d\udca5"],"","\udbba\udf5a",["boom","collision"],16,20],"1f4a6":[["\ud83d\udca6"],"\ue331","\udbba\udf5b",["sweat_drops"],16,21],"1f4a7":[["\ud83d\udca7"],"\ue331","\udbba\udf5c",["droplet"],16,22],"1f4a8":[["\ud83d\udca8"],"\ue330","\udbba\udf5d",["dash"],16,23],"1f4a9":[["\ud83d\udca9"],"\ue05a","\udbb9\udcf4",["hankey","poop","shit"],16,24],"1f4aa":[["\ud83d\udcaa"],"\ue14c","\udbba\udf5e",["muscle"],16,25],"1f4ab":[["\ud83d\udcab"],"\ue407","\udbba\udf5f",["dizzy"],16,26],"1f4ac":[["\ud83d\udcac"],"","\udbb9\udd32",["speech_balloon"],16,27],"1f4ad":[["\ud83d\udcad"],"","",["thought_balloon"],16,28],"1f4ae":[["\ud83d\udcae"],"","\udbba\udf7a",["white_flower"],16,29],"1f4af":[["\ud83d\udcaf"],"","\udbba\udf7b",["100"],17,0],"1f4b0":[["\ud83d\udcb0"],"\ue12f","\udbb9\udcdd",["moneybag"],17,1],"1f4b1":[["\ud83d\udcb1"],"\ue149","\udbb9\udcde",["currency_exchange"],17,2],"1f4b2":[["\ud83d\udcb2"],"\ue12f","\udbb9\udce0",["heavy_dollar_sign"],17,3],"1f4b3":[["\ud83d\udcb3"],"","\udbb9\udce1",["credit_card"],17,4],"1f4b4":[["\ud83d\udcb4"],"","\udbb9\udce2",["yen"],17,5],"1f4b5":[["\ud83d\udcb5"],"\ue12f","\udbb9\udce3",["dollar"],17,6],"1f4b6":[["\ud83d\udcb6"],"","",["euro"],17,7],"1f4b7":[["\ud83d\udcb7"],"","",["pound"],17,8],"1f4b8":[["\ud83d\udcb8"],"","\udbb9\udce4",["money_with_wings"],17,9],"1f4b9":[["\ud83d\udcb9"],"\ue14a","\udbb9\udcdf",["chart"],17,10],"1f4ba":[["\ud83d\udcba"],"\ue11f","\udbb9\udd37",["seat"],17,11],"1f4bb":[["\ud83d\udcbb"],"\ue00c","\udbb9\udd38",["computer"],17,12],"1f4bc":[["\ud83d\udcbc"],"\ue11e","\udbb9\udd3b",["briefcase"],17,13],"1f4bd":[["\ud83d\udcbd"],"\ue316","\udbb9\udd3c",["minidisc"],17,14],"1f4be":[["\ud83d\udcbe"],"\ue316","\udbb9\udd3d",["floppy_disk"],17,15],"1f4bf":[["\ud83d\udcbf"],"\ue126","\udbba\udc1d",["cd"],17,16],"1f4c0":[["\ud83d\udcc0"],"\ue127","\udbba\udc1e",["dvd"],17,17],"1f4c1":[["\ud83d\udcc1"],"","\udbb9\udd43",["file_folder"],17,18],"1f4c2":[["\ud83d\udcc2"],"","\udbb9\udd44",["open_file_folder"],17,19],"1f4c3":[["\ud83d\udcc3"],"\ue301","\udbb9\udd40",["page_with_curl"],17,20],"1f4c4":[["\ud83d\udcc4"],"\ue301","\udbb9\udd41",["page_facing_up"],17,21],"1f4c5":[["\ud83d\udcc5"],"","\udbb9\udd42",["date"],17,22],"1f4c6":[["\ud83d\udcc6"],"","\udbb9\udd49",["calendar"],17,23],"1f4c7":[["\ud83d\udcc7"],"\ue148","\udbb9\udd4d",["card_index"],17,24],"1f4c8":[["\ud83d\udcc8"],"\ue14a","\udbb9\udd4b",["chart_with_upwards_trend"],17,25],"1f4c9":[["\ud83d\udcc9"],"","\udbb9\udd4c",["chart_with_downwards_trend"],17,26],"1f4ca":[["\ud83d\udcca"],"\ue14a","\udbb9\udd4a",["bar_chart"],17,27],"1f4cb":[["\ud83d\udccb"],"\ue301","\udbb9\udd48",["clipboard"],17,28],"1f4cc":[["\ud83d\udccc"],"","\udbb9\udd4e",["pushpin"],17,29],"1f4cd":[["\ud83d\udccd"],"","\udbb9\udd3f",["round_pushpin"],18,0],"1f4ce":[["\ud83d\udcce"],"","\udbb9\udd3a",["paperclip"],18,1],"1f4cf":[["\ud83d\udccf"],"","\udbb9\udd50",["straight_ruler"],18,2],"1f4d0":[["\ud83d\udcd0"],"","\udbb9\udd51",["triangular_ruler"],18,3],"1f4d1":[["\ud83d\udcd1"],"\ue301","\udbb9\udd52",["bookmark_tabs"],18,4],"1f4d2":[["\ud83d\udcd2"],"\ue148","\udbb9\udd4f",["ledger"],18,5],"1f4d3":[["\ud83d\udcd3"],"\ue148","\udbb9\udd45",["notebook"],18,6],"1f4d4":[["\ud83d\udcd4"],"\ue148","\udbb9\udd47",["notebook_with_decorative_cover"],18,7],"1f4d5":[["\ud83d\udcd5"],"\ue148","\udbb9\udd02",["closed_book"],18,8],"1f4d6":[["\ud83d\udcd6"],"\ue148","\udbb9\udd46",["book","open_book"],18,9],"1f4d7":[["\ud83d\udcd7"],"\ue148","\udbb9\udcff",["green_book"],18,10],"1f4d8":[["\ud83d\udcd8"],"\ue148","\udbb9\udd00",["blue_book"],18,11],"1f4d9":[["\ud83d\udcd9"],"\ue148","\udbb9\udd01",["orange_book"],18,12],"1f4da":[["\ud83d\udcda"],"\ue148","\udbb9\udd03",["books"],18,13],"1f4db":[["\ud83d\udcdb"],"","\udbb9\udd04",["name_badge"],18,14],"1f4dc":[["\ud83d\udcdc"],"","\udbb9\udcfd",["scroll"],18,15],"1f4dd":[["\ud83d\udcdd"],"\ue301","\udbb9\udd27",["memo","pencil"],18,16],"1f4de":[["\ud83d\udcde"],"\ue009","\udbb9\udd24",["telephone_receiver"],18,17],"1f4df":[["\ud83d\udcdf"],"","\udbb9\udd22",["pager"],18,18],"1f4e0":[["\ud83d\udce0"],"\ue00b","\udbb9\udd28",["fax"],18,19],"1f4e1":[["\ud83d\udce1"],"\ue14b","\udbb9\udd31",["satellite"],18,20],"1f4e2":[["\ud83d\udce2"],"\ue142","\udbb9\udd2f",["loudspeaker"],18,21],"1f4e3":[["\ud83d\udce3"],"\ue317","\udbb9\udd30",["mega"],18,22],"1f4e4":[["\ud83d\udce4"],"","\udbb9\udd33",["outbox_tray"],18,23],"1f4e5":[["\ud83d\udce5"],"","\udbb9\udd34",["inbox_tray"],18,24],"1f4e6":[["\ud83d\udce6"],"\ue112","\udbb9\udd35",["package"],18,25],"1f4e7":[["\ud83d\udce7"],"\ue103","\udbba\udf92",["e-mail"],18,26],"1f4e8":[["\ud83d\udce8"],"\ue103","\udbb9\udd2a",["incoming_envelope"],18,27],"1f4e9":[["\ud83d\udce9"],"\ue103","\udbb9\udd2b",["envelope_with_arrow"],18,28],"1f4ea":[["\ud83d\udcea"],"\ue101","\udbb9\udd2c",["mailbox_closed"],18,29],"1f4eb":[["\ud83d\udceb"],"\ue101","\udbb9\udd2d",["mailbox"],19,0],"1f4ec":[["\ud83d\udcec"],"","",["mailbox_with_mail"],19,1],"1f4ed":[["\ud83d\udced"],"","",["mailbox_with_no_mail"],19,2],"1f4ee":[["\ud83d\udcee"],"\ue102","\udbb9\udd2e",["postbox"],19,3],"1f4ef":[["\ud83d\udcef"],"","",["postal_horn"],19,4],"1f4f0":[["\ud83d\udcf0"],"","\udbba\udc22",["newspaper"],19,5],"1f4f1":[["\ud83d\udcf1"],"\ue00a","\udbb9\udd25",["iphone"],19,6],"1f4f2":[["\ud83d\udcf2"],"\ue104","\udbb9\udd26",["calling"],19,7],"1f4f3":[["\ud83d\udcf3"],"\ue250","\udbba\udc39",["vibration_mode"],19,8],"1f4f4":[["\ud83d\udcf4"],"\ue251","\udbba\udc3a",["mobile_phone_off"],19,9],"1f4f5":[["\ud83d\udcf5"],"","",["no_mobile_phones"],19,10],"1f4f6":[["\ud83d\udcf6"],"\ue20b","\udbba\udc38",["signal_strength"],19,11],"1f4f7":[["\ud83d\udcf7"],"\ue008","\udbb9\udcef",["camera"],19,12],"1f4f9":[["\ud83d\udcf9"],"\ue03d","\udbb9\udcf9",["video_camera"],19,13],"1f4fa":[["\ud83d\udcfa"],"\ue12a","\udbba\udc1c",["tv"],19,14],"1f4fb":[["\ud83d\udcfb"],"\ue128","\udbba\udc1f",["radio"],19,15],"1f4fc":[["\ud83d\udcfc"],"\ue129","\udbba\udc20",["vhs"],19,16],"1f500":[["\ud83d\udd00"],"","",["twisted_rightwards_arrows"],19,17],"1f501":[["\ud83d\udd01"],"","",["repeat"],19,18],"1f502":[["\ud83d\udd02"],"","",["repeat_one"],19,19],"1f503":[["\ud83d\udd03"],"","\udbba\udf91",["arrows_clockwise"],19,20],"1f504":[["\ud83d\udd04"],"","",["arrows_counterclockwise"],19,21],"1f505":[["\ud83d\udd05"],"","",["low_brightness"],19,22],"1f506":[["\ud83d\udd06"],"","",["high_brightness"],19,23],"1f507":[["\ud83d\udd07"],"","",["mute"],19,24],"1f508":[["\ud83d\udd08"],"","",["speaker"],19,25],"1f509":[["\ud83d\udd09"],"","",["sound"],19,26],"1f50a":[["\ud83d\udd0a"],"\ue141","\udbba\udc21",["loud_sound"],19,27],"1f50b":[["\ud83d\udd0b"],"","\udbb9\udcfc",["battery"],19,28],"1f50c":[["\ud83d\udd0c"],"","\udbb9\udcfe",["electric_plug"],19,29],"1f50d":[["\ud83d\udd0d"],"\ue114","\udbba\udf85",["mag"],20,0],"1f50e":[["\ud83d\udd0e"],"\ue114","\udbba\udf8d",["mag_right"],20,1],"1f50f":[["\ud83d\udd0f"],"\ue144","\udbba\udf90",["lock_with_ink_pen"],20,2],"1f510":[["\ud83d\udd10"],"\ue144","\udbba\udf8a",["closed_lock_with_key"],20,3],"1f511":[["\ud83d\udd11"],"\ue03f","\udbba\udf82",["key"],20,4],"1f512":[["\ud83d\udd12"],"\ue144","\udbba\udf86",["lock"],20,5],"1f513":[["\ud83d\udd13"],"\ue145","\udbba\udf87",["unlock"],20,6],"1f514":[["\ud83d\udd14"],"\ue325","\udbb9\udcf2",["bell"],20,7],"1f515":[["\ud83d\udd15"],"","",["no_bell"],20,8],"1f516":[["\ud83d\udd16"],"","\udbba\udf8f",["bookmark"],20,9],"1f517":[["\ud83d\udd17"],"","\udbba\udf4b",["link"],20,10],"1f518":[["\ud83d\udd18"],"","\udbba\udf8c",["radio_button"],20,11],"1f519":[["\ud83d\udd19"],"\ue235","\udbba\udf8e",["back"],20,12],"1f51a":[["\ud83d\udd1a"],"","\udbb8\udc1a",["end"],20,13],"1f51b":[["\ud83d\udd1b"],"","\udbb8\udc19",["on"],20,14],"1f51c":[["\ud83d\udd1c"],"","\udbb8\udc18",["soon"],20,15],"1f51d":[["\ud83d\udd1d"],"\ue24c","\udbba\udf42",["top"],20,16],"1f51e":[["\ud83d\udd1e"],"\ue207","\udbba\udf25",["underage"],20,17],"1f51f":[["\ud83d\udd1f"],"","\udbba\udc3b",["keycap_ten"],20,18],"1f520":[["\ud83d\udd20"],"","\udbba\udf7c",["capital_abcd"],20,19],"1f521":[["\ud83d\udd21"],"","\udbba\udf7d",["abcd"],20,20],"1f522":[["\ud83d\udd22"],"","\udbba\udf7e",["1234"],20,21],"1f523":[["\ud83d\udd23"],"","\udbba\udf7f",["symbols"],20,22],"1f524":[["\ud83d\udd24"],"","\udbba\udf80",["abc"],20,23],"1f525":[["\ud83d\udd25"],"\ue11d","\udbb9\udcf6",["fire"],20,24],"1f526":[["\ud83d\udd26"],"","\udbb9\udcfb",["flashlight"],20,25],"1f527":[["\ud83d\udd27"],"","\udbb9\udcc9",["wrench"],20,26],"1f528":[["\ud83d\udd28"],"\ue116","\udbb9\udcca",["hammer"],20,27],"1f529":[["\ud83d\udd29"],"","\udbb9\udccb",["nut_and_bolt"],20,28],"1f52a":[["\ud83d\udd2a"],"","\udbb9\udcfa",["hocho","knife"],20,29],"1f52b":[["\ud83d\udd2b"],"\ue113","\udbb9\udcf5",["gun"],21,0],"1f52c":[["\ud83d\udd2c"],"","",["microscope"],21,1],"1f52d":[["\ud83d\udd2d"],"","",["telescope"],21,2],"1f52e":[["\ud83d\udd2e"],"\ue23e","\udbb9\udcf7",["crystal_ball"],21,3],"1f52f":[["\ud83d\udd2f"],"\ue23e","\udbb9\udcf8",["six_pointed_star"],21,4],"1f530":[["\ud83d\udd30"],"\ue209","\udbb8\udc44",["beginner"],21,5],"1f531":[["\ud83d\udd31"],"\ue031","\udbb9\udcd2",["trident"],21,6],"1f532":[["\ud83d\udd32"],"\ue21a","\udbba\udf64",["black_square_button"],21,7],"1f533":[["\ud83d\udd33"],"\ue21b","\udbba\udf67",["white_square_button"],21,8],"1f534":[["\ud83d\udd34"],"\ue219","\udbba\udf63",["red_circle"],21,9],"1f535":[["\ud83d\udd35"],"\ue21a","\udbba\udf64",["large_blue_circle"],21,10],"1f536":[["\ud83d\udd36"],"\ue21b","\udbba\udf73",["large_orange_diamond"],21,11],"1f537":[["\ud83d\udd37"],"\ue21b","\udbba\udf74",["large_blue_diamond"],21,12],"1f538":[["\ud83d\udd38"],"\ue21b","\udbba\udf75",["small_orange_diamond"],21,13],"1f539":[["\ud83d\udd39"],"\ue21b","\udbba\udf76",["small_blue_diamond"],21,14],"1f53a":[["\ud83d\udd3a"],"","\udbba\udf78",["small_red_triangle"],21,15],"1f53b":[["\ud83d\udd3b"],"","\udbba\udf79",["small_red_triangle_down"],21,16],"1f53c":[["\ud83d\udd3c"],"","\udbba\udf01",["arrow_up_small"],21,17],"1f53d":[["\ud83d\udd3d"],"","\udbba\udf00",["arrow_down_small"],21,18],"1f550":[["\ud83d\udd50"],"\ue024","\udbb8\udc1e",["clock1"],21,19],"1f551":[["\ud83d\udd51"],"\ue025","\udbb8\udc1f",["clock2"],21,20],"1f552":[["\ud83d\udd52"],"\ue026","\udbb8\udc20",["clock3"],21,21],"1f553":[["\ud83d\udd53"],"\ue027","\udbb8\udc21",["clock4"],21,22],"1f554":[["\ud83d\udd54"],"\ue028","\udbb8\udc22",["clock5"],21,23],"1f555":[["\ud83d\udd55"],"\ue029","\udbb8\udc23",["clock6"],21,24],"1f556":[["\ud83d\udd56"],"\ue02a","\udbb8\udc24",["clock7"],21,25],"1f557":[["\ud83d\udd57"],"\ue02b","\udbb8\udc25",["clock8"],21,26],"1f558":[["\ud83d\udd58"],"\ue02c","\udbb8\udc26",["clock9"],21,27],"1f559":[["\ud83d\udd59"],"\ue02d","\udbb8\udc27",["clock10"],21,28],"1f55a":[["\ud83d\udd5a"],"\ue02e","\udbb8\udc28",["clock11"],21,29],"1f55b":[["\ud83d\udd5b"],"\ue02f","\udbb8\udc29",["clock12"],22,0],"1f55c":[["\ud83d\udd5c"],"","",["clock130"],22,1],"1f55d":[["\ud83d\udd5d"],"","",["clock230"],22,2],"1f55e":[["\ud83d\udd5e"],"","",["clock330"],22,3],"1f55f":[["\ud83d\udd5f"],"","",["clock430"],22,4],"1f560":[["\ud83d\udd60"],"","",["clock530"],22,5],"1f561":[["\ud83d\udd61"],"","",["clock630"],22,6],"1f562":[["\ud83d\udd62"],"","",["clock730"],22,7],"1f563":[["\ud83d\udd63"],"","",["clock830"],22,8],"1f564":[["\ud83d\udd64"],"","",["clock930"],22,9],"1f565":[["\ud83d\udd65"],"","",["clock1030"],22,10],"1f566":[["\ud83d\udd66"],"","",["clock1130"],22,11],"1f567":[["\ud83d\udd67"],"","",["clock1230"],22,12],"1f5fb":[["\ud83d\uddfb"],"\ue03b","\udbb9\udcc3",["mount_fuji"],22,13],"1f5fc":[["\ud83d\uddfc"],"\ue509","\udbb9\udcc4",["tokyo_tower"],22,14],"1f5fd":[["\ud83d\uddfd"],"\ue51d","\udbb9\udcc6",["statue_of_liberty"],22,15],"1f5fe":[["\ud83d\uddfe"],"","\udbb9\udcc7",["japan"],22,16],"1f5ff":[["\ud83d\uddff"],"","\udbb9\udcc8",["moyai"],22,17],"1f600":[["\ud83d\ude00"],"","",["grinning"],22,18,":D"],"1f601":[["\ud83d\ude01"],"\ue404","\udbb8\udf33",["grin"],22,19],"1f602":[["\ud83d\ude02"],"\ue412","\udbb8\udf34",["joy"],22,20],"1f603":[["\ud83d\ude03"],"\ue057","\udbb8\udf30",["smiley"],22,21,":)"],"1f604":[["\ud83d\ude04"],"\ue415","\udbb8\udf38",["smile"],22,22,":)"],"1f605":[["\ud83d\ude05"],"\ue415\ue331","\udbb8\udf31",["sweat_smile"],22,23],"1f606":[["\ud83d\ude06"],"\ue40a","\udbb8\udf32",["satisfied"],22,24],"1f607":[["\ud83d\ude07"],"","",["innocent"],22,25],"1f608":[["\ud83d\ude08"],"","",["smiling_imp"],22,26],"1f609":[["\ud83d\ude09"],"\ue405","\udbb8\udf47",["wink"],22,27,";)"],"1f60a":[["\ud83d\ude0a"],"\ue056","\udbb8\udf35",["blush"],22,28],"1f60b":[["\ud83d\ude0b"],"\ue056","\udbb8\udf2b",["yum"],22,29],"1f60c":[["\ud83d\ude0c"],"\ue40a","\udbb8\udf3e",["relieved"],23,0],"1f60d":[["\ud83d\ude0d"],"\ue106","\udbb8\udf27",["heart_eyes"],23,1],"1f60e":[["\ud83d\ude0e"],"","",["sunglasses"],23,2],"1f60f":[["\ud83d\ude0f"],"\ue402","\udbb8\udf43",["smirk"],23,3],"1f610":[["\ud83d\ude10"],"","",["neutral_face"],23,4],"1f611":[["\ud83d\ude11"],"","",["expressionless"],23,5],"1f612":[["\ud83d\ude12"],"\ue40e","\udbb8\udf26",["unamused"],23,6],"1f613":[["\ud83d\ude13"],"\ue108","\udbb8\udf44",["sweat"],23,7],"1f614":[["\ud83d\ude14"],"\ue403","\udbb8\udf40",["pensive"],23,8],"1f615":[["\ud83d\ude15"],"","",["confused"],23,9],"1f616":[["\ud83d\ude16"],"\ue407","\udbb8\udf3f",["confounded"],23,10],"1f617":[["\ud83d\ude17"],"","",["kissing"],23,11],"1f618":[["\ud83d\ude18"],"\ue418","\udbb8\udf2c",["kissing_heart"],23,12],"1f619":[["\ud83d\ude19"],"","",["kissing_smiling_eyes"],23,13],"1f61a":[["\ud83d\ude1a"],"\ue417","\udbb8\udf2d",["kissing_closed_eyes"],23,14],"1f61b":[["\ud83d\ude1b"],"","",["stuck_out_tongue"],23,15,":p"],"1f61c":[["\ud83d\ude1c"],"\ue105","\udbb8\udf29",["stuck_out_tongue_winking_eye"],23,16,";p"],"1f61d":[["\ud83d\ude1d"],"\ue409","\udbb8\udf2a",["stuck_out_tongue_closed_eyes"],23,17],"1f61e":[["\ud83d\ude1e"],"\ue058","\udbb8\udf23",["disappointed"],23,18,":("],"1f61f":[["\ud83d\ude1f"],"","",["worried"],23,19],"1f620":[["\ud83d\ude20"],"\ue059","\udbb8\udf20",["angry"],23,20],"1f621":[["\ud83d\ude21"],"\ue416","\udbb8\udf3d",["rage"],23,21],"1f622":[["\ud83d\ude22"],"\ue413","\udbb8\udf39",["cry"],23,22,":'("],"1f623":[["\ud83d\ude23"],"\ue406","\udbb8\udf3c",["persevere"],23,23],"1f624":[["\ud83d\ude24"],"\ue404","\udbb8\udf28",["triumph"],23,24],"1f625":[["\ud83d\ude25"],"\ue401","\udbb8\udf45",["disappointed_relieved"],23,25],"1f626":[["\ud83d\ude26"],"","",["frowning"],23,26],"1f627":[["\ud83d\ude27"],"","",["anguished"],23,27],"1f628":[["\ud83d\ude28"],"\ue40b","\udbb8\udf3b",["fearful"],23,28],"1f629":[["\ud83d\ude29"],"\ue403","\udbb8\udf21",["weary"],23,29],"1f62a":[["\ud83d\ude2a"],"\ue408","\udbb8\udf42",["sleepy"],24,0],"1f62b":[["\ud83d\ude2b"],"\ue406","\udbb8\udf46",["tired_face"],24,1],"1f62c":[["\ud83d\ude2c"],"","",["grimacing"],24,2],"1f62d":[["\ud83d\ude2d"],"\ue411","\udbb8\udf3a",["sob"],24,3,":'("],"1f62e":[["\ud83d\ude2e"],"","",["open_mouth"],24,4],"1f62f":[["\ud83d\ude2f"],"","",["hushed"],24,5],"1f630":[["\ud83d\ude30"],"\ue40f","\udbb8\udf25",["cold_sweat"],24,6],"1f631":[["\ud83d\ude31"],"\ue107","\udbb8\udf41",["scream"],24,7],"1f632":[["\ud83d\ude32"],"\ue410","\udbb8\udf22",["astonished"],24,8],"1f633":[["\ud83d\ude33"],"\ue40d","\udbb8\udf2f",["flushed"],24,9],"1f634":[["\ud83d\ude34"],"","",["sleeping"],24,10],"1f635":[["\ud83d\ude35"],"\ue406","\udbb8\udf24",["dizzy_face"],24,11],"1f636":[["\ud83d\ude36"],"","",["no_mouth"],24,12],"1f637":[["\ud83d\ude37"],"\ue40c","\udbb8\udf2e",["mask"],24,13],"1f638":[["\ud83d\ude38"],"\ue404","\udbb8\udf49",["smile_cat"],24,14],"1f639":[["\ud83d\ude39"],"\ue412","\udbb8\udf4a",["joy_cat"],24,15],"1f63a":[["\ud83d\ude3a"],"\ue057","\udbb8\udf48",["smiley_cat"],24,16],"1f63b":[["\ud83d\ude3b"],"\ue106","\udbb8\udf4c",["heart_eyes_cat"],24,17],"1f63c":[["\ud83d\ude3c"],"\ue404","\udbb8\udf4f",["smirk_cat"],24,18],"1f63d":[["\ud83d\ude3d"],"\ue418","\udbb8\udf4b",["kissing_cat"],24,19],"1f63e":[["\ud83d\ude3e"],"\ue416","\udbb8\udf4e",["pouting_cat"],24,20],"1f63f":[["\ud83d\ude3f"],"\ue413","\udbb8\udf4d",["crying_cat_face"],24,21],"1f640":[["\ud83d\ude40"],"\ue403","\udbb8\udf50",["scream_cat"],24,22],"1f645":[["\ud83d\ude45"],"\ue423","\udbb8\udf51",["no_good"],24,23],"1f646":[["\ud83d\ude46"],"\ue424","\udbb8\udf52",["ok_woman"],24,24],"1f647":[["\ud83d\ude47"],"\ue426","\udbb8\udf53",["bow"],24,25],"1f648":[["\ud83d\ude48"],"","\udbb8\udf54",["see_no_evil"],24,26],"1f649":[["\ud83d\ude49"],"","\udbb8\udf56",["hear_no_evil"],24,27],"1f64a":[["\ud83d\ude4a"],"","\udbb8\udf55",["speak_no_evil"],24,28],"1f64b":[["\ud83d\ude4b"],"\ue012","\udbb8\udf57",["raising_hand"],24,29],"1f64c":[["\ud83d\ude4c"],"\ue427","\udbb8\udf58",["raised_hands"],25,0],"1f64d":[["\ud83d\ude4d"],"\ue403","\udbb8\udf59",["person_frowning"],25,1],"1f64e":[["\ud83d\ude4e"],"\ue416","\udbb8\udf5a",["person_with_pouting_face"],25,2],"1f64f":[["\ud83d\ude4f"],"\ue41d","\udbb8\udf5b",["pray"],25,3],"1f680":[["\ud83d\ude80"],"\ue10d","\udbb9\udfed",["rocket"],25,4],"1f681":[["\ud83d\ude81"],"","",["helicopter"],25,5],"1f682":[["\ud83d\ude82"],"","",["steam_locomotive"],25,6],"1f683":[["\ud83d\ude83"],"\ue01e","\udbb9\udfdf",["railway_car"],25,7],"1f684":[["\ud83d\ude84"],"\ue435","\udbb9\udfe2",["bullettrain_side"],25,8],"1f685":[["\ud83d\ude85"],"\ue01f","\udbb9\udfe3",["bullettrain_front"],25,9],"1f686":[["\ud83d\ude86"],"","",["train2"],25,10],"1f687":[["\ud83d\ude87"],"\ue434","\udbb9\udfe0",["metro"],25,11],"1f688":[["\ud83d\ude88"],"","",["light_rail"],25,12],"1f689":[["\ud83d\ude89"],"\ue039","\udbb9\udfec",["station"],25,13],"1f68a":[["\ud83d\ude8a"],"","",["tram"],25,14],"1f68b":[["\ud83d\ude8b"],"","",["train"],25,15],"1f68c":[["\ud83d\ude8c"],"\ue159","\udbb9\udfe6",["bus"],25,16],"1f68d":[["\ud83d\ude8d"],"","",["oncoming_bus"],25,17],"1f68e":[["\ud83d\ude8e"],"","",["trolleybus"],25,18],"1f68f":[["\ud83d\ude8f"],"\ue150","\udbb9\udfe7",["busstop"],25,19],"1f690":[["\ud83d\ude90"],"","",["minibus"],25,20],"1f691":[["\ud83d\ude91"],"\ue431","\udbb9\udff3",["ambulance"],25,21],"1f692":[["\ud83d\ude92"],"\ue430","\udbb9\udff2",["fire_engine"],25,22],"1f693":[["\ud83d\ude93"],"\ue432","\udbb9\udff4",["police_car"],25,23],"1f694":[["\ud83d\ude94"],"","",["oncoming_police_car"],25,24],"1f695":[["\ud83d\ude95"],"\ue15a","\udbb9\udfef",["taxi"],25,25],"1f696":[["\ud83d\ude96"],"","",["oncoming_taxi"],25,26],"1f697":[["\ud83d\ude97"],"\ue01b","\udbb9\udfe4",["car","red_car"],25,27],"1f698":[["\ud83d\ude98"],"","",["oncoming_automobile"],25,28],"1f699":[["\ud83d\ude99"],"\ue42e","\udbb9\udfe5",["blue_car"],25,29],"1f69a":[["\ud83d\ude9a"],"\ue42f","\udbb9\udff1",["truck"],26,0],"1f69b":[["\ud83d\ude9b"],"","",["articulated_lorry"],26,1],"1f69c":[["\ud83d\ude9c"],"","",["tractor"],26,2],"1f69d":[["\ud83d\ude9d"],"","",["monorail"],26,3],"1f69e":[["\ud83d\ude9e"],"","",["mountain_railway"],26,4],"1f69f":[["\ud83d\ude9f"],"","",["suspension_railway"],26,5],"1f6a0":[["\ud83d\udea0"],"","",["mountain_cableway"],26,6],"1f6a1":[["\ud83d\udea1"],"","",["aerial_tramway"],26,7],"1f6a2":[["\ud83d\udea2"],"\ue202","\udbb9\udfe8",["ship"],26,8],"1f6a3":[["\ud83d\udea3"],"","",["rowboat"],26,9],"1f6a4":[["\ud83d\udea4"],"\ue135","\udbb9\udfee",["speedboat"],26,10],"1f6a5":[["\ud83d\udea5"],"\ue14e","\udbb9\udff7",["traffic_light"],26,11],"1f6a6":[["\ud83d\udea6"],"","",["vertical_traffic_light"],26,12],"1f6a7":[["\ud83d\udea7"],"\ue137","\udbb9\udff8",["construction"],26,13],"1f6a8":[["\ud83d\udea8"],"\ue432","\udbb9\udff9",["rotating_light"],26,14],"1f6a9":[["\ud83d\udea9"],"","\udbba\udf22",["triangular_flag_on_post"],26,15],"1f6aa":[["\ud83d\udeaa"],"","\udbb9\udcf3",["door"],26,16],"1f6ab":[["\ud83d\udeab"],"","\udbba\udf48",["no_entry_sign"],26,17],"1f6ac":[["\ud83d\udeac"],"\ue30e","\udbba\udf1e",["smoking"],26,18],
"1f6ad":[["\ud83d\udead"],"\ue208","\udbba\udf1f",["no_smoking"],26,19],"1f6ae":[["\ud83d\udeae"],"","",["put_litter_in_its_place"],26,20],"1f6af":[["\ud83d\udeaf"],"","",["do_not_litter"],26,21],"1f6b0":[["\ud83d\udeb0"],"","",["potable_water"],26,22],"1f6b1":[["\ud83d\udeb1"],"","",["non-potable_water"],26,23],"1f6b2":[["\ud83d\udeb2"],"\ue136","\udbb9\udfeb",["bike"],26,24],"1f6b3":[["\ud83d\udeb3"],"","",["no_bicycles"],26,25],"1f6b4":[["\ud83d\udeb4"],"","",["bicyclist"],26,26],"1f6b5":[["\ud83d\udeb5"],"","",["mountain_bicyclist"],26,27],"1f6b6":[["\ud83d\udeb6"],"\ue201","\udbb9\udff0",["walking"],26,28],"1f6b7":[["\ud83d\udeb7"],"","",["no_pedestrians"],26,29],"1f6b8":[["\ud83d\udeb8"],"","",["children_crossing"],27,0],"1f6b9":[["\ud83d\udeb9"],"\ue138","\udbba\udf33",["mens"],27,1],"1f6ba":[["\ud83d\udeba"],"\ue139","\udbba\udf34",["womens"],27,2],"1f6bb":[["\ud83d\udebb"],"\ue151","\udbb9\udd06",["restroom"],27,3],"1f6bc":[["\ud83d\udebc"],"\ue13a","\udbba\udf35",["baby_symbol"],27,4],"1f6bd":[["\ud83d\udebd"],"\ue140","\udbb9\udd07",["toilet"],27,5],"1f6be":[["\ud83d\udebe"],"\ue309","\udbb9\udd08",["wc"],27,6],"1f6bf":[["\ud83d\udebf"],"","",["shower"],27,7],"1f6c0":[["\ud83d\udec0"],"\ue13f","\udbb9\udd05",["bath"],27,8],"1f6c1":[["\ud83d\udec1"],"","",["bathtub"],27,9],"1f6c2":[["\ud83d\udec2"],"","",["passport_control"],27,10],"1f6c3":[["\ud83d\udec3"],"","",["customs"],27,11],"1f6c4":[["\ud83d\udec4"],"","",["baggage_claim"],27,12],"1f6c5":[["\ud83d\udec5"],"","",["left_luggage"],27,13],"0023-20e3":[["#\ufe0f\u20e3","#\u20e3"],"\ue210","\udbba\udc2c",["hash"],27,14],"0030-20e3":[["0\ufe0f\u20e3","0\u20e3"],"\ue225","\udbba\udc37",["zero"],27,15],"0031-20e3":[["1\ufe0f\u20e3","1\u20e3"],"\ue21c","\udbba\udc2e",["one"],27,16],"0032-20e3":[["2\ufe0f\u20e3","2\u20e3"],"\ue21d","\udbba\udc2f",["two"],27,17],"0033-20e3":[["3\ufe0f\u20e3","3\u20e3"],"\ue21e","\udbba\udc30",["three"],27,18],"0034-20e3":[["4\ufe0f\u20e3","4\u20e3"],"\ue21f","\udbba\udc31",["four"],27,19],"0035-20e3":[["5\ufe0f\u20e3","5\u20e3"],"\ue220","\udbba\udc32",["five"],27,20],"0036-20e3":[["6\ufe0f\u20e3","6\u20e3"],"\ue221","\udbba\udc33",["six"],27,21],"0037-20e3":[["7\ufe0f\u20e3","7\u20e3"],"\ue222","\udbba\udc34",["seven"],27,22],"0038-20e3":[["8\ufe0f\u20e3","8\u20e3"],"\ue223","\udbba\udc35",["eight"],27,23],"0039-20e3":[["9\ufe0f\u20e3","9\u20e3"],"\ue224","\udbba\udc36",["nine"],27,24],"1f1e8-1f1f3":[["\ud83c\udde8\ud83c\uddf3"],"\ue513","\udbb9\udced",["cn"],27,25],"1f1e9-1f1ea":[["\ud83c\udde9\ud83c\uddea"],"\ue50e","\udbb9\udce8",["de"],27,26],"1f1ea-1f1f8":[["\ud83c\uddea\ud83c\uddf8"],"\ue511","\udbb9\udceb",["es"],27,27],"1f1eb-1f1f7":[["\ud83c\uddeb\ud83c\uddf7"],"\ue50d","\udbb9\udce7",["fr"],27,28],"1f1ec-1f1e7":[["\ud83c\uddec\ud83c\udde7"],"\ue510","\udbb9\udcea",["gb","uk"],27,29],"1f1ee-1f1f9":[["\ud83c\uddee\ud83c\uddf9"],"\ue50f","\udbb9\udce9",["it"],28,0],"1f1ef-1f1f5":[["\ud83c\uddef\ud83c\uddf5"],"\ue50b","\udbb9\udce5",["jp"],28,1],"1f1f0-1f1f7":[["\ud83c\uddf0\ud83c\uddf7"],"\ue514","\udbb9\udcee",["kr"],28,2],"1f1f7-1f1fa":[["\ud83c\uddf7\ud83c\uddfa"],"\ue512","\udbb9\udcec",["ru"],28,3],"1f1fa-1f1f8":[["\ud83c\uddfa\ud83c\uddf8"],"\ue50c","\udbb9\udce6",["us"],28,4]},Config.smileys={"<3":"heart","</3":"broken_heart",":)":"blush","(:":"blush",":-)":"blush","C:":"smile","c:":"smile",":D":"smile",":-D":"smile",";)":"wink",";-)":"wink","):":"disappointed",":(":"disappointed",":-(":"disappointed",":'(":"cry","=)":"smiley","=-)":"smiley",":*":"kiss",":-*":"kiss",":>":"laughing",":->":"laughing","8)":"sunglasses",":\\\\":"confused",":-\\\\":"confused",":/":"confused",":-/":"confused",":|":"neutral_face",":-|":"neutral_face",":o":"open_mouth",":-o":"open_mouth",">:(":"angry",">:-(":"angry",":p":"stuck_out_tongue",":-p":"stuck_out_tongue",":P":"stuck_out_tongue",":-P":"stuck_out_tongue",":b":"stuck_out_tongue",":-b":"stuck_out_tongue",";p":"stuck_out_tongue_winking_eye",";-p":"stuck_out_tongue_winking_eye",";b":"stuck_out_tongue_winking_eye",";-b":"stuck_out_tongue_winking_eye",";P":"stuck_out_tongue_winking_eye",";-P":"stuck_out_tongue_winking_eye",":o)":"monkey_face","D:":"anguished"},Config.inits={},Config.map={},Config.mapcolon={};var a=[];Config.reversemap={},Config.init_emoticons=function(){if(!Config.inits.emoticons){Config.init_colons(),Config.inits.emoticons=1;var a=[];Config.map.emoticons={};for(var b in Config.emoticons_data){var c=b.replace(/\&/g,"&amp;").replace(/\</g,"&lt;").replace(/\>/g,"&gt;");Config.map.colons[emoji.emoticons_data[b]]&&(Config.map.emoticons[c]=Config.map.colons[Config.emoticons_data[b]],a.push(Config.escape_rx(c)))}Config.rx_emoticons=new RegExp("(^|\\s)("+a.join("|")+")(?=$|[\\s|\\?\\.,!])","g")}},Config.init_colons=function(){if(!Config.inits.colons){Config.inits.colons=1,Config.rx_colons=new RegExp(":[^\\s:]+:","g"),Config.map.colons={};for(var a in Config.data)for(var b=0;b<Config.data[a][3].length;b++)Config.map.colons[emoji.data[a][3][b]]=a}},Config.init_unified=function(){Config.inits.unified||(Config.inits.unified=1,buildMap())},Config.escape_rx=function(a){return a.replace(/[-[\]{}()*+?.,\\^$|#\s]/g,"\\$&")},function(a){function b(a){h=a}function c(){i=!0}function d(){return i?(i=!1,""):h}function e(){var a,b,c,e=Array.prototype.slice.call(arguments),f=e.pop(),g=[],h=1==e.length,i=!0,m=d();for(b=0;b<e.length;b++)if(c=e[b]=m+e[b],"xt_"!=c.substr(0,3)&&void 0!==j[c])g.push(j[c]);else if(l){try{a=localStorage.getItem(c)}catch(n){l=!1}try{a=void 0===a||null===a?!1:JSON.parse(a)}catch(n){a=!1}g.push(j[c]=a)}else k?i=!1:g.push(j[c]=!1);return i?f(h?g[0]:g):void chrome.storage.local.get(e,function(a){var d;for(g=[],b=0;b<e.length;b++)c=e[b],d=a[c],d=void 0===d||null===d?!1:JSON.parse(d),g.push(j[c]=d);f(h?g[0]:g)})}function f(a,b){var c,e,f={},g=d();for(c in a)if(a.hasOwnProperty(c))if(e=a[c],c=g+c,j[c]=e,e=JSON.stringify(e),l)try{localStorage.setItem(c,e)}catch(h){l=!1}else f[c]=e;return l||!k?void(b&&b()):void chrome.storage.local.set(f,b)}function g(){var a,b,c,e=Array.prototype.slice.call(arguments),f=d();for("function"==typeof e[e.length-1]&&(c=e.pop()),a=0;a<e.length;a++)if(b=e[a]=f+e[a],delete j[b],l)try{localStorage.removeItem(b)}catch(g){l=!1}k?chrome.storage.local.remove(e,c):c&&c()}var h="",i=!1,j={},k=!!(a.chrome&&chrome.storage&&chrome.storage.local),l=!k&&!!a.localStorage;a.ConfigStorage={prefix:b,noPrefix:c,get:e,set:f,remove:g}}(this),function(a,b,c){var d=1,e=3,f=["p","div","pre","form"],g=27,h=9;a.emojiarea={assetsPath:"",iconSize:25,icons:{}};var i=":joy:,:kissing_heart:,:heart:,:heart_eyes:,:blush:,:grin:,:+1:,:relaxed:,:pensive:,:smile:,:sob:,:kiss:,:unamused:,:flushed:,:stuck_out_tongue_winking_eye:,:see_no_evil:,:wink:,:smiley:,:cry:,:stuck_out_tongue_closed_eyes:,:scream:,:rage:,:smirk:,:disappointed:,:sweat_smile:,:kissing_closed_eyes:,:speak_no_evil:,:relieved:,:grinning:,:yum:,:laughing:,:ok_hand:,:neutral_face:,:confused:".split(",");a.fn.emojiarea=function(b){return b=a.extend({},b),this.each(function(){var d=a(this);if("contentEditable"in c.body&&b.wysiwyg!==!1){var e=getGuid();new m(d,e,a.extend({},b))}else{var e=getGuid();new l(d,e,b)}d.attr({"data-emojiable":"converted","data-id":e,"data-type":"original-input"})})};var j={};j.restoreSelection=function(){return b.getSelection?function(a){var c=b.getSelection();c.removeAllRanges();for(var d=0,e=a.length;e>d;++d)c.addRange(a[d])}:c.selection&&c.selection.createRange?function(a){a&&a.select()}:void 0}(),j.saveSelection=function(){return b.getSelection?function(){var a=b.getSelection(),c=[];if(a.rangeCount)for(var d=0,e=a.rangeCount;e>d;++d)c.push(a.getRangeAt(d));return c}:c.selection&&c.selection.createRange?function(){var a=c.selection;return"none"!==a.type.toLowerCase()?a.createRange():null}:void 0}(),j.replaceSelection=function(){return b.getSelection?function(a){var d,e=b.getSelection(),f="string"==typeof a?c.createTextNode(a):a;e.getRangeAt&&e.rangeCount&&(d=e.getRangeAt(0),d.deleteContents(),d.insertNode(f),d.setStart(f,0),b.setTimeout(function(){d=c.createRange(),d.setStartAfter(f),d.collapse(!0),e.removeAllRanges(),e.addRange(d)},0))}:c.selection&&c.selection.createRange?function(a){var b=c.selection.createRange();"string"==typeof a?b.text=a:b.pasteHTML(a.outerHTML)}:void 0}(),j.insertAtCursor=function(a,b){a=" "+a;var d,e,f,g=b.value;"undefined"!=typeof b.selectionStart&&"undefined"!=typeof b.selectionEnd?(e=b.selectionStart,d=b.selectionEnd,b.value=g.substring(0,e)+a+g.substring(b.selectionEnd),b.selectionStart=b.selectionEnd=e+a.length):"undefined"!=typeof c.selection&&"undefined"!=typeof c.selection.createRange&&(b.focus(),f=c.selection.createRange(),f.text=a,f.select())},j.extend=function(a,b){if("undefined"!=typeof a&&a||(a={}),"object"==typeof b)for(var c in b)b.hasOwnProperty(c)&&(a[c]=b[c]);return a},j.escapeRegex=function(a){return(a+"").replace(/([.?*+^$[\]\\(){}|-])/g,"\\$1")},j.htmlEntities=function(a){return String(a).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")},j.emojiInserted=function(a,b){ConfigStorage.get("emojis_recent",function(b){b=b||i||[];var c=b.indexOf(a);return c?(-1!=c&&b.splice(c,1),b.unshift(a),b.length>42&&(b=b.slice(42)),void ConfigStorage.set({emojis_recent:b})):!1})};var k=function(){};k.prototype.setup=function(){var a=this;this.$editor.on("focus",function(){a.hasFocus=!0}),this.$editor.on("blur",function(){a.hasFocus=!1}),a.emojiMenu=new n(a),this.setupButton()},k.prototype.setupButton=function(){var b=this,c=a("[data-id="+this.id+"][data-type=picker]");c.on("click",function(a){b.emojiMenu.show(b)}),this.$button=c,this.$dontHideOnClick="emoji-picker"},k.createIcon=function(b,c){var d=b[0],e="/assets/emoji_picker/emoji_spritesheet_0-ff6416368a0b344c994727f7b85d7f22f3753b657788f0b5e6b5144c82d23ee5.png",f="/assets/emoji_picker/emoji_spritesheet_1-7ef91a80a62c6d8ff95195f9a08df472c85af35639ac9ddba51ba091030128c4.png",g="/assets/emoji_picker/emoji_spritesheet_2-c38c70d535fff83d9f7958207997972ce2cf128ef34b04425e189fcecaaf7c19.png",h="/assets/emoji_picker/emoji_spritesheet_3-41b52a0290322fea1514a50197b072eef071755d97fa97590630c4610dd68bda.png",i="/assets/emoji_picker/emoji_spritesheet_4-c884b701ca540913c231779c43be90186c2b8cbc683c8932bea5491e3de43387.png",k=b[1],l=b[2],m=b[3],n="/emoji_picker/emoji_spritesheet_!.png",o="/assets/emoji_picker/blank-2f561b02a49376e3679acd5975e3790abdff09ecbadfa1e1858c7ba26e3ffcef.gif",p=c&&Config.Mobile?26:a.emojiarea.iconSize,q=-(p*l),r=-(p*k),s=Config.EmojiCategorySpritesheetDimens[d][1]*p,t=Config.EmojiCategorySpritesheetDimens[d][0]*p,u="display:inline-block;",w=(n.replace("!",d),new RegExp("emoji_spritesheet_"+d)),x=[e,f,g,h,i],y=null,z="";return $.each(x,function(a,b){return y=b.match(w),null!=y?z=y.input:void 0}),u+="width:"+p+"px;",u+="height:"+p+"px;",u+="background:url('"+z+"') "+q+"px "+r+"px no-repeat;",u+="background-size:"+s+"px "+t+"px;",'<img src="'+o+'" class="img" style="'+u+'" alt="'+j.htmlEntities(m)+'">'},a.emojiarea.createIcon=k.createIcon;var l=function(a,b,c){this.options=c,this.$textarea=a,this.$editor=a,this.id=b,this.setup()};l.prototype.insert=function(b){a.emojiarea.icons.hasOwnProperty(b)&&(j.insertAtCursor(b,this.$textarea[0]),j.emojiInserted(b,this.menu),this.$textarea.trigger("change"))},l.prototype.val=function(){return"\n"==this.$textarea?"":this.$textarea.val()},j.extend(l.prototype,k.prototype);var m=function(b,d,e){var f=this;this.options=e||{},"unicode"===a(b).attr("data-emoji-input")?this.options.inputMethod="unicode":this.options.inputMethod="image",this.id=d,this.$textarea=b,this.emojiPopup=e.emojiPopup,this.$editor=a("<div>").addClass("emoji-wysiwyg-editor").addClass(a(b)[0].className),this.$editor.data("self",this),b.attr("maxlength")&&this.$editor.attr("maxlength",b.attr("maxlength"));var g=this.emojiPopup.unicodeToImage(b.val());this.$editor.html(g),this.$editor.attr({"data-id":d,"data-type":"input",placeholder:b.attr("placeholder"),contenteditable:"true"});var h="blur change";this.options.norealTime||(h+=" keyup"),this.$editor.on(h,function(a){return f.onChange.apply(f,[a])}),this.$editor.on("mousedown focus",function(){c.execCommand("enableObjectResizing",!1,!1)}),this.$editor.on("blur",function(){c.execCommand("enableObjectResizing",!0,!0)});var i=this.$editor;this.$editor.on("change keydown keyup resize scroll",function(a){8!=a.which&&i.text().length+i.find("img").length>=i.attr("maxlength")&&a.preventDefault(),f.updateBodyPadding(i)}),b.hide().after(this.$editor),this.$textarea.after("<i class='emoji-picker-icon emoji-picker "+this.options.popupButtonClasses+"' data-id='"+d+"' data-type='picker'></i>"),this.setup(),a(c.body).on("mousedown",function(){f.hasFocus&&(f.selection=j.saveSelection())})};m.prototype.updateBodyPadding=function(b){var c=a("[data-id="+this.id+"][data-type=picker]");a(b).hasScrollbar()?(c.hasClass("parent-has-scroll")||c.addClass("parent-has-scroll"),a(b).hasClass("parent-has-scroll")||a(b).addClass("parent-has-scroll")):(c.hasClass("parent-has-scroll")&&c.removeClass("parent-has-scroll"),a(b).hasClass("parent-has-scroll")&&a(b).removeClass("parent-has-scroll"))},m.prototype.onChange=function(a){this.$textarea.val(this.val()).trigger("change")},m.prototype.insert=function(b){var c="";if("unicode"==this.options.inputMethod)c=this.emojiPopup.colonToUnicode(b);else{var d=a(k.createIcon(a.emojiarea.icons[b]));d[0].attachEvent&&d[0].attachEvent("onresizestart",function(a){a.returnValue=!1},!1),c=d[0]}this.$editor.trigger("focus"),this.selection&&j.restoreSelection(this.selection);try{j.replaceSelection(c)}catch(e){}j.emojiInserted(b,this.menu),this.onChange()},m.prototype.val=function(){for(var a=[],b=[],c=this.emojiPopup,g=function(){a.push(b.join("")),b=[]},h=function(a){if(a.nodeType===e)b.push(a.nodeValue);else if(a.nodeType===d){var c=a.tagName.toLowerCase(),i=-1!==f.indexOf(c);if(i&&b.length&&g(),"img"===c){var j=a.getAttribute("alt")||"";return void(j&&b.push(j))}"br"===c&&g();for(var k=a.childNodes,l=0;l<k.length;l++)h(k[l]);i&&b.length&&g()}},i=this.$editor[0].childNodes,j=0;j<i.length;j++)h(i[j]);b.length&&g();var k=a.join("\n");return c.colonToUnicode(k)},j.extend(m.prototype,k.prototype),jQuery.fn.hasScrollbar=function(){var a=this.get(0).scrollHeight;return this.outerHeight()<a?!0:!1};var n=function(d){var e=this;e.id=d.id;var f=a(c.body),i=a(b);this.visible=!1,this.emojiarea=d,n.menuZIndex=5e3,this.$menu=a("<div>"),this.$menu.addClass("emoji-menu"),this.$menu.attr("data-id",e.id),this.$menu.attr("data-type","menu"),this.$menu.hide(),this.$itemsTailWrap=a('<div class="emoji-items-wrap1"></div>').appendTo(this.$menu),this.$categoryTabs=a('<table class="emoji-menu-tabs"><tr><td><a class="emoji-menu-tab icon-recent" ></a></td><td><a class="emoji-menu-tab icon-smile" ></a></td><td><a class="emoji-menu-tab icon-flower"></a></td><td><a class="emoji-menu-tab icon-bell"></a></td><td><a class="emoji-menu-tab icon-car"></a></td><td><a class="emoji-menu-tab icon-grid"></a></td></tr></table>').appendTo(this.$itemsTailWrap),this.$itemsWrap=a('<div class="emoji-items-wrap nano mobile_scrollable_wrap"></div>').appendTo(this.$itemsTailWrap),this.$items=a('<div class="emoji-items nano-content">').appendTo(this.$itemsWrap),f.append(this.$menu),Config.Mobile||this.$itemsWrap.nanoScroller({preventPageScrolling:!0,tabIndex:-1}),f.on("keydown",function(a){(a.keyCode===g||a.keyCode===h)&&e.hide()}),f.on("message_send",function(a){e.hide()}),f.on("mouseup",function(c){c=c.originalEvent||c;var d=c.originalTarget||c.target||b;if(!a(d).hasClass(e.emojiarea.$dontHideOnClick)){for(;d&&d!=b;)if(d=d.parentNode,d==e.$menu[0]||e.emojiarea&&d==e.emojiarea.$button[0])return;e.hide()}}),i.on("resize",function(){e.visible&&e.reposition()}),this.$menu.on("mouseup","a",function(a){return a.stopPropagation(),!1}),this.$menu.on("click","a",function(c){if(e.emojiarea.updateBodyPadding(e.emojiarea.$editor),a(this).hasClass("emoji-menu-tab"))return e.getTabIndex(this)!==e.currentCategory&&e.selectCategory(e.getTabIndex(this)),!1;var d=a(".label",a(this)).text();return b.setTimeout(function(){e.onItemSelected(d),(c.ctrlKey||c.metaKey)&&e.hide()},0),c.stopPropagation(),!1}),this.selectCategory(0)};n.prototype.getTabIndex=function(a){return this.$categoryTabs.find(".emoji-menu-tab").index(a)},n.prototype.selectCategory=function(a){this.$categoryTabs.find(".emoji-menu-tab").each(function(b){b===a?this.className+="-selected":this.className=this.className.replace("-selected","")}),this.currentCategory=a,this.load(a),Config.Mobile||this.$itemsWrap.nanoScroller({scroll:"top"})},n.prototype.onItemSelected=function(a){this.emojiarea.$editor.text().length+this.emojiarea.$editor.find("img").length>=this.emojiarea.$editor.attr("maxlength")||this.emojiarea.insert(a)},n.prototype.load=function(b){var c=[],d=a.emojiarea.icons,e=a.emojiarea.assetsPath,f=this;e.length&&"/"!==e.charAt(e.length-1)&&(e+="/");var g=function(){f.$items.html(c.join("")),Config.Mobile||setTimeout(function(){f.$itemsWrap.nanoScroller()},100)};if(b>0){for(var h in d)d.hasOwnProperty(h)&&d[h][0]===b-1&&c.push('<a href="javascript:void(0)" title="'+j.htmlEntities(h)+'">'+k.createIcon(d[h],!0)+'<span class="label">'+j.htmlEntities(h)+"</span></a>");g()}else ConfigStorage.get("emojis_recent",function(a){a=a||i||[];var b,e;for(e=0;e<a.length;e++)b=a[e],d[b]&&c.push('<a href="javascript:void(0)" title="'+j.htmlEntities(b)+'">'+k.createIcon(d[b],!0)+'<span class="label">'+j.htmlEntities(b)+"</span></a>");g()})},n.prototype.reposition=function(){this.tether||(this.tether=new Tether({element:'[data-id="'+this.id+'"][data-type="menu"]',target:'[data-id="'+this.id+'"][data-type="picker"]',attachment:"left center",targetAttachment:"bottom left",offset:"0 12px",constraints:[{to:"html",pin:!0}]}))},n.prototype.hide=function(a){this.visible=!1,this.$menu.hide("fast")},n.prototype.show=function(b){return this.visible?this.hide():(this.reposition(),a(this.$menu).css("z-index",++n.menuZIndex),this.$menu.show("fast"),this.currentCategory||this.load(0),void(this.visible=!0))}}(jQuery,window,document),function(){this.EmojiPicker=function(){function a(a){var b,c;null==a&&(a={}),$.emojiarea.iconSize=null!=(b=a.iconSize)?b:25,$.emojiarea.assetsPath=null!=(c=a.assetsPath)?c:"",this.generateEmojiIconSets(a),a.emojiable_selector||(a.emojiable_selector="[data-emojiable=true]"),this.options=a}return a.prototype.discover=function(){var a;return(a=/iPad|iPhone|iPod/.test(navigator.userAgent)&&!window.MSStream)?void 0:$(this.options.emojiable_selector).emojiarea($.extend({emojiPopup:this,norealTime:!0},this.options))},a.prototype.generateEmojiIconSets=function(a){var b,c,d,e,f,g,h,i,j,k;for(f={},i={},e=void 0,g=void 0,d=void 0,h=void 0,c=void 0,j=void 0,b=void 0,k=void 0,g=0;g<Config.EmojiCategories.length;){for(k=Config.EmojiCategorySpritesheetDimens[g][1],e=0;e<Config.EmojiCategories[g].length;)c=Config.Emoji[Config.EmojiCategories[g][e]],h=c[1][0],j=Math.floor(e/k),b=e%k,f[":"+h+":"]=[g,j,b,":"+h+":"],i[h]=c[0],e++;g++}return $.emojiarea.icons=f,$.emojiarea.reverseIcons=i},a.prototype.colonToUnicode=function(a){return a?(Config.rx_colons||Config.init_unified(),a.replace(Config.rx_colons,function(a){var b;return b=Config.mapcolon[a],b?b:""})):""},a.prototype.unicodeToImage=function(a){return a?(Config.rx_codes||Config.init_unified(),a.replace(Config.rx_codes,function(a){var b,c;return c=Config.reversemap[a],c?(c=":"+c+":",b=$.emojiarea.createIcon($.emojiarea.icons[c])):""})):""},a.prototype.colonToImage=function(a){return a?(Config.rx_colons||Config.init_unified(),a.replace(Config.rx_colons,function(a){var b;return a?b=$.emojiarea.createIcon($.emojiarea.icons[a]):""})):""},a}()}.call(this);
$(function () {
  window.emojiPicker = new EmojiPicker({
    emojiable_selector: '[data-emojiable=true]',
    assetsPath: '/assets/emoji_picker',
    popupButtonClasses: 'fa fa-smile-o',
  });
  window.emojiPicker.discover();
});


(function($, undefined) {

/**
 * Unobtrusive scripting adapter for jQuery
 * https://github.com/rails/jquery-ujs
 *
 * Requires jQuery 1.8.0 or later.
 *
 * Released under the MIT license
 *
 */

  // Cut down on the number of issues from people inadvertently including jquery_ujs twice
  // by detecting and raising an error when it happens.
  'use strict';

  if ( $.rails !== undefined ) {
    $.error('jquery-ujs has already been loaded!');
  }

  // Shorthand to make it a little easier to call public rails functions from within rails.js
  var rails;
  var $document = $(document);

  $.rails = rails = {
    // Link elements bound by jquery-ujs
    linkClickSelector: 'a[data-confirm], a[data-method], a[data-remote]:not([disabled]), a[data-disable-with], a[data-disable]',

    // Button elements bound by jquery-ujs
    buttonClickSelector: 'button[data-remote]:not([form]):not(form button), button[data-confirm]:not([form]):not(form button)',

    // Select elements bound by jquery-ujs
    inputChangeSelector: 'select[data-remote], input[data-remote], textarea[data-remote]',

    // Form elements bound by jquery-ujs
    formSubmitSelector: 'form',

    // Form input elements bound by jquery-ujs
    formInputClickSelector: 'form input[type=submit], form input[type=image], form button[type=submit], form button:not([type]), input[type=submit][form], input[type=image][form], button[type=submit][form], button[form]:not([type])',

    // Form input elements disabled during form submission
    disableSelector: 'input[data-disable-with]:enabled, button[data-disable-with]:enabled, textarea[data-disable-with]:enabled, input[data-disable]:enabled, button[data-disable]:enabled, textarea[data-disable]:enabled',

    // Form input elements re-enabled after form submission
    enableSelector: 'input[data-disable-with]:disabled, button[data-disable-with]:disabled, textarea[data-disable-with]:disabled, input[data-disable]:disabled, button[data-disable]:disabled, textarea[data-disable]:disabled',

    // Form required input elements
    requiredInputSelector: 'input[name][required]:not([disabled]), textarea[name][required]:not([disabled])',

    // Form file input elements
    fileInputSelector: 'input[name][type=file]:not([disabled])',

    // Link onClick disable selector with possible reenable after remote submission
    linkDisableSelector: 'a[data-disable-with], a[data-disable]',

    // Button onClick disable selector with possible reenable after remote submission
    buttonDisableSelector: 'button[data-remote][data-disable-with], button[data-remote][data-disable]',

    // Up-to-date Cross-Site Request Forgery token
    csrfToken: function() {
     return $('meta[name=csrf-token]').attr('content');
    },

    // URL param that must contain the CSRF token
    csrfParam: function() {
     return $('meta[name=csrf-param]').attr('content');
    },

    // Make sure that every Ajax request sends the CSRF token
    CSRFProtection: function(xhr) {
      var token = rails.csrfToken();
      if (token) xhr.setRequestHeader('X-CSRF-Token', token);
    },

    // Make sure that all forms have actual up-to-date tokens (cached forms contain old ones)
    refreshCSRFTokens: function(){
      $('form input[name="' + rails.csrfParam() + '"]').val(rails.csrfToken());
    },

    // Triggers an event on an element and returns false if the event result is false
    fire: function(obj, name, data) {
      var event = $.Event(name);
      obj.trigger(event, data);
      return event.result !== false;
    },

    // Default confirm dialog, may be overridden with custom confirm dialog in $.rails.confirm
    confirm: function(message) {
      return confirm(message);
    },

    // Default ajax function, may be overridden with custom function in $.rails.ajax
    ajax: function(options) {
      return $.ajax(options);
    },

    // Default way to get an element's href. May be overridden at $.rails.href.
    href: function(element) {
      return element[0].href;
    },

    // Checks "data-remote" if true to handle the request through a XHR request.
    isRemote: function(element) {
      return element.data('remote') !== undefined && element.data('remote') !== false;
    },

    // Submits "remote" forms and links with ajax
    handleRemote: function(element) {
      var method, url, data, withCredentials, dataType, options;

      if (rails.fire(element, 'ajax:before')) {
        withCredentials = element.data('with-credentials') || null;
        dataType = element.data('type') || ($.ajaxSettings && $.ajaxSettings.dataType);

        if (element.is('form')) {
          method = element.data('ujs:submit-button-formmethod') || element.attr('method');
          url = element.data('ujs:submit-button-formaction') || element.attr('action');
          data = $(element[0]).serializeArray();
          // memoized value from clicked submit button
          var button = element.data('ujs:submit-button');
          if (button) {
            data.push(button);
            element.data('ujs:submit-button', null);
          }
          element.data('ujs:submit-button-formmethod', null);
          element.data('ujs:submit-button-formaction', null);
        } else if (element.is(rails.inputChangeSelector)) {
          method = element.data('method');
          url = element.data('url');
          data = element.serialize();
          if (element.data('params')) data = data + '&' + element.data('params');
        } else if (element.is(rails.buttonClickSelector)) {
          method = element.data('method') || 'get';
          url = element.data('url');
          data = element.serialize();
          if (element.data('params')) data = data + '&' + element.data('params');
        } else {
          method = element.data('method');
          url = rails.href(element);
          data = element.data('params') || null;
        }

        options = {
          type: method || 'GET', data: data, dataType: dataType,
          // stopping the "ajax:beforeSend" event will cancel the ajax request
          beforeSend: function(xhr, settings) {
            if (settings.dataType === undefined) {
              xhr.setRequestHeader('accept', '*/*;q=0.5, ' + settings.accepts.script);
            }
            if (rails.fire(element, 'ajax:beforeSend', [xhr, settings])) {
              element.trigger('ajax:send', xhr);
            } else {
              return false;
            }
          },
          success: function(data, status, xhr) {
            element.trigger('ajax:success', [data, status, xhr]);
          },
          complete: function(xhr, status) {
            element.trigger('ajax:complete', [xhr, status]);
          },
          error: function(xhr, status, error) {
            element.trigger('ajax:error', [xhr, status, error]);
          },
          crossDomain: rails.isCrossDomain(url)
        };

        // There is no withCredentials for IE6-8 when
        // "Enable native XMLHTTP support" is disabled
        if (withCredentials) {
          options.xhrFields = {
            withCredentials: withCredentials
          };
        }

        // Only pass url to `ajax` options if not blank
        if (url) { options.url = url; }

        return rails.ajax(options);
      } else {
        return false;
      }
    },

    // Determines if the request is a cross domain request.
    isCrossDomain: function(url) {
      var originAnchor = document.createElement('a');
      originAnchor.href = location.href;
      var urlAnchor = document.createElement('a');

      try {
        urlAnchor.href = url;
        // This is a workaround to a IE bug.
        urlAnchor.href = urlAnchor.href;

        // If URL protocol is false or is a string containing a single colon
        // *and* host are false, assume it is not a cross-domain request
        // (should only be the case for IE7 and IE compatibility mode).
        // Otherwise, evaluate protocol and host of the URL against the origin
        // protocol and host.
        return !(((!urlAnchor.protocol || urlAnchor.protocol === ':') && !urlAnchor.host) ||
          (originAnchor.protocol + '//' + originAnchor.host ===
            urlAnchor.protocol + '//' + urlAnchor.host));
      } catch (e) {
        // If there is an error parsing the URL, assume it is crossDomain.
        return true;
      }
    },

    // Handles "data-method" on links such as:
    // <a href="/users/5" data-method="delete" rel="nofollow" data-confirm="Are you sure?">Delete</a>
    handleMethod: function(link) {
      var href = rails.href(link),
        method = link.data('method'),
        target = link.attr('target'),
        csrfToken = rails.csrfToken(),
        csrfParam = rails.csrfParam(),
        form = $('<form method="post" action="' + href + '"></form>'),
        metadataInput = '<input name="_method" value="' + method + '" type="hidden" />';

      if (csrfParam !== undefined && csrfToken !== undefined && !rails.isCrossDomain(href)) {
        metadataInput += '<input name="' + csrfParam + '" value="' + csrfToken + '" type="hidden" />';
      }

      if (target) { form.attr('target', target); }

      form.hide().append(metadataInput).appendTo('body');
      form.submit();
    },

    // Helper function that returns form elements that match the specified CSS selector
    // If form is actually a "form" element this will return associated elements outside the from that have
    // the html form attribute set
    formElements: function(form, selector) {
      return form.is('form') ? $(form[0].elements).filter(selector) : form.find(selector);
    },

    /* Disables form elements:
      - Caches element value in 'ujs:enable-with' data store
      - Replaces element text with value of 'data-disable-with' attribute
      - Sets disabled property to true
    */
    disableFormElements: function(form) {
      rails.formElements(form, rails.disableSelector).each(function() {
        rails.disableFormElement($(this));
      });
    },

    disableFormElement: function(element) {
      var method, replacement;

      method = element.is('button') ? 'html' : 'val';
      replacement = element.data('disable-with');

      if (replacement !== undefined) {
        element.data('ujs:enable-with', element[method]());
        element[method](replacement);
      }

      element.prop('disabled', true);
      element.data('ujs:disabled', true);
    },

    /* Re-enables disabled form elements:
      - Replaces element text with cached value from 'ujs:enable-with' data store (created in `disableFormElements`)
      - Sets disabled property to false
    */
    enableFormElements: function(form) {
      rails.formElements(form, rails.enableSelector).each(function() {
        rails.enableFormElement($(this));
      });
    },

    enableFormElement: function(element) {
      var method = element.is('button') ? 'html' : 'val';
      if (element.data('ujs:enable-with') !== undefined) {
        element[method](element.data('ujs:enable-with'));
        element.removeData('ujs:enable-with'); // clean up cache
      }
      element.prop('disabled', false);
      element.removeData('ujs:disabled');
    },

   /* For 'data-confirm' attribute:
      - Fires `confirm` event
      - Shows the confirmation dialog
      - Fires the `confirm:complete` event

      Returns `true` if no function stops the chain and user chose yes; `false` otherwise.
      Attaching a handler to the element's `confirm` event that returns a `falsy` value cancels the confirmation dialog.
      Attaching a handler to the element's `confirm:complete` event that returns a `falsy` value makes this function
      return false. The `confirm:complete` event is fired whether or not the user answered true or false to the dialog.
   */
    allowAction: function(element) {
      var message = element.data('confirm'),
          answer = false, callback;
      if (!message) { return true; }

      if (rails.fire(element, 'confirm')) {
        try {
          answer = rails.confirm(message);
        } catch (e) {
          (console.error || console.log).call(console, e.stack || e);
        }
        callback = rails.fire(element, 'confirm:complete', [answer]);
      }
      return answer && callback;
    },

    // Helper function which checks for blank inputs in a form that match the specified CSS selector
    blankInputs: function(form, specifiedSelector, nonBlank) {
      var foundInputs = $(),
        input,
        valueToCheck,
        radiosForNameWithNoneSelected,
        radioName,
        selector = specifiedSelector || 'input,textarea',
        requiredInputs = form.find(selector),
        checkedRadioButtonNames = {};

      requiredInputs.each(function() {
        input = $(this);
        if (input.is('input[type=radio]')) {

          // Don't count unchecked required radio as blank if other radio with same name is checked,
          // regardless of whether same-name radio input has required attribute or not. The spec
          // states https://www.w3.org/TR/html5/forms.html#the-required-attribute
          radioName = input.attr('name');

          // Skip if we've already seen the radio with this name.
          if (!checkedRadioButtonNames[radioName]) {

            // If none checked
            if (form.find('input[type=radio]:checked[name="' + radioName + '"]').length === 0) {
              radiosForNameWithNoneSelected = form.find(
                'input[type=radio][name="' + radioName + '"]');
              foundInputs = foundInputs.add(radiosForNameWithNoneSelected);
            }

            // We only need to check each name once.
            checkedRadioButtonNames[radioName] = radioName;
          }
        } else {
          valueToCheck = input.is('input[type=checkbox],input[type=radio]') ? input.is(':checked') : !!input.val();
          if (valueToCheck === nonBlank) {
            foundInputs = foundInputs.add(input);
          }
        }
      });
      return foundInputs.length ? foundInputs : false;
    },

    // Helper function which checks for non-blank inputs in a form that match the specified CSS selector
    nonBlankInputs: function(form, specifiedSelector) {
      return rails.blankInputs(form, specifiedSelector, true); // true specifies nonBlank
    },

    // Helper function, needed to provide consistent behavior in IE
    stopEverything: function(e) {
      $(e.target).trigger('ujs:everythingStopped');
      e.stopImmediatePropagation();
      return false;
    },

    //  Replace element's html with the 'data-disable-with' after storing original html
    //  and prevent clicking on it
    disableElement: function(element) {
      var replacement = element.data('disable-with');

      if (replacement !== undefined) {
        element.data('ujs:enable-with', element.html()); // store enabled state
        element.html(replacement);
      }

      element.bind('click.railsDisable', function(e) { // prevent further clicking
        return rails.stopEverything(e);
      });
      element.data('ujs:disabled', true);
    },

    // Restore element to its original state which was disabled by 'disableElement' above
    enableElement: function(element) {
      if (element.data('ujs:enable-with') !== undefined) {
        element.html(element.data('ujs:enable-with')); // set to old enabled state
        element.removeData('ujs:enable-with'); // clean up cache
      }
      element.unbind('click.railsDisable'); // enable element
      element.removeData('ujs:disabled');
    }
  };

  if (rails.fire($document, 'rails:attachBindings')) {

    $.ajaxPrefilter(function(options, originalOptions, xhr){ if ( !options.crossDomain ) { rails.CSRFProtection(xhr); }});

    // This event works the same as the load event, except that it fires every
    // time the page is loaded.
    //
    // See https://github.com/rails/jquery-ujs/issues/357
    // See https://developer.mozilla.org/en-US/docs/Using_Firefox_1.5_caching
    $(window).on('pageshow.rails', function () {
      $($.rails.enableSelector).each(function () {
        var element = $(this);

        if (element.data('ujs:disabled')) {
          $.rails.enableFormElement(element);
        }
      });

      $($.rails.linkDisableSelector).each(function () {
        var element = $(this);

        if (element.data('ujs:disabled')) {
          $.rails.enableElement(element);
        }
      });
    });

    $document.on('ajax:complete', rails.linkDisableSelector, function() {
        rails.enableElement($(this));
    });

    $document.on('ajax:complete', rails.buttonDisableSelector, function() {
        rails.enableFormElement($(this));
    });

    $document.on('click.rails', rails.linkClickSelector, function(e) {
      var link = $(this), method = link.data('method'), data = link.data('params'), metaClick = e.metaKey || e.ctrlKey;
      if (!rails.allowAction(link)) return rails.stopEverything(e);

      if (!metaClick && link.is(rails.linkDisableSelector)) rails.disableElement(link);

      if (rails.isRemote(link)) {
        if (metaClick && (!method || method === 'GET') && !data) { return true; }

        var handleRemote = rails.handleRemote(link);
        // Response from rails.handleRemote() will either be false or a deferred object promise.
        if (handleRemote === false) {
          rails.enableElement(link);
        } else {
          handleRemote.fail( function() { rails.enableElement(link); } );
        }
        return false;

      } else if (method) {
        rails.handleMethod(link);
        return false;
      }
    });

    $document.on('click.rails', rails.buttonClickSelector, function(e) {
      var button = $(this);

      if (!rails.allowAction(button) || !rails.isRemote(button)) return rails.stopEverything(e);

      if (button.is(rails.buttonDisableSelector)) rails.disableFormElement(button);

      var handleRemote = rails.handleRemote(button);
      // Response from rails.handleRemote() will either be false or a deferred object promise.
      if (handleRemote === false) {
        rails.enableFormElement(button);
      } else {
        handleRemote.fail( function() { rails.enableFormElement(button); } );
      }
      return false;
    });

    $document.on('change.rails', rails.inputChangeSelector, function(e) {
      var link = $(this);
      if (!rails.allowAction(link) || !rails.isRemote(link)) return rails.stopEverything(e);

      rails.handleRemote(link);
      return false;
    });

    $document.on('submit.rails', rails.formSubmitSelector, function(e) {
      var form = $(this),
        remote = rails.isRemote(form),
        blankRequiredInputs,
        nonBlankFileInputs;

      if (!rails.allowAction(form)) return rails.stopEverything(e);

      // Skip other logic when required values are missing or file upload is present
      if (form.attr('novalidate') === undefined) {
        if (form.data('ujs:formnovalidate-button') === undefined) {
          blankRequiredInputs = rails.blankInputs(form, rails.requiredInputSelector, false);
          if (blankRequiredInputs && rails.fire(form, 'ajax:aborted:required', [blankRequiredInputs])) {
            return rails.stopEverything(e);
          }
        } else {
          // Clear the formnovalidate in case the next button click is not on a formnovalidate button
          // Not strictly necessary to do here, since it is also reset on each button click, but just to be certain
          form.data('ujs:formnovalidate-button', undefined);
        }
      }

      if (remote) {
        nonBlankFileInputs = rails.nonBlankInputs(form, rails.fileInputSelector);
        if (nonBlankFileInputs) {
          // Slight timeout so that the submit button gets properly serialized
          // (make it easy for event handler to serialize form without disabled values)
          setTimeout(function(){ rails.disableFormElements(form); }, 13);
          var aborted = rails.fire(form, 'ajax:aborted:file', [nonBlankFileInputs]);

          // Re-enable form elements if event bindings return false (canceling normal form submission)
          if (!aborted) { setTimeout(function(){ rails.enableFormElements(form); }, 13); }

          return aborted;
        }

        rails.handleRemote(form);
        return false;

      } else {
        // Slight timeout so that the submit button gets properly serialized
        setTimeout(function(){ rails.disableFormElements(form); }, 13);
      }
    });

    $document.on('click.rails', rails.formInputClickSelector, function(event) {
      var button = $(this);

      if (!rails.allowAction(button)) return rails.stopEverything(event);

      // Register the pressed submit button
      var name = button.attr('name'),
        data = name ? {name:name, value:button.val()} : null;

      var form = button.closest('form');
      if (form.length === 0) {
        form = $('#' + button.attr('form'));
      }
      form.data('ujs:submit-button', data);

      // Save attributes from button
      form.data('ujs:formnovalidate-button', button.attr('formnovalidate'));
      form.data('ujs:submit-button-formaction', button.attr('formaction'));
      form.data('ujs:submit-button-formmethod', button.attr('formmethod'));
    });

    $document.on('ajax:send.rails', rails.formSubmitSelector, function(event) {
      if (this === event.target) rails.disableFormElements($(this));
    });

    $document.on('ajax:complete.rails', rails.formSubmitSelector, function(event) {
      if (this === event.target) rails.enableFormElements($(this));
    });

    $(function(){
      rails.refreshCSRFTokens();
    });
  }

})( jQuery );
/*!
 * Bootstrap v4.0.0-alpha.6 (https://getbootstrap.com)
 * Copyright 2011-2017 The Bootstrap Authors (https://github.com/twbs/bootstrap/graphs/contributors)
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 */

if("undefined"==typeof jQuery)throw new Error("Bootstrap's JavaScript requires jQuery. jQuery must be included before Bootstrap's JavaScript.");+function(t){var e=t.fn.jquery.split(" ")[0].split(".");if(e[0]<2&&e[1]<9||1==e[0]&&9==e[1]&&e[2]<1||e[0]>=4)throw new Error("Bootstrap's JavaScript requires at least jQuery v1.9.1 but less than v4.0.0")}(jQuery),+function(){function t(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!e||"object"!=typeof e&&"function"!=typeof e?t:e}function e(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e)}function n(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}var i="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},o=function(){function t(t,e){for(var n=0;n<e.length;n++){var i=e[n];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(t,i.key,i)}}return function(e,n,i){return n&&t(e.prototype,n),i&&t(e,i),e}}(),r=function(t){function e(t){return{}.toString.call(t).match(/\s([a-zA-Z]+)/)[1].toLowerCase()}function n(t){return(t[0]||t).nodeType}function i(){return{bindType:a.end,delegateType:a.end,handle:function(e){if(t(e.target).is(this))return e.handleObj.handler.apply(this,arguments)}}}function o(){if(window.QUnit)return!1;var t=document.createElement("bootstrap");for(var e in h)if(void 0!==t.style[e])return{end:h[e]};return!1}function r(e){var n=this,i=!1;return t(this).one(c.TRANSITION_END,function(){i=!0}),setTimeout(function(){i||c.triggerTransitionEnd(n)},e),this}function s(){a=o(),t.fn.emulateTransitionEnd=r,c.supportsTransitionEnd()&&(t.event.special[c.TRANSITION_END]=i())}var a=!1,l=1e6,h={WebkitTransition:"webkitTransitionEnd",MozTransition:"transitionend",OTransition:"oTransitionEnd otransitionend",transition:"transitionend"},c={TRANSITION_END:"bsTransitionEnd",getUID:function(t){do t+=~~(Math.random()*l);while(document.getElementById(t));return t},getSelectorFromElement:function(t){var e=t.getAttribute("data-target");return e||(e=t.getAttribute("href")||"",e=/^#[a-z]/i.test(e)?e:null),e},reflow:function(t){return t.offsetHeight},triggerTransitionEnd:function(e){t(e).trigger(a.end)},supportsTransitionEnd:function(){return Boolean(a)},typeCheckConfig:function(t,i,o){for(var r in o)if(o.hasOwnProperty(r)){var s=o[r],a=i[r],l=a&&n(a)?"element":e(a);if(!new RegExp(s).test(l))throw new Error(t.toUpperCase()+": "+('Option "'+r+'" provided type "'+l+'" ')+('but expected type "'+s+'".'))}}};return s(),c}(jQuery),s=(function(t){var e="alert",i="4.0.0-alpha.6",s="bs.alert",a="."+s,l=".data-api",h=t.fn[e],c=150,u={DISMISS:'[data-dismiss="alert"]'},d={CLOSE:"close"+a,CLOSED:"closed"+a,CLICK_DATA_API:"click"+a+l},f={ALERT:"alert",FADE:"fade",SHOW:"show"},_=function(){function e(t){n(this,e),this._element=t}return e.prototype.close=function(t){t=t||this._element;var e=this._getRootElement(t),n=this._triggerCloseEvent(e);n.isDefaultPrevented()||this._removeElement(e)},e.prototype.dispose=function(){t.removeData(this._element,s),this._element=null},e.prototype._getRootElement=function(e){var n=r.getSelectorFromElement(e),i=!1;return n&&(i=t(n)[0]),i||(i=t(e).closest("."+f.ALERT)[0]),i},e.prototype._triggerCloseEvent=function(e){var n=t.Event(d.CLOSE);return t(e).trigger(n),n},e.prototype._removeElement=function(e){var n=this;return t(e).removeClass(f.SHOW),r.supportsTransitionEnd()&&t(e).hasClass(f.FADE)?void t(e).one(r.TRANSITION_END,function(t){return n._destroyElement(e,t)}).emulateTransitionEnd(c):void this._destroyElement(e)},e.prototype._destroyElement=function(e){t(e).detach().trigger(d.CLOSED).remove()},e._jQueryInterface=function(n){return this.each(function(){var i=t(this),o=i.data(s);o||(o=new e(this),i.data(s,o)),"close"===n&&o[n](this)})},e._handleDismiss=function(t){return function(e){e&&e.preventDefault(),t.close(this)}},o(e,null,[{key:"VERSION",get:function(){return i}}]),e}();return t(document).on(d.CLICK_DATA_API,u.DISMISS,_._handleDismiss(new _)),t.fn[e]=_._jQueryInterface,t.fn[e].Constructor=_,t.fn[e].noConflict=function(){return t.fn[e]=h,_._jQueryInterface},_}(jQuery),function(t){var e="button",i="4.0.0-alpha.6",r="bs.button",s="."+r,a=".data-api",l=t.fn[e],h={ACTIVE:"active",BUTTON:"btn",FOCUS:"focus"},c={DATA_TOGGLE_CARROT:'[data-toggle^="button"]',DATA_TOGGLE:'[data-toggle="buttons"]',INPUT:"input",ACTIVE:".active",BUTTON:".btn"},u={CLICK_DATA_API:"click"+s+a,FOCUS_BLUR_DATA_API:"focus"+s+a+" "+("blur"+s+a)},d=function(){function e(t){n(this,e),this._element=t}return e.prototype.toggle=function(){var e=!0,n=t(this._element).closest(c.DATA_TOGGLE)[0];if(n){var i=t(this._element).find(c.INPUT)[0];if(i){if("radio"===i.type)if(i.checked&&t(this._element).hasClass(h.ACTIVE))e=!1;else{var o=t(n).find(c.ACTIVE)[0];o&&t(o).removeClass(h.ACTIVE)}e&&(i.checked=!t(this._element).hasClass(h.ACTIVE),t(i).trigger("change")),i.focus()}}this._element.setAttribute("aria-pressed",!t(this._element).hasClass(h.ACTIVE)),e&&t(this._element).toggleClass(h.ACTIVE)},e.prototype.dispose=function(){t.removeData(this._element,r),this._element=null},e._jQueryInterface=function(n){return this.each(function(){var i=t(this).data(r);i||(i=new e(this),t(this).data(r,i)),"toggle"===n&&i[n]()})},o(e,null,[{key:"VERSION",get:function(){return i}}]),e}();return t(document).on(u.CLICK_DATA_API,c.DATA_TOGGLE_CARROT,function(e){e.preventDefault();var n=e.target;t(n).hasClass(h.BUTTON)||(n=t(n).closest(c.BUTTON)),d._jQueryInterface.call(t(n),"toggle")}).on(u.FOCUS_BLUR_DATA_API,c.DATA_TOGGLE_CARROT,function(e){var n=t(e.target).closest(c.BUTTON)[0];t(n).toggleClass(h.FOCUS,/^focus(in)?$/.test(e.type))}),t.fn[e]=d._jQueryInterface,t.fn[e].Constructor=d,t.fn[e].noConflict=function(){return t.fn[e]=l,d._jQueryInterface},d}(jQuery),function(t){var e="carousel",s="4.0.0-alpha.6",a="bs.carousel",l="."+a,h=".data-api",c=t.fn[e],u=600,d=37,f=39,_={interval:5e3,keyboard:!0,slide:!1,pause:"hover",wrap:!0},g={interval:"(number|boolean)",keyboard:"boolean",slide:"(boolean|string)",pause:"(string|boolean)",wrap:"boolean"},p={NEXT:"next",PREV:"prev",LEFT:"left",RIGHT:"right"},m={SLIDE:"slide"+l,SLID:"slid"+l,KEYDOWN:"keydown"+l,MOUSEENTER:"mouseenter"+l,MOUSELEAVE:"mouseleave"+l,LOAD_DATA_API:"load"+l+h,CLICK_DATA_API:"click"+l+h},E={CAROUSEL:"carousel",ACTIVE:"active",SLIDE:"slide",RIGHT:"carousel-item-right",LEFT:"carousel-item-left",NEXT:"carousel-item-next",PREV:"carousel-item-prev",ITEM:"carousel-item"},v={ACTIVE:".active",ACTIVE_ITEM:".active.carousel-item",ITEM:".carousel-item",NEXT_PREV:".carousel-item-next, .carousel-item-prev",INDICATORS:".carousel-indicators",DATA_SLIDE:"[data-slide], [data-slide-to]",DATA_RIDE:'[data-ride="carousel"]'},T=function(){function h(e,i){n(this,h),this._items=null,this._interval=null,this._activeElement=null,this._isPaused=!1,this._isSliding=!1,this._config=this._getConfig(i),this._element=t(e)[0],this._indicatorsElement=t(this._element).find(v.INDICATORS)[0],this._addEventListeners()}return h.prototype.next=function(){if(this._isSliding)throw new Error("Carousel is sliding");this._slide(p.NEXT)},h.prototype.nextWhenVisible=function(){document.hidden||this.next()},h.prototype.prev=function(){if(this._isSliding)throw new Error("Carousel is sliding");this._slide(p.PREVIOUS)},h.prototype.pause=function(e){e||(this._isPaused=!0),t(this._element).find(v.NEXT_PREV)[0]&&r.supportsTransitionEnd()&&(r.triggerTransitionEnd(this._element),this.cycle(!0)),clearInterval(this._interval),this._interval=null},h.prototype.cycle=function(t){t||(this._isPaused=!1),this._interval&&(clearInterval(this._interval),this._interval=null),this._config.interval&&!this._isPaused&&(this._interval=setInterval((document.visibilityState?this.nextWhenVisible:this.next).bind(this),this._config.interval))},h.prototype.to=function(e){var n=this;this._activeElement=t(this._element).find(v.ACTIVE_ITEM)[0];var i=this._getItemIndex(this._activeElement);if(!(e>this._items.length-1||e<0)){if(this._isSliding)return void t(this._element).one(m.SLID,function(){return n.to(e)});if(i===e)return this.pause(),void this.cycle();var o=e>i?p.NEXT:p.PREVIOUS;this._slide(o,this._items[e])}},h.prototype.dispose=function(){t(this._element).off(l),t.removeData(this._element,a),this._items=null,this._config=null,this._element=null,this._interval=null,this._isPaused=null,this._isSliding=null,this._activeElement=null,this._indicatorsElement=null},h.prototype._getConfig=function(n){return n=t.extend({},_,n),r.typeCheckConfig(e,n,g),n},h.prototype._addEventListeners=function(){var e=this;this._config.keyboard&&t(this._element).on(m.KEYDOWN,function(t){return e._keydown(t)}),"hover"!==this._config.pause||"ontouchstart"in document.documentElement||t(this._element).on(m.MOUSEENTER,function(t){return e.pause(t)}).on(m.MOUSELEAVE,function(t){return e.cycle(t)})},h.prototype._keydown=function(t){if(!/input|textarea/i.test(t.target.tagName))switch(t.which){case d:t.preventDefault(),this.prev();break;case f:t.preventDefault(),this.next();break;default:return}},h.prototype._getItemIndex=function(e){return this._items=t.makeArray(t(e).parent().find(v.ITEM)),this._items.indexOf(e)},h.prototype._getItemByDirection=function(t,e){var n=t===p.NEXT,i=t===p.PREVIOUS,o=this._getItemIndex(e),r=this._items.length-1,s=i&&0===o||n&&o===r;if(s&&!this._config.wrap)return e;var a=t===p.PREVIOUS?-1:1,l=(o+a)%this._items.length;return l===-1?this._items[this._items.length-1]:this._items[l]},h.prototype._triggerSlideEvent=function(e,n){var i=t.Event(m.SLIDE,{relatedTarget:e,direction:n});return t(this._element).trigger(i),i},h.prototype._setActiveIndicatorElement=function(e){if(this._indicatorsElement){t(this._indicatorsElement).find(v.ACTIVE).removeClass(E.ACTIVE);var n=this._indicatorsElement.children[this._getItemIndex(e)];n&&t(n).addClass(E.ACTIVE)}},h.prototype._slide=function(e,n){var i=this,o=t(this._element).find(v.ACTIVE_ITEM)[0],s=n||o&&this._getItemByDirection(e,o),a=Boolean(this._interval),l=void 0,h=void 0,c=void 0;if(e===p.NEXT?(l=E.LEFT,h=E.NEXT,c=p.LEFT):(l=E.RIGHT,h=E.PREV,c=p.RIGHT),s&&t(s).hasClass(E.ACTIVE))return void(this._isSliding=!1);var d=this._triggerSlideEvent(s,c);if(!d.isDefaultPrevented()&&o&&s){this._isSliding=!0,a&&this.pause(),this._setActiveIndicatorElement(s);var f=t.Event(m.SLID,{relatedTarget:s,direction:c});r.supportsTransitionEnd()&&t(this._element).hasClass(E.SLIDE)?(t(s).addClass(h),r.reflow(s),t(o).addClass(l),t(s).addClass(l),t(o).one(r.TRANSITION_END,function(){t(s).removeClass(l+" "+h).addClass(E.ACTIVE),t(o).removeClass(E.ACTIVE+" "+h+" "+l),i._isSliding=!1,setTimeout(function(){return t(i._element).trigger(f)},0)}).emulateTransitionEnd(u)):(t(o).removeClass(E.ACTIVE),t(s).addClass(E.ACTIVE),this._isSliding=!1,t(this._element).trigger(f)),a&&this.cycle()}},h._jQueryInterface=function(e){return this.each(function(){var n=t(this).data(a),o=t.extend({},_,t(this).data());"object"===("undefined"==typeof e?"undefined":i(e))&&t.extend(o,e);var r="string"==typeof e?e:o.slide;if(n||(n=new h(this,o),t(this).data(a,n)),"number"==typeof e)n.to(e);else if("string"==typeof r){if(void 0===n[r])throw new Error('No method named "'+r+'"');n[r]()}else o.interval&&(n.pause(),n.cycle())})},h._dataApiClickHandler=function(e){var n=r.getSelectorFromElement(this);if(n){var i=t(n)[0];if(i&&t(i).hasClass(E.CAROUSEL)){var o=t.extend({},t(i).data(),t(this).data()),s=this.getAttribute("data-slide-to");s&&(o.interval=!1),h._jQueryInterface.call(t(i),o),s&&t(i).data(a).to(s),e.preventDefault()}}},o(h,null,[{key:"VERSION",get:function(){return s}},{key:"Default",get:function(){return _}}]),h}();return t(document).on(m.CLICK_DATA_API,v.DATA_SLIDE,T._dataApiClickHandler),t(window).on(m.LOAD_DATA_API,function(){t(v.DATA_RIDE).each(function(){var e=t(this);T._jQueryInterface.call(e,e.data())})}),t.fn[e]=T._jQueryInterface,t.fn[e].Constructor=T,t.fn[e].noConflict=function(){return t.fn[e]=c,T._jQueryInterface},T}(jQuery),function(t){var e="collapse",s="4.0.0-alpha.6",a="bs.collapse",l="."+a,h=".data-api",c=t.fn[e],u=600,d={toggle:!0,parent:""},f={toggle:"boolean",parent:"string"},_={SHOW:"show"+l,SHOWN:"shown"+l,HIDE:"hide"+l,HIDDEN:"hidden"+l,CLICK_DATA_API:"click"+l+h},g={SHOW:"show",COLLAPSE:"collapse",COLLAPSING:"collapsing",COLLAPSED:"collapsed"},p={WIDTH:"width",HEIGHT:"height"},m={ACTIVES:".card > .show, .card > .collapsing",DATA_TOGGLE:'[data-toggle="collapse"]'},E=function(){function l(e,i){n(this,l),this._isTransitioning=!1,this._element=e,this._config=this._getConfig(i),this._triggerArray=t.makeArray(t('[data-toggle="collapse"][href="#'+e.id+'"],'+('[data-toggle="collapse"][data-target="#'+e.id+'"]'))),this._parent=this._config.parent?this._getParent():null,this._config.parent||this._addAriaAndCollapsedClass(this._element,this._triggerArray),this._config.toggle&&this.toggle()}return l.prototype.toggle=function(){t(this._element).hasClass(g.SHOW)?this.hide():this.show()},l.prototype.show=function(){var e=this;if(this._isTransitioning)throw new Error("Collapse is transitioning");if(!t(this._element).hasClass(g.SHOW)){var n=void 0,i=void 0;if(this._parent&&(n=t.makeArray(t(this._parent).find(m.ACTIVES)),n.length||(n=null)),!(n&&(i=t(n).data(a),i&&i._isTransitioning))){var o=t.Event(_.SHOW);if(t(this._element).trigger(o),!o.isDefaultPrevented()){n&&(l._jQueryInterface.call(t(n),"hide"),i||t(n).data(a,null));var s=this._getDimension();t(this._element).removeClass(g.COLLAPSE).addClass(g.COLLAPSING),this._element.style[s]=0,this._element.setAttribute("aria-expanded",!0),this._triggerArray.length&&t(this._triggerArray).removeClass(g.COLLAPSED).attr("aria-expanded",!0),this.setTransitioning(!0);var h=function(){t(e._element).removeClass(g.COLLAPSING).addClass(g.COLLAPSE).addClass(g.SHOW),e._element.style[s]="",e.setTransitioning(!1),t(e._element).trigger(_.SHOWN)};if(!r.supportsTransitionEnd())return void h();var c=s[0].toUpperCase()+s.slice(1),d="scroll"+c;t(this._element).one(r.TRANSITION_END,h).emulateTransitionEnd(u),this._element.style[s]=this._element[d]+"px"}}}},l.prototype.hide=function(){var e=this;if(this._isTransitioning)throw new Error("Collapse is transitioning");if(t(this._element).hasClass(g.SHOW)){var n=t.Event(_.HIDE);if(t(this._element).trigger(n),!n.isDefaultPrevented()){var i=this._getDimension(),o=i===p.WIDTH?"offsetWidth":"offsetHeight";this._element.style[i]=this._element[o]+"px",r.reflow(this._element),t(this._element).addClass(g.COLLAPSING).removeClass(g.COLLAPSE).removeClass(g.SHOW),this._element.setAttribute("aria-expanded",!1),this._triggerArray.length&&t(this._triggerArray).addClass(g.COLLAPSED).attr("aria-expanded",!1),this.setTransitioning(!0);var s=function(){e.setTransitioning(!1),t(e._element).removeClass(g.COLLAPSING).addClass(g.COLLAPSE).trigger(_.HIDDEN)};return this._element.style[i]="",r.supportsTransitionEnd()?void t(this._element).one(r.TRANSITION_END,s).emulateTransitionEnd(u):void s()}}},l.prototype.setTransitioning=function(t){this._isTransitioning=t},l.prototype.dispose=function(){t.removeData(this._element,a),this._config=null,this._parent=null,this._element=null,this._triggerArray=null,this._isTransitioning=null},l.prototype._getConfig=function(n){return n=t.extend({},d,n),n.toggle=Boolean(n.toggle),r.typeCheckConfig(e,n,f),n},l.prototype._getDimension=function(){var e=t(this._element).hasClass(p.WIDTH);return e?p.WIDTH:p.HEIGHT},l.prototype._getParent=function(){var e=this,n=t(this._config.parent)[0],i='[data-toggle="collapse"][data-parent="'+this._config.parent+'"]';return t(n).find(i).each(function(t,n){e._addAriaAndCollapsedClass(l._getTargetFromElement(n),[n])}),n},l.prototype._addAriaAndCollapsedClass=function(e,n){if(e){var i=t(e).hasClass(g.SHOW);e.setAttribute("aria-expanded",i),n.length&&t(n).toggleClass(g.COLLAPSED,!i).attr("aria-expanded",i)}},l._getTargetFromElement=function(e){var n=r.getSelectorFromElement(e);return n?t(n)[0]:null},l._jQueryInterface=function(e){return this.each(function(){var n=t(this),o=n.data(a),r=t.extend({},d,n.data(),"object"===("undefined"==typeof e?"undefined":i(e))&&e);if(!o&&r.toggle&&/show|hide/.test(e)&&(r.toggle=!1),o||(o=new l(this,r),n.data(a,o)),"string"==typeof e){if(void 0===o[e])throw new Error('No method named "'+e+'"');o[e]()}})},o(l,null,[{key:"VERSION",get:function(){return s}},{key:"Default",get:function(){return d}}]),l}();return t(document).on(_.CLICK_DATA_API,m.DATA_TOGGLE,function(e){e.preventDefault();var n=E._getTargetFromElement(this),i=t(n).data(a),o=i?"toggle":t(this).data();E._jQueryInterface.call(t(n),o)}),t.fn[e]=E._jQueryInterface,t.fn[e].Constructor=E,t.fn[e].noConflict=function(){return t.fn[e]=c,E._jQueryInterface},E}(jQuery),function(t){var e="dropdown",i="4.0.0-alpha.6",s="bs.dropdown",a="."+s,l=".data-api",h=t.fn[e],c=27,u=38,d=40,f=3,_={HIDE:"hide"+a,HIDDEN:"hidden"+a,SHOW:"show"+a,SHOWN:"shown"+a,CLICK:"click"+a,CLICK_DATA_API:"click"+a+l,FOCUSIN_DATA_API:"focusin"+a+l,KEYDOWN_DATA_API:"keydown"+a+l},g={BACKDROP:"dropdown-backdrop",DISABLED:"disabled",SHOW:"show"},p={BACKDROP:".dropdown-backdrop",DATA_TOGGLE:'[data-toggle="dropdown"]',FORM_CHILD:".dropdown form",ROLE_MENU:'[role="menu"]',ROLE_LISTBOX:'[role="listbox"]',NAVBAR_NAV:".navbar-nav",VISIBLE_ITEMS:'[role="menu"] li:not(.disabled) a, [role="listbox"] li:not(.disabled) a'},m=function(){function e(t){n(this,e),this._element=t,this._addEventListeners()}return e.prototype.toggle=function(){if(this.disabled||t(this).hasClass(g.DISABLED))return!1;var n=e._getParentFromElement(this),i=t(n).hasClass(g.SHOW);if(e._clearMenus(),i)return!1;if("ontouchstart"in document.documentElement&&!t(n).closest(p.NAVBAR_NAV).length){var o=document.createElement("div");o.className=g.BACKDROP,t(o).insertBefore(this),t(o).on("click",e._clearMenus)}var r={relatedTarget:this},s=t.Event(_.SHOW,r);return t(n).trigger(s),!s.isDefaultPrevented()&&(this.focus(),this.setAttribute("aria-expanded",!0),t(n).toggleClass(g.SHOW),t(n).trigger(t.Event(_.SHOWN,r)),!1)},e.prototype.dispose=function(){t.removeData(this._element,s),t(this._element).off(a),this._element=null},e.prototype._addEventListeners=function(){t(this._element).on(_.CLICK,this.toggle)},e._jQueryInterface=function(n){return this.each(function(){var i=t(this).data(s);if(i||(i=new e(this),t(this).data(s,i)),"string"==typeof n){if(void 0===i[n])throw new Error('No method named "'+n+'"');i[n].call(this)}})},e._clearMenus=function(n){if(!n||n.which!==f){var i=t(p.BACKDROP)[0];i&&i.parentNode.removeChild(i);for(var o=t.makeArray(t(p.DATA_TOGGLE)),r=0;r<o.length;r++){var s=e._getParentFromElement(o[r]),a={relatedTarget:o[r]};if(t(s).hasClass(g.SHOW)&&!(n&&("click"===n.type&&/input|textarea/i.test(n.target.tagName)||"focusin"===n.type)&&t.contains(s,n.target))){var l=t.Event(_.HIDE,a);t(s).trigger(l),l.isDefaultPrevented()||(o[r].setAttribute("aria-expanded","false"),t(s).removeClass(g.SHOW).trigger(t.Event(_.HIDDEN,a)))}}}},e._getParentFromElement=function(e){var n=void 0,i=r.getSelectorFromElement(e);return i&&(n=t(i)[0]),n||e.parentNode},e._dataApiKeydownHandler=function(n){if(/(38|40|27|32)/.test(n.which)&&!/input|textarea/i.test(n.target.tagName)&&(n.preventDefault(),n.stopPropagation(),!this.disabled&&!t(this).hasClass(g.DISABLED))){var i=e._getParentFromElement(this),o=t(i).hasClass(g.SHOW);if(!o&&n.which!==c||o&&n.which===c){if(n.which===c){var r=t(i).find(p.DATA_TOGGLE)[0];t(r).trigger("focus")}return void t(this).trigger("click")}var s=t(i).find(p.VISIBLE_ITEMS).get();if(s.length){var a=s.indexOf(n.target);n.which===u&&a>0&&a--,n.which===d&&a<s.length-1&&a++,a<0&&(a=0),s[a].focus()}}},o(e,null,[{key:"VERSION",get:function(){return i}}]),e}();return t(document).on(_.KEYDOWN_DATA_API,p.DATA_TOGGLE,m._dataApiKeydownHandler).on(_.KEYDOWN_DATA_API,p.ROLE_MENU,m._dataApiKeydownHandler).on(_.KEYDOWN_DATA_API,p.ROLE_LISTBOX,m._dataApiKeydownHandler).on(_.CLICK_DATA_API+" "+_.FOCUSIN_DATA_API,m._clearMenus).on(_.CLICK_DATA_API,p.DATA_TOGGLE,m.prototype.toggle).on(_.CLICK_DATA_API,p.FORM_CHILD,function(t){t.stopPropagation()}),t.fn[e]=m._jQueryInterface,t.fn[e].Constructor=m,t.fn[e].noConflict=function(){return t.fn[e]=h,m._jQueryInterface},m}(jQuery),function(t){var e="modal",s="4.0.0-alpha.6",a="bs.modal",l="."+a,h=".data-api",c=t.fn[e],u=300,d=150,f=27,_={backdrop:!0,keyboard:!0,focus:!0,show:!0},g={backdrop:"(boolean|string)",keyboard:"boolean",focus:"boolean",show:"boolean"},p={HIDE:"hide"+l,HIDDEN:"hidden"+l,SHOW:"show"+l,SHOWN:"shown"+l,FOCUSIN:"focusin"+l,RESIZE:"resize"+l,CLICK_DISMISS:"click.dismiss"+l,KEYDOWN_DISMISS:"keydown.dismiss"+l,MOUSEUP_DISMISS:"mouseup.dismiss"+l,MOUSEDOWN_DISMISS:"mousedown.dismiss"+l,CLICK_DATA_API:"click"+l+h},m={SCROLLBAR_MEASURER:"modal-scrollbar-measure",BACKDROP:"modal-backdrop",OPEN:"modal-open",FADE:"fade",SHOW:"show"},E={DIALOG:".modal-dialog",DATA_TOGGLE:'[data-toggle="modal"]',DATA_DISMISS:'[data-dismiss="modal"]',FIXED_CONTENT:".fixed-top, .fixed-bottom, .is-fixed, .sticky-top"},v=function(){function h(e,i){n(this,h),this._config=this._getConfig(i),this._element=e,this._dialog=t(e).find(E.DIALOG)[0],this._backdrop=null,this._isShown=!1,this._isBodyOverflowing=!1,this._ignoreBackdropClick=!1,this._isTransitioning=!1,this._originalBodyPadding=0,this._scrollbarWidth=0}return h.prototype.toggle=function(t){return this._isShown?this.hide():this.show(t)},h.prototype.show=function(e){var n=this;if(this._isTransitioning)throw new Error("Modal is transitioning");r.supportsTransitionEnd()&&t(this._element).hasClass(m.FADE)&&(this._isTransitioning=!0);var i=t.Event(p.SHOW,{relatedTarget:e});t(this._element).trigger(i),this._isShown||i.isDefaultPrevented()||(this._isShown=!0,this._checkScrollbar(),this._setScrollbar(),t(document.body).addClass(m.OPEN),this._setEscapeEvent(),this._setResizeEvent(),t(this._element).on(p.CLICK_DISMISS,E.DATA_DISMISS,function(t){return n.hide(t)}),t(this._dialog).on(p.MOUSEDOWN_DISMISS,function(){t(n._element).one(p.MOUSEUP_DISMISS,function(e){t(e.target).is(n._element)&&(n._ignoreBackdropClick=!0)})}),this._showBackdrop(function(){return n._showElement(e)}))},h.prototype.hide=function(e){var n=this;if(e&&e.preventDefault(),this._isTransitioning)throw new Error("Modal is transitioning");var i=r.supportsTransitionEnd()&&t(this._element).hasClass(m.FADE);i&&(this._isTransitioning=!0);var o=t.Event(p.HIDE);t(this._element).trigger(o),this._isShown&&!o.isDefaultPrevented()&&(this._isShown=!1,this._setEscapeEvent(),this._setResizeEvent(),t(document).off(p.FOCUSIN),t(this._element).removeClass(m.SHOW),t(this._element).off(p.CLICK_DISMISS),t(this._dialog).off(p.MOUSEDOWN_DISMISS),i?t(this._element).one(r.TRANSITION_END,function(t){return n._hideModal(t)}).emulateTransitionEnd(u):this._hideModal())},h.prototype.dispose=function(){t.removeData(this._element,a),t(window,document,this._element,this._backdrop).off(l),this._config=null,this._element=null,this._dialog=null,this._backdrop=null,this._isShown=null,this._isBodyOverflowing=null,this._ignoreBackdropClick=null,this._originalBodyPadding=null,this._scrollbarWidth=null},h.prototype._getConfig=function(n){return n=t.extend({},_,n),r.typeCheckConfig(e,n,g),n},h.prototype._showElement=function(e){var n=this,i=r.supportsTransitionEnd()&&t(this._element).hasClass(m.FADE);this._element.parentNode&&this._element.parentNode.nodeType===Node.ELEMENT_NODE||document.body.appendChild(this._element),this._element.style.display="block",this._element.removeAttribute("aria-hidden"),this._element.scrollTop=0,i&&r.reflow(this._element),t(this._element).addClass(m.SHOW),this._config.focus&&this._enforceFocus();var o=t.Event(p.SHOWN,{relatedTarget:e}),s=function(){n._config.focus&&n._element.focus(),n._isTransitioning=!1,t(n._element).trigger(o)};i?t(this._dialog).one(r.TRANSITION_END,s).emulateTransitionEnd(u):s()},h.prototype._enforceFocus=function(){var e=this;t(document).off(p.FOCUSIN).on(p.FOCUSIN,function(n){document===n.target||e._element===n.target||t(e._element).has(n.target).length||e._element.focus()})},h.prototype._setEscapeEvent=function(){var e=this;this._isShown&&this._config.keyboard?t(this._element).on(p.KEYDOWN_DISMISS,function(t){t.which===f&&e.hide()}):this._isShown||t(this._element).off(p.KEYDOWN_DISMISS)},h.prototype._setResizeEvent=function(){var e=this;this._isShown?t(window).on(p.RESIZE,function(t){return e._handleUpdate(t)}):t(window).off(p.RESIZE)},h.prototype._hideModal=function(){var e=this;this._element.style.display="none",this._element.setAttribute("aria-hidden","true"),this._isTransitioning=!1,this._showBackdrop(function(){t(document.body).removeClass(m.OPEN),e._resetAdjustments(),e._resetScrollbar(),t(e._element).trigger(p.HIDDEN)})},h.prototype._removeBackdrop=function(){this._backdrop&&(t(this._backdrop).remove(),this._backdrop=null)},h.prototype._showBackdrop=function(e){var n=this,i=t(this._element).hasClass(m.FADE)?m.FADE:"";if(this._isShown&&this._config.backdrop){var o=r.supportsTransitionEnd()&&i;if(this._backdrop=document.createElement("div"),this._backdrop.className=m.BACKDROP,i&&t(this._backdrop).addClass(i),t(this._backdrop).appendTo(document.body),t(this._element).on(p.CLICK_DISMISS,function(t){return n._ignoreBackdropClick?void(n._ignoreBackdropClick=!1):void(t.target===t.currentTarget&&("static"===n._config.backdrop?n._element.focus():n.hide()))}),o&&r.reflow(this._backdrop),t(this._backdrop).addClass(m.SHOW),!e)return;if(!o)return void e();t(this._backdrop).one(r.TRANSITION_END,e).emulateTransitionEnd(d)}else if(!this._isShown&&this._backdrop){t(this._backdrop).removeClass(m.SHOW);var s=function(){n._removeBackdrop(),e&&e()};r.supportsTransitionEnd()&&t(this._element).hasClass(m.FADE)?t(this._backdrop).one(r.TRANSITION_END,s).emulateTransitionEnd(d):s()}else e&&e()},h.prototype._handleUpdate=function(){this._adjustDialog()},h.prototype._adjustDialog=function(){var t=this._element.scrollHeight>document.documentElement.clientHeight;!this._isBodyOverflowing&&t&&(this._element.style.paddingLeft=this._scrollbarWidth+"px"),this._isBodyOverflowing&&!t&&(this._element.style.paddingRight=this._scrollbarWidth+"px")},h.prototype._resetAdjustments=function(){this._element.style.paddingLeft="",this._element.style.paddingRight=""},h.prototype._checkScrollbar=function(){this._isBodyOverflowing=document.body.clientWidth<window.innerWidth,this._scrollbarWidth=this._getScrollbarWidth()},h.prototype._setScrollbar=function(){var e=parseInt(t(E.FIXED_CONTENT).css("padding-right")||0,10);this._originalBodyPadding=document.body.style.paddingRight||"",this._isBodyOverflowing&&(document.body.style.paddingRight=e+this._scrollbarWidth+"px")},h.prototype._resetScrollbar=function(){document.body.style.paddingRight=this._originalBodyPadding},h.prototype._getScrollbarWidth=function(){var t=document.createElement("div");t.className=m.SCROLLBAR_MEASURER,document.body.appendChild(t);var e=t.offsetWidth-t.clientWidth;return document.body.removeChild(t),e},h._jQueryInterface=function(e,n){return this.each(function(){var o=t(this).data(a),r=t.extend({},h.Default,t(this).data(),"object"===("undefined"==typeof e?"undefined":i(e))&&e);if(o||(o=new h(this,r),t(this).data(a,o)),"string"==typeof e){if(void 0===o[e])throw new Error('No method named "'+e+'"');o[e](n)}else r.show&&o.show(n)})},o(h,null,[{key:"VERSION",get:function(){return s}},{key:"Default",get:function(){return _}}]),h}();return t(document).on(p.CLICK_DATA_API,E.DATA_TOGGLE,function(e){var n=this,i=void 0,o=r.getSelectorFromElement(this);o&&(i=t(o)[0]);var s=t(i).data(a)?"toggle":t.extend({},t(i).data(),t(this).data());"A"!==this.tagName&&"AREA"!==this.tagName||e.preventDefault();var l=t(i).one(p.SHOW,function(e){e.isDefaultPrevented()||l.one(p.HIDDEN,function(){t(n).is(":visible")&&n.focus()})});v._jQueryInterface.call(t(i),s,this)}),t.fn[e]=v._jQueryInterface,t.fn[e].Constructor=v,t.fn[e].noConflict=function(){return t.fn[e]=c,v._jQueryInterface},v}(jQuery),function(t){var e="scrollspy",s="4.0.0-alpha.6",a="bs.scrollspy",l="."+a,h=".data-api",c=t.fn[e],u={offset:10,method:"auto",target:""},d={offset:"number",method:"string",target:"(string|element)"},f={ACTIVATE:"activate"+l,SCROLL:"scroll"+l,LOAD_DATA_API:"load"+l+h},_={DROPDOWN_ITEM:"dropdown-item",DROPDOWN_MENU:"dropdown-menu",NAV_LINK:"nav-link",NAV:"nav",ACTIVE:"active"},g={DATA_SPY:'[data-spy="scroll"]',ACTIVE:".active",LIST_ITEM:".list-item",LI:"li",LI_DROPDOWN:"li.dropdown",NAV_LINKS:".nav-link",DROPDOWN:".dropdown",DROPDOWN_ITEMS:".dropdown-item",DROPDOWN_TOGGLE:".dropdown-toggle"},p={OFFSET:"offset",POSITION:"position"},m=function(){function h(e,i){var o=this;n(this,h),this._element=e,this._scrollElement="BODY"===e.tagName?window:e,this._config=this._getConfig(i),this._selector=this._config.target+" "+g.NAV_LINKS+","+(this._config.target+" "+g.DROPDOWN_ITEMS),this._offsets=[],this._targets=[],this._activeTarget=null,this._scrollHeight=0,t(this._scrollElement).on(f.SCROLL,function(t){return o._process(t)}),this.refresh(),this._process()}return h.prototype.refresh=function(){var e=this,n=this._scrollElement!==this._scrollElement.window?p.POSITION:p.OFFSET,i="auto"===this._config.method?n:this._config.method,o=i===p.POSITION?this._getScrollTop():0;this._offsets=[],this._targets=[],this._scrollHeight=this._getScrollHeight();var s=t.makeArray(t(this._selector));s.map(function(e){var n=void 0,s=r.getSelectorFromElement(e);return s&&(n=t(s)[0]),n&&(n.offsetWidth||n.offsetHeight)?[t(n)[i]().top+o,s]:null}).filter(function(t){return t}).sort(function(t,e){return t[0]-e[0]}).forEach(function(t){e._offsets.push(t[0]),e._targets.push(t[1])})},h.prototype.dispose=function(){t.removeData(this._element,a),t(this._scrollElement).off(l),this._element=null,this._scrollElement=null,this._config=null,this._selector=null,this._offsets=null,this._targets=null,this._activeTarget=null,this._scrollHeight=null},h.prototype._getConfig=function(n){if(n=t.extend({},u,n),"string"!=typeof n.target){var i=t(n.target).attr("id");i||(i=r.getUID(e),t(n.target).attr("id",i)),n.target="#"+i}return r.typeCheckConfig(e,n,d),n},h.prototype._getScrollTop=function(){return this._scrollElement===window?this._scrollElement.pageYOffset:this._scrollElement.scrollTop},h.prototype._getScrollHeight=function(){return this._scrollElement.scrollHeight||Math.max(document.body.scrollHeight,document.documentElement.scrollHeight)},h.prototype._getOffsetHeight=function(){return this._scrollElement===window?window.innerHeight:this._scrollElement.offsetHeight},h.prototype._process=function(){var t=this._getScrollTop()+this._config.offset,e=this._getScrollHeight(),n=this._config.offset+e-this._getOffsetHeight();if(this._scrollHeight!==e&&this.refresh(),t>=n){var i=this._targets[this._targets.length-1];return void(this._activeTarget!==i&&this._activate(i))}if(this._activeTarget&&t<this._offsets[0]&&this._offsets[0]>0)return this._activeTarget=null,void this._clear();for(var o=this._offsets.length;o--;){var r=this._activeTarget!==this._targets[o]&&t>=this._offsets[o]&&(void 0===this._offsets[o+1]||t<this._offsets[o+1]);r&&this._activate(this._targets[o])}},h.prototype._activate=function(e){this._activeTarget=e,this._clear();var n=this._selector.split(",");n=n.map(function(t){return t+'[data-target="'+e+'"],'+(t+'[href="'+e+'"]')});var i=t(n.join(","));i.hasClass(_.DROPDOWN_ITEM)?(i.closest(g.DROPDOWN).find(g.DROPDOWN_TOGGLE).addClass(_.ACTIVE),i.addClass(_.ACTIVE)):i.parents(g.LI).find("> "+g.NAV_LINKS).addClass(_.ACTIVE),t(this._scrollElement).trigger(f.ACTIVATE,{relatedTarget:e})},h.prototype._clear=function(){t(this._selector).filter(g.ACTIVE).removeClass(_.ACTIVE)},h._jQueryInterface=function(e){return this.each(function(){var n=t(this).data(a),o="object"===("undefined"==typeof e?"undefined":i(e))&&e;
if(n||(n=new h(this,o),t(this).data(a,n)),"string"==typeof e){if(void 0===n[e])throw new Error('No method named "'+e+'"');n[e]()}})},o(h,null,[{key:"VERSION",get:function(){return s}},{key:"Default",get:function(){return u}}]),h}();return t(window).on(f.LOAD_DATA_API,function(){for(var e=t.makeArray(t(g.DATA_SPY)),n=e.length;n--;){var i=t(e[n]);m._jQueryInterface.call(i,i.data())}}),t.fn[e]=m._jQueryInterface,t.fn[e].Constructor=m,t.fn[e].noConflict=function(){return t.fn[e]=c,m._jQueryInterface},m}(jQuery),function(t){var e="tab",i="4.0.0-alpha.6",s="bs.tab",a="."+s,l=".data-api",h=t.fn[e],c=150,u={HIDE:"hide"+a,HIDDEN:"hidden"+a,SHOW:"show"+a,SHOWN:"shown"+a,CLICK_DATA_API:"click"+a+l},d={DROPDOWN_MENU:"dropdown-menu",ACTIVE:"active",DISABLED:"disabled",FADE:"fade",SHOW:"show"},f={A:"a",LI:"li",DROPDOWN:".dropdown",LIST:"ul:not(.dropdown-menu), ol:not(.dropdown-menu), nav:not(.dropdown-menu)",FADE_CHILD:"> .nav-item .fade, > .fade",ACTIVE:".active",ACTIVE_CHILD:"> .nav-item > .active, > .active",DATA_TOGGLE:'[data-toggle="tab"], [data-toggle="pill"]',DROPDOWN_TOGGLE:".dropdown-toggle",DROPDOWN_ACTIVE_CHILD:"> .dropdown-menu .active"},_=function(){function e(t){n(this,e),this._element=t}return e.prototype.show=function(){var e=this;if(!(this._element.parentNode&&this._element.parentNode.nodeType===Node.ELEMENT_NODE&&t(this._element).hasClass(d.ACTIVE)||t(this._element).hasClass(d.DISABLED))){var n=void 0,i=void 0,o=t(this._element).closest(f.LIST)[0],s=r.getSelectorFromElement(this._element);o&&(i=t.makeArray(t(o).find(f.ACTIVE)),i=i[i.length-1]);var a=t.Event(u.HIDE,{relatedTarget:this._element}),l=t.Event(u.SHOW,{relatedTarget:i});if(i&&t(i).trigger(a),t(this._element).trigger(l),!l.isDefaultPrevented()&&!a.isDefaultPrevented()){s&&(n=t(s)[0]),this._activate(this._element,o);var h=function(){var n=t.Event(u.HIDDEN,{relatedTarget:e._element}),o=t.Event(u.SHOWN,{relatedTarget:i});t(i).trigger(n),t(e._element).trigger(o)};n?this._activate(n,n.parentNode,h):h()}}},e.prototype.dispose=function(){t.removeClass(this._element,s),this._element=null},e.prototype._activate=function(e,n,i){var o=this,s=t(n).find(f.ACTIVE_CHILD)[0],a=i&&r.supportsTransitionEnd()&&(s&&t(s).hasClass(d.FADE)||Boolean(t(n).find(f.FADE_CHILD)[0])),l=function(){return o._transitionComplete(e,s,a,i)};s&&a?t(s).one(r.TRANSITION_END,l).emulateTransitionEnd(c):l(),s&&t(s).removeClass(d.SHOW)},e.prototype._transitionComplete=function(e,n,i,o){if(n){t(n).removeClass(d.ACTIVE);var s=t(n.parentNode).find(f.DROPDOWN_ACTIVE_CHILD)[0];s&&t(s).removeClass(d.ACTIVE),n.setAttribute("aria-expanded",!1)}if(t(e).addClass(d.ACTIVE),e.setAttribute("aria-expanded",!0),i?(r.reflow(e),t(e).addClass(d.SHOW)):t(e).removeClass(d.FADE),e.parentNode&&t(e.parentNode).hasClass(d.DROPDOWN_MENU)){var a=t(e).closest(f.DROPDOWN)[0];a&&t(a).find(f.DROPDOWN_TOGGLE).addClass(d.ACTIVE),e.setAttribute("aria-expanded",!0)}o&&o()},e._jQueryInterface=function(n){return this.each(function(){var i=t(this),o=i.data(s);if(o||(o=new e(this),i.data(s,o)),"string"==typeof n){if(void 0===o[n])throw new Error('No method named "'+n+'"');o[n]()}})},o(e,null,[{key:"VERSION",get:function(){return i}}]),e}();return t(document).on(u.CLICK_DATA_API,f.DATA_TOGGLE,function(e){e.preventDefault(),_._jQueryInterface.call(t(this),"show")}),t.fn[e]=_._jQueryInterface,t.fn[e].Constructor=_,t.fn[e].noConflict=function(){return t.fn[e]=h,_._jQueryInterface},_}(jQuery),function(t){if("undefined"==typeof Tether)throw new Error("Bootstrap tooltips require Tether (http://tether.io/)");var e="tooltip",s="4.0.0-alpha.6",a="bs.tooltip",l="."+a,h=t.fn[e],c=150,u="bs-tether",d={animation:!0,template:'<div class="tooltip" role="tooltip"><div class="tooltip-inner"></div></div>',trigger:"hover focus",title:"",delay:0,html:!1,selector:!1,placement:"top",offset:"0 0",constraints:[],container:!1},f={animation:"boolean",template:"string",title:"(string|element|function)",trigger:"string",delay:"(number|object)",html:"boolean",selector:"(string|boolean)",placement:"(string|function)",offset:"string",constraints:"array",container:"(string|element|boolean)"},_={TOP:"bottom center",RIGHT:"middle left",BOTTOM:"top center",LEFT:"middle right"},g={SHOW:"show",OUT:"out"},p={HIDE:"hide"+l,HIDDEN:"hidden"+l,SHOW:"show"+l,SHOWN:"shown"+l,INSERTED:"inserted"+l,CLICK:"click"+l,FOCUSIN:"focusin"+l,FOCUSOUT:"focusout"+l,MOUSEENTER:"mouseenter"+l,MOUSELEAVE:"mouseleave"+l},m={FADE:"fade",SHOW:"show"},E={TOOLTIP:".tooltip",TOOLTIP_INNER:".tooltip-inner"},v={element:!1,enabled:!1},T={HOVER:"hover",FOCUS:"focus",CLICK:"click",MANUAL:"manual"},I=function(){function h(t,e){n(this,h),this._isEnabled=!0,this._timeout=0,this._hoverState="",this._activeTrigger={},this._isTransitioning=!1,this._tether=null,this.element=t,this.config=this._getConfig(e),this.tip=null,this._setListeners()}return h.prototype.enable=function(){this._isEnabled=!0},h.prototype.disable=function(){this._isEnabled=!1},h.prototype.toggleEnabled=function(){this._isEnabled=!this._isEnabled},h.prototype.toggle=function(e){if(e){var n=this.constructor.DATA_KEY,i=t(e.currentTarget).data(n);i||(i=new this.constructor(e.currentTarget,this._getDelegateConfig()),t(e.currentTarget).data(n,i)),i._activeTrigger.click=!i._activeTrigger.click,i._isWithActiveTrigger()?i._enter(null,i):i._leave(null,i)}else{if(t(this.getTipElement()).hasClass(m.SHOW))return void this._leave(null,this);this._enter(null,this)}},h.prototype.dispose=function(){clearTimeout(this._timeout),this.cleanupTether(),t.removeData(this.element,this.constructor.DATA_KEY),t(this.element).off(this.constructor.EVENT_KEY),t(this.element).closest(".modal").off("hide.bs.modal"),this.tip&&t(this.tip).remove(),this._isEnabled=null,this._timeout=null,this._hoverState=null,this._activeTrigger=null,this._tether=null,this.element=null,this.config=null,this.tip=null},h.prototype.show=function(){var e=this;if("none"===t(this.element).css("display"))throw new Error("Please use show on visible elements");var n=t.Event(this.constructor.Event.SHOW);if(this.isWithContent()&&this._isEnabled){if(this._isTransitioning)throw new Error("Tooltip is transitioning");t(this.element).trigger(n);var i=t.contains(this.element.ownerDocument.documentElement,this.element);if(n.isDefaultPrevented()||!i)return;var o=this.getTipElement(),s=r.getUID(this.constructor.NAME);o.setAttribute("id",s),this.element.setAttribute("aria-describedby",s),this.setContent(),this.config.animation&&t(o).addClass(m.FADE);var a="function"==typeof this.config.placement?this.config.placement.call(this,o,this.element):this.config.placement,l=this._getAttachment(a),c=this.config.container===!1?document.body:t(this.config.container);t(o).data(this.constructor.DATA_KEY,this).appendTo(c),t(this.element).trigger(this.constructor.Event.INSERTED),this._tether=new Tether({attachment:l,element:o,target:this.element,classes:v,classPrefix:u,offset:this.config.offset,constraints:this.config.constraints,addTargetClasses:!1}),r.reflow(o),this._tether.position(),t(o).addClass(m.SHOW);var d=function(){var n=e._hoverState;e._hoverState=null,e._isTransitioning=!1,t(e.element).trigger(e.constructor.Event.SHOWN),n===g.OUT&&e._leave(null,e)};if(r.supportsTransitionEnd()&&t(this.tip).hasClass(m.FADE))return this._isTransitioning=!0,void t(this.tip).one(r.TRANSITION_END,d).emulateTransitionEnd(h._TRANSITION_DURATION);d()}},h.prototype.hide=function(e){var n=this,i=this.getTipElement(),o=t.Event(this.constructor.Event.HIDE);if(this._isTransitioning)throw new Error("Tooltip is transitioning");var s=function(){n._hoverState!==g.SHOW&&i.parentNode&&i.parentNode.removeChild(i),n.element.removeAttribute("aria-describedby"),t(n.element).trigger(n.constructor.Event.HIDDEN),n._isTransitioning=!1,n.cleanupTether(),e&&e()};t(this.element).trigger(o),o.isDefaultPrevented()||(t(i).removeClass(m.SHOW),this._activeTrigger[T.CLICK]=!1,this._activeTrigger[T.FOCUS]=!1,this._activeTrigger[T.HOVER]=!1,r.supportsTransitionEnd()&&t(this.tip).hasClass(m.FADE)?(this._isTransitioning=!0,t(i).one(r.TRANSITION_END,s).emulateTransitionEnd(c)):s(),this._hoverState="")},h.prototype.isWithContent=function(){return Boolean(this.getTitle())},h.prototype.getTipElement=function(){return this.tip=this.tip||t(this.config.template)[0]},h.prototype.setContent=function(){var e=t(this.getTipElement());this.setElementContent(e.find(E.TOOLTIP_INNER),this.getTitle()),e.removeClass(m.FADE+" "+m.SHOW),this.cleanupTether()},h.prototype.setElementContent=function(e,n){var o=this.config.html;"object"===("undefined"==typeof n?"undefined":i(n))&&(n.nodeType||n.jquery)?o?t(n).parent().is(e)||e.empty().append(n):e.text(t(n).text()):e[o?"html":"text"](n)},h.prototype.getTitle=function(){var t=this.element.getAttribute("data-original-title");return t||(t="function"==typeof this.config.title?this.config.title.call(this.element):this.config.title),t},h.prototype.cleanupTether=function(){this._tether&&this._tether.destroy()},h.prototype._getAttachment=function(t){return _[t.toUpperCase()]},h.prototype._setListeners=function(){var e=this,n=this.config.trigger.split(" ");n.forEach(function(n){if("click"===n)t(e.element).on(e.constructor.Event.CLICK,e.config.selector,function(t){return e.toggle(t)});else if(n!==T.MANUAL){var i=n===T.HOVER?e.constructor.Event.MOUSEENTER:e.constructor.Event.FOCUSIN,o=n===T.HOVER?e.constructor.Event.MOUSELEAVE:e.constructor.Event.FOCUSOUT;t(e.element).on(i,e.config.selector,function(t){return e._enter(t)}).on(o,e.config.selector,function(t){return e._leave(t)})}t(e.element).closest(".modal").on("hide.bs.modal",function(){return e.hide()})}),this.config.selector?this.config=t.extend({},this.config,{trigger:"manual",selector:""}):this._fixTitle()},h.prototype._fixTitle=function(){var t=i(this.element.getAttribute("data-original-title"));(this.element.getAttribute("title")||"string"!==t)&&(this.element.setAttribute("data-original-title",this.element.getAttribute("title")||""),this.element.setAttribute("title",""))},h.prototype._enter=function(e,n){var i=this.constructor.DATA_KEY;return n=n||t(e.currentTarget).data(i),n||(n=new this.constructor(e.currentTarget,this._getDelegateConfig()),t(e.currentTarget).data(i,n)),e&&(n._activeTrigger["focusin"===e.type?T.FOCUS:T.HOVER]=!0),t(n.getTipElement()).hasClass(m.SHOW)||n._hoverState===g.SHOW?void(n._hoverState=g.SHOW):(clearTimeout(n._timeout),n._hoverState=g.SHOW,n.config.delay&&n.config.delay.show?void(n._timeout=setTimeout(function(){n._hoverState===g.SHOW&&n.show()},n.config.delay.show)):void n.show())},h.prototype._leave=function(e,n){var i=this.constructor.DATA_KEY;if(n=n||t(e.currentTarget).data(i),n||(n=new this.constructor(e.currentTarget,this._getDelegateConfig()),t(e.currentTarget).data(i,n)),e&&(n._activeTrigger["focusout"===e.type?T.FOCUS:T.HOVER]=!1),!n._isWithActiveTrigger())return clearTimeout(n._timeout),n._hoverState=g.OUT,n.config.delay&&n.config.delay.hide?void(n._timeout=setTimeout(function(){n._hoverState===g.OUT&&n.hide()},n.config.delay.hide)):void n.hide()},h.prototype._isWithActiveTrigger=function(){for(var t in this._activeTrigger)if(this._activeTrigger[t])return!0;return!1},h.prototype._getConfig=function(n){return n=t.extend({},this.constructor.Default,t(this.element).data(),n),n.delay&&"number"==typeof n.delay&&(n.delay={show:n.delay,hide:n.delay}),r.typeCheckConfig(e,n,this.constructor.DefaultType),n},h.prototype._getDelegateConfig=function(){var t={};if(this.config)for(var e in this.config)this.constructor.Default[e]!==this.config[e]&&(t[e]=this.config[e]);return t},h._jQueryInterface=function(e){return this.each(function(){var n=t(this).data(a),o="object"===("undefined"==typeof e?"undefined":i(e))&&e;if((n||!/dispose|hide/.test(e))&&(n||(n=new h(this,o),t(this).data(a,n)),"string"==typeof e)){if(void 0===n[e])throw new Error('No method named "'+e+'"');n[e]()}})},o(h,null,[{key:"VERSION",get:function(){return s}},{key:"Default",get:function(){return d}},{key:"NAME",get:function(){return e}},{key:"DATA_KEY",get:function(){return a}},{key:"Event",get:function(){return p}},{key:"EVENT_KEY",get:function(){return l}},{key:"DefaultType",get:function(){return f}}]),h}();return t.fn[e]=I._jQueryInterface,t.fn[e].Constructor=I,t.fn[e].noConflict=function(){return t.fn[e]=h,I._jQueryInterface},I}(jQuery));(function(r){var a="popover",l="4.0.0-alpha.6",h="bs.popover",c="."+h,u=r.fn[a],d=r.extend({},s.Default,{placement:"right",trigger:"click",content:"",template:'<div class="popover" role="tooltip"><h3 class="popover-title"></h3><div class="popover-content"></div></div>'}),f=r.extend({},s.DefaultType,{content:"(string|element|function)"}),_={FADE:"fade",SHOW:"show"},g={TITLE:".popover-title",CONTENT:".popover-content"},p={HIDE:"hide"+c,HIDDEN:"hidden"+c,SHOW:"show"+c,SHOWN:"shown"+c,INSERTED:"inserted"+c,CLICK:"click"+c,FOCUSIN:"focusin"+c,FOCUSOUT:"focusout"+c,MOUSEENTER:"mouseenter"+c,MOUSELEAVE:"mouseleave"+c},m=function(s){function u(){return n(this,u),t(this,s.apply(this,arguments))}return e(u,s),u.prototype.isWithContent=function(){return this.getTitle()||this._getContent()},u.prototype.getTipElement=function(){return this.tip=this.tip||r(this.config.template)[0]},u.prototype.setContent=function(){var t=r(this.getTipElement());this.setElementContent(t.find(g.TITLE),this.getTitle()),this.setElementContent(t.find(g.CONTENT),this._getContent()),t.removeClass(_.FADE+" "+_.SHOW),this.cleanupTether()},u.prototype._getContent=function(){return this.element.getAttribute("data-content")||("function"==typeof this.config.content?this.config.content.call(this.element):this.config.content)},u._jQueryInterface=function(t){return this.each(function(){var e=r(this).data(h),n="object"===("undefined"==typeof t?"undefined":i(t))?t:null;if((e||!/destroy|hide/.test(t))&&(e||(e=new u(this,n),r(this).data(h,e)),"string"==typeof t)){if(void 0===e[t])throw new Error('No method named "'+t+'"');e[t]()}})},o(u,null,[{key:"VERSION",get:function(){return l}},{key:"Default",get:function(){return d}},{key:"NAME",get:function(){return a}},{key:"DATA_KEY",get:function(){return h}},{key:"Event",get:function(){return p}},{key:"EVENT_KEY",get:function(){return c}},{key:"DefaultType",get:function(){return f}}]),u}(s);return r.fn[a]=m._jQueryInterface,r.fn[a].Constructor=m,r.fn[a].noConflict=function(){return r.fn[a]=u,m._jQueryInterface},m})(jQuery)}();
/**
 * Copyright (C) 2010-2015 Graham Breach
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
/**
 * TagCanvas 2.9
 * For more information, please contact <graham@goat1000.com>
 */

(function(){var M,K,L=Math.abs,ah=Math.sin,w=Math.cos,s=Math.max,aD=Math.min,ap=Math.ceil,F=Math.sqrt,at=Math.pow,h={},l={},m={0:"0,",1:"17,",2:"34,",3:"51,",4:"68,",5:"85,",6:"102,",7:"119,",8:"136,",9:"153,",a:"170,",A:"170,",b:"187,",B:"187,",c:"204,",C:"204,",d:"221,",D:"221,",e:"238,",E:"238,",f:"255,",F:"255,"},x,c,Q,aF,H,aG,aa,C=document,p,b={};for(M=0;M<256;++M){K=M.toString(16);if(M<16){K="0"+K}l[K]=l[K.toUpperCase()]=M.toString()+","}function ai(i){return typeof i!="undefined"}function I(i){return typeof i=="object"&&i!=null}function av(i,j,aH){return isNaN(i)?aH:aD(aH,s(j,i))}function aA(){return false}function G(){return new Date().valueOf()}function A(aH,aK){var j=[],aI=aH.length,aJ;for(aJ=0;aJ<aI;++aJ){j.push(aH[aJ])}j.sort(aK);return j}function an(j){var aI=j.length-1,aH,aJ;while(aI){aJ=~~(Math.random()*aI);aH=j[aI];j[aI]=j[aJ];j[aJ]=aH;--aI}}function ae(i,aH,j){this.x=i;this.y=aH;this.z=j}H=ae.prototype;H.length=function(){return F(this.x*this.x+this.y*this.y+this.z*this.z)};H.dot=function(i){return this.x*i.x+this.y*i.y+this.z*i.z};H.cross=function(j){var i=this.y*j.z-this.z*j.y,aI=this.z*j.x-this.x*j.z,aH=this.x*j.y-this.y*j.x;return new ae(i,aI,aH)};H.angle=function(j){var i=this.dot(j),aH;if(i==0){return Math.PI/2}aH=i/(this.length()*j.length());if(aH>=1){return 0}if(aH<=-1){return Math.PI}return Math.acos(aH)};H.unit=function(){var i=this.length();return new ae(this.x/i,this.y/i,this.z/i)};function aj(aH,j){j=j*Math.PI/180;aH=aH*Math.PI/180;var i=ah(aH)*w(j),aJ=-ah(j),aI=-w(aH)*w(j);return new ae(i,aJ,aI)}function R(i){this[1]={1:i[0],2:i[1],3:i[2]};this[2]={1:i[3],2:i[4],3:i[5]};this[3]={1:i[6],2:i[7],3:i[8]}}aF=R.prototype;R.Identity=function(){return new R([1,0,0,0,1,0,0,0,1])};R.Rotation=function(aI,i){var j=ah(aI),aH=w(aI),aJ=1-aH;return new R([aH+at(i.x,2)*aJ,i.x*i.y*aJ-i.z*j,i.x*i.z*aJ+i.y*j,i.y*i.x*aJ+i.z*j,aH+at(i.y,2)*aJ,i.y*i.z*aJ-i.x*j,i.z*i.x*aJ-i.y*j,i.z*i.y*aJ+i.x*j,aH+at(i.z,2)*aJ])};aF.mul=function(aH){var aI=[],aL,aK,aJ=(aH.xform?1:0);for(aL=1;aL<=3;++aL){for(aK=1;aK<=3;++aK){if(aJ){aI.push(this[aL][1]*aH[1][aK]+this[aL][2]*aH[2][aK]+this[aL][3]*aH[3][aK])}else{aI.push(this[aL][aK]*aH)}}}return new R(aI)};aF.xform=function(aH){var j={},i=aH.x,aJ=aH.y,aI=aH.z;j.x=i*this[1][1]+aJ*this[2][1]+aI*this[3][1];j.y=i*this[1][2]+aJ*this[2][2]+aI*this[3][2];j.z=i*this[1][3]+aJ*this[2][3]+aI*this[3][3];return j};function q(aI,aK,aQ,aN,aP){var aL,aO,j,aM,aR=[],aH=2/aI,aJ;aJ=Math.PI*(3-F(5)+(parseFloat(aP)?parseFloat(aP):0));for(aL=0;aL<aI;++aL){aO=aL*aH-1+(aH/2);j=F(1-aO*aO);aM=aL*aJ;aR.push([w(aM)*j*aK,aO*aQ,ah(aM)*j*aN])}return aR}function W(aJ,aH,aM,aT,aQ,aS){var aR,aU=[],aI=2/aJ,aK,aP,aO,aN,aL;aK=Math.PI*(3-F(5)+(parseFloat(aS)?parseFloat(aS):0));for(aP=0;aP<aJ;++aP){aO=aP*aI-1+(aI/2);aR=aP*aK;aN=w(aR);aL=ah(aR);aU.push(aH?[aO*aM,aN*aT,aL*aQ]:[aN*aM,aO*aT,aL*aQ])}return aU}function N(aH,aI,aL,aR,aP,aN){var aQ,aS=[],aJ=Math.PI*2/aI,aO,aM,aK;for(aO=0;aO<aI;++aO){aQ=aO*aJ;aM=w(aQ);aK=ah(aQ);aS.push(aH?[aN*aL,aM*aR,aK*aP]:[aM*aL,aN*aR,aK*aP])}return aS}function am(aJ,j,aH,aI,i){return W(aJ,0,j,aH,aI,i)}function au(aJ,j,aH,aI,i){return W(aJ,1,j,aH,aI,i)}function d(aJ,i,j,aH,aI){aI=isNaN(aI)?0:aI*1;return N(0,aJ,i,j,aH,aI)}function n(aJ,i,j,aH,aI){aI=isNaN(aI)?0:aI*1;return N(1,aJ,i,j,aH,aI)}function ao(aH){var j=new Image;j.onload=function(){var aI=j.width/2,i=j.height/2;aH.centreFunc=function(aN,aK,aL,aJ,aM){aN.setTransform(1,0,0,1,0,0);aN.globalAlpha=1;aN.drawImage(j,aJ-aI,aM-i)}};j.src=aH.centreImage}function U(aK,i){var aJ=aK,aI,aH,j=(i*1).toPrecision(3)+")";if(aK[0]==="#"){if(!h[aK]){if(aK.length===4){h[aK]="rgba("+m[aK[1]]+m[aK[2]]+m[aK[3]]}else{h[aK]="rgba("+l[aK.substr(1,2)]+l[aK.substr(3,2)]+l[aK.substr(5,2)]}}aJ=h[aK]+j}else{if(aK.substr(0,4)==="rgb("||aK.substr(0,4)==="hsl("){aJ=(aK.replace("(","a(").replace(")",","+j))}else{if(aK.substr(0,5)==="rgba("||aK.substr(0,5)==="hsla("){aI=aK.lastIndexOf(",")+1,aH=aK.indexOf(")");i*=parseFloat(aK.substring(aI,aH));aJ=aK.substr(0,aI)+i.toPrecision(3)+")"}}}return aJ}function P(i,j){if(window.G_vmlCanvasManager){return null}var aH=C.createElement("canvas");aH.width=i;aH.height=j;return aH}function al(){var j=P(3,3),aI,aH;if(!j){return false}aI=j.getContext("2d");aI.strokeStyle="#000";aI.shadowColor="#fff";aI.shadowBlur=3;aI.globalAlpha=0;aI.strokeRect(2,2,2,2);aI.globalAlpha=1;aH=aI.getImageData(2,2,1,1);j=null;return(aH.data[0]>0)}function ak(aL,j,aK,aJ){var aI=aL.createLinearGradient(0,0,j,0),aH;for(aH in aJ){aI.addColorStop(1-aH,aJ[aH])}aL.fillStyle=aI;aL.fillRect(0,aK,j,1)}function k(aJ,aH,j){var aI=1024,aN=1,aM=aJ.weightGradient,aL,aP,aK,aO;if(aJ.gCanvas){aP=aJ.gCanvas.getContext("2d");aN=aJ.gCanvas.height}else{if(I(aM[0])){aN=aM.length}else{aM=[aM]}aJ.gCanvas=aL=P(aI,aN);if(!aL){return null}aP=aL.getContext("2d");for(aK=0;aK<aN;++aK){ak(aP,aI,aK,aM[aK])}}j=s(aD(j||0,aN-1),0);aO=aP.getImageData(~~((aI-1)*aH),j,1,1).data;return"rgba("+aO[0]+","+aO[1]+","+aO[2]+","+(aO[3]/255)+")"}function X(aQ,aJ,j,aU,aT,aR,aP,aL,aI,aS,aK,aO){var aN=aT+(aL||0)+(aI.length&&aI[0]<0?L(aI[0]):0),aH=aR+(aL||0)+(aI.length&&aI[1]<0?L(aI[1]):0),aM,aV;aQ.font=aJ;aQ.textBaseline="top";aQ.fillStyle=j;aP&&(aQ.shadowColor=aP);aL&&(aQ.shadowBlur=aL);aI.length&&(aQ.shadowOffsetX=aI[0],aQ.shadowOffsetY=aI[1]);for(aM=0;aM<aU.length;++aM){aV=0;if(aK){if("right"==aO){aV=aS-aK[aM]}else{if("centre"==aO){aV=(aS-aK[aM])/2}}}aQ.fillText(aU[aM],aN+aV,aH);aH+=parseInt(aJ)}}function ar(aL,i,aK,j,aI,aJ,aH){if(aJ){aL.beginPath();aL.moveTo(i,aK+aI-aJ);aL.arcTo(i,aK,i+aJ,aK,aJ);aL.arcTo(i+j,aK,i+j,aK+aJ,aJ);aL.arcTo(i+j,aK+aI,i+j-aJ,aK+aI,aJ);aL.arcTo(i,aK+aI,i,aK+aI-aJ,aJ);aL.closePath();aL[aH?"stroke":"fill"]()}else{aL[aH?"strokeRect":"fillRect"](i,aK,j,aI)}}function g(aN,i,aL,aI,aM,aH,aJ,aK,j){this.strings=aN;this.font=i;this.width=aL;this.height=aI;this.maxWidth=aM;this.stringWidths=aH;this.align=aJ;this.valign=aK;this.scale=j}aa=g.prototype;aa.SetImage=function(aK,j,aI,i,aJ,aM,aH,aL){this.image=aK;this.iwidth=j*this.scale;this.iheight=aI*this.scale;this.ipos=i;this.ipad=aJ*this.scale;this.iscale=aL;this.ialign=aM;this.ivalign=aH};aa.Align=function(j,aH,i){var aI=0;if(i=="right"||i=="bottom"){aI=aH-j}else{if(i!="left"&&i!="top"){aI=(aH-j)/2}}return aI};aa.Create=function(aU,a0,aT,a1,aZ,aY,i,aX,aP){var aN,aL,aV,a6,a3,a2,aJ,aI,aH,j,aM,aK,aO,aW,aS,a5=L(i[0]),a4=L(i[1]),aQ,aR;aX=s(aX,a5+aY,a4+aY);a3=2*(aX+a1);aJ=2*(aX+a1);aL=this.width+a3;aV=this.height+aJ;aH=j=aX+a1;if(this.image){aM=aK=aX+a1;aO=this.iwidth;aW=this.iheight;if(this.ipos=="top"||this.ipos=="bottom"){if(aO<this.width){aM+=this.Align(aO,this.width,this.ialign)}else{aH+=this.Align(this.width,aO,this.align)}if(this.ipos=="top"){j+=aW+this.ipad}else{aK+=this.height+this.ipad}aL=s(aL,aO+a3);aV+=aW+this.ipad}else{if(aW<this.height){aK+=this.Align(aW,this.height,this.ivalign)}else{j+=this.Align(this.height,aW,this.valign)}if(this.ipos=="right"){aM+=this.width+this.ipad}else{aH+=aO+this.ipad}aL+=aO+this.ipad;aV=s(aV,aW+aJ)}}aN=P(aL,aV);if(!aN){return null}a3=aJ=a1/2;a2=aL-a1;aI=aV-a1;aS=aD(aP,a2/2,aI/2);a6=aN.getContext("2d");if(a0){a6.fillStyle=a0;ar(a6,a3,aJ,a2,aI,aS)}if(a1){a6.strokeStyle=aT;a6.lineWidth=a1;ar(a6,a3,aJ,a2,aI,aS,true)}if(aY||a5||a4){aQ=P(aL,aV);if(aQ){aR=a6;a6=aQ.getContext("2d")}}X(a6,this.font,aU,this.strings,aH,j,0,0,[],this.maxWidth,this.stringWidths,this.align);if(this.image){a6.drawImage(this.image,aM,aK,aO,aW)}if(aR){a6=aR;aZ&&(a6.shadowColor=aZ);aY&&(a6.shadowBlur=aY);a6.shadowOffsetX=i[0];a6.shadowOffsetY=i[1];a6.drawImage(aQ,0,0)}return aN};function v(aI,j,aJ){var aH=P(j,aJ),aK;if(!aH){return null}aK=aH.getContext("2d");aK.drawImage(aI,(j-aI.width)/2,(aJ-aI.height)/2);return aH}function ax(aI,j,aJ){var aH=P(j,aJ),aK;if(!aH){return null}aK=aH.getContext("2d");aK.drawImage(aI,0,0,j,aJ);return aH}function aC(aU,aP,aV,aZ,aQ,aO,aM,aS,aK,aL){var aI=aP+((2*aS)+aO)*aZ,aR=aV+((2*aS)+aO)*aZ,aJ=P(aI,aR),aY,aX,aH,aW,j,a0,aT,aN;if(!aJ){return null}aO*=aZ;aK*=aZ;aX=aH=aO/2;aW=aI-aO;j=aR-aO;aS=(aS*aZ)+aX;aY=aJ.getContext("2d");aN=aD(aK,aW/2,j/2);if(aQ){aY.fillStyle=aQ;ar(aY,aX,aH,aW,j,aN)}if(aO){aY.strokeStyle=aM;aY.lineWidth=aO;ar(aY,aX,aH,aW,j,aN,true)}if(aL){a0=P(aI,aR);aT=a0.getContext("2d");aT.drawImage(aU,aS,aS,aP,aV);aT.globalCompositeOperation="source-in";aT.fillStyle=aM;aT.fillRect(0,0,aI,aR);aT.globalCompositeOperation="destination-over";aT.drawImage(aJ,0,0);aT.globalCompositeOperation="source-over";aY.drawImage(a0,0,0)}else{aY.drawImage(aU,aS,aS,aU.width,aU.height)}return{image:aJ,width:aI/aZ,height:aR/aZ}}function aq(aK,j,aJ,aN,aO){var aL,aM,aH=parseFloat(j),aI=s(aJ,aN);aL=P(aJ,aN);if(!aL){return null}if(j.indexOf("%")>0){aH=aI*aH/100}else{aH=aH*aO}aM=aL.getContext("2d");aM.globalCompositeOperation="source-over";aM.fillStyle="#fff";if(aH>=aI/2){aH=aD(aJ,aN)/2;aM.beginPath();aM.moveTo(aJ/2,aN/2);aM.arc(aJ/2,aN/2,aH,0,2*Math.PI,false);aM.fill();aM.closePath()}else{aH=aD(aJ/2,aN/2,aH);ar(aM,0,0,aJ,aN,aH,true);aM.fill()}aM.globalCompositeOperation="source-in";aM.drawImage(aK,0,0,aJ,aN);return aL}function Z(aN,aT,aP,aJ,aR,aS,aI){var aU=L(aI[0]),aO=L(aI[1]),aK=aT+(aU>aS?aU+aS:aS*2)*aJ,j=aP+(aO>aS?aO+aS:aS*2)*aJ,aM=aJ*((aS||0)+(aI[0]<0?aU:0)),aH=aJ*((aS||0)+(aI[1]<0?aO:0)),aL,aQ;aL=P(aK,j);if(!aL){return null}aQ=aL.getContext("2d");aR&&(aQ.shadowColor=aR);aS&&(aQ.shadowBlur=aS*aJ);aI&&(aQ.shadowOffsetX=aI[0]*aJ,aQ.shadowOffsetY=aI[1]*aJ);aQ.drawImage(aN,aM,aH,aT,aP);return{image:aL,width:aK/aJ,height:j/aJ}}function t(aT,aL,aR){var aS=parseInt(aT.toString().length*aR),aK=parseInt(aR*2*aT.length),aI=P(aS,aK),aO,j,aJ,aN,aQ,aP,aH,aM;if(!aI){return null}aO=aI.getContext("2d");aO.fillStyle="#000";aO.fillRect(0,0,aS,aK);X(aO,aR+"px "+aL,"#fff",aT,0,0,0,0,[],"centre");j=aO.getImageData(0,0,aS,aK);aJ=j.width;aN=j.height;aM={min:{x:aJ,y:aN},max:{x:-1,y:-1}};for(aP=0;aP<aN;++aP){for(aQ=0;aQ<aJ;++aQ){aH=(aP*aJ+aQ)*4;if(j.data[aH+1]>0){if(aQ<aM.min.x){aM.min.x=aQ}if(aQ>aM.max.x){aM.max.x=aQ}if(aP<aM.min.y){aM.min.y=aP}if(aP>aM.max.y){aM.max.y=aP}}}}if(aJ!=aS){aM.min.x*=(aS/aJ);aM.max.x*=(aS/aJ)}if(aN!=aK){aM.min.y*=(aS/aN);aM.max.y*=(aS/aN)}aI=null;return aM}function o(i){return"'"+i.replace(/(\'|\")/g,"").replace(/\s*,\s*/g,"', '")+"'"}function ad(i,j,aH){aH=aH||C;if(aH.addEventListener){aH.addEventListener(i,j,false)}else{aH.attachEvent("on"+i,j)}}function a(i,j,aH){aH=aH||C;if(aH.removeEventListener){aH.removeEventListener(i,j)}else{aH.detachEvent("on"+i,j)}}function aw(aL,aH,aP,aK){var aQ=aK.imageScale,aN,aI,aM,j,aJ,aO;if(!aH.complete){return ad("load",function(){aw(aL,aH,aP,aK)},aH)}if(!aL.complete){return ad("load",function(){aw(aL,aH,aP,aK)},aL)}aH.width=aH.width;aH.height=aH.height;if(aQ){aL.width=aH.width*aQ;aL.height=aH.height*aQ}aP.iw=aL.width;aP.ih=aL.height;if(aK.txtOpt){aI=aL;aN=aK.zoomMax*aK.txtScale;aJ=aP.iw*aN;aO=aP.ih*aN;if(aJ<aH.naturalWidth||aO<aH.naturalHeight){aI=ax(aL,aJ,aO);if(aI){aP.fimage=aI}}else{aJ=aP.iw;aO=aP.ih;aN=1}if(parseFloat(aK.imageRadius)){aP.image=aP.fimage=aL=aq(aP.image,aK.imageRadius,aJ,aO,aN)}if(!aP.HasText()){if(aK.shadow){aI=Z(aP.image,aJ,aO,aN,aK.shadow,aK.shadowBlur,aK.shadowOffset);if(aI){aP.fimage=aI.image;aP.w=aI.width;aP.h=aI.height}}if(aK.bgColour||aK.bgOutlineThickness){aM=aK.bgColour=="tag"?Y(aP.a,"background-color"):aK.bgColour;j=aK.bgOutline=="tag"?Y(aP.a,"color"):(aK.bgOutline||aK.textColour);aJ=aP.fimage.width;aO=aP.fimage.height;if(aK.outlineMethod=="colour"){aI=aC(aP.fimage,aJ,aO,aN,aM,aK.bgOutlineThickness,aP.outline.colour,aK.padding,aK.bgRadius,1);if(aI){aP.oimage=aI.image}}aI=aC(aP.fimage,aJ,aO,aN,aM,aK.bgOutlineThickness,j,aK.padding,aK.bgRadius);if(aI){aP.fimage=aI.image;aP.w=aI.width;aP.h=aI.height}}if(aK.outlineMethod=="size"){if(aK.outlineIncrease>0){aP.iw+=2*aK.outlineIncrease;aP.ih+=2*aK.outlineIncrease;aJ=aN*aP.iw;aO=aN*aP.ih;aI=ax(aP.fimage,aJ,aO);aP.oimage=aI;aP.fimage=v(aP.fimage,aP.oimage.width,aP.oimage.height)}else{aJ=aN*(aP.iw+(2*aK.outlineIncrease));aO=aN*(aP.ih+(2*aK.outlineIncrease));aI=ax(aP.fimage,aJ,aO);aP.oimage=v(aI,aP.fimage.width,aP.fimage.height)}}}}aP.Init()}function Y(aI,aH){var j=C.defaultView,i=aH.replace(/\-([a-z])/g,function(aJ){return aJ.charAt(1).toUpperCase()});return(j&&j.getComputedStyle&&j.getComputedStyle(aI,null).getPropertyValue(aH))||(aI.currentStyle&&aI.currentStyle[i])}function u(j,aI,aH){var i=1,aJ;if(aI){i=1*(j.getAttribute(aI)||aH)}else{if(aJ=Y(j,"font-size")){i=(aJ.indexOf("px")>-1&&aJ.replace("px","")*1)||(aJ.indexOf("pt")>-1&&aJ.replace("pt","")*1.25)||aJ*3.3}}return i}function f(i){return i.target&&ai(i.target.id)?i.target.id:i.srcElement.parentNode.id}function S(aJ,aK){var aI,aH,i=parseInt(Y(aK,"width"))/aK.width,j=parseInt(Y(aK,"height"))/aK.height;if(ai(aJ.offsetX)){aI={x:aJ.offsetX,y:aJ.offsetY}}else{aH=ab(aK.id);if(ai(aJ.changedTouches)){aJ=aJ.changedTouches[0]}if(aJ.pageX){aI={x:aJ.pageX-aH.x,y:aJ.pageY-aH.y}}}if(aI&&i&&j){aI.x/=i;aI.y/=j}return aI}function B(aH){var j=aH.target||aH.fromElement.parentNode,i=y.tc[j.id];if(i){i.mx=i.my=-1;i.UnFreeze();i.EndDrag()}}function af(aL){var aI,aH=y,j,aK,aJ=f(aL);for(aI in aH.tc){j=aH.tc[aI];if(j.tttimer){clearTimeout(j.tttimer);j.tttimer=null}}if(aJ&&aH.tc[aJ]){j=aH.tc[aJ];if(aK=S(aL,j.canvas)){j.mx=aK.x;j.my=aK.y;j.Drag(aL,aK)}j.drawn=0}}function z(aI){var j=y,i=C.addEventListener?0:1,aH=f(aI);if(aH&&aI.button==i&&j.tc[aH]){j.tc[aH].BeginDrag(aI)}}function aE(aJ){var aH=y,j=C.addEventListener?0:1,aI=f(aJ),i;if(aI&&aJ.button==j&&aH.tc[aI]){i=aH.tc[aI];af(aJ);if(!i.EndDrag()&&!i.touchState){i.Clicked(aJ)}}}function T(aI){var j=f(aI),i=(j&&y.tc[j]),aH;if(i&&aI.changedTouches){if(aI.touches.length==1&&i.touchState==0){i.touchState=1;i.BeginDrag(aI);if(aH=S(aI,i.canvas)){i.mx=aH.x;i.my=aH.y;i.drawn=0}}else{if(aI.targetTouches.length==2&&i.pinchZoom){i.touchState=3;i.EndDrag();i.BeginPinch(aI)}else{i.EndDrag();i.EndPinch();i.touchState=0}}}}function r(aH){var j=f(aH),i=(j&&y.tc[j]);if(i&&aH.changedTouches){switch(i.touchState){case 1:i.Draw();i.Clicked();break;case 2:i.EndDrag();break;case 3:i.EndPinch()}i.touchState=0}}function az(aL){var aI,aH=y,j,aK,aJ=f(aL);for(aI in aH.tc){j=aH.tc[aI];if(j.tttimer){clearTimeout(j.tttimer);j.tttimer=null}}j=(aJ&&aH.tc[aJ]);if(j&&aL.changedTouches&&j.touchState){switch(j.touchState){case 1:case 2:if(aK=S(aL,j.canvas)){j.mx=aK.x;j.my=aK.y;if(j.Drag(aL,aK)){j.touchState=2}}break;case 3:j.Pinch(aL)}j.drawn=0}}function ag(aH){var i=y,j=f(aH);if(j&&i.tc[j]){aH.cancelBubble=true;aH.returnValue=false;aH.preventDefault&&aH.preventDefault();i.tc[j].Wheel((aH.wheelDelta||aH.detail)>0)}}function ac(aI){var aH,j=y;clearTimeout(j.scrollTimer);for(aH in j.tc){j.tc[aH].Pause()}j.scrollTimer=setTimeout(function(){var aK,aJ=y;for(aK in aJ.tc){aJ.tc[aK].Resume()}},j.scrollPause)}function O(){E(G())}function E(aI){var j=y.tc,aH;y.NextFrame(y.interval);aI=aI||G();for(aH in j){j[aH].Draw(aI)}}function ab(aH){var aK=C.getElementById(aH),i=aK.getBoundingClientRect(),aN=C.documentElement,aL=C.body,aM=window,aI=aM.pageXOffset||aN.scrollLeft,aO=aM.pageYOffset||aN.scrollTop,aJ=aN.clientLeft||aL.clientLeft,j=aN.clientTop||aL.clientTop;return{x:i.left+aI-aJ,y:i.top+aO-j}}function V(j,aI,aJ,aH){var i=j.radius*j.z1/(j.z1+j.z2+aI.z);return{x:aI.x*i*aJ,y:aI.y*i*aH,z:aI.z,w:(j.z1-aI.z)/j.z2}}function aB(i){this.e=i;this.br=0;this.line=[];this.text=[];this.original=i.innerText||i.textContent}aG=aB.prototype;aG.Empty=function(){for(var j=0;j<this.text.length;++j){if(this.text[j].length){return false}}return true};aG.Lines=function(aJ){var aI=aJ?1:0,aK,j,aH;aJ=aJ||this.e;aK=aJ.childNodes;j=aK.length;for(aH=0;aH<j;++aH){if(aK[aH].nodeName=="BR"){this.text.push(this.line.join(" "));this.br=1}else{if(aK[aH].nodeType==3){if(this.br){this.line=[aK[aH].nodeValue];this.br=0}else{this.line.push(aK[aH].nodeValue)}}else{this.Lines(aK[aH])}}}aI||this.br||this.text.push(this.line.join(" "));return this.text};aG.SplitWidth=function(aH,aO,aL,aK){var aJ,aI,aN,aM=[];aO.font=aK+"px "+aL;for(aJ=0;aJ<this.text.length;++aJ){aN=this.text[aJ].split(/\s+/);this.line=[aN[0]];for(aI=1;aI<aN.length;++aI){if(aO.measureText(this.line.join(" ")+" "+aN[aI]).width>aH){aM.push(this.line.join(" "));this.line=[aN[aI]]}else{this.line.push(aN[aI])}}aM.push(this.line.join(" "))}return this.text=aM};function J(i,j){this.ts=null;this.tc=i;this.tag=j;this.x=this.y=this.w=this.h=this.sc=1;this.z=0;this.pulse=1;this.pulsate=i.pulsateTo<1;this.colour=i.outlineColour;this.adash=~~i.outlineDash;this.agap=~~i.outlineDashSpace||this.adash;this.aspeed=i.outlineDashSpeed*1;if(this.colour=="tag"){this.colour=Y(j.a,"color")}else{if(this.colour=="tagbg"){this.colour=Y(j.a,"background-color")}}this.Draw=this.pulsate?this.DrawPulsate:this.DrawSimple;this.radius=i.outlineRadius|0;this.SetMethod(i.outlineMethod)}x=J.prototype;x.SetMethod=function(aH){var j={block:["PreDraw","DrawBlock"],colour:["PreDraw","DrawColour"],outline:["PostDraw","DrawOutline"],classic:["LastDraw","DrawOutline"],size:["PreDraw","DrawSize"],none:["LastDraw"]},i=j[aH]||j.outline;if(aH=="none"){this.Draw=function(){return 1}}else{this.drawFunc=this[i[1]]}this[i[0]]=this.Draw};x.Update=function(aN,aM,aO,aJ,aK,aL,aI,i){var j=this.tc.outlineOffset,aH=2*j;this.x=aK*aN+aI-j;this.y=aK*aM+i-j;this.w=aK*aO+aH;this.h=aK*aJ+aH;this.sc=aK;this.z=aL};x.Ants=function(aM){if(!this.adash){return}var aJ=this.adash,aL=this.agap,aP=this.aspeed,j=aJ+aL,aK=0,aI=aJ,i=aL,aO=0,aN=0,aH;if(aP){aN=L(aP)*(G()-this.ts)/50;if(aP<0){aN=8640000-aN}aP=~~aN%j}if(aP){if(aJ>=aP){aK=aJ-aP;aI=aP}else{i=j-aP;aO=aL-i}aH=[aK,i,aI,aO]}else{aH=[aJ,aL]}aM.setLineDash(aH)};x.DrawOutline=function(aL,i,aK,j,aH,aJ){var aI=aD(this.radius,aH/2,j/2);aL.strokeStyle=aJ;this.Ants(aL);ar(aL,i,aK,j,aH,aI,true)};x.DrawSize=function(aO,aR,aP,aS,aM,j,aT,aI,aQ){var aL=aT.w,aH=aT.h,aJ,aK,aN;if(this.pulsate){if(aT.image){aN=(aT.image.height+this.tc.outlineIncrease)/aT.image.height}else{aN=aT.oscale}aK=aT.fimage||aT.image;aJ=1+((aN-1)*(1-this.pulse));aT.h*=aJ;aT.w*=aJ}else{aK=aT.oimage}aT.alpha=1;aT.Draw(aO,aI,aQ,aK);aT.h=aH;aT.w=aL;return 1};x.DrawColour=function(aI,aL,aJ,aM,aH,i,aN,j,aK){if(aN.oimage){if(this.pulse<1){aN.alpha=1-at(this.pulse,2);aN.Draw(aI,j,aK,aN.fimage);aN.alpha=this.pulse}else{aN.alpha=1}aN.Draw(aI,j,aK,aN.oimage);return 1}return this[aN.image?"DrawColourImage":"DrawColourText"](aI,aL,aJ,aM,aH,i,aN,j,aK)};x.DrawColourText=function(aJ,aM,aK,aN,aH,i,aO,j,aL){var aI=aO.colour;aO.colour=i;aO.alpha=1;aO.Draw(aJ,j,aL);aO.colour=aI;return 1};x.DrawColourImage=function(aM,aP,aN,aQ,aL,i,aT,j,aO){var aR=aM.canvas,aJ=~~s(aP,0),aI=~~s(aN,0),aK=aD(aR.width-aJ,aQ)+0.5|0,aS=aD(aR.height-aI,aL)+0.5|0,aH;if(p){p.width=aK,p.height=aS}else{p=P(aK,aS)}if(!p){return this.SetMethod("outline")}aH=p.getContext("2d");aH.drawImage(aR,aJ,aI,aK,aS,0,0,aK,aS);aM.clearRect(aJ,aI,aK,aS);if(this.pulsate){aT.alpha=1-at(this.pulse,2)}else{aT.alpha=1}aT.Draw(aM,j,aO);aM.setTransform(1,0,0,1,0,0);aM.save();aM.beginPath();aM.rect(aJ,aI,aK,aS);aM.clip();aM.globalCompositeOperation="source-in";aM.fillStyle=i;aM.fillRect(aJ,aI,aK,aS);aM.restore();aM.globalAlpha=1;aM.globalCompositeOperation="destination-over";aM.drawImage(p,0,0,aK,aS,aJ,aI,aK,aS);aM.globalCompositeOperation="source-over";return 1};x.DrawBlock=function(aL,i,aK,j,aH,aJ){var aI=aD(this.radius,aH/2,j/2);aL.fillStyle=aJ;ar(aL,i,aK,j,aH,aI)};x.DrawSimple=function(aL,i,j,aI,aK,aJ){var aH=this.tc;aL.setTransform(1,0,0,1,0,0);aL.strokeStyle=this.colour;aL.lineWidth=aH.outlineThickness;aL.shadowBlur=aL.shadowOffsetX=aL.shadowOffsetY=0;aL.globalAlpha=aJ?aK:1;return this.drawFunc(aL,this.x,this.y,this.w,this.h,this.colour,i,j,aI)};x.DrawPulsate=function(aL,i,j,aI){var aJ=G()-this.ts,aH=this.tc,aK=aH.pulsateTo+((1-aH.pulsateTo)*(0.5+(w(2*Math.PI*aJ/(1000*aH.pulsateTime))/2)));this.pulse=aK=y.Smooth(1,aK);return this.DrawSimple(aL,i,j,aI,aK,1)};x.Active=function(aI,i,aH){var j=(i>=this.x&&aH>=this.y&&i<=this.x+this.w&&aH<=this.y+this.h);if(j){this.ts=this.ts||G()}else{this.ts=null}return j};x.PreDraw=x.PostDraw=x.LastDraw=aA;function e(aI,aS,aO,aR,aP,aJ,aH,aL,aQ,aK,aN,j,aM,i){this.tc=aI;this.image=null;this.text=aS;this.text_original=i;this.line_widths=[];this.title=aO.title||null;this.a=aO;this.position=new ae(aR[0],aR[1],aR[2]);this.x=this.y=this.z=0;this.w=aP;this.h=aJ;this.colour=aH||aI.textColour;this.bgColour=aL||aI.bgColour;this.bgRadius=aQ|0;this.bgOutline=aK||this.colour;this.bgOutlineThickness=aN|0;this.textFont=j||aI.textFont;this.padding=aM|0;this.sc=this.alpha=1;this.weighted=!aI.weight;this.outline=new J(aI,this)}c=e.prototype;c.Init=function(j){var i=this.tc;this.textHeight=i.textHeight;if(this.HasText()){this.Measure(i.ctxt,i)}else{this.w=this.iw;this.h=this.ih}this.SetShadowColour=i.shadowAlpha?this.SetShadowColourAlpha:this.SetShadowColourFixed;this.SetDraw(i)};c.Draw=aA;c.HasText=function(){return this.text&&this.text[0].length>0};c.EqualTo=function(aH){var j=aH.getElementsByTagName("img");if(this.a.href!=aH.href){return 0}if(j.length){return this.image.src==j[0].src}return(aH.innerText||aH.textContent)==this.text_original};c.SetImage=function(j){this.image=this.fimage=j};c.SetDraw=function(i){this.Draw=this.fimage?(i.ie>7?this.DrawImageIE:this.DrawImage):this.DrawText;i.noSelect&&(this.CheckActive=aA)};c.MeasureText=function(aK){var aI,aH=this.text.length,j=0,aJ;for(aI=0;aI<aH;++aI){this.line_widths[aI]=aJ=aK.measureText(this.text[aI]).width;j=s(j,aJ)}return j};c.Measure=function(aM,aP){var aN=t(this.text,this.textFont,this.textHeight),aQ,i,aJ,j,aH,aL,aO,aI,aK;aO=aN?aN.max.y+aN.min.y:this.textHeight;aM.font=this.font=this.textHeight+"px "+this.textFont;aL=this.MeasureText(aM);if(aP.txtOpt){aQ=aP.txtScale;i=aQ*this.textHeight;aJ=i+"px "+this.textFont;j=[aQ*aP.shadowOffset[0],aQ*aP.shadowOffset[1]];aM.font=aJ;aH=this.MeasureText(aM);aK=new g(this.text,aJ,aH+aQ,(aQ*aO)+aQ,aH,this.line_widths,aP.textAlign,aP.textVAlign,aQ);if(this.image){aK.SetImage(this.image,this.iw,this.ih,aP.imagePosition,aP.imagePadding,aP.imageAlign,aP.imageVAlign,aP.imageScale)}aI=aK.Create(this.colour,this.bgColour,this.bgOutline,aQ*this.bgOutlineThickness,aP.shadow,aQ*aP.shadowBlur,j,aQ*this.padding,aQ*this.bgRadius);if(aP.outlineMethod=="colour"){this.oimage=aK.Create(this.outline.colour,this.bgColour,this.outline.colour,aQ*this.bgOutlineThickness,aP.shadow,aQ*aP.shadowBlur,j,aQ*this.padding,aQ*this.bgRadius)}else{if(aP.outlineMethod=="size"){aN=t(this.text,this.textFont,this.textHeight+aP.outlineIncrease);i=aN.max.y+aN.min.y;aJ=(aQ*(this.textHeight+aP.outlineIncrease))+"px "+this.textFont;aM.font=aJ;aH=this.MeasureText(aM);aK=new g(this.text,aJ,aH+aQ,(aQ*i)+aQ,aH,this.line_widths,aP.textAlign,aP.textVAlign,aQ);if(this.image){aK.SetImage(this.image,this.iw+aP.outlineIncrease,this.ih+aP.outlineIncrease,aP.imagePosition,aP.imagePadding,aP.imageAlign,aP.imageVAlign,aP.imageScale)}this.oimage=aK.Create(this.colour,this.bgColour,this.bgOutline,aQ*this.bgOutlineThickness,aP.shadow,aQ*aP.shadowBlur,j,aQ*this.padding,aQ*this.bgRadius);this.oscale=this.oimage.width/aI.width;if(aP.outlineIncrease>0){aI=v(aI,this.oimage.width,this.oimage.height)}else{this.oimage=v(this.oimage,aI.width,aI.height)}}}if(aI){this.fimage=aI;aL=this.fimage.width/aQ;aO=this.fimage.height/aQ}this.SetDraw(aP);aP.txtOpt=!!this.fimage}this.h=aO;this.w=aL};c.SetFont=function(j,aI,aH,i){this.textFont=j;this.colour=aI;this.bgColour=aH;this.bgOutline=i;this.Measure(this.tc.ctxt,this.tc)};c.SetWeight=function(aH){var j=this.tc,aJ=j.weightMode.split(/[, ]/),i,aI,aK=aH.length;if(!this.HasText()){return}this.weighted=true;for(aI=0;aI<aK;++aI){i=aJ[aI]||"size";if("both"==i){this.Weight(aH[aI],j.ctxt,j,"size",j.min_weight[aI],j.max_weight[aI],aI);this.Weight(aH[aI],j.ctxt,j,"colour",j.min_weight[aI],j.max_weight[aI],aI)}else{this.Weight(aH[aI],j.ctxt,j,i,j.min_weight[aI],j.max_weight[aI],aI)}}this.Measure(j.ctxt,j)};c.Weight=function(aH,aM,aI,j,aL,aJ,aK){aH=isNaN(aH)?1:aH;var i=(aH-aL)/(aJ-aL);if("colour"==j){this.colour=k(aI,i,aK)}else{if("bgcolour"==j){this.bgColour=k(aI,i,aK)}else{if("bgoutline"==j){this.bgOutline=k(aI,i,aK)}else{if("outline"==j){this.outline.colour=k(aI,i,aK)}else{if("size"==j){if(aI.weightSizeMin>0&&aI.weightSizeMax>aI.weightSizeMin){this.textHeight=aI.weightSize*(aI.weightSizeMin+(aI.weightSizeMax-aI.weightSizeMin)*i)}else{this.textHeight=s(1,aH*aI.weightSize)}}}}}}};c.SetShadowColourFixed=function(aH,j,i){aH.shadowColor=j};c.SetShadowColourAlpha=function(aH,j,i){aH.shadowColor=U(j,i)};c.DrawText=function(aJ,aM,aI){var aN=this.tc,aL=this.x,aK=this.y,aO=this.sc,j,aH;aJ.globalAlpha=this.alpha;aJ.fillStyle=this.colour;aN.shadow&&this.SetShadowColour(aJ,aN.shadow,this.alpha);aJ.font=this.font;aL+=aM/aO;aK+=(aI/aO)-(this.h/2);for(j=0;j<this.text.length;++j){aH=aL;if("right"==aN.textAlign){aH+=this.w/2-this.line_widths[j]}else{if("centre"==aN.textAlign){aH-=this.line_widths[j]/2}else{aH-=this.w/2}}aJ.setTransform(aO,0,0,aO,aO*aH,aO*aK);aJ.fillText(this.text[j],0,0);aK+=this.textHeight}};c.DrawImage=function(aJ,aQ,aI,aL){var aN=this.x,aK=this.y,aR=this.sc,j=aL||this.fimage,aO=this.w,aH=this.h,aM=this.alpha,aP=this.shadow;aJ.globalAlpha=aM;aP&&this.SetShadowColour(aJ,aP,aM);aN+=(aQ/aR)-(aO/2);aK+=(aI/aR)-(aH/2);aJ.setTransform(aR,0,0,aR,aR*aN,aR*aK);aJ.drawImage(j,0,0,aO,aH)};c.DrawImageIE=function(aJ,aN,aI){var j=this.fimage,aO=this.sc,aM=j.width=this.w*aO,aH=j.height=this.h*aO,aL=(this.x*aO)+aN-(aM/2),aK=(this.y*aO)+aI-(aH/2);aJ.setTransform(1,0,0,1,0,0);aJ.globalAlpha=this.alpha;aJ.drawImage(j,aL,aK)};c.Calc=function(i,aH){var j,aK=this.tc,aJ=aK.minBrightness,aI=aK.maxBrightness,aL=aK.max_radius;j=i.xform(this.position);this.xformed=j;j=V(aK,j,aK.stretchX,aK.stretchY);this.x=j.x;this.y=j.y;this.z=j.z;this.sc=j.w;this.alpha=aH*av(aJ+(aI-aJ)*(aL-this.z)/(2*aL),0,1);return this.xformed};c.UpdateActive=function(aM,aH,aK){var aJ=this.outline,j=this.w,aI=this.h,i=this.x-j/2,aL=this.y-aI/2;aJ.Update(i,aL,j,aI,this.sc,this.z,aH,aK);return aJ};c.CheckActive=function(aJ,i,aI){var j=this.tc,aH=this.UpdateActive(aJ,i,aI);return aH.Active(aJ,j.mx,j.my)?aH:null};c.Clicked=function(aK){var j=this.a,aH=j.target,aI=j.href,i;if(aH!=""&&aH!="_self"){if(self.frames[aH]){self.frames[aH].document.location=aI}else{try{if(top.frames[aH]){top.frames[aH].document.location=aI;return}}catch(aJ){}window.open(aI,aH)}return}if(C.createEvent){i=C.createEvent("MouseEvents");i.initMouseEvent("click",1,1,window,0,0,0,0,0,0,0,0,0,0,null);if(!j.dispatchEvent(i)){return}}else{if(j.fireEvent){if(!j.fireEvent("onclick")){return}}}C.location=aI};function y(aN,j,aI){var aH,aK,aM=C.getElementById(aN),aJ=["id","class","innerHTML"],aL;if(!aM){throw 0}if(ai(window.G_vmlCanvasManager)){aM=window.G_vmlCanvasManager.initElement(aM);this.ie=parseFloat(navigator.appVersion.split("MSIE")[1])}if(aM&&(!aM.getContext||!aM.getContext("2d").fillText)){aK=C.createElement("DIV");for(aH=0;aH<aJ.length;++aH){aK[aJ[aH]]=aM[aJ[aH]]}aM.parentNode.insertBefore(aK,aM);aM.parentNode.removeChild(aM);throw 0}for(aH in y.options){this[aH]=aI&&ai(aI[aH])?aI[aH]:(ai(y[aH])?y[aH]:y.options[aH])}this.canvas=aM;this.ctxt=aM.getContext("2d");this.z1=250/s(this.depth,0.001);this.z2=this.z1/this.zoom;this.radius=aD(aM.height,aM.width)*0.0075;this.max_radius=100;this.max_weight=[];this.min_weight=[];this.textFont=this.textFont&&o(this.textFont);this.textHeight*=1;this.imageRadius=this.imageRadius.toString();this.pulsateTo=av(this.pulsateTo,0,1);this.minBrightness=av(this.minBrightness,0,1);this.maxBrightness=av(this.maxBrightness,this.minBrightness,1);this.ctxt.textBaseline="top";this.lx=(this.lock+"").indexOf("x")+1;this.ly=(this.lock+"").indexOf("y")+1;this.frozen=this.dx=this.dy=this.fixedAnim=this.touchState=0;this.fixedAlpha=1;this.source=j||aN;this.repeatTags=aD(64,~~this.repeatTags);this.minTags=aD(200,~~this.minTags);if(~~this.scrollPause>0){y.scrollPause=~~this.scrollPause}else{this.scrollPause=0}if(this.minTags>0&&this.repeatTags<1&&(aH=this.GetTags().length)){this.repeatTags=ap(this.minTags/aH)-1}this.transform=R.Identity();this.startTime=this.time=G();this.mx=this.my=-1;this.centreImage&&ao(this);this.Animate=this.dragControl?this.AnimateDrag:this.AnimatePosition;this.animTiming=(typeof y[this.animTiming]=="function"?y[this.animTiming]:y.Smooth);if(this.shadowBlur||this.shadowOffset[0]||this.shadowOffset[1]){this.ctxt.shadowColor=this.shadow;this.shadow=this.ctxt.shadowColor;this.shadowAlpha=al()}else{delete this.shadow}this.Load();if(j&&this.hideTags){(function(i){if(y.loaded){i.HideTags()}else{ad("load",function(){i.HideTags()},window)}})(this)}this.yaw=this.initial?this.initial[0]*this.maxSpeed:0;this.pitch=this.initial?this.initial[1]*this.maxSpeed:0;if(this.tooltip){this.ctitle=aM.title;aM.title="";if(this.tooltip=="native"){this.Tooltip=this.TooltipNative}else{this.Tooltip=this.TooltipDiv;if(!this.ttdiv){this.ttdiv=C.createElement("div");this.ttdiv.className=this.tooltipClass;this.ttdiv.style.position="absolute";this.ttdiv.style.zIndex=aM.style.zIndex+1;ad("mouseover",function(i){i.target.style.display="none"},this.ttdiv);C.body.appendChild(this.ttdiv)}}}else{this.Tooltip=this.TooltipNone}if(!this.noMouse&&!b[aN]){b[aN]=[["mousemove",af],["mouseout",B],["mouseup",aE],["touchstart",T],["touchend",r],["touchcancel",r],["touchmove",az]];if(this.dragControl){b[aN].push(["mousedown",z]);b[aN].push(["selectstart",aA])}if(this.wheelZoom){b[aN].push(["mousewheel",ag]);b[aN].push(["DOMMouseScroll",ag])}if(this.scrollPause){b[aN].push(["scroll",ac,window])}for(aH=0;aH<b[aN].length;++aH){aK=b[aN][aH];ad(aK[0],aK[1],aK[2]?aK[2]:aM)}}if(!y.started){aL=window.requestAnimationFrame=window.requestAnimationFrame||window.mozRequestAnimationFrame||window.webkitRequestAnimationFrame||window.msRequestAnimationFrame;y.NextFrame=aL?y.NextFrameRAF:y.NextFrameTimeout;y.interval=this.interval;y.NextFrame(this.interval);y.started=1}}Q=y.prototype;Q.SourceElements=function(){if(C.querySelectorAll){return C.querySelectorAll("#"+this.source)}return[C.getElementById(this.source)]};Q.HideTags=function(){var aH=this.SourceElements(),j;for(j=0;j<aH.length;++j){aH[j].style.display="none"}};Q.GetTags=function(){var aM=this.SourceElements(),aL,aI=[],aK,aJ,aH;for(aH=0;aH<=this.repeatTags;++aH){for(aK=0;aK<aM.length;++aK){aL=aM[aK].getElementsByTagName("a");for(aJ=0;aJ<aL.length;++aJ){aI.push(aL[aJ])}}}return aI};Q.Message=function(aM){var aO=[],aI,j,aH=aM.split(""),aK,aN,aL,aJ;for(aI=0;aI<aH.length;++aI){if(aH[aI]!=" "){j=aI-aH.length/2;aK=C.createElement("A");aK.href="#";aK.innerText=aH[aI];aL=100*ah(j/9);aJ=-100*w(j/9);aN=new e(this,aH[aI],aK,[aL,0,aJ],2,18,"#000","#fff",0,0,0,"monospace",2,aH[aI]);aN.Init();aO.push(aN)}}return aO};Q.CreateTag=function(aL){var aO,aJ,aP,aK,aN,aH,aM,aI,j=[0,0,0];if("text"!=this.imageMode){aO=aL.getElementsByTagName("img");if(aO.length){aJ=new Image;aJ.src=aO[0].src;if(!this.imageMode){aP=new e(this,"",aL,j,0,0);aP.SetImage(aJ);aw(aJ,aO[0],aP,this);return aP}}}if("image"!=this.imageMode){aN=new aB(aL);aK=aN.Lines();if(!aN.Empty()){aH=this.textFont||o(Y(aL,"font-family"));if(this.splitWidth){aK=aN.SplitWidth(this.splitWidth,this.ctxt,aH,this.textHeight)}aM=this.bgColour=="tag"?Y(aL,"background-color"):this.bgColour;aI=this.bgOutline=="tag"?Y(aL,"color"):this.bgOutline}else{aN=null}}if(aN||aJ){aP=new e(this,aK,aL,j,2,this.textHeight+2,this.textColour||Y(aL,"color"),aM,this.bgRadius,aI,this.bgOutlineThickness,aH,this.padding,aN&&aN.original);if(aJ){aP.SetImage(aJ);aw(aJ,aO[0],aP,this)}else{aP.Init()}return aP}};Q.UpdateTag=function(aH,i){var aK=this.textColour||Y(i,"color"),j=this.textFont||o(Y(i,"font-family")),aJ=this.bgColour=="tag"?Y(i,"background-color"):this.bgColour,aI=this.bgOutline=="tag"?Y(i,"color"):this.bgOutline;aH.a=i;aH.title=i.title;if(aH.colour!=aK||aH.textFont!=j||aH.bgColour!=aJ||aH.bgOutline!=aI){aH.SetFont(j,aK,aJ,aI)}};Q.Weight=function(aN){var aJ=aN.length,aL,aH,aO,aK=[],j,aI=this.weightFrom?this.weightFrom.split(/[, ]/):[null],aM=aI.length;for(aH=0;aH<aJ;++aH){aK[aH]=[];for(aO=0;aO<aM;++aO){aL=u(aN[aH].a,aI[aO],this.textHeight);if(!this.max_weight[aO]||aL>this.max_weight[aO]){this.max_weight[aO]=aL}if(!this.min_weight[aO]||aL<this.min_weight[aO]){this.min_weight[aO]=aL}aK[aH][aO]=aL}}for(aO=0;aO<aM;++aO){if(this.max_weight[aO]>this.min_weight[aO]){j=1}}if(j){for(aH=0;aH<aJ;++aH){aN[aH].SetWeight(aK[aH])}}};Q.Load=function(){var aR=this.GetTags(),aM=[],aP,aQ,aL,aI,aH,j,aJ,aO,aK=[],aN={sphere:q,vcylinder:am,hcylinder:au,vring:d,hring:n};if(aR.length){aK.length=aR.length;for(aO=0;aO<aR.length;++aO){aK[aO]=aO}this.shuffleTags&&an(aK);aI=100*this.radiusX;aH=100*this.radiusY;j=100*this.radiusZ;this.max_radius=s(aI,s(aH,j));for(aO=0;aO<aR.length;++aO){aQ=this.CreateTag(aR[aK[aO]]);if(aQ){aM.push(aQ)}}this.weight&&this.Weight(aM,true);if(this.shapeArgs){this.shapeArgs[0]=aM.length}else{aL=this.shape.toString().split(/[(),]/);aP=aL.shift();if(typeof window[aP]==="function"){this.shape=window[aP]}else{this.shape=aN[aP]||aN.sphere}this.shapeArgs=[aM.length,aI,aH,j].concat(aL)}aJ=this.shape.apply(this,this.shapeArgs);this.listLength=aM.length;for(aO=0;aO<aM.length;++aO){aM[aO].position=new ae(aJ[aO][0],aJ[aO][1],aJ[aO][2])}}if(this.noTagsMessage&&!aM.length){aO=(this.imageMode&&this.imageMode!="both"?this.imageMode+" ":"");aM=this.Message("No "+aO+"tags")}this.taglist=aM};Q.Update=function(){var aQ=this.GetTags(),aP=[],aK=this.taglist,aR,aO=[],aM=[],aI,aN,aH,aL,aJ;if(!this.shapeArgs){return this.Load()}if(aQ.length){aH=this.listLength=aQ.length;aN=aK.length;for(aL=0;aL<aN;++aL){aP.push(aK[aL]);aM.push(aL)}for(aL=0;aL<aH;++aL){for(aJ=0,aR=0;aJ<aN;++aJ){if(aK[aJ].EqualTo(aQ[aL])){this.UpdateTag(aP[aJ],aQ[aL]);aR=aM[aJ]=-1}}if(!aR){aO.push(aL)}}for(aL=0,aJ=0;aL<aN;++aL){if(aM[aJ]==-1){aM.splice(aJ,1)}else{++aJ}}if(aM.length){an(aM);while(aM.length&&aO.length){aL=aM.shift();aJ=aO.shift();aP[aL]=this.CreateTag(aQ[aJ])}aM.sort(function(j,i){return j-i});while(aM.length){aP.splice(aM.pop(),1)}}aJ=aP.length/(aO.length+1);aL=0;while(aO.length){aP.splice(ap(++aL*aJ),0,this.CreateTag(aQ[aO.shift()]))}this.shapeArgs[0]=aH=aP.length;aI=this.shape.apply(this,this.shapeArgs);for(aL=0;aL<aH;++aL){aP[aL].position=new ae(aI[aL][0],aI[aL][1],aI[aL][2])}this.weight&&this.Weight(aP)}this.taglist=aP};Q.SetShadow=function(i){i.shadowBlur=this.shadowBlur;i.shadowOffsetX=this.shadowOffset[0];i.shadowOffsetY=this.shadowOffset[1]};Q.Draw=function(aR){if(this.paused){return}var aL=this.canvas,aJ=aL.width,aQ=aL.height,aT=0,aI=(aR-this.time)*y.interval/1000,aP=aJ/2+this.offsetX,aO=aQ/2+this.offsetY,aX=this.ctxt,aN,aY,aV,aH=-1,aK=this.taglist,aU=aK.length,j=this.frontSelect,aS=(this.centreFunc==aA),aM;this.time=aR;if(this.frozen&&this.drawn){return this.Animate(aJ,aQ,aI)}aM=this.AnimateFixed();aX.setTransform(1,0,0,1,0,0);for(aV=0;aV<aU;++aV){aK[aV].Calc(this.transform,this.fixedAlpha)}aK=A(aK,function(aZ,i){return i.z-aZ.z});if(aM&&this.fixedAnim.active){aN=this.fixedAnim.tag.UpdateActive(aX,aP,aO)}else{this.active=null;for(aV=0;aV<aU;++aV){aY=this.mx>=0&&this.my>=0&&this.taglist[aV].CheckActive(aX,aP,aO);if(aY&&aY.sc>aT&&(!j||aY.z<=0)){aN=aY;aH=aV;aN.tag=this.taglist[aV];aT=aY.sc}}this.active=aN}this.txtOpt||(this.shadow&&this.SetShadow(aX));aX.clearRect(0,0,aJ,aQ);for(aV=0;aV<aU;++aV){if(!aS&&aK[aV].z<=0){try{this.centreFunc(aX,aJ,aQ,aP,aO)}catch(aW){alert(aW);this.centreFunc=aA}aS=true}if(!(aN&&aN.tag==aK[aV]&&aN.PreDraw(aX,aK[aV],aP,aO))){aK[aV].Draw(aX,aP,aO)}aN&&aN.tag==aK[aV]&&aN.PostDraw(aX)}if(this.freezeActive&&aN){this.Freeze()}else{this.UnFreeze();this.drawn=(aU==this.listLength)}if(this.fixedCallback){this.fixedCallback(this,this.fixedCallbackTag);this.fixedCallback=null}aM||this.Animate(aJ,aQ,aI);aN&&aN.LastDraw(aX);aL.style.cursor=aN?this.activeCursor:"";this.Tooltip(aN,this.taglist[aH])};Q.TooltipNone=function(){};Q.TooltipNative=function(j,i){if(j){this.canvas.title=i&&i.title?i.title:""}else{this.canvas.title=this.ctitle}};Q.SetTTDiv=function(aI,j){var i=this,aH=i.ttdiv.style;if(aI!=i.ttdiv.innerHTML){aH.display="none"}i.ttdiv.innerHTML=aI;j&&(j.title=i.ttdiv.innerHTML);if(aH.display=="none"&&!i.tttimer){i.tttimer=setTimeout(function(){var aJ=ab(i.canvas.id);aH.display="block";aH.left=aJ.x+i.mx+"px";aH.top=aJ.y+i.my+24+"px";i.tttimer=null},i.tooltipDelay)}};Q.TooltipDiv=function(j,i){if(j&&i&&i.title){this.SetTTDiv(i.title,i)}else{if(!j&&this.mx!=-1&&this.my!=-1&&this.ctitle.length){this.SetTTDiv(this.ctitle)}else{this.ttdiv.style.display="none"}}};Q.Transform=function(aK,i,aM){if(i||aM){var j=ah(i),aL=w(i),aN=ah(aM),aJ=w(aM),aH=new R([aJ,0,aN,0,1,0,-aN,0,aJ]),aI=new R([1,0,0,0,aL,-j,0,j,aL]);aK.transform=aK.transform.mul(aH.mul(aI))}};Q.AnimateFixed=function(){var aH,j,aJ,i,aI;if(this.fadeIn){j=G()-this.startTime;if(j>=this.fadeIn){this.fadeIn=0;this.fixedAlpha=1}else{this.fixedAlpha=j/this.fadeIn}}if(this.fixedAnim){if(!this.fixedAnim.transform){this.fixedAnim.transform=this.transform}aH=this.fixedAnim,j=G()-aH.t0,aJ=aH.angle,i,aI=this.animTiming(aH.t,j);this.transform=aH.transform;if(j>=aH.t){this.fixedCallbackTag=aH.tag;this.fixedCallback=aH.cb;this.fixedAnim=this.yaw=this.pitch=0}else{aJ*=aI}i=R.Rotation(aJ,aH.axis);this.transform=this.transform.mul(i);return(this.fixedAnim!=0)}return false};Q.AnimatePosition=function(aH,aK,aI){var j=this,i=j.mx,aM=j.my,aJ,aL;if(!j.frozen&&i>=0&&aM>=0&&i<aH&&aM<aK){aJ=j.maxSpeed,aL=j.reverse?-1:1;j.lx||(j.yaw=((i*2*aJ/aH)-aJ)*aL*aI);j.ly||(j.pitch=((aM*2*aJ/aK)-aJ)*-aL*aI);j.initial=null}else{if(!j.initial){if(j.frozen&&!j.freezeDecel){j.yaw=j.pitch=0}else{j.Decel(j)}}}this.Transform(j,j.pitch,j.yaw)};Q.AnimateDrag=function(j,aJ,aI){var i=this,aH=100*aI*i.maxSpeed/i.max_radius/i.zoom;if(i.dx||i.dy){i.lx||(i.yaw=i.dx*aH/i.stretchX);i.ly||(i.pitch=i.dy*-aH/i.stretchY);i.dx=i.dy=0;i.initial=null}else{if(!i.initial){i.Decel(i)}}this.Transform(i,i.pitch,i.yaw)};Q.Freeze=function(){if(!this.frozen){this.preFreeze=[this.yaw,this.pitch];this.frozen=1;this.drawn=0}};Q.UnFreeze=function(){if(this.frozen){this.yaw=this.preFreeze[0];this.pitch=this.preFreeze[1];this.frozen=0}};Q.Decel=function(i){var aH=i.minSpeed,aI=L(i.yaw),j=L(i.pitch);if(!i.lx&&aI>aH){i.yaw=aI>i.z0?i.yaw*i.decel:0}if(!i.ly&&j>aH){i.pitch=j>i.z0?i.pitch*i.decel:0}};Q.Zoom=function(i){this.z2=this.z1*(1/i);this.drawn=0};Q.Clicked=function(aH){var i=this.active;try{if(i&&i.tag){if(this.clickToFront===false||this.clickToFront===null){i.tag.Clicked(aH)}else{this.TagToFront(i.tag,this.clickToFront,function(){i.tag.Clicked(aH)},true)}}}catch(j){}};Q.Wheel=function(j){var aH=this.zoom+this.zoomStep*(j?1:-1);this.zoom=aD(this.zoomMax,s(this.zoomMin,aH));this.Zoom(this.zoom)};Q.BeginDrag=function(i){this.down=S(i,this.canvas);i.cancelBubble=true;i.returnValue=false;i.preventDefault&&i.preventDefault()};Q.Drag=function(aJ,aI){if(this.dragControl&&this.down){var aH=this.dragThreshold*this.dragThreshold,j=aI.x-this.down.x,i=aI.y-this.down.y;if(this.dragging||j*j+i*i>aH){this.dx=j;this.dy=i;this.dragging=1;this.down=aI}}return this.dragging};Q.EndDrag=function(){var i=this.dragging;this.dragging=this.down=null;return i};function D(aH){var j=aH.targetTouches[0],i=aH.targetTouches[1];return F(at(i.pageX-j.pageX,2)+at(i.pageY-j.pageY,2))}Q.BeginPinch=function(i){this.pinched=[D(i),this.zoom];i.preventDefault&&i.preventDefault()};Q.Pinch=function(j){var aI,aH,i=this.pinched;if(!i){return}aH=D(j);aI=i[1]*aH/i[0];this.zoom=aD(this.zoomMax,s(this.zoomMin,aI));this.Zoom(this.zoom)};Q.EndPinch=function(i){this.pinched=null};Q.Pause=function(){this.paused=true};Q.Resume=function(){this.paused=false};Q.SetSpeed=function(j){this.initial=j;this.yaw=j[0]*this.maxSpeed;this.pitch=j[1]*this.maxSpeed};Q.FindTag=function(aH){if(!ai(aH)){return null}ai(aH.index)&&(aH=aH.index);if(!I(aH)){return this.taglist[aH]}var aI,aJ,j;if(ai(aH.id)){aI="id",aJ=aH.id}else{if(ai(aH.text)){aI="innerText",aJ=aH.text}}for(j=0;j<this.taglist.length;++j){if(this.taglist[j].a[aI]==aJ){return this.taglist[j]}}};Q.RotateTag=function(aP,aI,aO,i,aM,aH){var aN=aP.Calc(this.transform,1),aK=new ae(aN.x,aN.y,aN.z),aJ=aj(aO,aI),j=aK.angle(aJ),aL=aK.cross(aJ).unit();if(j==0){this.fixedCallbackTag=aP;this.fixedCallback=aM}else{this.fixedAnim={angle:-j,axis:aL,t:i,t0:G(),cb:aM,tag:aP,active:aH}}};Q.TagToFront=function(i,aH,aI,j){this.RotateTag(i,0,0,aH,aI,j)};y.Start=function(aH,i,j){y.Delete(aH);y.tc[aH]=new y(aH,i,j)};function ay(i,j){y.tc[j]&&y.tc[j][i]()}y.Linear=function(i,j){return j/i};y.Smooth=function(i,j){return 0.5-w(j*Math.PI/i)/2};y.Pause=function(i){ay("Pause",i)};y.Resume=function(i){ay("Resume",i)};y.Reload=function(i){ay("Load",i)};y.Update=function(i){ay("Update",i)};y.SetSpeed=function(j,i){if(I(i)&&y.tc[j]&&!isNaN(i[0])&&!isNaN(i[1])){y.tc[j].SetSpeed(i);return true}return false};y.TagToFront=function(j,i){if(!I(i)){return false}i.lat=i.lng=0;return y.RotateTag(j,i)};y.RotateTag=function(aH,i){if(I(i)&&y.tc[aH]){if(isNaN(i.time)){i.time=500}var j=y.tc[aH].FindTag(i);if(j){y.tc[aH].RotateTag(j,i.lat,i.lng,i.time,i.callback,i.active);return true}}return false};y.Delete=function(aI){var j,aH;if(b[aI]){aH=C.getElementById(aI);if(aH){for(j=0;j<b[aI].length;++j){a(b[aI][j][0],b[aI][j][1],aH)}}}delete b[aI];delete y.tc[aI]};y.NextFrameRAF=function(){requestAnimationFrame(E)};y.NextFrameTimeout=function(i){setTimeout(O,i)};y.tc={};y.options={z1:20000,z2:20000,z0:0.0002,freezeActive:false,freezeDecel:false,activeCursor:"pointer",pulsateTo:1,pulsateTime:3,reverse:false,depth:0.5,maxSpeed:0.05,minSpeed:0,decel:0.95,interval:20,minBrightness:0.1,maxBrightness:1,outlineColour:"#ffff99",outlineThickness:2,outlineOffset:5,outlineMethod:"outline",outlineRadius:0,textColour:"#ff99ff",textHeight:15,textFont:"Helvetica, Arial, sans-serif",shadow:"#000",shadowBlur:0,shadowOffset:[0,0],initial:null,hideTags:true,zoom:1,weight:false,weightMode:"size",weightFrom:null,weightSize:1,weightSizeMin:null,weightSizeMax:null,weightGradient:{0:"#f00",0.33:"#ff0",0.66:"#0f0",1:"#00f"},txtOpt:true,txtScale:2,frontSelect:false,wheelZoom:true,zoomMin:0.3,zoomMax:3,zoomStep:0.05,shape:"sphere",lock:null,tooltip:null,tooltipDelay:300,tooltipClass:"tctooltip",radiusX:1,radiusY:1,radiusZ:1,stretchX:1,stretchY:1,offsetX:0,offsetY:0,shuffleTags:false,noSelect:false,noMouse:false,imageScale:1,paused:false,dragControl:false,dragThreshold:4,centreFunc:aA,splitWidth:0,animTiming:"Smooth",clickToFront:false,fadeIn:0,padding:0,bgColour:null,bgRadius:0,bgOutline:null,bgOutlineThickness:0,outlineIncrease:4,textAlign:"centre",textVAlign:"middle",imageMode:null,imagePosition:null,imagePadding:2,imageAlign:"centre",imageVAlign:"middle",noTagsMessage:true,centreImage:null,pinchZoom:false,repeatTags:0,minTags:0,imageRadius:0,scrollPause:false,outlineDash:0,outlineDashSpace:0,outlineDashSpeed:1};for(M in y.options){y[M]=y.options[M]}window.TagCanvas=y;ad("load",function(){y.loaded=1},window)})();
// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, or any plugin's
// vendor/assets/javascripts directory can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// compiled file. JavaScript code in this file should be added after the last require_* statement.
//
// Read Sprockets README (https://github.com/rails/sprockets#sprockets-directives) for details
// about supported directives.
//












;
