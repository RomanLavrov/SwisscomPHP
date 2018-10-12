var panelDetectors;
var panelDashboard;
var panelAttributes;
var panelChart;
var panelMap;
var panel;
var panelViews;
var tree;
var detectors = [];
var viewer;

function AttributeExtension(viewer, options) {
    Autodesk.Viewing.Extension.call(this, viewer, options);
    panelMap = null;
    panelDetectors = null;
    panelDashboard = null;
    panelAttributes = null;
    panelChart = null;
    panelViews = null;
}
AttributeExtension.prototype = Object.create(Autodesk.Viewing.Extension.prototype);
AttributeExtension.prototype.constructor = AttributeExtension;

AttributeExtension.prototype.load = function () {
    console.log('AttributeExtension is loaded');
    viewer = this.viewer;

    this.onSelectionBinded = this.onSelectionEvent.bind(this);
    this.viewer.addEventListener(Autodesk.Viewing.SELECTION_CHANGED_EVENT, this.onSelectionBinded);
    this.onSelectionBinded = null;
    var ext = this;

    Toolbar(viewer);

    viewer.addEventListener(Autodesk.Viewing.OBJECT_TREE_CREATED_EVENT, function () {

        console.log('Tree loaded');
        tree = viewer.model.getData().instanceTree;

        var rootId = this.rootId = tree.getRootId();

        var rootName = tree.getNodeName(rootId);
        var childCount = 0;
        var list;

        tree.enumNodeChildren(rootId, function (childId) {
            var childName = tree.getNodeName(childId);
            detectors.push(childName);
            list += String(childName) + '\n';
        });
        //console.log('Root Elements' + list + 'Length ' + detectors.length);

        detectors = getAlldbIds(rootId, tree);
    });
    return true;
};

AttributeExtension.prototype.onSelectionEvent = function () {
    var currentSelection = this.viewer.getSelection();
    var elementID = document.getElementById("elementID");
    this.viewer.fitToView(currentSelection); // Scale screen to selected object!!!!
    var SelectedId = parseInt(currentSelection);

    getElementProperties(SelectedId);
};

function getAccessToken() {
    var xmlHttp = null;
    xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", '/api/forge/token', false /*forge viewer requires SYNC*/);
    xmlHttp.send(null);
    return xmlHttp.responseText;
}

