var view;
var aquaticLayer, climateLayer, impactLayer, agarLayer, nztabsLayer, abioticLayer, asmaLayer;
var antarcticManagedAreaLayer, mcMurdoAsmaLayer, particleDensityContourLayer, particleDensityLayer;
var visitationLayer, terrestrialLayer;
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
    "esri/tasks/ImageServiceIdentifyTask",
    "esri/tasks/support/IdentifyParameters",
    "esri/tasks/support/ImageServiceIdentifyParameters",
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
  ], function (
    Map,
    SceneView,
    MapView,
    FeatureLayer,
    ImageryLayer,
    MapImageLayer,
    IdentifyTask,
    ImageServiceIdentifyTask,
    IdentifyParameters,
    ImageServiceIdentifyParameters,
    Point,
    Zoom,
    Legend,
    Expand,
    LayerList,
    Compass,
    ScaleBar,
    Search,
    DistanceMeasurement2D,
    AreaMeasurement2D, ) {

    var identifyTask, params, imageParams;

    var map = new Map({
      basemap: "satellite",
      // ground: "world-elevation"
    });
    view = new MapView({
      container: "map_canvas", // Reference to the DOM node that will contain the view
      map: map, // References the map object created in step 3
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
      visualVariables: [{
        type: "size",
        field: "WET",
        // normalizationField: "PH",
        legendOptions: {
          title: "nzTABS Sample Sites"
        },
        stops: [{
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
      }],

      useSymbolValue: true
    };


    // layers

    var GnsGeologyPopup = {
      "title": "GNS Geology",
      "content": "<table class='table'><tr><th>Dryver Group</th><td>{DRYVER_GROUP}</td>" +
        "<tr><th>Map Unit</th><td> {MAP_UNIT}</td>" +
        "<tr><th>Main rock</th><td> {MAIN_ROCK}</td>" +
        "<tr><th>sub rock</th><td> {SUB_ROCKS}</td>" +
        "<tr><th>Terrane</th><td> {TERRANE}</td></table>"
    };

    // Need more info on this
    var GnsIcePopup = {
      "title": "GNS Ice/Snow",
      "content": "<b>Dryver Group:</b> {DRYVER_GROUP}" +
        "<br><b>Map Unit:</b> {MAP_UNIT}" +
        "<br><b>Main rock:</b> {MAIN_ROCK}" +
        "<br><b>sub rock:</b> {SUB_ROCKS}" +
        "<br><b>Terrane:</b> {TERRANE}"
    };

    abioticLayer = new MapImageLayer({
      url: "https://trugis.sci.waikato.ac.nz/arcgis/rest/services/DRYVER/ABIOTIC/MapServer",
      title: "Abiotic",
      sublayers: [{
          id: 1,
          title: "GNS Ice",
          visible: false,
          // popupTemplate: GnsIcePopup
        },
        {
          id: 2,
          title: "GNS Geology",
          visible: false,
          popupTemplate: GnsGeologyPopup
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

    var LakesPopup = {
      "title": "Linz Lakes and ponds",
      "content": "<table class='table'><tr><th>Name</th><td> {name_ascii}</td>" +
        "<tr><th>Elevation</th><td> {ELE_MASL}</td>" +
        "<tr><th>Ice Cover</th><td> {ICE_COVER}</td>" +
        "<tr><th>Inflow</th><td> {INFLOW}</td>" +
        "<tr><th>Outflow</th><td> {OUTFLOW}</td></table>"
    };

    aquaticLayer = new MapImageLayer({
      url: aquaticLayerUrl,
      title: "Aquatic",
      sublayers: [{
          id: 0,
          title: "LINZ Lakes and Ponds",
          visible: false,
          popupTemplate: LakesPopup
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
        {
          id: 3,
          title: "Distance to Water",
          visible: false,
        },
        {
          id: 4,
          title: "Distance to Streams",
          visible: false,
        },
        {
          id: 5,
          title: "Distance to Water Bodies",
          visible: false,
        },
        {
          id: 6,
          title: "Distance to Coast",
          visible: false,
        },
      ]
    });

    asmaLayer = new MapImageLayer({
      url: "https://trugis.sci.waikato.ac.nz/arcgis/rest/services/DRYVER/ASMA/MapServer",
      title: "ASMA",
      sublayers: [{
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

    var AntarcticManagedAreaPopup = {
      "title": "Antarctic Managed Area",
      "content": "<table class='table'><tr><th>Name</th><td> {NAME}</td>" +
        "<tr><th>Type</th><td> {Type}</td>" +
        "<tr><th>Helo</th><td> {HELO}</td>" +
        "<tr><th>PDF</th><td> {PDF}</td>" +
        "<tr><th>Desc</th><td> {DESC}</td></table>"
    };

    antarcticManagedAreaLayer = new FeatureLayer({
      url: antarcticManagedAreaUrl,
      title: "Antarctic Managed Area",
      // id: "event",
      visible: true,
      // renderer: nzTabsRenderer,
      popupTemplate: AntarcticManagedAreaPopup
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
      sublayers: [{
        id: 0,
        title: "AGAR Sample Points",
        visible: false,
      }, ]
    });

    var DisturbanceSampleSitesPopup = {
      "title": "Sample Sites",
      "content": "<table class='table'><tr><th>New ID</th><td> {NEW_ID}</td>" +
        "<tr><th>location</th><td> {LOCATION}</td>" +
        "<tr><th>elevation</th><td> {ELEV}</td>" +
        "<tr><th>distance to coast</th><td> {DIST}</td>" +
        "<tr><th>slope</th><td> {SLOPE}</td>" +
        "<tr><th>Aspect</th><td> {ASPECT}</td>"
    };

    // Needs to be fixed
    var SensitivityPopup = {
      "title": "surface sensitivity",
      "content": "<table class='table'><tr><th>Dryver unit</th><td> {DRYVER_GROUP}</td>" +
        "<tr><th>Map unit</th><td> {MAP_UNIT}</td>" +
        "<tr><th>age index</th><td> {AGE_INDEX}</td>" +
        "<tr><th>visual change</th><td> {VIS}</td>" +
        "<tr><th>track depth</th><td> {DEPTH_20P}</td>" +
        "<tr><th>track infiltration</th><td> {INFIL0_20}</td>" +
        "<tr><th>track colour change</th><td> {CCI_20P}</td>" +
        "<tr><th>track rock cover</th><td> {ROCKCOVER}</td>" +
        "<tr><th>footprint depth</th><td> {DEPTH_1P}</td>" +
        "<tr><th>footprint infiltration</th><td> {CHANGE_1P}</td>"
    };

    impactLayer = new MapImageLayer({
      url: "https://trugis.sci.waikato.ac.nz/arcgis/rest/services/DRYVER/IMPACT/MapServer",
      title: "Impact",
      sublayers: [{
          id: 0,
          title: "Disturbance sample sites",
          visible: false,
          popupTemplate: DisturbanceSampleSitesPopup
        },
        {
          id: 1,
          title: "Human Impact Sensitivity",
          visible: false,
          popupTemplate: SensitivityPopup,
        },
        {
          id: 2,
          title: "Colluvium and Bedrock",
          visible: false,
        },
      ]
    });

    // var napLayer = new MapImageLayer({
    //   url: "https://trugis.sci.waikato.ac.nz/arcgis/rest/services/DRYVER/NAP/MapServer",
    //   title: "NAP",
    //   sublayers: [{
    //       id: 0,
    //       title: "NZ Events 1968-2002",
    //       visible: false,
    //     },
    //     {
    //       id: 1,
    //       title: "MDV_ASMA",
    //       visible: false,
    //     },
    //     {
    //       id: 2,
    //       title: "Hillshade",
    //       visible: false,
    //     },
    //   ]
    // });

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

    var nztabsPopup = {
      "title": "NZTABS",
      "content": "<table class='table'><tr><th>Wetness</th><td>{Wetness}</td>" +
        "<tr><th>Cyanobacteria</th><td>{Cyanobacteria}</td>" +
        "<tr><th>Moss</th><td>{Moss}</td>" +
        "<tr><th>Lichen</th><td>{Lichen}</td>" +
        "<tr><th>Springtails</th><td>{Springtails}</td>" +
        "<tr><th>Mites</th><td>{Mites}</td>" +
        "<tr><th>ATP</th><td>{ATP}</td>" +
        "<tr><th>Nematodes</th><td>{Nematodes}</td>" +
        "<tr><th>Rotifers</th><td>{Rotifers}</td>" +
        "<tr><th>Tadigrades</th><td>{Tadigrades}</td></table>"
    };
    nztabsLayer = new FeatureLayer({
      url: nztabsUrl,
      title: "nzTABS Sample Sites",
      // id: "event",
      visible: false,
      // renderer: nzTabsRenderer,
      popupTemplate: nztabsPopup
    });

    placeNamesLayer = new FeatureLayer({
      url: "https://trugis.sci.waikato.ac.nz/arcgis/rest/services/DRYVER/ASMA/MapServer/0",
      title: "SCAR Placenames",
      visible: true,
    });
    placeNamesLayer.minScale = 95000;

    var sensitivityLayer = new MapImageLayer({
      url: "https://trugis.sci.waikato.ac.nz/arcgis/rest/services/DRYVER/SENSITIVITY/MapServer",
      title: "Sensitivity",
      sublayers: [{
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

    terrestrialLayer = new MapImageLayer({
      url: "https://trugis.sci.waikato.ac.nz/arcgis/rest/services/DRYVER/TERRESTRIAL/MapServer",
      title: "Terrestrial",
      sublayers: [{
        id: 0,
        title: "Cyanobacterial Prediction",
        visible: false,
        //   renderer: rendererToUse
      }, ]
    });

    var eventsPopup = {
      "title": "NZ Events",
      "content": "<table class='table'><tr><th>Season</th><td>{season}</td>" +
        "<tr><th>site</th><td>{Site}</td>" +
        "<tr><th>EventNo</th><td>{EventNo}</td>" +
        "<tr><th>EventTitle</th><td>{EventTitle}</td></table>"
    };

    visitationLayer = new MapImageLayer({
      url: "https://trugis.sci.waikato.ac.nz:6443/arcgis/rest/services/DRYVER/VISITATION/MapServer",
      title: "Visitation",
      sublayers: [{
          id: 0,
          title: "NZ Events (1957_2018)",
          visible: false,
          popupTemplate: eventsPopup,
        },
        {
          id: 1,
          title: "NZ Visitation",
          visible: false,
        },
        {
          id: 2,
          title: "Distance to Camps",
          visible: false,
        },
        {
          id: 3,
          title: "DT_ASPA",
          visible: false,
        },
      ]
    })

    climateLayer = new MapImageLayer({
      url: "https://trugis.sci.waikato.ac.nz/arcgis/rest/services/DRYVER/CLIMATE/MapServer",
      title: "Climate",
      sublayers: [{
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
        {
          id: 7,
          title: "Particle density",
          visible: false,
        },
      ]
    });

    var ParticleDensityContoururl = "https://trugis.sci.waikato.ac.nz:6443/arcgis/rest/services/DRYVER/CLIMATE/MapServer/6"
    // var ParticleDensityurl = "https://trugis.sci.waikato.ac.nz:6443/arcgis/rest/services/DRYVER/CLIMATE/MapServer/7"

    particleDensityContourLayer = new FeatureLayer({
      url: ParticleDensityContoururl,
      title: "Particle density contours",
      visible: false,
    });

    // particleDensityLayer = new FeatureLayer({
    //   url: ParticleDensityurl,
    //   title: "Particle density",
    //   visible: false,
    // });

    placeNamesLayer = new FeatureLayer({
      url: "https://trugis.sci.waikato.ac.nz/arcgis/rest/services/DRYVER/ASMA/MapServer/0",
      title: "SCAR Placenames",
      visible: true,
    });
    placeNamesLayer.minScale = 70000;

    map.add(abioticLayer);
    map.add(aquaticLayer);
    map.add(asmaLayer);
    map.add(antarcticManagedAreaLayer);
    map.add(mcMurdoAsmaLayer);
    map.add(agarLayer);
    map.add(impactLayer);
    // map.add(napLayer);
    map.add(nztabsLayer);
    map.add(sensitivityLayer);
    map.add(terrestrialLayer);
    map.add(visitationLayer);
    map.add(climateLayer);
    map.add(particleDensityContourLayer);
    map.add(particleDensityLayer);
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
    var legendList = new Legend({
      view: view,
      container: document.createElement("div"),
      layerInfos: [{
          layer: abioticLayer,
          title: "Abiotic"
        },
        {
          layer: climateLayer,
          title: "Climate"
        },
        {
          layer: visitationLayer,
          title: "Visitation"
        },
        {
          layer: particleDensityContourLayer,
          title: "Particle Density Contour"
        },
        {
          layer: aquaticLayer,
          title: "Aquatic"
        },
        {
          layer: asmaLayer,
          title: "ASMA"
        },
        // {layer: mcMurdoAsmaLayer, title:"McMurdo ASMA"},
        {
          layer: antarcticManagedAreaLayer,
          title: "Antarctic Managed Area"
        },
        {
          layer: agarLayer,
          title: "AGAR"
        },
        {
          layer: impactLayer,
          title: "Impact"
        },
        // {
        //   layer: napLayer,
        //   title: "NAP"
        // },
        {
          layer: nztabsLayer,
          title: "nzTABS"
        },
        {
          layer: sensitivityLayer,
          title: "Sensitivity"
        },
        {
          layer: terrestrialLayer,
          title: "Terrestrial"
        },
      ]
    });

    var legendEx = new Expand({
      view: view,
      expandTooltip: "Legend",
      content: legendList.container,
      autoCollapse: false,
      expandIconClass: "esri-icon-collection"
    });

    // This needs to be removed

    // var layerList = new LayerList({
    //   container: document.createElement("div"),
    //   view: view
    // });

    // layerListExpand = new Expand({
    //   expandIconClass: "esri-icon-layer-list", // see https://developers.arcgis.com/javascript/latest/guide/esri-icon-font/
    //   // expandTooltip: "Expand LayerList", // optional, defaults to "Expand" for English locale
    //   view: view,
    //   content: layerList.domNode
    // });

    var searchWidget = new Search({
      view: view,
      allPlaceholder: "Search",
      // autoSelect: true,
      includeDefaultSources: false,
      sources: [{
        layer: placeNamesLayer,
        searchFields: ["PLACE_NAME"],
        displayField: "PLACE_NAME",
        exactMatch: false,
        name: "SCAR Place Names",
        placeholder: "Place Name",
        zoomScale: 50000,
      }, ]
    });

    // Add the search widget to the top right corner of the view
    view.ui.add(searchWidget, {
      position: "top-right"
    });

    view.ui.add(zoom, "top-right");

    view.ui.add(compass, "top-right");

    view.ui.add(scaleBar, "bottom-right");

    view.ui.add(legendEx, {
      position: "top-right"
    });

    // view.ui.add(layerListExpand, "top-right");

    // add the toolbar for the measurement widgets
    view.ui.add("topbar", "top-right");

    document
      .getElementById("distanceButton")
      .addEventListener("click", function () {
        setActiveWidget(null);
        if (!this.classList.contains("active")) {
          setActiveWidget("distance");
        } else {
          setActiveButton(null);
        }
      });

    document
      .getElementById("areaButton")
      .addEventListener("click", function () {
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

    $('.distance-measurement-button').click(function () {
      $(this).toggleClass('esri-icon-minus');
      $(this).toggleClass('fas fa-angle-double-right');
    });

    $('.area-measurement-button').click(function () {
      $(this).toggleClass('esri-icon-polygon');
      $(this).toggleClass('fas fa-angle-double-right');
    });

    $('.jump_deg').click(function () {
      $('.loc_jump_dd').removeClass('hidden')
      $('.loc_jump_dm').addClass('hidden')
    });

    $('.jump_deg_min').click(function () {
      $('.loc_jump_dd').addClass('hidden')
      $('.loc_jump_dm').removeClass('hidden')
    });

    $('.loc_jump_dm').submit(function (evt) {
      var lat = parseFloat($('#lat_deg_jump').val())
      var lat_min = parseFloat($('#lat_min_jump').val())
      lat_min /= 60;
      lat += lat_min;
      var long = parseFloat($('#long_deg_jump').val())
      var long_min = parseFloat($('#long_min_jump').val())
      long_min /= 60;
      long += long_min;
      evt.preventDefault();
      var new_loc = new Point({
        latitude: lat,
        longitude: long
      });
      view.goTo(new_loc)
    });

    $('.loc_jump_dd').submit(function (evt) {
      var lat = parseFloat($('#lat_jump').val());
      var long = parseFloat($('#long_jump').val());
      evt.preventDefault();
      var new_loc = new Point({
        latitude: lat,
        longitude: long
      });
      view.goTo(new_loc)
    });

    view.when(function () {
      // executeIdentifyTask() is called each time the view is clicked


      // view.on("click", executeIdentifyTask);

      // Create identify task for the specified map service
      // This is why it was only working for few layers, have it work for all
      identifyTask = new IdentifyTask("https://trugis.sci.waikato.ac.nz:6443/arcgis/rest/services/DRYVER/AQUATIC/MapServer/");

      waterDistIdentifyTask = new ImageServiceIdentifyTask("https://trugis.sci.waikato.ac.nz:6443/arcgis/rest/services/DRYVER/ABIOTIC/MapServer/3")
      imageParams = new ImageServiceIdentifyParameters();
      imageParams.returnPixelValues = true;
      imageParams.returnM = true;
      // Set the parameters for the Identify
      params = new IdentifyParameters();
      params.tolerance = 3;
      params.layerIds = [0, 1, 2];
      params.layerOption = "top";
      params.width = view.width;
      params.height = view.height;
    });

    // Executes each time the view is clicked
    // This should actually become the tool to identify a point
    function executeIdentifyTask(event) {
      imageParams.geometry = event.mapPoint;
      imageParams.mapExtent = map.extent;
      var water = waterDistIdentifyTask.execute(imageParams).then(function (response) {
        console.log("image exexuted");
        console.log(response);
        var results = response.results;
        console.log(results);

        return results.map(function (result) {
          // var feature = result.feature;
          var layerName = result.layerName;
          // console.log(result);
        })
        return feature;
      });
      // Set the geometry to the location of the view click
      params.geometry = event.mapPoint;
      params.mapExtent = view.extent;
      document.getElementById("map_canvas").style.cursor = "wait";

      // This function returns a promise that resolves to an array of features
      // A custom popupTemplate is set for each feature based on the layer it
      // originates from
      identifyTask
        .execute(params)
        .then(function (response) {
          var results = response.results;
          // console.log(results);

          return results.map(function (result) {
            var feature = result.feature;
            var layerName = result.layerName;
            // console.log(result)

            feature.attributes.layerName = layerName;
            if (layerName === "LINZ Lakes and Ponds") {
              feature.popupTemplate = {
                // autocasts as new PopupTemplate()
                title: "Lake / Pond",
                content: "<b>Name:</b> {name}" +
                  "<br><b>Land Type:</b> {L_TYPE}" +
                  "<br><b>Type:</b> {TYPE}"
              };
            } else if (layerName === "Aquatic Connectivity") {
              feature.popupTemplate = {
                // autocasts as new PopupTemplate()
                title: "Stream",
                content: "<b>Main Rock:</b> {MAIN_ROCK}" +
                  "<br><b>RVR CLASS:</b> {RVR_CLASS}"
              };
            } else if (layerName === "Wetness Index Jan-Feb") {
              feature.popupTemplate = {
                // autocasts as new PopupTemplate()
                title: "Wetness Index",
                content: "<b>Dominant order:</b> {Dominant Order}" +
                  "<br><b>Dominant sub-order:</b> {Dominant Sub-Order}"
              };
            } else if (layerName === "NZTABS Sample Sites") {
              feature.popupTemplate = {
                // autocasts as new PopupTemplate()
                title: "NZTABS",
                content: "<b>Wetness:</b> {Wetness}" +
                  "<br><b>Cyanobacteria:</b> {Cyanobacteria}" +
                  "<br><b>Moss:</b> {Moss}" +
                  "<br><b>Lichen:</b> {Lichen}" +
                  "<br><b>Springtails:</b> {Springtails}" +
                  "<br><b>Mites:</b> {Mites}" +
                  "<br><b>ATP:</b> {ATP}" +
                  "<br><b>Nematodes:</b> {Nematodes}" +
                  "<br><b>Rotifers:</b> {Rotifers}" +
                  "<br><b>Tadigrades:</b> {Tadigrades}"
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

$('.layer-toggle').click(function () {
  var id = $(this).attr('data-id');
  var layer = $(this).attr('data-layer');
  // Checking via Abiotic because it is the first layer to load
  if (abioticLayer.loaded) {
    switch (layer) {
      case 'aquatic':
        if (aquaticLayer.loaded) {
          var sublayer = aquaticLayer.findSublayerById(parseInt(id));
          sublayer.visible = !sublayer.visible;
        } else {
          $(this).prop('checked', !$(this).prop('checked'));
        }
        break;

      case 'climate':
        if (climateLayer.loaded) {
          var sublayer = climateLayer.findSublayerById(parseInt(id));
          sublayer.visible = !sublayer.visible;
        } else {
          $(this).prop('checked', !$(this).prop('checked'));
        }
        break;

      case 'impact':
        if (impactLayer.loaded) {
          var sublayer = impactLayer.findSublayerById(parseInt(id));
          sublayer.visible = !sublayer.visible;
        } else {
          $(this).prop('checked', !$(this).prop('checked'));
        }
        break;

      case 'agar':
        if (agarLayer.loaded) {
          var sublayer = agarLayer.findSublayerById(parseInt(id));
          sublayer.visible = !sublayer.visible;
        } else {
          $(this).prop('checked', !$(this).prop('checked'));
        }
        break;

      case 'nztabs':
        if (nztabsLayer.loaded) {
          nztabsLayer.visible = !nztabsLayer.visible;
        } else {
          $(this).prop('checked', !$(this).prop('checked'));
        }
        break;

      case 'antarctic managed area':
        if (antarcticManagedAreaLayer.loaded) {
          antarcticManagedAreaLayer.visible = !antarcticManagedAreaLayer.visible;
        } else {
          $(this).prop('checked', !$(this).prop('checked'));
        }
        break;


      case 'particle density contour':
        if (particleDensityContourLayer.loaded) {
          particleDensityContourLayer.visible = !particleDensityContourLayer.visible;
        } else {
          $(this).prop('checked', !$(this).prop('checked'));
        }
        break;

        // case 'particle density':
        // particleDensityLayer.visible = !particleDensityLayer.visible;
        // break;

        // case 'mcmurdo asma':
        // mcMurdoAsmaLayer.visible = !mcMurdoAsmaLayer.visible;
        // break;

      case 'abiotic':
        if (abioticLayer.loaded) {
          var sublayer = abioticLayer.findSublayerById(parseInt(id));
          sublayer.visible = !sublayer.visible;
        } else {
          $(this).prop('checked', !$(this).prop('checked'));
        }
        break;

      case 'terrestrial':
        if (terrestrialLayer.loaded) {
          var sublayer = terrestrialLayer.findSublayerById(parseInt(id));
          sublayer.visible = !sublayer.visible;
        } else {
          $(this).prop('checked', !$(this).prop('checked'));
        }
        break;

      case 'visitation':
        if (visitationLayer.loaded) {
          var sublayer = visitationLayer.findSublayerById(parseInt(id));
          sublayer.visible = !sublayer.visible;
        } else {
          $(this).prop('checked', !$(this).prop('checked'));
        }
        break;
      case 'asma':
        if (asmaLayer.loaded) {
          var sublayer = asmaLayer.findSublayerById(parseInt(id));
          sublayer.visible = !sublayer.visible;
        } else {
          $(this).prop('checked', !$(this).prop('checked'));
        }
        break;

    }
  } else {
    $(this).prop('checked', !$(this).prop('checked'));
  }
  // console.log(id, layer)
});

$('.drop-down').click(function () {
  var target = $(this).attr('data-target');
  $('.' + target).toggleClass('hide');
});


// For identify:
// 1. https://developers.arcgis.com/javascript/latest/api-reference/esri-tasks-IdentifyTask.html
// 2. https://developers.arcgis.com/javascript/latest/api-reference/esri-tasks-support-IdentifyResult.html
// 3. https://developers.arcgis.com/javascript/latest/api-reference/esri-tasks-support-IdentifyParameters.html#returnZ
// https://developers.arcgis.com/rest/services-reference/identify-map-service-.htm (Seems like this needs to be used, seems like it is exporting in HTML/JSON. Might not work)