import requests
import re
from bs4 import BeautifulSoup

url = 'https://en.wikipedia.org/wiki/List_of_current_NBA_team_rosters'
response = requests.get(url)

soup = BeautifulSoup(response.content, 'html.parser')
fn_elements = soup.find_all(class_='toccolours')

link_checked = []


with open('ageGuess-master\wikipics\wikiLinks.txt', 'w') as f:
    for fn in fn_elements:
        a = fn.find_all('a')
        for a_elemen in a:
            href = a_elemen.get('href')
            if (type(href) == str and href not in link_checked and href[0:5] != 'https'):
                clip = href[6:]
                if re.search(r'university|college', clip.lower()) == None and len(clip.split('_')) == 2:
                    f.write(href + '\n')
                    link_checked.append(href)
                    f.flush()

print('links written')



