import Program from './Program';
import vertexShader   from './shaders/default-vs.glsl?raw';
import fragmentShader from './shaders/mesh-fs.glsl?raw';

class Material extends Program {

  constructor( gl, options  ){

    options = Object.assign({}, {
      vertexShader:   vertexShader,
      fragmentShader: fragmentShader,
      map: null,
    }, options);

    options.uniforms = Object.assign({}, {
      color: [1,1,1],
      alpha: 1
    }, options.uniforms);

    options.defines = Object.assign({}, {
      USE_MAP: false
    }, options.defines);

    super(gl, options);

    if (!gl) {
      return;
    }

    Object.defineProperty(this, 'map', {
      set: (value) => {
        if (value) {
          this.defines.USE_MAP = true;
          this.compile();
          if (this.uniforms.map) {
            this.uniforms.map.value = value;
          }
        }
        else {
          this.defines.USE_MAP = false;
          this.compile();
        }
      }
    });

    this.map = options.map;

  }



}

export default Material;