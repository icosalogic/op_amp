/*
 * Visualization code for the IcosaLogic Op Amp Simulator.
 */

icosalogic = {};
icosalogic.op_amp = {};
icosalogic.op_amp.isLoaded = false;
icosalogic.op_amp.curGraphName = 'WattVolt';
icosalogic.op_amp.curGraphDate = null;
icosalogic.op_amp.waitTimer = null;
icosalogic.op_amp.waitCount = 0;
icosalogic.op_amp.chart = null;
icosalogic.op_amp.dataTable = null;
icosalogic.op_amp.rawData = [];
icosalogic.op_amp.data = [];

// input values from the DOM
icosalogic.op_amp.circuit     = "inv";
icosalogic.op_amp.vpos        = 0.0;
icosalogic.op_amp.vneg        = 0.0;
icosalogic.op_amp.rfeedback   = 0;
icosalogic.op_amp.r1          = 0;
icosalogic.op_amp.vref        = 0.0;
icosalogic.op_amp.vin_rhalf   = 0.0;
icosalogic.op_amp.vin_range   = 0.0;
icosalogic.op_amp.vin_offset  = 0.0;
icosalogic.op_amp.vout_rhalf  = 0.0;
icosalogic.op_amp.vout_range  = 0.0;
icosalogic.op_amp.vout_offset = 0.0;
icosalogic.op_amp.vin         = 0.0;

// computed values
icosalogic.op_amp.gain        = 0.0;
icosalogic.op_amp.vout_raw    = 0.0;
icosalogic.op_amp.vout        = 0.0;
icosalogic.op_amp.ifeedback   = 0.0;
icosalogic.op_amp.rfb_power   = 0.0;
icosalogic.op_amp.r1_power    = 0.0;



icosalogic.op_amp.onLoadHandler = function() {
  console.log('icosalogic.op_amp.onLoadHandler: enter');

  icosalogic.op_amp.addHandlers();
  icosalogic.op_amp.showCircuit();
  // icosalogic.op_amp.updateHandler();
  icosalogic.op_amp.loadAndGraph();
};


icosalogic.op_amp.loadAndGraph = function() {
  console.log('icosalogic.op_amp.loadAndGraph: enter');

  if (!icosalogic.op_amp.isLoaded) {
    console.log('loading charts library');
    icosalogic.op_amp.isLoaded = true;
    google.charts.load('current', {'packages':['corechart', 'line']});
    google.charts.setOnLoadCallback(icosalogic.op_amp.graph);
    console.log('post charts load');
  } else {
    console.log('charts library already loaded');
    icosalogic.op_amp.graph();
  }
};


icosalogic.op_amp.graph = function() {
  console.log('icosalogic.op_amp.graph: enter');

  var el = document.getElementById('opamp_content');
  var gdiv = document.createElement('div');
  gdiv.id = 'opamp_chart';
  el.appendChild(gdiv);
  // gdiv.style.height = '900px';
  
  // icosalogic.op_amp.chart = new google.visualization.LineChart(gdiv);
  icosalogic.op_amp.chart = new google.charts.Line(gdiv);

  icosalogic.op_amp.graphChart();
};


/*
 * Render the chart based on the curGraphName value.
 * Uses the currently-loaded data.
 */
icosalogic.op_amp.graphChart = function() {
  console.log('icosalogic.op_amp.graphChart: enter ' + icosalogic.op_amp.curGraphName);

  icosalogic.op_amp.calcChartData();
  icosalogic.op_amp.graphOpAmpChart();
};


/*
 * Graph the input and output curves for the current op amp configuration.
 */
