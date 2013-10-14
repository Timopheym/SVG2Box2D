var bat = document.getElementById('bat');
var dot = document.getElementById('dot');
function createOn(root,name,attrs,text){
    var doc = root.ownerDocument,
        svg = root.ownerSVGElement || root;
    var svgNS = svg.getAttribute('xmlns');
    var el = doc.createElementNS(svgNS,name);
    for (var attr in attrs){
        if (attrs.hasOwnProperty(attr)){
            var parts = attr.split(':');
            if (parts[1]) el.setAttributeNS(svg.getAttribute('xmlns:'+parts[0]),parts[1],attrs[attr]);
            else el.setAttributeNS(null,attr,attrs[attr]);
        }
    }
    if (text) el.appendChild(document.createTextNode(text));
    return root.appendChild(el);
}
function polygonSampledFromPath(path,samples){
    var doc = path.ownerDocument;
    var poly = doc.createElementNS('http://www.w3.org/2000/svg','polygon');

    var points = [];
    var len  = path.getTotalLength();
    var step = step=len/samples;
    for (var i=0;i<=len;i+=step){
        var p = path.getPointAtLength(i);
        points.push( p.x+','+p.y );
    }
    poly.setAttribute('points',points.join(' '));
    return poly;
}

function createSamples(svg,func) {
    var samples = [{count:300,offset: 0}
        ],
        points = [],
        str = '';
    for (var i=samples.length-1;i>=0;--i){
        var sample = samples[i];
        var g = createOn(svg,'g',{transform:"translate("+sample.offset+",0)"});
        createOn(g,'use',{"xlink:href":"#bat"});
        var poly = g.appendChild(func(bat,sample.count));
        createOn(g,'text',{y:100},sample.count+" samples");
        for (var j=poly.points.numberOfItems-1;j>=0;--j){
            var pt = poly.points.getItem(j);
            points.push({x:pt.x/60,y:pt.y/60});
            str += pt.x+' '+pt.y+'\n';
            createOn(g,'use',{"xlink:href":"#dot",x:pt.x,y:pt.y,"class":"dot"});
        }
    }
    console.log(str)
//    console.log(points)
    return points;
}
function pathToPolygon(path,samples){
    if (!samples) samples = 0;
    var doc = path.ownerDocument;
    var poly = doc.createElementNS('http://www.w3.org/2000/svg','polygon');

    // Put all path segments in a queue
    for (var segs=[],s=path.pathSegList,i=s.numberOfItems-1;i>=0;--i) segs[i] = s.getItem(i);
    var segments = segs.concat();

    var seg,lastSeg,points=[],x,y;
    var addSegmentPoint = function(s){
        if (s.pathSegType == SVGPathSeg.PATHSEG_CLOSEPATH){

        }else{
            if (s.pathSegType%2==1 && s.pathSegType>1){
                // All odd-numbered path types are relative, except PATHSEG_CLOSEPATH (1)
                x+=s.x; y+=s.y;
            }else{
                x=s.x; y=s.y;
            }
            var lastPoint = points[points.length-1];
            if (!lastPoint || x!=lastPoint[0] || y!=lastPoint[1]) points.push([x,y]);
        }
    };
    for (var d=0,len=path.getTotalLength(),step=len/samples;d<=len;d+=step){
        var seg = segments[path.getPathSegAtLength(d)];
        var pt  = path.getPointAtLength(d);
        if (seg != lastSeg){
            lastSeg = seg;
            while (segs.length && segs[0]!=seg) addSegmentPoint( segs.shift() );
        }
        var lastPoint = points[points.length-1];
        if (!lastPoint || pt.x!=lastPoint[0] || pt.y!=lastPoint[1]) points.push([pt.x,pt.y]);
    }
    for (var i=0,len=segs.length;i<len;++i) addSegmentPoint(segs[i]);
    for (var i=0,len=points.length;i<len;++i) points[i] = points[i].join(',');
    poly.setAttribute('points',points.join(' '));
    return poly;
}