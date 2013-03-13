var Game = function() {
	var requestAnimationFrame = window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame;

	var gl = null;
	var projection = null;
	var modelview = null;
	var modelviewStack = [];

	var ambientR = 0.2;
	var ambientG = 0.2;
	var ambientB = 0.2;

	var directionX = 1.0;
	var directionY = 0.0;
	var directionZ = 0.0;

	var direction = [
		directionX,
		directionY,
		directionZ
	];
	var adjustedDirection = vec3.create();
	vec3.normalize(direction, adjustedDirection);
	vec3.scale(adjustedDirection, -1);

	var directionR = 0.4;
	var directionG = 0.7;
	var directionB = 0.7;

	var rotation = 0;

	function start() {
		var canvas = document.getElementById("canvas");
		createWebGLContext(canvas);

		downloadShaders();
		downloadModels();
		downloadTextures();

		initializeGL();
		waitForResources();
	}

	function createWebGLContext(canvas) {
		if (!canvas) {
			return;
		}
		try {
			gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
			gl.viewportWidth = canvas.width;
			gl.viewportHeight = canvas.height;		}
		catch (e) {  }
	}

	function degToRad(degrees) {
        return degrees * Math.PI / 180;
    }

	function pushModelview() {
		var copy = mat4.create();
    	mat4.set(modelview, copy);
    	modelviewStack.push(copy);
	}

	function popModelview() {
		if (modelviewStack.length == 0) {
      		throw "Invalid popMatrix!";
    	}
    	modelview = modelviewStack.pop();
	}

	function downloadShaders() {
		var line0 = document.getElementById("line0");
		var line1 = document.getElementById("line1");
		line0.innerHTML = "downloading vertex shader 'vertex'... ";
		line1.innerHTML = "downloading fragment shader 'fragment'... ";
		ShaderManager.downloadShader(gl, "vertex", gl.VERTEX_SHADER, function(name, elapsedTime) {
			line0.innerHTML += "done. (" + elapsedTime + "ms)";
		});
		ShaderManager.downloadShader(gl, "fragment", gl.FRAGMENT_SHADER, function(name, elapsedTime) {
			line1.innerHTML += "done. (" + elapsedTime + "ms)";
		});
	}

	function downloadModels() {
		var line2 = document.getElementById("line2");
		line2.innerHTML = "downloading model 'teapot'... ";
		ModelManager.downloadModel(gl, "teapot", function(modelName, elapsedTime) {
			line2.innerHTML += "done. (" + elapsedTime + "ms)";
		});
	}

	function downloadTextures() {
		var line3 = document.getElementById("line3");
		line3.innerHTML = "downloading texture 'teapot'... ";
		TextureManager.downloadTexture(gl, "teapot", function(textureName, elapsedTime) {
			line3.innerHTML += "done. (" + elapsedTime + "ms)";
		});
	}

	function createShaderPrograms() {
		ShaderManager.createProgram(gl, "program", ["vertex"], ["fragment"]);

		ShaderManager.addAttribute(gl, "program", "vertexPositions", "aVertexPosition");
		ShaderManager.addAttribute(gl, "program", "vertexNormals", "aVertexNormal");
		ShaderManager.addAttribute(gl, "program", "vertexTextures", "aTextureCoord");

		ShaderManager.addUniform(gl, "program", "projection", "uPMatrix");
		ShaderManager.addUniform(gl, "program", "modelview", "uMVMatrix");
		ShaderManager.addUniform(gl, "program", "sampler", "uSampler");
		ShaderManager.addUniform(gl, "program", "normal", "uNMatrix");
		ShaderManager.addUniform(gl, "program", "ambientColor", "uAmbientColor");
		ShaderManager.addUniform(gl, "program", "directionalVec", "uLightingDirection");
		ShaderManager.addUniform(gl, "program", "directionalColor", "uDirectionalColor");
	}

	function initializeGL() {
		projection = mat4.create();
		modelview = mat4.create();

		gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);

		mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100, projection);
		mat4.identity(modelview);

		gl.clearColor(0.0, 0.0, 0.0, 1.0);
    	gl.enable(gl.DEPTH_TEST);
	}

	function waitForResources() {
		if (!ShaderManager.isShaderReady(gl, "vertex", gl.VERTEX_SHADER)) {
			setTimeout(waitForResources, 10);
			return;
		}

		if (!ShaderManager.isShaderReady(gl, "fragment", gl.FRAGMENT_SHADER)) {
			setTimeout(waitForResources, 10);
			return;
		}

		if (!ModelManager.isModelReady("teapot")) {
			setTimeout(waitForResources, 10);
			return;
		}

		if (!TextureManager.isTextureReady("teapot")) {
			setTimeout(waitForResources, 10);
			return;
		}

		createShaderPrograms();
		tick();
	}

	function tick() {
		rotation += 1;
		render();
		requestAnimationFrame(tick);
	}

	function render() {
		ShaderManager.useProgram(gl, "program");
		var program = ShaderManager.getProgram("program");

		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		mat4.identity(modelview);
		mat4.translate(modelview, [0.0, 0.0, -48.0]);

		pushModelview();

		mat4.rotate(modelview, degToRad(rotation), [1, 0, 0]);
		mat4.rotate(modelview, degToRad(rotation), [0, 1, 0]);
		mat4.rotate(modelview, degToRad(rotation), [0, 0, 1]);

		TextureManager.bindTexture(gl, "teapot", 0);
		gl.uniform1i(program.uniforms["sampler"], 0);

		gl.uniform3f(program.uniforms["ambientColor"], ambientR, ambientG, ambientB);
		gl.uniform3fv(program.uniforms["directionalVec"], adjustedDirection);
		gl.uniform3f(program.uniforms["directionalColor"], directionR, directionG, directionB);

		gl.uniformMatrix4fv(program.uniforms["projection"], false, projection);
		gl.uniformMatrix4fv(program.uniforms["modelview"], false, modelview);

		normalMatrix = mat3.create();
		mat4.toInverseMat3(modelview, normalMatrix);
		mat3.transpose(normalMatrix);
		gl.uniformMatrix3fv(program.uniforms["normal"], false, normalMatrix);

		ModelManager.pushAll(gl, "teapot", program);
		ModelManager.render(gl, "teapot");

		popModelview();
	}

	return {
		"start" : start
	};
}();
