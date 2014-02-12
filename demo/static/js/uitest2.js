var sliderinput;
var sliderinput2;
$(function() {
  


  var depositslider = new SliderControl('depositslider', {
  //animationCallback: function(x) {console.log('anim' + x)},
    callback: function() { console.log('CALLBACK'); }
//  speed:100,
//    steps: 10,
//    snap: true
  });

  sliderinput = new SliderInput(depositslider, "depositval_input", {
    cleanInputFn: Utils.string2int_clean,
    displayInputFn: Utils.num2dollar,
    range: [1000,10000],
    roundfactor: 100
    //input2SliderFn: function(x) { return x/10000 },
    //slider2InputFn: function(x) { return Math.round(x*10000/100)*100 }

  });


  
  var depositslider2 = new SliderControl('depositslider2', {
    
    //callback: function() { console.log('CALLBACK'); }
    //steps:10, snap: true

  });

   sliderinput2 = new SliderInput(depositslider2, "depositval_input2", {                                     
     cleanInputFn: Utils.string2int_clean,
     displayInputFn: Utils.num2apy,
     cleanInputFn: Utils.string2float_clean,                                          
     range: [0,5],
     //decimaldigits: 3
     roundfactor: .01


  });
 
  $(".slider-thin").each(function() {
    var slider = new DualSliderControl(this, {
      //steps: 20,
      //snap:true,
      speed: 40,
      handleOffset: 11
    });
  });

  $(".fillslider").each(function() {
    var slider = new SliderControl(this, {
      initVal: 0.5,
      leftPadding: -5,
      rightPadding: -5
    });
  });
  /*
  var fillslider1 = new SliderControl("fillslider1", {
    initVal: 0.5,
    leftPadding: -5,
    rightPadding: -5
  });
  */


  /*
  var pagenumbers = new PageNumbers('page-numbers-test', {
    callback: function(val) {console.log("page num now:" + val)}
    //numVisible: 6
  });

  var pagenumbers2 = new PageNumbers('page-numbers-test2');
  */
  $(".page-num-test").each(function() {
    new PageNumbers(this);
  });
    
  
  /*
  var pagenumbers_broken = new PageNumbersBroken('page-numbers-broken', {
   numVisible: 5,
   callback: function(val) {console.log("page num now:" + val)}

    //numVisible: 6
    });
    */
  
});

var Foo = Class.$extend( {
  
  //size: 5,

  __classvars__ : {
    size: 5,
    MAX : 42
  },

  __init__: function(arg) {
    this.arg = arg;
    //this.bloop();
    console.log('__init__:', this.$class.size);
    //this.init();
  },


  eat: function() {
    console.log('eat foo');
    //console.log(this.$class.size);
  },

  print: function() {
    console.log('print');
    console.log('size:'+this.$class.size) 
    console.log('max:'+this.$class.MAX);
  }

});

//Foo.size = 5;

var Bar = Foo.$extend( {
  //size: Foo.size+111,

  __classvars__ : {
    size: 8,
    MAX : Foo.MAX + 11
  },

  eat: function() {
    this.$super();
    console.log('eat bar');
  }

});

/*
console.log(Foo.MAX);
klass = Foo;
foo = klass('alpha');
bar = Bar('b');
//console.log('foo.size: ' +Foo.size);
foo.eat();
foo.print();
bar.eat();
bar.print();
*/