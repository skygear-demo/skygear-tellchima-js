
// Date plugin
(function () {
  Date.parseDate = function parseDate(dateString) {
    if (dateString.length != 8) return null;
    var date = new Date(dateString.substr(0,4), parseInt(dateString.substr(4,2))-1, dateString.substr(6,2));
    return date;
  }

  Date.compare = function (d1, d2) {
    var d1Time = d1.getTime();
    var d2Time = d2.getTime();
    if (d1Time > d2Time) {return 1;}
    else if (d1Time == d2Time) {return 0;}
    else if (d1Time < d2Time) {return -1;}
  }

  Date.prototype.yyyymmdd = function() {
    var yyyy = this.getFullYear().toString();
    var mm = (this.getMonth()+1).toString();
    var dd  = this.getDate().toString();
    return yyyy + (mm[1]?mm:"0"+mm[0]) + (dd[1]?dd:"0"+dd[0]);
   };

  Date.prototype.previousDay = function() {
    previousDay = new Date(this.getFullYear(), this.getMonth() , this.getDate() - 1);
    return previousDay;
  };

  Date.prototype.nextDay = function() {
    nextDay = new Date(this.getFullYear(), this.getMonth() , this.getDate() + 1);
    return nextDay;
  };

  Date.prototype.alterMS = function(ms) {
    return new Date(this.getTime() + ms);
  }

  Date.prototype.minus = function(seconds) {
    return this.alterMS(-seconds * 1000);
  }

  Date.today = function() {
    var now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }

  Date.yesterday = function() {
    var now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate() -1 );
  }

  Date.prototype.compareTo = function(compareDate) {
    if (!compareDate) throw new Error("Comparing to an empty date");
    return Date.compare(this, compareDate);
  }

  Date.prototype.isEqual = function(date) {
    return (date.getTime() == this.getTime());
   };

  Date.prototype.isAfter = function(compareDate) {
    return this.compareTo(compareDate) === 1;
  }
  
  Date.prototype.isBefore = function(compareDate) {
    return this.compareTo(compareDate) === -1;
  }

}());
