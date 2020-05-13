const requestURL = '/static/data.json'
const request = new XMLHttpRequest()
request.open('GET', requestURL)
request.responseType = 'json'
request.send()
request.onload = function () {
  const source = request.response

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
    aquatic: aquaticSource,
    climate: climateSource,
    impact: impactSource,
    terrestrial: terrestrialSource,
    ecoforcasting: ecoforcastingSource,
  } = dryverLayersSource

  function getPopupTemplate (array) {
    return `<table class="table table-hover"><tbody>${array.map(([header, ...keyValues]) => `<tr>${`<th scope="row" class="text-capitalize pl-0">${header}</th>` + keyValues.map(value => `<td class="text-break">${value}</td>`).join('')}</tr>`).join('')}</tbody></table>`
  }

  function getPopupTemplateNoPaddings (array) {
    return `<table class="table table-hover"><tbody>${array.map(([header, ...keyValues]) => `<tr>${`<th scope="row" class="text-capitalize p-0">${header}</th>` + keyValues.map(value => `<td class="p-0 text-break">${value}</td>`).join('')}</tr>`).join('')}</tbody></table>`
  }

  let view
  let aquaticLayer, climateLayer, impactLayer, nztabsLayer, abioticLayer, asmaLayer, antarcticManagedAreaLayer, mcMurdoAsmaLayer, placeNamesLayer, visitationLayer, terrestrialLayer, sensitivityLayer, ecoforcastingLayer
  let activeWidget = null

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
      'esri/geometry/Point',
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
      AreaMeasurement2D,
      Print,
      PrintViewModel,
      PrintTemplate) {
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
          zoomScale: 50000,
        }],
      })
      searchWidget.on('select-result', function (response) {
        console.log('searchWidget on search result!!!', response)
        view.goTo({
          center: [response.result.feature.geometry.longitude, response.result.feature.geometry.latitude],
          scale: 500000, // region level of zoom
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

      function setActiveWidget (type) {
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

      function setActiveButton (selectedButton) {
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
        lat += lat_min
        let long = +document.querySelector('#long_deg_jump').value
        let long_min = +document.querySelector('#long_min_jump').value
        long_min /= 60
        long += long_min
        evt.preventDefault()
        const new_loc = new Point({
          latitude: lat,
          longitude: long,
        })
        view.goTo(new_loc)
      })

      document.querySelector('#loc_jump_dd').addEventListener('submit', function (evt) {
        const lat = +document.querySelector('#lat_jump').value
        const long = +document.querySelector('#long_jump').value
        evt.preventDefault()
        const new_loc = new Point({
          latitude: lat,
          longitude: long,
        })
        view.goTo(new_loc)
      })

      let impactIdentifyTask, aquaticIdentifyTask, impactParams, aquaticParams

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

        // Set the parameters for the Identify
        impactParams = new IdentifyParameters({
          tolerance: 3,
          layerIds: [1],
          layerOption: 'top',
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

      function printPopupReport () {
        console.log('printPopupReport function')
        printVM.print(
          new PrintTemplate({
            format: 'pdf',
            layout: 'a4-portrait',
          }),
        )
          .then(response => {
            window.open(response.url, '_blank')
          })
          .catch(error => console.warn(error))
      }

      // Event handler that fires each time an action is clicked.
      view.popup.on('trigger-action', function (event) {
        // Execute the printPopupReport() function if the measure-this action is clicked
        if (event.action.id === 'print-report') {
          printPopupReport()
        }
      })

      // Executes each time the view is clicked
      function executeIdentifyTask (event) {
        if (!view.popup.autoOpenEnabled) {
          const lat = Math.round(event.mapPoint.latitude * 1000) / 1000
          const lon = Math.round(event.mapPoint.longitude * 1000) / 1000
          // Set the geometry to the location of the view click
          impactParams.geometry = aquaticParams.geometry = event.mapPoint
          impactParams.mapExtent = aquaticParams.mapExtent = view.extent

          const allIdentifyTasks = [
            { task: impactIdentifyTask, params: impactParams },
            { task: aquaticIdentifyTask, params: aquaticParams },
          ]

          document.querySelector('#map_canvas').style.cursor = 'wait'

          // This function returns a promise that resolves to an array of features
          // A custom popupTemplate is set for each feature based on the layer it
          // originates from
          Promise.all(allIdentifyTasks.map(({ task, params }) => task.execute(params)))
            .then(function (responses) {
              return responses.map(({ results }) => {
                return results.map((result) => {
                  const feature = result.feature
                  const layerName = result.layerName
                  console.log(layerName)
                  console.log(feature)
                  feature.attributes.layerName = layerName
                  // layerName check logic is hardcoded for now as there is a chance that
                  // the layer name on the server does not match the one in the source/data.json
                  if (layerName === 'Human Impact Sensitivity') {
                    //  If it's Extreme, it's red, if it's High, it's yellow
                    let riskClass = ''
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
                        ['<span class="py-3q pr-3q d-flex flex-fill">Coordinate</span>', `<span class="p-3q d-flex flex-fill">${lat}, ${lon}</span>`],
                        ['<span class="py-3q pr-3q d-flex flex-fill">Total Sensitivity</span>', `<span class="p-3q d-flex flex-fill ${riskClass}">{Total Sensitivity}</span>`],
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
        function showPopup (response) {
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
      }

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

              // WORK IN PROGRESS!!!
              // https://codepen.io/john-orbica/pen/NWGXVRY John's Stowell
              // layer = new MapImageLayer({
              //   url: impactURL,
              //   opacity: 0.85,
              //   sublayers: [
              //     {
              //       id: 1,
              //       renderer: {
              //         type: "simple", // autocasts as new SimpleRenderer()
              //         symbol: {
              //           type: "simple-fill",
              //           color: [ 255, 128, 0, 0.5 ],
              //           outline: {  // autocasts as new SimpleLineSymbol()
              //             width: 1,
              //             color: "white"
              //           }
              //         }
              //       }
              //   }
              // ]
              // })
              // The IMPORTANT PART IS THIS, IT IS POSSIBLE TO PROGRAM THE RENDER ON THE FLY
              // console.log(layer.sublayers.items[0].renderer)
              // layer.sublayers.items[0].renderer = {
              //   type: "simple", // autocasts as new SimpleRenderer()
              //   symbol: {
              //     type: "simple-fill",
              //     color: 'red',
              //     outline: {  // autocasts as new SimpleLineSymbol()
              //       width: 1,
              //       color: "white"
              //     }
              //   }
              // }
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
