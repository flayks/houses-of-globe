import Object3d from './Object3d';

class Container extends Object3d {

	constructor() {
		super();
		this.visible      = true;
		this.parent       = null;
		this.children     = [];
	}

	add(child) {
		for (let i=0,l=this.children.length;i<l; i++) {
			if (this.children[i] == child) {

				break;
			}
		}
		this.children.push(child);
		child.parent = this;
	}

	remove(child) {
		for (let i=0,l=this.children.length;i<l; i++) {
			if (this.children[i] == child) {
				child.parent = null;
				this.children.splice(i, 1);	
				break;
			}
		}
	}
	
	destroy() {
		for (let i=0,l=this.children.length;i<l; i++) {
			this.children[i].destroy();
		}
		if (this.parent !== null) {
			this.parent.removeChild( this );
		}
	}

	render(camera, options) {
		super.render();		
		for (let i=0,l=this.children.length;i<l; i++) {
			if (this.children[i].visible) {
				this.children[i].render(camera, options);
			}
		}
	}

} 

export default Container;