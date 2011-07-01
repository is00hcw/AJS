if ( window.Raphael) {
	Raphael.shadow = function(x, y, w, h, options) {

        options = options || {};

        var $target    = jQuery(options.target),
            $container = jQuery("<div>").addClass("aui-shadow"),
            colour     = options.shadow     || options.color || "#000",
            size       = options.size * 10  || 0, //makes it sane with no size included. just here for backwards compatability
            offsetSize = options.offsetSize || 5, //by default we want to offset by 5 pixels for pretty ness
            zindex     = options.zindex     || 0,
            radius     = options.radius     || 0,
            opacity    = "0.4",
            blur       = "3",
            paper,
            rect;

        w += size;
        h += size;

        if (Raphael.shadow.BOX_SHADOW_SUPPORT) {
            // If box-shadow is supported, apply a className to use standard box-shadow CSS styles.
            // Note: (x, y, w, h) is ignored.
            jQuery($target).addClass("aui-box-shadow");

            // Return the unused shadow element to preserve compatibility with legacy API.
            return $container.addClass("hidden");
        }

		//from the old api, this meant you wanted a shadow drawn into the element
		//so mimic this
		if (x === 0 && y === 0 && $target.length > 0) {
            var offset = $target.offset();
            x = offset.top;
            y = offset.left;
		}

		//ie9 should support svg so should support the opacity, until then tone the colour down
		//also as the blur seems a little stronger in ie, we need to counter the offset
		if (jQuery.browser.msie && jQuery.browser.version < "9") {
			colour = "#f0f0f0";
			opacity = ".2";
            offsetSize = 3;
		}

		$container.css({
            position: "absolute",
            top: x,
            left: y,
            width: w,
            height: h,
            zIndex: zindex
        });

        if ($target) {
            $container.appendTo(document.body);
            paper = Raphael($container[0], w + offsetSize + 5, h + offsetSize + 5, radius);
        } else {
            paper = Raphael(x, y, w, h, radius);
        }

        paper.canvas.style.position = "absolute";

        rect = paper.rect(offsetSize, offsetSize, w, h).attr({
            fill: colour,
            stroke: colour, //stroke needed to get around an issue with VML and no stroke defaulting to #000
            blur: blur,
            opacity: opacity
        });

		return $container;
	};

    Raphael.shadow.BOX_SHADOW_SUPPORT = (function() {
        var style = document.documentElement.style;
        var propertyNames = ["boxShadow", "MozBoxShadow", "WebkitBoxShadow", "msBoxShadow"/*, "OBoxShadow", "KhtmlBoxShadow"*/];
        for (var i = 0; i < propertyNames.length; i++) {
            if (propertyNames[i] in style) {
                return true;
            }
        }
        return false;
    })();
}