import uuid from './utils/uuid';
import getFilter from './utils/getFilter';
import isPowerOf2 from './utils/isPowerOf2';

var TEXTURE_CACHE = {};

class Texture {

  constructor(gl, options) {
    
    if (!gl) {
      return;
    }

    this.options = Object.assign({}, {
        format: gl.RGBA,
        type:   gl.UNSIGNED_BYTE,
        width: 1,
        height: 1,
        linear: true,
        mipmap: false,
        miplinear: false,
        wrapS: gl.CLAMP_TO_EDGE,
        wrapT: gl.CLAMP_TO_EDGE,
        anisotropy: 0,
        flipY: true,
        repeat: [1,1]
      }, options);


    this._uid   = uuid();//debug purpose
    this.gl     = gl;
    this.width  = this.options.width;
    this.height = this.options.height;
    this.format = this.options.format;
    this.type   = this.options.type;
    this.flipY  = this.options.flipY;

    this.repeat = this.options.repeat;

    this._anisotropy = this.options.anisotropy;

    if (this.type == gl.FLOAT) {
      var floatTextures = gl.getExtension('OES_texture_float');
      var floatTextureLinearFiltering = gl.getExtension('OES_texture_float_linear');
      if (!floatTextures) {
          console.warn('trying to create a FrameBuffer of with gl.FLOAT type but there\s no floating point texture support. trying HALF_FLOAT');
          this.type = "HALF_FLOAT"
      }
    }

    if (this.type == "HALF_FLOAT") {
      var halfFloatTexturesExt = gl.getExtension('OES_texture_half_float');
      var halfFloatTextureLinearFiltering = gl.getExtension('OES_texture_half_float_linear');
      if (!halfFloatTexturesExt) {
        console.warn('trying to create a texture of with gl.HALF_FLOAT type but there\s no half floating point texture support; falling bck to UNSIGNED_BYTE type');
        this.type = gl.UNSIGNED_BYTE;
      }
      else {
        this.type = halfFloatTexturesExt.HALF_FLOAT_OES;
        this.isHalfFloat = true;
      }
    }

    this._texture = this.gl.createTexture();
    gl.bindTexture( gl.TEXTURE_2D, this._texture );
    
    //1x1 pixel default texture
    gl.texImage2D(gl.TEXTURE_2D, 0, this.options.format, this.width, this.height, 0, this.options.format, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 255]));

    /**
     * add getter and setter to update texture_wrap when this.wrap changes
     */
    Object.defineProperty(this, 'wrapS', {
      set: (value) => {
        this.gl.texParameteri( this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, value );
      }
    });
    Object.defineProperty(this, 'wrapT', {
      set: (value) => {
        this.gl.texParameteri( this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, value );
      }
    });
        //nPOT texture can't repeat
    this.wrapS = this.options.wrapS;
    this.wrapT = this.options.wrapT;
    
    
    //nPOT texture cannot mipmap
    this.setFilter( this.options.linear, this.options.mipmap, this.options.mipmapLinear );

    //unbind texture
    gl.bindTexture( gl.TEXTURE_2D, null);


    
    Object.defineProperty(this, 'anisotropy', {
      set: (value) => {
        this._anisotropy = value
        this.updateAnisotropyFilter()
      },
      get: () => {
        return this._anisotropy 
      }
    });

  }

  updateAnisotropyFilter() {
    let gl = this.gl;

    if (!gl) {
        return;
    }
    var ext = (
      gl.getExtension('EXT_texture_filter_anisotropic') ||
      gl.getExtension('MOZ_EXT_texture_filter_anisotropic') ||
      gl.getExtension('WEBKIT_EXT_texture_filter_anisotropic')
    );
    if (ext) {
      if (this._anisotropy > 0) {
        gl.bindTexture( gl.TEXTURE_2D, this._texture );
        var max = gl.getParameter(ext.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
        gl.texParameterf(gl.TEXTURE_2D, ext.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(this._anisotropy, max) );
      }
    }
  }

  bindImage(img) {

    if (!this.gl) {
      return;
    }

    this.width  = img.width;
    this.height = img.height;
    var isPOT = isPowerOf2(img.width) && isPowerOf2(img.height);

    this.gl.bindTexture( this.gl.TEXTURE_2D, this._texture);
    
    this.gl.pixelStorei( this.gl.UNPACK_FLIP_Y_WEBGL, this.flipY);
    
    // console.log('BIND2D', img)
    this.gl.texImage2D(  this.gl.TEXTURE_2D, 0, this.format, this.format, this.type, img);
    
    if (isPOT) {
      //nPOT texture cannot mipmap
      this.setFilter( this.options.linear, this.options.mipmap, this.options.mipmapLinear );
      this.gl.generateMipmap(this.gl.TEXTURE_2D);
    }
    else {
      this.setFilter(this.options.linear, false, false);
      this.wrapS = this.gl.CLAMP_TO_EDGE;
      this.wrapT = this.gl.CLAMP_TO_EDGE;
    }

    this.gl.bindTexture( this.gl.TEXTURE_2D, null);
    
  }
  
  bind(unit) {
    if (!this.gl) {
      return;
    }
    //unit is sent by the Program and defined by the unfirom order in the shaders; 
    if (unit !== void 0) {
      this.gl.activeTexture( this.gl.TEXTURE0 + (0|unit) );
    }
    this.gl.bindTexture(this.gl.TEXTURE_2D, this._texture);
  }

  delete() {
    if (this.gl) {
      this.gl.deleteTexture( this._texture );
    }
    this._texture = null;
    this.gl = null;
  }

  /**
   * Change the filtering parameters
   *   @param {boolean} [smooth=false]    if true, use LINEAR filtering
   *   @param {boolean} [mipmap=false]    if true, enable mipmaping
   *   @param {boolean} [miplinear=false] if true, use linear Mipmapping
   */
  setFilter(smooth, mipmap, miplinear) {

    
    if (!this.gl) {
        return;
    }
    var gl = this.gl;
    var filter = getFilter( !!smooth, !!mipmap, !!miplinear);
    gl.bindTexture( gl.TEXTURE_2D, this._texture );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, getFilter( !!smooth, false, false ) );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter );
    this.updateAnisotropyFilter()
  }

}


Texture.fromUrl = function(gl, url, options) {

  var texture = new Texture(gl, options);

  // if (TEXTURE_CACHE[url] !== void 0) {
  //   this.fromImage( gl, TEXTURE_CACHE[url] );
  //   return;
  // }

  var img = new Image();

  img.onload = ()=>{
    img.onload = null;
    img.onerror = null;
    TEXTURE_CACHE[url] = img;
    options && options.loaded && options.loaded()
    texture.bindImage(img);
  }; 

  img.onerror = ()=>{
    img.onload = null;
    img.onerror = null;
    console.warn('Invalid url provided to Texture.fromUrl() : ' + url);
  };
  
  img.src = url;

  return texture;
};

Texture.fromImage = function(gl, img, options) {
  if (!img.width || !img.height) {
    console.warn('Cannot create texture with provided image\n Please make sure the image is loaded before calling Texture.fromImage() or use Texture.fromUrl()', img);
    return;
  }
  var texture = new Texture(gl, options);
  texture.bindImage(img);
  return texture;
};



export default Texture;
