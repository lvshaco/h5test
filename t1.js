var data = [
    1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 
    1, 0, 0, 0, 0, 1, 0, 0, 0, 1,
    1, 0, 1, 0, 0, 0, 0, 0, 0, 1,
    1, 0, 1, 0, 0, 1, 0, 0, 0, 1,
    0, 0, 1, 0, 0, 1, 0, 1, 0, 0,
    0, 0, 0, 0, 0, 1, 0, 1, 0, 0,
    1, 0, 0, 0, 0, 0, 0, 0, 0, 1,
    1, 0, 1, 0, 0, 1, 0, 0, 0, 1,
    1, 0, 1, 0, 0, 0, 0, 0, 0, 1,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
];
/*
var data = [
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 
    1, 0, 0, 0, 0, 1, 0, 0, 0, 1,
    1, 0, 1, 0, 0, 0, 0, 0, 0, 1,
    1, 0, 1, 0, 0, 1, 0, 0, 0, 1,
    1, 0, 1, 0, 0, 1, 0, 1, 0, 1,
    1, 0, 0, 0, 0, 1, 0, 1, 0, 1,
    1, 0, 0, 0, 0, 0, 0, 0, 0, 1,
    1, 0, 1, 0, 0, 1, 0, 0, 0, 1,
    1, 0, 1, 0, 0, 0, 0, 0, 0, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 
];

var data = [
    1, 1, 1, 1, 1,
    1, 1, 0, 0, 1,
    1, 0, 0, 0, 1,
    1, 0, 1, 0, 1,
    1, 1, 1, 1, 1,
];

var data = [
    1, 1, 1, 1, 1,
    1, 0, 0, 0, 1,
    1, 0, 1, 0, 1,
    1, 0, 0, 0, 1,
    1, 1, 1, 1, 1,
];

var data = [
    0,0,0,
    0,0,0,
    0,0,0,
];
*/
var autoDetectRenderer = PIXI.autoDetectRenderer,
    Container = PIXI.Container,
    loader = PIXI.loader,
    resources = PIXI.loader.resources,
    Sprite = PIXI.Sprite,
    Rectangle = PIXI.Rectangle,
    Texture = PIXI.Texture,
    Text = PIXI.Text,
    ParticleContainer = PIXI.ParticleContainer,
    Graphics = PIXI.Graphics;

var renderer = autoDetectRenderer(256, 256,{
    backgroundColor : 0x1099bb,
    resolution: 1}),
    stage = new Container();

renderer.view.style.position = "absolute";
renderer.view.style.display = "block";
renderer.autoResize = true;
var wh = windowSize()
renderer.resize(wh.w, wh.h);

document.body.appendChild(renderer.view);

loader
.add('tile', '../assets/tiles.png')
.add('player', '../assets/players.png')
.on('progress', function(loader, resource) {
    console.log("loading...")
})
.load(setup);

// fps
var fps_text;
var lasttick= new Date().getTime();
var tick=0;

// debug
var debug;

// player
var player;
var speed = 200;
var lasttime;
var dir_up = false;
var dir_down= false;
var dir_left = false;
var dir_right= false;

var map_playerx= 0;
var map_playery= 0;
var map_startx = 0;
var map_starty = 0;

// tiles
var tile_size = 24;
var block = 10;//
var map_wtile = 120;
var map_htile = 80;
var map_w = map_wtile*tile_size;
var map_h = map_htile*tile_size;
var tiles = [];
var sprites;

// light
var light;
var lightx;
var lighty;
var lines;

function player_dir() {
    var y=0;
    var x=0;
    if (dir_up)  y=-1;
    else if (dir_down) y=1;
    if (dir_left)  x=-1;
    else if (dir_right) x=1;

    var dist = Math.pow(x*x + y*y, 0.5);
    if (dist == 0) return {x:0, y:0};
    return {x: x/dist, y: y/dist};
}

