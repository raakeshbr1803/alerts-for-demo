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

async function postData(url, data) {
  options = {
    method: 'POST',
    mode: 'no-cors',
    cache: 'no-cache',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data)
  }
  let response = await fetch(url, options);
  console.log(response);
}

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
    "occurrence_time": date_iso
  }
  return payload;
}

function pushAlerts() {
    var integration = Array.from(document.querySelectorAll("#alert-form input")).reduce((auth, input) => ({ ...auth,
      [input.id]: input.value}), {});
    data_local = JSON.parse(localStorage.getItem("data")) || data_local;
    var authkey = integration.auth.split("auth-key ")[1];
    if (typeof authkey === 'undefined')
    {
      console.log("Invalid Auth key");
      return;
    }
    var url = integration.endpoint+"?auth-key="+authkey;
    console.log(url);
    postData(url,generateAlertPayload(data_local[990]));
}