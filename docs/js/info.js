
var chartData;

var chart;


$(function(){
  
  var prefectures = getPrefectures();

  displayList(prefectures);
});


function getTotalHistory() {

  var totalHistory = [];
  
  $.ajax({
    url:"https://covid19-japan-web-api.now.sh/api/v1/total?history=true",
    type:"GET",
    dataType:"json",
    timespan:1000,
    async: false
    }).done(function(data,textStatus,jqXHR) {
      totalHistory = data;
      for(var i in data){
        if(i==0) {
       
          totalHistory[i].positiveDaily = data[i].positive;
         
          totalHistory[i].deathDaily = data[i].death;
        } else {
        
          totalHistory[i].positiveDaily = data[i].positive - data[i-1].positive;
      
          totalHistory[i].deathDaily = data[i].death - data[i-1].death;
        }
    
        totalHistory[i].percent = getPercent(data[i].positive, data[i].death);
      }
    }).fail(function(jqXHR, textStatus, errorThrown ) {
      console.log(jqXHR.status);
      console.log(textStatus);
      console.log(errorThrown);
    }).always(function(){
      console.log("complete");
  });
  return totalHistory;
}


function getPrefectures() {
  
  var prefectures = [];
  prefectures.data = [];
  for (let i = 0; i < 47; i++) {
  
    prefectures.date = [];
    
    prefectures.data[i] = [];
    
    prefectures.data[i].cases = [];
    
    prefectures.data[i].deaths = [];
   
    prefectures.data[i].deathsPer100000 = [];
  }

 
  $.ajax({
    url:"https://covid19-japan-web-api.now.sh/api/v1/prefectures",
    type:"GET",
    dataType:"json",
    timespan:1000,
    async: false
    }).done(function(data,textStatus,jqXHR) {
      
      prefectures.date[0] = new Date();
      for(var i in data){
        
        prefectures.data[i].id = data[i].id;
      
        prefectures.data[i].name_ja = data[i].name_ja;
       
        prefectures.data[i].cases[0] = data[i].cases;
   
        prefectures.data[i].deaths[0] = data[i].deaths;
 
        prefectures.data[i].deathsPer100000[0] = prefectures.data[i].deaths[0] * 100 / populationList[i];
      }
    }).fail(function(jqXHR, textStatus, errorThrown ) {
      console.log(jqXHR.status);
      console.log(textStatus);
      console.log(errorThrown);
    }).always(function(){
      console.log("complete");
  });

 
  var yesterDayStr = getDayDateStr(-1);
  $.ajax({
    url:"https://yakuri.github.io/covid19/data/prefectures_" + yesterDayStr + ".json",
    type:"GET",
    dataType:"json",
    timespan:1000,
    async: false
    }).done(function(data,textStatus,jqXHR) {
     
      prefectures.date[1] = new Date(Date.parse(data.date));
      for(var i in data.data){
  
        prefectures.data[i].cases[1] = data.data[i].cases;
        
        prefectures.data[i].deaths[1] = data.data[i].deaths;
       
        prefectures.data[i].deathsPer100000[1] = prefectures.data[i].deaths[1] * 100 / populationList[i];
      }
    }).fail(function(jqXHR, textStatus, errorThrown ) {
      console.log(jqXHR.status);
      console.log(textStatus);
      console.log(errorThrown);
    }).always(function(){
      console.log("complete");
  });

  return prefectures;
}

