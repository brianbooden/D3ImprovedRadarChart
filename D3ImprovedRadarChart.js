define(["jquery", "./d3.min", "./radarChart", "https://cdnjs.cloudflare.com/ajax/libs/d3-legend/1.3.0/d3-legend.js"], function() {
	return {
		initialProperties: {
			qHyperCubeDef: {
				qDimensions: [],
				qMeasures: [],
				qInitialDataFetch: [{
					qWidth: 10,
					qHeight: 50
				}]
			}
		},
		definition: {
			type: "items",
			component: "accordion",
			items: {
				dimensions: {
					uses: "dimensions",
					min: 1,
					max: 2
				},
				measures: {
					uses: "measures",
					min: 1,
					max: 1
				},
				sorting: {
					uses: "sorting"
				},
				settings : {
					uses : "settings",
					items : {	
						showLegend:{
							type: "boolean",
							component: "switch",
							translation: "Legend",
							ref: "showLegend",
							defaultValue: true,
							trueOption: {
							  value: true,
							  translation: "properties.on"
							},
							falseOption: {
							  value: false,
							  translation: "properties.off"
							},
							show: true
						  },
					}
				}					
			}
		},
		snapshot: {
			canTakeSnapshot: true
		},
		paint: function ($element, layout) {

			////////////////////////////////////////////////////////////// 
			////////////////////// Set-Up display //////////////////////// 
			////////////////////////////////////////////////////////////// 

			var color = d3.scale.ordinal()
				.range(["#EDC951","#CC333F","#00A0B0"]);

			var radarChartOptions = {
				size: {width: $element.width(), height: $element.height()},									//Width and Height of the circle
				margin: {top: 50, right: 50, bottom: 50, left: 50},											//The margins around the circle
				legendPosition: {x: 40, y: 40},																//The position of the legend, from the top-left corner of the svg
				color: color,																				//Color function
				colorOpacity: {circle: 0.1, area: 0.2, area_out: 0.1, area_over: 0.6, area_click: 0.8},		//The opacity of the area of the blob
				roundStrokes: true,																			//If true the area and stroke will follow a round path (cardinal-closed)		
				maxValue: .6,																				//What is the value that the biggest circle will represent
				levels: 6,																					//How many levels or inner circles should there be drawn
				dotRadius: 4, 																				//The size of the colored circles of each blob
				labelFactor: 1.14, 																			//How much farther than the radius of the outer circle should the labels be placed
				wrapWidth: 100, 																			//The number of pixels after which a label needs to be given a new line
				strokeWidth: 2.8, 																			//The width of the stroke around each blob
				optionSorting: checkSORTING(layout),														//The sorting configuration
				optionLegend: layout.showLegend																//Display the legend
			};
			
			////////////////////////////////////////////////////////////// 
			////////////////////////// Data ////////////////////////////// 
			////////////////////////////////////////////////////////////// 
								
			var json = convertHYPERCUBEtoJSON(layout);
			
			////////////////////////////////////////////////////////////// 
			//////////////////// Draw the Chart ////////////////////////// 
			////////////////////////////////////////////////////////////// 		
			
			if(radarChartOptions.optionSorting[0] == true) {
					
				displayRADAR(".radarChart", radarChartOptions, $element, layout, json, this);
				
			} else {

				displayMESSAGE(".radarChart", radarChartOptions, $element, layout, radarChartOptions.optionSorting[2]);
				
			}
		}
	};
});

function checkSORTING(layout) {
	var result = [];

	// Detect if sorting is correct
	if((layout.qHyperCube.qEffectiveInterColumnSortOrder[0] == 0) && (layout.qHyperCube.qEffectiveInterColumnSortOrder[1] == 1)) { result[0] = true; } else { result[0] = false; }

	// Detect the browser language
	switch (navigator.language.toUpperCase().split("-")[0]) {
		case "FR":
			result[1] = "Veuillez trier les dimensions et les mesures comme décrit ci-après :"				//FRENCH
			break;
		case "DE":
			result[1] = "Sie ordnen die Abmessungen und die Maßnahmen, wie nachstehend beschrieben :";		//GERMAN
			break;
		case "ES":
			result[1] = "Por favor, ordenar las dimensiones y medidas como se describe a continuación :"	//SPANISH
			break;
		default:
			result[1] = "Please sort the dimensions and measures as described below :";						//ENGLISH
			break;
	};

	// Build the error message
	result[2] = '<div style="position:relative; top:45%; text-align:center; font-size:15px">' + result[1] + '<p style="position:relative; padding-left:44%; text-align:left; font-size:14px"> 1. > &nbsp;' + layout.qHyperCube.qDimensionInfo[0].qFallbackTitle + "<br/> 2. > &nbsp;" + layout.qHyperCube.qDimensionInfo[1].qFallbackTitle + "<br/> 3. > &nbsp;" + layout.qHyperCube.qMeasureInfo[0].qFallbackTitle + '</p></div>';
	
	return result;
}

