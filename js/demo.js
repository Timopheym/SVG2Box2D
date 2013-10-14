window.onload = function() {
    window.S2B = function(){};
    S2B.uploader = new Uploader();
    S2B.parser = new Parser();
    S2B.box2Dapp = new Box2Dapp();

    S2B.box2Dapp.createWorld();
    requestAnimationFrame(gameLoop);
}