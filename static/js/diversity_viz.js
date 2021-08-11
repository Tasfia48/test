class diversityViz {
	/*
	class constructor.
	1. Accepts 'data' in the Object format
	for the selected 'feature_vars'.
	2. Formats the data to a nested form using d3.rollup.
	3. Initializes the SVG.
	*/
	constructor(data,feature_vars,inverse=false){
		this.data = data;
		this.feature_vars = feature_vars;

		this.nested_data;
		this.create_nested_data(inverse) //create the nested data format

		$("#heatmap").empty()
		this.margin = {top: 10, right: 10, bottom: 100, left: 20};
  		this.width = $("#heatmap").parent().width() - this.margin.left - this.margin.right;
  		this.height = $("#heatmap").height() - this.margin.top - this.margin.bottom;

		// main svg
		this.svg = d3.select("#heatmap")
		.append("svg")
		  .attr("class","main_svg")
		  .attr("width", this.width + this.margin.left + this.margin.right)
		  .attr("height", this.height + this.margin.top + this.margin.bottom)
		.append("g")
		  .attr("transform",
		        "translate(" + this.margin.left + "," + this.margin.top + ")");

		$("#heatmap").append('<hr>')

		this.root;

	}

	/*
	create the nested data format for d3.hierarchy
	if inverse = True, the data is sorted by 1/count
	This is a way to bring out the cells with smaller counts.
	*/
	create_nested_data(inverse=false){
		const maps = this.feature_vars.map(fv => function(d) {return d[fv]});
		if(inverse)
			this.nested_data = d3.rollup(this.data, v => 1/(v.length), ...maps)
		else
			this.nested_data = d3.rollup(this.data, v => v.length, ...maps)
	}

	/*
	draws a treemap in the main SVG.
	the 'this' variable is saved in the 'self' variable
	for avoiding a conflict with d3.
	*/
	draw_treemap(){
		var self = this;
		self.svg.selectAll("*").remove()

		self.root =  d3.treemap()
			    .tile(d3.treemapBinary)
			    .size([self.width, self.height])
			    .padding(1)
			    .round(true)
			  (d3.hierarchy(self.nested_data)
			      	.sum(([, value]) => value)
                    .sort((a, b) => b.value - a.value))


		const leaf = self.svg.selectAll("g")
					    .data(self.root.leaves())
					    .join("g")
					      .attr("transform", d => `translate(${d.x0},${d.y0})`);

		console.log(self.root.leaves())

		leaf
			.append("title")
      		.text(d => `${d.ancestors().reverse().map(d => d.data[0]).join("/")}\n${d.value}`);

		leaf.append("rect")
			  .attr("class","cell")
		      .attr("id", d => (d.leafUid = DOM.uid("leaf")).id)
		      .attr("fill", "steelblue" )
		      .attr("fill-opacity", 0.6)
		      .attr("width", d => d.x1 - d.x0)
		      .attr("height", d => d.y1 - d.y0);

	    leaf.append("clipPath")
		      .attr("id", d => (d.clipUid = DOM.uid("clip")).id)
		    .append("use")
		      .attr("xlink:href", d => d.leafUid.href);

		leaf
			.filter(function(d) { return (((d.x1 - d.x0) > 50) && ((d.y1 - d.y0) > 20)) })
			.append("text")
		      .attr("clip-path", d => d.clipUid)
		    .selectAll("tspan")
		    .data(d => d.data[0].split(/(?=[A-Z][a-z])|\s+/g).concat(d.value))
		    .join("tspan")
		    // .filter(function(d) { return (((d.x1 - d.x0) < 50) && ((d.y1 - d.y0) < 20)) })
		      .attr("x", 3)
		      .attr("y", (d, i, nodes) => `${(i === nodes.length - 1) * 0.3 + 1.1 + i * 0.9}em`)
		      .attr("fill-opacity", (d, i, nodes) => i === nodes.length - 1 ? 0.7 : null)
      	.text(d => d);
		    
	};

	/*
	Three function that change the tooltip 
	when a user hover / move / leave a cell
	Not implemented yet.
	*/
	mouseover(e,d,self) {}
	mousemove(e,d,self) {}
	mouseleave(e,d,self) {}
}