var occurenceTime = new Date();

$(document).ready(function () {
  $.ajax({
    url: "./images/custom-int-noc.csv",
    async: true,
    success: function (csvd) {
      //parsing the data on page load
      $.getScript("https://cdnjs.cloudflare.com/ajax/libs/jquery-csv/0.8.3/jquery.csv.min.js",function(){
        csvData = $.csv.toArrays(csvd);
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
}

function generateAlertPayload(data){
  var severity = ["critical","error","warning","ok"]
  occurenceTime.setMinutes(occurenceTime.getMinutes() + 2);

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
    "occurrence_time": occurenceTime.toISOString()
  }
  return payload;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function pushAlerts() {
    var integration = Array.from(document.querySelectorAll("#alert-form input")).reduce((auth, input) => ({ ...auth,
      [input.id]: input.value}), {});
    if (integration.endpoint === '' || integration.auth === '')
      return;

    //fetching the data from parsed csv
    data_local = JSON.parse(localStorage.getItem("data")) || data_local;
    var authkey = integration.auth.split("auth-key ")[1];
    if (typeof authkey === 'undefined')
    {
      $('#status').removeClass().addClass("status-error").text("Invalid Auth Header format");
      return;
    }

    var url = integration.endpoint+"?auth-key="+authkey;
    $('#status').removeClass().addClass("status-wait").text("Please wait.. This might take 2-3 minutes. Don't refresh this page!");
    randomIndex = Math.floor(Math.random() * 9000);

    $('#send').prop('disabled', true);

    for (let i = 0; i < 200; i++) {
      await postData(url,generateAlertPayload(data_local[randomIndex]));
      randomIndex++; 
    }
    $('#send').prop('disabled', false);
    $('#status').removeClass().addClass("status-wait").text("Alerts are created successfully, kindly check your demo instance.");
    document.getElementById("status").innerHTML += 
              "<p>In the case of alerts not being populated in the demo instance, check for the correctness of the data you have provided or contact the developer.</p>";
}