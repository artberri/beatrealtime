/*global define */
define(['d3', 'queue', 'topojson'], function (d3, queue, topojson) {
    'use strict';

    var realtime;

    var title = d3.select('#country');

    var width = window.innerWidth/2,
        height = width/1.92;

    var projection = d3.geo.orthographic()
        .scale(190)
        .clipAngle(90);

    var canvas = d3.select('#world').append('canvas')
        .attr('class', 'world-canvas')
        .attr('width', width)
        .attr('height', height);

    var c = canvas.node().getContext('2d');

    var path = d3.geo.path()
        .projection(projection)
        .context(c);

    var methods = {
        init: function() {
            var that = this;

            return function(callback) {
                realtime = callback;

                console.log(',,,e');
                console.log(realtime);
                console.log(',,,e');

                queue()
                    .defer(d3.json, 'data/world-110m.json')
                    .defer(d3.tsv, 'data/world-country-names.tsv')
                    .await(that.ready);
            };
        },
        ready: function(error, world, names) {
            var globe = {type: 'Sphere'},
                land = topojson.feature(world, world.objects.land),
                countries = topojson.feature(world, world.objects.countries).features,
                borders = topojson.mesh(world, world.objects.countries, function(a, b) { return a !== b; }),
                i = -1,
                n = countries.length;

            countries = countries.filter(function(d) {
                return names.some(function(n) {
                    if (d.id == n.id) {
                        return d.name = n.name;
                    }
                });
            }).sort(function(a, b) {
                return a.name.localeCompare(b.name);
            });

            console.log('---- ready');
            console.log(realtime);
            realtime();
          /*  setInterval(function() {
                realtime();
            }, 10000);*/

            (function transition() {
                d3.transition()
                    .duration(1250)
                    .each('start', function() {
                        title.text(countries[i = (i + 1) % n].name);
                        if(typeof gapi !== 'undefined') {
                           //  app.realtime(53340307);
                        }
                    })
                    .tween('rotate', function() {
                        var p = d3.geo.centroid(countries[i]),
                            r = d3.interpolate(projection.rotate(), [-p[0], -p[1]]);
                        return function(t) {
                            projection.rotate(r(t));
                            c.clearRect(0, 0, width, height);
                            c.fillStyle = '#272c2d';
                            c.fill();

                            c.fillStyle = '#5a6063';
                            c.beginPath();
                            path(land);
                            c.fill();

                            c.fillStyle = '#57e9be';
                            c.beginPath();
                            path(countries[i]);
                            c.fill();

                            c.strokeStyle = '#222';
                            c.lineWidth = 0.5;
                            c.beginPath();
                            path(borders);
                            c.stroke();

                       /*     c.strokeStyle = '#000';
                            c.lineWidth = 1;*/
                            c.beginPath();
                            path(globe);
                            c.stroke();

                        };
                    })
                  .transition()
                      .each('end', transition);
            })();
        }
    };

    return {
        init: methods.init()
    };
});