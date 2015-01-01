var Players = new Meteor.Collection("players");

if (Meteor.isServer) {
  Meteor.startup(function () { 
  //   Players.remove({score: {$gte: 0}});  //reset  scores
     if (Players.find().count() === 0) ["A","B","C","D"].forEach(function(n) {Players.insert({name:n,score:Math.floor(Math.random()*1)*5})})
  });
}

if (Meteor.isClient) {
   Meteor.defer(function () {
     Deps.autorun(function () { 
        if (Deps.currentComputation.firstRun) {  
		d3vis = {margin:{top:15,right:5,bottom:5,left:5},width:600,height:120};            
       		d3vis.svg = d3.select('#d3vis').attr({"width":d3vis.width,"height":d3vis.height}).append("g").attr({"class":"wrapper","transform":"translate("+d3vis.margin.left+","+d3vis.margin.top+")"});
       		d3.select("#svg1").attr({width:d3vis.width,height:d3vis.height})
        }
	var nameset = Players.find().fetch().sort(function(a,b) {return b.score-a.score});       
	d3vis.x = d3.scale.ordinal().rangeRoundBands([0, d3vis.width],.1).domain(nameset.map(function(d) {return d.name}));
	d3vis.y =  d3.scale.linear().range([d3vis.height-10,0]).domain([0,d3.max(nameset,function(d) {return d.score})+20]);
	d3vis.color = d3.scale.category20().domain(nameset.map(function(d) {return d.name}).sort(d3.asscending));

	d3.select("button#testbutton").on("click",function()  {
		Players.update(Session.get("selected_player"),{$inc:{score:5}});
		d3.selectAll(".player1").classed("selected",function(d) {return Session.equals("selected_player",d._id)});
	})

//view of player list
	var playerset =  d3.select("#players").selectAll(".player1").data(nameset) 
 		.html(function(d) {return "<span class = name>"+d.name+"</span><span class = score>"+d.score+"</span>"});                 
	playerset.enter().append("div").attr("class","player1")
		.html(function(d) {return "<span class = name>"+d.name+"</span><span class = score>"+d.score+"</span>"})    
 		.on("click",toggler)
	playerset.exit().remove(); 

//view of the bar chart
	var barset = d3.select("#svg1").selectAll(".bar1").data(nameset,function(d) {return d.name}) ;
	barset.enter().append("rect").attr("class","bar1");
	barset.transition().duration(100)
  		.attr({"x":function(d) {return d3vis.x(d.name)},"width":d3vis.x.rangeBand(),"y":function(d) {return d3vis.y(d.score)},"height":function(d) {return d3vis.height-d3vis.y(d.score)}})
  		.style("fill",function(d) {return d3vis.color(d.name);})  
	barset.exit().remove();   
		
	var bartext = d3.select("#svg1").selectAll(".bar_text1").data(nameset,function(d) {return d.name});
	bartext.enter().append("text").attr("class","bar_text1");   
	bartext.transition().duration(100).attr({"x":function(d) {return d3vis.x(d.name)+10},"y":function(d) {return d3vis.y(d.score)-2}})
  		.text(function(d) {return d.name+": "+d.score}).attr("height",function(d) {return d3vis.height-d3vis.y(d.score)})               
	bartext.exit().remove();
     }); //autorun  
   }); //defer
} //isClient

function toggler() { 
	Session.set('selected_player',Session.equals('selected_player',d3.select(this).datum()._id)?"":d3.select(this).datum()._id);  //tie selected element to session         
	d3.selectAll(".player1").classed("selected",false);
	d3.select(this).classed("selected",!d3.select(this).classed("selected")); //toggle selected switch 
}
