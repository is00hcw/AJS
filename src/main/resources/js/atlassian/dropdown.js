

/*global AJS, document, setTimeout */

AJS.dropDown = function (obj, usroptions) {

    var dd = null,
        result = [],
        moving = false,
        $doc = AJS.$(document),
        isAdditionalProperty = function (name) {
            return !((name == "href") || (name == "name") || (name == "className") || (name == "icon"));
        },
        options = {
            isHiddenByDefault: false,
            item: "li:has(a)",
            activeClass: "active",
            alignment: "right",
            escapeHandler: function () {
                this.hide("escape");
                return false;
            },
            hideHandler: function() {},
            moveHandler: function(selection,dir) {}
        };
    AJS.$.extend(options, usroptions);
    options.alignment = {left:"left",right:"right"}[options.alignment.toLowerCase()]  || "left";
    if (obj && obj.jquery) { // if AJS.$
        dd = obj;
    } else if (typeof obj == "string") { // if AJS.$ selector
        dd = AJS.$(obj);
    } else if (obj && obj.constructor == Array) { // if JSON
        dd = AJS("div").addClass("aui-dropdown").toggleClass("hidden", !!options.isHiddenByDefault);
        for (var i = 0, ii = obj.length; i < ii; i++) {
            var ol = AJS("ol");
            for (var j = 0, jj = obj[i].length; j < jj; j++) {
                var li = AJS("li");
                var properties = obj[i][j];
                if (properties.href) {
                    li.append(AJS("a")
                        .html("<span>" + properties.name + "</span>")
                        .attr({href:  properties.href})
                        .addClass(properties.className));

                    // deprecated - use the properties on the li, not the span
                    AJS.$.data(AJS.$("a > span", li)[0], "properties", properties);
                } else {
                    li.html(properties.html).addClass(properties.className);
                }
                if (properties.icon) {
                    li.prepend(AJS("img").attr("src", properties.icon));
                }
                AJS.$.data(li[0], "properties", properties);
                ol.append(li);
            }
            if (i == ii - 1) {
                ol.addClass("last");
            }
            dd.append(ol);
        }
        AJS.$("body").append(dd);
    } else {
        throw new Error("AJS.dropDown function was called with illegal parameter. Should be AJS.$ object, AJS.$ selector or array.");
    }

    var moveDown = function() {
        move(+1);
    };

     var moveUp = function() {
        move(-1);
    };

    var move = function(dir) {
        var trigger = !moving,
            cdd = AJS.dropDown.current.$[0],
            links = AJS.dropDown.current.links,
            oldFocus = cdd.focused;
        moving = true;

        cdd.focused = (typeof cdd.focused == "number" ? cdd.focused : -1);

        if (!AJS.dropDown.current) {
            AJS.log("move - not current, aborting");
            return true;
        }

        cdd.focused = cdd.focused + dir;
        if (cdd.focused < 0) {
            cdd.focused = links.length - 1;
        }
        if (cdd.focused > links.length - 1) {
            cdd.focused = 0;
        }

        options.moveHandler(AJS.$(links[cdd.focused]), dir < 0 ? "up" : "down");
        if (trigger && links.length) {
            AJS.$(links[cdd.focused]).addClass(options.activeClass);
            moving = false;
        } else if(!links.length) {
            moving = false;
        }
    };

    var moveFocus = function (e) {
        if (!AJS.dropDown.current) {
            return true;
        }
        var c = e.which,
            cdd = AJS.dropDown.current.$[0],
            links = AJS.dropDown.current.links;

        AJS.dropDown.current.cleanActive();
        switch (c) {
            case 40: {
                moveDown();
                break;
            }
            case 38:{
                moveUp();
                break;
            }
            case 27:{
                return options.escapeHandler.call(AJS.dropDown.current, e);
            }
            case 13:{
                if (cdd.focused >= 0) {
                    if(!options.selectionHandler){
                        if(AJS.$(links[cdd.focused]).attr("nodeName")!='a'){
                            return AJS.$("a", links[cdd.focused]).trigger("focus");    //focus on the "a" within the parent item elements
                        } else {
                            return AJS.$(links[cdd.focused]).trigger("focus");     //focus on the "a"
                        }
                    } else {
                        return options.selectionHandler.call(AJS.dropDown.current, e, AJS.$(links[cdd.focused]));   //call the selection handler
                    }
                }
                return true;
            }
            default:{
                if (links.length) {
                    AJS.$(links[cdd.focused]).addClass(options.activeClass);
                }
                return true;
            }
        }

        e.stopPropagation();
        e.preventDefault();
        return false;
    };

    var hider = function (e) {
        if (!((e && e.which && (e.which == 3)) || (e && e.button && (e.button == 2)) || false)) { // right click check
            if (AJS.dropDown.current) {
                AJS.dropDown.current.hide("click");
            }
        }
    };
    var active = function (i) {
        return function () {
            if (!AJS.dropDown.current) {
                return;
            }
            AJS.dropDown.current.cleanFocus();
            this.originalClass = this.className;
            AJS.$(this).addClass(options.activeClass);
            AJS.dropDown.current.$[0].focused = i;
        };
    };

    var handleClickSelection = function (e) {
        if (e.button || e.metaKey || e.ctrlKey || e.shiftKey) {
            return true;
        }
        if (AJS.dropDown.current && options.selectionHandler) {
            options.selectionHandler.call(AJS.dropDown.current, e, AJS.$(this));
        }
    };

	var isEventsBound = function (el) {
        var bound = false;
        if (el.data("events")) {
            AJS.$.each(el.data("events"), function(i, handler){
                AJS.$.each(handler, function (type, handler) {
                    if (handleClickSelection === handler) {
                        bound = true;
                        return false;
                    }
                });
            });
        }
        return bound;
    };

    dd.each(function () {
        var cdd = this, $cdd = AJS.$(this), res;
        var methods = {
            reset: function () {
                res = AJS.$.extend(res || {}, {
                    $: $cdd,
                    links: AJS.$(options.item || "li:has(a)", cdd),
                    cleanActive: function () {
                        if (cdd.focused + 1 && res.links.length) {
                            AJS.$(res.links[cdd.focused]).removeClass(options.activeClass);
                        }
                    },
                    cleanFocus: function () {
                        this.cleanActive();
                        cdd.focused = -1;
                    },
                    moveDown: moveDown,
                    moveUp: moveUp,
                    moveFocus: moveFocus,
                    getFocusIndex: function () {
                        return (typeof cdd.focused == "number") ? cdd.focused : -1;
                    }
                });
                res.links.each(function (i) {
                    var $this = AJS.$(this);
                    if (!isEventsBound($this)) {
                        $this.hover(active(i), res.cleanFocus);
                        $this.click(handleClickSelection);
                    }
                });
                return arguments.callee;
            }(),
            appear: function (dir) {
                if (dir) {
                    $cdd.removeClass("hidden");
                    //handle left or right alignment
                    $cdd.addClass("aui-dropdown-" + options.alignment);
                } else {
                    $cdd.addClass("hidden");
                }
            },
            fade: function (dir) {
                if (dir) {
                    $cdd.fadeIn("fast");
                } else {
                    $cdd.fadeOut("fast");
                }
            },
            scroll: function (dir) {
                if (dir) {
                    $cdd.slideDown("fast");
                } else {
                    $cdd.slideUp("fast");
                }
            }
        };

        /**
         * Uses Aspect Oriented Programming (AOP) to insert callback <em>after</em> the
         * specified method has returned @see AJS.$.aop
         * @method addCallback
         * @param {String} methodName - Name of a public method
         * @param {Function} callback - Function to be executed
         * @return {Array} weaved aspect
         */
        res.addCallback = function (method, callback) {
            return AJS.$.aop.after({target: this, method: method}, callback);
        };

        res.reset = methods.reset();
        res.show = function (method) {
            hider();
            AJS.dropDown.current = this;
            this.method = method || this.method || "appear";
            methods[this.method](true);
            this.timer = setTimeout(function () {
                $doc.click(hider);
            }, 0);

            $doc.keydown(moveFocus);
            if (options.firstSelected && this.links[0]) {
                active(0).call(this.links[0]);
            }
            AJS.$(cdd.offsetParent).css({zIndex: 2000});
			AJS.$(document).trigger("showLayer", ["dropdown", AJS.dropDown.current]);
        };
        res.hide = function (causer) {
            this.method = this.method || "appear";
            AJS.$($cdd.get(0).offsetParent).css({zIndex: ""});
            this.cleanFocus();
            methods[this.method](false);
            $doc.unbind("click", hider).unbind("keydown", moveFocus);
			 AJS.$(document).trigger("hideLayer", ["dropdown", AJS.dropDown.current]);
            AJS.dropDown.current = null;
            return causer;
        };
        res.addCallback("reset", function () {
            if (options.firstSelected && this.links[0]) {
                active(0).call(this.links[0]);
            }
        });

        if (!AJS.dropDown.iframes) {
            AJS.dropDown.iframes = [];
        }
        AJS.dropDown.createShims = function () {
            AJS.$("iframe").each(function (idx) {
               var iframe = this;
                if (!iframe.shim) {
                    iframe.shim = AJS.$("<div />")
                                                  .addClass("shim hidden")
                                                  .appendTo("body");
                    AJS.dropDown.iframes.push(iframe);
                }
            });
            return arguments.callee;
        }();

        res.addCallback("show", function() {
            AJS.$(AJS.dropDown.iframes).each(function(){
                var $this = AJS.$(this);
                if ($this.is(":visible")) {
                    var offset = $this.offset();
                    offset.height = $this.height();
                    offset.width = $this.width();
                    this.shim.css({
                        left: offset.left + "px",
                        top: offset.top + "px",
                        height: offset.height + "px",
                        width: offset.width + "px"
                    }).removeClass("hidden");
                }
            });
        });
        res.addCallback("hide", function () {
            AJS.$(AJS.dropDown.iframes).each(function(){
                this.shim.addClass("hidden");
            });
            options.hideHandler();
        });

        // shadow
        (function () {
            var refreshShadow = function () {
                if (this.shadowParent) {
                    this.shadowParent.remove();
                }
                var shadowSize = 0.6;
                var shadowXOffset = shadowSize * 10;    //offset the shadow layer to account for the width of the actual shadow
                if (this.$.is(":visible")) {
                    this.shadowParent = AJS.$('<div class="aui-shadow-parent"></div>').css({
                        top: this.$.css("top"),
                        left: (this.$.position().left - shadowXOffset), //make sure shadow follows dropdown when alignment changes
                        width: this.$.width(),
                        height: this.$.height()
                    }).insertBefore(this.$);
                    if (AJS.$.browser.msie) {
                        this.shadowParent.css({right: - shadowXOffset});
                    }

                    this.shadow = Raphael.shadow(0, 0, this.$.outerWidth(true), this.$.outerHeight(true), {
                        r: 0.2,
                        shadow: "#333",
                        size: shadowSize,
                        stroke: "none",
                        color: "none",
                        target: this.shadowParent[0]
                    });
                }
            };
            res.addCallback("reset", refreshShadow);
            res.addCallback("show", refreshShadow);
            res.addCallback("hide", function () {
                if (this.shadowParent) {
                    this.shadowParent.remove();
                }
            });
        })();

        // shim to sit over flash and select boxes
        if (AJS.$.browser.msie) {
            (function () {
                var refreshIframeShim = function () {
                    if (this.$.is(":visible")) {
                        if (!this.iframeShim) {
                            this.iframeShim = AJS.$('<iframe class="dropdown-shim" src="javascript:false;" frameBorder="0" />').insertBefore(this.$);
                        }
                        this.iframeShim.css({
                            display: "block",
                            top: this.$.css("top"),
                            width: this.$.outerWidth() + "px",
                            height: this.$.outerHeight() + "px"
                        });
                        if(options.alignment=="left"){
                            this.iframeShim.css({left:"0px"});
                        } else {
                            this.iframeShim.css({right:"0px"});
                        }
                    }
                };
                res.addCallback("reset", refreshIframeShim);
                res.addCallback("show", refreshIframeShim);
                res.addCallback("hide", function () {
                    if (this.iframeShim) {
                        this.iframeShim.css({display: "none"});
                    }
                });
            })();
        }
        result.push(res);
    });
    return result;
};

