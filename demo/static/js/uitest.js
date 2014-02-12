String.prototype.commafy = function () {
        return this.replace(/(^|[^\w.])(\d{4,})/g, function($0, $1, $2) {
                return $1 + $2.replace(/\d(?=(?:\d\d\d)+(?!\d))/g, "$&,");
        });
}

Number.prototype.commafy = function () {
        return String(this).commafy();
}
  var myconsole;
var depositinput;

function deposit_slider_animate(x,y) {
  var scaledVal = adj_slider_val_dollar(x);
  var strVal = num2string_dollar(scaledVal);

  depositinput.val(strVal);
  //alert('animate');
}

function adj_slider_val_dollar(val) {
  return Math.round(10000*val/100)*100;
}


function num2string_dollar(val) {
  return ("$" + val).commafy();
}

function input2slider(val) {
  return (val/10000);
}

 myconsole = function(msg) {
    $("#console").append('<span> ' + msg + ' </span>')
  }

$(function() {
  $("#boxtofade").bind("mousewheel DOMMouseScroll", function() {
    console.log('scroll');
    return false;
  });


  depositinput = $("#depositval input");


   depositinput.change(function() {

    var val = $(this).val();

    adjVal = input2slider(val);

    //depositslider.setValue(adjVal);
    var strVal = num2string_dollar(val);
    //    alert(strVal);


    //alert(adjVal);

    depositslider.setValue(adjVal, 0);
    //alert($(this).val());
    //$(this).val("$" + val);
    $(this).val(strVal);

  });


  var handle = $("#animatebox .handle");
  $("#animatebox .item").each(function(index) {
    $(this).click(function() {
      handle.animate(
        {
          top:  index*40
        },200);
      //alert(index);

    });
  });



  var bloop = $("#bloop");
  var meep;
  function apple() {
    myconsole("apple");
    bloop.unbind('mousedown', apple);
  }

  var moop = {
    name: 'moop',
    test: function() {
      alert(this.test);
      bloop.unbind('click', this.test);
    }
  }

  bloop.click($.proxy(moop.test, moop));
  bloop.click(function() {myconsole('hey')});


});


/*
(function($) {
  var methods = {
    init: function(options) {
      console.log(options);
    },
    show: function(arg) {
      console.log('show' + arg);
    }

  };

  $.fn.radio = function(method) {
    // Method calling logic
    if ( methods[method] ) {
      return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
    } else if ( typeof method === 'object' || ! method ) {
      return methods.init.apply( this, arguments );
    } else {
      $.error( 'Method ' +  method + ' does not exist on jQuery.radio' );
    }

  };

})(jQuery);

$(".radio-std").radio();
$("#radio1").radio('show', 'hi there');
*/


function Foobar(element, options) {
  //var elem = $(element);
  this.elem = $(element);
  //var obj = this;
  //console.log("Constructed with")
  //console.log(this);
  //console.log(element);

  // Public method
  /*
    this.foo = function(arg){
    console.log('print: ' + arg);
    };
  */
  function foo(arg) {
    console.log('foo: ' + arg);
  }
  this.print = function() {
    console.log("PRINT");
    //console.log(this);
    console.log(this.elem);
    //console.log(elem);
    console.log("ENDPRINT");
  }

};

Foobar.prototype = {
  foo: function(arg) {
    console.log('print: ' + arg);
  }
};

(function($){

  $.fn.foobar = function(arg){

    var orig_arguments = arguments;

    console.log(this);

    return this.each(function(){
      var element = $(this);
      //console.log(orig_arguments);
      var existing_obj = element.data('foobar');

      if (existing_obj) {

        if (typeof(existing_obj[arg]) == 'function') {
          existing_obj[arg].apply(existing_obj, Array.prototype.slice.call( orig_arguments, 1));
        } else {
          //$.error("No method called:  " + arg);
        }

      } else {
        // pass options to plugin constructor
        //var foobar = new Foobar(this, arg);
        var foobar = new Foobar(this);
        console.log("Constructing Foobar with: " + this);
        // Store plugin object in this element's data
        element.data('foobar', foobar);
      }

    });

  };
})(jQuery);

$(function() {

  $("#checkbox1").checkbox('setCallback',function(val) {
    console.log('check val:' + val);
  });

  var radiogroup = $("#radio1").data('radiogroup')
  console.log(radiogroup)
  radiogroup.setCallback(function(val) {
    console.log('radio val:' + val);
  });

  /*
  //$("#foobar1").foobar('foo', 101);

  //$("#foobar1").foobar();
  $(".radio-std").foobar();
  var myfoobar = $("#radio1").data('foobar');
  //console.log(myfoobar);
  myfoobar.foo(5);
  //myfoobar.print();
  //console.log(myfoobar.print);
  $("#radio1").foobar('foo', 101);

  $("#radio2").foobar('foo',201);
  //$("#foobar2").foobar('foo',201);
  */
});



$(function() {

     $("#showmorelink").qtip({
       id: 'user-location-tooltip',
       content: 'Change location here',
       position: {
         my: 'bottom center',
         at: 'top center',
         adjust: {
           y: 10
         }
       },
       show: {
         event: 'click'
       },
       hide: {
         event: 'unfocus'
       },
       style: {
         tip: {
           corner: true,
           //border: true,
           width: 18,
           height: 10
         }
       }
     });

});


$(function() {
  var outgoing = $("#outgoing")
  var incoming = $("#incoming");

  outgoing.fadeOut(1000, function() {
    console.log('done fade out');
    //incoming.fadeIn(1000);
  });


  setTimeout(function() {
    //console.log('time out');
    //incoming.fadeOut(1000);
    outgoing.stop(true,true);
  }, 500);


  //box.hide();

  /*
  box.fadeIn(1000);

  setTimeout(function() {
    console.log('start fadeout');
    box.fadeOut(1000)
  }, 500);
  */
});


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


$(function() {
  initFormElements();
});