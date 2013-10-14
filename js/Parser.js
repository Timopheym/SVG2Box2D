/**
 * @author Timophey Molchanov <timopheym@gmail.com>
 * @class Parser
 * @extends Object
 * Date: 10/14/13 1:21 PM
 */


var Parser = function () {
    this.settings = {
        units : '',
        divideXBy : 1,
        divideYBy : 1,
        precision : 3
    }
};

Parser.prototype.polygonPath = function (points) {
    var polygon = [];
    points.forEach(function(point) {
        polygon.push([point.x, point.y]);
    });
    return polygon;
};
Parser.prototype.parsePoints = function (str) {
    var floats = str.split(/[^-eE\.\d]+/).filter(function(val) {
        return val;
    }).map(parseFloat);
    var i, points = [];
    // bitwise 'and' to ignore any isolated float at the end
    /* jshint bitwise:false */
    for (i = 0; i < (floats.length & 0x7FFFFFFE); i += 2) {
        points.push(new poly2tri.Point(floats[i], floats[i + 1]));
    }
    return points;
};
Parser.prototype.triangulate = function(polygon) {
    // parse points
    var swctx,
        triangles,
        holes = [],
        points = [],
        contour = this.parsePoints(polygon);
    try {
        swctx = new poly2tri.SweepContext(contour, {cloneArrays: true});
//        holes.forEach(function(hole) {
//            swctx.addHole(hole);
//        });
//        swctx.addPoints(points);

        // triangulate
        swctx.triangulate();
    } catch (e) {
        throw new Error(e);
        error_points = e.points;
    }
    triangles = swctx.getTriangles() || [];
    return triangles;
};
Parser.prototype.pointCommandsToSVGPoints = function(pointCommands) {
    return pointCommands.map(function(value, index) {
        return ((index % 2 == 1) ? ',' : ' ') + value;
    }).join('');
}
Parser.prototype.pointCommandsToCSSPoints = function (pointCommands, settings) {
    return pointCommands.map(function(value, index, array) {
        return  (value / (index % 2 == 0 ? settings.divideXBy : settings.divideYBy)).toFixed(settings.precision)
            + this.settings.units + ((index % 2 == 1 && index < array.length - 1) ? ',' : '');
    }).join(' ');
}
Parser.prototype.pathToPolygon = function (path) {
    var segments = path.pathSegList;
    var count = segments.numberOfItems;
    var points = [], segment, x, y;
    for (var i = 0; i < count; i++) {
        segment = segments.getItem(i);
        switch(segment.pathSegType) {
            case SVGPathSeg.PATHSEG_MOVETO_ABS:
            case SVGPathSeg.PATHSEG_LINETO_ABS:
            case SVGPathSeg.PATHSEG_CURVETO_CUBIC_ABS:
            case SVGPathSeg.PATHSEG_CURVETO_QUADRATIC_ABS:
            case SVGPathSeg.PATHSEG_ARC_ABS:
            case SVGPathSeg.PATHSEG_CURVETO_CUBIC_SMOOTH_ABS:
            case SVGPathSeg.PATHSEG_CURVETO_QUADRATIC_SMOOTH_ABS:
                x = segment.x;
                y = segment.y;
                break;

            case SVGPathSeg.PATHSEG_MOVETO_REL:
            case SVGPathSeg.PATHSEG_LINETO_REL:
            case SVGPathSeg.PATHSEG_CURVETO_CUBIC_REL:
            case SVGPathSeg.PATHSEG_CURVETO_QUADRATIC_REL:
            case SVGPathSeg.PATHSEG_ARC_REL:
            case SVGPathSeg.PATHSEG_CURVETO_CUBIC_SMOOTH_REL:
            case SVGPathSeg.PATHSEG_CURVETO_QUADRATIC_SMOOTH_REL:
                x = segment.x;
                y = segment.y;
                if (points.length > 0) {
                    x += points[points.length - 2];
                    y += points[points.length - 1];
                }
                break;

            case SVGPathSeg.PATHSEG_LINETO_HORIZONTAL_ABS:
                x = segment.x;
                y = points[points.length - 1];
                break;
            case SVGPathSeg.PATHSEG_LINETO_HORIZONTAL_REL:
                x = points[points.length - 2] + segment.x;
                y = points[points.length - 1];
                break;

            case SVGPathSeg.PATHSEG_LINETO_VERTICAL_ABS:
                x = points[points.length - 2];
                y = segment.y;
                break;
            case SVGPathSeg.PATHSEG_LINETO_VERTICAL_REL:
                x = points[points.length - 2];
                y = segment.y + points[points.length - 1];
                break;
            case SVGPathSeg.PATHSEG_CLOSEPATH:
                //Remove cycle
                points = points.slice(0,points.length-2);
                return this.pointCommandsToSVGPoints(points);
            default:
                console.log('unknown path command: ', segment.pathSegTypeAsLetter);
        }
        points.push(x, y);
    }
    return this.pointCommandsToSVGPoints(points);
};
Parser.prototype.getPolygonsFromTriangles = function (triangles) {
    var trianglePolygons = [],
        self = this;
    triangles.forEach(function(t) {
        trianglePolygons.push(self.polygonPath([t.getPoint(0), t.getPoint(1), t.getPoint(2)]));
    });
    return trianglePolygons;
}
Parser.prototype.loadSVG = function (svgString) {
    var tempElement = document.createElement('div'),
        path,
        polygon,
        triangles,
        trianglePolygons;
    tempElement.innerHTML = svgString;
    path = tempElement.querySelector('path');
    polygon = this.pathToPolygon(path);
    triangles = this.triangulate(polygon);
    trianglePolygons = this.getPolygonsFromTriangles(triangles);
    return trianglePolygons;
};
