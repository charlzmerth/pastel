Charlie Merth
EE 440 Final Project


Effects:

My project is an implementation of an artistic-style filter which gives the input image an illustration look.



Implementation:

I chose to utilize the ubiquitous technologies present in the web: HTML, CSS, and JavaScript. This is because the frameworks are already set up to make interesting and functional GUIs, as well as JavaScript's similarities to Python. There is a port of openCV to JavaScript called openCV.js, which I downloaded and loaded into the web browser.

I then was able to do everything that is possible with openCV on Python or C++. My effect was accomplished (on a high level) as follows:

	- Create two copies of the input image
	- Apply a strong low pass filter copy A
	- Apply a weak low pass filter to copy B (to remove noise)
	- Apply a bidirectional high pass filter to copy B
	- Add both copies A and B, then dispay the result

Every function involved in the image processing was written by myself (including all convolution functions), with the exception of cv.imread, cv.imshow, etc.



Instructions:

To begin, simply open main.html in a web browser (preferrably Chrome or Firefox). My GUI is very simple, in that the user only needs to click the "Choose File" button and upload an image. The preview will show the uploaded image. Then, click "pastel-ify" to apply the effect, and the result image will show on the right side. Lena.bmp is included as a test image.



Reflection:

This project was a really exciting look into the possibilities that can be achieved with image processing. If I had more time, I would love to offer more flexibility to the user to adjust parameters and modify the effect. There are also way more options in terms of the internal implementations, such as morphological operations that might take this effect to the next level.
