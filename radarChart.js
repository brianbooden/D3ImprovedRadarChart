/////////////////////////////////////////////////////////
/////////////// The Radar Chart Function ////////////////
/////////////// Written by Nadieh Bremer ////////////////
////////////////// VisualCinnamon.com ///////////////////
/////////// Inspired by the code of alangrafu ///////////
/////////////////////////////////////////////////////////
	
function RadarChart(id, json, options, $element, layout) {
	var cfg = {
	 w: 600,																//Width of the circle
	 h: 600,																//Height of the circle
	 margin: {top: 100, right: 100, bottom: 100, left: 100}, 				//The margins around the circle
	 levels: 3,																//How many levels or inner circles should there be drawn
	 maxValue: 0, 															//What is the value that the biggest circle will represent
	 labelFactor: 1.25, 													//How much farther than the radius of the outer circle should the labels be placed
	 wrapWidth: 100, 														//The number of pixels after which a label needs to be given a new line
	 opacityArea: 0.0, 													//The opacity of the area of the blob
	 dotRadius: 4, 															//The size of the colored circles of each blob
	 opacityCircles: 0.1, 													//The opacity of the circles of each blob
	 strokeWidth: 1.5, 														//The width of the stroke around each blob
	 roundStrokes: false,													//If true the area and stroke will follow a round path (cardinal-closed)
	 color: d3.scale.category10(),											//Color function
	 axisName: "axis",
	 areaName:"areaName",
	 value: "value",
	 sortAreas: true,
	 legendPosition: {x: 20, y: 20}, 										// the position of the legend, from the top-left corner of the svg
	 numDimensions: 1														// Number of dimensions to decide whether to show legend
	};

	//Convert the nested data passed in
	//into an array of values arrays
	var data = json.map(function(d) { return d.definition });
	
	//Put all of the options into a variable called cfg
	if('undefined' !== typeof options){
	  for(var i in options){
		if('undefined' !== typeof options[i]){ cfg[i] = options[i]; }
	  }//for i
	}//if
	
	//Map the fields specified in the configuration 
	//to the axis and value variables
	var axisName = cfg["axisName"],
		areaName = cfg["areaName"],
		value = cfg["value"];
	
	
	//Calculate the average value for each area
	data.forEach(function(d){
		d[value + "Average"] = d3.mean(d,function(e) { return e.value}); 
	})
	
	//Sort the data for the areas from largest to smallest
	//by average value as an approximation of actual blob area
	//so that that the smallest area is drawn last
	//and therefore appears on top
	data = data.sort(function(a, b){
		var a = a[value + "Average"],
				b = b[value + "Average"];
		return b - a;
	})

	
	
	//If the supplied maxValue is smaller than the actual one, replace by the max in the data
	var maxValue = Math.max(cfg.maxValue, d3.max(data, function(i){return d3.max(i.map(function(o){return o.value;}))}));
		
	var allAxis = (data[0].map(function(i, j){return i.axis})),				//Names of each axis
		total = allAxis.length,												//The number of different axes
		radius = Math.min(cfg.w/2, cfg.h/2), 								//Radius of the outermost circle
		Format = d3.format('%'),			 								//Percentage formatting
		angleSlice = Math.PI * 2 / total;									//The width in radians of each "slice"
	
	//Scale for the radius
	var rScale = d3.scale.linear()
		.range([0, radius])
		.domain([0, maxValue]);
		
	/////////////////////////////////////////////////////////
	//////////// Create the container SVG and g /////////////
	/////////////////////////////////////////////////////////

	//Remove whatever chart with the same id/class was present before
	d3.select(id).select("svg").remove();
	
	//Initiate the radar chart SVG
	//var svg = d3.select(id).append("svg")
	//		.attr("width",  cfg.w + cfg.margin.left + cfg.margin.right)
	//		.attr("height", cfg.h + cfg.margin.top + cfg.margin.bottom)
	//		.attr("class", "radar"+id);
			
	// Chart object width  
   var width = cfg.w +100 + cfg.margin.left + cfg.margin.right;  
   // Chart object height  
   var height = cfg.h +100 + cfg.margin.top + cfg.margin.bottom;  
   // Chart object id  
   var id = "container_" + layout.qInfo.qId;  
   // Check to see if the chart element has already been created  
   if (document.getElementById(id)) {  
		// if it has been created, empty its contents so we can redraw it  
		 $("#" + id).empty();  
   }  
   else {  
		// if it hasn't been created, create it with the appropiate id and size  
		 $element.append($('<div />').attr("id", id).width(width).height(height));  
   }  
   var svg = d3.select("#" + id).append("svg")  
		.attr("width", width+100)  
		.attr("height", height+100);  		
			
			
	//Append a g element		
	var g = svg.append("g")
			.attr("transform", "translate(" + (cfg.w/2 + cfg.margin.left) + "," + (cfg.h/2 + cfg.margin.top) + ")");
	
	/////////////////////////////////////////////////////////
	////////// Glow filter for some extra pizzazz ///////////
	/////////////////////////////////////////////////////////
	
	//Filter for the outside glow
	var filter = g.append('defs').append('filter').attr('id','glow'),
		feGaussianBlur = filter.append('feGaussianBlur').attr('stdDeviation','2.5').attr('result','coloredBlur'),
		feMerge = filter.append('feMerge'),
		feMergeNode_1 = feMerge.append('feMergeNode').attr('in','coloredBlur'),
		feMergeNode_2 = feMerge.append('feMergeNode').attr('in','SourceGraphic');

	/////////////////////////////////////////////////////////
	/////////////// Draw the Circular grid //////////////////
	/////////////////////////////////////////////////////////
	
	//Wrapper for the grid & axes
	var axisGrid = g.append("g").attr("class", "axisWrapper");
	
	//Draw the background circles
	axisGrid.selectAll(".levels")
	   .data(d3.range(1,(cfg.levels+1)).reverse())
	   .enter()
		.append("circle")
		.attr("class", "gridCircle")
		.attr("r", function(d, i){return radius/cfg.levels*d;})
		.style("fill", "#CDCDCD")
		.style("stroke", "#CDCDCD")
		.style("fill-opacity", cfg.opacityCircles)
		.style("filter" , "url(#glow)");

	//Text indicating at what % each level is
	axisGrid.selectAll(".axisLabel")
	   .data(d3.range(1,(cfg.levels+1)).reverse())
	   .enter().append("text")
	   .attr("class", "axisLabel")
	   .attr("x", 4)
	   .attr("y", function(d){return -d*radius/cfg.levels;})
	   .attr("dy", "0.4em")
	   .style("font-size", "10px")
	   .attr("fill", "#737373")
	   .text(function(d,i) { return Format(maxValue * d/cfg.levels); });

	/////////////////////////////////////////////////////////
	//////////////////// Draw the axes //////////////////////
	/////////////////////////////////////////////////////////
	
	//Create the straight lines radiating outward from the center
	var axis = axisGrid.selectAll(".axis")
		.data(allAxis)
		.enter()
		.append("g")
		.attr("class", "axis");
	//Append the lines
	axis.append("line")
		.attr("x1", 0)
		.attr("y1", 0)
		.attr("x2", function(d, i){ return rScale(maxValue*1.1) * Math.cos(angleSlice*i - Math.PI/2); })
		.attr("y2", function(d, i){ return rScale(maxValue*1.1) * Math.sin(angleSlice*i - Math.PI/2); })
		.attr("class", "line")
		.style("stroke", "white")
		.style("stroke-width", "2px");

	//Append the labels at each axis
	axis.append("text")
		.attr("class", "legend")
		.style("font-size", "10px")
		.attr("text-anchor", "middle")
		.attr("dy", "0.35em")
		.attr("x", function(d, i){ return rScale(maxValue * cfg.labelFactor) * Math.cos(angleSlice*i - Math.PI/2); })
		.attr("y", function(d, i){ return rScale(maxValue * cfg.labelFactor) * Math.sin(angleSlice*i - Math.PI/2); })
		.text(function(d){return d})
		.call(wrap, cfg.wrapWidth);

	/////////////////////////////////////////////////////////
	///////////// Draw the radar chart blobs ////////////////
	/////////////////////////////////////////////////////////
	
	//The radial line function
	var radarLine = d3.svg.line.radial()
		.interpolate("linear-closed")
		.radius(function(d) { return rScale(d.value); })
		.angle(function(d,i) {	return i*angleSlice; });
		
	if(cfg.roundStrokes) {
		radarLine.interpolate("cardinal-closed");
	}
				
	//Create a wrapper for the blobs	
	var blobWrapper = g.selectAll(".radarWrapper")
		.data(data)
		.enter().append("g")
		.attr("class", "radarWrapper");
			
	//Append the backgrounds	
	blobWrapper
		.append("path")
		//.attr("class", "radarArea")
		.attr("class", function(d) {
			return "radarArea" + " " + d[0][areaName].replace(/\s+/g, '') //Remove spaces from the areaName string to make one valid class name
		})
		.attr("d", function(d,i) { return radarLine(d); })
		.style("fill", function(d,i) { return cfg.color(i); })
		.style("fill-opacity", cfg.opacityArea)
		.on('mouseover', function (d,i){
			
			// Make cursor pointer when hovering over blob
			$("#"+id).css('cursor','pointer');
			
			//Dim all blobs
			d3.selectAll(".radarArea")
				.transition().duration(200)
				.style("fill-opacity", 0.1); 
			//Bring back the hovered over blob
			d3.select(this)
				.transition().duration(200)
				.style("fill-opacity", 0.7);	
				
			// Tooltip to display dimension of radar area on hovering over blob
			tooltip
				.attr('x', 50)
				.attr('y', 50)
				.text(d[0].radar_area_name)
				.transition().duration(200)
				.style('opacity', 1);
				
		})
		.on('mouseout', function(){
						
			// keep mouse cursor arrow instead of text select (auto)
			$("#"+id).css('cursor','default');
			
			// Remove tooltip
			tooltip.transition().duration(200)
				.style("opacity", 0);
				
			//Bring back all blobs
			d3.selectAll(".radarArea")
				.transition().duration(200)
				.style("fill-opacity", cfg.opacityArea);
		});
		
	//Create the outlines	
	blobWrapper.append("path")
		.attr("class", "radarStroke")
		.attr("d", function(d,i) { return radarLine(d); })
		.style("stroke-width", cfg.strokeWidth + "px")
		.style("stroke", function(d,i) { return cfg.color(i); })
		.style("fill", "none")
		.style("filter" , "url(#glow)");		
	
	//Append the circles
	blobWrapper.selectAll(".radarCircle")
		.data(function(d,i) { return d; })
		.enter().append("circle")
		.attr("class", "radarCircle")
		.attr("r", cfg.dotRadius)
		.attr("cx", function(d,i){ return rScale(d.value) * Math.cos(angleSlice*i - Math.PI/2); })
		.attr("cy", function(d,i){ return rScale(d.value) * Math.sin(angleSlice*i - Math.PI/2); })
		.style("fill", function(d,i,j) { return cfg.color(j); })
		.style("fill-opacity", 0.8);

	/////////////////////////////////////////////////////////
	//////// Append invisible circles for tooltip ///////////
	/////////////////////////////////////////////////////////
	
	//Wrapper for the invisible circles on top
	var blobCircleWrapper = g.selectAll(".radarCircleWrapper")
		.data(data)
		.enter().append("g")
		.attr("class", "radarCircleWrapper");
		
	//Append a set of invisible circles on top for the mouseover pop-up
	blobCircleWrapper.selectAll(".radarInvisibleCircle")
		.data(function(d,i) { return d; })
		.enter().append("circle")
		.attr("class", "radarInvisibleCircle")
		.attr("r", cfg.dotRadius*1.5)
		.attr("cx", function(d,i){ return rScale(d.value) * Math.cos(angleSlice*i - Math.PI/2); })
		.attr("cy", function(d,i){ return rScale(d.value) * Math.sin(angleSlice*i - Math.PI/2); })
		.style("fill", "none")
		.style("pointer-events", "all")
		.on("mouseover", function(d,i) {
			newX =  parseFloat(d3.select(this).attr('cx')) - 10;
			newY =  parseFloat(d3.select(this).attr('cy')) - 10;
			
			// Tooltip to show value on circle mouseover
			tooltip
				.attr('x', newX)
				.attr('y', newY)
				.text(Format(d.value))
				.transition().duration(200)
				.style('opacity', 1);
		})
		.on("mouseout", function(){
			tooltip.transition().duration(200)
				.style("opacity", 0);
		});
		
	//Set up the small tooltip for when you hover over a circle
	var tooltip = g.append("text")
		.attr("class", "tooltip")
		.style("opacity", 0);
	
	/////////////////////////////////////////////////////////
	/////////////////// Helper Function /////////////////////
	/////////////////////////////////////////////////////////

	//Taken from http://bl.ocks.org/mbostock/7555321
	//Wraps SVG text	
	function wrap(text, width) {
	  text.each(function() {
		var text = d3.select(this),
			words = text.text().split(/\s+/).reverse(),
			word,
			line = [],
			lineNumber = 0,
			lineHeight = 1.4, // ems
			y = text.attr("y"),
			x = text.attr("x"),
			dy = parseFloat(text.attr("dy")),
			tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");
			
		while (word = words.pop()) {
		  line.push(word);
		  tspan.text(line.join(" "));
		  if (tspan.node().getComputedTextLength() > width) {
			line.pop();
			tspan.text(line.join(" "));
			line = [word];
			tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
		  }
		}
	  });
	}//wrap	

		// on mouseover for the legend symbol
	function cellover(d) {
			// keep mouse cursor arrow instead of text select (auto)
			$("#"+id).css('cursor','pointer');
			
			// Tooltip to display dimension of radar area on hovering over blob
			tooltip
				.attr('x', 50)
				.attr('y', 50)
				.text(data[d][0].radar_area_name)
				.transition().duration(200)
				.style('opacity', 1);
			
			//Dim all blobs
			d3.selectAll(".radarArea")
				.transition().duration(200)
				.style("fill-opacity", 0.0); 
			//Bring back the hovered over blob
			d3.select("." + data[d][0][areaName].replace(/\s+/g, ''))
				.transition().duration(200)
				.style("fill-opacity", 0.7);	
	}

	// on mouseout for the legend symbol
	function cellout() {
	
		tooltip.transition().duration(200)
			.style("opacity", 0);	
	
		//Bring back all blobs
		$("#"+id).css('cursor','default');
		d3.selectAll(".radarArea")
			.transition().duration(200)
			.style("fill-opacity", cfg.opacityArea);
	}

	/////////////////////////////////////////////////////////
	/////////////////// Draw the Legend /////////////////////
	/////////////////////////////////////////////////////////

	svg.append("g")
  	.attr("class", "legendOrdinal")
  	.attr("transform", "translate(" + cfg["legendPosition"]["x"] + "," + cfg["legendPosition"]["y"] + ")");

	var legendOrdinal = d3.legend.color()
	//d3 symbol creates a path-string, for example
	//"M0,-8.059274488676564L9.306048591020996,
	//8.059274488676564 -9.306048591020996,8.059274488676564Z"
  	.shape("path", d3.svg.symbol().type("circle").size(150)())
  	.shapePadding(10)
  	.scale(cfg.color)
  	.labels(cfg.color.domain().map(function(d){
  		return data[d][0][areaName];
  	}))
  	.on("cellover", function(d){ cellover(d); })
  	.on("cellout", function(d) { cellout(); });

svg.select(".legendOrdinal")
  .call(legendOrdinal);
	
}//RadarChart