function point_colision(x, y) {
    var tx = parseInt(x/tile_size);
    var ty = parseInt(y/tile_size);
    if (tiles[ty*map_wtile+tx].block) {
        return true;
    } else return false;

}
function check_colision(x, y, r) {
    if (x-r<0 || x+r>=map_w || y-r<0 || y+r>=map_h) 
        return true;
    if (point_colision(x-r, y-r)) return true;
    if (point_colision(x+r, y-r)) return true;
    if (point_colision(x-r, y+r)) return true;
    if (point_colision(x+r, y+r)) return true;
    return false;
} 

function change_pos(x, y) {
    map_playerx = x;
    map_playery = y;
    var sw = renderer.width;
    var sh = renderer.height;
    
    if (map_w <= sw) {
        map_startx = parseInt((map_w-sw)/2);
    } else {
        map_startx = map_playerx - parseInt(sw/2);
        if (map_startx < 0)
            map_startx = 0;
        else if (map_startx + sw > map_w)
            map_startx = map_w-sw;
    }
    if (map_h <= sh) {
        map_starty = parseInt((map_h-sh)/2);
    } else {
        map_starty = map_playery - parseInt(sh/2);
        if (map_starty < 0)
            map_starty = 0;
        else if (map_starty + sh > map_h)
            map_starty = map_h-sh;
    }

    player.x = map_playerx - map_startx;
    player.y = map_playery - map_starty;
}

function setup() {
    // tiles
    sprites = new ParticleContainer(10000);
    stage.addChild(sprites);
    var tex = resources["tile"].texture;
    var tex1 = new Texture(tex, new Rectangle(0, 24, 24, 24));
    var tex0 = new Texture(tex, new Rectangle(0, 0, 24, 24));
    var startx = 0;
    var starty = 0;
    for (var i=0; i<map_htile; ++i) {
        for (var j=0; j<map_wtile; ++j) {
            var c = j%block;
            var r = i%block;
            var x = j*tile_size;
            var y = i*tile_size;
            if (data[r*block+c] == 1) {
                var one = new Sprite(tex1);
                one.position.x = x;
                one.position.y = y;
                //one.position.x = Math.random() * renderer.width;
                //one.position.y = Math.random() * renderer.height;
                one.block = true;
            } else {
                var one = new Sprite(tex0);
                one.position.x = x;
                one.position.y = y;
                one.block = false;
            }
            sprites.addChild(one);
            tiles.push(one);
        }
    } 
    // player
    var tex = resources["player"].texture;
    var tex1 = new Texture(tex, new Rectangle(0,0,24,24));
    player = new Sprite(tex1);
    player.anchor.x = 0.5;
    player.anchor.y = 0.7;
    stage.addChild(player);

    change_pos(24+12, 24+12);


    // light
    light = new Graphics();
    stage.addChild(light);

    // fps
    fps_text = new Text('fps:', {font:"18px Arial", fill:0xffffff});
    var wh = windowSize();
    fps_text.x = 0;
    fps_text.y = wh.h - 20;
    stage.addChild(fps_text);

    debug = new Text('', {font:"18px Arial", fill:0xffffff});
    stage.addChild(debug);

    // start animating
    animate();
    function animate() {
        tick += 1;
        var time = new Date().getTime();
        var elapsed = time - lasttick;
        if (elapsed >= 100) {
            var fps = tick/(time - lasttick)*1000;
            tick = 0;
            lasttick= time;
            fps_text.text = "fps: "+fps.toFixed(2);
        }
        if (!lasttime) elapsed = 0;
        else elapsed = time-lasttime;
        lasttime = time;
        var dist = elapsed*0.001*speed;
        var dir = player_dir();
        var x = map_playerx;
        var y = map_playery;
        var dx = parseInt(dir.x * dist);
        var dy = parseInt(dir.y * dist);
        
        if (check_colision(x+dx, y+dy, 8)) {
            if (check_colision(x+dx, y, 8)) {
                if (check_colision(x, y+dy, 8)) {
                    dx = 0; dy=0;
                } else { dx = 0;}
            } else { dy=0; }
        }
        if (dx!=0 || dy!=0) {
            change_pos(x+dx, y+dy);
            player.position.x = player.x;
            player.position.y = player.y;
        }

        var lx = parseInt(map_playerx/tile_size);
        var ly = parseInt(map_playery/tile_size);
        if (lx != lightx || ly != lighty) {
            lightx = lx;
            lighty = ly;
            lines = los(lightx, lighty, tiles, map_wtile, map_htile, 14);
        }
        if (lines) {
            los_draw();
            //los_draw_lines();
        }
        sprites.removeChildren();

        var offsetx = map_startx;
        var offsety = map_starty;
        var tx;
        var ty;
        var w;
        var h;
        if (offsetx > 0) {
            tx = parseInt(offsetx/tile_size);
            offsetx = tx*tile_size - offsetx;
            w = renderer.width-offsetx;
        } else {
            tx = 0;
            offsetx = -offsetx;
            w = renderer.width;
        }
        if (offsety > 0) {
            ty = parseInt(offsety/tile_size);
            offsety = ty*tile_size - offsety;
            h = renderer.height-offsety;
        } else {
            ty = 0;
            offsety = -offsety;
            h = renderer.height;
        }
        var row = parseInt((h+tile_size)/tile_size)+ty;
        var col = parseInt((w+tile_size)/tile_size)+tx;
        if (row > map_htile) row = map_htile;
        if (col > map_wtile) col = map_wtile;
        var x;
        var y = offsety;
        for (var i=ty; i<row; ++i) {
            x = offsetx;
            for (var j=tx; j<col; ++j) {
                var spr =  tiles[i*map_wtile+j];
                sprites.addChild(spr);
                spr.position.x = x;
                spr.position.y = y;
                x += tile_size;
            }
            y += tile_size;
        }
        debug.text = renderer.width+":"+renderer.height+" "+
            offsetx+":"+offsety+" "+
            map_startx+":"+map_starty+" "+
            map_w+":"+map_h+"    "+
            map_playerx+":"+map_playery+" ";
        requestAnimationFrame(animate);
        renderer.render(stage);
    }
}