icosalogic.op_amp.graphOpAmpChart = function() {
  console.log('icosalogic.op_amp.graphOpAmpChart: enter');
  
  var oa = icosalogic.op_amp;
  oa.setTitle('Op Amp Simulator');
  var chart = oa.chart;
  if (chart != null) {
    chart.clearChart();
  }

  var vin_test_str     = document.getElementById('vin').value;
  var vin_test         = parseFloat(vin_test_str);
  var vout_test        = parseFloat(document.getElementById('vout').value);
  var vin_test_visible = document.getElementById('test_input_hide').value == 'h' && vin_test_str != '0.000';
  
  console.log('visible=' + vin_test_visible + '  vin_test_str=' + vin_test_str + 
              '  vin_test=' + vin_test + '  vout_test=' + vout_test);

  oa.curGraphName = 'OpAmp';
  oa.dataTable = new google.visualization.DataTable();
  var data = oa.dataTable;
  data.addColumn('number', 'x');
  data.addColumn('number', 'Vin');
  data.addColumn('number', 'Vout');
  data.addColumn('number', 'Vin Offset');
  data.addColumn('number', 'Vout Offset');
  if (vin_test_visible) {
    data.addColumn('number', 'Test Vin');
    data.addColumn('number', 'Test Vout');
  }

  var rowNum = 0;
  var chartDate = null;
  for (key in oa.rawData) {
    var oa_row = oa.rawData[key];
    data.addRows(1);
    data.setCell(rowNum, 0, oa_row.x);
    data.setCell(rowNum, 1, oa_row.vin);
    data.setCell(rowNum, 2, oa_row.vout);
    data.setCell(rowNum, 3, oa_row.vin_offset);
    data.setCell(rowNum, 4, oa_row.vout_offset);
    if (vin_test_visible) {
      data.setCell(rowNum, 5, vin_test);
      data.setCell(rowNum, 6, vout_test);
    }
    rowNum++;
  }
  
  // Basic chart settings
  var options = {
    hAxis: {
      format: '#.##',
    },
    vAxis: {
      title: 'Volts',
      format: "#.##"
    },
    interpolateNulls: true,
    height: 700,
    width: 1200,
    chartArea: {
      top: 20
    }
  };
  
  // Classic Chart
  chart.draw(data, google.charts.Line.convertOptions(options));
};


/*
 * Do a left pad on val (as a string) until it is length characters long.
 */
icosalogic.op_amp.lpad = function(val, length, padChar) {
	var strVal = val + "";
	while (strVal.length < length) {
		strVal = padChar + strVal;
	}
	return strVal;
};


icosalogic.op_amp.nullHandler = function() {
  console.log('icosalogic.op_amp.nullHandler: enter');
};


/*
 * Sets the large title above the graph.
 */
icosalogic.op_amp.setTitle = function(title) {
  console.log('icosalogic.op_amp.setTitle: enter ===============================================');

  var el = document.getElementById('main_title');
  el.innerHTML = title;
};

/*
 * Add the event handdlers to the appropriate elements.
 */
icosalogic.op_amp.addHandlers = function() {
  console.log('icosalogic.op_amp.addHandlers: enter ===============================================');

  const buttons = document.querySelectorAll('button');
  buttons.forEach(function(button) {
    button.onclick = icosalogic.op_amp.showhide;
  });
  
  const inputs = document.querySelectorAll('input');
  inputs.forEach(function(in_el) {
    if (in_el.readOnly) {
      console.log('not adding update handler to ' + in_el.id);
    } else {
      console.log('adding update handler to ' + in_el.id);
      in_el.onblur = icosalogic.op_amp.updateHandler;
    }
  });
  
  document.getElementById('ctype').onchange = icosalogic.op_amp.showCircuit;
};


/*
 * The show/hide event handdler.
 */