//---Get properties from URN
function getElementProperties(selectedId) {

    if (isNaN(selectedId)) {
        return null;
    }
    var xmlHttpViewID = new XMLHttpRequest();
    xmlHttpViewID.open("GET", "https://developer.api.autodesk.com/modelderivative/v2/designdata/" + currentURN + "/metadata", false);
    xmlHttpViewID.setRequestHeader("Authorization", "Bearer " + getAccessToken());
    xmlHttpViewID.send();

    var objViewId = JSON.parse(xmlHttpViewID.responseText);
    var GUID = objViewId.data.metadata[0].guid;
    console.log(objViewId.data.metadata[0].guid);

    var xmlHttpProperties;
    if (GUID !== null) {
        xmlHttpProperties = new XMLHttpRequest();
        xmlHttpProperties.open("GET", "https://developer.api.autodesk.com/modelderivative/v2/designdata/" + currentURN + "/metadata/" + GUID + "/properties?objectid=" + selectedId, false);
        xmlHttpProperties.setRequestHeader("Authorization", "Bearer " + getAccessToken());
        xmlHttpProperties.send();
    }

    var objProperties = JSON.parse(xmlHttpProperties.responseText);
    //console.log("Properties: " + xmlHttpProperties.status + " " + xmlHttpProperties.statusText + xmlHttpProperties.responseText);

    var propObjectId = document.getElementById("propObjectId");
    propObjectId.innerHTML = objProperties.data.collection[0].objectid;
    var propName = document.getElementById("propName");
    propName.innerHTML = objProperties.data.collection[0].name;
    //var propHidden = document.getElementById("propHidden");
    //propHidden.innerHTML = objProperties.data.collection[0].properties.Item.Hidden;
    //var propLayer = document.getElementById("propLayer");
    //propLayer.innerHTML = objProperties.data.collection[0].properties.Item.Layer;
    //var propMaterial = document.getElementById("propMaterial");
    //propMaterial.innerHTML = objProperties.data.collection[0].properties.Item.Material;
    //var propType = document.getElementById("propType");
    //propType.innerHTML = objProperties.data.collection[0].properties.Item.Type;

    var propHersteller = document.getElementById('propHersteller');
    propHersteller.innerHTML = objProperties.data.collection[0].properties.Abhängigkeiten.Arbeitsebene;
    var propTypname = document.getElementById('propTypname');
    propTypname.innerHTML = objProperties.data.collection[0].properties["ID-Daten"].Typname;

    // console.log(   objProperties.data.collection[0].objectid + " | "
    //              + objProperties.data.collection[0].name + " | "
    //              + objProperties.data.collection[0].properties.Item.Hidden + " | ");

    //TODO - separate function
    var divChart = document.getElementById('curve_chart');
    var div = document.getElementById('chart_div');
    if (propName.innerHTML.contains("IoT")) {
        //alert(propTypname.innerHTML);
        divChart.height = 240;
        divChart.width = 560;
        //var html = ['<div>Test</div>'];
        //div.innerHTML += html;
        google.charts.load('current', { 'packages': ['gauge'] });
        google.charts.setOnLoadCallback(drawChart);

        function drawChart() {

            var data = google.visualization.arrayToDataTable([
                ['Label', 'Value'],
                ['A', 16]
            ]);

            var options = {
                min: 0,
                max: 30,
                width: 120,
                height: 120,
                redFrom: 25,
                redTo: 30,
                yellowFrom: 17,
                yellowTo: 25,
                greenFrom: 0,
                greenTo: 17,
                minorTicks: 5
            };

            var chart = new google.visualization.Gauge(document.getElementById('chart_div'));

            chart.draw(data, options);

            setInterval(function () {
                data.setValue(0, 1, 16 + 1 * Math.random());
                chart.draw(data, options);
            },
                130);
        }

        google.charts.load('current', { 'packages': ['corechart'] });
        google.charts.setOnLoadCallback(drawChart2);

        function drawChart2() {
            var dataCurrent = new google.visualization.DataTable();
            dataCurrent.addColumn('number', 'Day');
            dataCurrent.addColumn('number', 'Phasenstorm');

            for (var i = 0; i < 31; i++) {
                var simulatedTemp = Math.random();
                dataCurrent.addRow([i, simulatedTemp * 5 + 20]);
            }

            var optionsCurrent = {
                hAxis: {
                    title: 'Zeit'
                },
                vAxis: {
                    title: 'Phasenstorm'
                },
                backgroundColor: '#f0f0f0'
            };

            var chartCurrent = new google.visualization.LineChart(document.getElementById('curve_chart'));
            chartCurrent.draw(dataCurrent, optionsCurrent);
        }
    }
    else {
        //alert('clear');
        div.width = 0;
        div.height = 0;
        divChart.height = 0;
        divChart.width = 0;
        var emptyHTML = ['<div></div>'];
        document.getElementById('chart_div').innerHTML = emptyHTML;
        document.getElementById('curve_chart').innerHTML = emptyHTML;
    }

    return xmlHttpProperties.status;
}

Autodesk.Viewing.theExtensionManager.registerExtension('AttributeExtension', AttributeExtension);

function ShowAttributes(viewer, container, id, title, option) {
    var content = document.createElement('div');
    if (panelAttributes === null) {
        panelAttributes = new PropertiesPanel(viewer.container, "Attributes", "Attributes List", 'Attributes');
    }
    panelAttributes.setVisible(!panelAttributes.isVisible());
}

