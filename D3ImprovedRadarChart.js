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
			//////////////////////// Set-Up ////////////////////////////// 
			////////////////////////////////////////////////////////////// 
		
			// Set the margins of the object
			var margin = {top: 60, right: 0, bottom: 70, left: 70},
				width = $element.width(),
				height = $element.height(),
				legendPosition = {x: 10, y: 10};
				
							
			////////////////////////////////////////////////////////////// 
			////////////////////////// Data ////////////////////////////// 
			////////////////////////////////////////////////////////////// 
								
			var json = getJSONtoHyperCube(layout);

			
			////////////////////////////////////////////////////////////// 
			//////////////////// Draw the Chart ////////////////////////// 
			////////////////////////////////////////////////////////////// 

			var color = d3.scale.ordinal()
				.range(["#EDC951","#CC333F","#00A0B0"]);
				
			var radarChartOptions = {
			  w: width*0.65,
			  h: height*0.65,
			  margin: margin,
			  maxValue: .6,
			  levels: 6,
			  roundStrokes: false,
			  color: color,
			  labelFactor: 1.3,
			  axisName: "Characteristics",
			  areaName: "radar_area_name",
			  value: "Value",
			  legendPosition: legendPosition,
			  numDimensions: layout.qHyperCube.qDimensionInfo.length
			};
		
			//$element.html(JSON.stringify(json));
			
			RadarChart(".radarChart", json, radarChartOptions, $element, layout);
		}
	};

} );



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
					// Make sure radar_area_name is added for usage in the radar chart layers later
					myJson.definition[cont]  = {"axis_id" : dim2Id[k], "axis" : dim2Labels[k], "value" : metric1Values[k], "radar_area_name" : dim1Labels[k]};
					cont++;		
					// Make sure radar_area_name is added for usage in the radar chart layers later
			}else{						
					myJson.definition[cont]  = {"axis_id" : dim2Id[k], "axis" : dim2Labels[k], "value" : metric1Values[k], "radar_area_name" : dim1Labels[k]};
					cont++;
			}												
			actClassName =  dim1Labels[k];						
		}				
		data[contdata] = myJson;			
	}else{
		for(var k=0;k<dim1Labels.length;k++){									
			// it is a different grouping value of Dim1
			LegendValues.push(dim1Labels[k]);	
					// Make sure radar_area_name is added for usage in the radar chart layers later
					myJson.definition[cont]  = {"axis_id" : dim2Id[k], "axis" : dim2Labels[k], "value" : metric1Values[k], "radar_area_name" : "Default"};
					cont++;
		}	
		data[contdata] = myJson;
	}
	return data;
}