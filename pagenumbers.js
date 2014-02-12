var PageNumbers = Class.$extend( {

  __classvars__: {
    defaults: {
      numVisible: null,
      inferNumVisible: true,
      callback: null,
      //minShiftSpacing: 3,
      shiftMode: "half"
    }

  },
  
  __init__: function(wrapper, options) {
    
     options = $.extend({}, this.$class.defaults, options);

    if(typeof(wrapper) == 'string') {
      wrapper = document.getElementById(wrapper);
    } 
    var self = this;
   

    var $wrapper =  $(wrapper);
    this.wrapper = wrapper;
    this.$wrapper = $wrapper;
    this.options = options;
    this.callback = options.callback;

    this.currPageNum = 1;
  

    var pageNumbers = $wrapper.find(".number");
    //pageNumbers.click(function() { alert('click') });

    pageNumbers.each(function(index) {
      
      $(this).click(function() {     
        //alert('click');
        self.selectPage(index+1);
      });
    });
    
    this.pageNumbers = pageNumbers;
    this.numPages = pageNumbers.size();

    this.leftNumVisible = 1;
    this.rightNumVisible = this.numPages;

    var left_arrow = $wrapper.find(".left-arrow");
    var right_arrow = $wrapper.find(".right-arrow");
    //console.log(left_arrow);

    left_arrow.click(function() {self.decrementPage()} );
    right_arrow.click(function() {self.incrementPage()} );
    //console.log(this.pageNumbers);

    this.leftEllipsis = null;
    this.rightEllipsis = null;
    //this.leftEllipsisText = null;
    //this.rightEllipsisText = null;

    if (options.numVisible == null && options.inferNumVisible) {
      options.numVisible = pageNumbers.filter(":visible").size();
      //console.log("inferred num visible:" + options.numVisible);
    }

    if (options.numVisible && this.numPages > options.numVisible) {
      this.leftEllipsis = $wrapper.find(".left-ellipsis");
      this.leftEllipsisText = this.leftEllipsis.find('span');
    
      //console.log(this.leftEllipsis.find('span'));
      this.rightEllipsis = $wrapper.find(".right-ellipsis");
      this.rightEllipsisText = this.rightEllipsis.children(".text");
      //this.rightEllipsis.click(function() {self.shiftRight(true) } );
      
      this.rightNumVisible = options.numVisible;
    }
    this.shiftSpacing = 0;
    if (options.shiftMode == "half") {
      this.shiftSpacing = Math.floor(options.numVisible/2);
    }

    //console.log(pageNumbers.eq(2));
    //
  },

  selectPage: function(page_num) {
 
    this.currPageNum = page_num;
    this.pageNumbers.removeClass("selected");
    this.pageNumbers.eq(page_num-1).addClass("selected");
    if (this.callback) {
      this.callback(page_num);
    }
  },

  decrementPage: function() {

    if (this.currPageNum > 1) {  

      if (this.hasMorePagesLeft() &&
          (this.currPageNum - this.leftNumVisible) < this.shiftSpacing) {
        //(this.currPageNum - this.leftNumVisible) < 2) {
     
        this.shiftLeft();

        if (! this.hasMorePagesLeft()) {
          this.toggleLeftEllipsis(false);
        }
        this.toggleRightEllipsis(true);
        /*
        if (! this.hasMorePagesLeft()) {
          this.leftEllipsis.css({'color': "white"});
        }
        */
      }

      this.selectPage(this.currPageNum - 1);

    }
  },

  incrementPage: function() {

    var pageNum = this.currPageNum;

    if (pageNum < this.numPages) {

      if (this.hasMorePagesRight() &&
          (this.rightNumVisible - this.currPageNum) < this.shiftSpacing) {
          //(this.rightNumVisible - this.currPageNum) <2) {
        this.shiftRight();

        if (! this.hasMorePagesRight()) {
          //this.rightEllipsis.css({'color': "white"});
          this.toggleRightEllipsis(false);
        }
        //if (this.hasMorePagesLeft()) {
          this.toggleLeftEllipsis(true);
      //}
      }
      
      this.selectPage(pageNum + 1);
    }
  },
  shiftLeft: function(decrement) {
    //console.log("shiftLeft");
  
    this.pageNumbers.eq(this.rightNumVisible-1).hide().removeClass("right");
    this.pageNumbers.eq(this.rightNumVisible-2).addClass("right");
    this.pageNumbers.eq(this.leftNumVisible-1).removeClass("left");
    this.pageNumbers.eq(this.leftNumVisible-2).show().addClass("left");

    this.leftNumVisible --;
    this.rightNumVisible --;


  },


  shiftRight: function(increment) {
    //console.log("shiftRight");

    this.pageNumbers.eq(this.leftNumVisible-1).hide().removeClass("left");
    this.pageNumbers.eq(this.leftNumVisible).addClass("left");
    this.pageNumbers.eq(this.rightNumVisible-1).removeClass("right");
    this.pageNumbers.eq(this.rightNumVisible).show().addClass("right");

    this.leftNumVisible ++;
    this.rightNumVisible ++;

  },

  hasMorePagesRight: function() {

    return (this.rightNumVisible  < this.numPages);
  },
  hasMorePagesLeft: function() {
   return (this.leftNumVisible > 1);
  },

  toggleRightEllipsis: function(show) {
    show = (show == undefined)? true: show;
    //console.log('toggle right ellipsis:', show);
    if (show) {
  
      this.rightEllipsisText.fadeIn(300);
      
    } else {
      this.rightEllipsisText.fadeOut(300);
      //this.rightEllipsis.css({'color': 'white'});
    }

  },

  toggleLeftEllipsis: function(show) {
    show = (show == undefined)? true: show;
    if (this.leftEllipsisText.length) {

      if (show) {
        this.leftEllipsisText.fadeIn(300);
        
      } else {
        this.leftEllipsisText.fadeOut(300);
        
      }

    }
  }



});