//-----Properties Panel
function PropertiesPanel(parentContainer, id, title, content, options) {
    this.content = content;
    Autodesk.Viewing.UI.DockingPanel.call(this, parentContainer, id, options);

    // Auto-fit to the content and don't allow resize.  Position at the coordinates given.
    this.container.classList.add('docking-panel-container-solid-color-a');
    this.container.style.top = "30%";
    this.container.style.left = "60%";
    this.container.style.width = "auto";
    this.container.style.height = "auto";
    this.container.style.resize = "both";

    //this.container.appendChild(this.content);
    this.initializeMoveHandlers(this.container);

    var scrollContainer = { left: false, heightAdjustment: 45, marginTop: 0 };
    this.scrollcontainer = this.createScrollContainer(scrollContainer);

    var html = [
        '<div class="uicomponent-panel-controls-container">',
        '<div class="panel panel-default" style="margin:10px; display:inline-block;float:left; ">',
        '<table bgcolor="#red" class="table table-bordered table-inverse" id = "clashresultstable" >',
        '<thead bgcolor="#323232">',
        '<th>Atrtribute name</th><th>Value</th>',
        '</thead>',
        '<tbody bgcolor="#323232">'].join('\n');

    //for (var i = 0; i < 10; i++) {
    // html += ['<tr><td>' + "Attribute" + '</td><td><div id="elementID">Ok</div></td><td><input type="text" name="fname"></td><td><button style="color: black">Save</button></td></tr>'].join('\n');
    // }

    html += ['<tr><td>' + "Object ID" + '</td><td><div id="propObjectId">-</div></td></tr>'].join('\n');
    html += ['<tr><td>' + "Name" + '</td><td><div id="propName">-</div></td></tr>'].join('\n');
    //html += ['<tr><td>' + "Hidden" + '</td><td><div id="propHidden">-</div></td></tr>'].join('\n');
    //html += ['<tr><td>' + "Layer" + '</td><td><div id="propLayer">-</div></td></tr>'].join('\n');
    //html += ['<tr><td>' + "Material" + '</td><td><div id="propMaterial">-</div></td></tr>'].join('\n');
    //html += ['<tr><td>' + "Type" + '</td><td><div id="propType">-</div></td></tr>'].join('\n');
    html += ['<tr><td>' + "Hersteller" + '</td><td><div id="propHersteller">-</div></td></tr>'].join('\n');
    html += ['<tr><td>' + "Typname" + '</td><td><div id="propTypname">-</div></td></tr>'].join('\n');

    html += ['</tbody>',
        '</table>',
        '</div>',
        '</div>'
    ].join('\n');

    html += ['<div id="chart_div" style="margin:10px; display:inline-block;float:left"></div>'].join('\n');
    html += ['<div id="curve_chart" style="margin:10px; display:inline-block;float:left;"></div>'].join('\n');
    $(this.scrollcontainer).append(html);
}
PropertiesPanel.prototype = Object.create(Autodesk.Viewing.UI.DockingPanel.prototype);
PropertiesPanel.prototype.constructor = PropertiesPanel;

//-----Toolbar Methods-----
function Toolbar(viewer) {
    var toolbarDivHtml = '<div id="divToolbar"> </div>';

    $(viewer.container).append(toolbarDivHtml);

    var toolbar = new Autodesk.Viewing.UI.ToolBar(true);

    var ctrlGroup = new Autodesk.Viewing.UI.ControlGroup("Autodesk.ADN.Viewing.Extension.Toolbar.ControlGroup2");

    var buttonMap = new Autodesk.Viewing.UI.Button('toolbar-button-Map');
    buttonMap.addClass('toolbar-button-Map');
    buttonMap.setToolTip('Show Map');
    buttonMap.onClick = function (e) {
        ShowMap(viewer, viewer.container);
    };

    var buttonDetectors = new Autodesk.Viewing.UI.Button('toolbar-button-Detector');
    buttonDetectors.addClass('toolbar-button-Detector');
    buttonDetectors.setToolTip('Show Detectors');
    buttonDetectors.onClick = function (e) {
        ShowDetectors(viewer, viewer.container);
    };

    var buttonMarks = new Autodesk.Viewing.UI.Button('toolbar-button-Mark');
    buttonMarks.addClass('toolbar-button-Mark');
    buttonMarks.setToolTip('Show Marks');
    buttonMarks.onClick = function (e) {
        ShowLabels();
    };

    var buttonMeter = new Autodesk.Viewing.UI.Button('toolbar-button-Meter');
    buttonMeter.addClass('toolbar-button-Meter');
    buttonMeter.setToolTip('Show Dashboard');
    buttonMeter.onClick = function (e) {
        ShowDashboard(viewer, viewer.container);
    };

    var buttonChart = new Autodesk.Viewing.UI.Button('toolbar-button-Chart');
    buttonChart.addClass('toolbar-button-Chart');
    buttonChart.setToolTip('Show Chart');
    buttonChart.onClick = function (e) {
        ShowChart(viewer, viewer.container);
    };

    var buttonAttributes = new Autodesk.Viewing.UI.Button('toolbar-button-Attributes');
    buttonAttributes.addClass('toolbar-button-Attributes');
    buttonAttributes.setToolTip('Show Attributes');
    buttonAttributes.onClick = function (e) {
        ShowAttributes(viewer, viewer.container);
    };

    var buttonIsolate = new Autodesk.Viewing.UI.Button('toolbar-button-Isolate');
    buttonIsolate.addClass('toolbar-button-Isolate');
    buttonIsolate.setToolTip('Toggle Visibility');
    buttonIsolate.onClick = function (e) {
        IsolateLevel(viewer, viewer.container);
    };

    var buttonViews = new Autodesk.Viewing.UI.Button('toolbar-button-Views');
    buttonViews.addClass('toolbar-button-Views');
    buttonViews.setToolTip('Predefined Views');
    buttonViews.onClick = function (e) {
        ShowViewsTree(viewer, viewer.container);
    };

    ctrlGroup.addControl(buttonMap);
    ctrlGroup.addControl(buttonDetectors);
    ctrlGroup.addControl(buttonMarks);
    ctrlGroup.addControl(buttonMeter);
    ctrlGroup.addControl(buttonChart);
    ctrlGroup.addControl(buttonAttributes);
    ctrlGroup.addControl(buttonIsolate);
    ctrlGroup.addControl(buttonViews);

    toolbar.addControl(ctrlGroup);
    console.log("Toolbar added");
    $('#divToolbar')[0].appendChild(toolbar.container);
}

