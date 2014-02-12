

debug = 1;
function  log(msg) {
  if (debug) {
    console.log(msg);
  }}

var printer;
var numprints = 0;
function myprint(msg) {
  if (printer) {
    printer.html(String(numprints) + ':' + msg);
    numprints ++;
  }
}
var _SliderControlLib= (function() {
  
  // GLOBAL helper functions, event management
  function preventDefaults(e, selection)  {
    if(!e)  {
      e = window.event;
    }
    if(e.preventDefault)  {
      e.preventDefault();
    }
    e.returnValue = false;
    
    if(selection && document.selection) {
      document.selection.empty();
    }
  }

  function cancelEvent(e) {
    if(!e) {
      e = window.event;
    }
    if(e.stopPropagation){
      e.stopPropagation();
    }
    e.cancelBubble = true;
  }

  var Cursor = {
    
    x: 0, y: 0,
    init: function() {
      //this.setEvent('mouse');
      //this.setEvent('touch');
      this.setEvents();
    },
    setEvents: function() {
      
      $(document).bind('mousemove', function(e) {
        Cursor.refresh(e);
      });

      // for some reason Jquery's "touchmove" doesn't work well, so do it old way
      var touchMoveHandler = document['ontouchmove'] || function(){};
      document['ontouchmove'] = function(e) {
	touchMoveHandler(e);
	Cursor.refresh(e);
      }

    },
    refresh: function(e) {    
      //if (myprint) {   myprint(e.touches) }
      if(!e) {
	e = window.event;                        
      }
      if(e.type == 'mousemove' || e.type == 'mousedown') {
	this.set(e);
      }
      else if(e.touches) {
        //myprint('touches detected');
	this.set(e.touches[0]);
        
      }
      //if (myprint) {   myprint('cursor refresh:' +  String(this.x) + "/" + String(this.y)) };
    },
    set: function(e) {
      if(e.pageX || e.pageY) {
	this.x = e.pageX;
	this.y = e.pageY;
      }
      else if(e.clientX || e.clientY)  {
	this.x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
	this.y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
      }                
    }
  };
  Cursor.init();



  /* SliderHandle 
   
  */


  var SliderHandle = Class.$extend( {


    __init__: function(handle, parent, initVal, handleOffset) {
      this.handle = handle;
      this.$handle = $(handle);
      //this.$handle = $(handle);
      this.parent = parent;
      this.options = parent.options;
      this.handleOffset = handleOffset || 0;
      
      this.activity = false;
      this.dragging = false;
      this.tapping = false;                
      this.animating = false;
      
      this.dragCalcIntervalID = null;
      this.curAnimationTimeoutID = null;

      // actual [0..1] val
      this.currVal = initVal;   // the current val 
      this.targetVal = initVal; 
      this.prevVal = -1;          // prev val
      this.prevValAnimation = -1;   // just to keep track of the previous value of animation, so only callback when it changes..
      
      this.changeVal = 0;  // calculate the last distance traveled in 25ms

      // pixels
      this.currOffset = 0;
      this.prevOffset = -999999;
      this.targetOffset = 0;
      this.mouseHandleOffset;

      // set some constants
      // console.log(handle);
      this.handleWidth = handle.offsetWidth;
      this.bounds = this.parent.bounds;  // need to do this later..

      this.mouseDown = false;  // keep track if mouse button pressed
      this.pendingResultCallback = false;

    },

    /** PUBLIC API FUNCTIONS **/
    value: function() {
      return this.currVal;
    },

    width: function() {
      return this.handleWidth;
    },

    currOffsetCenter: function() {
      return this.currOffset + this.handleWidth/2;
    },
    
    setValue: function(value, glide) {
     
      var target = this.getAdjustedValue(value);

      if(glide) {
        this.glideToTarget(target);
      } else {
        this.setCurrentTargetValue(target);           
        this.updateHandle();      
      }
      
    },

    // update "this.offset.current", based on "this.currVal"
    updateHandle: function() {
      //console.log(this.currVal);
      if(!this.options.snap) {
	this.currOffset = this.getOffsetByValue(this.currVal);      
      } else  {                  
	this.currOffset = this.getOffsetByValue(
	  this.parent.getClosestStep(this.currVal)
	);
      }
      //console.log(this.offset.current);
      this.show();
      this.parent.animationFeedback();  
    },


    // when user clicks on the wrapper, expect handle to go to here (by an offset)
    tapToOffset: function (offset) {
    
      this.mouseDown = true;

      //var value = this.getValueFromOffset(offset);
      var value = this.getValueFromOffset(offset);
      value = this.getAdjustedValue(value, (this.options.steps > 1), false);

      this.setTargetValue(value);
      
      if (this.options.speed == 1) {

        this.setCurrentValue(this.targetVal);
        this.updateHandle();
        this.parent.resultCallback();

      } else {
        this.glideToTarget(value, true);   
        
      }

      //one of two things can happen.. in either tapToDrag or stopTag, clean up the other non-acted event
      $(document).one('mousemove.tapToOffset', $.proxy(this.tapToDrag, this));
      $(document).one('mouseup.tapToOffset', $.proxy(this.stopTap, this));
    },


    /** INTERNAL FUNCTIONS **/

    addListeners: function() {
      var self = this;
      //this.$handle.mousedown(function(e) {
      this.$handle.bind('mousedown touchstart', function(e) {
        self.handleDownHandler(e);
      });
      

    },

    handleDownHandler: function(e)
    {
      this.activity = false;
      Cursor.refresh(e);
      
      preventDefaults(e, true);  // TOFIX
      this.startDrag();
      cancelEvent(e);    // TOFIX
      //console.log('handle down');
    },

    startDrag: function(calculateMouseOffset) {
      
      //console.log(this.options);
      //console.log('startdrag');
      //myprint('startdrag');
      this.mouseDown = true;

      calculateMouseOffset = (calculateMouseOffset == undefined)? true : calculateMouseOffset;
      
      if(this.parent.disabled) {      
	return;
      }
      if (calculateMouseOffset) {
        // store mouse offset relative to top/left of handle
        this.mouseHandleOffset  = Cursor.x - this.getPosition();
      } else {
        this.mouseHandleOffset = this.handleWidth/2;
      }
      
      this.dragging = true;

      $(document).bind('mousemove.startDrag', $.proxy(this.dragUpdate,this));
      $(document).bind('touchmove.startDrag', $.proxy(this.dragUpdate,this));
      $(document).one('mouseup touchend', $.proxy(this.stopDrag, this));
      //alert(self);

      if (this.options.slide && !this.dragCalcIntervalID) {
        this.prevVal = this.currVal;  // initialize prev
        this.dragCalcIntervalID =  setInterval($.proxy(this.dragCalcSpeed, this),25);
      }

    },

    
    dragUpdate: function() {
      //myprint('dragging');
      // the pixel offset from the left/right
      var offset = Cursor.x - this.parent.wrapperPos - this.mouseHandleOffset;
      //console.log(Cursor.x);
    
      //log('orig offset:' + offset);
      var value = this.getValueFromOffset(offset);
      //log('getValueFromOffset:' + value);
      value = this.getAdjustedValue(value,
                                    (this.options.snap && this.options.steps>1),
                                    (this.options.loose)
                                   );
      //log('getAdjustedValue:'+value);
      
      this.setTargetValue(value);   
      this.updateCurrentValueFromTarget();
      
    },

    stopDrag: function() {
      
      
      //myprint('stopdrag');
      $(document).unbind('mouseup touchend');
      //alert(self.dragUpdate);
      //alert(this.dragUpdate);
      //console.log(this.currVal);
      this.dragging = false;
      this.mouseDown = false;

      //$(document).unbind('mousemove',this.dragUpdate);
      $(document).unbind('mousemove.startDrag');
      $(document).unbind('touchmove.startDrag');
      //$(document).unbind('mouseup.startdrag'); // unnecessary how else did we get here

      clearInterval(this.dragCalcInterval);
      this.dragCalcInterval = null;


      //     this.dragging = false;

      var doGlide = false;
      var target = this.currVal;
      var clippedBounds = false;
      // do some sliding
      if (this.options.slide) {
        
        //console.log('cur' + this.currVal[0] +  'tar' + this.value.target[0]);
        //target = this.groupClone(this.currVal);
        var ratioChange = this.changeVal;                    
        
        if (ratioChange) {
          target  += ratioChange * 4;       
          doGlide = true;
          target = this.getAdjustedValue(target);   // just bounds checking!
          clippedBounds = true;
          //console.log('doglide');
        }
      }

      // move the handle to nearest step (glide)

      if (this.options.steps > 1) {
        
        // optimization, don't recalculate clipped bounds
        if (clippedBounds) {
          target = this.parent.getClosestStep(target);
        } else {
          target = this.getAdjustedValue(target, true);   // go to step
        }
        

        // maybe should look at this.snap, but if snap is true, 
        // target will equal current anyway
        if (target != this.currVal) {
          doGlide = true;
        }
      }

      //console.log(target); 

      if (doGlide) {
        // trigger callback whenthe glide is done!
        this.glideToTarget(target, true);
      } else {
        //console.log('drag stop callback');
        this.parent.resultCallback()
      }

    },


    tapToDrag: function() { 
      //$(document).unbind('mouseup', this.stopTap);
      $(document).unbind('mouseup.tapToOffset');

      //var handle = this.handles[0]

      this.startDrag(false);

      //$(document).one('mouseup', $.proxy(this.stopDrag, this));
    },
    

    stopTap: function() {
      this.mouseDown = false;
      //console.log('stoptap');
      //$(document).unbind('mousemove', this.tapToDrag);
      $(document).unbind('mousemove.tapToOffset'); // cleanup 

      //console.log("stoptap");
      if(this.parent.disabled)
      {
        return;
      }
      if (this.pendingResultCallback) {
        this.resultCallback();
      }
    
    },

   

  
    /** UTILITY / HELPER FUNCTIONS */
  
    setCurrentValue: function(value) {
      this.currVal = value;
    },

    setTargetValue: function(value) {
      this.targetVal = value;
    },

    setCurrentTargetValue: function(value)  {
      this.currVal= value;
      this.targetVal = value;
    },

    resultCallback: function() {
      this.parent.resultCallback();
      this.pendingResultCallback = false;
    },


    // actually redisplays handle, based on "this.offset.current" (modify CSS position)
    show: function() {
      //console.log(this);
      //console.log('cur offset' + this.currOffset);
      if (this.currOffset != this.prevOffset) {
        this.handle.style.left = String(this.currOffset) + 'px';
      }
      this.prevOffset = this.currOffset;
    },

    // updates current value
    updateCurrentValueFromTarget: function() {  
      if (this.animating) {
        //console('an');
      } else {
        this.setCurrentValue(this.targetVal);
        this.updateHandle();
      }
    },

    // used to calculate speed of dragging, for slide release effect
    dragCalcSpeed: function() {      
      this.changeVal = this.currVal - this.prevVal;

      this.prevVal = this.currVal;

    },

    
    glideToTarget: function(target, triggerCallback) {
      //console.log('glideto:' + target[0]);

      this.clearAnimation();
      this.animating = true;
      
      //this.glideAnimation(target);

      this.targetVal = target

      var self = this;

      var glidefunc = function() {            
        if (self.glideWorker(triggerCallback)) {              
          self.curAnimationTimeoutID = setTimeout(glidefunc,16);
        }
      }

      self.curAnimationTimeoutID = setTimeout(glidefunc,16);

    },

    glideWorker: function(triggerCallbackWhenDone) {
      var target = this.targetVal;
      
      var speed = this.options.speed;
      if (this.dragging) {
        speed = this.options.rushspeed;
      }

      var diff = target - this.currVal;     
      if(!diff) {
        this.animating = false;
        // we're done! trigger callback
        if (triggerCallbackWhenDone) {
          //console.log(this.currVal);
         
          if (this.mouseDown) {
            //console.log('delayed result callback, mousedown');
            this.pendingResultCallback = true;
          } else {       
            //console.log('glide callback');    
            this.parent.resultCallback();  
          }
        }
        return false;
      }
      if(Math.abs(diff) > this.bounds.xStep ) {      
        this.currVal += diff * speed;     
      }
      else {
        this.currVal = target;
      }
      this.updateHandle();
      return true;
    },



    clearAnimation: function() {
      if (this.curAnimationTimeoutID) {
        clearTimeout(this.curAnimationTimeoutID);
      }
      this.animating = false;
    },


    // takes fractional position and does clipping, stepping, out-of-bounds elastic
    getAdjustedValue: function(value,  stepped, loose) {
      
      //var adjValue = this.groupClone(value);
      var adjValue = value;

      adjValue = Math.max(adjValue, 0);
      adjValue = Math.min(adjValue, 1);

      if(this.myAdjustValue) {
  
        adjValue = this.myAdjustValue(adjValue);
      }

      if (loose) {
        adjValue = this.calcLooseValue(value,adjValue);
        return adjValue;
      } else if (stepped) {
        var adjValue = this.parent.getClosestStep(adjValue);

      }
      return adjValue;
      
    },
    
    // additional constraints, to be overridden in child class
    myAdjustValue: function(val) {
      return val;
    },

    // offset from parent
    getOffset: function() {
      return this.handle.offsetLeft;
    },

    // absolute pos
    getPosition: function() {
      return this.$handle.offset().left;
    },

    getValueFromOffset: function(offset) {  
      var offsetAdj = offset -  this.handleOffset;
      //log('offset adj:' + offsetAdj);
      var range = this.bounds.xRange;
      var padding = this.bounds.x0;
      var val = range ? (offsetAdj - padding) / range : 0;

      return val;

      //return this.getRatioByOffset(offset, this.bounds.xRange, this.bounds.x0);      
    },

    
    getOffsetByValue: function(value)  {
      var offset =  Math.round(value * this.bounds.xRange) + this.bounds.x0;
      offset = offset + this.handleOffset;
      //log('get offset by value:'+ offset);
      return offset;
      
    },
    
    calcLooseValue: function(value,proper)
    {
      var diff = (value-proper);
      //var adjusted = Math.pow(Math.abs(diff), 0.5)/4;
      var adjusted = Math.sqrt(Math.abs(diff))/4;
      return (diff < 0) ? proper - adjusted : proper + adjusted;
    }


  });

  /* SliderControl
  PUBLIC METHODS:
     - setValue(x,y,glide)
     - setAnimationCallback(fn)
     - setCallback(fn)

     OPTIONS:
     - slide: will it glide a bit if you drag & release?
     - speed: general animation speed
     - snap: (only use if "steps" defined), snap to nearest step
     - loose: AKA allow dragging outside wrapper/tracks

     TBD:
     - if glides to a step, should callback happen when done or after?

     BEHAVIOR NOTES:
     - if handle glides from inertia after-drag, or moving to a step, etc, callback() 
     is called when stop moving
     */

  var SliderControl = Class.$extend( {
    __classvars__: {
      HANDLE_CLASS: SliderHandle,
    
      defaults: {
        disabled: false,
        slide: false,
        steps: 0,
        snap: false,
        loose: false,
        speed: 10,
        callback: null,
        setValueTriggersCallback: true,
        animationCallback: null,
        
        getRealValueFn: null,  // if provided, function to scale [0..1] value to some more useful number (for callbacks)
        values: null,   // provided a list of discrete values the slider can be. automatically causes "steps" to be set
        
        leftPadding:  0,
        rightPadding: 0,        
        outsideMode: false,      // auto set left/right padding to half of handle width (so the handle isn't constrained)
        initVal: 0,
        initStep: null,
        
        handleOffset: 0   // mainly for dual-handle slider, to offset one to left, other to right
        
      }
    },

    __init__: function(wrapper, options) {

      // offset() is absolute
      // position() is relative to parent
      // Position is absolute (i.e. offset)
      // .offsetLeft is relative

      options = $.extend({}, this.$class.defaults, options);

      var realspeed = options.speed/ 100;
      var rushspeed = Math.min(1.0, realspeed*3);

      options.speed = realspeed;
      options.rushspeed = rushspeed;

      this.animationCallbacks = [];
      if (options.animationCallback) {
        this.addAnimationCallback(options.animationCallback);
      }
      this.callback = options.callback;
      this.getRealValueFn = options.getRealValueFn;

      if (options.values) {
        var values = options.values;
        this.getRealValueFn = function(val) {
          var index = Math.round(val * (values.length-1));
          return values[index];
        }
        options.steps = values.length;
        // construct a map of values -> steps, to allow reverse setting
        
        var valueStepMap = {};
        for (var i=0; i < values.length; i++) {
          valueStepMap[values[i]] = i;
        }
        this.valueStepMap = valueStepMap;
      }

      if(typeof(wrapper) == 'string') {
        wrapper = document.getElementById(wrapper);
      } 

      var $wrapper = $(wrapper);
      
   
      var self = this;

      this.wrapper = wrapper;
      this.$wrapper = $wrapper;
      this.handles = [];
      //this.handle_elems = handle_elems;

      this.options = options;

      this.setup();
      
      
    },
    
    setup: function() {
      //console.log('in setup');
      this.bounds = {
        //left: leftPadding,
        //right: rightPadding,
  
        x0: 0,
        x1: 0,
        xRange: 0
      };
      this.constructHandles();  
      
      var options = this.options;

      //var left = this.options.leftPadding;
      //var right = -this.options.rightPadding;
      if (!options.leftPadding && !options.rightPadding && options.outsideMode) {
        options.leftPadding = -Math.round(this.handleWidth/2);
        options.rightPadding = -Math.round(this.handleWidth/2);
      }

     
      this.wrapperPos = 0;      
      this.mousePos = 0;
        
    
      this.updateWrapperPosition();     
      this.updateBounds();

      this.constructSteps();
      
      this.initHandles();    // put the handles in initial locations
      
      this.fillbar = null;
      var $fillbar = this.$wrapper.children(".slider-fill");
      if ($fillbar.length) {
        this.fillbar = $fillbar.get(0);
        //console.log(this.fillbar);       
        this.updateFill();
      }

      
      this.addListeners();
      for (var i=0; i< this.handles.length; i++) {
        this.handles[i].addListeners();
        //this.handles[i].updateHandle();    // in case the initial offset is set manually
        //console.log('init handle val: ' + this.handles[i].value());
      }

   
    },

    /** PUBLIC METHODS **/
    
    value: function() {
      //return this.currVal;
      return  this.getRealValue(this.handles[0].currVal);
    },

    rawValue: function() {
      return (this.handles[0].currVal);
    },

    addAnimationCallback: function(func, update) {
      this.animationCallbacks.push(func);
      
      if (update) {
        // to force animation update
        this.animationFeedback();
      }


    },
    setCallback: function( func) {
      this.callback = func;
    },

    
    enable: function()  {
      this.disabled = false;
      this.handle.className = this.handle.className.replace(/\s?disabled/g, '');
    },
    disable: function()  {
      this.disabled = true;
      this.handle.className += ' disabled';
    },

    setStep: function(stepIndex, glide, handleIndex)  {
      
      handleIndex = (handleIndex == undefined)? 0 : handleIndex;
      var handle = this.handles[handleIndex];

      //glide = typeof(glide) != 'undefined' ? glide : false;
      handle.setValue(
	//this.options.steps && stepIndex > 1 ? (stepIndex-1) / (this.options.steps - 1) : 0,
	this.options.steps  ? (stepIndex) / (this.options.steps - 1) : 0,
	glide
      );
    },

    // virtual function
    setValue: function(value, glide, triggerCallback, handleIndex) {
      
      handleIndex = (handleIndex == undefined)? 0 : handleIndex;

      var handle = this.handles[handleIndex];
   
      triggerCallback = typeof(triggerCallback) != 'undefined' ? triggerCallback : this.options.setValueTriggersCallback;

      handle.setValue(value, glide);
      
      if (triggerCallback) {
        this.resultCallback();    
      }
      
    },

    setStepByValue: function(value, glide, handleIndex) {
      var step = this.valueStepMap[value];
      if (step)  {
        this.setStep(step, glide, handleIndex);
      }
    },

    /** INITIALIZATION FUNCTIONS **/
    
    // should function should make this.handles[]
    constructHandles: function() {

      var $handles;   
      var handles;
  
      var handle_obj = this.$wrapper.children(".handle").first();    
      $handles = [handle_obj];             

      //console.log(this.$class.HANDLE_CLASS);
      //handles = [new SliderHandle(handle_obj.get(0), this, this.options.initX) ];

      handles = [new this.$class.HANDLE_CLASS(handle_obj.get(0), this, this.options.initVal, this.options.handleOffset) ];
     
      this.handles = handles;
      this.$handles = $handles;

      //this.handleWidth = $handles[0].offset();
      this.handleWidth = handles[0].width();
      //console.log('handlewidth:' + this.handleWidth);

  
    },


    
    // Set the absolute position of the wrapper
    updateWrapperPosition: function() {        
      //this.wrapperPos = Position.get(this.wrapper);
      this.wrapperPos = this.$wrapper.offset().left;
    },
   
    
    updateBounds: function() {
      
      //this.bounds = {};

      //this.bounds.x0 = this.bounds.left;
      //this.bounds.x1 = this.wrapper.offsetWidth + this.bounds.right;

      this.bounds.x0 = this.options.leftPadding;
      this.bounds.x1 = this.wrapper.offsetWidth - this.options.rightPadding;
      this.bounds.xRange = (this.bounds.x1 - this.bounds.x0) - this.handleWidth;


      // actual movement is END - BEGIN - HANDLESIZE (obviously)
      
      // basically, xStep/yStep is the minimum "value" (0...1) that would be a noticeably 1 pixel thing, and
      // thus cause a visible update
      // e.g. 1 pixel / 500 pixels = 0.002

      this.bounds.xStep = 1 / Math.max(this.wrapper.offsetWidth, this.handleWidth);
   
    },

    initHandles: function() {
      
      // do some init on handles

      //if (this.options.initX) {
      //console.log('init handle');
      //this.setValue(this.options.initVal, false, false);

      if (this.options.initStep != null) {
        this.setStep(this.options.initStep);
      } else {
        //this.setValue(this.options.initVal);
        this.handles[0].setValue(this.options.initVal);
      }
    //}
    },

    updateHandles: function() {
      for (var i=0; i < this.handles.length; i++) {
        this.handles[i].updateHandle();
      }
    },

    updateFill: function() {
      //var handle = this.handles[0];
      this.fillbar.style.width = String(this.handles[0].currOffsetCenter() ) + "px";
    },


    constructSteps: function() {
      var steps = this.options.steps;
      if(steps > 1) {        
	this.stepRatios = [];
	for (var i = 0; i <= steps - 1; i++)  {
	  this.stepRatios[i] = i / (steps - 1);
	}
      }
    },


    addListeners: function() {
    
      var self = this;
      
      this.wrapper.onselectstart = function() {          
	return false;
      }
   
      this.$wrapper.bind('mousedown touchstart', function(e) {
        self.wrapperDownHandler(e);
      });
      
      $(window).resize( function(e) {
        self.documentResizeHandler(e);
      });

      this.$wrapper.mousemove(function() {
        self.activity = true;
      });

      this.wrapper.onclick = function(e) {
	return !self.activity;
      }

    },
  
    /** EVENT HANDLERS **/

    wrapperDownHandler: function(e) {
      Cursor.refresh(e);
      
      preventDefaults(e, true);
      //console.log('wrapper down');
      this.startTap();
    },
  
    documentResizeHandler: function(e)
    {
      this.updateWrapperPosition();
      //this.updateBounds();
      
      /*
      for (var i=0; i < this.handles[i]; i++) {
        handle.updateHandle(); // FIXME
      }
      */
      //console.log('resize');
    },
    
    startTap: function()
    {
      //console.log('starttap');
      if(this.disabled)
      {
        return;
      }
    
      

      offset =  Cursor.x - this.wrapperPos - (this.handleWidth / 2);

      //console.log(offset); 
      //console.log(Cursor.x + '/' + Cursor.y);

      var handle = this.handles[0];

      handle.tapToOffset(offset);

      // from here, we either to go tapToDrag--> (stopTap) or (startDrag-->stopDrag)
      // or.. straight to stopTag

    },


    // basically calls animationCallback()
    animationFeedback: function() 
    { 
      if (this.animationCallbacks.length > 0) {
        
        var handle = this.handles[0]
        var value = this.getRealValue(handle.currVal);

        //var prev = handle.prevValAnimation;

        for (var i=0; i < this.animationCallbacks.length; i++) {
          var animationCallback = this.animationCallbacks[i];
          animationCallback(value);    
        }
        //handle.prevValAnimation = handle.currVal;

        // doesn't really feel necessary to check prev, since updateHandle only changes on mouse move..
     
      }

      if (this.fillbar) {
        this.updateFill();
      }
    },
   
    resultCallback: function() {
  
      if (this.callback) {
        var value = this.getRealValue(this.handles[0].currVal);
       
        this.callback(value);
      }
    },


    getClosestStep: function(value)  {
      var k = 0;
      var min = 1;
      for(var i = 0; i <= this.options.steps - 1; i++)  {
	if(Math.abs(this.stepRatios[i] - value) < min) {
	  min = Math.abs(this.stepRatios[i] - value);
	  k = i;
	}
      }
      var result = this.stepRatios[k];    
      return result;
    },

    // convert to more usable value if getRealVanFn defined
    getRealValue: function(value) {
      if (this.getRealValueFn) {
        value = this.getRealValueFn(value);
      }
      return value;
    }
    

  });

  var DualSliderHandle = SliderHandle.$extend( {
   
    setLeftNeighbor: function(handle) {
      this.leftNeighbor = handle;
    },

    setRightNeighbor: function(handle) {
      this.rightNeighbor = handle;
    },

     
    myAdjustValue: function(val) {
      //console.log('my adjust:' + val);
      if (this.leftNeighbor) {
        val = Math.max(val, this.leftNeighbor.currVal);
      } 
      if (this.rightNeighbor) {
        val = Math.min(val, this.rightNeighbor.currVal);
      } 
      return val;
    }

  });

  var DualSliderControl = SliderControl.$extend({
    __classvars__: {
      
      HANDLE_CLASS: DualSliderHandle,
      defaults: $.extend({}, SliderControl.defaults, {
        initVal0: 0.33,
        initVal1: 0.66,
        initStep0: null,
        initStep1: null
      })

    },

    //HANDLE_CLASS: DualSliderHandle,
    /*
    defaults: $.extend({}, SliderControl.defaults, {
      initVal0: 0.33,
      initVal1: 0.66
      

    }),
    */
    //defaults: $.extend({initVal0: 0.33, 
    //initVal1: 0.66
  //}, SliderControl.defaults),


    setup: function() {
      this.$super();
      //console.log('Dualslider');
      var $rangebar = this.$wrapper.children(".range-bar");

      //console.log($rangebar);
      this.$rangebar = $rangebar;
      this.rangebar = $rangebar.get(0);

      // draw the bar
      this.updateHandles();
    },
    
    
    // just more intuitive way to set value for a handle (argument order)
    setValueForHandle: function(handleIndex, value, glide, triggerCallback) {
      this.setValue(value,glide, triggerCallback, handleIndex);
    },
    setStepForHandle: function(handleIndex, stepIndex, glide)  {
      this.setStep(stepIndex, glide, handleIndex);
    },
    setStepByValueForHandle: function(handleIndex, stepIndex, glide)  {
      this.setStepByValue(stepIndex, glide, handleIndex);
    },

    constructHandles: function() {

      var $handles;   
      var handles;
      var handle_left = this.$wrapper.children(".handle-left").first();
      var handle_right = this.$wrapper.children(".handle-right").first();

      var handleclass = this.$class.HANDLE_CLASS;

      $handles = [handle_left, handle_right];    
      handles = [new handleclass(handle_left.get(0), this, this.options.initVal0, -this.options.handleOffset),
                 new handleclass(handle_right.get(0), this, this.options.initVal1, this.options.handleOffset)
                ];  

      handles[0].setRightNeighbor(handles[1]);
      handles[1].setLeftNeighbor(handles[0]);

      this.handles = handles;
      this.$handles = $handles;

      //this.handleWidth = $handles[0].offset();
      this.handleWidth = handles[0].width();
      //console.log('handlewidth:' + this.handleWidth);
      
    },

    initHandles: function() {
      if (this.options.initStep0 != null) {
        this.setStepForHandle(0, this.options.initStep0);
      } else {
        this.handles[0].setValue(this.options.initVal0);
      }

      if (this.options.initStep1 != null) {
        this.setStepForHandle(1, this.options.initStep1);
      } else {
        this.handles[1].setValue(this.options.initVal1);
      }
      //this.handles[0].setValue(this.options.initVal0);
      //this.handles[1].setValue(this.options.initVal1);
    },

 
    
    startTap: function() {
     
      if(this.disabled)  {
        return;
      }
    
      offset =  Cursor.x - this.wrapperPos - (this.handleWidth / 2);

      // find closest handle

      var leftOffset = this.handles[0].currOffset;
      var rightOffset = this.handles[1].currOffset;

      var leftDelta = Math.abs(offset - leftOffset);
      var rightDelta = Math.abs(offset - rightOffset);

      if (leftDelta < rightDelta) {                
        this.handles[0].tapToOffset(offset);
      } else {
        this.handles[1].tapToOffset(offset);
      }
      // from here, we either to go tapToDrag--> (stopTap) or (startDrag-->stopDrag)
      // or.. straight to stopTag

    },

    animationFeedback: function() {
      //this.$super();
      if (this.animationCallbacks.length > 0) {
        
        //var handle = this.handles[0]
        //var value = handle.currVal;
        //var prev = handle.prevValAnimation;
        var value0 = this.getRealValue(this.handles[0].currVal);
        var value1 = this.getRealValue(this.handles[1].currVal);

        for (var i=0; i < this.animationCallbacks.length; i++) {
          var animationCallback = this.animationCallbacks[i];
          animationCallback(value0, value1);    
        }
        //handle.prevValAnimation = handle.currVal;
      }


      // need "if", since animationFeedback may be called before rangebar is initialized
      if (this.rangebar) {

        //var leftoffset = this.handles[0].currOffsetCenter();
        //var rightoffset = this.handles[1].currOffsetCenter();
        //var width = rightoffset - leftoffset;

        var leftoffset = this.handles[0].currOffset;
        var rightoffset = this.handles[1].currOffset;
        var width = rightoffset - leftoffset;
        var leftoffsetAdj = leftoffset + this.handleWidth/2;

        //console.log(leftoffsetAdj+','+rightoffset+','+width);
       
        this.rangebar.style.left = String(leftoffsetAdj) + 'px';
        this.rangebar.style.width = String(width) + 'px';
      }
    },

    resultCallback: function() {
      if (this.callback) {
        var val0 = this.getRealValue(this.handles[0].currVal);
        var val1 = this.getRealValue(this.handles[1].currVal);
        this.callback(val0, val1);
      }
    },

    // public function to get value of slider..
    value: function(index) {
      if (index === undefined)  index = 0;
      return this.getRealValue(this.handles[index].currVal);
    },

    realValue: function(index) {
      if (index === undefined)  index = 0;
      return this.getRealValue(this.handles[index].currVal);
    },
    


  });
  
  return {
    SliderControl: SliderControl,
    DualSliderControl: DualSliderControl    
  }
  
})();


var SliderControl = _SliderControlLib.SliderControl;
var DualSliderControl = _SliderControlLib.DualSliderControl;

/*
var handle_left = this.$wrapper.children(".handle-left").first();
        var handle_right = this.$wrapper.children(".handle-right").first();
        $handles = [handle_left, handle_right];
        //handle_elems = [handleLeft, handleRight];
        handles = [new SliderHandle(handle_left.get(0), this, this.options.initX),
                   new SliderHandle(handle_right.get(0), this, this.options.initXRight)
                  ];
f
*/