icosalogic.op_amp.showhide = function(e) {
  console.log('icosalogic.op_amp.showhide: enter ===============================================');
  var btn = e.target;
  console.log('name=' + btn.name + '  value=' + btn.value + '  innerText=' + btn.innerText);

  // const trows = document.querySelectorAll('tr');
  const trows = document.getElementsByTagName('tr');

  if (btn.value == 'h') {
    btn.value = 's';
    btn.innerText = "Show";
    
    for (var i = 0; i < trows.length; i++) {
      trow = trows[i];
      if (trow.className == btn.name) {
        trow.style.display = 'none'
        // console.log(i + ': changed  trow.class=' + trow.className + '  trow.style.display=' + trow.style.display)
      }
    }
  } else {
    btn.value = 'h';
    btn.innerText = "Hide";
    
    for (var i = 0; i < trows.length; i++) {
      trow = trows[i];
      if (trow.className == btn.name) {
        trow.style.display = 'table-row'
        // console.log(i + ': changed  trow.class=' + trow.className + '  trow.style.display=' + trow.style.display)
      }
    }
  }
  if (btn.name == 'row_in' && document.getElementById('vin').value != '0.000' && icosalogic.op_amp.isLoaded) {
    icosalogic.op_amp.graphChart();
  }
};

/*
 * The show/hide event handdler.
 */
icosalogic.op_amp.showCircuit = function(e) {
  console.log('icosalogic.op_amp.showhide: enter ===============================================');
  
  var el = document.getElementById("ctype");
  console.log('showing circuit ' + el.value);
  
  var fname = 'inverting.svg'
  if (el.value == 'inv') {
    fname = 'inverting.png'
  } else {
    fname = 'noninverting.png'
  }
  
  el = document.getElementById('opamp_circuit');
  icosalogic.op_amp.removeAllChildren(el);
  
  var href = window.location.href;
  console.log('showCircuit: href ' + href);
  var href2 = href.replace(/\/[^\/]*$/, '/');

  var src = fname;
  
  console.log('showCircuit: loading file ' + src);
  var img = document.createElement('img');
  img.id = 'op_amp_circuit';
  img.src = src;
  img.width = 300;
  el.appendChild(img);

  icosalogic.op_amp.updateHandler(e);
};


/*
 * Remove all the children from the given DOM node.
 */
icosalogic.op_amp.removeAllChildren = function(nodeEl)
{
	console.log("icosalogic.op_amp.removeAllChildren: enter");
	var childEl = nodeEl.firstChild;
	while (null != childEl)
	{
		nodeEl.removeChild(childEl);
		childEl = nodeEl.firstChild;
	}
}

/*
 * Read all the input values from the DOM.
 */
icosalogic.op_amp.readAllInputs = function()
{
	console.log("icosalogic.op_amp.readAllInputs: enter");
  
  var oa = icosalogic.op_amp;
  oa.circuit     = document.getElementById('ctype').value;
  oa.vpos        = parseFloat(document.getElementById('vpos').value);
  oa.vneg        = parseFloat(document.getElementById('vneg').value);
  oa.rfeedback   = parseFloat(document.getElementById('rfb').value);
  oa.r1          = parseFloat(document.getElementById('r1').value);
  oa.vref        = parseFloat(document.getElementById('vref').value);
  oa.vin_rhalf   = parseFloat(document.getElementById('vin_rhalf').value);
  // oa.vin_range   = parseFloat(document.getElementById('vin_range').value);
  oa.vin_offset  = parseFloat(document.getElementById('vin_offset').value);
  oa.vout_rhalf  = parseFloat(document.getElementById('vout_rhalf').value);
  // oa.vout_range  = parseFloat(document.getElementById('vout_range').value);
  oa.vout_offset = parseFloat(document.getElementById('vout_offset').value);
  oa.vin         = parseFloat(document.getElementById('vin').value);
  
  icosalogic.op_amp.dumpValues();
}

/*
 * Calculate all variables dependent on the inputs.
 */
