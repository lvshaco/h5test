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
    1, 1, 1, 1, 0, 0, 1, 1, 1, 1,
];

var autoDetectRenderer = PIXI.autoDetectRenderer,
    Container = PIXI.Container,
    loader = PIXI.loader,
    resources = PIXI.loader.resources,
    Sprite = PIXI.Sprite,
    Rectangle = PIXI.Rectangle,
    Texture = PIXI.Texture,
    Text = PIXI.Text,
    ParticleContainer = PIXI.ParticleContainer;

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
.on('progress', function(loader, resource) {
    console.log("loading...")
})
.load(setup);

var fps_text;
var lasttime = new Date().getTime();
var tick=0;

var tiles = [];
function setup() {
    var sprites = new ParticleContainer(10000);
    stage.addChild(sprites);
    var tex = resources["tile"].texture;
    var tex1 = new Texture(tex, new Rectangle(0, 24, 24, 24));
    var tex0 = new Texture(tex, new Rectangle(0, 0, 24, 24));
    var startx = 0;
    var starty = 0;
    for (var bi=0; bi<4; ++bi) {
        starty = bi*(24*10);
        for (var bj=0; bj<6; ++bj) {
            startx = bj*(24*10);
            for (var i=0; i<10; ++i) {
                for (var j=0; j<10; ++j) {
                    if (data[i*10+j] == 1) {
                        var one = new Sprite(tex1);
                        one.position.x = j*24 + startx;
                        one.position.y = i*24 + starty;
                        one.position.x = Math.random() * renderer.width;
                        one.position.y = Math.random() * renderer.height;
                        sprites.addChild(one);
                    } else {
                        var one = new Sprite(tex0);
                        one.position.x = j*24 + startx;
                        one.position.y = i*24 + starty;
                        sprites.addChild(one);
                    }
                }
            }
        }
    }

    fps_text = new Text('fps:', {font:"18px Arial", fill:0xffffff});
    var wh = windowSize();
    fps_text.x = 0;
    fps_text.y = wh.h - 20;
    stage.addChild(fps_text);

    // start animating
    animate();
    function animate() {
        tick += 1;
        var time = new Date().getTime();
        if (time - lasttime >= 1000) {
            var fps = tick/(time - lasttime)*1000;
            tick = 0;
            lasttime = time;
            fps_text.text = "fps: "+fps.toFixed(2);
        }
        requestAnimationFrame(animate);
        renderer.render(stage);
    }
}

//----------------------------------------------------
var dir_up = false;
var dir_down = false;
var dir_left = false;
var dir_right = false;
window.addEventListener("keydown", function(e) {
    var key = e.keyCode;
    console.log(key);
    dir_up = false;
    dir_down = false;
    dir_left = false;
    dir_right = false;
    if (key==38 || key==87)
        dir_up = true;
    if (key==40 || key==83)
        dir_down = true;
    if (key==37 || key==65)
        dir_left = true;
    if (key==39 || key==68)
        dir_right = true;
})
window.addEventListener("resize", function(e) {
    var wh = windowSize()
    renderer.resize(wh.w,wh.h);

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
