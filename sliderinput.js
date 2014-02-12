
SLIDER_INPUT_DEFAULTS = {
  cleanInputFn: function(x) { return x },
  input2SliderFn: function(x) { return x/100 },
  slider2InputFn: function(x) { return x*100 },
  displayInputFn: function(x) { return x },
  range: null,
  values: null,
  roundfactor: null,
  decimaldigits: null
}

// "slider" should be a DragDealer object
// "textinput_id" can be the ID or a jQuery object

var SliderInput = function(slider, textinput_id, options) {
  var self = this;
  //var slider;
  //var textinput;

  this.slider = slider;

  if (textinput_id instanceof jQuery) {
    this.textinput = textinput_id;
  } else {
    this.textinput = $("#" + textinput_id);
  }

  //this.options = $.extend(SLIDER_INPUT_DEFAULTS, options);
  options = $.extend({}, SLIDER_INPUT_DEFAULTS, options);

  this.options = options;
  //alert(options.slider2InputFn);
 	  
  function scalingFunc(x) {
    return (min + actualrange*x);      
  }

  if (options.range) {
    //console.log('range');
    var min = options.range[0];
    var max = options.range[1];
    var actualrange = max - min;

    var roundFunc;  
    if (options.roundfactor != null) {
      roundFunc = function(x) { return Math.round(x/options.roundfactor)*options.roundfactor }
    } else {
      roundFunc = function(x) { return x };   // unity function
    }
    
    
    options.slider2InputFn = function(x) {     
      return roundFunc(scalingFunc(x));
      //var val = (min + actualrange*x);      
      // return Math.round(val/options.roundfactor)*options.roundfactor;
    };

    options.input2SliderFn = function(x) {
      var sliderVal = (x - min)/actualrange;
      return sliderVal;
    };

  } else if (options.values) {
    

  }

  //alert(this.slider);

  this.textinput.change(function() {
    var userVal = $(this).val();
    var cleanedVal = options.cleanInputFn(userVal);
    
    //console.log(userVal);
    var displayVal = options.displayInputFn(cleanedVal);
    var sliderVal = options.input2SliderFn(cleanedVal);
    
    self.slider.setValue(sliderVal);
    self.textinput.val(displayVal);
    //console.log(sliderVal);
    //console.log('texinput changed');
  });
  
  //var savedAnimationCallback = this.slider.animationCallback;
 
  /*
  this.slider.setAnimationCallback(function(x) {
    if (savedAnimationCallback) {
       savedAnimationCallback(x);
    }
    var realVal = options.slider2InputFn(x);
    var displayVal = options.displayInputFn(realVal);
    self.textinput.val(displayVal);    
  });
  */

  this.slider.addAnimationCallback(function(x) {    
    var realVal = options.slider2InputFn(x);
    var displayVal = options.displayInputFn(realVal);
    self.textinput.val(displayVal);    
  });

};



SliderInput.prototype = {		

  // TODO: optimize this to get a stored value
  value: function() {
    var rawval = this.textinput.val();
    return this.options.cleanInputFn(rawval);
  }


}



/* NOTES 
Assign a callback() to the slider object, which triggers when done dragging,
glide finishes, or if user changes the text itself (make sure options.setValueTriggersCallback
is set). Use this e.g for an AJAX/server call that should only trigger at end 

For live activity callback, set the animationCallback() of the slider.. This should be 
fired when the user drags the slider, or if the textinput does slider.setValue()
 */
