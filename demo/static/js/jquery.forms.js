function Checkbox(element, options) {
  // initialization code

  var defaults = {
    callback: null
  };
  options = $.extend(defaults, options);

  var elem = $(element);
  this.elem = elem;

  var top = elem;
  var label = top.children("label");
  var input = top.children("input");


  var self = this;
  this.options = options;
  //this.callbackFn = options.callbackFn;
  this.callbacks = [];
  if(options.callback) {
    this.addCallback(options.callback);
  }

  this.input = input;

  this.enabled = true;

  //console.log(self.callbacks);
  //allow template to force a value on checkbox with classes
  if ( top.hasClass("checked")) {
    input.prop("checked", true);
  } else if ( top.hasClass("unchecked")) {
    top.removeClass("unchecked");
    input.prop("checked", false);
  }


  if (input.prop("checked")) {
    top.addClass("checked");
  }

  top.click(function(e) {
    //console.log('click');
    var checked;

    if (self.enabled) {
      if (top.hasClass("checked")) {
        //if (input.prop("checked")) {
        top.removeClass("checked");
        input.prop('checked', false);
        checked = false;
      } else {
        top.addClass("checked");
        input.prop('checked', true);
        checked = true;
      }
      //alert(input.is(":checked"));
      if (self.callbacks.length) {
        //self.callbackFn(checked);
        self.executeCallbacks(checked);
      }
    }

  });

  /* Custom events, cool huh? */
  top.bind("check", function() {
    top.addClass("checked");
    input.prop('checked', true);
  });

  top.bind("uncheck", function() {
    top.removeClass("checked");
    input.prop('checked', false);
  });

  top.mousedown(function() {
    top.addClass('active');
  });

  top.mouseup(function() {
    top.removeClass('active');
  });

  top.mouseout(function() {
    top.removeClass('active');
  });

  // get some effect for keyboard tab focus
  input.focusin(function() {
    top.addClass('focus');
  });

  input.focusout(function() {
    top.removeClass('focus');
  });

};

Checkbox.prototype = {
  executeCallbacks: function(value) {
    for (var i=0; i < this.callbacks.length; i++) {
      this.callbacks[i](value);
    }
  },


  value: function() {
    //console.log('currval');
    return this.input.prop("checked");
  },
  val: function() {
    return this.value();
  },

    /*
  currValue: function() {
    return this.value();
  },
  */


  addCallback: function(callback) {
    this.callbacks.push(callback);
  },
  setCallback: function(callback) {
    this.addCallback(callback);
  },
  enable: function() {
    this.enabled = true;
  },
  disable: function() {
    this.enabled = false;
  }

};
//Checkbox.setCallback = Checkbox.addCallback;

// Combine Checkbox class with Jquery plugin
(function($){
  $.fn.checkbox = function(arg) {
    var orig_args = arguments;


    // make it so calling arguments is done one at time, so functions can return values


    if (!arg || typeof(arg) == "object") {
      return this.each(function() {
        var element = $(this);
        var options = arg;
        var checkbox = new Checkbox(this, options);
        element.data('checkbox', checkbox);
      });
    } else {
      var element = this;
      var existing_obj = element.data('checkbox');
      console.log(element);
      if (typeof(existing_obj[arg]) == 'function') {
        return existing_obj[arg].apply(existing_obj, Array.prototype.slice.call( orig_args, 1));

      }
    }

    /*
    return this.each(function(){
      var element = $(this);
      if (!arg || typeof(arg) == "object") {
        var options = arg;
        var checkbox = new Checkbox(this, options);
        element.data('checkbox', checkbox);

      } else {
        var existing_obj = element.data('checkbox');
        if (typeof(existing_obj[arg]) == 'function') {
          existing_obj[arg].apply(existing_obj, Array.prototype.slice.call( orig_args, 1));

        }
      }

    });
    */

  };
})(jQuery);