function ShowMap() {
    var content = document.createElement('div');
    if (panelMap === null) {
        panelMap = new MapPanel(viewer, viewer.container, 'Map', 'Map Selection', content, 20, 20);
    }
    panelMap.setVisible(!panelMap.isVisible());
}

function ShowDetectors(viewer, container, id, title, options) {
    console.log("DETECTORS INIT");

    if (panelDetectors === null) {
        panelDetectors = new DetectorsPanel(viewer, viewer.container, 'awesomeExtensionPanel', 'Detectors');
    }
    // show/hide docking panel
    panelDetectors.setVisible(!panelDetectors.isVisible());
}

//-----Show Labels
function initMarkup() {
    var dummyData = [];
    for (let i = 0; i < 20; i++) {
        dummyData.push({
            icon: Math.round(Math.random() * 3),
            x: Math.random() * 300 - 150,
            y: Math.random() * 50 - 20,
            z: Math.random() * 150 - 300
        });
    }
    window.dispatchEvent(new CustomEvent('newData', { 'detail': dummyData }));
}

function ShowLabels(viewer, options) {
    console.log("LABELS INIT");
}
ShowLabels.prototype = Object.create(Autodesk.Viewing.Extension.prototype);
ShowLabels.prototype.constructor = ShowLabels;

function ShowDashboard(viewer, container, id, title, options) {
    console.log("Dashboard init");

    if (panelDashboard === null) {
        panelDashboard = new DashboardPanel(viewer, viewer.container,
            'awesomeExtensionPanel2', 'Dashboard');
    }
    // show/hide docking panel
    panelDashboard.setVisible(!panelDashboard.isVisible());
}

function ShowChart(viewer, container, id, title, options) {
    console.log("Chart init");

    if (panelChart === null) {
        panelChart = new ChartPanel(viewer, viewer.container,
            'awesomeExtensionPanel3', 'Chart');
    }
    // show/hide docking panel
    panelChart.setVisible(!panelChart.isVisible());
}

function ShowViewsTree(viewer, container) {
    console.log('Views init');

    if (panelViews === null) {
        panelViews = new ViewsPanel(viewer, viewer.container, 'extensionPanel4', 'Predefined Views');
    }
    panelViews.setVisible(!panelViews.isVisible());
}

//-----Map Panel
function MapPanel(viewer, container, id, title, options) {
    this.viewer = viewer;
    Autodesk.Viewing.UI.DockingPanel.call(this, container, id, title, options);

    this.container.classList.add('docking-panel-container-solid-color-a');
    this.container.style.top = "10%";
    this.container.style.left = "10%";
    this.container.style.width = "auto";
    this.container.style.height = "auto";
    this.container.style.resize = "both";

    var div = document.createElement('div');
   
    google.charts.setOnLoadCallback(drawRegionsMap);
    var html = ['<div id="regions_div" style="width: 900px; height: 500px;"></div>'].join('\n');
    div.innerHTML = html;
    this.container.appendChild(div);   
}
MapPanel.prototype = Object.create(Autodesk.Viewing.UI.DockingPanel.prototype);
MapPanel.prototype.constructor = MapPanel;

