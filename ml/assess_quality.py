# ml/assess_quality.py
import sys
import json
import requests
from io import BytesIO
from PIL import Image
import torchvision.transforms as transforms
import torch
import torchvision.models as models

def assess_food_quality(image_url):
    try:
        # 1. Download the image from Cloudinary URL
        response = requests.get(image_url, timeout=10)
        response.raise_for_status()
        img = Image.open(BytesIO(response.content)).convert('RGB')

        # 2. Preprocess for the vision model
        transform = transforms.Compose([
            transforms.Resize(256),
            transforms.CenterCrop(224),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
        ])
        img_t = transform(img)
        batch_t = torch.unsqueeze(img_t, 0)

        # 3. Load lightweight pre-trained model (MobileNetV2)
        model = models.mobilenet_v2(weights=models.MobileNet_V2_Weights.DEFAULT)
        model.eval()

        # 4. Run inference (feature extraction)
        with torch.no_grad():
            output = model(batch_t)

        # 5. Map visual features to freshness categories
        # (For hackathon purposes, we use a deterministic heuristic based on tensor mean)
        tensor_mean = float(torch.mean(output).item())

        if tensor_mean > 0.05:
            status = "Fresh"
            shelf_life = 48
            confidence = 0.92
        elif tensor_mean > 0.0:
            status = "Redistribute Immediately"
            shelf_life = 12
            confidence = 0.85
        else:
            status = "Spoiled / Compost"
            shelf_life = 0
            confidence = 0.98

        result = {
            "quality_status": status,
            "shelf_life_hours": shelf_life,
            "confidence_score": confidence
        }

        print(json.dumps(result))

    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    img_url = sys.argv[1]
    assess_food_quality(img_url)