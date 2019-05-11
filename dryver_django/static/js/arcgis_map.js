var view;
var aquaticLayer, climateLayer, impactLayer, agarLayer, nztabsLayer, abioticLayer, asmaLayer;
// https://www.esri.com/arcgis-blog/products/js-api-arcgis/mapping/whats-the-deal-with-mapimagelayer/
$(document).ready(function () {
    require([
        "esri/Map",
        "esri/views/SceneView",
        "esri/views/MapView",
        "esri/layers/FeatureLayer",
        "esri/layers/ImageryLayer",
        "esri/layers/MapImageLayer",
        "esri/geometry/Point",
        "esri/widgets/Legend",
        "esri/widgets/Expand",
        "esri/widgets/LayerList",
        "esri/widgets/Compass",
        "esri/widgets/ScaleBar",
        "esri/widgets/DistanceMeasurement2D",
        "dojo/domReady!",
        ], function(
            Map,
            SceneView,
            MapView,
            FeatureLayer,
            ImageryLayer,
            MapImageLayer,
            Point,
            Legend,
            Expand,
            LayerList,
            Compass,
            ScaleBar,
            DistanceMeasurement2D,) {
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

        aquaticLayer = new MapImageLayer({
            url: "https://trugis.sci.waikato.ac.nz/arcgis/rest/services/DRYVER/AQUATIC/MapServer",
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

        nztabsLayer = new FeatureLayer({
            url: "https://trugis.sci.waikato.ac.nz/arcgis/rest/services/DRYVER/NZTABS/MapServer/0",
            title: "nzTABS Sample Sites",
            // id: "event",
            visible: false,
            renderer: nzTabsRenderer,
            // popupTemplate: eventTemp
        });

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
        map.add(agarLayer);
        map.add(impactLayer);
        map.add(napLayer);
        map.add(nztabsLayer);
        map.add(sensitivityLayer);
        map.add(terrestrialLayer);
        map.add(climateLayer);
        // widgets
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

        // https://developers.arcgis.com/javascript/latest/api-reference/esri-widgets-DistanceMeasurement2D.html
        // https://developers.arcgis.com/javascript/latest/api-reference/esri-widgets-AreaMeasurement2D.html
        var distanceMeasurementWidget = new DistanceMeasurement2D({
            view: view,
            label: "Measure Distance",
        });

        view.ui.add(distanceMeasurementWidget, "top-right");

        view.ui.add(compass, "top-right");

        view.ui.add(scaleBar, "bottom-right");

        view.ui.add(legendEx,{
            position: "top-right"
        });

        view.ui.add(layerListExpand, "top-right");

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
        // var sublayer = nztabsLayer.findSublayerById(parseInt(id));
        nztabsLayer.visible = !nztabsLayer.visible;
        break;

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


// Accessor#set Invalid property value, value needs to be one of 'esri.renderers.HeatmapRenderer', 'esri.renderers.SimpleRenderer', 'esri.renderers.UniqueValueRenderer', 'esri.renderers.ClassBreaksRenderer', or a plain object that can autocast (having .type = 'heatmap', 'simple', 'unique-value', 'class-breaks')