//-----Detectors List-----
function DetectorsPanel(viewer, container, id, title, options) {
    this.viewer = viewer;
    Autodesk.Viewing.UI.DockingPanel.call(this, container, id, title, options);

    // the style of the docking panel
    // use this built-in style to support Themes on Viewer 4+
    this.container.classList.add('docking-panel-container-solid-color-a');
    this.container.style.top = "30%";
    this.container.style.left = "60%";
    this.container.style.width = "auto";
    this.container.style.height = "auto";
    this.container.style.resize = "both";

    // this is where we should place the content of our panel
    var div = document.createElement('div');
    div.style.margin = '20px';

    var html = [
        '<div class="uicomponent-panel-controls-container">',
        '<div class="panel panel-default">',
        '<table bgcolor="#00FF00" class="table table-bordered table-inverse" id = "clashresultstable">',
        '<thead bgcolor="#323232">',
        '<th>Detector name</th>',
        '</thead>',
        '<tbody bgcolor="#323232">'].join('\n');

    for (var i = 0; i < detectors.length; i++) {
        html += ['<tr><td><button class="btn btn-primary" style="color: white" onclick="showElement(' + i + ');">' + detectors[i] + '</button></td></tr>'].join('\n');
    }

    html += ['</tbody>',
        '</table>',
        '</div>',
        '</div>'
    ].join('\n');

    // and may also append child elements...
    div.innerHTML = html;
    this.container.appendChild(div);
}
DetectorsPanel.prototype = Object.create(Autodesk.Viewing.UI.DockingPanel.prototype);
DetectorsPanel.prototype.constructor = DetectorsPanel;

//-----Dashboard Panel-----
function DashboardPanel(viewer, container, id, title, options) {
    this.viewer = viewer;
    Autodesk.Viewing.UI.DockingPanel.call(this, container, id, title, options);
    this.container.classList.add('docking-panel-container-solid-color-a');
    this.container.style.top = "30%";
    this.container.style.left = "80px";
    this.container.style.width = "640px";
    this.container.style.height = "240px";
    this.container.style.resize = "both";

    // this is where we should place the content of our panel
    var div = document.createElement('div');
    div.style.margin = '20px';

    //Phase Current
    var html = ["<div style=\"width:120px;  float:left; display:inline-block; text-align: center\"><div>" + "Phasenstrom" + "</div>"].join('\n');
    html += ["<div id=\"dashboard_div\" style=\"width: 130px; height: 120px; \"></div></div>"].join('\n');

    //Power
    html += ["<div style=\"width:120px;  float:left; display:inline-block; text-align: center\"><div>" + "Leistung" + "</div>"].join('\n');
    html += ["<div id=\"dashboard_div1\" style=\"width: 130px; height: 120px; float:left\"></div></div>"].join('\n');

    //Voltage
    html += ["<div style=\"width:120px;  float:left; display:inline-block; text-align: center\"><div>" + "Spannung" + "</div>"].join('\n');
    html += ["<div id=\"dashboard_div2\" style=\"width: 130px; height: 120px; float:left\"></div></div>"].join('\n');

    //Humidity
    html += ["<div style=\"width:120px;  float:left; display:inline-block; text-align: center\"><div>" + "Feuchte" + "</div>"].join('\n');
    html += ["<div id=\"dashboard_div3\" style=\"width: 130px; height: 120px; float:left\"></div></div>"].join('\n');

    //Temperature
    html += ["<div style=\"width:120px;  float:left; display:inline-block; text-align: center\"><div>" + "Temperatur" + "</div>"].join('\n');
    html += ["<div id=\"dashboard_div4\" style=\"width: 130px; height: 120px; float:left\"></div></div>"].join('\n');
    //-------------------------------------
    google.charts.load('current', {
        'packages': ['gauge']
    });
    google.charts.setOnLoadCallback(drawDash);

    //--------------------------------------
    div.innerHTML = html;
    this.container.appendChild(div);
}

