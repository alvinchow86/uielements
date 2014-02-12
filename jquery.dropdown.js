
// args: element is a DOM element. options is optional (a dictionary)
function Dropdown(element, options) {

  var defaults = {
    showSpeed: 0,
    hideSpeed: 0,
    callbackFn: null,
    keyboardCallbackDelay: 500
  };

  options = $.extend(defaults, options);

  // initialization code
  var elem = $(element);
  this.elem = elem;

  //console.log("Constructing Dropdown with..");
  //  console.log(element);
  //console.log(options);
  
  var top= elem;
  
  var dropdownMain = top.children(".jsdropdown-main");
  var dropdownText = dropdownMain.children(".jsdropdown-text");
  var dropdownList = top.children(".jsdropdown-list");
  var dropdownListInner = dropdownList.children(".jsdropdown-list-inner");
  var dropdownElems = dropdownListInner.children(".elem");
  
  var dropdownAll = top.find(".jsdropdown-main, .jsdropdown-list .elem");
  var dropdownVal = top.children("input.jsdropdown-value");
  this.dropdownVal = dropdownVal;
  
  var numElems = dropdownElems.length;
  var maxIndex = numElems - 1;
  
  var dropdownData = {
    'numElems': dropdownElems.length,
    'curIndex': 0,
    'highlightIndex': 0
  }

  var pendingCallback  = false;
  var callbackTimeoutSet = false;
  var callbackTimeoutID;

  var self = this;   // store an unambiguous reference to the Dropdown() object
  this.options = options;

  // Find out initial value from the dropdowns..set the input
  var initVal = getCurrValueFromElems();
  dropdownVal.val(initVal);
  
  //console.log(this.currVal);

  // assign number to each element

  dropdownElems.each( function(index) {
    $(this).data('index',index);
  });

  top.data('dropdowndata', dropdownData);

  // save the callbackFn
  this.callbackFn = options.callbackFn;

  // CORE FUNCTIONALITY
  // START CORE SETUP

  /* INITIAL CLICK ON DROPDOWN */
  dropdownMain.mousedown(function(event) {
    top.focus();
    if (dropdownIsOpen()) {   
      closeDropdown();
    } else {
      openDropdown();      
    }
    //event.stopPropagation();     // make sure click here doesn't trigger body event
    
  });
  
  /* EVENTS FOR DROPDOWN ELEMS */
  // Hover over elements (highlight)
  dropdownElems.mouseover(
    function(event) {
      var elem = $(this);

      dropdownElems.removeClass("highlighted");
      elem.addClass("highlighted");
      dropdownData.highlightIndex = elem.data("index");
    });

  // Finally choose an option (click, or finish dragging)
  dropdownElems.mouseup(chooseOption);
  dropdownElems.mousedown(chooseOption);
  // END CORE SETUP
  
  /* BONUS FEATURES */

  top.focus(function() {        
    dropdownMain.addClass("focus");     
    //dropdownMain.focus();
  });


  // NOTE THAT element should have tabindex="N" set for this blur to work!!
  top.blur(function() {
    dropdownMain.removeClass("focus");        
    //dropdownMain.blur();
  });

  top.keydown(function(event) {
    var keycode = event.which;

    if (keycode >= 37 && keycode <= 40) {

      var indexChanged = false;

      var proposedCurIndex = dropdownData.highlightIndex;
      //alert(proposedCurIndex);
      //dropdownData.curIndex = dropdownData.highlightIndex;

      //if (keycode == 39 || keycode == 40) {
      if (keycode >= 39) {
        // down, right
        if (proposedCurIndex < maxIndex) {
          dropdownData.curIndex = proposedCurIndex + 1;
          indexChanged = true;
          //chooseOptionIndex(dropdownData.curIndex);       
        }
        
      } else {        
        // up, left
        if (proposedCurIndex > 0 ) {
          dropdownData.curIndex = proposedCurIndex - 1;
          indexChanged = true;
          //chooseOptionIndex(dropdownData.curIndex);       
        }        
      }

      if (indexChanged) {
        dropdownData.highlightIndex = dropdownData.curIndex;
        chooseOptionIndex(dropdownData.curIndex);    

        if (! dropdownIsOpen()) {
          // if keyboard choose thing without opendropdown, callback fn later
          if (self.callbackFn) {
            var timeoutID = setTimeout(function() {
              callCallbackFn();
              callbackTimeoutSet = false;
            },  self.options.keyboardCallbackDelay);

            if (callbackTimeoutSet) {
              // clear the previous timer call
              //alert('clear' + callbackTimeoutID);
              clearTimeout(callbackTimeoutID);                
            }
            callbackTimeoutSet = true;
            callbackTimeoutID = timeoutID;
          }
        }
      }

      return false;
      
    } else if (keycode == 9) {
      if ( dropdownIsOpen()) {
        // take care of tab/shift+tab out events    
        closeDropdown();       
      }
    } else if (keycode == 13) {
      // enter
      if (dropdownIsOpen()) {        
        chooseOptionIndex(dropdownData.highlightIndex);   // TODO: optimize to only activate for mouseover..

        closeDropdown();
        // must choose highlighted one
        
      } else {
        openDropdown();
      }
    } else {
      return false;   // optional? prevent other keys like spacebar from doing stuff..
    }

    
  });

  // Disable text selection
  dropdownAll.each(function() {
    this.onselectstart = function() {return false;} // ie
    this.onmousedown = function() {return false;} // mozilla
    
  });



  /** PRIVATE FUNCTIONS **/

  function dropdownIsOpen() {
    return dropdownList.is(":visible");
  }

  // just calls callbackFn with the current value of dropdown
  function callCallbackFn() {

    self.callbackFn(dropdownVal.val());
  }

  /* Helper functions, open/close the dropdown */


  function openDropdown() {
    dropdownMain.addClass("active");
    dropdownElems.removeClass("highlighted");
    dropdownListInner.children(".selected").addClass("highlighted");

    if (self.options.showSpeed) {
      dropdownList.slideDown(self.options.showSpeed);
    } else {
      dropdownList.show();
    }
   
    top.one("mousedownoutside", function(event) { 
      closeDropdown();
    });

  }
  
  function closeDropdown() {
    
    closeDropdownSimple();
    
    if (pendingCallback && self.callbackFn) {
      callCallbackFn();
      pendingCallback = false;
    }

  }
  
  // this one doesn't check for pending callbacks
  function closeDropdownSimple() {

    if (self.options.hideSpeed) {
      dropdownList.slideUp(self.options.hideSpeed);
    } else {
      dropdownList.hide();
    }
    dropdownMain.removeClass("active");
  }

  
  // Helper to choose an option
  function chooseOption(event) {
    // WARNING! this is bound to the elemms, be careful with "this"
    
    //alert($(this).html());
    var elem = $(this);
    var myText = elem.text();
    var myVal = elem.attr('title');

    // set current index
    dropdownData.curIndex = elem.data("index");    
    //dropdownData.highlightIndex = dropdownData.curIndex;   // make sure these are in sync
    //alert(elem.data("index")); 
    
    

    // Set selected class
    dropdownElems.removeClass("selected");
    elem.addClass("selected");
    
    // Update state
    dropdownText.text(myText);
    dropdownVal.val(myVal);

    //event.stopPropagation();
    //$("body").unbind("mousedown");

    // dropdownList.slideUp(options.hideSpeed);
    closeDropdownSimple();

    // Callback
    //console.log(self.callbackFn);
    if (self.callbackFn) {
      self.callbackFn(myVal);
    }

  }


  // Press enter while dropdown open
  /*
    dropdownElems.keydown(function(event) {
    alert('hey');
    if (dropdownIsOpen() && event.which==13) {        
    closeDropdown();
    // must choose highlighted one
    
    }
    });
  */


  
  // used mainly for keyboard navigation, select an elem by index
  
  /* NOTE, unlike chooseOption(), this one doesn't call the callback function.
     we need to mark a flag to call the callbackFn when the dropdown is closed */
  function chooseOptionIndex(index) {

    var elem = dropdownElems.eq(index);
    var selText = elem.text();
    var selVal = elem.attr('title');
    dropdownText.text(selText);
    dropdownVal.val(selVal);

    dropdownElems.removeClass("selected");
    elem.addClass("selected");

    if (dropdownIsOpen()) {
      dropdownElems.removeClass("highlighted");
      elem.addClass("highlighted");
      
      if (self.callbackFn) {
        //alert('set pend');
        pendingCallback = true;
      }

    }

    // update highlight index too..
    //dropdownData.highlightIndex = index;      

  }
  
  function getCurrValueFromElems() {
    return dropdownElems.filter(".selected").prop('title');
  }


};

