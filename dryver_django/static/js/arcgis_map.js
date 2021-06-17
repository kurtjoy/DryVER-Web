const requestURL = '/static/data.json'
const request = new XMLHttpRequest()
request.open('GET', requestURL)
request.responseType = 'json'
request.send()


window.addEventListener("load", function () {
  window.dispatchEvent(new Event('resize'));
});

window.onresize = function () {
  document.querySelector('#currentLatLongInfo').style.left = parseInt(document.getElementById('sidebar').offsetWidth) + 20 + 'px'
}

request.onload = async function () {
  const source = request.response
  var anotherSource = null;

  await fetch("static/distance_data.json")
    .then(response => response.json())
    .then(json => {
      anotherSource = json
    });

  const {
    'antarctic managed area': antarcticManagedAreaSource,
    'mcmurdo asma': mcmurdoAsmaSource,
    nztabs: nzTabsSource,
    'place names': placeNamesSource,
    asma: asmaSource,
    sensitivity: sensitivitySource,
    visitation: visitationSource,
    abiotic: abioticSource,
    // datasets: datasetsSource,
    dryver_layers: dryverLayersSource,
  } = source

  const {
    dryver_layers: anotherDryverLayersSource,
  } = anotherSource

  const {
    climate: anotherClimateSource,
    distance: anotherDistanceSource,
  } = anotherDryverLayersSource

  const {
    aquatic: aquaticSource,
    climate: climateSource,
    impact: impactSource,
    terrestrial: terrestrialSource,
    ecoforcasting: ecoforcastingSource,
    distance: distanceSource,
  } = dryverLayersSource

  function getPopupTemplate(array) {
    return `<table class="table table-hover"><tbody>${array.map(([header, ...keyValues]) => `<tr>${`<th scope="row" class="pl-0">${header}</th>` + keyValues.map(value => `<td class="text-break">${value}</td>`).join('')}</tr>`).join('')}</tbody></table>`
  }

  function getPopupTemplateNoPaddings(array) {
    return `<table class="table table-hover"><tbody>${array.map(([header, ...keyValues]) => `<tr>${`<th scope="row" class="p-0">${header}</th>` + keyValues.map(value => `<td class="p-0 text-break">${value}</td>`).join('')}</tr>`).join('')}</tbody></table>`
  }

  function getPopupTemplate(array) {
    return `<table class="table table-hover"><tbody>${array.map(([header, ...keyValues]) => `<tr>${`<th scope="row" class="pl-0">${header}</th>` + keyValues.map(value => `<td class="text-break">${value}</td>`).join('')}</tr>`).join('')}</tbody></table>`
  }

  function getPopupTemplateNoPaddings(array) {
    return `<input type="checkbox" data-toggle="switchbutton" checked data-size="xs"><table class="table table-hover"><tbody>${array.map(([header, ...keyValues]) => `<tr>${`<th scope="row" class="p-0">${header}</th>` + keyValues.map(value => `<td class="p-0 text-break">${value}</td>`).join('')}</tr>`).join('')}</tbody></table>`
  }

  let view
  let aquaticLayer, climateLayer, impactLayer, nztabsLayer, abioticLayer, asmaLayer, antarcticManagedAreaLayer, mcMurdoAsmaLayer, placeNamesLayer, visitationLayer, terrestrialLayer, sensitivityLayer, ecoforcastingLayer, distanceLayer
  let activeWidget = null
  let searchAddressPointLayer
  let decimalType = 'DD';
  let oldPrintDOM;

  // https://www.esri.com/arcgis-blog/products/js-api-arcgis/mapping/whats-the-deal-with-mapimagelayer/
  $(document).ready(function () {
    require([
      'esri/Map',
      'esri/views/SceneView',
      'esri/views/MapView',
      'esri/layers/FeatureLayer',
      'esri/layers/ImageryLayer',
      'esri/layers/MapImageLayer',
      'esri/tasks/IdentifyTask',
      'esri/tasks/ImageServiceIdentifyTask',
      'esri/tasks/support/IdentifyParameters',
      'esri/tasks/support/ImageServiceIdentifyParameters',
      'esri/tasks/PrintTask',
      'esri/tasks/support/PrintParameters',
      "esri/symbols/PictureMarkerSymbol",
      'esri/geometry/Point',
      "esri/geometry/Extent",
      "esri/geometry/SpatialReference",
      "esri/Graphic",
      "esri/layers/GraphicsLayer",
      'esri/widgets/Zoom',
      'esri/widgets/Legend',
      'esri/widgets/Expand',
      'esri/widgets/LayerList',
      'esri/widgets/Compass',
      'esri/widgets/ScaleBar',
      'esri/widgets/Search',
      'esri/widgets/DistanceMeasurement2D',
      'esri/widgets/AreaMeasurement2D',
      'esri/widgets/Print',
      'esri/widgets/Print/PrintViewModel',
      'esri/tasks/support/PrintTemplate',
      'esri/renderers/smartMapping/creators/type',
      'esri/renderers/smartMapping/symbology/type',
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
      PrintTask,
      PrintParameters,
      PictureMarkerSymbol,
      Point,
      Extent,
      SpatialReference,
      Graphic,
      GraphicsLayer,
      Zoom,
      Legend,
      Expand,
      LayerList,
      Compass,
      ScaleBar,
      Search,
      DistanceMeasurement2D,
      AreaMeasurement2D,
      Print,
      PrintViewModel,
      PrintTemplate,
      typeRendererCreator,
      typeSchemes) {
      const map = new Map({
        basemap: 'satellite',
        // ground: "world-elevation"
      })

      view = new MapView({
        container: 'map_canvas', // Reference to the DOM node that will contain the view
        map: map, // References the map object created in step 3
        center: [162, -77.5],
        zoom: 7,
      })

      document.querySelector('#currentLatLongInfo').style.display = 'block'
      document.querySelector('#currentLatLongInfo').style.left = parseInt(document.getElementById('sidebar').offsetWidth) + 20 + 'px'

      view.on("pointer-move", function (evt) {
        showCoordinates(view.toMap({ x: evt.x, y: evt.y }));
      });

      function showCoordinates(evt) {
        if (decimalType === 'DD') {
          document.querySelector('#currentLatLongInfo').innerHTML = evt.latitude.toFixed(4) + ", " + evt.longitude.toFixed(4);
        } else if (decimalType === 'DM') {
          let lat_min = Math.abs(evt.latitude - parseInt(evt.latitude))
          lat_min *= 60
          lat_min = lat_min.toFixed(4)

          let long_min = Math.abs(evt.longitude - parseInt(evt.longitude))
          long_min *= 60
          long_min = long_min.toFixed(4)
          document.querySelector('#currentLatLongInfo').innerHTML = `${parseInt(evt.latitude)}°${lat_min}', ${parseInt(evt.longitude)}°${long_min}'`;
        }
      }

      const GnsGeologyPopup = {
        id: 7,
        title: 'GNS Geology',
        content: getPopupTemplate([
          ['Dryver Group', '{DRYVER_GROUP}'],
          ['Map Unit', '{MAP_UNIT}'],
          ['Main rock', '{MAIN_ROCK}'],
          ['sub rock', '{SUB_ROCKS}'],
          ['Terrane', '{TERRANE}'],
        ]),
      }

      // Need more info on this
      const GnsIcePopup = {
        id: 6,
        title: 'GNS Ice/Snow',
        content: getPopupTemplate([
          ['Dryver Group', '{DRYVER_GROUP}'],
          ['Map Unit', '{MAP_UNIT}'],
          ['Main rock', '{MAIN_ROCK}'],
          ['sub rock', '{SUB_ROCKS}'],
          ['Terrane', '{TERRANE}'],
        ]),
      }

      abioticLayer = new MapImageLayer({
        url: abioticSource.url,
        title: abioticSource.title,
        sublayers: abioticSource.layers.reduce((newArray, layer) => {
          if (layer.id === GnsGeologyPopup.id) layer.popupTemplate = { ...GnsGeologyPopup, title: layer.title }
          if (layer.id === GnsIcePopup.id) layer.popupTemplate = { ...GnsIcePopup, title: layer.title }
          if (layer.id !== -1) newArray.push(layer)
          return newArray
        }, []),
      })

      const aquaticLayerUrl = aquaticSource.url

      const LakesPopup = {
        id: 0,
        title: 'Linz Lakes and ponds',
        content: getPopupTemplate([
          ['Name', '{name_ascii}'],
          ['Elevation', '{ELE_MASL}'],
          ['Ice Cover', '{ICE_COVER}'],
          ['Inflow', '{INFLOW}'],
          ['Outflow', '{OUTFLOW}'],
        ]),
      }

      aquaticLayer = new MapImageLayer({
        url: aquaticLayerUrl,
        title: aquaticSource.title,
        sublayers: aquaticSource.layers.reduce((newArray, layer) => {
          if (layer.id === LakesPopup.id) layer.popupTemplate = { ...LakesPopup, title: layer.title }
          if (layer.id !== -1) newArray.push(layer)
          return newArray
        }, []),
      })

      asmaLayer = new MapImageLayer({
        url: asmaSource.url,
        title: asmaSource.title,
        sublayers: asmaSource.layers,
      })

      const antarcticManagedAreaUrl = antarcticManagedAreaSource.url

      const AntarcticManagedAreaPopup = {
        title: antarcticManagedAreaSource.title,
        content: getPopupTemplate([
          ['Name', '{NAME}'],
          ['Type', '{Type}'],
          ['Helo', '{HELO}'],
          ['PDF', '{PDF}'],
          ['Desc', '{DESC}'],
        ]),
      }

      antarcticManagedAreaLayer = new FeatureLayer({
        url: antarcticManagedAreaUrl,
        title: antarcticManagedAreaSource.title,
        visible: antarcticManagedAreaSource.visible,
        popupTemplate: AntarcticManagedAreaPopup,
      })

      const mcMurdoAsmaUrl = mcmurdoAsmaSource.url

      mcMurdoAsmaLayer = new FeatureLayer({
        url: mcMurdoAsmaUrl,
        title: mcmurdoAsmaSource.title,
        visible: mcmurdoAsmaSource.visible,
      })

      const DisturbanceSampleSitesPopup = {
        id: 0,
        title: 'Sample Sites',
        content: getPopupTemplate([
          ['New ID', '{NEW_ID}'],
          ['location', '{LOCATION}'],
          ['elevation', '{ELEV}'],
          ['distance to coast', '{DIST}'],
          ['slope', '{SLOPE}'],
          ['Aspect', '{ASPECT}'],
        ]),
      }

      // Needs to be fixed
      const SensitivityPopup = {
        id: 1,
        title: 'surface sensitivity',
        content: getPopupTemplate([
          ['Dryver unit', '{DRYVER_GROUP}'],
          ['Map unit', '{MAP_UNIT}'],
          ['age index', '{AGE_INDEX}'],
          ['visual change', '{VIS}'],
          ['track depth', '{DEPTH_20P}'],
          ['track infiltration', '{INFIL0_20}'],
          ['track colour change', '{CCI_20P}'],
          ['track rock cover', '{ROCKCOVER}'],
          ['footprint depth', '{DEPTH_1P}'],
          ['footprint infiltration', '{CHANGE_1P}'],
        ]),
      }

      impactLayer = new MapImageLayer({
        url: impactSource.url,
        title: 'Impact',
        sublayers: impactSource.layers.reduce((newArray, layer) => {
          if (layer.id === DisturbanceSampleSitesPopup.id) layer.popupTemplate = { ...DisturbanceSampleSitesPopup, title: layer.title }
          if (layer.id === SensitivityPopup.id) layer.popupTemplate = { ...SensitivityPopup, title: layer.title }
          if (layer.id !== -1) newArray.push(layer)
          return newArray
        }, []),
      })

      const nztabsUrl = nzTabsSource.url

      const nztabsPopup = {
        title: nzTabsSource.title,
        content: getPopupTemplate([
          ['Wetness', '{Wetness}'],
          ['Cyanobacteria', '{Cyanobacteria}'],
          ['Moss', '{Moss}'],
          ['Lichen', '{Lichen}'],
          ['Springtails', '{Springtails}'],
          ['Mites', '{Mites}'],
          ['ATP', '{ATP}'],
          ['Nematodes', '{Nematodes}'],
          ['Rotifers', '{Rotifers}'],
          ['Tadigrades', '{Tadigrades}'],
        ]),
      }
      nztabsLayer = new FeatureLayer({
        url: nztabsUrl,
        title: nzTabsSource.title,
        visible: nzTabsSource.visible,
        popupTemplate: nztabsPopup,
      })

      sensitivityLayer = new MapImageLayer({
        url: sensitivitySource.url,
        title: sensitivitySource.title,
        sublayers: sensitivitySource.layers,
      })

      terrestrialLayer = new MapImageLayer({
        url: terrestrialSource.url,
        title: terrestrialSource.title,
        sublayers: terrestrialSource.layers,
      })

      const eventsPopup = {
        id: 0,
        title: 'NZ Events',
        content: getPopupTemplate([
          ['Season', '{season}'],
          ['site', '{Site}'],
          ['EventNo', '{EventNo}'],
          ['EventTitle', '{EventTitle}'],
        ]),
      }

      visitationLayer = new MapImageLayer({
        url: visitationSource.url,
        title: visitationSource.title,
        sublayers: visitationSource.layers.reduce((newArray, layer) => {
          if (layer.id === eventsPopup.id) layer.popupTemplate = { ...eventsPopup, title: layer.title }
          if (layer.id !== -1) newArray.push(layer)
          return newArray
        }, []),
      })

      climateLayer = new MapImageLayer({
        url: climateSource.url,
        title: climateSource.title,
        sublayers: climateSource.layers,
      })

      placeNamesLayer = new FeatureLayer({
        url: placeNamesSource.url,
        title: placeNamesSource.title,
        visible: placeNamesSource.visible,
      })
      placeNamesLayer.minScale = 70000

      ecoforcastingLayer = new MapImageLayer({
        url: ecoforcastingSource.url,
        title: ecoforcastingSource.title,
        sublayers: ecoforcastingSource.layers,
      })

      distanceLayer = new MapImageLayer({
        url: anotherDistanceSource.url,
        title: anotherDistanceSource.title,
        sublayers: anotherDistanceSource.layers.reduce((newArray, layer) => {
          if (layer.id === eventsPopup.id) layer.popupTemplate = { ...eventsPopup, title: layer.title }
          if (layer.id !== -1) newArray.push(layer)
          return newArray
        }, []),
      })

      map.add(abioticLayer)
      map.add(aquaticLayer)
      map.add(asmaLayer)
      map.add(antarcticManagedAreaLayer)
      map.add(mcMurdoAsmaLayer)
      map.add(impactLayer)
      map.add(nztabsLayer)
      map.add(sensitivityLayer)
      map.add(terrestrialLayer)
      map.add(visitationLayer)
      map.add(climateLayer)
      map.add(placeNamesLayer)
      map.add(ecoforcastingLayer)
      map.add(distanceLayer)

      // widgets
      // zoom
      const zoom = new Zoom({
        view: view,
      })

      // compass
      const compass = new Compass({
        view: view,
      })

      const scaleBar = new ScaleBar({
        view: view,
        unit: 'metric',
      })

      // legend
      const legendList = new Legend({
        view: view,
        container: document.createElement('div'),
        layerInfos: [{
          layer: abioticLayer,
          title: 'Abiotic',
        },
        {
          layer: climateLayer,
          title: 'Climate',
        },
        {
          layer: visitationLayer,
          title: 'Visitation',
        },
        {
          layer: aquaticLayer,
          title: 'Aquatic',
        },
        {
          layer: asmaLayer,
          title: 'ASMA',
        },
        {
          layer: antarcticManagedAreaLayer,
          title: 'Antarctic Managed Area',
        },
        {
          layer: impactLayer,
          title: 'Impact',
        },
        {
          layer: nztabsLayer,
          title: 'nzTABS',
        },
        {
          layer: sensitivityLayer,
          title: 'Sensitivity',
        },
        {
          layer: terrestrialLayer,
          title: 'Terrestrial',
        },
        ],
      })

      const legendEx = new Expand({
        view: view,
        expandTooltip: 'Legend',
        content: legendList.container,
        autoCollapse: false,
        expandIconClass: 'esri-icon-collection',
      })

      const searchWidget = new Search({
        view: view,
        allPlaceholder: 'Search',
        autoSelect: true,
        includeDefaultSources: false,
        sources: [{
          layer: placeNamesLayer,
          searchFields: ['PLACE_NAME'],
          displayField: 'PLACE_NAME',
          exactMatch: false,
          name: 'SCAR Place Names',
          placeholder: 'Place Name',
          zoomScale: 60000,
        }],
      })

      var marker = new PictureMarkerSymbol(
        "/static/img/BluePin1LargeB.png",
        32,
        32
      );

      searchWidget.on('select-result', function (response) {
        map.remove(searchAddressPointLayer);
        let markerPoint = new Point({ x: response.result.feature.geometry.longitude, y: response.result.feature.geometry.latitude });
        let storepoint = new Graphic(markerPoint, marker);
        searchAddressPointLayer = new GraphicsLayer();
        searchAddressPointLayer.add(storepoint);
        map.add(searchAddressPointLayer);

        view.goTo({
          center: [response.result.feature.geometry.longitude, response.result.feature.geometry.latitude],
          scale: 60000, // region level of zoom
        })
      })

      // Add the search widget to the top right corner of the view
      view.ui.add(searchWidget, {
        position: 'top-right',
      })

      view.ui.add(zoom, {
        position: 'top-right',
      })

      view.ui.add(compass, {
        position: 'top-right',
      })

      view.ui.add(scaleBar, {
        position: 'bottom-right',
      })

      view.ui.add(legendEx, {
        position: 'top-right',
      })

      // The logic of fetching data base of where user click is in executeIdentifyTask
      view.ui.add('inspect-point-component', {
        position: 'top-right',
      })
      document
        .querySelector('#inspectButton')
        .addEventListener('click', function () {
          if (!this.classList.contains('active')) {
            view.popup.autoOpenEnabled = false // Disables default layer popups behaviour
            this.classList.add('active', 'bg-primary', 'text-white')
          } else {
            view.popup.autoOpenEnabled = true // Enables default layer popups behaviour
            this.classList.remove('active', 'bg-primary', 'text-white')
          }
        })

      // https://developers.arcgis.com/javascript/latest/sample-code/widgets-measurement-2d/index.html
      // add the toolbar for the measurement widgets
      view.ui.add('distance-measurement-component', {
        position: 'top-right',
      })
      document
        .querySelector('#distanceButton')
        .addEventListener('click', function () {
          setActiveWidget(null)
          if (!this.classList.contains('active')) {
            setActiveWidget('distance')
          } else {
            setActiveButton(null)
          }
        })

      view.ui.add('area-measurement-component', {
        position: 'top-right',
      })
      document
        .querySelector('#areaButton')
        .addEventListener('click', function () {
          setActiveWidget(null)
          if (!this.classList.contains('active')) {
            setActiveWidget('area')
          } else {
            setActiveButton(null)
          }
        })

      document
        .querySelector('#decimalDegreesBtn')
        .addEventListener('click', function () {
          decimalType = 'DD';
        })

      document
        .querySelector('#decimalMinutesBtn')
        .addEventListener('click', function () {
          decimalType = 'DM';
        })

      function setActiveWidget(type) {
        switch (type) {
          case 'distance':
            activeWidget = new DistanceMeasurement2D({
              view: view,
            })

            // skip the initial 'new measurement' button
            activeWidget.viewModel.newMeasurement()

            view.ui.add(activeWidget, {
              position: 'top-right',
            })
            setActiveButton(document.querySelector('#distanceButton'))
            break
          case 'area':
            activeWidget = new AreaMeasurement2D({
              view: view,
            })

            // skip the initial 'new measurement' button
            activeWidget.viewModel.newMeasurement()

            view.ui.add(activeWidget, {
              position: 'top-right',
            })
            setActiveButton(document.querySelector('#areaButton'))
            break
          case null:
            if (activeWidget) {
              view.ui.remove(activeWidget)
              activeWidget.destroy()
              activeWidget = null
            }
            break
        }
      }

      function addMarkerToMap(lat, long) {
        map.remove(searchAddressPointLayer);
        let markerPoint = new Point({ x: long, y: lat });
        let storepoint = new Graphic(markerPoint, marker);
        searchAddressPointLayer = new GraphicsLayer();
        searchAddressPointLayer.add(storepoint);
        map.add(searchAddressPointLayer);
      }

      function setActiveButton(selectedButton) {
        // focus the view to activate keyboard shortcuts for sketching
        view.focus()
        const elements = document.querySelectorAll('.custom-topbar-buttons')
        for (let i = 0; i < elements.length; i++) {
          elements[i].classList.remove('active')

          // Assumes there's only a single child
          elements[i].children[0].classList.remove('esri-icon-collapse')
          if (elements[i].id === 'distanceButton') {
            elements[i].children[0].classList.add('esri-icon-measure-line')
          } else if (elements[i].id === 'areaButton') {
            elements[i].children[0].classList.add('esri-icon-measure-area')
          }
        }
        if (selectedButton) {
          selectedButton.classList.add('active')

          if (selectedButton.id === 'distanceButton') {
            selectedButton.children[0].classList.remove('esri-icon-measure-line')
          } else if (selectedButton.id === 'areaButton') {
            selectedButton.children[0].classList.remove('esri-icon-measure-area')
          }
          selectedButton.children[0].classList.add('esri-icon-collapse')
        }
      }

      document.querySelector('#loc_jump_dm').addEventListener('submit', function (evt) {
        let lat = +document.querySelector('#lat_deg_jump').value
        let lat_min = +document.querySelector('#lat_min_jump').value
        lat_min /= 60
        if (lat > 0) {
          lat += lat_min
        } else {
          lat -= lat_min
        }
        let long = +document.querySelector('#long_deg_jump').value
        let long_min = +document.querySelector('#long_min_jump').value
        long_min /= 60
        if (long > 0) {
          long += long_min
        } else {
          long -= long_min
        }
        evt.preventDefault()
        addMarkerToMap(lat, long)
        view.goTo({
          center: [long, lat],
          scale: 60000, // region level of zoom
        })
      })

      document.querySelector('#loc_jump_dd').addEventListener('submit', function (evt) {
        const lat = +document.querySelector('#lat_jump').value
        const long = +document.querySelector('#long_jump').value
        evt.preventDefault()
        const new_loc = new Point({
          latitude: lat,
          longitude: long,
        })
        addMarkerToMap(lat, long);
        view.goTo({
          center: [long, lat],
          // scale: 8000, // region level of zoom
        })
      })

      let impactIdentifyTask, aquaticIdentifyTask, abioticIdentifyTask, climateIdentifyTask, distanceIdentifyTask, impactParams, aquaticParams, abioticParams, climateParams, distanceParams

      view.when(function () {
        // https://community.esri.com/thread/216034-search-widgetin-onfocusout-in-47-causes-error-when-used-with-jquery
        // With version 4.7 the search widget's onfocusout handler will throw an error
        // whenever there is a jQuery onfocusout handler along the event path because of
        // jQuery's event bubbling workaround for focusin/out events. So for now, just
        // remove the Search widget's onfocusout handler to silence the error.
        document.querySelector('.esri-search__input').onfocusout = null

        // https://developers.arcgis.com/javascript/latest/sample-code/sandbox/index.html?sample=widgets-print
        // const print = new Print({
        //   view: view,
        //   printServiceUrl: 'https://trugis.sci.waikato.ac.nz:6443/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task',
        //   // allowedFormats: ["jpg", "png8", "png32"]
        // })

        // view.ui.add(print, {
        //   position: 'top-right',
        // })

        // https://developers.arcgis.com/javascript/latest/sample-code/sandbox/index.html?sample=tasks-identify
        // executeIdentifyTask() is called each time the view is clicked
        view.on('click', executeIdentifyTask)

        // Create identify task for the specified map service
        impactIdentifyTask = new IdentifyTask(impactSource.url)
        aquaticIdentifyTask = new IdentifyTask(aquaticSource.url)
        abioticIdentifyTask = new IdentifyTask(abioticSource.url)
        climateIdentifyTask = new IdentifyTask(climateSource.url)
        distanceIdentifyTask = new IdentifyTask(anotherDistanceSource.url)

        // Set the parameters for the Identify
        impactParams = new IdentifyParameters({
          tolerance: 3,
          layerIds: [1],
          layerOption: 'top',
          width: view.width,
          height: view.height,
        })

        abioticParams = new IdentifyParameters({
          tolerance: 3,
          layerIds: [12, 18],
          layerOption: 'visible',
          width: view.width,
          height: view.height,
        })

        aquaticParams = new IdentifyParameters({
          tolerance: 3,
          layerIds: aquaticSource.layers.reduce((newArray, { id }) => {
            if (id !== -1) newArray.push(id)
            return newArray
          }, []),
          layerOption: 'top',
          width: view.width,
          height: view.height,
        })

        climateParams = new IdentifyParameters({
          tolerance: 3,
          layerIds: [6],
          layerOption: 'top',
          width: view.width,
          height: view.height,
        })

        distanceParams = new IdentifyParameters({
          tolerance: 3,
          layerIds: [1, 2, 4],
          layerOption: 'visible',
          width: view.width,
          height: view.height,
        })
      })

      // WORK IN PROGRESS, BACKEND NEEDS TO BE FIX BECAUSE OF TIMEOUT
      const printVM = new PrintViewModel({
        view,
        printServiceUrl: 'https://trugis.sci.waikato.ac.nz/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task',
        // printServiceUrl: 'https://utility.arcgisonline.com/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task'
      })

      const printReportThisAction = {
        title: 'Print Report',
        id: 'print-report',
        className: 'esri-icon-printer',
      }

      async function getGeneratedImageUrl() {
        let generatedImageUrl;
        var printTask = new PrintTask({
          url: 'https://utility.arcgisonline.com/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task'
        });

        // var extScreenWidth = map.width * (geom.getExtent()).getWidth() / map.extent.getWidth(); 
        // var extScreenHeight = map.height * (geom.getExtent()).getHeight() / map.extent.getHeight();

        var template = new PrintTemplate({
          format: "jpg",
          exportOptions: {
            dpi: 300
          },
          layoutOptions: {
            scalebarUnit: "Miles",
          },
          layout: "a4-portrait",     // 'map-only', 'a3-landscape', 'a3-portrait', 'a4-landscape', 'a4-portrait', 'letter-ansi-a-landscape', 'letter-ansi-a-portrait', 'tabloid-ansi-b-landscape', 'tabloid-ansi-b-portrait'
        });
        var params = new PrintParameters({
          view: view,
          template: template
        });

        await printTask.execute(params).then(printResult, printError);

        async function printResult(result) {
          generatedImageUrl = result.url;
          console.log(result.url);
          // window.open(result.url);
        }

        function printError(err) {
          console.log("Something broke: ", err);
          alert("Check the browser console");
        }

        return generatedImageUrl;
      }

      async function createForm() {
        let generatedImageUrl = await getGeneratedImageUrl();
        window.jsPDF = window.jspdf.jsPDF;
        const doc = new jsPDF('p', 'pt', 'a4');

        var img = new Image;
        img.crossOrigin = "";
        img.src = "static/img/dryver.jpg";
        img.onload = async function () {
          // left logo
          doc.addImage(this, 20, 20, 130, 40);

          // title
          let today = new Date();
          let todayStr = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`
          doc.text(`Sensitivity Report Created on ${todayStr}`, 200, 44)

          // map
          var mapImg = new Image;
          mapImg.crossOrigin = "";
          mapImg.src = generatedImageUrl;
          await doc.addImage(mapImg, 20, 60, 560, 800)

          // table
          doc.autoTable({
            html: '#ttt666888',
            startY: 1200,
          })

          doc.save("two-by-four.pdf");
        };
      }

      async function printPopupReport() {
        console.log('printPopupReport function')
        // window.open('/static/img/PDFmockup.png', '_blank')
        await createForm()
      }

      // Event handler that fires each time an action is clicked.
      view.popup.on('trigger-action', async function (event) {
        // Execute the printPopupReport() function if the measure-this action is clicked
        if (event.action.id === 'print-report') {
          let oldNode = document.querySelector('[aria-label="Print Report"]')
          oldPrintDOM = oldNode;
          let newItem = document.createElement('div');
          newItem.innerHTML = '<div class="spinner-border text-secondary" role="status" id="printSpinner" style="width: 22px; height: 22px; margin-left: 16px; margin-right: 10px;"><span class="sr-only">Loading...</span></div>';
          oldNode.parentNode.replaceChild(newItem, oldNode);

          await printPopupReport()

          document.querySelector('#printSpinner').parentNode.parentNode.replaceChild(oldPrintDOM, newItem);
        }
      })

      // Executes each time the view is clicked
      async function executeIdentifyTask(event) {
        let locationStr;
        if (!view.popup.autoOpenEnabled) {
          const lat = Math.round(event.mapPoint.latitude * 1000) / 1000
          const lon = Math.round(event.mapPoint.longitude * 1000) / 1000
          // Set the geometry to the location of the view click
          distanceParams.geometry = climateParams.geometry = abioticParams.geometry = impactParams.geometry = aquaticParams.geometry = event.mapPoint
          distanceParams.mapExtent = climateParams.mapExtent = abioticParams.mapExtent = impactParams.mapExtent = aquaticParams.mapExtent = view.extent

          const allIdentifyTasks = [
            { task: climateIdentifyTask, params: climateParams },
            { task: abioticIdentifyTask, params: abioticParams },
            { task: distanceIdentifyTask, params: distanceParams },
          ]

          const allSensivityIdentifyTasks = [
            { task: impactIdentifyTask, params: impactParams },
            { task: aquaticIdentifyTask, params: aquaticParams },
          ]

          document.querySelector('#map_canvas').style.cursor = 'wait'

          if (decimalType === 'DD') {
            locationStr = `${lat}, ${lon}`
          } else if (decimalType === 'DM') {
            let dmLatDegrees = parseInt(lat)
            let dmLatMinutes = Math.abs((event.mapPoint.latitude - dmLatDegrees) * 60).toFixed(4)
            let dmLonDegrees = parseInt(lon)
            let dmLonMinutes = Math.abs((event.mapPoint.longitude - dmLonDegrees) * 60).toFixed(4)
            locationStr = `${dmLatDegrees}° ${dmLatMinutes}', ${dmLonDegrees}° ${dmLonMinutes}'`
          }

          // This function returns a promise that resolves to an array of features
          // A custom popupTemplate is set for each feature based on the layer it
          // originates from

          let dt_water = '';
          let dt_aspa = '';
          let dt_camps = '';
          let summer_mean_wind_speed = '';
          let slope = '';
          let elevation = '';
          await Promise.all(allIdentifyTasks.map(({ task, params }) => task.execute(params)))
            .then(function (responses) {
              return responses.map(({ results }) => {
                return results.map((result) => {
                  const feature = result.feature
                  const layerName = result.layerName
                  feature.attributes.layerName = layerName
                  // layerName check logic is hardcoded for now as there is a chance that
                  // the layer name on the server does not match the one in the source/data.json
                  if (layerName === 'DT_ASPA') {
                    dt_aspa = feature.attributes['Pixel Value']
                  } else if (layerName === 'DT_CAMPS') {
                    dt_camps = feature.attributes['Pixel Value']
                  } else if (layerName === 'DT_WATER') {
                    dt_water = feature.attributes['Pixel Value']
                  } else if (layerName === 'SUMMER_mean_ws') {
                    summer_mean_wind_speed = feature.attributes['Pixel Value']
                  } else if (layerName === 'Slope') {
                    slope = feature.attributes['Pixel Value']
                  } else if (layerName === 'GNS_dtm_asma') {
                    elevation = feature.attributes['Pixel Value']
                  }
                })
              }).flat()
            })

          let total_sensitivity = '';
          let riskClass = '';
          Promise.all(allSensivityIdentifyTasks.map(({ task, params }) => task.execute(params)))
            .then(function (responses) {
              return responses.map(({ results }) => {
                return results.map((result) => {
                  const feature = result.feature
                  const layerName = result.layerName
                  feature.attributes.layerName = layerName
                  // layerName check logic is hardcoded for now as there is a chance that
                  // the layer name on the server does not match the one in the source/data.json
                  if (layerName === 'Human Impact Sensitivity') {
                    total_sensitivity = feature.attributes['Total Sensitivity']
                    switch (feature.attributes['Total Sensitivity']) {
                      case 'EXTREME':
                        riskClass = 'bg-danger'
                        break
                      case 'HIGH':
                        riskClass = 'bg-warning'
                        break
                      default:
                        riskClass = ''
                    }
                    feature.popupTemplate = {
                      title: layerName,
                      content: getPopupTemplateNoPaddings([
                        ['<span class="py-3q pr-3q d-flex flex-fill">Coordinate</span>', `<span class="p-3q d-flex flex-fill">${locationStr}</span>`],
                        ['<span class="py-3q pr-3q d-flex flex-fill">Distance to established water</span>', `<span class="p-3q d-flex flex-fill">${dt_water}</span>`],
                        ['<span class="py-3q pr-3q d-flex flex-fill">Distance to ASPA</span>', `<span class="p-3q d-flex flex-fill">${dt_aspa}</span>`],
                        ['<span class="py-3q pr-3q d-flex flex-fill">Distance to previous camp and ID</span>', `<span class="p-3q d-flex flex-fill">${dt_camps}</span>`],
                        ['<span class="py-3q pr-3q d-flex flex-fill">Summer mean wind speed</span>', `<span class="p-3q d-flex flex-fill">${summer_mean_wind_speed}</span>`],
                        ['<span class="py-3q pr-3q d-flex flex-fill">Slope</span>', `<span class="p-3q d-flex flex-fill">${slope}</span>`],
                        ['<span class="py-3q pr-3q d-flex flex-fill">Elevation</span>', `<span class="p-3q d-flex flex-fill">${elevation}</span>`],
                        ['<span class="py-3q pr-3q d-flex flex-fill">Sensitivity Index</span>', `<span class="p-3q d-flex flex-fill ${riskClass}">${total_sensitivity}</span>`],
                      ]),
                      actions: [printReportThisAction],
                    }
                  } else if (layerName === 'LINZ Lakes and Ponds') {
                    feature.popupTemplate = {
                      title: layerName,
                      content: getPopupTemplate([
                        ['Coordinate', `${lat}, ${lon}`],
                        ...Object.keys(feature.attributes).map(key => [key, `{${key}}`]),
                      ]),
                      // content: getPopupTemplate([
                      //   ['Coordinate', `${lat}, ${lon}`],
                      //   ['OBJECTID', '{OBJECTID}'],
                      //   ['Shape', '{Shape}'],
                      //   ['name_ascii', '{name_ascii}'],
                      //   ['macronated', '{macronated}'],
                      //   ['name', '{name}'],
                      //   ['basin', '{basin}'],
                      //   ['INPUT', '{INPUT}'],
                      //   ['TYPE', '{TYPE}'],
                      //   ['buffer', '{buffer}'],
                      //   ['Shape_Length', '{Shape_Length}'],
                      //   ['Shape_Area', '{Shape_Area}'],
                      //   ['L_TYPE', '{L_TYPE}'],
                      //   ['WaterSource', '{WaterSource}'],
                      //   ['CatchmentType', '{CatchmentType}'],
                      //   ['RiverIntersect', '{RiverIntersect}'],
                      //   ['Landscape', '{Landscape}'],
                      //   ['River_In', '{River_In}'],
                      //   ['River_Out', '{River_Out}'],
                      //   ['Check', '{Check}'],
                      // ]),
                      actions: [printReportThisAction],
                    }
                  } else if (layerName === 'Aquatic Connectivity') {
                    feature.popupTemplate = {
                      title: layerName,
                      content: getPopupTemplate([
                        ['Coordinate', `${lat}, ${lon}`],
                        ...Object.keys(feature.attributes).map(key => [key, `{${key}}`]),
                      ]),
                      // content: getPopupTemplate([
                      //   ['Coordinate', `${lat}, ${lon}`],
                      //   ['SHAPE', '{SHAPE}'],
                      //   ['INPUT', '{INPUT}'],
                      //   ['MAIN_ROCK', '{MAIN_ROCK}'],
                      //   ['STRAT_AGE', '{STRAT_AGE}'],
                      //   ['DRYVER_GROUP', '{DRYVER_GROUP}'],
                      //   ['RVR_CLASS', '{RVR_CLASS}'],
                      //   ['CLAST', '{CLAST}'],
                      //   ['SHAPE_Length', '{SHAPE_Length}'],
                      //   ['ECOSYS_SENS', '{ECOSYS_SENS}'],
                      //   ['BIODIVERSITY', '{BIODIVERSITY}'],
                      //   ['ESP_CV', '{ESP_CV}'],
                      //   ['ESP_NNS', '{ESP_NNS}'],
                      //   ['ESP_CONT', '{ESP_CONT}'],
                      //   ['ESP_PHYS', '{ESP_PHYS}'],
                      //   ['MAP_PSM', '{MAP_PSM}'],
                      //   ['MAP_FZA', '{MAP_FZA}'],
                      //   ['MAP_VZA', '{MAP_VZA}'],
                      //   ['DATA_NEEDS', '{DATA_NEEDS}'],
                      //   ['OBJECTID', '{OBJECTID}'],
                      //   ['OBJECTID_1', '{OBJECTID_1}'],
                      //   ['RiverID', '{RiverID}'],
                      //   ['Glacial', '{Glacial}'],
                      // ]),
                      actions: [printReportThisAction],
                    }
                  } else if (layerName === 'Wetness Index Jan-Feb') {
                    feature.popupTemplate = {
                      title: layerName,
                      // content: getPopupTemplate([
                      // No Fields
                      // ]),
                    }
                  }
                  return feature
                })
              }).flat()
            })
            .then(showPopup) // Send the array of features to showPopup()
        }

        // Shows the results of the Identify in a popup once the promise is resolved
        function showPopup(response) {
          if (response.length > 0) {
            view.popup.open({
              features: response,
              location: event.mapPoint,
            })
          }
          document.querySelector('#map_canvas').style.cursor = 'auto'
        }
      }

      // Mapped All Layers to its Source Key
      const mappedLayers = {
        'antarctic managed area': antarcticManagedAreaLayer,
        'mcmurdo asma': mcMurdoAsmaLayer,
        nztabs: nztabsLayer,
        'place names': placeNamesLayer,
        asma: asmaLayer,
        sensitivity: sensitivityLayer,
        visitation: visitationLayer,
        abiotic: abioticLayer,
        aquatic: aquaticLayer,
        climate: climateLayer,
        impact: impactLayer,
        terrestrial: terrestrialLayer,
        ecoforcasting: ecoforcastingLayer,
        distance: distanceLayer,
      }

      const bmProps = {
        basemap: map.basemap,
        geometryType: 'polygon',
        // basemapTheme: "light"
      }

      // Generate some custom schemes and override the 'other'(noData) legend colour
      const schemes = typeSchemes.getSchemes(bmProps)
      const schemesOptions = [schemes.primaryScheme, ...schemes.secondarySchemes]

      $('.symbology-colors').each(function () {
        generateSchemesForRenderer($(this)[0])
      })

      function generateSchemesForRenderer(dropdown) {
        while (dropdown.firstChild) {
          dropdown.removeChild(dropdown.lastChild)
        }
        schemesOptions.forEach(({ name }, index) => {
          let dropdownItem = document.createElement('option')
          dropdownItem.setAttribute('value', index)
          const dropdownLabel = document.createTextNode(name)
          dropdownItem.appendChild(dropdownLabel)
          dropdown.appendChild(dropdownItem)
        })
      }

      function generateRendererForImgLyr(imageLayer, field, scheme_id) {
        if (field) {
          // const subLayer = imageLayer.findSublayerById(lyr_id)
          // when the createFeatureLayer() promise resolves, load the FeatureLayer
          // and pass it to the createRenderProps function
          // subLayer
          imageLayer
            .createFeatureLayer()
            .then(function (featLyr) {
              return featLyr.load()
            })
            .then(function (featureLayer) {
              // Generate the renderProps for the new featLyr
              schemes.secondarySchemes[scheme_id].noDataColor = {
                r: 230,
                g: 230,
                b: 230,
                a: 0.6,
              }
              const renderProps = {
                layer: featureLayer,
                view: view,
                field: field,
                legendOptions: {
                  title: 'Unique Values: ' + field,
                },
                // Here we can override the colour scheme that is generated for the renderer.
                // typeScheme: schemes.secondarySchemes[scheme_id],
                sortBy: 'count',
              }
              // when the promise resolves, apply the renderer to the imageLayer
              typeRendererCreator
                .createRenderer(renderProps)
                .then(function (response) {
                  imageLayer.renderer = response.renderer
                })
            })
        } else {
          imageLayer.renderer = null
        }
      }

      $('.symbology-switch').change(function () {
        const id = $(this).attr('data-id')
        const keyLayer = $(this).attr('data-layer')
        const keyLayerHTMLID = keyLayer.split(' ').join('-')
        const field = $(this).val()
        if (keyLayer in dryverLayersSource || keyLayer in source) {
          const layerSource = dryverLayersSource[keyLayer] || source[keyLayer]
          const layer = mappedLayers[keyLayer]
          if (layer.loaded) {
            const querySymbologySelect = `select#${keyLayerHTMLID}-${id}-select-scheme`
            const dropdown = $(querySymbologySelect)
            const fieldSelect = dropdown.val()
            // Can uncomment after fix the issue
            // if (field) dropdown[0].parentElement.classList.remove('d-none')
            // else dropdown[0].parentElement.classList.add('d-none')
            if (layerSource.layers) {
              const sublayer = layer.findSublayerById(+id)
              generateRendererForImgLyr(sublayer, field, +fieldSelect)
            } else {
              generateRendererForImgLyr(layer, field, +fieldSelect)
            }
          }
        } else {
          console.log('No key match', keyLayer)
        }
      })

      $('.symbology-colors').change(function () {
        const id = $(this).attr('data-id')
        const keyLayer = $(this).attr('data-layer')
        const keyLayerHTMLID = keyLayer.split(' ').join('-')
        const field = $(this).val()
        if (keyLayer in dryverLayersSource || keyLayer in source) {
          const layerSource = dryverLayersSource[keyLayer] || source[keyLayer]
          const layer = mappedLayers[keyLayer]
          if (layer.loaded) {
            const querySymbologySelect = `select#${keyLayerHTMLID}-${id}-select`
            const fieldSelect = $(querySymbologySelect).val()
            if (layerSource.layers) {
              const sublayer = layer.findSublayerById(+id)
              generateRendererForImgLyr(sublayer, fieldSelect, +field)
            } else {
              generateRendererForImgLyr(layer, fieldSelect, +field)
            }
          }
        } else {
          console.log('No key match', keyLayer)
        }
      })

      // Tab 2 and 3 switches logic
      $('.layer-toggle').click(function () {
        const id = $(this).attr('data-id')
        const keyLayer = $(this).attr('data-layer')
        const keyLayerHTMLID = keyLayer.split(' ').join('-')
        if (keyLayer in dryverLayersSource || keyLayer in source) {
          const layerSource = dryverLayersSource[keyLayer] || source[keyLayer]
          const layer = mappedLayers[keyLayer]
          if (layer.loaded) {
            const querySwitchCheckbox = `input[type="checkbox"]#${keyLayerHTMLID}-${id}-checkbox`
            if (layerSource.layers) {
              const sublayer = layer.findSublayerById(+id)
              sublayer.visible = !document.querySelector(querySwitchCheckbox).checked
            } else {
              layer.visible = !document.querySelector(querySwitchCheckbox).checked
            }
          }
        } else {
          console.log('No key match', keyLayer)
        }
      })

      // Hacky solution, basically I have to check the opposite value then trigger the click
      // Not an exact reset, a proper reset would require to read from the data file
      $('#dryver-switch-control.btn-group button.btn').click(function () {
        if ($(this).attr('id') === 'dryver-show-all') {
          $('#dryver-switches .custom-control.custom-switch input[type="checkbox"].custom-control-input').not(this).prop('checked', false)
          $('#dryver-switches .layer-toggle').click()
        } else if ($(this).attr('id') === 'dryver-reset-all') {
          $('#dryver-switches .custom-control.custom-switch input[type="checkbox"].custom-control-input').not(this).prop('checked', true)
          $('#dryver-switches .layer-toggle').click()
        }
      })
    })
  })
}
