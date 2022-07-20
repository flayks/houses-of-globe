import UNIFORM_TYPE from './uniformTypes';
import defaultVertexShader   from './shaders/default-vs.glsl?raw';
import defaultFragmentShader from './shaders/default-fs.glsl?raw';
import uuid from './utils/uuid';

const TEXTURE_2D = 35678
const TEXTURE_CUBE_MAP = 35680;

function addLineNumbers( string ) {
  var lines = string.split( '\n' );
  for ( var i = 0; i < lines.length; i ++ ) {
      lines[ i ] = ( i + 1 ) + ': ' + lines[ i ];
  }
  return lines.join( '\n' );
}

function compileShader( gl, shader, code ){
  gl.shaderSource( shader, code );
  gl.compileShader( shader );
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Shader cannot compile: \n' + gl.getShaderInfoLog(shader) || "" );
    console.warn(addLineNumbers(code));
    return false;
  }
  return true;
}



var _lastUsedDepthTest = null
var _lastUsedGeometry  = null


class Program {

  constructor(gl, options={}) {

    this._uuid = uuid();

    if (!gl) {
      return;
    }

    options = Object.assign({}, {
      vertexShader:   defaultVertexShader,
      fragmentShader: defaultFragmentShader,
      defines:    {},
      extentions: {},
      uniforms: {},
      type: gl.TRIANGLES
    }, options);

    this.options = options;

    this._vertexShaderSource   = options.vertexShader;
    this._fragmentShaderSource = options.fragmentShader;

    this.gl             = gl;
    this._program       = gl.createProgram();
    this.vertexShader   = gl.createShader( gl.VERTEX_SHADER );
    this.fragmentShader = gl.createShader( gl.FRAGMENT_SHADER );

    gl.attachShader(this._program, this.vertexShader);
    gl.attachShader(this._program, this.fragmentShader);

    this.type          = options.type;
    this.attributes    = {};
    this.defines       = options.defines;
    this.extentions    = options.extentions;

    this._textureUnit  = 0;

    this.depthTest     = options.depthTest     !== void 0 ? options.depthTest : true;
    this.blend         = options.blend         !== void 0 ? options.blend : false;
    this.blendEquation = options.blendEquation !== void 0 ? options.blendEquation : this.gl.FUNC_ADD;
    this.blendSrc   = options.blendSrc   !== void 0 ? options.blendSrc   : this.gl.SRC_ALPHA;
    this.blendDst   = options.blendDst   !== void 0 ? options.blendDst   : this.gl.ONE_MINUS_SRC_ALPHA;
    this.blendSrcRGB   = options.blendSrcRGB   !== void 0 ? options.blendSrcRGB   : this.gl.SRC_ALPHA;
    this.blendDstRGB   = options.blendDstRGB   !== void 0 ? options.blendDstRGB   : this.gl.ONE_MINUS_SRC_ALPHA;
    this.blendSrcAlpha = options.blendSrcAlpha !== void 0 ? options.blendSrcAlpha : this.gl.ONE;
    this.blendDstAlpha = options.blendDstAlpha !== void 0 ? options.blendDstAlpha : this.gl.ONE_MINUS_SRC_ALPHA;

    this.wireframe     = options.wireframe !== void 0 ? options.wireframe : false;

    this.uniforms = {};

    this._userDefinedUniforms = options.uniforms;
    this.compile();

  }

  compile() {

    if (!this.gl) {
      return;
    }

    if (this.isCompiling) {
      return;
    }

    this.isCompiling = true;

    var defines = '';
    for (var d in this.defines) {
      if (this.defines[d]) {
        defines += '#define '+d+' '+this.defines[d]+'\n';
      }
    }

    if( !( compileShader( this.gl, this.vertexShader,   defines + this._vertexShaderSource ) &&
           compileShader( this.gl, this.fragmentShader, defines + this._fragmentShaderSource ) ) ) {
      console.warn('compile error')
      return false;
    }

    this.gl.linkProgram(this._program);

    if (!this.gl.getProgramParameter(this._program, this.gl.LINK_STATUS)) {
      console.error("Cannot link program: \n" + this.gl.getProgramInfoLog(this._program) || "");
      console.warn("VERTEX_SHADER:\n"+addLineNumbers(this._vertexShaderSource)
                  +"\n\nFRAGMENT_SHADER:\n"+addLineNumbers(this._fragmentShaderSource));
    }

    this.gl.useProgram(this._program);

    this._retrieveUniformsFromShader();

    this.isCompiling = false;

  }

