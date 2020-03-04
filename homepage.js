let map, infoWindow;
let gmarkers = new Map();//array for google map markers

function initMap() {
    map = new google.maps.Map(document.getElementById('map-canvas'), {
      center: { lat: 40.454770, lng: -86.915700 },
      zoom: 6,
      mapTypeId: google.maps.MapTypeId.ROADMAP
  
    });
    var myoverlay = new google.maps.OverlayView();
    myoverlay.draw = function () {
      this.getPanes().markerLayer.id = 'markerLayer';
    };
    myoverlay.setMap(map);
    infoWindow = new google.maps.InfoWindow;
  
  }