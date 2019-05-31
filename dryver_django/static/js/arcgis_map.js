var view;
var aquaticLayer, climateLayer, impactLayer, agarLayer, nztabsLayer, abioticLayer, asmaLayer;
var antarcticManagedAreaLayer, mcMurdoAsmaLayer;
var activeWidget = null;
// https://www.esri.com/arcgis-blog/products/js-api-arcgis/mapping/whats-the-deal-with-mapimagelayer/
$(document).ready(function () {
    require([
        "esri/Map",
        "esri/views/SceneView",
        "esri/views/MapView",
        "esri/layers/FeatureLayer",
        "esri/layers/ImageryLayer",
        "esri/layers/MapImageLayer",
        "esri/tasks/IdentifyTask",
        "esri/tasks/support/IdentifyParameters",
        "esri/geometry/Point",
        "esri/widgets/Zoom",
        "esri/widgets/Legend",
        "esri/widgets/Expand",
        "esri/widgets/LayerList",
        "esri/widgets/Compass",
        "esri/widgets/ScaleBar",
        "esri/widgets/Search",
        "esri/widgets/DistanceMeasurement2D",
        "esri/widgets/AreaMeasurement2D",
        "dojo/domReady!",
        ], function(
            Map,
            SceneView,
            MapView,
            FeatureLayer,
            ImageryLayer,
            MapImageLayer,
            IdentifyTask,
            IdentifyParameters,
            Point,
            Zoom,
            Legend,
            Expand,
            LayerList,
            Compass,
            ScaleBar,
            Search,
            DistanceMeasurement2D,
            AreaMeasurement2D,) {

        var identifyTask, params;
        
        var map = new Map({
            basemap: "satellite",
            // ground: "world-elevation"
        });
        view = new MapView({
            container: "map_canvas",  // Reference to the DOM node that will contain the view
            map: map,  // References the map object created in step 3
            center: [162, -77.5],
            zoom: 7,
        });

        // symbologies and renderers

        var nzTabsSym = {
            type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
            color: [0, 0, 0],
            outline: {
              // autocasts as new SimpleLineSymbol()
              color: "#5d8eae",
              width: 1
            }
        };
        var nzTabsRenderer = {
            type: "simple", // autocasts as new SimpleRenderer()
            symbol: nzTabsSym,
            visualVariables: [
              {
                type: "size",
                field: "WET",
                // normalizationField: "PH",
                legendOptions: {
                  title: "nzTABS Sample Sites"
                },
                stops: [
                  {
                    value: 4,
                    size: 4,
                    label: "0-4"
                  },
                  {
                    value: 6,
                    size: 8,
                    label: "4-6"
                  },
                  {
                    value: 8,
                    size: 12,
                    label: "6-8"
                  },
                  {
                    value: 10,
                    size: 16,
                    label: "8-10"
                  },
                  {
                    value: 12,
                    size: 20,
                    label: "10-12"
                  }
                ]
              }
            ],
            
            useSymbolValue: true
          };

                            
        // layers

        abioticLayer = new MapImageLayer({
            url: "https://trugis.sci.waikato.ac.nz/arcgis/rest/services/DRYVER/ABIOTIC/MapServer",
            title: "Abiotic",
            sublayers: [
                {
                  id: 1,
                  title: "GNS Ice",
                  visible: false,
                },
                {
                  id: 2,
                  title: "GNS Geology",
                  visible: false,
                },
                {
                  id: 3,
                  title: "Aspect",
                  visible: false,
                },
                {
                  id: 4,
                  title: "Slope",
                  visible: false,
                },
                {
                  id: 5,
                  title: "Lidar Hillshades",
                  visible: false,
                },
            ]
        });

        var aquaticLayerUrl = "https://trugis.sci.waikato.ac.nz/arcgis/rest/services/DRYVER/AQUATIC/MapServer"

        aquaticLayer = new MapImageLayer({
            url: aquaticLayerUrl,
            title: "Aquatic",
            sublayers: [
                {
                  id: 0,
                  title: "LANDCARE Soils",
                  visible: false,
                },
                {
                  id: 1,
                  title: "Streams",
                  visible: false,
                },
                {
                  id: 2,
                  title: "Wetness Index",
                  visible: false,
                },
            ]
        });

        asmaLayer = new MapImageLayer({
            url: "https://trugis.sci.waikato.ac.nz/arcgis/rest/services/DRYVER/ASMA/MapServer",
            title: "ASMA",
            sublayers: [
                {
                  id: 0,
                  title: "SCAR Place Names",
                  visible: false,
                },
                {
                  id: 1,
                  title: "Antarctic Managed Area",
                  visible: false,
                },
                {
                  id: 2,
                  title: "McMurdo ASMA",
                  visible: false,
                },
            ]
        });

        var antarcticManagedAreaUrl = "https://trugis.sci.waikato.ac.nz:6443/arcgis/rest/services/DRYVER/ASMA/MapServer/1"

        antarcticManagedAreaLayer = new FeatureLayer({
          url: antarcticManagedAreaUrl,
          title: "Antarctic Managed Area",
          // id: "event",
          visible: true,
          // renderer: nzTabsRenderer,
          // popupTemplate: eventTemp
        });

        var mcMurdoAsmaUrl = "https://trugis.sci.waikato.ac.nz:6443/arcgis/rest/services/DRYVER/ASMA/MapServer/2"

        mcMurdoAsmaLayer = new FeatureLayer({
          url: mcMurdoAsmaUrl,
          title: "McMurdo ASMA",
          // id: "event",
          visible: true,
          // renderer: nzTabsRenderer,
          // popupTemplate: eventTemp
        });

        agarLayer = new MapImageLayer({
            url: "https://trugis.sci.waikato.ac.nz/arcgis/rest/services/DRYVER/AGAR/MapServer",
            title: "AGAR",
            sublayers: [
                {
                  id: 0,
                  title: "AGAR Sample Points",
                  visible: false,
                },
            ]
        });

        impactLayer = new MapImageLayer({
            url: "https://trugis.sci.waikato.ac.nz/arcgis/rest/services/DRYVER/IMPACT/MapServer",
            title: "Impact",
            sublayers: [
                {
                  id: 0,
                  title: "Disturbance sample sites",
                  visible: false,
                },
                {
                  id: 1,
                  title: "Human Impact Sensitivity",
                  visible: false,
                },
            ]
        });

        var napLayer = new MapImageLayer({
            url: "https://trugis.sci.waikato.ac.nz/arcgis/rest/services/DRYVER/NAP/MapServer",
            title: "NAP",
            sublayers: [
                {
                  id: 0,
                  title: "NZ Events 1968-2002",
                  visible: false,
                },
                {
                  id: 1,
                  title: "MDV_ASMA",
                  visible: false,
                },
                {
                  id: 2,
                  title: "Hillshade",
                  visible: false,
                },
            ]
        });

        // nztabsLayer = new MapImageLayer({
        //     url: "https://trugis.sci.waikato.ac.nz/arcgis/rest/services/DRYVER/NZTABS/MapServer",
        //     title: "nzTABS",
        //     sublayers: [
        //         {
        //           id: 0,
        //           title: "nzTABS Sample Sites",
        //           visible: false,
        //           renderer: nzTabsRenderer,
        //           fieldInfos: [
        //             {
        //               fieldName: "WET",
        //               format: {
        //                 digitSeparator: true,
        //                 places: 0
        //               }
        //             },
        //             {
        //               fieldName: "PH",
        //               format: {
        //                 digitSeparator: true,
        //                 places: 0
        //               }
        //             }
        //           ]
        //         },
        //     ]
        // });

        var nztabsUrl = "https://trugis.sci.waikato.ac.nz/arcgis/rest/services/DRYVER/NZTABS/MapServer/0"

        nztabsLayer = new FeatureLayer({
            url: nztabsUrl,
            title: "nzTABS Sample Sites",
            // id: "event",
            visible: false,
            renderer: nzTabsRenderer,
            // popupTemplate: eventTemp
        });

        placeNamesLayer = new FeatureLayer({
          url: "https://trugis.sci.waikato.ac.nz/arcgis/rest/services/DRYVER/ASMA/MapServer/0",
          title: "nzTABS Sample Sites",
          visible: true,
        });
        placeNamesLayer.minScale = 70000;

        var sensitivityLayer = new MapImageLayer({
            url: "https://trugis.sci.waikato.ac.nz/arcgis/rest/services/DRYVER/SENSITIVITY/MapServer",
            title: "Sensitivity",
            sublayers: [
                {
                  id: 0,
                  title: "MDV_ASMA",
                  visible: false,
                },
                {
                  id: 1,
                  title: "Hillshade",
                  visible: false,
                },
            ]
        });

        var terrestrialLayer = new MapImageLayer({
            url: "https://trugis.sci.waikato.ac.nz/arcgis/rest/services/DRYVER/TERRESTRIAL/MapServer",
            title: "Terrestrial",
            sublayers: [
                {
                  id: 0,
                  title: "Cyanobacterial Prediction",
                  visible: false,
                //   renderer: rendererToUse
                },
            ]
        });

        climateLayer = new MapImageLayer({
            url: "https://trugis.sci.waikato.ac.nz/arcgis/rest/services/DRYVER/CLIMATE/MapServer",
            title: "Climate",
            sublayers: [
                {
                  id: 0,
                  title: "Summer high wind hotspots (>10ms)",
                  visible: false,
                },
                {
                  id: 1,
                  title: "Yearly high wind hotspots (>10ms)",
                  visible: false,
                },
                {
                  id: 2,
                  title: "5 Yr Summer mean wind speed",
                  visible: false,
                },
                {
                  id: 3,
                  title: "5 Yr Annual mean wind speed",
                  visible: false,
                },
                {
                  id: 4,
                  title: "5 Yr Summer max wind speed",
                  visible: false,
                },
                {
                  id: 5,
                  title: "5 Yr Annual max wind speed",
                  visible: false,
                },
            ]
        });

        map.add(abioticLayer);
        map.add(aquaticLayer);
        map.add(asmaLayer);
        map.add(antarcticManagedAreaLayer);
        map.add(mcMurdoAsmaLayer);
        map.add(agarLayer);
        map.add(impactLayer);
        map.add(napLayer);
        map.add(nztabsLayer);
        map.add(sensitivityLayer);
        map.add(terrestrialLayer);
        map.add(climateLayer);
        map.add(placeNamesLayer);
        // widgets
        // zoom
        var zoom = new Zoom({
          view: view
        });

        // compass
        var compass = new Compass({
            view: view
        });

        var scaleBar = new ScaleBar({
            view: view
        });

        
        

        // legend
        var legendList = new Legend ({
            view: view,
            container: document.createElement("div"),
            layerInfos: [
                {layer: abioticLayer,title: "Abiotic"},
                {layer: climateLayer,title: "Climate"},
                {layer: aquaticLayer,title: "Aquatic"},
                {layer: asmaLayer, title:"ASMA"},
                {layer: mcMurdoAsmaLayer, title:"McMurdo ASMA"},
                {layer: antarcticManagedAreaLayer, title:"Antarctic Managed Area"},
                {layer: agarLayer, title:"AGAR"},
                {layer: impactLayer, title:"Impact"},
                {layer: napLayer, title:"NAP"},
                {layer: nztabsLayer, title:"nzTABS"},
                {layer: sensitivityLayer, title:"Sensitivity"},
                {layer: terrestrialLayer, title:"Terrestrial"},
            ]});
        
        var legendEx = new Expand({
            view: view,
            expandTooltip: "Legend",
            content: legendList.container,
            autoCollapse: false,
            expandIconClass: "esri-icon-collection"
        });
        
        

        var layerList = new LayerList({
            container: document.createElement("div"),
            view: view
        });

        layerListExpand = new Expand({
            expandIconClass: "esri-icon-layer-list",  // see https://developers.arcgis.com/javascript/latest/guide/esri-icon-font/
            // expandTooltip: "Expand LayerList", // optional, defaults to "Expand" for English locale
            view: view,
            content: layerList.domNode
        });
        
        var searchWidget = new Search({
          view: view,
          allPlaceholder: "Search",
          includeDefaultSources: false,
          sources: [
            {
              layer: placeNamesLayer,
              searchFields: ["PLACE_NAME"],
              displayField: "PLACE_NAME",
              exactMatch: false,
              name: "SCAR Place Names",
              placeholder: "Lake Buddha"
            },
          ]
        });

        // Add the search widget to the top right corner of the view
        view.ui.add(searchWidget, {
          position: "top-right"
        });

        view.ui.add(zoom, "top-right");

        view.ui.add(compass, "top-right");

        view.ui.add(scaleBar, "bottom-right");

        view.ui.add(legendEx,{
            position: "top-right"
        });

        view.ui.add(layerListExpand, "top-right");

        // add the toolbar for the measurement widgets
        view.ui.add("topbar", "top-right");

        document
          .getElementById("distanceButton")
          .addEventListener("click", function() {
            setActiveWidget(null);
            if (!this.classList.contains("active")) {
              setActiveWidget("distance");
            } else {
              setActiveButton(null);
            }
          });

        document
          .getElementById("areaButton")
          .addEventListener("click", function() {
            setActiveWidget(null);
            if (!this.classList.contains("active")) {
              setActiveWidget("area");
            } else {
              setActiveButton(null);
            }
          });

        function setActiveWidget(type) {
          switch (type) {
            case "distance":
              activeWidget = new DistanceMeasurement2D({
                view: view
              });

              // skip the initial 'new measurement' button
              activeWidget.viewModel.newMeasurement();

              view.ui.add(activeWidget, "top-right");
              setActiveButton(document.getElementById("distanceButton"));
              break;
            case "area":
              activeWidget = new AreaMeasurement2D({
                view: view
              });

              // skip the initial 'new measurement' button
              activeWidget.viewModel.newMeasurement();

              view.ui.add(activeWidget, "top-right");
              setActiveButton(document.getElementById("areaButton"));
              break;
            case null:
              if (activeWidget) {
                view.ui.remove(activeWidget);
                activeWidget.destroy();
                activeWidget = null;
              }
              break;
          }
        }

        function setActiveButton(selectedButton) {
          // focus the view to activate keyboard shortcuts for sketching
          view.focus();
          var elements = document.getElementsByClassName("active");
          for (var i = 0; i < elements.length; i++) {
            elements[i].classList.remove("active");
          }
          if (selectedButton) {
            selectedButton.classList.add("active");
          }
        }

        $('.loc_jump').submit(function(evt){
            var lat = $('#lat_jump').val()
            var long = $('#long_jump').val()
            console.log('submitted')
            evt.preventDefault();
            var new_loc = new Point({
                latitude: lat,
                longitude: long
            });
            view.goTo(new_loc)
        });

        view.when(function() {
            // executeIdentifyTask() is called each time the view is clicked

            view.on("click", executeIdentifyTask);
  
            // Create identify task for the specified map service
            identifyTask = new IdentifyTask(aquaticLayerUrl);
  
            // Set the parameters for the Identify
            params = new IdentifyParameters();
            params.tolerance = 3;
            params.layerIds = [0, 1, 2];
            params.layerOption = "top";
            params.width = view.width;
            params.height = view.height;
          });
  
          // Executes each time the view is clicked
          function executeIdentifyTask(event) {
            // Set the geometry to the location of the view click
            params.geometry = event.mapPoint;
            params.mapExtent = view.extent;
            document.getElementById("map_canvas").style.cursor = "wait";
  
            // This function returns a promise that resolves to an array of features
            // A custom popupTemplate is set for each feature based on the layer it
            // originates from
            identifyTask
              .execute(params)
              .then(function(response) {
                var results = response.results;
  
                return results.map(function(result) {
                  var feature = result.feature;
                  var layerName = result.layerName;
                  console.log(feature, layerName)
  
                  feature.attributes.layerName = layerName;
                  if (layerName === "LINZ Lakes and Ponds") {
                    feature.popupTemplate = {
                      // autocasts as new PopupTemplate()
                      title: "Lake / Pond",
                      content:
                        "<b>Name:</b> {name}" +
                        "<br><b>Land Type:</b> {L_TYPE}" +
                        "<br><b>Type:</b> {TYPE}"
                    };
                  } else if (layerName === "Aquatic Connectivity") {
                    feature.popupTemplate = {
                      // autocasts as new PopupTemplate()
                      title: "Stream",
                      content:
                        "<b>Main Rock:</b> {MAIN_ROCK}" +
                        "<br><b>RVR CLASS:</b> {RVR_CLASS}"
                    };
                  } else if (layerName === "Wetness Index Jan-Feb") {
                    feature.popupTemplate = {
                      // autocasts as new PopupTemplate()
                      title: "Wetness Index",
                      content:
                        "<b>Dominant order:</b> {Dominant Order}" +
                        "<br><b>Dominant sub-order:</b> {Dominant Sub-Order}"
                    };
                  }
                  return feature;
                });
              })
              .then(showPopup); // Send the array of features to showPopup()
  
            // Shows the results of the Identify in a popup once the promise is resolved
            function showPopup(response) {
              if (response.length > 0) {
                view.popup.open({
                  features: response,
                  location: event.mapPoint
                });
              }
              document.getElementById("map_canvas").style.cursor = "auto";
            }
        }
    });
})

