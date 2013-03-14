var ShaderManager = function() {
	var vshaders = {};
	var fshaders = {};
	var programs = {};

	function downloadShader(gl, name, type, callback) {
		var startTime = (new Date()).getTime();
		Ajax.callRPC('requestShader', [name], function(response) {
			response = response.substring(0, response.length - 4);
			createShader(gl, name, type, response);
			if (typeof callback === "function") {
				var endTime = (new Date()).getTime();
				callback(name, endTime - startTime);
			}
		});
	}

	function createShader(gl, name, type, source) {
		switch (type) {
			case gl.VERTEX_SHADER:
				vshaders[name] = gl.createShader(type);
				gl.shaderSource(vshaders[name], source);
				gl.compileShader(vshaders[name]);
				if (!gl.getShaderParameter(vshaders[name], gl.COMPILE_STATUS)) {
					alert("Shader '" + name + "' failed to compile");
				}
				vshaders[name].ready = true;
				break;
			case gl.FRAGMENT_SHADER:
				fshaders[name] = gl.createShader(type);
				gl.shaderSource(fshaders[name], source);
				gl.compileShader(fshaders[name]);
				if (!gl.getShaderParameter(fshaders[name], gl.COMPILE_STATUS)) {
					alert("Shader '" + name + "' failed to compile");
				}
				fshaders[name].ready = true;
				break;
			default:
				break;
		}
	}

	function isShaderReady(gl, name, type) {
		switch (type) {
			case gl.VERTEX_SHADER:
				if (vshaders[name] && vshaders[name].ready) {
					return true;
				}
				return false;
			case gl.FRAGMENT_SHADER:
				if (fshaders[name] && fshaders[name].ready) {
					return true;
				}
				return false;
			default:
				return false;
		}
	}

	function areShadersReady(gl, shaderNames, type) {
		if (shaderNames) {
			for (var name in shaderNames) {
				if (!isShaderReady(gl, name, type)) {
					return false;
				}
			}
			return true;
		}

		for (var name in Object.keys(vshaders)) {
			if (!isShaderReady(gl, name, gl.VERTEX_SHADER)) {
				return false;
			}
		}

		for (var name in Object.keys(fshaders)) {
			if (!isShaderReady(gl, name, gl.FRAGMENT_SHADER)) {
				return false;
			}
		}

		return true;
	}

	function createProgram(gl, name, vertexShaders, fragmentShaders) {
		programs[name] = gl.createProgram();
		for (var vertexShader in vertexShaders) {
			attachShader(gl, name, vertexShaders[vertexShader], gl.VERTEX_SHADER);
		}
		for (var fragmentShader in fragmentShaders) {
			attachShader(gl, name, fragmentShaders[fragmentShader], gl.FRAGMENT_SHADER);
		}
		linkProgram(gl, name);
		programs[name].attribs = {};
		programs[name].uniforms = {};
	}

	function attachShader(gl, program, shader, type) {
		switch (type) {
			case gl.VERTEX_SHADER:
				gl.attachShader(programs[program], vshaders[shader]);
				break;
			case gl.FRAGMENT_SHADER:
				gl.attachShader(programs[program], fshaders[shader]);
				break;
			default:
				break;
		}
	}

	function linkProgram(gl, name) {
		gl.linkProgram(programs[name]);
		if (!gl.getProgramParameter(programs[name], gl.LINK_STATUS)) {
			alert("Program '" + name + "' failed to link");
		}
	}

	function addAttribute(gl, program, attribute, nameInShader) {
		programs[program].attribs[attribute] = gl.getAttribLocation(programs[program], nameInShader);
		gl.enableVertexAttribArray(programs[program].attribs[attribute]);
	}

	function addUniform(gl, program, attribute, nameInShader) {
		programs[program].uniforms[attribute] = gl.getUniformLocation(programs[program], nameInShader);
	}

	function useProgram(gl, program) {
		gl.useProgram(programs[program]);
	}

	function getProgram(name) {
		return programs[name];
	}

	function getNumVertexShaders() {
		return vshaders.length;
	}

	function getNumFragmentShaders() {
		return fshaders.length;
	}

	return {
		"downloadShader" : downloadShader,
		"createShader" : createShader,
		"isShaderReady" : isShaderReady,
		"areShadersReady" : areShadersReady,
		"createProgram" : createProgram,
		"attachShader" : attachShader,
		"linkProgram" : linkProgram,
		"addAttribute" : addAttribute,
		"addUniform" : addUniform,
		"useProgram" : useProgram,
		"getProgram" : getProgram,
		"getNumVertexShaders" : getNumVertexShaders,
		"getNumFragmentShaders" : getNumFragmentShaders
	};
}();