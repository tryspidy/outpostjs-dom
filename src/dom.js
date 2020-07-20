import Render from "./render";


Outpost.plugin(function(_) {

    const $eventStack = [];
    const $functionStack = [];

    class DOM {
        constructor(selector) {
            if (_.isFunction(selector)) {
                if (document.readyState !== "loading") {
                    selector.call(document);
                } else {
                    $functionStack.push(selector);
                }
            } else if (selector instanceof Document) {
                this.push(selector);
            } else {
                this.$pushSelector(selector);
            }
        }

        ready(func) {
            if (_.isFunction(func)) {
                if (document.readyState !== "loading") {
                    func.call(document);
                } else {
                    $functionStack.push(func);
                }
            }
            return this;
        }

        render(html) {
            new Render(html, this[0]);
            return this;
        }

        get(index) {
            return new DOM(this[index]);
        }

        extend() {
            for (let i = 0; i < arguments.length; i++) {
                this.$pushSelector(arguments[i]);
            }
            return this;
        }

        addClass(s) {
            let cls = s.split(" ");
            _.forEach(this, el => {
                for (let i = 0; i < cls.length; i++) {
                    el.classList.add(cls[i].trim());
                }
            });
            return this;
        }

        removeClass(s) {
            let cls = s.split(" ");
            _.forEach(this, el => {
                for (let i = 0; i < cls.length; i++) {
                    el.classList.remove(cls[i].trim());
                }
            });
            return this;
        }

        forEach(callback) {
            _.forEach(this, (el, index, arr) => {
                callback.call(new DOM(el), index, arr);
            });
            return this;
        }

        toggleClass(s) {
            let cls = s.split(" ");
            _.forEach(this, el => {
                for (let i = 0; i < cls.length; i++) {
                    let cl = cls[i].trim();
                    if (el.classList.contains(cl)) {
                        el.classList.remove(cl);
                    } else {
                        el.classList.add(cl);
                    }
                }
            });
            return this;
        }

        append() {
            for (let k = 0; k < arguments.length; k++) {
                let sel = arguments[k];
                if (_.isString(sel)) {
                    let elements = new DOM(sel);
                    for (let i = 0; i < elements.length; i++) {
                        for (let j = 0; j < this.length; j++) {
                            this[j].appendChild(elements[i]);
                        }
                    }
                } else if (_.isElement(sel)) {
                    for (let i = 0; i < this.length; i++) {
                        this[i].appendChild(sel);
                    }
                } else if (_.isIterable(sel) || _.isArray(sel)) {
                    for (let i = 0; i < sel.length; i++) {
                        if (_.isElement(sel[i])) {
                            for (let j = 0; j < this.length; j++) {
                                this[j].appendChild(sel[i]);
                            }
                        }
                    }
                }
            }
        
            return this;
        }

        prepend() {
            for (let k = 0; k < arguments.length; k++) {
                let sel = arguments[k];
                if (_.isString(sel)) {
                    _.forEach(new DOM(sel), el => {
                        _.forEach(this, el2 => {
                            el2.insertBefore(el, el2.childNodes[0]);
                        });
                    });
                } else if (_.isElement(sel)) {
                    _.forEach(this, el => {
                        el.insertBefore(sel, el.childNodes[0]);
                    });
                } else if (_.isIterable(sel)) {
                    _.forEach(sel, el => {
                        if (_.isElement(el)) {
                            _.forEach(this, el2 => {
                                el2.insertBefore(el, el2.childNodes[0]);
                            });
                        }
                    });
                }
            }
            return this;
        }


        html(s) {
            if (s === undefined || s === null) return this[0].innerHTML;
            
            for (let i = 0; i < this.length; i++) {
                this[i].innerHTML = s;   
            }
            return this;
        }

        text(s) {
            if (s === undefined || s === null) return this[0].textContent;
            for (let i = 0; i < this.length; i++) {
                this[i].innerHTML = _.escape(s);   
            }
            return this;
        }
        
        attr(key, val) {
            if (val === undefined || val === null) {
                return this[0].getAttribute(key);
            }
            
            _.forEach(this, el => {
                el.setAttribute(key, val);
            });
            return this;
        }

        on(event, callback) {
            return this.bind(event, callback);
        }

        bind(event, callback) {
            let events = event.split(" ");
            _.forEach(this, el => {
                $eventStack.push({
                    "element": el,
                    "callback": callback,
                    "event": event
                });
                
                for (let j = 0; j < events.length; j++) {
                    el.addEventListener(events[j].trim(), callback, false);
                }
            });
            return this;
        }

        unbind(event) {
            let events = event.split(" ");
            let toRemoveEvent = [];
            _.forEach(this, el => {
                for (let j = 0; j < events.length; j++) {
                    _.forEach($eventStack, (evt, i) => {
                        if (_.isSameObject(el, evt["element"]) && events[j] === evt["event"]) {
                            el.removeEventListener(evt["event"], evt["callback"]);
                            toRemoveEvent.push(i);
                        }
                    });
                }
            });
            
            _.forEach(toRemoveEvent, evt => {
                $eventStack.splice(evt, 1);
            });
            
            return this;
        }

        disable() {
            _.forEach(this, el => el.disabled = true);
            return this;
        }
        
        enable() {
            _.forEach(this, el => el.disabled = false);
            return this;
        }

        isDisabled() {
            return this[0].disabled;
        }

        children() {
            return new DOM(this[0].children);
        }

        click(callback) {
            return this.bind("click", callback);
        }

        css(style, val) {
            if (val === null || val === undefined) {
                if (_.isString(style)) {
                    return window.getComputedStyle(this[0]).getPropertyValue(style);
                } else {
                    _.forEach(_.keys(style), prop => {
                        let value = style[prop];
                        _.forEach(this, el => {
                            el.style[prop] = value;
                        });
                    });
                }
            } else {
                _.forEach(this, el => {
                    el.style[style] = val;
                });
            }
            return this;
        }

        siblings() {
            let sibs = [];
            _.forEach(this, currentElement => {
                _.forEach(currentElement.parentNode.children, child => {
                    if (!_.isSameObject(child, currentElement)) {
                        sibs.push(child);
                    }
                });
            });
            
            return new DOM(sibs);
        }

        first() {
            return new DOM(this[0]);
        }
        
        last() {
            return new DOM(this[this.length - 1]);
        }

        filter(sel) {
            let container = document.createElement("div");
            let newElements = [];
            
            _.forEach(this, el => {
                container.innerHTML = "";
                container.appendChild(el.cloneNode());
                
                if (container.querySelector(sel) === null) {
                    newElements.push(el);
                }
            });
            
            return new DOM(newElements);
        }


        height(val) {
            if (val === undefined || val === null || !_.isNumber(val)) return this[0].offsetHeight;
            this.css("height", val + "px");
            return this;
        }
        
        width(val) {
            if (val === undefined || val === null || !_.isNumber(val)) return this[0].offsetWidth;
            this.css("width", val + "px");
            return this;
        }
        
        innerHeight() {
            return this[0].clientHeight;
        }
        
        innerWidth() {
            return this[0].clientWidth;
        }

        hide() {
            _.forEach(this, el => el.style.visibility = "hidden");
            return this;
        }
        
        show() {
            _.forEach(this, el => el.style.visibility = "visible");
            return this;
        }

        offset() {
            let el = this[0];
            let _x = 0;
            let _y = 0;
            while( el && !isNaN( el.offsetLeft ) && !isNaN( el.offsetTop ) ) {
                _x += el.offsetLeft - el.scrollLeft;
                _y += el.offsetTop - el.scrollTop;
                el = el.offsetParent;
            }
            return { top: _y, left: _x, x: _x, y: _y };
        }

        parent() {
            return new DOM(this[0].parentNode);
        }

        parents() {
            let ps = [];
            _.forEach(this, el => {
                let isContains = false;
                _.forEach(ps, p => {
                    if (_.isSameObject(p, el.parentNode)) {
                        isContains = true;
                        return true;
                    }
                });
                if (!isContains) {
                    ps.push(el.parentNode);
                }
            });
            return new DOM(ps);
        }

        removeAttr(key) {
            _.forEach(this, el => el.removeAttribute(key));
            return this;
        }

        remove() {
            _.forEach(this, el => el.remove());
            return this;
        }

        href() {
            return this[0].href;
        }

        src() {
            return this[0].currentSrc;
        }

        action() {
            return this[0].action;
        }
        
        val(s=null) {
            if (s === null) return this[0].value;
            _.forEach(this, el => el.value = s);
        }
    
    
        $isContains(element) {
            let isContains = false;
            _.forEach(this, el => {
                if (_.isSameObject(element, el)) {
                    isContains = true;
                    return true;
                }
            });
            return isContains;
        }

        $pushSelector(selector) {
            if (_.isString(selector)) {
                if (/<[a-z][\s\S]*>/i.test(selector)) {
                    let el = document.createElement("div");
                    el.innerHTML = selector;
                    
                    _.forEach(el.children, el => {
                        this.push(el);
                    });
                } else {
                    _.forEach(document.querySelectorAll(selector), el => {
                        if (!this.$isContains(el)) {
                            this.push(el);
                        }
                    });
                }
            } else if (_.isElement(selector)) {
                if (!this.$isContains(selector)) {
                    this.push(selector);
                }
            } else if (_.isIterable(selector)) {
                _.forEach(selector, el => {
                    if (_.isElement(el) && !this.$isContains(el)) this.push(el);
                });
            }
        }
    }
    
    DOM.prototype.__proto__ = [];

    if (document.addEventListener) {
        document.addEventListener("DOMContentLoaded", function() {
            for (const func of $functionStack) {
                func.call(this);
            }
        }, false);
    } else {
        document.attachEvent('onreadystatechange', function() {
            if (document.readyState != 'loading') {
                for (const func of $functionStack) {
                    func.call(this);
                }
            }
        });
    }

    _.dom = function(selector) {
        return new DOM(selector);
    };
})
