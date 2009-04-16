/**
 * Covers screen with semitransparent DIV
 * @method dim
 * @namespace AJS
*/
AJS.dim = function () {
    if (!AJS.dim.dim) {
        AJS.dim.dim = AJS("div").addClass("blanket");
        if (AJS.$.browser.msie) {
            AJS.dim.dim.css({width: "200%", height: AJS.$(document).height() + "px"});
        }
        AJS.$("body").append(AJS.dim.dim).css("overflow", "hidden");
        AJS.$("html").css("overflow", "hidden");
    }
};
/**
 * Removes semitransparent DIV
 * @method undim
 * @namespace AJS
 * @see dim
*/
AJS.undim = function () {
    if (AJS.dim.dim) {
        AJS.dim.dim.remove();
        AJS.dim.dim = null;
        AJS.$("html, body").css("overflow", "");
        // Safari bug workaround
        if (AJS.$.browser.safari) {
            AJS.$("body").css({height: "200px"});
            setTimeout(function () {
                AJS.$("body").css({height: ""});
            }, 0);
        }
    }
};
/**
 * Creates a generic popup
 * @method poup
 * @namespace AJS
 * @param width {number} width of the popup
 * @param height {number} height of the popup
 * @param id {number} [optional] id of the popup
 * @return {object} popup object
*/
AJS.popup = function (width, height, id) {
    var shadow = AJS.$('<div class="shadow"><div class="tl"></div><div class="tr"></div><div class="l"></div><div class="r"></div><div class="bl"></div><div class="br"></div><div class="b"></div></div>');
    var popup = AJS("div").addClass("popup").css({
        margin: "-" + Math.round(height / 2) + "px 0 0 -" + Math.round(width / 2) + "px",
        width: width + "px",
        height: height + "px",
        background: "#fff",
        zIndex: 3000
    });
    if (id) {
        popup.attr("id", id);
    }
    if (AJS.$.browser.msie) {
        window.msieheight = Math.round(height / 2);
        popup[0].style.marginTop = "";
    }
    AJS.$("body").append(shadow);
    AJS.$(".shadow").css({
        margin: "-" + Math.round(height / 2) + "px 0 0 -" + Math.round(width / 2 + 16) + "px",
        width: width + 32 + "px",
        height: height + 29 + "px",
        zIndex: 2999
    });
    AJS.$(".shadow .b").css("width", width - 26 + "px");
    AJS.$(".shadow .l, .shadow .r").css("height", height - 18 + "px");
    AJS.$("body").append(popup);
    popup.hide();
    shadow.hide();

    /**
     * Popup object
     * @class Popup
     * @static
    */
    return {
        /**
         * Makes popup visible
         * @method show
        */
        show: function () {
            var show = function () {
                scrollDistance = document.documentElement.scrollTop || document.body.scrollTop;
                document.documentElement.scrollTop = scrollDistance;
                popup.show();
                shadow.show();
                AJS.dim();
            };
            show();
            if (popup.css("position") == "absolute") {
                // Internet Explorer case
                var scrollfix = function () {
                    scrollDistance = document.documentElement.scrollTop || document.body.scrollTop;
                    popup.css("margin-top", scrollDistance - height / 2);
                };
                scrollfix();
                AJS.$(window).load(scrollfix);
                this.show = function () {
                    show();
                    scrollfix();
                };
            } else {
                this.show = show;
            }
        },
        /**
         * Makes popup invisible
         * @method hide
        */
        hide: function () {
            document.documentElement.scrollTop = scrollDistance;
            this.element.hide();
            shadow.hide();
            AJS.undim();
        },
        /**
         * jQuery object, representing popup DOM element
         * @property element
        */
        element: popup,
        /**
         * Removes popup elements from the DOM
         * @method remove
        */
        remove: function () {
            shadow.remove();
            popup.remove();
            this.element = null;
        }
    };
};



// Usage:
// var popup = new AJS.Dialog(860, 530);
// popup.addHeader("Insert Macro");
// popup.addPanel("All", "<p></p>");
// popup.addButton("Next", function (dialog) {dialog.nextPage();});
// popup.addButton("Cancel", function (dialog) {dialog.hide();});
// popup.addPage();
// popup.page[1].addButton("Cancel", function (dialog) {dialog.hide();});
// somebutton.click(function () {popup.show();});


