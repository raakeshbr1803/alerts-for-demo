$(document).ready(function () {
  $.ajax({
    url: "./images/custom-int-noc.csv",
    async: true,
    success: function (csvd) {
      $.getScript("https://cdnjs.cloudflare.com/ajax/libs/jquery-csv/0.8.3/jquery.csv.min.js",function(){
        csvData = $.csv.toArrays(csvd);
        console.log(csvData);
        localStorage.setItem("data",JSON.stringify(csvData));
      });
    },
    dataType: "text",
    complete: function () {
    }
  });
  $("#send").click(pushAlerts);
});

function generateAlertPayload(data){
  var severity = ["critical","error","warning","ok"]
  date_iso = new Date().toISOString();

  payload = {
    "node": data[3],
    "tags": [
      "us-east",
      "application tire",
      "fs-bg",
      "ams",
      "partial-cache"
    ],
    "message": data[7],
    "resource": data[5],
    "severity": severity[Math.floor(Math.random() * severity.length)],
    "description": data[7],
    "metric_name": data[1],
    "metric_value": data[2],
    "occurrence_time": "2020-07-03T19:14:07+05:30"
  }
  console.log(payload)
  return JSON.stringify(payload);;
}

function makeRequest(int, data) {
  if(int.endpoint==="" || int.auth===""){
    return;
  }
  var options = {
    "async": true,
    "crossDomain": true,
    "url": int.endpoint,
    "method": "POST",
    "headers": {
      "Authorization": int.auth,
      "Content-Type": "application/json",
      "cache-control": "no-cache",
    },
    "processData": false,
    "data": generateAlertPayload(data)
  }
  console.log(options);
  $.ajax(options);
}

function pushAlerts() {
    var integration = Array.from(document.querySelectorAll("#alert-form input")).reduce((auth, input) => ({ ...auth,
      [input.id]: input.value}), {});
    data_local = JSON.parse(localStorage.getItem("data")) || data_local;
    makeRequest(integration,data_local[1]);
}