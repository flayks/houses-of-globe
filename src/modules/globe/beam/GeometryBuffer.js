import ArrayBuffer from './ArrayBuffer';

class GeometryBuffer {
	
	constructor(gl, size) {

		if (!gl) {
			return;
		}
		
		this.gl = gl;
		this.attributes = {}
		this.length = size || 0;

		// this.vertices = [];
		// this.addAttribute( 'index',    new Uint16Array(  this.indices  ), 1 );
		// this.addAttribute( 'position', new Float32Array( this.vertices ), 3 );
		// this.addAttribute( 'normal',   new Float32Array( this.normals  ), 3 );
		// this.addAttribute( 'uv',       new Float32Array( this.uvs      ), 2 );

	}

	addAttribute(attribName, data, size, geometry) {
		this.attributes[attribName] = new ArrayBuffer(this.gl, data, size, attribName === 'index', geometry);//true=use element array buffer
	}

}


export default GeometryBuffer;