
class Renderer {
  
  constructor(options) {

    this.canvas = (options && options.canvas) || document.createElement('canvas');
    
    this.canvas.style.transformOrigin = '0 0';

    this.contextAttributes = Object.assign({},{
      alpha: false,
      depth: true,
      stencil: true,
      antialias: false,
      premultipliedAlpha: true,
      preserveDrawingBuffer: false,
      failIfMajorPerformanceCaveat: false,
    }, (options || {}) );

    this._pixelRatio = 1;

    this.gl = this.canvas.getContext("experimental-webgl", this.contextAttributes);

      this.handleContextLost =  this.handleContextLost.bind(this);
      this.handleContextRestored =  this.handleContextRestored.bind(this);
      this.canvas.addEventListener('webglcontextlost', this.handleContextLost, false);
      this.canvas.addEventListener('webglcontextrestored', this.handleContextRestored, false);

  }

  handleContextLost(event){
      event.preventDefault();
  }

  handleContextRestored(){
    
  }

  handleContextRestored() {

  }

  render(container, camera, frameBuffer, preventCameraUpdate) {

    if (!this.gl) {
      return;
    }

    if (!preventCameraUpdate) {
      camera.update();
    }
    
    if (frameBuffer){ 
      frameBuffer.bindFrame(); 
      container.render( camera );
      frameBuffer.unbind();
    }
    else{
      this.gl.viewport(0, 0, this._width* this._pixelRatio , this._height* this._pixelRatio );
      container.render( camera );
    }

  }

  resize(width, height) {
    if (!this.gl) {
      return;
    }
    this._width  = width;
    this._height = height;
    this.canvas.width  = this._width * this._pixelRatio;
    this.canvas.height = this._height * this._pixelRatio;
    this.canvas.style.transform = 'scale('+(1/this._pixelRatio)+') translateZ(0)';
    this.gl.viewport(0, 0, this._width* this._pixelRatio , this._height* this._pixelRatio );
  }

  clearColor(r, g, b, alpha) {
    if (!this.gl) {
      return;
    }
    this.gl.clearColor(r, g, b, alpha);
  }

  clear(color, depth, stencil) {
    if (!this.gl) {
      return;
    }
    var bits = 0;
    if ( color === void 0 || color ) bits |= this.gl.COLOR_BUFFER_BIT;
    if ( depth === void 0 || depth ) bits |= this.gl.DEPTH_BUFFER_BIT;
    if ( stencil === void 0 || stencil ) bits |= this.gl.STENCIL_BUFFER_BIT;
    this.gl.clear( bits );
  }

  setPixelRatio(ratio) {
    this._pixelRatio = ratio;
    this.resize(this._width, this._height);
  }

}


export default Renderer;