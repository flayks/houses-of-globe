import Object3d from './Object3d';
import Container from './Container';
import * as mat4 from './glMatrix/mat4';
import * as vec3 from './glMatrix/vec3';
import * as quat from './glMatrix/quat';

const TOUCH      = ('ontouchstart' in window) || (navigator.msMaxTouchPoints > 0);
const POINTER    = !!window.navigator.pointerEnabled;
const MS_POINTER = !!window.navigator.msPointerEnabled;

const POINTER_DOWN = TOUCH ? 'touchstart' : (POINTER ? 'pointerdown' : (MS_POINTER ? 'MSPointerDown' : 'mousedown' ) );
const POINTER_MOVE   = TOUCH ? 'touchmove'  : (POINTER ? 'pointermove' : (MS_POINTER ? 'MSPointerMove' : 'mousemove' ) );
const POINTER_UP = TOUCH ? 'touchend'   : (POINTER ? 'pointerup'   : (MS_POINTER ? 'MSPointerUp'   : 'mouseup'   ) );



var objects = []

function needsUpdateLoop() {
 requestAnimationFrame(needsUpdateLoop);
 for (let i=0; i<objects.length; i++) {
   objects[i]._canUpdate = true;
 }
}

needsUpdateLoop();


class Camera extends Object3d {

  constructor(options) {

    super();

    options = Object.assign({},{
      fov:    45,
      aspect: window.innerWidth / window.innerHeight,
      near:   10,
      far:    1000,
      type:  'perspective',
      left:   0,
      right:  0,
      top:    0,
      bottom: 0,
      orbitControl: false,
      lookAt: null,
      pointerParent: document,
      firstPerson: false,
      moveSpeed: 20,
      distance: 20,
      wheel: true,
      position: [0,0,0]
    }, options);

    this.fov    = options.fov;
    this.aspect = options.aspect;
    this.near   = options.near;
    this.far    = options.far;
    this.type   = options.type;
    this.left   = options.left;
    this.right  = options.right;
    this.top    = options.top;
    this.bottom = options.bottom;
    this.orbitControl = options.orbitControl;
    this.firstPerson = options.firstPerson;
    this.wheel = options.wheel;

    this.projectionMatrix = mat4.create();
    this.updateProjectionMatrix();

    if ( this.orbitControl || this.firstPerson ) {
      if (!this.lookAt) {
        this.lookAt = vec3.create();
        vec3.set(this.lookAt, 0,0,0 );
      }
      this._pointerParent = options.pointerParent
      this._initPointerEvents();
      this._cameraDistance  = options.position[2];

      this._canUpdate = true;
      objects.push(this);
    }

    if (this.firstPerson) {
      document.addEventListener("contextmenu", this.onContextMenu.bind(this), false);
      document.addEventListener("keydown", this.onKeyDown.bind(this), false);
      document.addEventListener("keyup", this.onKeyUp.bind(this), false);
    }


    this.pitchObject = new Container();
    this.yawObject   = new Container();
    this.yawObject.add( this.pitchObject );
    this.moveSpeed = options.moveSpeed;
    this.time = Date.now();
    this._velocity     = vec3.create();
    this._moveForward  = false;
    this._moveBackward = false;
    this._moveLeft     = false;
    this._moveRight    = false;
    this._moveUp       = false;
    this._camera = vec3.create()
    this._oldPosition = vec3.create();

  }

  updateProjectionMatrix() {
    if (this.type == 'perspective') {
      mat4.perspective(this.projectionMatrix, this.fov * Math.PI/180.0, this.aspect, this.near, this.far);
    }
    else if(this.type == 'orthographic' || this.type == 'ortho'){
      mat4.ortho(this.projectionMatrix, this.left, this.right, this.bottom, this.top, this.near, this.far);
    }
  }

  _initPointerEvents() {

    this.winWidth = window.innerWidth;
    this.winHeight = window.innerHeight;
    this._isPointerDown = false;
    this.isRightClick = false;

    this.pointerXMove    = 0;
    this.pointerYMove    = 0;


    this.pointerX = 0;
    this.pointerY = 0;
    this.pointerZ = 0;
    this.lastPointerX = 0;
    this.lastPointerY = 0;
    this.lastPointerZ = 0;
    this.theta = 0;//Math.PI/2;
    this.phi =  0;
    this.thetaDown =  0;
    this.phiDown =  0;
    this.currTheta =  0;
    this.currPhi =  0;
    this._minPolarAngle = Math.PI * -.5; // radians
    this._maxPolarAngle = Math.PI * .5; // radians


    this._onPointerDown = this._onPointerDown.bind(this);
    this._onPointerMove = this._onPointerMove.bind(this);
    this._onPointerUp   = this._onPointerUp.bind(this);
    this._onMouseWheel  = this._onMouseWheel.bind(this);
    this.onContextMenu  = this.onContextMenu.bind(this);
    this._pointerParent.addEventListener(POINTER_DOWN, this._onPointerDown, false);
    document.addEventListener(POINTER_MOVE, this._onPointerMove, false);
    document.addEventListener(POINTER_UP, this._onPointerUp, false);
    this._pointerParent.addEventListener( "contextmenu", this.onContextMenu, false);
    if (this.wheel) {
      this._pointerParent.addEventListener( 'DOMMouseScroll', this._onMouseWheel,  false );
      this._pointerParent.addEventListener( 'mousewheel',     this._onMouseWheel,  false );
    }
  }