function displayList(prefectures) {
  var data = prefectures.data;
 
  data.sort(function(a,b){
    if(a.cases[0] > b.cases[0]) return -1;
    if(a.cases[0] < b.cases[0]) return 1;
    return 0;
  });
 
  var totalCases = 0;
  
  var totalCasesYesterDay = 0;
 
  var totalDeaths = 0;
 
  var totalDeathsYesterDay = 0;
 
  var totalPopulation = 0;

  $("#output").append("<tr>"
    + "<th>都道府県</th>"
    + "<th>感染数(前日比<span class=notice2>(※)</span>)</th>"
    + "<th>死者数(前日比<span class=notice2>(※)</span>)</th>"
    + "<th>死者数の割合(前日比<span class=notice2>(※)</span>)</th>"
    + "<th>10万人あたりの死者数(前日比<span class=notice2>(※)</span>)</th>"
    + "</tr>");

  
  for(var i in data){
  
    var percent = getPercent(data[i].cases[0], data[i].deaths[0]);
 
    var percentYesterDay = getPercent(data[i].cases[1], data[i].deaths[1]);

    $("#output").append("<tr>"
      + "<td>"
      + data[i].name_ja
      + "</td>"
      + "<td>"
      + data[i].cases[0] + "名"
      + "(" + getDiffIntValue(data[i].cases[0], data[i].cases[1]) + ")"
      + "</td>"
      + "<td>"
      + data[i].deaths[0] + "名"
      + "(" + getDiffIntValue(data[i].deaths[0], data[i].deaths[1]) + ")"
      + "</td>"
      + "<td>"
      + percent + "%"
      + "(" + getDiffDecimalValue(percent, percentYesterDay, 1) + ")"
      + "</td>"
      + "<td>"
      + round(data[i].deathsPer100000[0], 2) + "名"
      + "(" + getDiffDecimalValue(data[i].deathsPer100000[0], data[i].deathsPer100000[1], 2) + ")"
      + "</td>"
      + "</tr>");

      totalCases = totalCases + data[i].cases[0];
      totalDeaths = totalDeaths + data[i].deaths[0];
      totalCasesYesterDay = totalCasesYesterDay + data[i].cases[1];
      totalDeathsYesterDay = totalDeathsYesterDay + data[i].deaths[1];
      totalPopulation = totalPopulation + populationList[data[i].id - 1];
  }

 
  var percentTotal = getPercent(totalCases, totalDeaths);

  var percentTotalYesterDay = getPercent(totalCasesYesterDay, totalDeathsYesterDay);

  var deathsPer100000Total = round(totalDeaths * 100 / totalPopulation, 2);
 
  var deathsPer100000TotalYesterDay = round(totalDeathsYesterDay * 100 / totalPopulation, 2);

  $("#output").append("<tr>"
    + "<td>計</td>"
    + "<td>" + totalCases + "名"
    + "(" + getDiffIntValue(totalCases, totalCasesYesterDay) + ")"
    + "</td>"
    + "<td>" + totalDeaths + "名"
    + "(" + getDiffIntValue(totalDeaths, totalDeathsYesterDay) + ")"
    + "</td>"
    + "<td>" + percentTotal + "%"
    + "(" + getDiffDecimalValue(percentTotal, percentTotalYesterDay, 1) + ")"
    + "</td>"
    + "<td>" + deathsPer100000Total + "名"
    + "(" + getDiffDecimalValue(deathsPer100000Total, deathsPer100000TotalYesterDay, 2) + ")"
    + "</td>"
    + "</tr>");

  $("#baseDate").append(getBaseDateStr(prefectures.date[1]));
}


function displayChart() {
  obj = document.form.chart;
  index = obj.selectedIndex;
  const chartNotice = document.getElementById("chartNotice");
  chartNotice.style.display ="none";
  if (index == 0) {
    
    if(chart) {
  
      chart.destroy();
    }
  } else {
  
    var data;
    switch (obj.options[index].value) {
      case 'chartCasesTop10':
     
        data = getPrefectures();
        displayChartCases(data);
        break;
      case 'chartDeathsTop10':
    
        data = getPrefectures();
        displayChartDeaths(data);
        break;
      case 'chartCasesHistory':
     
        data = getTotalHistory();
        displayChartCasesHistory(data);
        chartNotice.style.display ="block";
        break;
      case 'chartDeathsHistory':
   
        data = getTotalHistory();
        displayChartDeathsHistory(data);
        chartNotice.style.display ="block";
        break;
      case 'chartPercentHistory':
     
        data = getTotalHistory();
        displayChartPercentHistory(data);
        chartNotice.style.display ="block";
        break;
      default:
    }
  }
}


