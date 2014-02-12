// Things to be initialized for ALL pages on document load
// Includes things like common UI elements that need Javascript

/* Backport $.browser in Jquery 1.9 for plugins */

(function ($) {
  var ua = navigator.userAgent.toLowerCase(),
  match = /(chrome)[ \/]([\w.]+)/.exec(ua) ||
    /(webkit)[ \/]([\w.]+)/.exec(ua) ||
    /(opera)(?:.*version|)[ \/]([\w.]+)/.exec(ua) ||
    /(msie) ([\w.]+)/.exec(ua) ||
    ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec(ua) || [],
  browser = match[1] || "",
  version =  match[2] || "0";

  jQuery.browser = {};

  if (browser) {
    jQuery.browser[browser] = true;
    jQuery.browser.version = version;
  }

  // Chrome is Webkit, but Webkit is also Safari.
  if (jQuery.browser.chrome) {
    jQuery.browser.webkit = true;
  } else if (jQuery.browser.webkit) {
    jQuery.browser.safari = true;
  }
})(jQuery);


document.ondragstart = function () { return false; }; // prevent ie from dragging images

String.prototype.commafy = function () {
  return this.replace(/(^|[^\w.])(\d{4,})/g, function($0, $1, $2) {
    return $1 + $2.replace(/\d(?=(?:\d\d\d)+(?!\d))/g, "$&,");
  });
}

Number.prototype.commafy = function () {
  return String(this).commafy();
}

$.fn.keypressenter = function( callback ) {
  $(this).keypress(function(e) {
    if (e.which == 13) {
      callback();
    }
  });
}


var Browser = {
  init: function () {
    this.browser = this.searchString(this.dataBrowser) || "An unknown browser";
    this.version = this.searchVersion(navigator.userAgent)
      || this.searchVersion(navigator.appVersion)
      || "an unknown version";
    this.OS = this.searchString(this.dataOS) || "an unknown OS";

    this.customFlags();
  },

  customFlags: function() {
    this.isWebkit = this.browser == "Chrome" || this.browser == "Safari";
    this.isModernIE_MacWebkit = (this.browser == "Explorer"  && this.version >= 9.0) ||
      (this.OS == "Mac" && this.isWebkit);
    this.isLegacyIE = (this.browser == "Explorer"  && this.version < 9.0);
    this.isFirefoxWin = (Browser.browser == "Firefox" && Browser.OS == "Windows");
  },

  searchString: function (data) {
    for (var i=0;i<data.length;i++)	{
      var dataString = data[i].string;
      var dataProp = data[i].prop;
      this.versionSearchString = data[i].versionSearch || data[i].identity;
      if (dataString) {
        if (dataString.indexOf(data[i].subString) != -1)
          return data[i].identity;
      }
      else if (dataProp)
        return data[i].identity;
    }
  },
  searchVersion: function (dataString) {
    var index = dataString.indexOf(this.versionSearchString);
    if (index == -1) return;
    return parseFloat(dataString.substring(index+this.versionSearchString.length+1));
  },
  dataBrowser: [
    {
      string: navigator.userAgent,
      subString: "Chrome",
      identity: "Chrome"
    },
    {   string: navigator.userAgent,
        subString: "OmniWeb",
        versionSearch: "OmniWeb/",
        identity: "OmniWeb"
    },
    {
      string: navigator.vendor,
      subString: "Apple",
      identity: "Safari",
      versionSearch: "Version"
    },
    {
      prop: window.opera,
      identity: "Opera",
      versionSearch: "Version"
    },
    {
      string: navigator.vendor,
      subString: "iCab",
      identity: "iCab"
    },
    {
      string: navigator.vendor,
      subString: "KDE",
      identity: "Konqueror"
    },
    {
      string: navigator.userAgent,
      subString: "Firefox",
      identity: "Firefox"
    },
    {
      string: navigator.vendor,
      subString: "Camino",
      identity: "Camino"
    },
    {		// for newer Netscapes (6+)
      string: navigator.userAgent,
      subString: "Netscape",
      identity: "Netscape"
    },
    {
      string: navigator.userAgent,
      subString: "MSIE",
      identity: "Explorer",
      versionSearch: "MSIE"
    },
    {
      string: navigator.userAgent,
      subString: "Gecko",
      identity: "Mozilla",
      versionSearch: "rv"
    },
    {           // for older Netscapes (4-)
      string: navigator.userAgent,
      subString: "Mozilla",
      identity: "Netscape",
      versionSearch: "Mozilla"
    }
  ],
  dataOS : [
    {
      string: navigator.platform,
      subString: "Win",
      identity: "Windows"
    },
    {
      string: navigator.platform,
      subString: "Mac",
      identity: "Mac"
    },
    {
      string: navigator.userAgent,
      subString: "iPhone",
      identity: "iPhone/iPod"
    },
    {
      string: navigator.platform,
      subString: "Linux",
      identity: "Linux"
    }
  ]

};
Browser.init();