  delete() {
    this._pointerParent.removeEventListener(POINTER_DOWN, this._onPointerDown, false);
    document.removeEventListener(POINTER_MOVE, this._onPointerMove, false);
    document.removeEventListener(POINTER_UP, this._onPointerUp, false);
    this._pointerParent.removeEventListener( "contextmenu", this.onContextMenu, false);
    if (this.wheel) {
      this._pointerParent.removeEventListener( 'DOMMouseScroll', this._onMouseWheel,  false );
      this._pointerParent.removeEventListener( 'mousewheel',     this._onMouseWheel,  false );
    }
  }

  onContextMenu(e) {
    event.preventDefault();
  }

  onKeyDown(event) {
    switch ( event.keyCode ) {
      // case 38: // up
      case 87: // w
        this._moveForward = true;
        break;
      // case 37: // left
      case 65: // a
        this._moveLeft = true; break;

      // case 40: // down
      case 83: // s
        this._moveBackward = true;
        break;
      // case 39: // right
      case 68: // d
        this._moveRight = true;
        break;
      case 32: // space
        this._velocity[1] += 5;
        break;
    }
  }
  onKeyUp(event) {
    switch( event.keyCode ) {
      case 38: // up
      case 87: // w
        this._moveForward = false;
        break;
      case 37: // left
      case 65: // a
        this._moveLeft = false;
        break;
      case 40: // down
      case 83: // s
        this._moveBackward = false;
        break;
      case 39: // right
      case 68: // d
        this._moveRight = false;
        break;
    }
  }

  _onMouseWheel(e) {
    // e.preventDefault();
    e.stopPropagation();
    var wheelDeltaX, wheelDeltaY;
    if ( e.wheelDelta ){
        wheelDeltaX = wheelDeltaY = e.wheelDelta; //6 or 12
    } else if ( e.detail ){
        wheelDeltaX = wheelDeltaY = -e.detail * 40; // *3
    } else if ( e.wheelDeltaX ) {
        wheelDeltaY = e.wheelDeltaY/12;
        wheelDeltaX = -1 * e.wheelDeltaX/12;
    } else if ( e.axis !== undefined && e.axis === e.HORIZONTAL_AXIS ) {
        wheelDeltaY = 0;
        wheelDeltaX = -1 * wheelDeltaY;
    } else {
        wheelDeltaY = 0;
        wheelDeltaX = 0;
    }

    // this._cameraDistance += wheelDeltaY * -2 * 0.01;
    // this._cameraDistance = Math.max(3, Math.min(5, this._cameraDistance));

  }

  _onPointerDown(event) {
    if (event.which == 3) {
      this.isRightClick = true;
      // event.preventDefault();
      // event.stopPropagation();
    }

    this._isPointerDown = true;

    this._pointerParent.classList.add('is-grabbing')

    this.touchEvent  = TOUCH ? (event.touches[0] || event.changedTouches[0]) : event;

    this.touchEventPageX = this.touchEvent.pageX;
    this.touchEventPageY = this.touchEvent.pageY;
    this.touchEventPageX -= window.pageXOffset || document.documentElement.scrollLeft;
    this.touchEventPageY -= window.pageYOffset || document.documentElement.scrollTop;

    this.pointerXDown     = this.touchEventPageX;
    this.pointerYDown     = this.touchEventPageY;

    if (this.isRightClick) {
      this.startPointerX    = this.pointerXMove;
      this.startPointerY    = this.pointerYMove;
    }

    this.thetaDown = this.theta;
    this.phiDown   = this.phi;

  }

  _onPointerMove(event) {

    if( !this._isPointerDown){
        return;
    }

    // event.preventDefault();

    this.touchEvent  = TOUCH ? (event.touches[0] || event.changedTouches[0]) : event;
    this.touchEventPageX = this.touchEvent.pageX;
    this.touchEventPageY = this.touchEvent.pageY;
    this.touchEventPageX -= window.pageXOffset || document.documentElement.scrollLeft;
    this.touchEventPageY -= window.pageYOffset || document.documentElement.scrollTop;


    if (this.isRightClick) {
      this.pointerXMove = this.startPointerX + (this.touchEventPageX - this.pointerXDown);
      this.pointerYMove = this.startPointerY + (this.touchEventPageY - this.pointerYDown);
    }
    else {
      this.pointerXOrbiter = (this.pointerXDown - this.touchEventPageX);
      this.pointerYOrbiter = (this.pointerYDown - this.touchEventPageY);
      this.theta = this.thetaDown + ( this.pointerXOrbiter / this.winWidth * 2 * Math.PI);
      this.phi   = this.phiDown   + ( this.pointerYOrbiter / this.winHeight * 2 * Math.PI * -1);
      this.phi   = Math.max( this._minPolarAngle, Math.min( this._maxPolarAngle, this.phi ) );

      if( TOUCH ) {
        this.phi = 0;
      }

    }


  }

  _onPointerUp() {
    this._isPointerDown = false;
    this.isRightClick = false;
    this._pointerParent.classList.remove('is-grabbing')
  }

  update(force) {

    if (this.orbitControl) {
      if (this._canUpdate || force) {
        this.currTheta += (this.theta - this.currTheta) * 0.1;
        this.currPhi   += (this.phi - this.currPhi) * 0.1;
        this.position[0] = Math.sin(this.currTheta) * Math.cos(this.phi) * this._cameraDistance;
        this.position[1] = Math.sin(this.phi) * this._cameraDistance;
        this.position[2] = Math.cos(this.currTheta) * Math.cos(this.phi) * this._cameraDistance;
        super.render();
      }
    }
    else {
      super.render();
    }

    this._canUpdate = false;

  }

}


export default Camera;