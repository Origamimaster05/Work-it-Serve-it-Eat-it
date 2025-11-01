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

const wrapSquare = document.getElementById('wrap-square');
let foldState = 0; // 0 = unfolded, 1 = first fold, 2 = second fold
let isUnfolding = false;
let isAnimating = false; // Prevent multiple animations at once
const detectedTags = new Set(); // Track which tags have been detected

function performFoldSequence() {
    if (isAnimating) return;
    isAnimating = true;

    console.log("Starting fold sequence");

    // Step 1: First fold (blue triangles fold)
    setTimeout(() => {
        foldState = 1;
        wrapSquare.classList.add('folded');
        console.log("Step 1: First fold");
    }, 0);

    // Step 2: Second fold (red and upper blue fold)
    setTimeout(() => {
        foldState = 2;
        wrapSquare.classList.remove('folded');
        wrapSquare.classList.add('double-folded');
        console.log("Step 2: Second fold");
    }, 1200);

    // Step 3: Start unfolding (back to first fold state)
    setTimeout(() => {
        isUnfolding = true;
        foldState = 1;
        wrapSquare.classList.remove('double-folded');
        wrapSquare.classList.add('folded');
        console.log("Step 3: Start unfolding");
    }, 2400);

    // Step 4: Complete unfolding (back to unfolded)
    setTimeout(() => {
        foldState = 0;
        wrapSquare.classList.remove('folded');
        isUnfolding = false;
        isAnimating = false;
        console.log("Step 4: Complete unfolding");
    }, 3600);
}

function loop() {
    requestAnimationFrame(loop);

    const detections = getDetections();
    const ids = detections.map((d) => d.id);

    // Check for tags 3, 5, 7, and 10
    const triggerTags = [3, 5, 7, 10];

    triggerTags.forEach(tagId => {
        if (ids.includes(tagId) && !detectedTags.has(tagId)) {
            // New tag detected - trigger fold sequence
            detectedTags.add(tagId);
            performFoldSequence();
            console.log(`Tag ${tagId} detected - triggering fold sequence`);
        } else if (!ids.includes(tagId) && detectedTags.has(tagId)) {
            // Tag no longer visible - remove from detected set
            detectedTags.delete(tagId);
        }
    });
}

loop();