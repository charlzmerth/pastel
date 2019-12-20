// Number of channels in an openCV mat object
const matChannels = 3;
// The offset of the "value" channel
const valueOffset = 2;

const minPixelValue = 0;
const maxPixelValue = 255;
const highPassKernelEdge = 1;

// Helper functions
const getArrayMax = array => array.reduce((a, b) => Math.max(a, b));
const getMatrixMax = matrix => getArrayMax(matrix.map(getArrayMax));
const getArrayMin = array => array.reduce((a, b) => Math.min(a, b));
const getMatrixMin = matrix => getArrayMin(matrix.map(getArrayMin));

function mapMatrix(matrix, f) {
  return matrix.map(function(rows) {
    return rows.map(f);
  })
}

function normalizePixel(pixel, max) {
  return Math.floor((maxPixelValue-minPixelValue)/(max)*(pixel-max)+maxPixelValue);
}

// Applies the given kernel to the input openCV mat object (from cv.imread())
function applyFilter(rgbMat, filterType, size) {
  if (!rgbMat.isContinuous()) {
    throw new Error("Non-continuous data array");
  }

  // Create "temporary" Mat object
  let hsvMat = new cv.Mat();

  // Convert to HSV to manipulate the "value" channel
  cv.cvtColor(rgbMat, hsvMat, cv.COLOR_RGB2HSV);

  // Create a matrix to perform convolution on
  let valueMatrix = initializeMatrix(hsvMat.rows, hsvMat.cols);
  for (let i = 0; i < hsvMat.rows; i++) {
    for (let j = 0; j < hsvMat.cols; j++) {
      valueMatrix[i][j] = hsvMat.ucharPtr(i, j)[valueOffset];
    }
  }

  // Create kernel and perform the convolution
  let resultMatrix;
  let kLen;
  if (filterType === "lowpass") {
    resultMatrix = lowpassFilter(valueMatrix, size);
    kLen = Math.floor(size / 2);
  } else if (filterType === "highpass") {
    resultMatrix = highpassFilter(valueMatrix);
    kLen = highPassKernelEdge;
  }

  // Update the values of the temp image
  for (let i = kLen; i < hsvMat.rows-kLen; i++) {
    for (let j = kLen; j < hsvMat.cols-kLen; j++) {
      hsvMat.ucharPtr(i, j)[valueOffset] = resultMatrix[i][j];
    }
  }

  // Convert back to RBG format
  cv.cvtColor(hsvMat, rgbMat, cv.COLOR_HSV2RGB);
  hsvMat.delete();
}

function lowpassFilter(valueMatrix, size) {
  const kernel = generateKernel("averaging", size);
  return convolve2D(valueMatrix, kernel.matrix, kernel.scale);
}

// Applies a high pass filter to the matrix, renormalizing
function highpassFilter(valueMatrix) {
  const kernelX = generateKernel("highX").matrix;
  const kernelY = generateKernel("highY").matrix;

  resultX = convolve2D(valueMatrix, kernelX);
  resultY = convolve2D(valueMatrix, kernelY);

  let result = initializeMatrix(resultY.length, resultY[0].length);
  for (let i = 0; i < result.length; i++) {
    for (let j = 0; j < result[0].length; j++) {
      result[i][j] = Math.sqrt(resultX[i][j]**2 + resultY[i][j]**2);
    }
  }

  resultMax = getMatrixMax(result);
  result = mapMatrix(result, function(intensity) {
    return normalizePixel(intensity, resultMax);
  });

  return result;
}

// Returns a size x size kernel of the specified type (lowpass, highpass, etc.)
function generateKernel(type, size) {
  let result = initializeMatrix(size, size);
  let scaleFactor = 1;
  switch (type) {

    case "averaging":
      for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
          result[i][j] = 1;
        }
      }
      scaleFactor = size ** 2;
      break;

    case "highX":
      result = [[ 1,  0, -1],
                [ 2,  0, -2],
                [ 1,  0, -1]];
      break;

    case "highY":
      result = [[ 1,  2,  1],
                [ 0,  0,  0],
                [-1, -2, -1]];
      break;

    default:
      throw new Error('Kernel type is unspecified');
      break;
  }

  return {matrix : result, scale : scaleFactor};
}

// Returns a zero-initialized matrix
function initializeMatrix(rows, columns) {
  let a = [];
  let b;

  while (a.push(b = []) < rows) {
    while (b.push(0) < columns);
  }

  return a;
}

// Returns a submatrix of 'input', with top-left coordinates (x, y)
function getSquareSubMatrix(input, x, y, size) {
  // Assertion check
  // if (result.length != size || result[0].length != size) {
  //   throw new Error();
  // }

  let result = [];
  for (let i = 0; i < size; i++) {
    result.push(input[y + i].slice(x, x + size));
  }

  return result;
}

// Return the dot product of two (same-shaped) matrices
function dotMatrix(x, y) {
  if (x.length !== y.length && x[0].length !== y[0].length) {
    throw new Error('Input arrays are of different shape');
  }

  // Element-wise matrix multiplication step
  let sum = 0;
  for (let i = 0; i < x.length; i++) {
    for (let j = 0; j < x[0].length; j++) {
      sum += x[i][j] * y[i][j];
    }
  }

  return sum;
}

// Convolves 2D image 'x' with the kernel 'k', dividing by scalar factor 'a'
function convolve2D(x, k, a=1) {
  const kLen = Math.floor(k.length / 2);
  let result = initializeMatrix(x.length, x[0].length);

  // Convolve the image with the kernel (skipping "border" pixels)
  for (let i = kLen; i < x.length-kLen; i++) {
    for (let j = kLen; j < x[0].length-kLen; j++) {
      const subMatrix = getSquareSubMatrix(x, j-kLen, i-kLen, k.length);
      result[i][j] = Math.floor(dotMatrix(subMatrix, k) / a);
    }
  }

  // Pad the bottom of the matrix with zeros
  result[x.length-1] = new Array(x[0].length).fill(0);
  return result;
}
