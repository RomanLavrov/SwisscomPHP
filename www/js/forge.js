var viewerApp;
var model;
var currentDocument;
var defaultURN = 'dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6Zm9yZ2VhcHAxOWJhNGVmMmViNjA0YWI0OTZjMWY4ZDJhZDAyNmNlMS81MDE3LjA0NV8wOV9CRU1fRUlOLnJ2dA==';
var currentURN;

var urn = "";
showModel(urn);

function post(path, method) {
    var form = document.createElement("form");
    form.setAttribute("action", path);
    form.setAttribute("method", method);
    document.body.appendChild(form);
    form.submit();
}

function showModel(urn) {
    console.log("URN: " + urn);
    //urn = "dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6Zm9yZ2VhcHA5NmEwM2NiYTVlOGY0Nzc5ODdmNDBhOGRmNzExYjg5Yi9Td2lzc2NvbS5ydnQ ="; //Old Arch
    //urn = "dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6Zm9yZ2VhcHAxOWJhNGVmMmViNjA0YWI0OTZjMWY4ZDJhZDAyNmNlMS81MDE3LjA0NV8wOV9CRU1fRUlOLnJ2dA=="; // Equipment
    //urn = "dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6Zm9yZ2VhcHAxOWJhNGVmMmViNjA0YWI0OTZjMWY4ZDJhZDAyNmNlMS81MDE3LjA0NV9CRU1fRUlOX0FSQ19HRUJVTkRFTi5SVlQ="; // Building with Equipment
    var urnLevel ="dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6Zm9yZ2VhcHAxOWJhNGVmMmViNjA0YWI0OTZjMWY4ZDJhZDAyNmNlMS9Td2lzc2NvbS1MZXZlbC5ydnQ="; // Level with Equipmqnt

    if (urn === '') {
        console.log();
        //urn = "dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6Zm9yZ2VhcHAxOWJhNGVmMmViNjA0YWI0OTZjMWY4ZDJhZDAyNmNlMS9Td2lzc2NvbS1MZXZlbC5ydnQ="; // Equipment
        //showModel(defaultURN);
        showModel(urnLevel);
        //post("Home/Upload", "post");
    }
    else {
        var options = {
            env: 'AutodeskProduction',
            getAccessToken: getToken,
            refreshToken: getToken
        };
        currentURN = urn;
        var documentId = 'urn:' + urn;

       // console.log("BEAREAR: " + getAccessToken());

        window.Autodesk.Viewing.Initializer(options, function onInitialized() {

            viewerApp = new window.Autodesk.Viewing.ViewingApplication('MyViewerDiv');
            //Configure the extension
            var config3D = {
                extensions: ["AttributeExtension", "Autodesk.ADN.Viewing.Extension.CustomTool"]
            };
            
            viewerApp.registerViewer(viewerApp.k3D, window.Autodesk.Viewing.Private.GuiViewer3D, config3D);
            viewerApp.loadDocument(documentId, onDocumentLoadSuccess, onDocumentLoadFailure);                
        });
    }   
}

function getAccessToken() {
    var xmlHttp = null;
    xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", '/api/forge/token', false /*forge viewer requires SYNC*/);
    xmlHttp.send(null);
    return xmlHttp.responseText;
}        

function onDocumentLoadSuccess(doc) {

    var viewables = viewerApp.bubble.search({ 'type': 'geometry' });
    if (viewables.length === 0) {
        console.error('Document contains no viewables.');
        return;
    }
    currentDocument = doc;
    document = doc;
 
    viewerApp.selectItem(viewables[0].data, onItemLoadSuccess, onItemLoadFail);
}

function onDocumentLoadFailure(viewerErrorCode) {
    console.error('onDocumentLoadFailure() - errorCode:' + viewerErrorCode);
}

function onItemLoadSuccess(viewer, item) {
    model = viewer.model;
}

function onItemLoadFail(errorCode) {
    console.error('onItemLoadFail() - errorCode:' + errorCode);
}

function getToken() {
    var token = '';
    jQuery.ajax({
        url: "/server/oAuth.php",
        type: 'GET',
        async: 0,

        success: function (data) {
            var json = JSON.parse(data);
            token = json.access_token;
        }
    });
    //console.log(token);
    return token;
}