(function() {
  // MAIN FUNCTION, do all initialization stuff

  // Document ready
  $(document).ready(function() {
    PageUI.browserFixes();

    initDefaultTextInputs();
    initFormElements();



  });



  function initDefaultTextInputs() {
    $(".default-text").each(PageUI.initDefaultTextInput);


    $("form").submit(function() {
      //defaultTextInputs.each(function() {
      $(this).find(".default-text").each(function() {
        var $this = $(this);
        if($this.val() == $this.prop('placeholder')) {
          $this.val("");
        }
      });
    });


  }

  function initFormElements() {

    // DO UI javascript initialization stuff (buttons, forms, etc) !!

    /* BUTTONS */
    //var button_std =  $("a.button-std");
    $(".button-std").each(PageUI.initButton);


    /* Text inputs */
    //var textfield_std =  $(".textfield-std");
    $(".textfield-std").each(PageUI.initTextField);

    /* Checkboxes */
    $(".checkbox-std").checkbox();
    $(".radio-std").radio();

    $(".horiz-control").each(PageUI.initHorizControl);
    //$(".header-box-tabs").each(PageUI.initHeaderBoxTabs);

    $(".jsdropdown").dropdown({
      showSpeed: 100,
      hideSpeed: 100
    });
  }



})();



var PageUI = {
  browserFixes: function() {

    //var webkit = BrowserDetect.browser == "Chrome" || BrowserDetect.browser == "Safari";
    // Browser specific hacks! I don't know..
    //console.log(Browser.browser);
    if (Browser.browser == "Firefox" && Browser.OS == "Windows") {
      //console.log('ffwin ui fix');
      $(".horiz-control:not(.smalltext) .horiz-control-link").css('line-height','41px');
      $(".jsdropdown-main:not(.mini) > .jsdropdown-text").css('line-height','38px');
      $(".jsdropdown-main.mini > .jsdropdown-text").css('line-height','33px');

      $(".checkbox-std:not(.font12, .font14) > .checkbox-label").css('line-height', '22px');    // 13px text
      $(".checkbox-std.font12 > .checkbox-label").css('line-height', '21px');    // 12px text

      $(".radio-std:not(.font12, .font14) > .radio-label").css('line-height', '20px');    // 13px text
      $(".radio-std.font12 > .radio-label").css('line-height', '19px');    // 12px text

      $(".slider:not(.handle30, .smalltext) > .slider-handle").css('line-height','36px');  // handle32, normal text
      $(".slider.handle30:not(.smalltext) > .slider-handle").css('line-height','34px');  // handle30, normal text

      $(".show-more-link.small:not(.inside-table)").css('line-height', '11px');
      $(".breadcrumb:not(.large)").css('line-height', '32px');
      $(".breadcrumb.large").css('line-height', '34px');

      $(".rate-change").css('line-height', '19px');
    }

    /*
    if (Browser.isLegacyIE) {
      $(".horiz-control:not(.smalltext) .horiz-control-link").css('line-height','41px');
      $(".jsdropdown-main:not(.mini) > .jsdropdown-text").css('line-height','38px');
      $(".jsdropdown-main.mini > .jsdropdown-text").css('line-height','33px');

      $(".checkbox-std:not(.font12, .font14) > .checkbox-label").css('line-height', '22px');    // 13px text
      $(".checkbox-std.font12 > .checkbox-label").css('line-height', '21px');    // 12px text

      $(".radio-std:not(.font12, .font14) > .radio-label").css('line-height', '20px');    // 13px text
      $(".radio-std.font12 > .radio-label").css('line-height', '19px');    // 12px text

      $(".slider:not(.handle30, .smalltext) > .slider-handle").css('line-height','36px');  // handle32, normal text
      $(".slider.handle30:not(.smalltext) > .slider-handle").css('line-height','34px');  // handle30, normal text

       $(".show-more-link-small > .text").css('line-height', '11px');
    }
    */

    this.browserFixPageNumbers();
  },

  browserFixPageNumbers: function() {
    if (Browser.isFirefoxWin) {
      $(".page-number").css('line-height', '38px');

    }

    /*
    if (Browser.isLegacyIE) {
      $(".page-number").css('line-height', '37px');

    }
    */
    /*
    if (Browser.isModernIE_MacWebkit) {
      $(".page-number").css('line-height', '39px');

    }
    */
  },



  initDefaultTextInput: function() {
    var $this = $(this);
    var defaultVal = $this.data('placeholder');
    //console.log($this.get());
    //console.log($this.attr('placeholder'));

    $this.focus(function() {
      // If you click and val is still defaultVal, then remove it (so user can enter cleanly)
      if ($this.val() == defaultVal)  {
        $this.removeClass("default-text-active");
        $this.val("");
      }
    });

    $this.bind('checkvalue', function() {
      // if value is empty when clicking away, restore thelper text

      if ($this.val() == "") {
        $this.addClass("default-text-active");
        $this.val(defaultVal);
      } else if ($this.val() != defaultVal) {
        $this.removeClass("default-text-active");
      }
    });

    $this.blur(function() {
      $this.trigger('checkvalue');
    });

    $this.focus().blur();
    //$this.trigger('checkvalue');

    // just to be safe, in case the element has a saved value somehow..
    // make sure it doesn't have default-text-active
    // FF seems to leave greyed off values sometimes

    /*
    if ($this.val() != defaultVal) {
      //console.log($this.val());
      //console.log(defaultVal);
      console.log('cleaned');
      $this.removeClass("default-text-active");
      }
    */


  },

  initButton: function() {
    var elem = $(this);
    elem.mousedown(function() {
      elem.addClass("active");
      return false;
    });

    elem.mouseup(function() {
      elem.removeClass("active");
    });

    elem.mouseout(function() {
      elem.removeClass("active");
    });

    elem.keydown(function(event) {
      if (event.which == 32) {
        $(this).addClass("active");
        $(this).one('keyup', function() {
          $(this).removeClass("active");
          $(this).click();
          return false;
        });

        //$(this).click();
        return false;
      }
    });
  },

  initTextField: function() {
    var elem = $(this);

    elem.focusin(function() {
      elem.addClass("focus");
    });

    elem.focusout(function() {
      elem.removeClass("focus");
    });

    if (elem.hasClass("has-button")) {
      var button = elem.find(".textfield-button");

      elem.focusin(function() {
        button.addClass("focus");
      }).focusout(function() {
        button.removeClass("focus");
      });

      elem.hover(function() {
        button.addClass("hover");
      }, function() {
        button.removeClass("hover");
      });
    }

  },
  initHorizControl: function() {
    var elem = $(this);
    var links = elem.find(".horiz-control-link");

    links.each( function() {
      var $this = $(this);

      $this.click(function() {
        links.removeClass("selected");
        $this.addClass("selected");
      });

    });
  },
  initHeaderBoxTabs: function() {
    var elem = $(this);
    var links = elem.find(".header-box-tabs-link");

    links.each( function(index, elem) {
      var $this = $(this);

      $this.click(function() {
        links.removeClass("selected");
        $this.addClass("selected");
      });

    });

  }

}
