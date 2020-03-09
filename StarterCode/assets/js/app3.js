var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";
var chosenyAxis = "healthcare";


// function used for updating x-scale var upon click on axis label
function xScale(healthData, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(healthData, d => d[chosenXAxis]) * 0.8,
      d3.max(healthData, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);

  return xLinearScale;

}

function yScale(healthData, chosenyAxis) {
    // create scales
    var yLinearScale = d3.scaleLinear()
      .domain([0,d3.max(healthData, d => d[chosenyAxis])])
      .range([height, 0]);
  
    return yLinearScale;
  
  }

// function used for updating xAxis var upon click on axis label
function renderAxesx(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);
  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);
  return xAxis;
}

function renderAxesy(newyScale, yAxis) {
    var leftAxis = d3.axisLeft(newyScale);
  
    yAxis.transition()
      .duration(1000)
      .call(leftAxis);
  
    return yAxis;
  }

// function used for updating circles group with a transition to
// new circles
function renderCirclesx(circlesGroupc, newXScale, chosenXAxis) {

  circlesGroupc.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]));

  return circlesGroupc;
}

function renderCirclesy(circlesGroupc, newyScale, chosenyAxis) {
    circlesGroupc.transition()
      .duration(1000)
      .attr("cy", d => newyScale(d[chosenyAxis]));
  
    return circlesGroupc;
  }

  function renderTextX(circlesText, newXScale, chosenXAxis) {
    circlesText.transition()
    .duration(1000)
    .attr("dx", d => newXScale(d[chosenXAxis]))
  
    return circlesText;
  }
  
  function renderTextY(circlesText, newyScale, chosenyAxis) {
    circlesText.transition()
    .duration(1000)
    .attr("dy", d => newyScale(d[chosenyAxis]))
    
    return circlesText;
  }

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis,chosenyAxis,circlesGroupc) {

    if (chosenXAxis === "poverty") {
      var xlabel = "In Poverty (%)";
      }
    else if (chosenXAxis === "age") {
      var xlabel = "Age (Median)";
      }
    else {
      var xlabel = "Household Income (Median)";
      }
    
    if (chosenyAxis === "healthcare") {
      var ylabel = "Lacks Health Care (%)";
      }
    else if (chosenyAxis === "smokes") {
      var ylabel = "Smokes (%)";
      }
    else {
      var ylabel = "Obesity (%)";
    }

    var toolTip = d3.tip()
      .attr("class", "d3-tip")
      .offset([100, -80])
      .html(function(d) {
      return (`${d.state}<br>${xlabel}: ${d[chosenXAxis]}<br>${ylabel}: ${d[chosenyAxis]}`);
    });

circlesGroupc.call(toolTip);

    circlesGroupc.on("mouseover", function(data) {
    toolTip.show(data);
  })
    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

  return circlesGroupc;
};

