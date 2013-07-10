(($, document, window) ->

    $['fn']['touchsupport'] = -> 
        !!('ontouchstart' of window) or (window.DocumentTouch and document instanceof DocumentTouch) or window.Touch or !!window.navigator.msPointerEnabled
    events = ['swipe', 'swipeLeft', 'swipeRight', 'swipeUp', 'swipeDown', 'doubleTap', 'tap', 'singleTap', 'longTap']
    touch = {}
    touchTimeout = tapTimeout = swipeTimeout = longTapTimeout = null
    longTapDelay = 750
    swipeDirection = (x1, x2, y1, y2) ->
        xDelta = Math.abs(x1 - x2)
        yDelta = Math.abs(y1 - y2)
        if xDelta >= yDelta 
            if x1 - x2 > 0 
                'Left' 
            else
                'Right'
        else if y1 - y2 > 0 
                'Up'
            else
                'Down'
    longTap = ->
        longTapTimeout = null
        if touch.last
            touch.el.trigger 'longTap'
            touch = {}
    cancelLongTap = ->
        if longTapTimeout then clearTimeout longTapTimeout
        longTapTimeout = null
    cancelTouch = ->
        if touchTimeout then clearTimeout touchTimeout
        if tapTimeout then clearTimeout tapTimeout
        if swipeTimeout then clearTimeout swipeTimeout
        if longTapTimeout then clearTimeout longTapTimeout
        touchTimeout = tapTimeout = swipeTimeout = longTapTimeout = null
        touch = {}
        this

    touchEvent = (e)->
        t = e.changedTouches[0] || e.targetTouches[0]
        switch e.type
            when "touchstart", "MSPointerDown"
                now = new Date()
                delta = now - (touch.last or now)
                touch.el = $(e.target)
                touchTimeout && clearTimeout(touchTimeout)
                touch.x1 = t.pageX
                touch.y1 = t.pageY
                if delta > 0 and delta <= 250 
                    touch.isDoubleTap = true
                touch.last = now
                longTapTimeout = setTimeout longTap, longTapDelay
                this
            when "touchmove", "MSPointerMove"
                cancelLongTap()
                touch.x2 = t.pageX
                touch.y2 = t.pageY
                if Math.abs(touch.x1 - touch.x2) > 10
                    e.preventDefault()
                this
            when "touchend", "MSPointerUp"
                cancelLongTap()
                # swipe
                if (touch.x2 and Math.abs(touch.x1 - touch.x2) > 30) or
                (touch.y2 and Math.abs(touch.y1 - touch.y2) > 30)
                    swipeTimeout = setTimeout ->
                        touch.el.trigger 'swipe'
                        touch.el.trigger 'swipe' + swipeDirection(touch.x1, touch.x2, touch.y1, touch.y2)
                        touch = {}
                    , 0

                # normal tap
                else if 'last' of touch
                    tapTimeout = setTimeout ->
                        touch.el.trigger 'tap'
                        if touch.isDoubleTap
                            touch.el.trigger 'doubleTap'
                            touch = {}
                        else 
                            touchTimeout = setTimeout ->
                                touchTimeout = null
                                touch.el.trigger 'singleTap'
                                touch = {}
                            , 250
                    , 0
                # cancelTouch()
                this
            when "touchcancel"
                cancelTouch()
                this
            else
                this

        this

    $(document).ready ->
        if $['fn']['touchsupport']
            if window.navigator.msPointerEnabled
                document.body.addEventListener "MSPointerDown", touchEvent, false
                document.body.addEventListener "MSPointerMove", touchEvent, false
                document.body.addEventListener "MSPointerUp", touchEvent, false
            
            document.body.addEventListener "touchstart", touchEvent,  true
            document.body.addEventListener "touchmove", touchEvent, true
            document.body.addEventListener "touchend", touchEvent, true
            document.body.addEventListener "touchcancel", cancelTouch, true
            window.addEventListener "scroll", cancelTouch, true

            for event in events
                $['fn'][event] = (callback) -> 
                    this["on"] event, callback

        this

)(jQuery, document, window)