// elem is dom, parent is a RadioGroup instance
function Radio(element, radiogroup) {
  //this.elem = elem;
  //this.radiogroup = radiogroup;
  var elem = $(element);

  var top = elem;
  var label = top.children("label");
  var input = top.children("input");

  var self = this;

  this.top = top;
  this.input = input;
  this.label = label;

  // initialize
  if (input.prop("checked")) {
    top.addClass("checked");
  }

  top.click(function(e) {
    /*
    input.prop("checked", true);
    radiogroup.updateAllStates();
    */
    markChecked();
  });

  /* Custom events, cool huh? */
  top.bind("check", function() {

    markChecked();
    //top.addClass("checked");
    //input.prop('checked', true);
  });

  top.bind("uncheck", function() {
    markUnchecked()
    //top.removeClass("checked");
    //input.prop('checked', false);
  });

  top.mousedown(function() {
    top.addClass('active');
  });

  top.mouseup(function() {
    top.removeClass('active');
  });

  top.mouseout(function() {
    top.removeClass('active');
  });

  // get some effect for keyboard tab focus
  input.focusin(function() {
    top.addClass('focus');
  });

  input.focusout(function() {
    top.removeClass('focus');
  });

  function markChecked() {
    top.addClass("checked");
    input.prop('checked', true);
    radiogroup.updateAllStates();
  }
  function markUnchecked() {
    top.removeClass("checked");
    input.prop('checked', false);
    radiogroup.updateAllStates();
  }


}

Radio.prototype = {
  // update appearance based on hidden <input>'s checked state
  updateState: function() {
    if (this.input.prop("checked")) {
      this.top.addClass("checked");
    } else {
      this.top.removeClass("checked");
    }
  },
  getRadioGroup: function() {
    return this.top.data('radiogroup');
  }


}

// elems is already a Jquery selector object
function RadioGroup(elems, options) {
  // initialization code
  var defaults = {
    callback: null
  };
  options = $.extend(defaults, options);


  //console.log(elems);
  var self = this;
  var radios = [];

  this.elems = elems;
  this.radios = radios;
  this.options = options;
  //this.callbackFn = options.callbackFn;

  this.callbacks = [];
  if(options.callback) {
    this.addCallback(options.callback);
  }
  //console.log(

  elems.each(function() {
    var radio = new Radio(this, self);   // self is the RadioGroup instance, this is the radio div
    radios.push(radio);
    $(this).data('radio',radio);  // newly added, kind of weird? give each jquery instance a reference to the Radio object
  });


};

RadioGroup.prototype = {
  value: function() {
    return this.elems.find(":checked").val();
  },

  updateAllStates: function() {
    //console.log('update all states!');
    for (var i=0; i < this.radios.length; i++) {
      this.radios[i].updateState();
    }
    if (this.callbacks.length) {
      var currVal = this.value();
      this.executeCallbacks(currVal);
    }
    /*
    if (this.callbackFn) {
      var currVal = this.currValue();
      this.callbackFn(currVal);
    }
    */

  },
  executeCallbacks: function(value) {
    for (var i=0; i < this.callbacks.length; i++) {
      this.callbacks[i](value);
    }
  },

  addCallback: function(callback) {
    this.callbacks.push(callback);
    //this.callbackFn = callbackFn;
  },
  setCallback: function(callback) {
    this.addCallback(callback);
  }

};
//RadioGroup.setCallback = RadioGroup.addCallback;

// Combine Radio class with Jquery plugin
(function($){
  $.fn.radio = function(arg) {
    var orig_args = arguments;

    var radio_groups = {}
    // group together all radio buttons with same name first
    if (!arg || typeof(arg) == "object") {
      this.each(function() {
        var elem = $(this);
        var input = elem.children("input[type='radio']");
        var name = input.prop("name");
        //console.log(input);
        if (name in radio_groups) {
          radio_groups[name] = radio_groups[name].add(elem);
        } else {
          radio_groups[name] = elem;
        }
      });

      for (name in radio_groups) {
        var elems = radio_groups[name];
        //console.log(elems);

        var options = arg;
        var radiogroup= new RadioGroup(elems, options);
        elems.data('radiogroup', radiogroup);
      }

    } else {
      var element = this;
      var existing_obj = element.data('radio');
      if (typeof(existing_obj[arg]) == 'function') {
        return existing_obj[arg].apply(existing_obj, Array.prototype.slice.call( orig_args, 1));

      }
    }



  };
})(jQuery);