icosalogic.op_amp.calculate = function()
{
	console.log("icosalogic.op_amp.calculate: enter");
  
  var oa = icosalogic.op_amp;
  oa.vin_range  = oa.vin_rhalf * 2.0;
  oa.vout_range = oa.vout_rhalf * 2.0;
  
  var gain_inv = Number(oa.rfeedback / oa.r1);
  var gain_ninv = Number(gain_inv + 1);
  if (oa.circuit == "noninv") {
    oa.gain = gain_ninv;
    oa.vout_raw   = oa.vin * gain_ninv - oa.vref * gain_inv;
    oa.ifeedback  = (oa.vout_raw - oa.vref) * 1000.0 / (oa.rfeedback + oa.r1);
  } else {
    oa.gain = gain_inv;
    oa.vout_raw   = oa.vref * gain_ninv - oa.vin * gain_inv;
    oa.ifeedback  = (oa.vout_raw - oa.vin) * 1000.0 / (oa.rfeedback + oa.r1);
  }
  
  oa.vout       = oa.vout_raw > oa.vpos ? oa.vpos : (oa.vout_raw < oa.vneg ? oa.vneg : oa.vout_raw);
  oa.rfb_power  = oa.ifeedback * oa.ifeedback * oa.rfeedback / 1000.0;
  oa.r1_power   = oa.ifeedback * oa.ifeedback * oa.r1 / 1000.0;
  
  icosalogic.op_amp.dumpValues();
}

/*
 * Calculate the feedback register value when the range fields are updated.
 * The register values can later be manually updated.
 * (Will this update the ranges?  It should.  Maybe just make register fields readonly.)
 */
icosalogic.op_amp.calculateRFeedback = function() {
	console.log("icosalogic.op_amp.calculateRFeedback: enter");
  
  var oa = icosalogic.op_amp;
  var gain_reg = oa.vout_rhalf / oa.vin_rhalf;
  if (oa.circuit == 'noninv') {
    gain_reg -= 1;
  }
  oa.rfeedback = gain_reg * oa.r1;
	console.log("                                      updating rfb=" + oa.rfeedback.toFixed(4));
}

/*
 * Calculate the vref field when the offset fields are updated.
 */
icosalogic.op_amp.calculateVref = function() {
	console.log("icosalogic.op_amp.calculateVref: enter");
  
  var oa = icosalogic.op_amp;
  var gain_inv  = oa.rfeedback / oa.r1;
  var gain_ninv = gain_inv + 1.0;
  if (oa.circuit == 'noninv') {
    if (oa.rfeedback == 0) {
      oa.vref = oa.vin;
    } else {
      oa.vref = (oa.vin_offset * gain_ninv - oa.vout_offset) / gain_inv;
    }
  } else {
    gain_ninv = oa.rfeedback / oa.r1;
    gain_inv  = gain_ninv - 1.0;
    oa.vref = oa.vin_offset + (oa.vout_offset - oa.vin_offset) / (gain_ninv + 1.0);
  }
	console.log('                                      ' +
              'updating vref=' + oa.vref.toFixed(4) +
              ' from rfb=' + oa.rfeedback.toFixed(4) + 
              ' r1=' + oa.r1 +
              ' gi=' + gain_inv.toFixed(4) + 
              ' gn=' + gain_ninv.toFixed(4));
}

/*
 * Update all outputs in the DOM.
 */
icosalogic.op_amp.updateAllOutputs = function()
{
	console.log("icosalogic.op_amp.updateAllOutputs: enter");
  
  icosalogic.op_amp.dumpValues();
  var oa = icosalogic.op_amp;
  document.getElementById('vin_range').value  = oa.vin_range;
  document.getElementById('vout_range').value = oa.vout_range;
  document.getElementById('rfb').value        = oa.rfeedback.toFixed(4);
  document.getElementById('r1').value         = oa.r1;
  document.getElementById('vref').value       = oa.vref;
  document.getElementById('gain').value       = oa.gain.toFixed(4);
  document.getElementById('vout_raw').value   = oa.vout_raw.toFixed(4);
  document.getElementById('vout').value       = oa.vout.toFixed(4);
  document.getElementById('i_fb').value       = oa.ifeedback.toFixed(4);
  document.getElementById('w_rf').value       = oa.rfb_power.toFixed(4);
  document.getElementById('w_r1').value       = oa.r1_power.toFixed(4);
}

