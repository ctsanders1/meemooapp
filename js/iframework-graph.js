$(function(){

  window.Iframework.Graph = Backbone.Model.extend({
    loaded: false,
    defaults: {
      info: {
        author: "",
        title: "",
        description: "",
        parent: "",
        permalink: ""
      }
      //nodes: new window.Iframework.Nodes(),
      //edges: new window.Iframework.Edges()
    },
    initialize: function () {
      // Convert arrays into Backbone Collections
      if (this.attributes.nodes) {
        var nodes = this.attributes.nodes;
        this.attributes.nodes = new window.Iframework.Nodes();
        for (var i=0; i<nodes.length; i++) {
          var node = new window.Iframework.Node(nodes[i]);
          node.graph = this;
          this.addNode(node);
        }
      }
      if (this.attributes.edges) {
        var edges = this.attributes.edges;
        this.attributes.edges = new window.Iframework.Edges();
        for (var j=0; j<edges.length; j++) {
          var edge = new window.Iframework.Edge(edges[j]);
          edge.graph = this;
          this.addEdge(edge);
        }
      }
      this.view = new window.Iframework.GraphView({model:this});
    },
    addNode: function (node) {
      // Make sure node id is unique
      var isDupe = this.get("nodes").any(function(_node) {
        return _node.get('id') === node.get('id');
      });
      if (isDupe) {
        console.warn("duplicate node id ignored");
        return false;
      } else {
        return this.get("nodes").add(node);
      }
    },
    addEdge: function (edge) {
      // Make sure edge is unique
      var isDupe = this.get("edges").any(function(_edge) {
        return _edge.get('source')[0] === edge.get('source')[0] && _edge.get('source')[1] === edge.get('source')[1] && _edge.get('target')[0] === edge.get('target')[0] && _edge.get('target')[1] === edge.get('target')[1];
      });
      if (isDupe) {
        console.warn("duplicate edge ignored");
        return false;
      } else {
        return this.get("edges").add(edge);
      }
    },
    removeEdge: function (edge) {
      edge.disconnect();
      if (this.view) {
        this.view.removeEdge(edge);
      }
      this.get("edges").remove(edge);
    },
    checkLoaded: function () {
      for (var i=0; i<this.get("nodes").length; i++) {
        if (this.get("nodes").at(i).loaded === false) { 
          return false; 
        }
      }
      this.loaded = true;
      
      // Disconnect then connect edges
      this.reconnectEdges();
      
      return true;
    },
    reconnectEdges: function () {
      for(var i=0; i<this.get("edges").length; i++) {
        // Disconnect them first to be sure not doubled
        this.get("edges").at(i).disconnect();
      }
      // Connect edges when all modules have loaded (+.5 seconds)
      setTimeout(function(){
        Iframework.shownGraph.connectEdges();
      }, 500);
    },
    connectEdges: function () {
      for(var i=0; i<this.get("edges").length; i++) {
        this.get("edges").at(i).connect();
      }
    }
  });
  
  var Graphs = Backbone.Collection.extend({
    model: window.Iframework.Graph
  });

});
