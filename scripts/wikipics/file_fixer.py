import os
from PIL import Image

path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "wikiphotos")

count = 0

for filename in os.listdir(path):
    if filename.endswith(".jpg") or filename.endswith(".jpeg"):
        try:
            with Image.open(os.path.join(path, filename)) as img:
                img.verify()
        except Exception as e:
            print(f"Corrupted file: {filename}")
            try:
                os.remove(os.path.join(path, filename))  # delete the corrupted file
                print(f"File {filename} deleted")
                count += 1
            except Exception as e:
                print(f"Failed to delete file: {filename}")

print(f"Total deleted files: {count}")