function drawDash() {

    var dataTemperature = google.visualization.arrayToDataTable([
        ['Label', 'Value'],
        ['Temp, °C', 22]
    ]);

    var dataCurrent = google.visualization.arrayToDataTable([
        ['Label', 'Value'],
        ['A', 16]
    ]);

    var dataPower = google.visualization.arrayToDataTable([
        ['Label', 'Value'],
        ['W', 20]
    ]);

    var dataVoltage = google.visualization.arrayToDataTable([
        ['Label', 'Value'],
        ['V', 220]
    ]);

    var dataHumidity = google.visualization.arrayToDataTable([
        ['Label', 'Value'],
        ['%', 60]
    ]);

    var optionsTemperature = {
        min: 20,
        max: 30,
        width: 120,
        height: 120,
        redFrom: 27.5,
        redTo: 30,
        yellowFrom: 25,
        yellowTo: 28,
        greenFrom: 20,
        greenTo: 25,
        minorTicks: 5
    };

    var optionsCurrent = {
        min: 0,
        max: 30,
        width: 120,
        height: 120,
        redFrom: 25,
        redTo: 30,
        yellowFrom: 17,
        yellowTo: 25,
        greenFrom: 0,
        greenTo: 17,
        minorTicks: 5
    };

    var optionsVoltage = {
        min: 0,
        max: 280,
        width: 120,
        height: 120,
        redFrom: 260,
        redTo: 280,
        yellowFrom: 240,
        yellowTo: 260,
        greenFrom: 0,
        greenTo: 240,
        minorTicks: 5
    };

    var optionsHumidity = {
        min: 0,
        max: 100,
        width: 120,
        height: 120,
        redFrom: 90,
        redTo: 100,
        yellowFrom: 80,
        yellowTo: 90,
        greenFrom: 0,
        greenTo: 80,
        minorTicks: 5
    };

    var chart = new google.visualization.Gauge(document.getElementById('dashboard_div'));
    var chart1 = new google.visualization.Gauge(document.getElementById('dashboard_div1'));
    var chart2 = new google.visualization.Gauge(document.getElementById('dashboard_div2'));
    var chart3 = new google.visualization.Gauge(document.getElementById('dashboard_div3'));
    var chart4 = new google.visualization.Gauge(document.getElementById('dashboard_div4'));

    chart.draw(dataCurrent, optionsCurrent);
    chart1.draw(dataPower, optionsCurrent);
    chart2.draw(dataVoltage, optionsVoltage);
    chart3.draw(dataHumidity, optionsHumidity);
    chart4.draw(dataTemperature, optionsTemperature);

    setInterval(function () {
        dataCurrent.setValue(0, 1, 16 + 1 * Math.random());
        chart.draw(dataCurrent, optionsCurrent);
    }, 400);

    setInterval(function () {
        dataPower.setValue(0, 1, Math.round(21 + 4 * Math.random()));
        chart1.draw(dataPower, optionsCurrent);
    }, 600);

    setInterval(function () {
        dataVoltage.setValue(0, 1, Math.round(220 + 10 * Math.random()));
        chart2.draw(dataVoltage, optionsVoltage);
    }, 800);

    setInterval(function () {
        dataHumidity.setValue(0, 1, Math.round(60 + 20 * Math.random()));
        chart3.draw(dataHumidity, optionsHumidity);
    }, 900);

    setInterval(function () {
        dataTemperature.setValue(0, 1, Math.round(20 + 4 * Math.random()));
        chart4.draw(dataTemperature, optionsTemperature);
    }, 1200);
}
DashboardPanel.prototype = Object.create(Autodesk.Viewing.UI.DockingPanel.prototype);
DashboardPanel.prototype.constructor = DashboardPanel;