//----------------------------------------------------
//los
//----------------------------------------------------
function los_draw_lines() {
    light.clear()
    light.lineStyle(1, 0xffd900, 1);
    for (var i=0; i<lines.length; ++i) {
        var one = lines[i];
        light.moveTo(one.x1*tile_size-map_startx, 
                     one.y1*tile_size-map_starty);
        light.lineTo(one.x2*tile_size-map_startx, 
                     one.y2*tile_size-map_starty);
    }
}

function los_draw() {
    light.clear()
    //light.lineStyle(1, 0xffd900, 0.5);
    light.beginFill(0x000000, 0.3);
    var one = lines[0];
    light.moveTo(one.x1*tile_size-map_startx, 
                 one.y1*tile_size-map_starty);
    for (var i=0; i<lines.length; ++i) {
        var one = lines[i];
        light.lineTo(one.x2*tile_size-map_startx, 
                     one.y2*tile_size-map_starty);
    }
    light.endFill();
}

function los(lightx, lighty, tiles, w,h,range) {
    var lines = [];
    var startx = lightx-range;
    if (startx < 0) startx = 0;
    var endx = lightx+range+1;
    if (endx > w) endx = w;

    var starty = lighty-range;
    if (starty < 0) starty = 0;
    var endy = lighty+range+1;
    if (endy > h) endy = h;

    // light face lines, base tile
    for (var y=starty; y<endy; ++y) {
        for (var x=startx; x<endx; ++x) {
            var i = y*map_wtile + x;
            if (tiles[i].block) {//} || x==startx || x==(endx-1) || y==starty || y==(endy-1)) {
                if (lightx > x) { // right
                    var near = tiles[i+1];
                    if (!near.block) {
                        lines.push({x1:x+1, y1:y, x2:x+1, y2:y+1})
                    }
                } else if (lightx < x) { // left
                    var near = tiles[i-1];
                    if (!near.block) {
                        lines.push({x1:x, y1:y+1, x2:x, y2:y})
                    }
                }
                if (lighty > y) { // bottom
                    var near = tiles[i+map_wtile];
                    if (!near.block) {
                        lines.push({x1:x+1, y1:y+1, x2:x, y2:y+1})
                    }
                } else if (lighty < y) { // top
                    var near = tiles[i-map_wtile];
                    if (!near.block) {
                        lines.push({x1:x, y1:y, x2:x+1, y2:y})
                    }
                }
            }
        }
    }

    var y = starty;
    for (var x=startx; x<endx; ++x) {
        var i = y*map_wtile + x;
        if (!tiles[i].block) {
            lines.push({x1:x+1, x2:x, y1:y, y2:y})
        }
    }

    var y = endy-1;
    for (var x=startx; x<endx; ++x) {
        var i = y*map_wtile + x;
        if (!tiles[i].block) {
            lines.push({x1:x, x2:x+1, y1:y+1, y2:y+1})
        }
    }

    var x = startx;
    for (var y=starty; y<endy; ++y) {
        var i = y*map_wtile + x;
        if (!tiles[i].block) {
            lines.push({x1:x, x2:x, y1:y, y2:y+1})
        }
    }

    var x = endx-1;
    for (var y=starty; y<endy; ++y) {
        var i = y*map_wtile + x;
        if (!tiles[i].block) {
            lines.push({x1:x+1, x2:x+1, y1:y+1, y2:y})
        }
    }

    //console.log(lines.length);
    //for (var i=0; i<lines.length; ++i) {
    //    var v = lines[i];
    //    console.log(v.x1+"~"+v.x2+" "+v.y1+"~"+v.y2+" "+v.distance);
    //}
    // face line distance
    var lx = (lightx*tile_size) + (tile_size>>1);
    var ly = (lighty*tile_size) + (tile_size>>1);
    for (var i=0; i<lines.length; ++i) {
        var v = lines[i];
        var cx = (((v.x2-v.x1)*tile_size)>>1) + (v.x1*tile_size);
        var cy = (((v.y2-v.y1)*tile_size)>>1) + (v.y1*tile_size);
        v.distance = (cx-lx)*(cx-lx) + (cy-ly)*(cy-ly)
    }
    
    var locate_next = function(l, lines) {
        for (var i=0; i<lines.length; ++i) {
            var v = lines[i];
            if (l.x2 == v.x1 && l.y2 == v.y1)
                return v
        }
    }

    // locate next, prev
    for (var i=0; i<lines.length; ++i) {
        var v = lines[i];
        if (!v.next) {
            var next = locate_next(v, lines);
            if (next) {
                v.next = next;
                next.prev = v;
                //console.log(v+" next:"+next);
            }
        }
    }

    // sort
    lines.sort(function(l1,l2) {
        return l1.distance - l2.distance;
    })

    //console.log(lines.length);
    //for (var i=0; i<lines.length; ++i) {
    //    var v = lines[i];
    //    console.log(v.x1+"~"+v.x2+" "+v.y1+"~"+v.y2+" "+v.distance);
    //}

    // 
    var rays = [];
    for (var i=0; i<lines.length; ++i) {
        var v = lines[i];
        if (!v.next) {
            var ray = {x1:lightx+0.5, y1:lighty+0.5, x2:v.x2, y2:v.y2};
            for (var j=0; j<lines.length; ++j) {
                var v2 = lines[j];
                if (v2 != v) {
                    var inte = line_intersection(ray, v2);
                    if (inte) {
                        var x = inte.x;
                        var y = inte.y;
                        var lnew = {x1:v.x2, y1:v.y2, x2:x,y2:y, 
                            prev:v, next:v2, isray : true};
                        v.next = lnew;
                        v2.x1 = x;
                        v2.y1 = y;
                        v2.prev = lnew;
                        rays.push(lnew);
                        break;
                    }
                }
            }
        }
        if (!v.prev) {
            var ray = {x1:lightx+0.5, y1:lighty+0.5, x2: v.x1, y2:v.y1};
            for (var j=0; j<lines.length; ++j) {
                var v2 = lines[j];
                if (v2 != v) {
                    var inte = line_intersection(ray, v2);
                    if (inte) {
                        var x = inte.x;
                        var y = inte.y;
                        var lnew = {x1:x, y1:y, x2:v.x1,y2:v.y1, 
                            prev:v2, next:v, isray : true};
                        v.prev = lnew;
                        v2.x2 = x;
                        v2.y2 = y;
                        v2.next = lnew;
                        rays.push(lnew);
                        break;
                    }
                }
            }
        }
    }

    if (lines.length > 0) {
        var tmp = []
        var first = lines[0];
        tmp.push(first);
        first.select = true
        var cur = first.next
       // while (cur && (!cur.select)) {
        while (cur && cur != first) {
            tmp.push(cur)
            cur.select = true
            cur = cur.next
        }
        lines = tmp
    }
   
    //console.log(lines.length);
    //for (var i=0; i<lines.length; ++i) {
    //    var v = lines[i];
    //    console.log(v.x1+"~"+v.x2+" "+v.y1+"~"+v.y2+" "+v.distance);
    //}
    //for (var i=0; i<rays.length; ++i) {
    //    lines.push(rays[i]);
   // }
    return lines
}

