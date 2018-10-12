<?php
$servername = "bimdb.cohdwqxc9nig.eu-central-1.rds.amazonaws.com";

$connectionOptions = array("Database" => "bimdb", "UID"=>"bimuser", "PWD"=>"bimpassword");

$username = "bimuser";
$password = "bimpassword";
$dbname = "bimdb";

$conn = sqlsrv_connect($servername, $connectionOptions);

$sql = ("SELECT * FROM Cities");
$server_info = sqlsrv_server_info($conn);
/*if( $server_info )  
{  
      foreach( $server_info as $key => $value)  
      {  
             echo $key.": ".$value."\n";  
      }  
}  */

$result = sqlsrv_query($conn, $sql);
if($result){
  while($row = sqlsrv_fetch_array($result)){
    //echo $row['CityName'] ."\n";
  }
}

//-----Get Temperature
$sqlTemp = "SELECT TOP (1000) [Id]
,[Time]
,[Temperature]
FROM [bimdb].[dbo].[Temperature]";
$temperature = sqlsrv_query($conn, $sqlTemp);

if($temperature){
  while($row = sqlsrv_fetch_array($temperature)){
    //echo "ID:". $row['Id']. " Time: ". ($row['Time']->format('Y-m-d H:i:s')). " Temperature: ". $row['Temperature']."\n";
  }
}

//----Get Humidity
$sqlHumidity = "SELECT TOP (1000) [Id]
,[Time]
,[Humidity]
FROM [bimdb].[dbo].[Humidity]";

$sqlHumidityLatest = "SELECT TOP (10) [Id]
,[Time]
,[Humidity]
FROM [bimdb].[dbo].[Humidity] ORDER BY [Time] DESC";
$humidity = sqlsrv_query($conn, $sqlHumidityLatest);

if($humidity){
  while($row = sqlsrv_fetch_array($humidity)){
    echo "Id:". $row['Id']. " Time: ". ($row['Time']->format('Y-m-d H:i:s')). " Humidity: ". $row['Humidity']."\n";
  }
}

?>