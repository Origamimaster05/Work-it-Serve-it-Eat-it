// Create dedicated elements for color detection (independent from AprilTag system)
const colorVideo = document.createElement("video");
colorVideo.id = "color_video";
colorVideo.setAttribute("autoplay", "");
colorVideo.setAttribute("playsinline", "");
colorVideo.width = 640;
colorVideo.height = 480;
colorVideo.style.display = "none";
document.body.appendChild(colorVideo);

const colorCanvas = document.createElement("canvas");
colorCanvas.id = "color_canvas";
colorCanvas.width = 640;
colorCanvas.height = 480;
colorCanvas.style.position = "absolute";
colorCanvas.style.width = "50vw";
colorCanvas.style.height = "80vh";
colorCanvas.style.objectFit = "cover";
colorCanvas.style.zIndex = "20";
colorCanvas.style.pointerEvents = "none";
colorCanvas.style.left = "0";
colorCanvas.style.top = "50%";
colorCanvas.style.transform = "translateY(-50%)";

const canvasPos = document.getElementById("canvas_pos");
if (canvasPos) {
  canvasPos.appendChild(colorCanvas);
}

const colorCtx = colorCanvas.getContext("2d");
const statusEl = document.getElementById("status");

if (statusEl) {
  statusEl.style.display = "block";
  statusEl.style.position = "absolute";
  statusEl.style.top = "10px";
  statusEl.style.left = "10px";
  statusEl.style.zIndex = "25";
  statusEl.style.color = "white";
  statusEl.style.background = "rgba(0,0,0,0.8)";
  statusEl.style.padding = "8px 12px";
  statusEl.style.borderRadius = "4px";
  statusEl.style.fontSize = "12px";
  statusEl.style.fontFamily = "monospace";
}

window.onOpenCvReady = function () {
  if (statusEl) {
    statusEl.textContent = "";
  }
  console.log("OpenCV loaded for color detection");
  startCamera();
};

async function startCamera() {
  console.log("Starting color detection camera...");
  try {
    let stream = await navigator.mediaDevices.getUserMedia({ video: true });
    colorVideo.srcObject = stream;
    colorVideo.onloadedmetadata = () => {
      colorVideo.play();
      console.log("Color video playing");
      processFrame();
    };
  } catch (error) {
    console.error("Camera error:", error);
    if (statusEl) {
      statusEl.textContent = "❌ Camera error";
      statusEl.style.color = "red";
    }
  }
}