Dropdown.prototype = {
  // public methods
  setCallback: function(callbackFn) {
    //console.log("set callback");  
    this.callbackFn = callbackFn;
    //console.log(this.callbackFn);
  },

  setSpeed: function(showSpeed, hideSpeed) {
    //console.log("set speed");
    this.options.showSpeed = showSpeed;
    this.options.hideSpeed = hideSpeed;
  },
  
  value: function() {
    return this.dropdownVal.val();
  }

};

// Combine Dropdown class with Jquery plugin
(function($){
  $.fn.dropdown = function(arg) {
    
    var orig_args = arguments;
    //console.log(orig_args);


    // make it so calling arguments is done one at time, so functions can return values
    if (!arg || typeof(arg) == "object") {
      return this.each(function() {
        var element = $(this);
        var options = arg;
        var dropdown = new Dropdown(this, options);     
        element.data('dropdown', dropdown);
      });
    } else {
      var element = this;
      var existing_obj = element.data('dropdown');
      if (typeof(existing_obj[arg]) == 'function') {
        return existing_obj[arg].apply(existing_obj, Array.prototype.slice.call( orig_args, 1));
        
      }
    }

    /*
    return this.each(function(){
      var element = $(this);   
      //console.log(orig_arguments);
      //var existing_obj = element.data('dropdown');

      if (!arg || typeof(arg) == "object") {
        var options = arg;
        var dropdown = new Dropdown(this, options);     
        element.data('dropdown', dropdown);

      } else {
        var existing_obj = element.data('dropdown');
        if (typeof(existing_obj[arg]) == 'function') {
          existing_obj[arg].apply(existing_obj, Array.prototype.slice.call( orig_args, 1));
          //console.log('apply');
        }
      }

    });
    */
    
  };
})(jQuery);
