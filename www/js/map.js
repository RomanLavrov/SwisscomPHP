var div = document.getElementById('map');

google.charts.load('current',{
    'packages':['geochart'],
    'mapsApiKey': 'AIzaSyD5xJ_hxl147T9dNTmMwZsc678uJG0ogHA'
});

google.charts.setOnLoadCallback(drawRegionsMap);
if (div!== null){
    var html = ['<div id="regions_div" style="width: 100%; height: 850px;"></div>'].join('\n');
    div.innerHTML = html;
}

function drawRegionsMap() {    
    var data = window.google.visualization.arrayToDataTable([
        ['City', 'Warnings'],
        ['Aarau Kreuzplatz', 0],
        ['Basel-Grosspeter', 2],
        ['Basel-Wallstrasse', 2],
        ['Bern DC', 2],
        ['Bern Wankdorf DC', 2],
        ['Bern-Ittigen', 2],
        ['Bern-Mattenhof', 2],
        ['Chur-Gäuggeli', 2],
        ['Chur-Schellenberg', 2],
        ['Genève-Montbrilliant', 2],
        ['Genève-Monthoux', 2],
        ['Lausanne Prèville', 2],
        ['Lausanne-Savoie', 2],
        ['Lugano-Cinque Vie', 7],
        ['Luzern-Floraweg', 2],
        ['Luzern-Weinbergli', 2],
        ['Mattenhof BE', 2],
        ['Olten Neuhard', 2],
        ['St.Gallen-Lachen', 2],
        ['Wil SG', 2],
        ['Zollikofen DC', 2],
        ['Zürich-Binz', 2],
        ['Zürich-Enge TRA', 8],
        ['Zürich-Herdern', 2]
    ]);

    var options = {
        region: 'CH',
        displayMode: 'markers',
        enableRegionInteractivity: true,
        
        datalessRegionColor: 'white',
        backgroundColor: 'white',
        forcelFrame: true,
        resolution: 'provinces',
       tooltip: {textStyle:{color:'#051861', fontName: 'Helvetica', fontSize: 15}},
        colorAxis: { minValue: 5, maxValue: 10, colors: ['green', 'yellow', 'red' ] }

    };

    var geoChart = new google.visualization.GeoChart(document.getElementById('regions_div'));

    function myClickHandler() {
        /*var selection = geoChart.getSelection();
        var message = '';
        for (var i = 0; i < selection.length; i++) {
            var item = selection[i];
            if (item.row !== null && item.column !== null) {
                message += '{row:' + item.row + ',column:' + item.column + '}';
            } else if (item.row !== null) {
                message += '{row:' + data.getFormattedValue(item.row, 0) + '}';
            } else if (item.column !== null) {
                message += '{column:' + item.column + '}';
            }
        }
        if (message === '') {
            message = 'nothing';
        }
        //alert('You selected ' + message);
        //var urn = "dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6Zm9yZ2VhcHA5NmEwM2NiYTVlOGY0Nzc5ODdmNDBhOGRmNzExYjg5Yi9Td2lzc2NvbS5ydnQ ="; // Empty
        var urn = "dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6Zm9yZ2VhcHAxOWJhNGVmMmViNjA0YWI0OTZjMWY4ZDJhZDAyNmNlMS81MDE3LjA0NV9CRU1fRUlOX0FSQ19HRUJVTkRFTi5SVlQ="; // Building with Equipment
        showModel(urn);*/
    }

    google.visualization.events.addListener(geoChart, 'select', myClickHandler);
    geoChart.draw(data, options);
}