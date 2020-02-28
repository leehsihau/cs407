function clock() {
    const T = new Date();
    let Hour = T.getHours();
    var minute = T.getMinutes();
    var second = T.getSeconds();
    var weekday = T.getDay();
    var day = T.getDate();
    var month = T.getMonth();
  
    if (Hour < 10) {
      Hour = "0" + Hour;
    }
    if (minute < 10) {
      minute = "0" + minute;
    }
    if (second < 10) {
      second = "0" + second;
    }
    if (day < 10) {
      day = "0" + day;
    }
    month += 1;
    if (month < 10) {
      month = "0" + month;
    }
    w = ["Sun", "Mon", "Tue", "Wed", "Thur", "Fri", "Sat"];
  
    document.getElementById("hour").innerHTML = Hour + " : ";
    document.getElementById("minute").innerHTML = minute + " : ";
    document.getElementById("second").innerHTML = second;
    document.getElementById("weekday").innerHTML = w[weekday] + "";
    document.getElementById("day").innerHTML = day;
    document.getElementById("month").innerHTML = month + " - ";
  }
  
  setInterval(clock, 100);