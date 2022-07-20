import GeometryBuffer from './GeometryBuffer';
import * as vec3 from './glMatrix/vec3';





class SphereGeometryBuffer extends GeometryBuffer {
	
	constructor(gl, options) {

		super(gl, 0.);

		options = Object.assign({},{
			radius: 50,
			widthSegments: 8,
			heightSegments: 6,
			phiStart: 0,
			phiLength: Math.PI * 2,
			thetaStart: 0,
			thetaLength: Math.PI
		}, options);


    if (!gl) {
      return;
    }
    
		var radius = options.radius || 50;
		var widthSegments = Math.max( 3, Math.floor( options.widthSegments ) || 8 );
		var heightSegments = Math.max( 2, Math.floor( options.heightSegments ) || 6 );
		var phiStart = phiStart !== undefined ? options.phiStart : 0;
		var phiLength = phiLength !== undefined ? options.phiLength : Math.PI * 2;
		var thetaStart = thetaStart !== undefined ? options.thetaStart : 0;
		var thetaLength = thetaLength !== undefined ? options.thetaLength : Math.PI;

		var thetaEnd = thetaStart + thetaLength;

		var ix, iy;

		var index = 0;
		var grid = [];

		var vertex = vec3.create();
		var normal = vec3.create();

		// buffers

		var indices  = [];
		var vertices = [];
		var normals  = [];
		var uvs      = [];
		var colors   = [];

		// generate vertices, normals and uvs

		for ( iy = 0; iy <= heightSegments; iy ++ ) {

			var verticesRow = [];

			var v = iy / heightSegments;

			for ( ix = 0; ix <= widthSegments; ix ++ ) {

				var u = ix / widthSegments;

				vertex[0] = - radius * Math.cos( phiStart + u * phiLength ) * Math.sin( thetaStart + v * thetaLength );
				vertex[1] = radius * Math.cos( thetaStart + v * thetaLength );
				vertex[2] = radius * Math.sin( phiStart + u * phiLength ) * Math.sin( thetaStart + v * thetaLength );
				vertices.push( vertex[0], vertex[1], vertex[2] );

				vec3.set(normal, vertex[0], vertex[1], vertex[2] );
				vec3.normalize(normal, normal);
				normals.push( normal[0], normal[1], normal[2] );

				uvs.push( u, 1 - v );
				verticesRow.push( index ++ );
				colors.push( 1,1,1 )

			}

			grid.push( verticesRow );

		}


		// indices
		for ( iy = 0; iy < heightSegments; iy ++ ) {
			for ( ix = 0; ix < widthSegments; ix ++ ) {
				var a = grid[ iy ][ ix + 1 ];
				var b = grid[ iy ][ ix ];
				var c = grid[ iy + 1 ][ ix ];
				var d = grid[ iy + 1 ][ ix + 1 ];
				if ( iy !== 0 || thetaStart > 0 ) indices.push( a, b, d );
				if ( iy !== heightSegments - 1 || thetaEnd < Math.PI ) indices.push( b, c, d );
			}
		}

		// build geometry
		this.length = vertices.length/3;

		this.addAttribute( 'index',    new Uint16Array(  indices  ), 1 );
		this.addAttribute( 'position', new Float32Array( vertices ), 3 );
		this.addAttribute( 'normal',   new Float32Array( normals  ), 3 );
		this.addAttribute( 'color',    new Float32Array( colors  ), 3 );
		this.addAttribute( 'uv',       new Float32Array( uvs      ), 2, 'Sphere' );

	}

}

export default SphereGeometryBuffer;