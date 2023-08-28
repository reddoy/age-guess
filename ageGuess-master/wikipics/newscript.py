filename = 'myfile.txt'

with open('finalProj/wikiLinks.txt', 'r') as file:
    lines = file.readlines()




with open('finalProj/newLinks.txt', 'w') as f:
    for link in lines:
        if "The_Simpsons" not in link and "/wiki/" == link[0:6]:
            f.write(link)