function processFrame() {
  colorCtx.drawImage(colorVideo, 0, 0, colorCanvas.width, colorCanvas.height);
  
  let src = cv.imread(colorCanvas);
  let hsv = new cv.Mat();
  cv.cvtColor(src, hsv, cv.COLOR_RGBA2RGB);
  cv.cvtColor(hsv, hsv, cv.COLOR_RGB2HSV);

  // Yellow range (20-30 hue) - higher saturation and brightness to avoid dark clothing
  let lowYellow = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), [20, 150, 150, 0]);
  let highYellow = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), [30, 255, 255, 255]);
  let maskYellow = new cv.Mat();
  cv.inRange(hsv, lowYellow, highYellow, maskYellow);

  // Orange range (10-25 hue) - wider range to capture more orange
  let lowOrange = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), [10, 180, 140, 0]);
  let highOrange = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), [25, 255, 255, 255]);
  let maskOrange = new cv.Mat();
  cv.inRange(hsv, lowOrange, highOrange, maskOrange);

  // Red range (0-5 and 178-180 hue - wraps around) - much narrower, very high saturation
  let lowRed1 = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), [0, 220, 140, 0]);
  let highRed1 = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), [5, 255, 255, 255]);
  let maskRed1 = new cv.Mat();
  cv.inRange(hsv, lowRed1, highRed1, maskRed1);
  
  let lowRed2 = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), [178, 220, 140, 0]);
  let highRed2 = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), [180, 255, 255, 255]);
  let maskRed2 = new cv.Mat();
  cv.inRange(hsv, lowRed2, highRed2, maskRed2);
  
  let maskRed = new cv.Mat();
  cv.bitwise_or(maskRed1, maskRed2, maskRed);

  // Green range (40-80 hue) - higher saturation and brightness to avoid dark clothing
  let lowGreen = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), [40, 150, 150, 0]);
  let highGreen = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), [80, 255, 255, 255]);
  let maskGreen = new cv.Mat();
  cv.inRange(hsv, lowGreen, highGreen, maskGreen);

  // Blue range (100-130 hue) - higher saturation and brightness to avoid dark clothing
  let lowBlue = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), [100, 150, 150, 0]);
  let highBlue = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), [130, 255, 255, 255]);
  let maskBlue = new cv.Mat();
  cv.inRange(hsv, lowBlue, highBlue, maskBlue);

  // Combine all masks
  let combinedMask = new cv.Mat();
  cv.bitwise_or(maskYellow, maskOrange, combinedMask);
  cv.bitwise_or(combinedMask, maskRed, combinedMask);
  cv.bitwise_or(combinedMask, maskGreen, combinedMask);
  // cv.bitwise_or(combinedMask, maskBlue, combinedMask); NO BLUE! CLASHES WITH TOASTER

  // Find contours
  let contours = new cv.MatVector();
  let hierarchy = new cv.Mat();
  cv.findContours(combinedMask, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

  // Get nutri elements
  const nutriA = document.getElementById("A"); // Green
  const nutriB = document.getElementById("B"); // Blue
  const nutriC = document.getElementById("C"); // Yellow
  const nutriD = document.getElementById("D"); // Orange
  const nutriE = document.getElementById("E"); // Red

  // Reset all nutri elements
  [nutriA, nutriB, nutriC, nutriD, nutriE].forEach(el => {
    if (el) {
      el.style.flex = "1";
      el.style.fontSize = "2vw";
      el.style.height = "4vw";
    }
  });

  // Track which colors are detected
  let colorsDetected = {
    green: false,
    blue: false,
    yellow: false,
    orange: false,
    red: false
  };

  // Draw contours and angle, and detect which colors are present
  for (let i = 0; i < contours.size(); i++) {
    let cnt = contours.get(i);
    if (cnt.size().height < 1) continue;

    let rotatedRect = cv.minAreaRect(cnt);
    
    // Get the center point to check which color mask it belongs to
    let cx = Math.round(rotatedRect.center.x);
    let cy = Math.round(rotatedRect.center.y);
    
    // Check which color this contour belongs to (priority order to avoid overlap)
    if (cx >= 0 && cx < maskGreen.cols && cy >= 0 && cy < maskGreen.rows) {
      // Check in order of priority: orange first, then red, to avoid confusion
      if (maskOrange.ucharAt(cy, cx) > 0) {
        colorsDetected.orange = true;
      } else if (maskRed.ucharAt(cy, cx) > 0) {
        colorsDetected.red = true;
      } else if (maskGreen.ucharAt(cy, cx) > 0) {
        colorsDetected.green = true;
      } else if (maskBlue.ucharAt(cy, cx) > 0) {
        colorsDetected.blue = true;
      } else if (maskYellow.ucharAt(cy, cx) > 0) {
        colorsDetected.yellow = true;
      }
    }

    let vertices = cv.RotatedRect.points(rotatedRect);

    // draw rectangle
    colorCtx.beginPath();
    colorCtx.strokeStyle = "lime";
    colorCtx.lineWidth = 1;
    colorCtx.moveTo(vertices[0].x, vertices[0].y);
    for (let j = 1; j < 4; j++) {
      colorCtx.lineTo(vertices[j].x, vertices[j].y);
    }
    colorCtx.closePath();
    colorCtx.stroke();

    // draw angle
    colorCtx.fillStyle = "yellow";
    colorCtx.font = "2px monospace";
    colorCtx.fillText(`${rotatedRect.angle.toFixed(1)}°`, rotatedRect.center.x, rotatedRect.center.y);
  }

  // Activate nutri elements based on detected colors
  if (colorsDetected.green && nutriA) {
    nutriA.style.flex = "1";
    nutriA.style.fontSize = "4vw";
    // nutriA.style.height = "6vw";
    
    // Display green value in value2
    const value2El = document.getElementById("value2");
    if (value2El) {
      // Count green contours or use a green intensity value
      let greenCount = 0;
      for (let y = 0; y < maskGreen.rows; y += 10) {
        for (let x = 0; x < maskGreen.cols; x += 10) {
          if (maskGreen.ucharAt(y, x) > 0) greenCount++;
        }
      }
      value2El.textContent = Math.min(999, greenCount);
    }
  } else {
    // Clear value2 when green not detected
    const value2El = document.getElementById("value2");
    if (value2El) {
      value2El.textContent = "";
    }
  }
  
  if (colorsDetected.blue && nutriB) {
    nutriB.style.flex = "1";
    nutriB.style.fontSize = "4vw";
    // nutriB.style.height = "6vw";
  }
  if (colorsDetected.yellow && nutriC) {
    nutriC.style.flex = "1";
    nutriC.style.fontSize = "4vw";
    // nutriC.style.height = "6vw";
  }
  if (colorsDetected.orange && nutriD) {
    nutriD.style.flex = "1";
    nutriD.style.fontSize = "4vw";
    // nutriD.style.height = "6vw";
  }
  if (colorsDetected.red && nutriE) {
    nutriE.style.flex = "1";
    nutriE.style.fontSize = "4vw";
    // nutriE.style.height = "6vw";
  }

  // Cleanup
  src.delete(); 
  hsv.delete();
  lowYellow.delete(); 
  highYellow.delete(); 
  maskYellow.delete();
  lowOrange.delete();
  highOrange.delete();
  maskOrange.delete();
  lowRed1.delete();
  highRed1.delete();
  maskRed1.delete();
  lowRed2.delete();
  highRed2.delete();
  maskRed2.delete();
  maskRed.delete();
  lowGreen.delete(); 
  highGreen.delete(); 
  maskGreen.delete();
  lowBlue.delete();
  highBlue.delete();
  maskBlue.delete();
  combinedMask.delete(); 
  contours.delete(); 
  hierarchy.delete();

  requestAnimationFrame(processFrame);
}

// Auto-start if OpenCV is already loaded
if (typeof cv !== 'undefined' && cv.getBuildInformation) {
  console.log("OpenCV already available");
  window.onOpenCvReady();
}