// Scoping function
(function () {
    /**
     * @class Button
     * @constructor Button
     * @param page {number} page id
     * @param label {string} button label
     * @param onclick {function} [optional] click event handler
     * @param className {string} [optional] class name
     * @private
    */
    function Button(page, label, onclick, className) {
        if (!page.buttonpanel) {
            page.buttonpanel = AJS("div").addClass("button-panel");
            page.element.append(page.buttonpanel);
        }
        this.page = page;
        this.onclick = onclick;
        this._onclick = function () {
            onclick.call(this, page.dialog, page);
        };
        this.item = AJS("button", label);
        if (className) {
            this.item.addClass(className);
        }
        if (typeof onclick == "function") {
            this.item.click(this._onclick);
        }
        page.buttonpanel.append(this.item);
        this.id = page.button.length;
        page.button[this.id] = this;
    }
    function itemMove (leftOrRight, target) {
        var dir = leftOrRight == "left"? -1 : 1;
        return function (step) {
            var dtarget = this.page[target];
            if (this.id != ((dir == 1) ? dtarget.length - 1 : 0)) {
                dir *= (step || 1);
                dtarget[this.id + dir].item[(dir < 0 ? "before" : "after")](this.item);
                dtarget.splice(this.id, 1);
                dtarget.splice(this.id + dir, 0, this);
                for (var i = 0, ii = dtarget.length; i < ii; i++) {
                    if (target == "panel" && this.page.curtab == dtarget[i].id) {
                        this.page.curtab = i;
                    }
                    dtarget[i].id = i;
                }
            }
            return this;
        };
    };
    function itemRemove(target) {
        return function () {
            this.page[target].splice(this.id, 1);
            for (var i = 0, ii = this.page[target].length; i < ii; i++) {
                this.page[target][i].id = i;
            }
            this.item.remove();
        };
    }
    Button.prototype.moveUp = Button.prototype.moveLeft = itemMove("left", "button");
    Button.prototype.moveDown = Button.prototype.moveRight = itemMove("right", "button");
    Button.prototype.remove = itemRemove("button");

    /**
     * Getter and setter for label
     * @method label
     * @param label {string} [optional] label of the button
     * @return {string} label, if nothing is passed in
     * @return {object} jQuery button object, if label is passed in
    */
    Button.prototype.label = function (label) {
        return this.button.html(label);
    };
    /**
     * Getter and setter of
    */
    Button.prototype.onclick = function (onclick) {
        if (typeof onclick == "undefined") {
            return this.onclick;
        } else {
            this.button.unbind("click", this._onclick);
        }
    };

    /**
     * Class for panels
     * @class Panel
     * @constructor
     * @param page {number} page id
     * @param title {string} panel title
     * @param reference {string} or {object} jQuery object or selector for the contents of the Panel
     * @param className {string} [optional] HTML class name
    */
    var Panel = function (page, title, reference, className) {
        if (!(reference instanceof AJS.$)) {
            reference = AJS.$(reference);
        }
        this.dialog = page.dialog;
        this.page = page;
        this.id = page.panel.length;
        this.button = AJS("button").html(title);
        this.item = AJS("li").append(this.button);
        this.body = AJS("div").append(reference).addClass("panel-body").css("height", page.dialog.height + "px");
        this.padding = 10;
        if (className) {
            this.body.addClass(className);
        }
        var i = page.panel.length,
            tab = this;
        page.menu.append(this.item);
        page.body.append(this.body);
        page.panel[i] = this;
        var onclick = function () {
            if (page.curtab + 1) {
                var cur = page.panel[page.curtab];
                cur.body.hide();
                cur.item.removeClass("selected");
                (typeof cur.onblur == "function") && cur.onblur.call(tab);
            }
            page.curtab = tab.id;
            tab.body.show();
            tab.item.addClass("selected");
            (typeof tab.onselect == "function") && tab.onselect.call(tab);
        };
        if (!this.button.click) {
            AJS.log("atlassian-dialog:Panel:constructor - this.button.click falsy");
            this.button.onclick = onclick;
        }
        else {
            this.button.click(onclick);
        }
        onclick();
        if (i == 0) {
            page.menu.css("display", "none"); // don't use jQuery hide()
        } else {
            page.menu.show();
        }
    };
    /**
     * Selects current panel
     * @method select
    */
    Panel.prototype.select = function () {
        this.button.click();
    };
    /**
     * Moves panel up in the hierarchy
     * @method moveUp
     * @return object
    */
    /**
     * Moves panel left in the hierarchy
     * @method moveLeft
     * @return object
    */
    Panel.prototype.moveUp = Panel.prototype.moveLeft = itemMove("left", "panel");
    /**
     * Moves panel down in the hierarchy
     * @method moveDown
     * @return object
    */
    /**
     * Moves panel right in the hierarchy
     * @method moveRight
     * @return object
    */
    Panel.prototype.moveDown = Panel.prototype.moveRight = itemMove("right", "panel");
    /**
     * Removes panel
     * @method remove
    */
    Panel.prototype.remove = itemRemove("panel");
    /**
     * Getter and setter for HTML contents of the panel
     * @method html
     * @return object | string
    */
    Panel.prototype.html = function (html) {
        if (html) {
            this.body.html(html);
            return this;
        } else {
            return this.body.html();
        }
    };
    /**
     * Default padding is 10 px. This method gives you ability to overwrite default value. Use it with caution.
     * @method setPadding
     * @param padding {number} padding in pixels
     * @return object
    */
    Panel.prototype.setPadding = function (padding) {
        if (!isNaN(+padding)) {
            this.body.css("padding", +padding);
            this.padding = +padding;
            this.page.recalcSize();
        }
        return this;
    };



    var Page = function (dialog, className) {
        this.dialog = dialog;
        this.id = dialog.page.length;
        this.element = AJS("div").addClass("dialog-components");
        this.body = AJS("div").addClass("page-body");
        this.menu = AJS("ul").addClass("page-menu").css("height", dialog.height + "px");
        this.body.append(this.menu);
        this.curtab;
        this.panel = [];
        this.button = [];
        if (className) {
            this.body.addClass(className);
        }
        dialog.popup.element.append(this.element.append(this.menu).append(this.body));
        dialog.page[dialog.page.length] = this;
    };
    Page.prototype.recalcSize = function () {
        var headerHeight = this.header ? 43 : 0;
        var panelHeight = this.buttonpanel ? 43 : 0;
        for (var i = this.panel.length; i--;) {
            this.panel[i].body.css("height", this.dialog.height - headerHeight - panelHeight - this.panel[i].padding * 2 + "px");
        }
    };

    Page.prototype.addPanel = function (title, reference, className) {
        new Panel(this, title, reference, className);
        return this;
    };
    Page.prototype.addHeader = function (title, className) {
        if (this.header) {
            this.header.remove();
        }
            this.header = AJS("h2").html(title);
        className && this.header.addClass(className);
        this.element.prepend(this.header);
        this.recalcSize();
        return this;
    };
    Page.prototype.addButton = function (label, onclick, className) {
        new Button(this, label, onclick, className);
        this.recalcSize();
        return this;
    };
    Page.prototype.gotoPanel = function (panel) {
        this.panel[panel.id || panel].select();
    };
    Page.prototype.hide = function () {
        this.element.hide();
    };
    Page.prototype.show = function () {
        this.element.show();
    };
    Page.prototype.remove = function () {
        this.element.remove();
    };




    // Dialog
    AJS.Dialog = function (width, height, id) {
        this.height = height || 480;
        this.width = width || 640;
        this.id = id;
        this.popup = AJS.popup(this.width, this.height, this.id);

        this.popup.element.addClass("dialog");
        this.page = [];
        this.curpage = 0;
        new Page(this);
    };
    AJS.Dialog.prototype.addHeader = function (title, className) {
        this.page[this.curpage].addHeader(title, className);
        return this;
    };
    AJS.Dialog.prototype.addButton = function (label, onclick, className) {
        this.page[this.curpage].addButton(label, onclick, className);
        return this;
    };
    AJS.Dialog.prototype.addPanel = function (title, reference, className) {
        this.page[this.curpage].addPanel(title, reference, className);
        return this;
    };
    AJS.Dialog.prototype.addPage = function (className) {
        new Page(this, className);
        this.page[this.curpage].hide();
        this.curpage = this.page.length - 1;
        return this;
    };
    AJS.Dialog.prototype.nextPage = function () {
        this.page[this.curpage++].hide();
        if (this.curpage >= this.page.length) {
            this.curpage = 0;
        }
        this.page[this.curpage].show();
        return this;
    };
    AJS.Dialog.prototype.prevPage = function () {
        this.page[this.curpage--].hide();
        if (this.curpage < 0) {
            this.curpage = this.page.length - 1;
        }
        this.page[this.curpage].show();
        return this;
    };
    AJS.Dialog.prototype.gotoPage = function (num) {
        this.page[this.curpage].hide();
        this.curpage = num;
        if (this.curpage < 0) {
            this.curpage = this.page.length - 1;
        } else if (this.curpage >= this.page.length) {
            this.curpage = 0;
        }
        this.page[this.curpage].show();
        return this;
    };
    AJS.Dialog.prototype.getPanel = function (panel) {
        var id = panel.id || panel;
        return this.page[this.curpage].panel[id];
    };
    AJS.Dialog.prototype.getPage = function (pageid) {
        return this.page[pageid];
    };

    AJS.Dialog.prototype.gotoPanel = function (pageorpanel, panel) {
        if (panel != null) {
            var pageid = pageorpanel.id || pageorpanel;
            this.gotoPage(pageid);
        }
        this.page[this.curpage].gotoPanel(typeof panel == "undefined" ? pageorpanel : panel);
    };

    AJS.Dialog.prototype.show = function () {
        this.popup.show();
        return this;
    };
    AJS.Dialog.prototype.hide = function () {
        this.popup.hide();
        return this;
    };
    AJS.Dialog.prototype.remove = function () {
        this.popup.hide();
        this.popup.remove();
    };
})();