# # simple camera open
# # from flask import Flask, Response
# import cv2

# app = Flask(__name__)

# # Open the webcam (0 for default camera)
# camera = cv2.VideoCapture(0)

# def generate_frames():
#     while True:
#         success, frame = camera.read()
#         if not success:
#             break
#         else:
#             # Encode frame as JPEG
#             _, buffer = cv2.imencode('.jpg', frame)
#             frame = buffer.tobytes()

#             # Yield frame as a byte stream
#             yield (b'--frame\r\n'
#                    b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

# @app.route('/video_feed')
# def video_feed():
#     return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

# if __name__ == "__main__":
#     app.run(host='0.0.0.0', port=5001, debug=True)



# #only detection not storing

# import cv2
# import torch
# import numpy as np
# from flask import Flask, Response
# from ultralytics import YOLO

# # Initialize Flask app
# app = Flask(__name__)

# # Load YOLOv11 model
# model = YOLO("best.pt")  # Ensure "best.pt" is in the same directory
# print("✅ YOLOv11 Model loaded successfully!")

# # Load class names
# try:
#     with open("classes.txt", "r") as f:
#         class_names = f.read().strip().split("\n")
# except FileNotFoundError:
#     print("❌ Error: 'classes.txt' not found!")
#     class_names = []

# # Open webcam
# cap = cv2.VideoCapture(0)
# if not cap.isOpened():
#     print("❌ Error: Could not open webcam.")
#     exit()


# def generate_frames():
#     while True:
#         success, frame = cap.read()
#         if not success:
#             break
        
#         # Run YOLOv11 inference
#         results = model(frame)
        
#         for result in results:
#             boxes = result.boxes.xyxy.cpu().numpy()  # Bounding boxes
#             scores = result.boxes.conf.cpu().numpy()  # Confidence scores
#             cls_ids = result.boxes.cls.cpu().numpy().astype(int)  # Class IDs
            
#             for i, (box, cls_id) in enumerate(zip(boxes, cls_ids)):
#                 if cls_id >= len(class_names):
#                     continue  # Prevent index errors
                
#                 x1, y1, x2, y2 = map(int, box)
#                 label = f"{class_names[cls_id]} {scores[i]:.2f}"
                
#                 # Draw bounding box and label
#                 cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
#                 cv2.putText(frame, label, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
        
#         # Encode frame to JPEG
#         _, buffer = cv2.imencode(".jpg", frame)
#         frame_bytes = buffer.tobytes()
        
#         yield (b"--frame\r\n"
#                b"Content-Type: image/jpeg\r\n\r\n" + frame_bytes + b"\r\n")


# @app.route("/video_feed")
# def video_feed():
#     return Response(generate_frames(), mimetype="multipart/x-mixed-replace; boundary=frame")


# if __name__ == "__main__":
#     app.run(host="0.0.0.0", port=5001, debug=True)

# ##store data in detection folder

# import os
# import cv2
# import torch
# import numpy as np
# from flask import Flask, Response
# from ultralytics import YOLO

# # Initialize Flask app
# app = Flask(__name__)

# # Load YOLOv11 model
# model = YOLO("best.pt")
# model.to("cuda" if torch.cuda.is_available() else "cpu")

# # Load class names
# with open("classes.txt", "r") as f:
#     class_names = f.read().splitlines()

# # Create a folder to save detections if it doesn't exist
# output_folder = "detections"
# os.makedirs(output_folder, exist_ok=True)

# frame_count = 0  # To keep track of saved frames

# # Open webcam
# cap = cv2.VideoCapture(0)

# def generate_frames():
#     global frame_count
#     while True:
#         success, frame = cap.read()
#         if not success:
#             break
        
#         # Perform inference
#         results = model(frame)

#         # Process detections
#         for result in results:
#             boxes = result.boxes.xyxy.cpu().numpy()  # Bounding box coordinates
#             scores = result.boxes.conf.cpu().numpy()  # Confidence scores
#             class_ids = result.boxes.cls.cpu().numpy().astype(int)  # Class IDs

#             for i, box in enumerate(boxes):
#                 x1, y1, x2, y2 = map(int, box)
#                 cls_id = class_ids[i]
#                 label = f"{class_names[cls_id]} {scores[i]:.2f}"
                
#                 # Draw bounding box
#                 cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
#                 cv2.putText(frame, label, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)

#                 # Save detected frame
#                 save_path = os.path.join(output_folder, f"detection_{frame_count}.jpg")
#                 cv2.imwrite(save_path, frame)
#                 frame_count += 1

#         # Encode frame for web display
#         ret, buffer = cv2.imencode('.jpg', frame)
#         frame = buffer.tobytes()
#         yield (b'--frame\r\n'
#                b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

# @app.route('/video_feed')
# def video_feed():
#     return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

# if __name__ == "__main__":
#     app.run(host="0.0.0.0", port=5001, debug=True)


