var geocoder = new google.maps.Geocoder();
var creator = null;
var map = null;
var currentmarker = null;
var currentmarker_color = 'red';
var marker_color = 'black';
var markers = [];
var groupmarkers = {};
var currentgroup = null;
var groupiconoptions = {};
var group_autoinc = {};


function createGroupMarkers(group){
    /*
    var items = null;
    
    try
    {
       items = JSON.parse(markers_json);
    }
    catch(e)
    {
       items = false;
    }
    */
    
    var items = group['markers'];
    var group_id = group['resource_id'];
    var iconoptions = group['iconoptions'];
    groupmarkers['group' + group_id] = [];
    groupiconoptions['group' + group_id] = iconoptions;
    group_autoinc['group'+group_id] = 1;
    for (var i = 0; i < items.length; i++){
        //console.log(i);
        var options = items[i];
        var coords = items[i]['latlng'].split(','); 
        options['icon'] = {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 10
            };
        options['position'] = new google.maps.LatLng(parseFloat(coords[0]),parseFloat(coords[1]));  
        options['map'] = map;        
        options['draggable'] = false;
        options['group'] = group_id;
        var newmarker = createMarker(options);
    }
    //redrawMarkers(); 
}

function createMarkers(){
    var groups = null;
    
    try
    {
       groups = JSON.parse(markergroups);
    }
    catch(e)
    {
       groups = false;
    }
    for (var i = 0; i < groups.length; i++){
        var group = groups[i];
        createGroupMarkers(group);
    }
    redrawMarkers();         
}

function createMarker(options){
  
  var newmarker = new google.maps.Marker(options);
  var group_id = options['group'];
  
  var migx_id = options['MIGX_id'] || group_autoinc['group'+group_id];
  
  var i = markers.length;
  newmarker['index'] = i;
  newmarker['MIGX_id'] = migx_id;
  var marker = {
    "marker":newmarker
  };
  markers.push(marker);
  groupmarkers['group' + group_id].push(newmarker);

  if (parseInt(migx_id) > group_autoinc['group'+group_id]){
      group_autoinc['group'+group_id] = migx_id +1 ;  
  }
  if (parseInt(migx_id) == group_autoinc['group'+group_id]){
      group_autoinc['group'+group_id] = group_autoinc['group'+group_id] +1 ;
  }
  //console.log('migx_Id:' + migx_id);
  //console.log('autoinc:' + marker_autoinc);  
  
  google.maps.event.addListener(newmarker, 'click', function() {
      setCurrentMarker(this);
      computeDistanceBetween(creator,currentmarker);
      redrawMarkers();
  });
  
  google.maps.event.addListener(newmarker, 'dragstart', function() {
    setCurrentMarker(this); 
    redrawMarkers();   
  });        

  return newmarker; 
}

function setCurrentMarker(marker){
  currentmarker = marker; 
  google.maps.event.addListener(currentmarker, 'drag', function() {
    //updateMarkerStatus('Dragging...','info2');
    updateMarkerPosition(currentmarker,'info2');
    computeDistanceBetween(creator,currentmarker);
  });  
  
  google.maps.event.addListener(currentmarker, 'dragend', function() {
    //updateMarkerStatus('Drag ended','info2');
    //geocodePosition(marker);
  }); 

   
  setCurrentMarkerIcon();
  
  if (typeof onChangeCurrentMarker == 'function'){
      onChangeCurrentMarker();  
  }

  redrawMarkers();
  computeDistanceBetween(creator,currentmarker);
}


function setCurrentMarkerIcon(){
    if (currentmarker){
        var zoom = map.getZoom();
        var icon = getMarkerIcon();
        icon['scale'] = 1/6000*Math.pow(2,zoom);
        icon['strokeColor'] = currentmarker_color;  
        currentmarker.setIcon(icon);           
    }
}

function getMarkerIcon(marker){
        var group_id = '';
        if (typeof marker != 'undefined'){
            group_id = marker['group'];
        }
        var icon = {
          path: google.maps.SymbolPath.CIRCLE,
          strokeColor : marker_color        
        }; 
        var markerIcon = $.extend({}, icon, groupiconoptions['group' + group_id]);
        //get custom Marker Icon
        if (typeof onGetMarkerIcon == 'function'){
            markerIcon = onGetMarkerIcon(markerIcon);
        }
        return markerIcon;
            
}

function redrawMarkers(){
    var zoom = map.getZoom();
    //var relativePixelSize = Math.round(pixelSizeAtZoom0*Math.pow(2,zoom)); // use 2 to the power of current zoom to calculate relative pixel size.  Base of exponent is 2 because relative size should double every time you zoom in

    //change the size of the icon
    for (var i = 0; i < markers.length; i++){
        var marker = markers[i].marker;
        var icon = getMarkerIcon(marker);
        icon['scale'] = 1/6000*Math.pow(2,zoom);
        
        marker.setIcon(icon);        
    }
    setCurrentMarkerIcon();     
}

function updateMarkerPosition(marker,el_id) {
  var latLng = marker.getPosition();  
  document.getElementById(el_id).innerHTML = [
    latLng.lat(),
    latLng.lng()
  ].join(', ');
}

function computeDistanceBetween(marker1,marker2){
    if (marker1 && marker2){
    var pos1 = marker1.getPosition();
    var pos2 = marker2.getPosition();

    var distance = google.maps.geometry.spherical.computeDistanceBetween(pos1, pos2);
    //console.log(distance);
    document.getElementById('distance').innerHTML = distance;        
    }
}

function mgmgInitialize() {
  map = new google.maps.Map(document.getElementById('mapCanvas'), {
    zoom: 15,
    center: map_center,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  });

  createMarkers();

  google.maps.event.addListener(map, 'zoom_changed', function() {
    redrawMarkers();
  });

}


// Onload handler to fire off the app.
google.maps.event.addDomListener(window, 'load', mgmgInitialize);