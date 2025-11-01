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

// Mapping of AprilTag IDs to list items and steps
const tagMapping = {
  2: { listIndex: 0, stepId: "step1" },  // 2 Toasts
  3: { listIndex: 3, stepId: "step2" },  // 1 Tomato
  4: { listIndex: 1, stepId: "step3" },  // 1 Egg
  5: { listIndex: 5, stepId: "step4" },  // Butter & Mayo
  6: { listIndex: 2, stepId: "step5" },  // Ham
  7: { listIndex: 6, stepId: "step6" },  // Cheese
  8: { listIndex: 4, stepId: "step7" },  // Lettuce
  9: { listIndex: 7, stepId: "step8" },  // Served
  10: { stepId: "step9" }                 // Step 9 only
};

// Get all list items and steps
const listItems = document.querySelectorAll(".list-item");
const steps = {
  step1: document.getElementById("step1"),
  step2: document.getElementById("step2"),
  step3: document.getElementById("step3"),
  step4: document.getElementById("step4"),
  step5: document.getElementById("step5"),
  step6: document.getElementById("step6"),
  step7: document.getElementById("step7"),
  step8: document.getElementById("step8"),
  step9: document.getElementById("step9")
};

// Set all toggles to inactive on start
listItems.forEach(item => {
  const toggle = item.querySelector(".toggle");
  if (toggle) {
    toggle.classList.remove("active");
  }
});

function loop() {
  requestAnimationFrame(loop);

  const detections = getDetections();
  const ids = detections.map((d) => d.id);

  // First, deactivate all steps
  Object.values(steps).forEach(step => {
    if (step) {
      step.classList.remove("active");
      step.style.backgroundColor = "";
      step.style.color = "";
      step.style.transform = "";
    }
  });

  // Check each AprilTag from 2 to 10
  for (let tagId = 2; tagId <= 10; tagId++) {
    const mapping = tagMapping[tagId];
    
    if (ids.includes(tagId)) {
      // Tag is detected - activate toggle and step
      if (mapping) {
        // Activate the corresponding list item toggle (and keep it active)
        if (mapping.listIndex !== undefined) {
          const listItem = listItems[mapping.listIndex];
          if (listItem) {
            const toggle = listItem.querySelector(".toggle");
            if (toggle && !toggle.classList.contains("active")) {
              toggle.classList.add("active");
              console.log(`Activated list item ${mapping.listIndex} for tag ${tagId}`);
            }
          }
        }
        
        // Activate the corresponding step
        if (mapping.stepId) {
          const step = steps[mapping.stepId];
          if (step) {
            step.classList.add("active");
            // Override the hover CSS with inline styles
            step.style.backgroundColor = "black";
            step.style.color = "white";
            step.style.transform = "scaleY(1.4)";
            console.log(`Activated ${mapping.stepId} for tag ${tagId}`);
          }
        }
      }
    }
    // Removed the else block - toggles stay active even when tag disappears
  }
}

loop();