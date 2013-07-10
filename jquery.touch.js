(function() {
  (function($, document, window) {
    var cancelLongTap, cancelTouch, events, longTap, longTapDelay, longTapTimeout, swipeDirection, swipeTimeout, tapTimeout, touch, touchEvent, touchTimeout;
    $['fn']['touchsupport'] = function() {
      return !!('ontouchstart' in window) || !!window.navigator.msPointerEnabled;
    };
    events = ['swipe', 'swipeLeft', 'swipeRight', 'swipeUp', 'swipeDown', 'doubleTap', 'tap', 'singleTap', 'longTap'];
    touch = {};
    touchTimeout = tapTimeout = swipeTimeout = longTapTimeout = null;
    longTapDelay = 750;
    swipeDirection = function(x1, x2, y1, y2) {
      var xDelta, yDelta;
      xDelta = Math.abs(x1 - x2);
      yDelta = Math.abs(y1 - y2);
      if (xDelta >= yDelta) {
        if (x1 - x2 > 0) {
          return 'Left';
        } else {
          return 'Right';
        }
      } else if (y1 - y2 > 0) {
        return 'Up';
      } else {
        return 'Down';
      }
    };
    longTap = function() {
      longTapTimeout = null;
      if (touch.last) {
        touch.el.trigger('longTap');
        return touch = {};
      }
    };
    cancelLongTap = function() {
      if (longTapTimeout) {
        clearTimeout(longTapTimeout);
      }
      return longTapTimeout = null;
    };
    cancelTouch = function() {
      if (touchTimeout) {
        clearTimeout(touchTimeout);
      }
      if (tapTimeout) {
        clearTimeout(tapTimeout);
      }
      if (swipeTimeout) {
        clearTimeout(swipeTimeout);
      }
      if (longTapTimeout) {
        clearTimeout(longTapTimeout);
      }
      touchTimeout = tapTimeout = swipeTimeout = longTapTimeout = null;
      touch = {};
      return this;
    };
    touchEvent = function(e) {
      var delta, now, t;
      t = e.changedTouches[0] || e.targetTouches[0];
      switch (e.type) {
        case "touchstart":
        case "MSPointerDown":
          now = new Date();
          delta = now - (touch.last || now);
          touch.el = $(e.target);
          touchTimeout && clearTimeout(touchTimeout);
          touch.x1 = t.pageX;
          touch.y1 = t.pageY;
          if (delta > 0 && delta <= 250) {
            touch.isDoubleTap = true;
          }
          touch.last = now;
          longTapTimeout = setTimeout(longTap, longTapDelay);
          this;
          break;
        case "touchmove":
        case "MSPointerMove":
          cancelLongTap();
          touch.x2 = t.pageX;
          touch.y2 = t.pageY;
          if (Math.abs(touch.x1 - touch.x2) > 10) {
            e.preventDefault();
          }
          this;
          break;
        case "touchend":
        case "MSPointerUp":
          cancelLongTap();
          if ((touch.x2 && Math.abs(touch.x1 - touch.x2) > 30) || (touch.y2 && Math.abs(touch.y1 - touch.y2) > 30)) {
            swipeTimeout = setTimeout(function() {
              touch.el.trigger('swipe');
              touch.el.trigger('swipe' + swipeDirection(touch.x1, touch.x2, touch.y1, touch.y2));
              return touch = {};
            }, 0);
          } else if ('last' in touch) {
            tapTimeout = setTimeout(function() {
              touch.el.trigger('tap');
              if (touch.isDoubleTap) {
                touch.el.trigger('doubleTap');
                return touch = {};
              } else {
                return touchTimeout = setTimeout(function() {
                  touchTimeout = null;
                  touch.el.trigger('singleTap');
                  return touch = {};
                }, 250);
              }
            }, 0);
          }
          this;
          break;
        case "touchcancel":
          cancelTouch();
          this;
          break;
        default:
          this;
      }
      return this;
    };
    return $(document).ready(function() {
      var event, _i, _len;
      if ($['fn']['touchsupport']) {
        if (window.navigator.msPointerEnabled) {
          document.body.addEventListener("MSPointerDown", touchEvent, false);
          document.body.addEventListener("MSPointerMove", touchEvent, false);
          document.body.addEventListener("MSPointerUp", touchEvent, false);
        }
        document.body.addEventListener("touchstart", touchEvent, true);
        document.body.addEventListener("touchmove", touchEvent, true);
        document.body.addEventListener("touchend", touchEvent, true);
        document.body.addEventListener("touchcancel", cancelTouch, true);
        window.addEventListener("scroll", cancelTouch, true);
        for (_i = 0, _len = events.length; _i < _len; _i++) {
          event = events[_i];
          $['fn'][event] = function(callback) {
            return this["on"](event, callback);
          };
        }
      }
      return this;
    });
  })(jQuery, document, window);

}).call(this);