function displayChartCases(prefectures) {
 
  chartData = {};
  chartData.type = 'bar';
  chartData.data = {
    labels: [{}],
    datasets: [
      {
        label: '感染数',
        data: [{}],
        backgroundColor: "rgba(0,0,100,0.5)",
      },
    ]
  };
  chartData.options = {
    maintainAspectRatio: false,
    title: {
      display: false,
      text: '都道府県別 感染数（TOP10）'
    },
    scales: {
      xAxes: [{
          ticks: {
          }
      },],
      yAxes: [{
          ticks: {
          },
      },]
    },
  };

  prefectures.data.sort(function(a,b){
    if(a.cases[0] > b.cases[0]) return -1;
    if(a.cases[0] < b.cases[0]) return 1;
    return 0;
  });

  for(var i in prefectures.data){
    if (i < 10) {
      chartData.data.labels[i] = prefectures.data[i].name_ja;
      chartData.data.datasets[0].data[i] = prefectures.data[i].cases[0];
    }
  }

  var ctx = document.getElementById('chart');
  if(chart) {
    chart.destroy();
  }
  chart = new Chart(ctx, chartData);
}

function displayChartDeaths(prefectures) {

  chartData = {};
  chartData.type = 'bar';
  chartData.data = {
    labels: [{}],
    datasets: [
      {
        label: '死者数',
        data: [{}],
        backgroundColor: "rgba(0,0,100,0.5)",
      },
    ]
  };
  chartData.options = {
    maintainAspectRatio: false,
    title: {
      display: false,
      text: '都道府県別 死者数（TOP10）'
    },
    scales: {
      xAxes: [{
          ticks: {
          }
      },],
      yAxes: [{
          ticks: {
          },
      },]
    },
  };
 
  prefectures.data.sort(function(a,b){
    if(a.deaths[0] > b.deaths[0]) return -1;
    if(a.deaths[0] < b.deaths[0]) return 1;
    return 0;
  });
  
  for(var i in prefectures.data){
    
    if (i < 10) {
        chartData.data.labels[i] = prefectures.data[i].name_ja;
        chartData.data.datasets[0].data[i] = prefectures.data[i].deaths[0];
    }
  }

  var ctx = document.getElementById('chart');
  if(chart) {
    chart.destroy();
  }
  chart = new Chart(ctx, chartData);
}


function displayChartCasesHistory(totalHistory) {

  chartData = {};
  chartData.type = 'bar';
  chartData.data = {
    labels: [{}],
    datasets: [
      {
        type: 'line',
        label: '感染数(累計)(※)',
        data: [{}],
        backgroundColor: "rgba(0,100,0,0.5)",
        fill: false,
        yAxisID: "y-axis-1",
      },
      {
        type: 'bar',
        label: '感染数(日別)(※)',
        data: [{}],
        backgroundColor: "rgba(0,0,100,0.5)",
        yAxisID: "y-axis-2",
      },
    ]
  };
  chartData.options = {
    maintainAspectRatio: false,
    title: {
      display: false,
      text: '感染数（推移）'
    },
    scales: {
      xAxes: [{
          ticks: {
          }
      },],
      yAxes: [{
        id: "y-axis-1",
        type: "linear",
        position: "left",
        ticks: {
        },
        scaleLabel: {
          display: true,
          labelString: '感染数(累計)'
        },
      },{
          id: "y-axis-2",
          type: "linear",
          position: "right",
          ticks: {
          },
          scaleLabel: {
            display: true,
            labelString: '感染数(日別)'
          },
          gridLines: {
            drawOnChartArea: false,
          },
      },]
    },
  };
 
  for(var i in totalHistory){
    chartData.data.labels[i] = totalHistory[i].date;
    chartData.data.datasets[0].data[i] = totalHistory[i].positive;
    chartData.data.datasets[1].data[i] = totalHistory[i].positiveDaily;
  }
  
  var ctx = document.getElementById('chart');
  if(chart) {
    chart.destroy();
  }
  chart = new Chart(ctx, chartData);
}


