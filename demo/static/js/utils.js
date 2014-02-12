/*
jQuery.fn.delay = function(time,func){
	this.each(function(){
		setTimeout(func,time);
	});
	
	return this;
};
*/

var GeocoderUtils = (function() {
  var geocoder;  // call it on demand


  function getLatLngFromGeocoderResults(results) {
 
    try {
      var point = results[0].geometry.location;
      return point;
    } catch (err) {
      return null;     
    }
  }


  function tryGetLatLngFromGeocoderResponse(results, status, callback) {
      if (status == google.maps.GeocoderStatus.OK) {
        var point = GeocoderUtils.getLatLngFromGeocoderResults(results);
        if (point) {
          callback(point);
        }
      }
  }
  
  function getLocationFromGeocoderResults(results) {

    var output_city = "";
    var output_state = "";
    var output_zip = "";

    var output_street = "";


    try {
      var address_components = results[0].address_components;
      for (var i=0; i<address_components.length; i++) {
        var component = address_components[i];
        //console.log(component)

        if (component.types[0] == "postal_code") {
          output_zip = component.short_name
        }
        //if (component.types[0] == "locality") {
        if ($.inArray("locality", component.types) != -1) {
          output_city = component.long_name;
        }

        if ($.inArray("administrative_area_level_1", component.types) != -1) {
          output_state = component.short_name;
        }

        if ($.inArray("route", component.types) != -1) {
          output_street = component.long_name;
        }
        
      }
      
      var decoded_location = {};
      
      if (output_city || output_state || output_zip) {
        decoded_location.city = output_city;
        decoded_location.state = output_state;
        decoded_location.zip = output_zip;
        
        decoded_location.street = output_street;
        return decoded_location;
      }

    } catch (err) {
      return null;     
    }
    
  }

  function tryGetLocationFromGeocoderResponse(results, status, callback) {
    if (status == google.maps.GeocoderStatus.OK) {
      var location = GeocoderUtils.getLocationFromGeocoderResults(results);
      if (location) {
        callback(point);
      }
    }
  }

  function decodeGeocoderResults(results) {
    try {
      var point = getLatLngFromGeocoderResults(results);
      var location = getLocationFromGeocoderResults(results);
      
      if (point && location) {
        return {
          point: point,
          location: location
        }
      } else {
        return null;
      }
      
    } catch (err) {
      return null;
    }
  }

  function decodeAddress(address, callback) {
    if (geocoder == null) geocoder = new google.maps.Geocoder();
    
    geocoder.geocode({'address': address}, function(results, status) {
    
      var location = GeocoderUtils.getLocationFromGeocoderResults(results);    
      if (location) {
      
        callback(location);
      }
    });
  }
  
  function decodeAddressFull(address, callback, fallback) {
    if (geocoder == null) geocoder = new google.maps.Geocoder();
    
    geocoder.geocode({'address': address}, function(results, status) {
    
      var geolocation  = GeocoderUtils.decodeGeocoderResults(results);    
      if (geolocation) {      
        callback(geolocation);
      } else if (fallback) {
        fallback();
      }
    });
  }


  /*
  function decodeGeocoderResults(results) {
    var point = getLatLngFromGeocoderResults(results);
    var point = getLatLngFromGeocoderResults(results);
  }
  */

  return {
    getLatLngFromGeocoderResults: getLatLngFromGeocoderResults,
    getLocationFromGeocoderResults: getLocationFromGeocoderResults,
    tryGetLatLngFromGeocoderResponse: tryGetLatLngFromGeocoderResponse,
    tryGetLocationFromGeocoderResponse: tryGetLocationFromGeocoderResponse,
    decodeGeocoderResults: decodeGeocoderResults,
    decodeAddress: decodeAddress,
    decodeAddressFull: decodeAddressFull
  }

})();





var Utils = {
  makeLocationStr: function(city, state, zip, verbose) {
    if (verbose===undefined) verbose=false;

    var location_str = "";
    if (zip) {
      if (verbose) {
        location_str = city + ", " + state + " " + zip
      } else {

        location_str = zip;
      }
    } else if (city) {
      location_str = city + ", " + state;
    } else if (state) {
      location_str = Constants.STATE_NAMES_MAP[state];
    }

    return location_str;
  },

  location2string: function(location, verbose) {
    return Utils.makeLocationStr(location.city, location.state, location.zip, verbose);
  },

  truncateNice: function(text, num) {
    if (text.length > num) {
      return text.substr(0, num-4) + " ...";
    } else {
      return text;
    }
  },



  // Simple utility to clean a string (e.g. "$5,000,000.00" and return
  // an integer)
  string2int_clean : function(string) {
    var cleaned = string.replace(/[^\d\.]/g,"")
    result = parseInt(cleaned);
    return result;
  },

  string2float_clean : function(string) {
    var cleaned = string.replace(/[^\d\.]/g,"")
    result = parseFloat(cleaned);
    return result;
  },

  
  num2dollar: function(num) {
    var converted = "$" + num.commafy();
    return converted
  },

  num2apy: function(num) {
    return num.toFixed(2) + "%"
  },

  num2months: function(num) {
    if (num == 1) {
      return "1 month"; 
    } else {
      return num + ' months';
    }
  }

  /*
  setLocationCookie: function(state, city, zip) {
    new_location = { 
      state: state,
      city: city,      
      zip: zip };
    
    JSONCookies.create('location', new_location, 14);
  }
  */

};

  
var FinanceUtils = {


};
