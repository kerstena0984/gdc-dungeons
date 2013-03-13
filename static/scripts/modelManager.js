var ModelManager = function() {
	var models = {};

	function downloadModel(gl, modelName, callback) {
		var startTime = (new Date()).getTime();
		Ajax.callRPC("requestModel", [modelName], function(response) {
			response = response.substring(0, response.length - 4);
			createModel(gl, modelName, response);
			if (typeof callback === "function") {
				var endTime = (new Date()).getTime();
				callback(modelName, endTime - startTime);
			}
		});
	}

	function downloadModels(gl, modelNames, callback) {
		for (var modelName in modelNames) {
			downloadModel(gl, modelName, null);
		}

		isModelDownloadComplete(modelNames, callback);
	}

	function isModelDownloadComplete(modelNames, callback) {
		if (areModelsReady(modelNames)) {
			if (typeof callback === "function") {
				callback(modelNames);
			}
		} else {
			setTimeout(function() { isModelDownloadComplete(modelNames, callback); }, 10);
		}
	}

	function createModel(gl, modelName, json) {
		var modelData = JSON.parse(json);
		models[modelName] = {};

		models[modelName].vertexPositions = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, models[modelName].vertexPositions);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(modelData.vertexPositions), gl.STATIC_DRAW);
		models[modelName].vertexPositions.itemSize = 3;
		models[modelName].vertexPositions.numItems = modelData.vertexPositions.length;

		models[modelName].vertexNormals = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, models[modelName].vertexNormals);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(modelData.vertexNormals), gl.STATIC_DRAW);
		models[modelName].vertexNormals.itemSize = 3;
		models[modelName].vertexNormals.numItems = modelData.vertexNormals.length;

		models[modelName].vertexTextures = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, models[modelName].vertexTextures);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(modelData.vertexTextures), gl.STATIC_DRAW);
		models[modelName].vertexTextures.itemSize = 2;
		models[modelName].vertexTextures.numItems = modelData.vertexTextures.length;

		models[modelName].indices = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, models[modelName].indices);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(modelData.indices), gl.STATIC_DRAW);
		models[modelName].indices.itemSize = 1;
		models[modelName].indices.numItems = modelData.indices.length;

		models[modelName].ready = true;
	}

	function isModelReady(modelName) {
		if (models[modelName] && models[modelName].ready) {
			return true;
		}
		return false;
	}

	function areModelsReady(modelNames) {
		if (modelNames) {
			for (var modelName in modelNames) {
				if (!isModelReady(modelName)) {
					return false;
				}
			}
			return true;
		}

		for (var modelName in Object.keys(models)) {
			if (!isModelReady(modelName)) {
				return false;
			}
		}
		return true;
	}

	function pushPositions(gl, modelName, attributePointer) {
		gl.bindBuffer(gl.ARRAY_BUFFER, models[modelName].vertexPositions);
		gl.vertexAttribPointer(attributePointer, models[modelName].vertexPositions.itemSize, gl.FLOAT, false, 0, 0);
	}

	function pushNormals(gl, modelName, attributePointer) {
		gl.bindBuffer(gl.ARRAY_BUFFER, models[modelName].vertexNormals);
		gl.vertexAttribPointer(attributePointer, models[modelName].vertexNormals.itemSize, gl.FLOAT, false, 0, 0);
	}

	function pushTextures(gl, modelName, attributePointer) {
		gl.bindBuffer(gl.ARRAY_BUFFER, models[modelName].vertexTextures);
		gl.vertexAttribPointer(attributePointer, models[modelName].vertexTextures.itemSize, gl.FLOAT, false, 0, 0);
	}

	function pushAll(gl, modelName, program) {
		pushPositions(gl, modelName, program.attribs["vertexPositions"]);
		pushNormals(gl, modelName, program.attribs["vertexNormals"]);
		pushTextures(gl, modelName, program.attribs["vertexTextures"]);
	}

	function render(gl, modelName) {
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, models[modelName].indices);
		gl.drawElements(gl.TRIANGLES, models[modelName].indices.numItems, gl.UNSIGNED_SHORT, 0);
	}

	function getModel(modelName) {
		if (!isModelReady(modelName)) {
			return undefined;
		}
		return models[modelName];
	}

	return {
		"downloadModel" : downloadModel,
		"downloadModels" : downloadModels,
		"createModel" : createModel,
		"isModelReady" : isModelReady,
		"areModelsReady" : areModelsReady,
		"pushPositions" : pushPositions,
		"pushNormals" : pushNormals,
		"pushTextures" : pushTextures,
		"pushAll" : pushAll,
		"render" : render,
		"getModel" : getModel
	};
}();