define(["jquery", "./d3.min", "https://cdnjs.cloudflare.com/ajax/libs/d3-legend/1.3.0/d3-legend.js", "text!./D3ImprovedRadarChart.css","./radarChart"],
function ( ) {

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
				labelFactor: 1.13, 																			//How much farther than the radius of the outer circle should the labels be placed
				wrapWidth: 100, 																			//The number of pixels after which a label needs to be given a new line
				strokeWidth: 2.8 																			//The width of the stroke around each blob
			};
			
			////////////////////////////////////////////////////////////// 
			////////////////////////// Data ////////////////////////////// 
			////////////////////////////////////////////////////////////// 
								
			var json = getJSONtoHyperCube(layout);
			
			////////////////////////////////////////////////////////////// 
			//////////////////// Draw the Chart ////////////////////////// 
			////////////////////////////////////////////////////////////// 		

			//$element.html(JSON.stringify(json));
			
			RadarChart(".radarChart", json, radarChartOptions, this, $element, layout);
		}
	};
});


function getJSONtoHyperCube(layout) {

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