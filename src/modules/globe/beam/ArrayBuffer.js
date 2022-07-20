class ArrayBuffer {

	constructor(gl, data, size, element, name) {
		this.name = name;
		this.gl = gl;
		this._buffer = this.gl.createBuffer();
		this.type   = this.gl.FLOAT;
		this._target = this.gl[ element ? 'ELEMENT_ARRAY_BUFFER' : 'ARRAY_BUFFER' ];
		this.update(data, size);
	}

	update(data, size) {
		this.data   = data;
		this.size   = size; 
		this.length = this.data.length;
		this.gl.bindBuffer( this._target, this._buffer);
		this.gl.bufferData( this._target, this.data, this.gl.STATIC_DRAW);
	}

	bind() {
		this.gl.bindBuffer( this._target, this._buffer );
	}

}

export default ArrayBuffer;