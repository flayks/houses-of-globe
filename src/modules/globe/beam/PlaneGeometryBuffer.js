import GeometryBuffer from './GeometryBuffer';

class PlaneGeometryBuffer extends GeometryBuffer {
	
	constructor(gl, options) {

		super(gl, 4.);

		options = Object.assign({}, {
			width:          1000,
			height:         1000,
			widthSegments:  1,
			heightSegments: 1
		}, options);

	    if (!gl) {
	      return;
	    }

		this.width          = options.width;
		this.height         = options.height;
		this.widthSegments  = options.widthSegments;
		this.heightSegments = options.heightSegments;

		this._build();
		this.addAttribute( 'index',    new Uint16Array(  this.indices  ), 1 );
		this.addAttribute( 'position', new Float32Array( this.vertices ), 3 );
		this.addAttribute( 'normal',   new Float32Array( this.normals  ), 3 );
		this.addAttribute( 'uv',       new Float32Array( this.uvs      ), 2 );
		this.addAttribute( 'color',    new Float32Array( this.colors   ), 3 );
	}

	update() {
		this._build();
		this.attributes['index'].update(    new Uint16Array(this.indices),   1 );
		this.attributes['position'].update( new Float32Array(this.vertices), 3 );
		this.attributes['normal'].update(   new Float32Array(this.normals),  3 );
		this.attributes['uv'].update(       new Float32Array(this.uvs),      2 );
		this.attributes['color'].update(    new Float32Array(this.colors),   3 );
	}

	_build() {

		// buffers
		this.indices  = [];
		this.vertices = [];
		this.normals  = [];
		this.uvs      = [];
		this.colors   = [];	

		var width_half     = this.width  * 0.5;
		var height_half    = this.height * 0.5;
		var gridX          = this.widthSegments >> 0;
		var gridY          = this.heightSegments >> 0;
		var gridX1         = gridX + 1;
		var gridY1         = gridY + 1;
		var segment_width  = this.width  / gridX;
		var segment_height = this.height / gridY;

		var ix, iy;

		// generate vertices, normals and uvs
		for ( iy = 0; iy < gridY1; iy ++ ) {
			var y = iy * segment_height - height_half;
			for ( ix = 0; ix < gridX1; ix ++ ) {
				var x = ix * segment_width - width_half;
				this.vertices.push( x, - y, 0 );
				this.normals.push( 0, 0, 1 );
				this.uvs.push( ix / gridX,  1 - ( iy / gridY ) );
				this.colors.push( 1, 1, 1 );
			}
		}

		// indices
		for ( iy = 0; iy < gridY; iy ++ ) {
			for ( ix = 0; ix < gridX; ix ++ ) {
				var a = ix + gridX1 * iy;
				var b = ix + gridX1 * ( iy + 1 );
				var c = ( ix + 1 ) + gridX1 * ( iy + 1 );
				var d = ( ix + 1 ) + gridX1 * iy;
				// faces
				this.indices.push( a, b, d );
				this.indices.push( b, c, d );
			}
		}

		this.length = this.vertices.length/3;

	}


}

export default PlaneGeometryBuffer;