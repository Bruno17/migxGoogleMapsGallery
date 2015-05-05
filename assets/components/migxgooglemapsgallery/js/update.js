
function creatorCreateMarker(){
    if (currentgroup){
      var pos = creator.getPosition();
      var options = {
          position: pos,
          title: '',
          group: currentgroup,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10
          },        
          map: map,
          draggable: true
      }
      var marker = createMarker(options);
      setCurrentMarker(marker);        
    }
}

function changeMarkerGroup(){
    var el = $('#select-markergroup');
    if (el){
        currentgroup = el.val(); 
        for (var i = 0; i < markers.length; i++){
            var marker = markers[i].marker;
            if (marker['group'] == currentgroup){
                marker.setDraggable(true);
            }else{
                marker.setDraggable(false);
            }
            
        }      
    }
}

function RemoveMarker(){
    if (currentmarker){
        currentmarker['deleted'] = true;
        currentmarker.setMap(null);
    }
}



function saveMarkers(){
  if (currentgroup){
    var items = [];
    for (var i = 0; i < markers.length; i++){
        var marker = markers[i].marker;
        if (marker.deleted){

        }else{
          if (marker['group'] == currentgroup){
            var position = marker.getPosition();
            var item = {
              'MIGX_id' : marker['MIGX_id'],
              'file' : typeof marker['file'] != 'undefined' ? marker['file'] : '',
              'index' : marker['index'],
              'title' : marker['title'],
              'latlng' : position.toString().replace('(','').replace(')','')
            }
            items.push(item);             
          }  
        }
    }
    var json = JSON.stringify(items);
    var data = {
        items: json,
        resource_id: currentgroup
    }
    $.post( ajaxurl, data, function( data ) {
      //$( ".result" ).html( data );
    });     
  }
}

function browserGetFiles(dir){
    var data = {
        dir: dir
    }
    
    $.get( getfiles_ajaxurl, data, function( data ) {
      $( "#image-browser-files" ).html( data );
    }); 
}

function geocodePosition(marker) {
  var pos = marker.getPosition();
  geocoder.geocode({
    latLng: pos
  }, function(responses) {
    if (responses && responses.length > 0) {
      updateMarkerAddress(responses[0].formatted_address);
    } else {
      updateMarkerAddress('Cannot determine address at this location.');
    }
  });
}

function updateMarkerStatus(str) {
  var el = document.getElementById('markerStatus');
  if (el){
      el.innerHTML = str;
  }  
}

function updateMarkerAddress(str) {
  document.getElementById('address').innerHTML = str;
}

function selectImage(file){
    if (currentmarker){
        currentmarker['file']=file;
        updateMarkerFile();
    }
}

function updateMarkerFile(){
  var el = document.getElementById('marker-file');
  if (el){
  if (typeof currentmarker['file'] != 'undefined' ){
      el.innerHTML = currentmarker['file'];
  }else{
      el.innerHTML = '';  
  }    
  }      
}

function setTitle(){
    if (currentmarker){    
        var el = $('#input-title');
        currentmarker['title']=el.val();
    }   
}

function mgmgInitializeUpdate() {
  creator = new google.maps.Marker({
    position: map_center,
    title: 'Creator',
    map: map,
    draggable: true
  });
  
  geocodePosition(creator);
  updateMarkerPosition(creator,'info');
  
  // Add dragging event listeners.
  google.maps.event.addListener(creator, 'dragstart', function() {
    updateMarkerAddress('Dragging...');
  });
 
  google.maps.event.addListener(creator, 'drag', function() {
    updateMarkerStatus('Dragging...');
    updateMarkerPosition(creator,'info');
    computeDistanceBetween(creator,currentmarker);
  });
  google.maps.event.addListener(creator, 'dragend', function() {
    updateMarkerStatus('Drag ended');
    geocodePosition(creator);
  });  

}


// Onload handler to fire off the app.
google.maps.event.addDomListener(window, 'load', mgmgInitializeUpdate);