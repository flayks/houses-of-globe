import Container from './Container';
import * as mat4 from './glMatrix/mat4';

class Mesh extends Container {

	constructor(options) {
		super();
		this.material  = null;
		this.geometry = null;
		this.options = options || {};
		this._viewMatrix = mat4.create()
		this._invViewMatrix = mat4.create()
		this._modelViewMatrix = mat4.create()
		this._normalMatrix = mat4.create()
	}

	render(camera, options={}) {

		super.render( camera, options );

		let material = options.overrideMaterial || this.material;

		if (camera && material && 
			this.geometry && //TODO: check for geometry.length
			this.visible) {
		
			if (this.options.beforeRender) {
				this.options.beforeRender() 
			}
			// setTimeout(()=>{
				mat4.invert(this._viewMatrix, camera.worldMatrix);
				mat4.multiply(this._modelViewMatrix, this._viewMatrix, this.worldMatrix);
				
				if (material.uniforms['uInverseViewMatrix'] !== void 0) {
					mat4.copy(this._invViewMatrix, camera.worldMatrix);
					mat4.invert(this._invViewMatrix, this._invViewMatrix);
					material.uniforms['uInverseViewMatrix'].value  = camera.worldMatrix;
				}

				if (material.uniforms['uCameraPosition'] !== void 0) {
					material.uniforms['uCameraPosition'].value  = camera.position;
				}
				if (material.uniforms['uVMatrix'] !== void 0) {
					material.uniforms['uVMatrix'].value  = this._viewMatrix;
				}
				if (material.uniforms['uNormalMatrix'] !== void 0) {
					mat4.multiply( this._normalMatrix, this._rotationMat4, this.parent._rotationMat4);
					material.uniforms['uNormalMatrix'].value  = this._normalMatrix
				}
				if (material.uniforms['uMMatrix'] !== void 0) {
					material.uniforms['uMMatrix'].value  = this.worldMatrix;
					// console.log('MANUALLY ASSIGN ',  this.matrix, this.name)
					// console.log('setMM', this.name, this.matrix[0], this.matrix[1], this.matrix[2], this.matrix[3])
				}
				if (material.uniforms['uMVMatrix'] !== void 0) {
					material.uniforms['uMVMatrix'].value = this._modelViewMatrix;
				}
			
				if (material.uniforms['uPMatrix'] !== void 0) {
					material.uniforms['uPMatrix'].value = camera.projectionMatrix;
				}
			
				for (let u in options.uniforms) {
					if (material.uniforms[ u ] !== void 0) {
						material.uniforms[ u ].value = options.uniforms[u];
					}
				}

				let needsCompile = false;
				for (let k in options.defines) {
					if (material.defines[ k ] !== options.defines[ k ]) {
						material.defines[ k ] = options.defines[ k ];
						needsCompile = true;
					}
				}

				if (needsCompile) {
					material.compile();
				}

				material.draw( this.geometry );
			// })

		}

	}

} 

export default Mesh;