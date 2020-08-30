// @TODO: YOUR CODE HERE!
// The code for the chart is wrapped inside a function
// that automatically resizes the page

// Initial Plot settings
var chosenXAxis = "poverty";      // define exact variable from csv to avoid further mapping
var chosenYAxis = "healthcare";
var xSuffix = '%';
var ySuffix = '%';

function makeResponsive() {

  // if the SVG area isn't empty when the browser loads, remove it
  // and replace it with a resized version of the chart
  var svgArea = d3.select("body").select("svg");
  if (!svgArea.empty()) {
    // retain old values before remvoing svgArea
    const prexaxis = chosenXAxis;
    const preyaxis = chosenYAxis;
    const prexsuffix = xSuffix;
    const preysuffix = ySuffix;
    svgArea.remove();
    chosenXAxis = prexaxis;
    chosenYAxis = preyaxis;
    xSuffix = prexsuffix;
    ySuffix = preysuffix;
  }
  
  // update footer year
  var footer = d3.select("#footer").select("p");
  var newFooter = footer.text().replace("2016", "2020");
  d3.select("#footer").select("p").text(newFooter);

  // SVG wrapper dimensions are determined by the current width
  // and height of the browser window.
  var svgWidth = window.innerWidth;
  var svgHeight = window.innerHeight;

  var margin = {
      top: 20,
      right: 240,
      bottom: 120,
      left: 100
  };

  var chartWidth = svgWidth - margin.left - margin.right;
  var chartHeight = svgHeight - margin.top - margin.bottom;

  // Create an SVG wrapper, append an SVG group that will hold our chart,
  // and shift the latter by left and top margins.
  var svg = d3
  .select("#scatter")
  .append("svg")
  .classed("chart", true)
  .attr("width", svgWidth)
  .attr("height", svgHeight);

  // add rectangle frame
  var rect = svg.append("rect")
    .classed("iframeContainer", true)
    .attr("width", chartWidth+140)
    .attr("height", svgHeight)
    // .attr("padding", '20px')
    // .attr("border", "2px")
    .attr("fill", "#fafafa")
    .attr("stroke", "#e3e3e3")
  ;

  // Append an SVG group
  var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`)
  ;

  // function used for updating x-scale var upon click on axis label
  function xScale(inputData, chosenXAxis) {
    // create scales
    var maxVal = Math.round(Math.ceil(d3.max(inputData, d => d[chosenXAxis]))/2) * 2
    var maxInc = 0;
    if (maxVal > 50000) {
      maxInc = 75000-maxVal;
    }

    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(inputData, d => d[chosenXAxis]) * 0.9,
        Math.round(Math.ceil(d3.max(inputData, d => d[chosenXAxis]))/2) * 2 + maxInc
      ])
      .range([0, chartWidth]);

    return xLinearScale;
  }

  // function used for updating xAxis var upon click on axis label
  function renderXAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
      .duration(500)
      .call(bottomAxis);

    return xAxis;
  }

  // function used for updating y-scale var upon click on axis label
  function yScale(inputData, chosenYAxis) {
      // create scales
      var yLinearScale = d3.scaleLinear()
      // .domain(d3.extent(inputData, d => d[chosenYAxis]))
        .domain([d3.min(inputData, d => d[chosenYAxis]) - 0.3,
        d3.max(inputData, d => d[chosenYAxis]) + 2
        ])
        .range([chartHeight, 0]);

      // console.log(yLinearScale);
      // console.log(chosenYAxis, d3.max(inputData, d => d[chosenYAxis]));
      return yLinearScale;
  }
    
  // function used for updating yAxis var upon click on axis label
  function renderYAxes(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);

  yAxis.transition()
      .duration(500)
      .call(leftAxis);

  return yAxis;
  }

  // function used for updating circles group with a transition to
  // new circles
  function renderCircles(circlesGroup, cval, newScale, chosenAxis) {

      circlesGroup.transition()
        .duration(1000)
        .attr(cval, d => newScale(d[chosenAxis]));
    
      return circlesGroup;
  }

  // function to update text transition
  function renderCirclesText(circleTextGroup, pos, newScale, chosenAxis) {
    circleTextGroup.transition()
      .duration(1000)
      .attr(pos, d => newScale(d[chosenAxis]));
    
    return circleTextGroup;
  }

  // function used for updating circles group with new tooltip
  function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {
    var yLabel;
    var xLabel;

    switch (chosenXAxis) {
      case "poverty":
        xLabel = 'Poverty: ';
        break;
      case "age":
        xLabel = 'Age: ';
        break;
      case "income":
        xLabel = 'Income: ';
        break;
    }
    switch (chosenYAxis) {
      case "healthcare":
        yLabel = 'Healthcare: ';
        break;
      case "smokes":
        yLabel = 'Smokes: ';
        break;
      case "obesity":
        yLabel = 'Obese: ';
        break;
    }

    var toolTip = d3.tip()
      .attr("class", "d3-tip")
      .offset([80, -60])
      .html(function(d) {
        return(`${d.state}<br>${xLabel}${d[chosenXAxis]}${xSuffix}<br>${yLabel}${d[chosenYAxis]}${ySuffix}`);
      });

    circlesGroup.call(toolTip);

    circlesGroup.on("mouseover", function(data) {
      toolTip.show(data);
    })
    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });
    
    return circlesGroup;
  }

  // Retrieve data from the CSV file and execute everything below
  d3.csv("assets/data/data.csv").then(function(healthData, err) {
    if (err) throw err;
      
    // console.log(healthData);

    // parse data
    healthData.forEach(function(data) {
      data.poverty = +data.poverty;
      data.healthcare = +data.healthcare;
      data.age = +data.age;
      data.smokes = +data.smokes;
      data.income = +data.income;
      data.obesity = +data.obesity;
    });

    // xLinearScale function above csv import
    var xLinearScale = xScale(healthData, chosenXAxis);

    // yLinearScale function above csv import
    var yLinearScale = yScale(healthData, chosenYAxis);
    // console.log(yLinearScale);
    // console.log(xLinearScale.ticks());

    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);
    // console.log("ticks:", bottomAxis.ticks());
    
    // append x axis
    var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${chartHeight})`)
    .call(bottomAxis);

    // append y axis
    var yAxis = chartGroup.append("g")
    .classed("y-axis", true)
    .call(leftAxis);

    // append initial circles      
    var circlesGroup = chartGroup.selectAll("circle")
      .data(healthData)
      .enter()
      .append("circle")
      .classed("stateCircle", true)
      .attr("cx", d => xLinearScale(d[chosenXAxis]))
      .attr("cy", d => yLinearScale(d[chosenYAxis]))
      .attr("r", 10)
      // .text(function(d, i) { console.log(d.abbr, i); return d.abbr })
      // .attr("fill", "#129599")
      // .attr("opacity", ".8")
    ;

    var circleTextGroup = chartGroup.selectAll("Text1")
      .data(healthData)
      .enter()
      .append("text")
      .classed("stateText", true)
      .attr("x", d => xLinearScale(d[chosenXAxis]))
      .attr("y", d => yLinearScale(d[chosenYAxis]))
      .attr("text-anchor", "middle")
      .attr("font-family", "sans-serif")
      .attr("font-weight", 800)
      .style("font-size", 8)
      .attr("dy", ".35em")
      // .text(function(d, i) { console.log(d.abbr, i); return d.abbr })
      .text(d => d.abbr)
    ;

    // Create group for three x-axis labels
    var xlabelsGroup = chartGroup.append("g")
    // .classed("x-axisLables", true)
    .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + 20})`);

    // added this condition to highlight correct axis label when you resize the screen
    var flg = "inactive";
    if (chosenXAxis == "poverty") {
      flg = "active";
    }
    var povertyLabel = xlabelsGroup.append("text")
    .classed("aText", true)
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed(flg, true)
    .text("In Poverty (%)");

    flg = "inactive";
    if (chosenXAxis == "age") {
      flg = "active";
    }
    var ageLabel = xlabelsGroup.append("text")
    .classed("aText", true)
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age") // value to grab for event listener
    .classed(flg, true)
    .text("Age (Median)");

    flg = "inactive";
    if (chosenXAxis == "income") {
      flg = "active";
    }
    var incomeLabel = xlabelsGroup.append("text")
    .classed("aText", true)
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "income") // value to grab for event listener
    .classed(flg, true)
    .text("Household Income (Median)");

    // Create group for three y-axis labels
    var ylabelsGroup = chartGroup.append("g")
    // .classed("y-axisLables", true);

    flg = "inactive";
    if (chosenYAxis == "healthcare") {
      flg = "active";
    }
    var healthLabel = ylabelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .classed("aText", true)
    .attr("y", 40 - margin.left)
    .attr("x", 0 - (chartHeight / 2))
    .attr("value", "healthcare") // value to grab for event listener
    .attr("dy", "1em")
    .classed(flg, true)
    .text("Lacks Healthcare (%)");

    flg = "inactive";
    if (chosenYAxis == "smokes") {
      flg = "active";
    }
    var smokeLabel = ylabelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .classed("aText", true)
    .attr("y", 20 - margin.left)
    .attr("x", 0 - (chartHeight / 2))
    .attr("value", "smokes") // value to grab for event listener
    .attr("dy", "1em")
    .classed(flg, true)
    .text("Smokes (%)");

    flg = "inactive";
    if (chosenYAxis == "obesity") {
      flg = "active";
    }
    var obeseLabel = ylabelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .classed("aText", true)
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (chartHeight / 2))
    .attr("value", "obesity") // value to grab for event listener
    .attr("dy", "1em")
    .classed(flg, true)
    .text("Obese (%)");

    // updateToolTip function above csv import
    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

    // x axis labels event listener
    xlabelsGroup.selectAll("text")
      .on("click", function() {
        // get value of selection
        var xValue = d3.select(this).attr("value");
        // console.log("Old Value/New Value:", chosenXAxis, xValue);
        if (xValue !== chosenXAxis) {

          // replaces chosenXAxis with value
          chosenXAxis = xValue;

          // functions here found above csv import
          // updates x scale for new data
          xLinearScale = xScale(healthData, chosenXAxis);
          var ticks = xLinearScale.ticks();
          // console.log("Changed Ticks: ", ticks);

          // updates x axis with transition
          xAxis = renderXAxes(xLinearScale, xAxis);

          // updates circles with new x values
          var cval = "cx";
          // console.log(cxval);
          circlesGroup = renderCircles(circlesGroup, cval, xLinearScale, chosenXAxis);

          // updates text position on the circles
          circleTextGroup = renderCirclesText(circleTextGroup, "x", xLinearScale, chosenXAxis);

          // updates tooltips with new info
          circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

          // changes classes to change bold text
          // console.log(chosenXAxis);
          switch (chosenXAxis) {
            case "age":
              xSuffix = ' (M)';
              ageLabel
                .classed("active", true)
                .classed("inactive", false);
              incomeLabel
                .classed("active", false)
                .classed("inactive", true);
              povertyLabel
                .classed("active", false)
                .classed("inactive", true);
              break;
            case "income":
              xSuffix = ' (M)';
              incomeLabel
                .classed("active", true)
                .classed("inactive", false);
              povertyLabel
                .classed("active", false)
                .classed("inactive", true);
              ageLabel
                .classed("active", false)
                .classed("inactive", true);
              break;
            case "poverty":
              xSuffix = '%';
              povertyLabel
                .classed("active", true)
                .classed("inactive", false);
              ageLabel
                .classed("active", false)
                .classed("inactive", true);
              incomeLabel
                .classed("active", false)
                .classed("inactive", true);
              break;
          }
        }
      }
    );

    // y axis labels event listener
    ylabelsGroup.selectAll("text")
      .on("click", function() {
        // get value of selection
        var yValue = d3.select(this).attr("value");
        console.log("chosen/old Value:", yValue, chosenYAxis);
        if (yValue !== chosenYAxis) {

          // replaces chosenXAxis with value
          chosenYAxis = yValue;

          // functions here found above csv import
          // updates y scale for new data
          yLinearScale = yScale(healthData, chosenYAxis);

          // updates y axis with transition
          yAxis = renderYAxes(yLinearScale, yAxis);

          // updates circles with new x values
          var cval = "cy";
          // console.log(cxval);
          circlesGroup = renderCircles(circlesGroup, cval, yLinearScale, chosenYAxis);

          // updates text position on the circles
          circleTextGroup = renderCirclesText(circleTextGroup, "y", yLinearScale, chosenYAxis);

          // updates tooltips with new info
          circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

          // changes classes to change bold text
          // console.log(chosenYAxis);
          ySuffix = '%';
          switch (chosenYAxis) {
            case "smokes":
              smokeLabel
                .classed("active", true)
                .classed("inactive", false);
              obeseLabel
                .classed("active", false)
                .classed("inactive", true);
              healthLabel
                .classed("active", false)
                .classed("inactive", true);
              break;
            case "obesity":
              obeseLabel
                .classed("active", true)
                .classed("inactive", false);
              healthLabel
                .classed("active", false)
                .classed("inactive", true);
              smokeLabel
                .classed("active", false)
                .classed("inactive", true);
              break;
            case "healthcare":
              healthLabel
                .classed("active", true)
                .classed("inactive", false);
              smokeLabel
                .classed("active", false)
                .classed("inactive", true);
              obeseLabel
                .classed("active", false)
                .classed("inactive", true);
              break;
          }
        }
      }
    );
  }).catch(function(error) {
    console.log(error);
  });
}

// When the browser loads, makeResponsive() is called.
makeResponsive();

// When the browser window is resized, responsify() is called.
d3.select(window).on("resize", makeResponsive);
