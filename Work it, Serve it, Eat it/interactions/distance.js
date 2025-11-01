import { getDetections } from "../assets/video_process.js";

//DOM elements
const video = (window.video = document.getElementById("webcam_canvas"));
const canvas = (window.canvas = document.getElementById("out_canvas"));

//dimensions for canvas
canvas.width = 480;
canvas.height = 360;

//constraints for webcam
const constraints = {
  audio: false,
  video: true,
  video: { width: 1280, height: 720 },
};

//success
function handleSuccess(stream) {
  window.stream = stream;
  video.srcObject = stream;
}

//potential error
function handleError(error) {
  console.log(
    "navigator.MediaDevices.getUserMedia error: ",
    error.message,
    error.name
  );
}
//webcam
navigator.mediaDevices
  .getUserMedia(constraints)
  .then(handleSuccess)
  .catch(handleError);

function angle2DFromCorners(det) {
  const dx = det.corners[1].x - det.corners[0].x;
  const dy = det.corners[1].y - det.corners[0].y;
  return (Math.atan2(dy, dx) * 180) / Math.PI;
}

// Get all dot elements
const dots = [
  document.getElementById("dot1"),
  document.getElementById("dot2"),
  document.getElementById("dot3"),
  document.getElementById("dot4"),
  document.getElementById("dot5"),
  document.getElementById("dot6")
];

// Distance threshold for proximity detection
const PROXIMITY_THRESHOLD = 150; // Adjust this value as needed

function loop() {
  requestAnimationFrame(loop);

  const detections = getDetections();
  const ids = detections.map((d) => d.id);

  // check for ID 0 and 1
  if (ids.includes(0) && ids.includes(1)) {
    const det0 = detections.find((d) => d.id === 0);
    const det1 = detections.find((d) => d.id === 1);

    // compute distance between centers
    const dx = det0.center.x - det1.center.x;
    const dy = det0.center.y - det1.center.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    console.log("Distance between ID 0 and 1:", distance);

    // Change dot colors based on proximity
    const isNear = distance < PROXIMITY_THRESHOLD;
    
    dots.forEach((dot, index) => {
      if (!dot) return;
      const path = dot.querySelector("path");
      if (path) {
        if (isNear) {
          // When tags are near: INVERT the colors
          if (index % 2 === 0) {
            // dot1, dot3, dot5 
            path.style.fill = "white";
            path.style.stroke = "black";
            path.style.strokeWidth = "6";
          } else {
            // dot2, dot4, dot6 
            path.style.fill = "black";
            path.style.stroke = "none";
            path.style.strokeWidth = "0";
          }
        } else {
          // When tags are far: ORIGINAL pattern
          if (index % 2 === 0) {
            // dot1, dot3, dot5: black
            path.style.fill = "black";
            path.style.stroke = "none";
            path.style.strokeWidth = "0";
          } else {
            // dot2, dot4, dot6: white with stroke
            path.style.fill = "white";
            path.style.stroke = "black";
            path.style.strokeWidth = "6";
          }
        }
      }
    });
  }
}

loop();