/*->
#name>Tables
#javascript>IE8 and below
#css>Yes
#description> Standards Patterns and Styling for HTML Tables
<-*/
(function() {
    AJS.tables = AJS.tables || {};
    AJS.tables.rowStriping = function () {
        var tables = AJS.$("table.aui-zebra");
        // has to be done this way to restart the count per table       
        for (var i=0, ii = tables.length; i < ii; i++) {
            AJS.$("tbody tr:odd", tables[i]).addClass("aui-zebra");
        };
    };
    AJS.$(AJS.tables.rowStriping);
})();
