/**
 * @author Timophey Molchanov <timopheym@gmail.com>
 * @class Physics
 * @extends Object
 * Date: 10/14/13 2:24 PM
 *
 */


    var Physics = window.Physics = function(element, scale) {
        var gravity = new b2Vec2(0, 9.8);
        this.world = new b2World(gravity, true);
        this.element = element;
        this.context = element.getContext("2d");
        this.scale = scale || 20;
        this.dtRemaining = 0;
        this.stepAmount = 1 / 60;
    };

    Physics.prototype.debug = function() {
        this.debugDraw = new b2DebugDraw();
        this.debugDraw.SetSprite(this.context);
        this.debugDraw.SetDrawScale(this.scale);
        this.debugDraw.SetFillAlpha(0.3);
        this.debugDraw.SetLineThickness(1.0);
        this.debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
        this.world.SetDebugDraw(this.debugDraw);
    };

    Physics.prototype.step = function(dt) {
        this.dtRemaining += dt;
        while (this.dtRemaining > this.stepAmount) {
            this.dtRemaining -= this.stepAmount;
            this.world.Step(this.stepAmount,
                10, // velocity iterations
                10); // position iterations
        }
        if (this.debugDraw) {
            this.world.DrawDebugData();
        } else {
            var obj = this.world.GetBodyList();
            this.context.clearRect(0, 0, this.element.width, this.element.height);

            this.context.save();
            this.context.scale(this.scale, this.scale);
            while (obj) {
                var body = obj.GetUserData();
                if (body) {
                    body.draw(this.context);
                }

                obj = obj.GetNext();
            }
            this.context.restore();
        }
    };


    Physics.prototype.click = function(callback) {
        var self = this;

        function handleClick(e) {
            e.preventDefault();
            var point = {
                x: (e.offsetX || e.layerX) / self.scale,
                y: (e.offsetY || e.layerY) / self.scale
            };

            self.world.QueryPoint(function(fixture) {
                callback(fixture.GetBody(),
                    fixture,
                    point);
            }, point);
        }

        this.element.addEventListener("mousedown", handleClick);
        this.element.addEventListener("touchstart", handleClick);
    };

    Physics.prototype.dragNDrop = function() {
        var self = this;
        var obj = null;
        var joint = null;

        function calculateWorldPosition(e) {
            return point = {
                x: (e.offsetX || e.layerX) / self.scale,
                y: (e.offsetY || e.layerY) / self.scale
            };
        }

        this.element.addEventListener("mousedown", function(e) {
            e.preventDefault();
            var point = calculateWorldPosition(e);
            self.world.QueryPoint(function(fixture) {
                obj = fixture.GetBody().GetUserData();
            }, point);
        });

        this.element.addEventListener("mousemove", function(e) {
            if (!obj) {
                return;
            }
            var point = calculateWorldPosition(e);

            if (!joint) {
                var jointDefinition = new Box2D.Dynamics.Joints.b2MouseJointDef();

                jointDefinition.bodyA = self.world.GetGroundBody();
                jointDefinition.bodyB = obj.body;
                jointDefinition.target.Set(point.x, point.y);
                jointDefinition.maxForce = 100000;
                jointDefinition.timeStep = self.stepAmount;
                joint = self.world.CreateJoint(jointDefinition);
            }

            joint.SetTarget(new b2Vec2(point.x, point.y));
        });

        this.element.addEventListener("mouseup", function(e) {
            obj = null;
            if (joint) {
                self.world.DestroyJoint(joint);
                joint = null;
            }
        });

    };


    Physics.prototype.collision = function() {
        this.listener = new Box2D.Dynamics.b2ContactListener();
        this.listener.PostSolve = function(contact, impulse) {
            var bodyA = contact.GetFixtureA().GetBody().GetUserData(),
                bodyB = contact.GetFixtureB().GetBody().GetUserData();

            if (bodyA.contact) {
                bodyA.contact(contact, impulse, true)
            }
            if (bodyB.contact) {
                bodyB.contact(contact, impulse, false)
            }

        };
        this.world.SetContactListener(this.listener);
    };

    var physics,
        lastFrame = new Date().getTime();

    window.gameLoop = function() {
        var tm = new Date().getTime();
        requestAnimationFrame(gameLoop);
        var dt = (tm - lastFrame) / 1000;
        if (dt > 1 / 15) {
            dt = 1 / 15;
        }
        physics.step(dt);
        lastFrame = tm;
    };


// Lastly, add in the `requestAnimationFrame` shim, if necessary. Does nothing
// if `requestAnimationFrame` is already on the `window` object.
(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() {
                    callback(currTime + timeToCall);
                },
                timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
    }

    if (!window.cancelAnimationFrame) {
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
    }
}());