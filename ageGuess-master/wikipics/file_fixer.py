import os
from PIL import Image

path = "C:/Users/rohanomalley/Desktop/CS_projects_work/ageGuess/ageGuess-master/wikipics/wikiphotos"

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
