(function (){
    var $tabs,
        $tabMenu,
        ACTIVE_TAB = "active-tab",
        ACTIVE_PANE = "active-pane";

    AJS.Tabs = {
        setup: function () {
            $tabs = AJS.$("div.aui-tabs");
            for (var i=0, ii = $tabs.length; i < ii; i++) {
                $tabMenu = AJS.$("ul.tabs-menu", $tabs[i]);

                // Set up click event for tabs
                AJS.$("a", $tabMenu).click(function (e) {
                    AJS.Tabs.change(AJS.$(this).attr("href"), e);
                    e && e.preventDefault();
                });

            };
        },
        change: function (pane, e) {
            AJS.$(pane.match(/#.*/)[0]).addClass(ACTIVE_PANE)
                       .siblings()
                       .removeClass(ACTIVE_PANE);

            AJS.$("a[href=" + pane + "]").parent("li.menu-item")
                                     .addClass(ACTIVE_TAB)
                                     .siblings()
                                     .removeClass(ACTIVE_TAB);
        }
    };
    AJS.$(AJS.Tabs.setup);
})();
