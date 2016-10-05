////////////////////////////////////////////////////////////
/////////////// The Radar Chart Function ///////////////////
////////////////// Written by Nadieh Bremer ////////////////
///////////////////// VisualCinnamon.com ///////////////////
////////////// Inspired by the code of alangrafu ///////////
// Adapted to Qlik Sense by Brian Booden & Matthieu Burel //
////////////////////////////////////////////////////////////
	
function displayRADAR(id, options, $element, layout, data, self) {
	var cfg = {
		size: {width: 450, height: 450},											//Width and Height of the circle
		margin: {top: 100, right: 100, bottom: 100, left: 100}, 					//The margins around the circle
		legendPosition: {x: 20, y: 20}, 											//The position of the legend, from the top-left corner of the svg
		color: d3.scale.category10(),												//Color function
		colorOpacity: {circle: 0.1, area_low: 0.1, area_med: 0.1, area_high:0.6},	//The opacity of the area of the blob
		roundStrokes: false,														//If true the area and stroke will follow a round path (cardinal-closed)
		maxValue: 1, 																//What is the value that the biggest circle will represent
		levels: 5,																	//How many levels or inner circles should there be drawn
		dotRadius: 4, 																//The size of the colored circles of each blob
		labelFactor: 1.25, 															//How much farther than the radius of the outer circle should the labels be placed
		wrapWidth: 100, 															//The number of pixels after which a label needs to be given a new line
		strokeWidth: 1.5, 															//The width of the stroke around each blob
		sortingCheck: [true],														//The sorting configuration
		legendDisplay: true															//Display the legend
	};

	//Convert the nested data passed in
	//into an array of values arrays
	var data = data.map(function(d) { return d.definition });

	//Put all of the options into a variable called cfg
	if('undefined' !== typeof options){
	  for(var i in options){
		if('undefined' !== typeof options[i]){ cfg[i] = options[i]; }
	  }//for i
	}//if
		
	//If the supplied maxValue is smaller than the actual one, replace by the max in the data
	var maxValue = Math.max(cfg.maxValue, d3.max(data, function(i){return d3.max(i.map(function(o){return o.value;}))}));

	if(cfg.size.width < cfg.size.height) {var graphH = cfg.size.width; var graphW = cfg.size.width} else {var graphH = cfg.size.height; var graphW = cfg.size.height; }
	
	var allAxis = (data[0].map(function(i, j){return i.axis})),				//Names of each axis
		total = allAxis.length,												//The number of different axes
		radius = Math.min(
			(graphW/2) - cfg.margin.left - cfg.margin.right,
			(graphH/2) - cfg.margin.top - cfg.margin.bottom), 				//Radius of the outermost circle
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
			
	// Chart object width  
   var width = cfg.size.width - cfg.margin.left - cfg.margin.right;  

   // Chart object height  
   var height = cfg.size.height - cfg.margin.top - cfg.margin.bottom; 

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
   var svg = d3.select("#" + id).append("svg")  
		.attr("width", cfg.size.width)  
		.attr("height", cfg.size.height);
			
	//Append a g element		
	var g = svg.append("g")
			.attr("transform", "translate(" + (cfg.size.width/2) + "," + (cfg.size.height/2) + ")");
			
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
		.style("fill-opacity", cfg.colorOpacity.circle)
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
	   .text(function(d,i) { return format(options.numberFormat[0], (maxValue * d/cfg.levels)*options.numberFormat[1]) + options.numberFormat[2]; });

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
		.style("font-size", "11.5px")
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
			return "radarArea" + " " + d[0].radar_area.replace(/\s+/g, '') //Remove spaces from the .radar_area string to make one valid class name
		})
		.attr("d", function(d,i) { return radarLine(d); })
		.style("fill", function(d,i) { return cfg.color(i); })
		.style("fill-opacity", cfg.colorOpacity.area)
		.on('mouseover', function (d,i){		
			// Make cursor pointer when hovering over blob
			$("#"+id).css('cursor','pointer');
			
			//Dim all blobs
			d3.selectAll(".radarArea")
				.transition().duration(200)
				.style("fill-opacity", cfg.colorOpacity.area_out); 
			//Bring back the hovered over blob
			d3.select(this)
				.transition().duration(200)
				.style("fill-opacity", cfg.colorOpacity.area_over);	
		})
		.on('click', function (d){
			// Select Value
			self.backendApi.selectValues(0, [d[0].radar_area_id], true);	
		})
		.on('mouseout', function(){
						
			// keep mouse cursor arrow instead of text select (auto)
			$("#"+id).css('cursor','default');
	
			//Bring back all blobs
			d3.selectAll(".radarArea")
				.transition().duration(200)
				.style("fill-opacity", cfg.colorOpacity.area);
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
				.text(d.radar_area + " : " + format(options.numberFormat[0], d.value*options.numberFormat[1]) + options.numberFormat[2])
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
			lineHeight = 1.1, // ems
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
		$("#"+id).css('cursor','pointer');
		
		//Dim all blobs
		d3.selectAll(".radarArea")
			.transition().duration(200)
			.style("fill-opacity", cfg.colorOpacity.area_out); 

			//Bring back the hovered over blob
		d3.select("." + data[d][0].radar_area.replace(/\s+/g, ''))
			.transition().duration(200)
			.style("fill-opacity", cfg.colorOpacity.area_over);	
	}

	// on mouseclick for the legend symbol
	function cellclick(d,i) {
		$("#"+id).css('cursor','default');
		
		//Bring back all blobs
		d3.selectAll(".radarArea")
			.transition().duration(200)
			.style("fill-opacity", 0.9);
			
		// Select Value
		self.backendApi.selectValues(0, [data[d][0].radar_area_id], true);		
	}
	
	// on mouseout for the legend symbol
	function cellout() {
		$("#"+id).css('cursor','default');
		
		//Bring back all blobs
		d3.selectAll(".radarArea")
			.transition().duration(200)
			.style("fill-opacity", cfg.colorOpacity.area);
	}

	/////////////////////////////////////////////////////////
	/////////////////// Draw the Legend /////////////////////
	/////////////////////////////////////////////////////////

	svg.append("g")
		.attr("class", "legendOrdinal")
		.attr("transform", "translate(" + cfg["legendPosition"]["x"] + "," + cfg["legendPosition"]["y"] + ")");

	var legendOrdinal = d3.legend.color()
		.shape("path", d3.svg.symbol().type("circle").size(40)())
		.shapePadding(10)
		.scale(cfg.color)
		.labels(cfg.color.domain().map(function(d,i){
			return data[d][0].radar_area
//			return data[d][0].radar_area + " - " + data[d][0].radar_area_id;
		}))
		.on("cellover", function(d){ cellover(d); })
		.on("cellclick", function (d){ cellclick(d); })
		.on("cellout", function(d){ cellout(); });

	if((layout.qHyperCube.qDimensionInfo.length !== 1) && (cfg.legendDisplay == true)){
		svg.select(".legendOrdinal")
		  .call(legendOrdinal);
	}

	/*
		IntegraXor Web SCADA - JavaScript Number Formatter
		http://www.integraxor.com/
		author: KPL, KHL
		(c)2011 ecava
		Dual licensed under the MIT or GPL Version 2 licenses.
	*/
	
	function format( m, v){ 
		if (!m || isNaN(+v)) {
			return v; //return as it is.
		}
		//convert any string to number according to formation sign.
		var v = m.charAt(0) == '-'? -v: +v;
		var isNegative = v<0? v= -v: 0; //process only abs(), and turn on flag.
		
		//search for separator for grp & decimal, anything not digit, not +/- sign, not #.
		var result = m.match(/[^\d\-\+#]/g);
		var Decimal = (result && result[result.length-1]) || '.'; //treat the right most symbol as decimal 
		var Group = (result && result[1] && result[0]) || ',';  //treat the left most symbol as group separator
		
		//split the decimal for the format string if any.
		var m = m.split( Decimal);
		//Fix the decimal first, toFixed will auto fill trailing zero.
		v = v.toFixed( m[1] && m[1].length);
		v = +(v) + ''; //convert number to string to trim off *all* trailing decimal zero(es)

		//fill back any trailing zero according to format
		var pos_trail_zero = m[1] && m[1].lastIndexOf('0'); //look for last zero in format
		var part = v.split('.');
		//integer will get !part[1]
		if (!part[1] || part[1] && part[1].length <= pos_trail_zero) {
			v = (+v).toFixed( pos_trail_zero+1);
		}
		var szSep = m[0].split( Group); //look for separator
		m[0] = szSep.join(''); //join back without separator for counting the pos of any leading 0.

		var pos_lead_zero = m[0] && m[0].indexOf('0');
		if (pos_lead_zero > -1 ) {
			while (part[0].length < (m[0].length - pos_lead_zero)) {
				part[0] = '0' + part[0];
			}
		}
		else if (+part[0] == 0){
			part[0] = '';
		}
		
		v = v.split('.');
		v[0] = part[0];
		
		//process the first group separator from decimal (.) only, the rest ignore.
		//get the length of the last slice of split result.
		var pos_separator = ( szSep[1] && szSep[ szSep.length-1].length);
		if (pos_separator) {
			var integer = v[0];
			var str = '';
			var offset = integer.length % pos_separator;
			for (var i=0, l=integer.length; i<l; i++) { 
				
				str += integer.charAt(i); //ie6 only support charAt for sz.
				//-pos_separator so that won't trail separator on full length
				if (!((i-offset+1)%pos_separator) && i<l-pos_separator ) {
					str += Group;
				}
			}
			v[0] = str;
		}

		v[1] = (m[1] && v[1])? Decimal+v[1] : "";
		return (isNegative?'-':'') + v[0] + v[1]; //put back any negation and combine integer and fraction.
	};
	
}//RadarChart