function line_intersection(l1, l2) {
    // 如果分母为0 则平行或共线, 不相交
    var denominator = (l1.y2 - l1.y1)*(l2.x2 - l2.x1) - 
                        (l1.x1 - l1.x2)*(l2.y1 - l2.y2);
    if (denominator== 0)
        return
    var x = ( (l1.x2 - l1.x1) * (l2.x2 - l2.x1) * (l2.y1 - l1.y1) 
                + (l1.y2 - l1.y1) * (l2.x2 - l2.x1) * l1.x1 
                - (l2.y2 - l2.y1) * (l1.x2 - l1.x1) * l2.x1 ) / denominator ;
    var y = -( (l1.y2 - l1.y1) * (l2.y2 - l2.y1) * (l2.x1 - l1.x1) 
                + (l1.x2 - l1.x1) * (l2.y2 - l2.y1) * l1.y1 
                - (l2.x2 - l2.x1) * (l1.y2 - l1.y1) * l2.y1 ) / denominator;
    if (((x - l2.x1) * (x - l2.x2) <= 1e-10) &&
       ((y - l2.y1) * (y - l2.y2) <= 1e-10) && // 交点在l2上
       ((l1.x1-l1.x2) * (l1.x2-x) >= 1e-10) && 
       ((l1.y1-l1.y2) * (l1.y2-y) >= 1e-10)) { // 交点在l1的方向上
        return {x:x, y:y}
    }
}

