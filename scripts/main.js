"use strict";

let k =        [[ 1,  0, -1],
                [ 2,  0, -2],
                [ 1,  0, -1]];

let b = [[1,0,0],[0,0,0],[0,0,1]];

// (function() {

  window.onload = function() {

    let imgElement = document.getElementById('imageSrc');
    let inputElement = document.getElementById('fileInput');
    let pastel = document.getElementById('pastelButton');
    let content = document.getElementById('content');
    let status = document.getElementById('status');

    setTimeout(function() {
      status.innerHTML = "OpenCV is Loaded";
    }, 3000);

    inputElement.addEventListener('change', (e) => {
      imgElement.src = URL.createObjectURL(e.target.files[0]);
    }, false);

    imgElement.onload = function() {
      let mat = cv.imread(imgElement);
      cv.imshow('canvasOutput', mat);
      mat.delete();
    };

    pastel.addEventListener('click', function() {
      let input = cv.imread(imgElement);
      let edgeCopy = input.clone();

      applyFilter(input, "lowpass", k.length);

      applyFilter(edgeCopy, "lowpass", k.length);
      applyFilter(edgeCopy, "highpass", k.length);

      let result = new cv.Mat();
      cv.add(input, edgeCopy, result)
      cv.imshow('canvasOutput', result);

      // Clean up resources
      input.delete();
      edgeCopy.delete();
      result.delete();

      // let gray = grayscale(input);
      // gray.delete();
    });
  };

  function grayscale(inputImg) {
    let outputImg = new cv.Mat();
    cv.cvtColor(inputImg, outputImg, cv.COLOR_RGB2GRAY);
    return outputImg;
  }

  function gaussianFilter(inputImg, kernelSize) {

  }
  //
  // function laplacianGradient(inputImg) {
  //   const kernel = [[0, 1, 0],
  //   [1,-4, 1],
  //   [0, 1, 0]];
  //
  //   let outputImg = new cv.Mat();
  //   for (let i = 0; i < )
  // }

// })();