//-----Chart Panel-----
function ChartPanel(viewer, container, id, title, options) {
    this.viewer = viewer;
    Autodesk.Viewing.UI.DockingPanel.call(this, container, id, title, options);

    // the style of the docking panel
    // use this built-in style to support Themes on Viewer 4+
    this.container.classList.add('docking-panel-container-solid-color-a');
    this.container.style.top = "0%";
    this.container.style.left = "80px";
    this.container.style.width = "auto";
    this.container.style.height = "100%";
    this.container.style.resize = "both";

    // this is where we should place the content of our panel
    var div = document.createElement('div');
    div.style.margin = '20px';
    div.style.width = '560px';

    //Phase Current <div style=\"float:left; margin-left:20px;  background-color:red;\">
    var html = ["<div style=\"width:240px; margin:10px; float:left; display:inline-block; \"><div >" + "Phasenstorm" + "</div>"].join('\n');
    html += ["<div id=\"chartCurrent\"></div></div>"].join('\n');

    //Power
    html += ["<div style=\"width:240px; margin:10px; float:left; display:inline-block;\"><div >" + "Leistung" + "</div>"].join('\n');
    html += ["<div id=\"chartPower\"></div></div>"].join('\n');

    //Voltage
    html += ["<div style=\"width:240px; margin:10px; float:left; display:inline-block;\"><div>" + "Spannung" + "</div>"].join('\n');
    html += ["<div id=\"chartVoltage\"></div></div>"].join('\n');

    //Humidity
    html += ["<div style=\"width:240px; margin:10px; float:left; display:inline-block;t\"><div>" + "Feuchte" + "</div>"].join('\n');
    html += ["<div id=\"chartHumidity\"></div></div>"].join('\n');

    //Temperature
    html += ["<div style=\"width:240px; margin:10px; float:left; display:inline-block;\"><div>" + "Temperatur" + "</div>"].join('\n');
    html += [" <div id=\"chartTemperature\"></div></div>"].join('\n');

    //-------------------------------------Current

    google.charts.load('current', { packages: ['corechart'] });
    google.charts.setOnLoadCallback(drawBackgroundColor);

    function drawBackgroundColor() {
        var dataCurrent = new google.visualization.DataTable();
        dataCurrent.addColumn('number', 'Day');
        dataCurrent.addColumn('number', 'Phasenstorm');

        for (var i = 0; i < 31; i++) {
            var simulatedTemp = Math.random();
            dataCurrent.addRow([i, simulatedTemp * 5 + 20]);
        }

        var optionsCurrent = {
            hAxis: {
                title: 'Zeit'
            },
            vAxis: {
                title: 'Phasenstorm'
            },
            backgroundColor: '#f0f0f0'
        };

        var chartCurrent = new google.visualization.LineChart(document.getElementById('chartCurrent'));
        chartCurrent.draw(dataCurrent, optionsCurrent);

        //-----------------------------------------------------------------Power
        var dataPower = new google.visualization.DataTable();
        dataPower.addColumn('number', 'Day');
        dataPower.addColumn('number', 'Leistung');

        for (var p = 0; p < 31; p++) {
            var simulatedPower = Math.random();
            dataPower.addRow([p, simulatedPower * 1 + 20]);
        }

        var optionsPower = {
            hAxis: {
                title: 'Zeit'
            },
            vAxis: {
                title: 'Leistung'
            },
            backgroundColor: '#f0f0f0'
        };

        var chartPower = new google.visualization.LineChart(document.getElementById('chartPower'));
        chartPower.draw(dataPower, optionsPower);

        //------------------------------------------------------------------------------------------Voltage
        var dataVoltage = new google.visualization.DataTable();
        dataVoltage.addColumn('number', 'Day');
        dataVoltage.addColumn('number', 'Spannung');

        for (var v = 0; v < 31; v++) {
            var simulatedVoltage = Math.random();
            dataVoltage.addRow([v, 220 + simulatedVoltage * 2]);
        }

        var optionsVoltage = {
            hAxis: {
                title: 'Zeit'
            },
            vAxis: {
                title: 'Spannung'
            },
            backgroundColor: '#f2f2f2'
        };
        var chartVoltage = new google.visualization.LineChart(document.getElementById('chartVoltage'));
        chartVoltage.draw(dataVoltage, optionsVoltage);

        //------------------------------------------------------------------------------------------Humidity
        var dataHumidity = new google.visualization.DataTable();
        dataHumidity.addColumn('number', 'Day');
        dataHumidity.addColumn('number', 'Feuchte');

        for (var h = 0; h < 31; h++) {
            var simulatedHumidity = Math.random();
            dataHumidity.addRow([h, 60 + simulatedHumidity * 0.2]);
        }

        var optionsHumidity = {
            hAxis: {
                title: 'Zeit'
            },
            vAxis: {
                title: 'Feuchte'
            },
            backgroundColor: '#f2f2f2'
        };
        var chartHumidity = new google.visualization.LineChart(document.getElementById('chartHumidity'));
        chartHumidity.draw(dataHumidity, optionsHumidity);

        //-----------------------------------------------------------------Temperature
        var dataTemperature = new google.visualization.DataTable();
        dataTemperature.addColumn('number', 'Day');
        dataTemperature.addColumn('number', 'Temperatur');

        for (var j = 0; j < 31; j++) {
            var simulatedTemp2 = Math.random();
            dataTemperature.addRow([j, simulatedTemp2 * 5 + 20]);
        }

        var optionsTemperature = {
            hAxis: {
                title: 'Time'
            },
            vAxis: {
                title: 'Temperatur'
            },
            backgroundColor: '#f0f0f0'
        };
        var chartTemperature = new google.visualization.LineChart(document.getElementById('chartTemperature'));
        chartTemperature.draw(dataTemperature, optionsTemperature);
    }
    div.innerHTML = html;

    this.container.appendChild(div);
}
ChartPanel.prototype = Object.create(Autodesk.Viewing.UI.DockingPanel.prototype);
ChartPanel.prototype.constructor = ChartPanel;

