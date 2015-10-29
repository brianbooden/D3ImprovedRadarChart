define(["jquery", "./d3.min", "./d3-legends", "text!./D3ImprovedRadarChart.css","./radarChart"],
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
					min: 1
				},
				measures: {
					uses: "measures",
					min: 0
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
			var margin = {top: 100, right: 100, bottom: 100, left: 100},
				width = $element.width(),
				height = $element.height();
							
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
			  w: width*0.5,
			  h: height*0.5,
			  margin: margin,
			  maxValue: .6,
			  levels: 6,
			  roundStrokes: true,
			  color: color,
			  labelFactor: 1.28
			};
		
			$element.html(JSON.stringify(json));
			
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
					myJson.definition[cont]  = {"axis_id" : dim2Id[k], "axis" : dim2Labels[k], "value" : metric1Values[k]};
					cont++;								
			}else{						
					myJson.definition[cont]  = {"axis_id" : dim2Id[k], "axis" : dim2Labels[k], "value" : metric1Values[k]};
					cont++;
			}												
			actClassName =  dim1Labels[k];						
		}				
		data[contdata] = myJson;			
	}else{
		for(var k=0;k<dim1Labels.length;k++){									
			// it is a different grouping value of Dim1
			LegendValues.push(dim1Labels[k]);				
					myJson.definition[cont]  = {"axis_id" : dim2Id[k], "axis" : dim2Labels[k], "value" : metric1Values[k]};
					cont++;
		}	
		data[contdata] = myJson;
	}
	return data;
}