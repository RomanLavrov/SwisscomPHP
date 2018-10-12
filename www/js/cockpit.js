getConnection();


function getConnection(){
    $.get("/server/data.php", function(result){
        console.log(result);
    });
}

function setTemperatureGauge(){
    var div = document.getElementById("humidityGauge");

}