//----------------------------------------------------
//window
//----------------------------------------------------
window.addEventListener("keydown", function(e) {
    var key = e.keyCode;
    //console.log(key);
    if (key==38 || key==87)
        dir_up = true;
    else if (key==40 || key==83)
        dir_down = true;
    if (key==37 || key==65)
        dir_left = true;
    else if (key==39 || key==68)
        dir_right= true;
})
window.addEventListener("keyup", function(e) {
    var key = e.keyCode;
    //console.log(key);
    if (key==38 || key==87)
        dir_up = false;
    if (key==40 || key==83)
        dir_down = false;
    if (key==37 || key==65)
        dir_left = false;
    if (key==39 || key==68)
        dir_right = false;
})

window.addEventListener("resize", function(e) {
    var wh = windowSize()
    renderer.resize(wh.w,wh.h);
    change_pos(map_playerx, map_playery);
    // sprite on resize

    fps_text.y = wh.h - 20;

})
window.addEventListener("click", function(e) {
    fullScreen(document.documentElement); // hole html
})

function windowSize() {
    return { 
        w: window.innerWidth ||
            document.documentElement.clientWidth ||
            document.body.clientWidth,
        h: window.innerHeight ||
	        document.documentElement.clientHeight ||
	        document.body.clientHeight
    }
}

function fullScreen(element) {
    if(element.requestFullscreen) {
        element.requestFullscreen();
    } else if(element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
    } else if(element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen();
    } else if(element.msRequestFullscreen) {
        element.msRequestFullscreen();
    }
}
