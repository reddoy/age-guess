import os

here = os.path.dirname(os.path.abspath(__file__))

with open(os.path.join(here, 'wikiLinks.txt'), 'r') as file:
    lines = file.readlines()




with open(os.path.join(here, 'newLinks.txt'), 'w') as f:
    for link in lines:
        if "The_Simpsons" not in link and "/wiki/" == link[0:6]:
            f.write(link)
