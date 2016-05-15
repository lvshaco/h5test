// your tilemap containervar 
mapContainer = new PIXI.DisplayObjectContainer();
// ... add all the sprites to the container
// render the tilemap to a render texturevar 
texture = new PIXI.RenderTexture();
texture.render(mapContainer);
// create a single background sprite with the texturevar 
background = new PIXI.Sprite(texture);
// add the background to the stage
//(notice I didn't add the mapContainer to the scene graph)
stage.addChild(background);