function showElement(value) {
    var detectorName = detectors[value];
    var index = detectorName.indexOf("[");

    var detectorId = detectorName.substring(index + 1, detectorName.length - 1);

    viewer.search(detectorId, SearchResult);

    function SearchResult(idArray) {
        viewer.fitToView(idArray);
    }
}

function IsolateLevel(viewer, container) {

    var instanceTree = viewer.model.getData().instanceTree;
    var rootId = instanceTree.getRootId();

    if (viewer.areAllVisible()) {
        viewer.hide(rootId); // hidding root node will hide whole model ...
    } else {
        viewer.show(rootId);
    }
}

//-----Get elements from viewer
function getAlldbIds(rootId, tree) {
    var allDBId = [];
    var elementsNames = [];

    if (!rootId) {
        return allDBId;
    }

    var queue = [];
    queue.push(rootId);
    while (queue.length > 0) {
        var node = queue.shift();
        allDBId.push(node);
        tree.enumNodeChildren(node, function (childrenIds) {
            queue.push(childrenIds);
        });
    }

    for (var i = 0; i < allDBId.length; i++) {
        if (tree.getNodeName(allDBId[i]).includes('RIN_IoT') && tree.getNodeName(allDBId[i]).includes('[')) {
            elementsNames.push(tree.getNodeName(allDBId[i]));
        }
    }
    return elementsNames;
}

//-----Views Panel-----
function ViewsPanel(viewer, container, id, title, options) {
    Autodesk.Viewing.UI.DockingPanel.call(this, container, id, title, options);
    this.container.classList.add('docking-panel-container-solid-color-a');
    this.container.style.top = "0%";
    this.container.style.left = "80px";
    this.container.style.width = "300px";
    this.container.style.height = "auto";
    this.container.style.resize = "both";

    // this is where we should place the content of our panel
    var div = document.createElement('divViews');
    div.style.width = '560px';
    var html = ['<div style = "margin:10px"><table class="table table-bordered table-inverse" id = "clashresultstable"><th>View Name</th><th>Type</th>'].join('\n');
    getViews().forEach(function (item, index) {
        html += ['<tr><td><button class="btn btn-primary" onclick="loadPredefinedView(' + index + ')">' + item.name + '</button></td><td>' + item.role + '</td></tr>'].join('\n');
        //alert(index + item.name + item.guid + item.role);
    });
    html += ['</tbody></table></div>'];
    div.innerHTML = html;
    this.container.appendChild(div);
}
ViewsPanel.prototype = Object.create(Autodesk.Viewing.UI.DockingPanel.prototype);
ViewsPanel.prototype.constructor = ChartPanel;

function getViews() {
    this.viewer = viewer;
    var urn = "dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6Zm9yZ2VhcHAxOWJhNGVmMmViNjA0YWI0OTZjMWY4ZDJhZDAyNmNlMS81MDE3LjA0NV8wOV9CRU1fRUlOLnJ2dA==";

    var xmlHttpViews = new XMLHttpRequest();
    xmlHttpViews.open('GET', 'https://developer.api.autodesk.com/modelderivative/v2/designdata/' + currentURN + '/metadata', false);

    xmlHttpViews.setRequestHeader("Authorization", "Bearer " + getToken());
    xmlHttpViews.send();
    var Views = JSON.parse(xmlHttpViews.responseText);
    //console.log(Views);

    var listView = [];

    var length = Views.data.metadata.length;
    for (var i = 0; i < length; i++) {
        listView.push(Views.data.metadata[i]);
    }
    return listView;
}

function loadPredefinedView(index) {
    var viewables = viewerApp.bubble.search({ 'type': 'geometry' });
    viewerApp.selectItem(viewables[index].data, onItemLoadSuccess, onItemLoadFail);
}


