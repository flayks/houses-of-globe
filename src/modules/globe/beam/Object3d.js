import * as mat4 from './glMatrix/mat4';
import * as mat3 from './glMatrix/mat3';
import * as quat from './glMatrix/quat';
import * as vec3 from './glMatrix/vec3';


class Object3d {

	constructor() {
		
		this.position     = vec3.create();
		this.rotation     = vec3.create();
		this.scale        = vec3.create();
		this.lookAt       = null;
		
		//use to diff and only update matrix if needed
		this.lastPosition       = vec3.create();
		this.lastRotation       = vec3.create();
		this.lastScale          = vec3.create();
		this.lastLookAt         = vec3.create();

		vec3.set(this.scale, 1, 1, 1);
		this.up           = vec3.create();
		vec3.set(this.up, 0, 1, 0);
		this.matrix       = mat4.create();//modelMatrix
		this.worldMatrix  = mat4.create();//modelMatrix * parentMatri(x|ces)

		this.quaternion    = null;//quat.create();
		this._quaternion   = quat.create();

		this.inverseWorldMatrix =  mat4.create();

		this._invLookatMat4 = mat4.create();
		this._m3Rotation = mat3.create();
		this._rotationMat4 = mat4.create();
		this._lookAtMat4 = mat4.create();

		this._lastUpdate = Date.now()
			
	}

	render() {

		let needsUpdate = false;
		// let needsUpdateOrigin = null;
		if (this.position[0] !== this.lastPosition[0] ||
			this.position[1] !== this.lastPosition[1] ||
			this.position[2] !== this.lastPosition[2] ) {
			this.lastPosition[0] = this.position[0];
			this.lastPosition[1] = this.position[1];
			this.lastPosition[2] = this.position[2];
			// needsUpdateOrigin = 'position'
			needsUpdate = true;
		}
		else if (
			this.rotation[0] !== this.lastRotation[0] ||
			this.rotation[1] !== this.lastRotation[1] ||
			this.rotation[2] !== this.lastRotation[2] ) {
			this.lastScale[0] = this.rotation[0];
			this.lastScale[1] = this.rotation[1];
			this.lastScale[2] = this.rotation[2];
			// needsUpdateOrigin = 'rotation'
			needsUpdate = true;
		}
		else if (
			this.scale[0] !== this.lastScale[0] ||
			this.scale[1] !== this.lastScale[1] ||
			this.scale[2] !== this.lastScale[2] ) {
			this.lastScale[0] = this.scale[0];
			this.lastScale[1] = this.scale[1];
			this.lastScale[2] = this.scale[2];
			// needsUpdateOrigin = 'scale'
			needsUpdate = true;
		}
		else if (
			this.lookAt !== null &&
			( this.lookAt[0] !== this.lastLookAt[0] ||
			  this.lookAt[1] !== this.lastLookAt[1] ||
			  this.lookAt[2] !== this.lastLookAt[2] ) ) {
			this.lastLookAt[0] = this.lookAt[0];
			this.lastLookAt[1] = this.lookAt[1];
			this.lastLookAt[2] = this.lookAt[2];
			// needsUpdateOrigin = 'lookAt'
			needsUpdate = true;
		}

			this.updateMatrix();
			this.updateWorldMatrix();
	
	}

	updateMatrix() {
		
		mat4.identity(this.matrix);
		mat4.identity(this._invLookatMat4)
		mat3.identity(this._m3Rotation)
		mat4.identity(this._rotationMat4)
		mat4.identity(this._lookAtMat4)

		if (this.quaternion) {
			mat4.fromRotationTranslation(this.matrix, this.quaternion, this.position );
		}
		else {
			mat4.translate(this.matrix, this.matrix, this.position);
			mat4.rotateX(this._rotationMat4, this._rotationMat4, this.rotation[0]);
			mat4.rotateY(this._rotationMat4, this._rotationMat4, this.rotation[1]);
			mat4.rotateZ(this._rotationMat4, this._rotationMat4, this.rotation[2]);
		}

		if (this.lookAt !== null) {

			mat4.lookAt(
				this.matrix, 
				this.position, 
				this.lookAt,
				this.up
			);

			mat4.invert(this.matrix, this.matrix);
			mat4.scale(this.matrix, this.matrix, this.scale);	
			
		}
		else {
			mat4.scale(this.matrix, this.matrix, this.scale);
			mat4.multiply(this.matrix, this.matrix, this._rotationMat4);
		}
	}

	updateWorldMatrix() {
		if (this.parent) {
			mat4.multiply(this.worldMatrix, this.parent.worldMatrix, this.matrix );
		}
		else{
			this.worldMatrix = this.matrix;
		}
		mat4.invert(this.inverseWorldMatrix, this.worldMatrix);
	}

}


export default Object3d;