  _retrieveUniformsFromShader() {



//debug
let isMMatrix = false;

    this._savedUniforms = {};
    for (let k in this.uniforms) {
      this._savedUniforms[k] = {
        value: this.uniforms[k].value
      }
    }

    this.uniforms      = {};
    this._textureUnit = 0;

    var numUniforms = this.gl.getProgramParameter( this._program, this.gl.ACTIVE_UNIFORMS );

    for (let i = 0; i < numUniforms; ++i) {

      var uniform = this.gl.getActiveUniform( this._program, i );

      if( uniform === null ){
        this.gl.getError();
        continue;
      }

      let name = uniform.name;



      let isArray = false;//is uniform array  ?(ex: 3fv, 4fv...)

      // tltr; we want 'myUniform[0]' to become 'myUniform'
      // if array uniform, replace the retrieved name as it includes the first index acces
      if (/\[.*\]/.test(name) ) {
        isArray = true;
        name = name.replace(/\[.*\]/,'');
      }


      if (this.uniforms[ name ] !== void 0) {
        this.uniforms[ name ].location = this.gl.getUniformLocation( this._program, name );
        this.uniforms[ name ].type = uniform.type;

      }
      else {

        this.uniforms[ name ] = {
          isArray: isArray,
          location: this.gl.getUniformLocation( this._program, name ),
          type: uniform.type,
          value: null,
          size: uniform.size
        }

        //set texture unit
        if (uniform.type === TEXTURE_2D || uniform.type === TEXTURE_CUBE_MAP) {
          this.uniforms[ name ].unit = this._textureUnit;
          this._textureUnit++;
        }

      }

    }



let isEnd = false;
  //merge user defined uniforms
    for (let u in this._savedUniforms) {



        if (this.uniforms[u] !== void 0){
            if (this._savedUniforms[u].value !== void 0
               && this._savedUniforms[u].value !== null) {


              this.uniforms[u].value = this._savedUniforms[u].value;
            }
        }
        else {

        }

    }


    for (let u in this._userDefinedUniforms) {
      if (this.uniforms[u] !== void 0
        && this._userDefinedUniforms[u] !== void 0
          && this._userDefinedUniforms[u] !== null) {
          this.uniforms[u].value = this._userDefinedUniforms[u];
      }
    }


    var numAttributes = this.gl.getProgramParameter( this._program, this.gl.ACTIVE_ATTRIBUTES );

    for (let i = 0; i < numAttributes; ++i) {

      var attribute = this.gl.getActiveAttrib( this._program, i );

      if( attribute === null ){
        this.gl.getError();
        continue;
      }

      this.attributes[ attribute.name ] = {
        location: this.gl.getAttribLocation( this._program, attribute.name ),
        type: attribute.type
      }

      //the attribute is only enabled when the buffer is binded
      //(so it's enabled by the Program that will use the buffer)
      //this way we make sure that any enabled attribute has some data not to trigger an error
      //see http://www.mjbshaw.com/2013/03/webgl-fixing-invalidoperation.html
      // this.gl.enableVertexAttribArray( this.attributes[attribute.name].location );

    }


  }

  dispose() {

  }

  use () {
    if (!this.gl) {
      return;
    }


    this.gl.useProgram(this._program);
  }

  attribPointer(attributes, geometry) {

    if (!this.gl) {
      return;
    }

    for (var attr in this.attributes) {
      if (attributes[attr] !== void 0) {
        attributes[attr].bind();
        this.gl.vertexAttribPointer( this.attributes[attr].location, attributes[attr].size, attributes[attr].type, false, 0, 0);
        this.gl.enableVertexAttribArray(  this.attributes[attr].location );
      }
    }
  }

