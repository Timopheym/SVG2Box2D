/**
 * @author Timophey Molchanov <timopheym@gmail.com>
 * @class Box2D
 * @extends Object
 * Date: 10/14/13 2:38 PM
 *
 */

var Box2Dapp = function() {};
Box2Dapp.lastbody = undefined;
Box2Dapp.prototype.groupBodys = function(body1,body2) {

    def = new Box2D.Dynamics.Joints.b2RevoluteJointDef();
    def.Initialize(body1, body2, new b2Vec2(22, 14));
    joint = physics.world.CreateJoint(def)
    def = new Box2D.Dynamics.Joints.b2RevoluteJointDef();
    def.Initialize(body1, body2, new b2Vec2(0, 0));
    joint = physics.world.CreateJoint(def)
};
Box2Dapp.prototype.addTriangle = function(polygon) {
    var points = [];

    for (var i = 0; i < polygon.length; i++) {
        points.push({
            x : polygon[i][0]/30,
            y : polygon[i][1]/30
        })
    }

    var body = new Body(physics, {
        shape: 'polygon',
        points : points,
        color: 'black',
        x: 3,
        y: 5
    }).body;

    if (Box2Dapp.lastbody !== undefined) {
        Box2Dapp.prototype.groupBodys(Box2Dapp.lastbody,body);
    }
    Box2Dapp.lastbody = body;
};
Box2Dapp.prototype.loadTriangulatedPolygons = function(triangulatedPolygons) {
    for (var i = 0; i < triangulatedPolygons.length; i++) {
        this.addTriangle(triangulatedPolygons[i]);
    }
    Box2Dapp.lastbody = undefined;
};
Box2Dapp.prototype.createWorld = function() {

    physics = window.physics = new Physics(document.getElementById("b2dCanvas"));

    // Remove any old event handlers
    physics.element.removeEventListener("mousedown");
    physics.element.removeEventListener("mousemove");
    physics.element.removeEventListener("mouseup");

    // Create some walls
    new Body(physics, {
        color: "red",
        type: "static",
        x: 0,
        y: 0,
        height: 50,
        width: 0.5
    });
    new Body(physics, {
        color: "red",
        type: "static",
        x: 51,
        y: 0,
        height: 50,
        width: 0.5
    });
    new Body(physics, {
        color: "red",
        type: "static",
        x: 0,
        y: 0,
        height: 0.5,
        width: 120
    });
    new Body(physics, {
        color: "red",
        type: "static",
        x: 0,
        y: 25,
        height: 0.5,
        width: 120
    });


    physics.dragNDrop();

    this.setupJoint(physics);
}


var currentJoint = -1;
var jointTypes = ["Distance Joint (solid)", "Distance Joint (springy)", "Revolute Joint", "Prismatic Joint", "Pulley Joint", "Gear Joint"];

Box2Dapp.prototype.setupJoint = function(physics) {
    currentJoint = (currentJoint + 1) % jointTypes.length;

    var world = physics.world;
    var def, body1, body2;

    switch (currentJoint) {
        case 0:
            //  Distance Joint (solid)
            body1 = new Body(physics, {
                color: "red",
                x: 15,
                y: 12
            }).body;
            body2 = new Body(physics, {
                color: "red",
                x: 35,
                y: 12
            }).body;
            def = new Box2D.Dynamics.Joints.b2DistanceJointDef();
            def.Initialize(body1,
                body2,
                body1.GetWorldCenter(),
                body2.GetWorldCenter());
            break;
        case 1:
            // Distance Joint (springy)
            body1 = new Body(physics, {
                color: "red",
                x: 15,
                y: 12
            }).body;
            body2 = new Body(physics, {
                color: "red",
                x: 35,
                y: 12
            }).body;
            def = new Box2D.Dynamics.Joints.b2DistanceJointDef();
            def.Initialize(body1,
                body2,
                body1.GetWorldCenter(),
                body2.GetWorldCenter());
            def.dampingRatio = 0.05;
            def.frequencyHz = 1;
            break;
        case 2:
            // Revolute joint
            body1 = new Body(physics, {
                color: "red",
                x: 20,
                y: 12
            }).body;
            body2 = new Body(physics, {
                color: "red",
                x: 24,
                y: 12
            }).body;
            def = new Box2D.Dynamics.Joints.b2RevoluteJointDef();
            def.Initialize(body1, body2,
                new b2Vec2(22, 14));
            break;
        case 3:
            // Prismatic joint
            body1 = new Body(physics, {
                color: "red",
                x: 15,
                y: 12
            }).body;
            body2 = new Body(physics, {
                color: "red",
                x: 25,
                y: 12
            }).body;
            def = new Box2D.Dynamics.Joints.b2PrismaticJointDef();
            def.Initialize(body1, body2,
                new b2Vec2(20, 14),
                new b2Vec2(1, 0));
            def.enableLimit = true;
            def.lowerTranslation = 4;
            def.upperTranslation = 15;
            break;
        case 4:
            // Pulley joint
            body1 = new Body(physics, {
                color: "red",
                x: 15,
                y: 12
            }).body;
            body2 = new Body(physics, {
                color: "red",
                x: 25,
                y: 12
            }).body;
            def = new Box2D.Dynamics.Joints.b2PulleyJointDef();

            def.Initialize(body1, body2,
                new b2Vec2(13, 0),
                new b2Vec2(25, 0),
                body1.GetWorldCenter(),
                body2.GetWorldCenter(),
                1);
            break;
        case 5:
            // Gear Joint
            body1 = new Body(physics, {
                color: "red",
                x: 15,
                y: 12
            }).body;
            body2 = new Body(physics, {
                color: "red",
                x: 25,
                y: 12
            }).body;

            var def1 = new Box2D.Dynamics.Joints.b2RevoluteJointDef();
            def1.Initialize(physics.world.GetGroundBody(),
                body1,
                body1.GetWorldCenter());
            var joint1 = physics.world.CreateJoint(def1);

            var def2 = new Box2D.Dynamics.Joints.b2RevoluteJointDef();
            def2.Initialize(physics.world.GetGroundBody(),
                body2,
                body2.GetWorldCenter());
            var joint2 = physics.world.CreateJoint(def2);

            def = new Box2D.Dynamics.Joints.b2GearJointDef();

            def.bodyA = body1;
            def.bodyB = body2;

            def.joint1 = joint1;
            def.joint2 = joint2;
            def.ratio = 2;
            break;
    }

    var joint = world.CreateJoint(def);

    return joint;

};