function displayMESSAGE(id, cfg, $element, layout, message) {
	
	// Remove whatever chart with the same id/class was present before
	d3.select(id).select("svg").remove();

	// Chart object id  
	var id = "container_" + layout.qInfo.qId; 

	// Check to see if the chart element has already been created  
	if (document.getElementById(id)) {  
		// if it has been created, empty its contents so we can redraw it  
		 $("#" + id).empty();  
	}  
	else {  
		// if it hasn't been created, create it with the appropiate id and size  
		 $element.append($('<div />').attr("id", id).width(cfg.size.width).height(cfg.size.height));  
	}
	
	//Display error message
	var svg = d3.select("#" + id).append("svg")  
		.attr("width", cfg.size.width)  
		.attr("height", cfg.size.height);
	
    var g = svg.append('g').attr("transform" ,"scale(0)");
	
    var text = g.append('foreignObject')
                    .attr('width', cfg.size.width)
                    .attr('height', cfg.size.height)
                    .html(cfg.sort[2]);	
}

function convertHYPERCUBEtoJSON(layout) {

	// get qMatrix data array
	var qMatrix = layout.qHyperCube.qDataPages[0].qMatrix;

	// create a new array that contains the measure labels
	var dimensions = layout.qHyperCube.qDimensionInfo;			
	var LegendTitle = dimensions[0].qFallbackTitle;			
	
	// create a new array that contains the dimensions and metric values
	// depending on whether if 1 or 2 dimensions are being used
	if(dimensions.length==2){			 
		var dim1Labels = qMatrix.map(function(d) {
			 return d[0].qText;
		 });
		 var dim1Id = qMatrix.map(function(d) {
			 return d[0].qElemNumber;
		 });
		 var dim2Labels = qMatrix.map(function(d) {
			 return d[1].qText;
		 });
		 var dim2Id = qMatrix.map(function(d) {
			 return d[1].qElemNumber;
		 });
		 var metric1Values = qMatrix.map(function(d) {
				 return d[2].qNum;
		 }) ;	 
	}
	else{				
		var dim1Labels = qMatrix.map(function(d) {
			 return d[0].qText;
		 });				 
		 var dim1Id = qMatrix.map(function(d) {
			 return d[0].qElemNumber;
		 });
		 var dim2Labels = dim1Labels;
		 var dim2Id = dim1Id;
		 var metric1Values = qMatrix.map(function(d) {
			 return d[1].qNum;
		 });				 		 
	} 
	
	// create a JSON array that contains dimensions and metric values
	var data = [];
	var actClassName = "";
	var myJson = {};
	myJson.dim_id = ""; 
	myJson.dim = ""; 
	myJson.definition = [];
	var cont = 0;
	var contdata = 0;
	var LegendValues = [];								
	if(dimensions.length==2){
		for(var k=0;k<dim1Labels.length;k++){				
			if(actClassName!=dim1Labels[k] ){
				if(cont!=0){
					data[contdata] = myJson;
					contdata++;				
				}
				// it is a different grouping value of Dim1
				LegendValues.push(dim1Labels[k]);
				var myJson = {};
				myJson.dim_id = "";
				myJson.dim = "";
				myJson.definition = [];							
				cont = 0;
				myJson.dim_id = dim1Id[k];	
				myJson.dim = dim1Labels[k];	
					// Make sure radar_area is added for usage in the radar chart layers later
					myJson.definition[cont]  = {"axis_id" : dim2Id[k], "axis" : dim2Labels[k], "radar_area_id" : dim1Id[k], "radar_area" : dim1Labels[k], "value" : metric1Values[k]};
					cont++;		
					// Make sure radar_area is added for usage in the radar chart layers later
			}else{						
					myJson.definition[cont]  = {"axis_id" : dim2Id[k], "axis" : dim2Labels[k], "radar_area_id" : dim1Id[k], "radar_area" : dim1Labels[k], "value" : metric1Values[k]};
					cont++;
			}												
			actClassName =  dim1Labels[k];						
		}				
		data[contdata] = myJson;			
	}else{
		for(var k=0;k<dim1Labels.length;k++){									
			// it is a different grouping value of Dim1
			LegendValues.push(dim1Labels[k]);	
					// Make sure radar_area is added for usage in the radar chart layers later
					myJson.definition[cont] = {"axis_id" : dim2Id[k], "axis" : dim2Labels[k], "radar_area_id" : dim1Id[k], "radar_area" : dim1Labels[k], "value" : metric1Values[k]};
					cont++;
		}	
		data[contdata] = myJson;
	}
	return data;
}