// for each item in the drop down get the value of the named additional property. If there is no
// property with the specified name then null will be returned.
AJS.dropDown.getAdditionalPropertyValue = function (item, name) {
    var el = item[0];
    if ( !el || (typeof el.tagName != "string") || el.tagName.toLowerCase() != "li" ) {
        // we are moving the location of the properties and want to deprecate the attachement to the span
        // but are unsure where and how its being called so for now we just log
        AJS.log("AJS.dropDown.getAdditionalPropertyValue : item passed in should be an LI element wrapped by jQuery");
    }
    var properties = AJS.$.data(el, "properties");
    return properties ? properties[name] : null;
};

// remove all additional properties
AJS.dropDown.removeAllAdditionalProperties = function (item) {
    // only here for backwards compatibility
};

 /**
  * Base dropdown control. Enables you to identify triggers that when clicked, display dropdown.
  *
  * @class Standard
  * @contructor
  * @namespace AJS.dropDown
  * @param {Object} options
  * @return {Object
  */
 AJS.dropDown.Standard = function (usroptions) {

    var res = [], dropdownParents, options = {
        selector: ".aui-dd-parent",
        dropDown: ".aui-dropdown",
        trigger: ".aui-dd-trigger"
    };

     // extend defaults with user options
    AJS.$.extend(options, usroptions);

      // handling for jQuery collections
    if (this instanceof AJS.$) {
        dropdownParents = this;
    // handling for selectors
    } else {
        dropdownParents = AJS.$(options.selector);
    }

    // a series of checks to ensure we are dealing with valid dropdowns
    dropdownParents = dropdownParents
            .not(".dd-allocated")
            .filter(":has(" + options.dropDown + ")")
            .filter(":has(" + options.trigger + ")");

    dropdownParents.each(function () {
        var
        $parent = AJS.$(this),
        $dropdown = AJS.$(options.dropDown, this),
        $trigger = AJS.$(options.trigger, this),
        ddcontrol = AJS.dropDown($dropdown, options)[0];

        // extend to control to have any additional properties/methods
        AJS.$.extend(ddcontrol, {trigger: $trigger});

        // flag it to prevent additional dd controls being applied
        $parent.addClass("dd-allocated");

        //hide dropdown if not already hidden
        $dropdown.addClass("hidden");

        $trigger.click(function (e) {
            if (ddcontrol != AJS.dropDown.current) {
                $dropdown.css({top: $trigger.outerHeight()});
                ddcontrol.show();
                e.stopPropagation();
            }
            e.preventDefault();
        });

        ddcontrol.addCallback("show", function () {
           $parent.addClass("active");
        });

        ddcontrol.addCallback("hide", function () {
           $parent.removeClass("active");
        });

        // add control to the response
        res.push(ddcontrol);

    });
    return res;
};


