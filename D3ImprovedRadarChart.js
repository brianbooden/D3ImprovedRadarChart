define(["jquery", "./d3.min", "text!./D3ImprovedRadarChart.css","./radarChart"],
function ( ) {

	return {
		paint: function ($element, layout) {
			////////////////////////////////////////////////////////////// 
			//////////////////////// Set-Up ////////////////////////////// 
			////////////////////////////////////////////////////////////// 

			//var margin = {top: 100, right: 100, bottom: 100, left: 100},
			//	width = $element.width(),
			//	height = $element.height();
			
			// Set the margins of the object
			var margin = {top: 50, right: 50, bottom: 100, left: 50},
				width = $element.width(),
				height = $element.height();
							
			////////////////////////////////////////////////////////////// 
			////////////////////////// Data ////////////////////////////// 
			////////////////////////////////////////////////////////////// 

			var data = [
					  [//iPhone
						{axis:"Battery Life",value:0.22},
						{axis:"Brand",value:0.5},
						{axis:"Contract Cost",value:0.4},
						{axis:"Design And Quality",value:0.17},
						{axis:"Have Internet Connectivity",value:0.22},
						{axis:"Large Screen",value:0.02},
						{axis:"Price Of Device",value:0.21},
						{axis:"Be A Smart phone",value:0.50}			
					  ],[//Samsung
						{axis:"Battery Life",value:0.27},
						{axis:"Brand",value:0.36},
						{axis:"Contract Cost",value:0.35},
						{axis:"Design And Quality",value:0.48},
						{axis:"Have Internet Connectivity",value:0.20},
						{axis:"Large Screen",value:0.28},
						{axis:"Price Of Device",value:0.35},
						{axis:"Be A Smart phone",value:0.38}
					  ],[//Nokia Smartphone
						{axis:"Battery Life",value:0.26},
						{axis:"Brand",value:0.10},
						{axis:"Contract Cost",value:0.30},
						{axis:"Design And Quality",value:0.3},
						{axis:"Have Internet Connectivity",value:0.45},
						{axis:"Large Screen",value:0.04},
						{axis:"Price Of Device",value:0.41},
						{axis:"Be A Smart phone",value:0.30}
					  ]
					];
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
			//Call function to draw the Radar chart
			RadarChart(".radarChart", data, radarChartOptions, $element, layout);
		}
	};

} );

