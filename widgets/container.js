const { color, allOpacity, offSet } = require("./global");

function widgetContainer(node, child) {
    const json = _jsonRectangle(node);
    let widget = `new Container(
        ${_size(json)}
        ${child != null ? `child:${child},` : ''}${_alignment(json)}
        ${_colorOrDecoration(json)}
    )`;
    return widget;
}

function _size(json) {
    return `height: sz(${json["h"].toFixed(2)}),
    width: sz(${json["w"].toFixed(2)}),`
}

function _alignment(json) {
    if (json["alignment"] == undefined) {
        return "";
    }
    return `alignment: Alignment.${json["alignment"]},`;
}

function _colorOrDecoration(json) {
    const radius = _borderRadius(json);
    const shape = _shape(json);
    const boxShadow = _boxShadow(json);
    const border = _border(json);
    const ccolor = `color: ${color(json["color"],allOpacity(json["opacity"],json["colorOpacity"]))}`
    if (radius == "" && shape == "" && boxShadow == '' && border == "") {
        return `${ccolor} `
    } else {
        return `decoration: BoxDecoration(
        ${ ccolor}${border}${boxShadow}${radius}${shape}
    ), `;
    }
}

function _jsonRectangle(node) {
    let w, h, shape = "rectangle";
    if (node.constructor.name == "Line") {
        return widgetContainerLine(node);
    } else
        if (node.constructor.name == "Ellipse") {
            w = node.radiusX * 2;
            h = node.radiusY * 2;
            if (node.isCircle) {
                shape = "circle";
            } else {
                shape = "ellipse"
            }
        } else {
            w = node.width;
            h = node.height;
        }
    return {
        "w": w,
        "h": h,
        "radius": node.hasRoundedCorners ? node.cornerRadii : null,
        "color": node.fill["value"] != null ? node.fill.toHex(true) : node.fill,
        "colorOpacity": node.fill["value"] != null ? 1.0 : node.fill.a / 255,
        "borderColor": node.stroke.toHex(true),
        "borderWidth": node.strokeWidth,
        "withBorder": node.strokeEnabled,
        "opacity": node.opacity,
        "shadow": node.shadow == null ? { "visible": false } : {
            "x": node.shadow["x"],
            "y": node.shadow["y"],
            "color": node.shadow["color"].toHex(true),
            "colorOpacity": node.shadow["color"].a / 255,
            "blur": node.shadow["blur"],
            "visible": node.shadow["visible"]
        },
        "alignment": "center",
        "shape": shape,
    };
}

function _boxShadow(json) {
    return !json["shadow"]["visible"] ? '' :
        `
    boxShadow: [
        BoxShadow(
            offset: ${ offSet(json)},
            color: ${ color(json["shadow"]["color"],allOpacity(json["opacity"],json["shadow"]["colorOpacity"]))
        }
blurRadius: sz(${ json["shadow"]["blur"]}),
    ),
  ], `;
}

function _borderRadius(json) {
    if (json["shape"] == "ellipse") {
        return `borderRadius: BorderRadius.all(Radius.elliptical(${json['w'].toFixed(2)}, ${json['h'].toFixed(2)})), `
    } else if (json["radius"] == null) {
        return '';
    } else {
        const tl = json["radius"]["topLeft"].toFixed(2);
        const tr = json["radius"]["topRight"].toFixed(2);
        const bl = json["radius"]["bottomLeft"].toFixed(2);
        const br = json["radius"]["bottomRight"].toFixed(2);
        if (tl == tr && tr == bl && bl == br) {
            return `borderRadius: BorderRadius.circular(sz(${tl})), `;
        }
        return `borderRadius: BorderRadius.only(${_borderOnly("topLeft", tl)}${_borderOnly("topRight", tr)}${_borderOnly("bottomLeft", bl)}${_borderOnly("bottomRight", br)}), `;
    }
}


function _borderOnly(pos, val) {
    if (val == 0) {
        return '';
    } else {
        return `${pos}: Radius.circular(sz(${val})), `;
    }
}

function _border(json) {
    return !json["withBorder"] ? "" : `
border: Border.all(width: sz(${ json["borderWidth"].toFixed(2)}), color: ${color(json["borderColor"],allOpacity(json["opacity"],json["colorOpacity"]))}), `
}

function _shape(json) {
    if (json["shape"] == undefined) {
        return "";
    }
    return json["shape"] == "rectangle" || json["shape"] == "ellipse" ? "" : `
shape: BoxShape.circle, `
}

function widgetContainerLine(node) {
    let w = node.start.x + node.end.x;
    let h = node.start.y + node.end.y;
    if (w < h) {
        w = node.strokeWidth;
    } else {
        h = node.strokeWidth
    }
    return {
        "w": w,
        "h": h,
        "color": node.stroke.toHex(true),
        "colorOpacity": node.stroke.a / 255,
        "opacity": node.opacity,
        "shadow": node.shadow == null ? { "visible": false } : {
            "x": node.shadow["x"],
            "y": node.shadow["y"],
            "color": node.shadow["color"].toHex(true),
            "colorOpacity": node.shadow["color"].a / 255,
            "blur": node.shadow["blur"],
            "visible": node.shadow["visible"]
        },
    };
}

module.exports = { widgetContainer };