  draw(geometry) {

    if (!this.gl) {
      return;
    }


    this.gl.useProgram(this._program);

    //todo add a flah on attribute to check if they changed and thus needs to be binded again
    //todo check the currently used program to know if it need some buffer bindings
    // if (geometry !== _lastUsedGeometry) {
      //TODO: check if geometry has changed
      this.attribPointer(geometry.attributes, geometry);
      // _lastUsedGeometry  = geometry;
    // }

    // if (this.depthTest !== _lastUsedDepthTest) {
      this.gl[ this.depthTest ? 'enable' : 'disable' ](this.gl.DEPTH_TEST);
      // _lastUsedDepthTest = this.depthTest;
    // }

    if (this.blend) {

      // this.gl.disable(this.gl.DEPTH_TEST);
      // this.gl[ this.depthTest ? 'enable' : 'disable' ](this.gl.DEPTH_TEST);

      if (this.depthTest) {
        this.gl.depthFunc( this.gl.LESS );
      }


      this.gl.blendEquation(this.blendEquation);
      this.gl.blendFuncSeparate(this.blendSrcRGB, this.blendDstRGB, this.blendSrcAlpha, this.blendDstAlpha);
      // this.gl.blendFunc(this.blendSrc,this.blendDst);
      this.gl.enable(this.gl.BLEND);

    }
    else {
      this.gl.disable(this.gl.BLEND);
      // this.gl[ this.depthTest ? 'enable' : 'disable' ](this.gl.DEPTH_TEST);
      if (this.depthTest) {
        this.gl.depthFunc( this.gl.LESS );
      }
    }





    var keys = Object.keys(this.uniforms);

    for (var i=0,l=keys.length; i<l; i++) {

      let uniformName = keys[i]

      switch (this.uniforms[ uniformName ].type) {

        case this.gl.FLOAT_MAT2:
        case this.gl.FLOAT_MAT3:
        case this.gl.FLOAT_MAT4:
          if (this.uniforms[ uniformName ].value !== null &&
              this.uniforms[ uniformName ].value !== void 0) {
            this.gl['uniform' + UNIFORM_TYPE[this.uniforms[ uniformName ].type]+'v'](this.uniforms[ uniformName ].location, false, this.uniforms[ uniformName ].value);
          }
          break;
        default:

          //texture2D
          if (this.uniforms[ uniformName ].type === TEXTURE_2D ||
              this.uniforms[ uniformName ].type === TEXTURE_CUBE_MAP ){
            if (this.uniforms[ uniformName ].value) {
              this.uniforms[ uniformName ].value.bind( this.uniforms[ uniformName ].unit );
              this.gl['uniform' + UNIFORM_TYPE[this.uniforms[ uniformName ].type] ](this.uniforms[ uniformName ].location, this.uniforms[ uniformName ].unit);
            }
            else {
              // console.log('no value for texture...', keys[i], this._userDefinedUniforms[keys[i]], this.uniforms[ keys[i] ].value, this.defines.USE_ALBEDO_MAP)
            }
            // if (keys[i] == 'tAlbedo' && this.defines.USE_ALBEDO_MAP) {
            //   console.log('BIND ALBEDO UNIRFORM', this.uniforms.tAlbedo.value, this.defines)
            // }
            // drawnUniformsTextures.push(keys[i]);
          }
          else {

            let type = UNIFORM_TYPE[this.uniforms[ keys[i] ].type];

            //add 'v' to the uniformType if the unifor is an array: ex "3f" => "3fv"
            if (this.uniforms[ uniformName ].isArray) {
              type += 'v';
            }

            if (this.uniforms[ uniformName ].value !== null) {

              if (type == '2f') {
                this.gl['uniform' + type ](this.uniforms[ uniformName ].location, this.uniforms[ uniformName ].value[0], this.uniforms[ uniformName ].value[1]);

                // drawnUniforms2f.push(uniformName);
              }
              else if (type == '3f') {
                this.gl['uniform' + type ](this.uniforms[ uniformName ].location, this.uniforms[ uniformName ].value[0], this.uniforms[ uniformName ].value[1], this.uniforms[ uniformName ].value[2]);

                // drawnUniforms3f.push(uniformName);
              }
              else if (type == '4f') {
                this.gl['uniform' + type ](this.uniforms[ uniformName ].location, this.uniforms[ uniformName ].value[0], this.uniforms[ uniformName ].value[1], this.uniforms[ uniformName ].value[2], this.uniforms[ uniformName ].value[3]);

                // drawnUniforms4f.push(uniformName);
              }
              else {

                // drawnUniforms1f.push(uniformName);
                this.gl['uniform' + type ](this.uniforms[ uniformName ].location, this.uniforms[ uniformName ].value);
              }

            }

          }
        //break;
      }

    }

    if ( this.type !== this.gl.POINTS &&
          geometry.attributes['index'] ) {
      geometry.attributes['index'].bind()
      this.gl.drawElements(this.wireframe ? this.gl.LINE_STRIP : this.type, geometry.attributes['index'].length, this.gl.UNSIGNED_SHORT, 0);
    }
    else {
      this.gl.drawArrays(this.wireframe ? this.gl.LINE_STRIP : this.type, 0, geometry.length);
    }


  }

}


// var drawnUniformsTextures = []
// var drawnUniforms1f = []
// var drawnUniforms2f = []
// var drawnUniforms3f = []
// var drawnUniforms4f = []

// function flushUniforms() {
//   console.log('1f: ' + drawnUniforms1f.length + '\n' +
//               '2f: ' + drawnUniforms2f.length + '\n' +
//               '3f: ' + drawnUniforms3f.length + '\n' +
//               '4f: ' + drawnUniforms4f.length + '\n' +
//               'tx: ' + drawnUniformsTextures.length + '\n' );

//   drawnUniformsTextures = []
//   drawnUniforms1f = []
//   drawnUniforms2f = []
//   drawnUniforms3f = []
//   drawnUniforms4f = []
//   requestAnimationFrame(flushUniforms)
// }

// flushUniforms();

export default Program;