/**
 * A NewStandard dropdown, however, with the ability to populate its content's via ajax.
 *
 * @class Ajax
 * @contructor
 * @namespace AJS.dropDown
 * @param {Object} options
 * @return {Object} dropDown instance
 */
AJS.dropDown.Ajax = function (usroptions) {

    var dropdowns, options = {cache: true};

     // extend defaults with user options
    AJS.$.extend(options, usroptions || {});

    // we call with "this" in case we are called in the context of a jQuery collection
    dropdowns = AJS.dropDown.Standard.call(this, options);

    AJS.$(dropdowns).each(function () {

        var ddcontrol = this;

        AJS.$.extend(ddcontrol, {
            getAjaxOptions: function (opts) {
                var success = function (response) {
                    if (options.formatResults) {
                        response = options.formatResults(response);
                    }
                    if (options.cache) {
                        ddcontrol.cache.set(ddcontrol.getAjaxOptions(), response);
                    }
                    ddcontrol.refreshSuccess(response);
                };
                if (options.ajaxOptions) {


                    if (AJS.$.isFunction(options.ajaxOptions)) {
                        return AJS.$.extend(options.ajaxOptions.call(ddcontrol), {success: success});
                    } else {
                        return AJS.$.extend(options.ajaxOptions, {success: success});
                    }
                }
                return AJS.$.extend(opts, {success: success});
            },
            refreshSuccess: function (response) {
                this.$.html(response);
            },
            cache: function () {
                var c = {};
                return {
                    get: function (ajaxOptions) {
                        var data = ajaxOptions.data || "";
                        return c[(ajaxOptions.url + data).replace(/[\?\&]/gi,"")];
                    },
                    set: function (ajaxOptions, responseData) {
                        var data = ajaxOptions.data || "";
                        c[(ajaxOptions.url + data).replace(/[\?\&]/gi,"")] = responseData;
                    },
                    reset: function () {
                        c = {};
                    }
                };
            }(),
            show: function (superMethod) {
                return function (opts) {
                    if (options.cache && !!ddcontrol.cache.get(ddcontrol.getAjaxOptions())) {
                        ddcontrol.refreshSuccess(ddcontrol.cache.get(ddcontrol.getAjaxOptions()));
                        superMethod.call(ddcontrol);
                    } else {
                        AJS.$(AJS.$.ajax(ddcontrol.getAjaxOptions())).throbber({target: ddcontrol.$,
                            end: function () {
                                ddcontrol.reset();
                            }
                        });
                        superMethod.call(ddcontrol);
                        ddcontrol.shadowParent.hide();
                        if (ddcontrol.iframeShim) {
                            ddcontrol.iframeShim.hide();
                        }
                    }
                };
            }(ddcontrol.show),
            resetCache: function () {
                ddcontrol.cache.reset();
            }
        });
        ddcontrol.addCallback("refreshSuccess", function () {
            ddcontrol.reset();
        });
    });
    return dropdowns;
};


AJS.$.fn.dropDown = function (type, options) {
    type = (type || "Standard").replace(/^([a-z])/, function (match) {
        return match.toUpperCase();
    });
    return AJS.dropDown[type].call(this, options);
};