function displayChartDeathsHistory(totalHistory) {
  
  chartData = {};
  chartData.type = 'bar';
  chartData.data = {
    labels: [{}],
    datasets: [
      {
        type: 'line',
        label: '死者数(累計)(※)',
        data: [{}],
        backgroundColor: "rgba(0,100,0,0.5)",
        fill: false,
        yAxisID: "y-axis-1",
      },
      {
        type: 'bar',
        label: '死者数(日毎)(※)',
        data: [{}],
        backgroundColor: "rgba(0,0,100,0.5)",
        yAxisID: "y-axis-2",
      },
    ]
  };
  chartData.options = {
    maintainAspectRatio: false,
    title: {
      display: false,
      text: '死者数（推移）'
    },
    scales: {
      xAxes: [{
          ticks: {
          }
      },],
      yAxes: [{
          id: "y-axis-1",
          type: "linear",
          position: "left",
          ticks: {
          },
          scaleLabel: {
            display: true,
            labelString: '死者数(累計)'
          },
      },{
          id: "y-axis-2",
          type: "linear",
          position: "right",
          ticks: {
          },
          scaleLabel: {
            display: true,
            labelString: '死者数(日毎)'
          },
          gridLines: {
            drawOnChartArea: false,
          },
      },]
    },
  };

  for(var i in totalHistory){
    chartData.data.labels[i] = totalHistory[i].date;
    chartData.data.datasets[0].data[i] = totalHistory[i].death;
    chartData.data.datasets[1].data[i] = totalHistory[i].deathDaily;
  }
  
  var ctx = document.getElementById('chart');
  if(chart) {
    chart.destroy();
  }
  chart = new Chart(ctx, chartData);
}


function displayChartPercentHistory(totalHistory) {
 
  chartData = {};
  chartData.type = 'line';
  chartData.data = {
    labels: [{}],
    datasets: [
      {
        label: '感染数に占める死者数の割合(%)(※)',
        data: [{}],
        backgroundColor: "rgba(0,100,0,0.5)",
        fill: false,
      },
    ]
  };
  chartData.options = {
    maintainAspectRatio: false,
    title: {
      display: false,
      text: '感染数に占める死者数の割合(推移)'
    },
    scales: {
      xAxes: [{
          ticks: {
          }
      },],
      yAxes: [{
        ticks: {
        },
      },]
    },
  };
  
  for(var i in totalHistory){
    chartData.data.labels[i] = totalHistory[i].date;
    chartData.data.datasets[0].data[i] = totalHistory[i].percent;
  }
 
  var ctx = document.getElementById('chart');
  if(chart) {
    chart.destroy();
  }
  chart = new Chart(ctx, chartData);
}


function getDiffIntValue(a, b) {
 
  var diff = a - b;
  if(diff > 0) {
    diff = "+" + diff;
  }
  return diff;
}


function getDiffDecimalValue(a, b, n) {
  var diff = a - b;
  
  diff = round(diff, n);
  if(diff > 0) {
    diff = "+" + diff;
  }
  return diff;
}


function getPercent(cases, deaths) {
  var percent = 0;
  if(cases != 0) {
 
    percent = round(deaths * 100 / cases, 1);
  }
  return percent;
}


function round(value, n) {
  var tmp = 1;
  for(var i = 0; i < n; i++) {
    tmp = tmp * 10;
  }
  return Math.round(value * tmp) / tmp;
}


function getDayDateStr(day) {

  var date = new Date(Date.now() + ((new Date().getTimezoneOffset() + (9 * 60)) * 60 * 1000));
  date.setDate(date.getDate() + day);

  var year = date.getFullYear();
  var month = (date.getMonth() + 1);
  var day = date.getDate();
  return year + ('0' + month).slice(-2) + ('0' + day).slice(-2);
}


function getBaseDateStr(date) {
    var year = date.getFullYear();
    var month = (date.getMonth() + 1);
    var day = date.getDate();
    var hours = date.getHours();
    var minutes = date.getMinutes();
    return year + '年' + month + '月' + day + '日' + hours + '時' + minutes + '分';
}
