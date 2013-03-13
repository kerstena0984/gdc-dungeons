var TextureManager = function() {
	var textures = {}

	function downloadTexture(gl, name, callback) {
		var startTime = (new Date()).getTime();
		textures[name] = gl.createTexture();
		textures[name].image = new Image();
		textures[name].image.onload = function() {
			createTexture(gl, name);
			textures[name].ready = true;
			if (typeof callback === "function") {
				var endTime = (new Date()).getTime();
				callback(name, endTime - startTime);
			}
		}
		textures[name].image.src = "/static/images/" + name + ".png";
	}

	function createTexture(gl, name) {
		gl.bindTexture(gl.TEXTURE_2D, textures[name]);
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textures[name].image);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
		gl.generateMipmap(gl.TEXTURE_2D);
		gl.bindTexture(gl.TEXTURE_2D, null);
	}

	function isTextureReady(name) {
		if (textures[name] != undefined && textures[name].ready) {
			return true;
		}
		return false;
	}

	function areTexturesReady(names) {
		if (names) {
			for (var name in names) {
				if (!isTextureReady(name)) {
					return false;
				}
			}
			return true;
		}

		for (var name in Object.keys(textures)) {
			if (!isTextureReady(name)) {
				return false;
			}
		}

		return true;
	}

	function bindTexture(gl, name, glTextureID) {
		gl.activeTexture(gl["TEXTURE" + glTextureID.toString()]);
		gl.bindTexture(gl.TEXTURE_2D, textures[name]);
	}

	return {
		"downloadTexture" : downloadTexture,
		"isTextureReady" : isTextureReady,
		"areTexturesReady" : areTexturesReady,
		"bindTexture" : bindTexture
	};
}();