$('.layer-toggle').click(function(){
    var id = $(this).attr('data-id');
    var layer = $(this).attr('data-layer');
    switch(layer){
        case 'aquatic':
        var sublayer = aquaticLayer.findSublayerById(parseInt(id));
        sublayer.visible = !sublayer.visible;
        break;

        case 'climate':
        var sublayer = climateLayer.findSublayerById(parseInt(id));
        sublayer.visible = !sublayer.visible;
        break;

        case 'impact':
        var sublayer = impactLayer.findSublayerById(parseInt(id));
        sublayer.visible = !sublayer.visible;
        break;

        case 'agar':
        var sublayer = agarLayer.findSublayerById(parseInt(id));
        sublayer.visible = !sublayer.visible;
        break;

        case 'nztabs':
        nztabsLayer.visible = !nztabsLayer.visible;
        break;

        case 'antarctic managed area':
        antarcticManagedAreaLayer.visible = !antarcticManagedAreaLayer.visible;
        break;

        // case 'mcmurdo asma':
        // mcMurdoAsmaLayer.visible = !mcMurdoAsmaLayer.visible;
        // break;

        case 'abiotic':
        var sublayer = abioticLayer.findSublayerById(parseInt(id));
        sublayer.visible = !sublayer.visible;
        break;

        case 'asma':
        var sublayer = asmaLayer.findSublayerById(parseInt(id));
        sublayer.visible = !sublayer.visible;
        break;

    }
    // console.log(id, layer)
});

$('.drop-down').click(function(){
    var target = $(this).attr('data-target');
    $('.'+target).toggleClass('hide');
});


// For identify:
// 1. https://developers.arcgis.com/javascript/latest/api-reference/esri-tasks-IdentifyTask.html
// 2. https://developers.arcgis.com/javascript/latest/api-reference/esri-tasks-support-IdentifyResult.html
// 3. https://developers.arcgis.com/javascript/latest/api-reference/esri-tasks-support-IdentifyParameters.html#returnZ
// https://developers.arcgis.com/rest/services-reference/identify-map-service-.htm (Seems like this needs to be used, seems like it is exporting in HTML/JSON. Might not work)