/*
 * Update the page when an input changes.
 */
icosalogic.op_amp.updateHandler = function(e)
{
  var tid = 'null';
  var tvalue = 0;
  if (e != null) {
    tid = e.target.id;
    tvalue = e.target.value;
  }
  
	console.log("icosalogic.op_amp.updateHandler: enter: updating id: " + tid + '=' + tvalue);
  
  var oa = icosalogic.op_amp;
  oa.readAllInputs();
  
  // first calculate interdependent values
  if (tid == 'vin_rhalf' || tid == 'vout_rhalf' || tid == 'ctype' || tid == 'r1') {
    oa.calculateRFeedback();
    oa.calculateVref();
  } else if (tid == 'vin_offset' || tid == 'vout_offset') {
    oa.calculateVref();
  }
  
  oa.calculate();
  oa.updateAllOutputs();
  if (oa.isLoaded) {
    oa.graphChart();
  }
  console.log("icosalogic.op_amp.updateHandler: done");
};

/*
 * Compute data values for a chart.
 * Generates 200 points for the input/output graph.
 */
icosalogic.op_amp.calcChartData = function()
{
	console.log("icosalogic.op_amp.calcChartData: enter");
  
  var oa = icosalogic.op_amp;
  var rows = [];
  var x = 0.0;
  var ndx = 0;
  var upper_limit = 2.0 * 3.14159;
  for (; x < upper_limit; x += 0.0314159) {
    oa.vin = Math.sin(x) * oa.vin_rhalf + oa.vin_offset;
    oa.calculate();
    // console.log(ndx + ': x=' + x + '  vin=' + oa.vin + '  vout=' + oa.vout);
    
    var row = {};
    row.x           = x;
    row.vin         = oa.vin;
    row.vout        = oa.vout;
    row.vin_offset  = oa.vin_offset;
    row.vout_offset = oa.vout_offset;
    
    rows[ndx] = row;
    ndx += 1;
  }
  oa.rawData = rows;
};

/*
 * Write all the values to the console log.
 */
icosalogic.op_amp.dumpValues = function(msg)
{
  return;
	console.log("icosalogic.op_amp.dumpValues: enter");
  
  var oa = icosalogic.op_amp;
  console.log('  Inputs:');
  console.log('    circuit    =' + icosalogic.op_amp.circuit);
  console.log('    vpos       =' + icosalogic.op_amp.vpos);
  console.log('    vneg       =' + icosalogic.op_amp.vneg);
  console.log('    rfeedback  =' + icosalogic.op_amp.rfeedback);
  console.log('    r1         =' + icosalogic.op_amp.r1);
  console.log('    vref       =' + icosalogic.op_amp.vref);
  console.log('    vin_rhalf  =' + icosalogic.op_amp.vin_rhalf);
  console.log('    vin_range  =' + icosalogic.op_amp.vin_range);
  console.log('    vin_offset =' + icosalogic.op_amp.vin_offset);
  console.log('    vout_rhalf =' + icosalogic.op_amp.vout_rhalf);
  console.log('    vout_range =' + icosalogic.op_amp.vout_range );
  console.log('    vout_offset=' + icosalogic.op_amp.vout_offset);
  console.log('    vin        =' + icosalogic.op_amp.vin);

  console.log('  Outputs:');
  console.log('    gain       =' + icosalogic.op_amp.gain);
  console.log('    vout_raw   =' + icosalogic.op_amp.vout_raw);
  console.log('    vout       =' + icosalogic.op_amp.vout);
  console.log('    ifeedback  =' + icosalogic.op_amp.ifeedback);
  console.log('    rfb_power  =' + icosalogic.op_amp.rfb_power);
  console.log('    r1_power   =' + icosalogic.op_amp.r1_power);
}