// Retrieve data from the CSV file and execute everything below
d3.csv("../assets/data/data.csv").then(function(healthData, err) {
  if (err) throw err;

  // parse data
  healthData.forEach(function(data) {
    data.healthcare = +data.healthcare;
    data.poverty = +data.poverty;
    data.smokes = +data.smokes;
    data.age = +data.age;
    data.obesity = +data.obesity;
    data.income = +data.income;
  });

  // xLinearScale function above csv import
  var xLinearScale = xScale(healthData, chosenXAxis);

  var yLinearScale = yScale(healthData, chosenyAxis);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  var yAxis= chartGroup.append("g")
    .call(leftAxis);

  // append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(healthData)
    .enter()
    .append("g")
    var circlesGroupc = circlesGroup.append("circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenyAxis]))
        .attr("r", 20)
        .attr("fill", "lightblue")
        .attr("opacity", ".5");
    // append circle text?
    var circlesText = circlesGroup.append("text")
    .classed("stateText", true)
    .attr("dx", d => xLinearScale(d[chosenXAxis]))
    .attr("dy", d => yLinearScale(d[chosenyAxis]))
    .text(d => d.abbr);

  // Create group for  3 x- axis labels
  var labelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);
    var labelsGroupY = chartGroup.append("g");

  var povertylabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .text("In Poverty");

  var agelabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age") // value to grab for event listener
    .classed("inactive", true)
    .text("AGE");
 var incomelabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "income") // value to grab for event listener
    .classed("inactive", true)
    .text("Household");
  // append y axis
  var healthlabel = labelsGroupY.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - (margin.left - 40))
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .attr("value", "healthcare")
    .classed("axis-text", true)
    .classed("active",true)
    .text("Lacks Healthcare (%)");

 var smokelabel = labelsGroupY.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - (margin.left - 20))
    .attr("x", 0 - (height/2))
    .attr("dy", "1em")
    .attr("value", "smokes")
    .classed("axis-text", true)
    .classed("inactive", true)
    .text("Smokes (%)");

 var obesitylabel = labelsGroupY.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height/2))
    .attr("dy", "1em")
    .attr("value", "obesity")
    .classed("axis-text", true)
    .classed("inactive", true)
    .text("Obese (%)");

  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenXAxis, chosenyAxis, circlesGroupc);

  // x axis labels event listener
  labelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = value;

        console.log(chosenXAxis)

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(healthData, chosenXAxis);

        // updates x axis with transition
        xAxis = renderAxesx(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup = renderCirclesx(circlesGroupc, xLinearScale, chosenXAxis);

        circlesText = renderTextX(circlesText, xLinearScale, chosenXAxis);

        // updates tooltips with new info
        // circlestext = updateToolTip(chosenXAxis, circlesGroupc);

        circlesGroup = updateToolTip(chosenXAxis, chosenyAxis, circlesGroupc);

        // changes classes to change bold text
        if (chosenXAxis === "poverty") {
            povertylabel
              .classed("active", true)
              .classed("inactive", false);
            agelabel
              .classed("active", false)
              .classed("inactive", true);
            incomelabel
            .classed("active", false)
            .classed("inactive", true);
          }
          else if (chosenXAxis === "age") {
            povertylabel
              .classed("active", false)
              .classed("inactive", true);
            agelabel
              .classed("active", true)
              .classed("inactive", false);
            incomelabel
            .classed("active", false)
            .classed("inactive", true);
          }
          else {
            povertylabel
              .classed("active", false)
              .classed("inactive", true);
            agelabel
              .classed("active", false)
              .classed("inactive", true);
            incomelabel
            .classed("active", true)
            .classed("inactive", false);
          }
          if (chosenyAxis === "healthcare") {
            smokelabel
              .classed("active", false)
              .classed("inactive", true);
            healthlabel
              .classed("active", true)
              .classed("inactive", false);
            obesitylabel
            .classed("active", false)
            .classed("inactive", true);
          }
          else if (chosenyAxis === "smokes") {
            healthlabel
              .classed("active", false)
              .classed("inactive", true);
            smokelabel
              .classed("active", true)
              .classed("inactive", false);
            obesitylabel
            .classed("active", false)
            .classed("inactive", true);
          }
          else {
            healthlabel
            .classed("active", false)
            .classed("inactive", true);
            smokelabel
            .classed("active", false)
            .classed("inactive", true);
            obesitylabel
            .classed("active", true)
            .classed("inactive", false);
          }
        }
      });
      labelsGroupY.selectAll("text")
      .on("click", function() {
        // get value of selection
        var value = d3.select(this).attr("value");
        if (value !== chosenyAxis) {
  
          // replaces chosenXAxis with value
          chosenyAxis = value;
  
          console.log(chosenyAxis)
  
          yLinearScale = yScale(healthData, chosenyAxis);
  
          // updates x axis with transition
     
          yAxis = renderAxesy(yLinearScale, yAxis);
  
        
          circlesGroup = renderCirclesy(circlesGroupc, yLinearScale, chosenyAxis);
  
          //updates text movement
          circlesText = renderTextY(circlesText, yLinearScale, chosenyAxis);
  
          // updates tooltips with new info
          circlesGroup = updateToolTip(chosenXAxis, chosenyAxis, circlesGroupc);
  
          // changes classes to change bold text
          if (chosenXAxis === "poverty") {
            povertylabel
              .classed("active", true)
              .classed("inactive", false);
            agelabel
              .classed("active", false)
              .classed("inactive", true);
            incomelabel
            .classed("active", false)
            .classed("inactive", true);
          }
          else if (chosenXAxis === "age") {
            povertylabel
              .classed("active", false)
              .classed("inactive", true);
            agelabel
              .classed("active", true)
              .classed("inactive", false);
            incomelabel
            .classed("active", false)
            .classed("inactive", true);
          }
          else {
            povertylabel
              .classed("active", false)
              .classed("inactive", true);
            agelabel
              .classed("active", false)
              .classed("inactive", true);
            incomelabel
            .classed("active", true)
            .classed("inactive", false);
          }
          if (chosenyAxis === "healthcare") {
            smokelabel
              .classed("active", false)
              .classed("inactive", true);
            healthlabel
              .classed("active", true)
              .classed("inactive", false);
            obesityLabel
            .classed("active", false)
            .classed("inactive", true);
          }
          else if (chosenyAxis === "smokes") {
            healthlabel
              .classed("active", false)
              .classed("inactive", true);
            smokelabel
              .classed("active", true)
              .classed("inactive", false);
            obesitylabel
            .classed("active", false)
            .classed("inactive", true);
          }
          else {
            healthlabel
            .classed("active", false)
            .classed("inactive", true);
            smokelabel
            .classed("active", false)
            .classed("inactive", true);
            obesitylabel
            .classed("active", true)
            .classed("inactive", false);
          }
        }
      });
  }).catch(function(error) {
    console.log(error);
  });