/*global define */
define(['d3', 'queue', 'topojson', 'zepto'], function (d3, queue, topojson, $) {
    'use strict';

    var globe = {type: 'Sphere'}, land, countries, borders;

    var title = d3.select('#country');

    var $world = $('#world'),
        diameter = $world.width(),
        radius = diameter/2,
        scale = radius*0.6;

    var projection = d3.geo.orthographic()
        .scale(scale)
        .translate([radius, radius-60])
        .clipAngle(90);

    var canvas = d3.select('#world').append('canvas')
        .attr('class', 'world-canvas')
        .attr('width', diameter)
        .attr('height', diameter);

    var c = canvas.node().getContext('2d');

    var path = d3.geo.path()
        .projection(projection)
        .context(c);

    var methods = {
        init: function() {
            var that = this;

            return function() {
                queue()
                    .defer(d3.json, 'data/world-110m.json')
                    .defer(d3.tsv, 'data/world-country-names.tsv')
                    .await(that.ready);
            };
        },
        ready: function(error, world, names) {
            land = topojson.feature(world, world.objects.land);
            countries = topojson.feature(world, world.objects.countries).features;
            borders = topojson.mesh(world, world.objects.countries, function(a, b) {
                return a !== b;
            });

            countries = countries.filter(function(d) {
                return names.some(function(n) {
                    if (parseInt(d.id, 10) === parseInt(n.id, 10)) { // d.id == n.id
                        d.name = n.name;

                        return d.name;
                    }
                });
            }).sort(function(a, b) {
                return a.name.localeCompare(b.name);
            });
        },
        moveTo: function() {
            return function(names, data, maxValue) {
                var move = function(names) {
                    var name = names[0];

                    var theCountry = $.grep(countries, function(e){
                        return e.name.toLowerCase().trim() === name.toLowerCase().trim();
                    });

                    var warmColor = '#57e9be',
                        coldColor = '#5a6063',
                        colorScale = d3.scale.linear()
                            .domain([0, maxValue])
                            .range([coldColor, warmColor]);

                    if (theCountry.length === 1) {
                        theCountry = theCountry[0];
                        d3.transition()
                                .duration(1250)
                                .each('start', function() {
                                    title.text(name);
                                })
                                .tween('rotate', function() {
                                    var p = d3.geo.centroid(theCountry),
                                        r = d3.interpolate(projection.rotate(), [-p[0], -p[1]]);
                                    return function(t) {
                                        projection.rotate(r(t));
                                        c.clearRect(0, 0, diameter, diameter);
                                        c.fillStyle = '#272c2d';
                                        c.fill();

                                        c.fillStyle = coldColor;
                                        c.beginPath();
                                        path(land);
                                        c.fill();

                                        // Color the countries with a scale
                                        $.each(data, function(indexCountry, country) {
                                            if(country.value > 0) {
                                                var currentCountry = $.grep(countries, function(e){
                                                    return e.name.toLowerCase().trim() === country.name.toLowerCase().trim();
                                                });
                                                if (currentCountry.length === 1) {
                                                    c.fillStyle = colorScale(country.value);
                                                    c.beginPath();
                                                    path(currentCountry[0]);
                                                    c.fill();
                                                }
                                            }
                                        });


                                        c.strokeStyle = '#222';
                                        c.lineWidth = 0.5;
                                        c.beginPath();
                                        path(borders);
                                        c.stroke();

                                        // c.strokeStyle = '#000';
                                        // c.lineWidth = 1;
                                        c.beginPath();
                                        path(globe);
                                        c.stroke();

                                    };
                                })
                                .transition()
                                .each('end', function() {
                                    names.shift();
                                    if(names.length > 0) {
                                        move(names);
                                    }
                                });
                    }
                };

                if(countries) {
                    move(names);
                }
                else {
                    setTimeout(function() {
                        move(names);
                    }, 500);
                }

            };
        }
    };

    return {
        init: methods.init(),
        moveTo: methods.moveTo()
    };
});