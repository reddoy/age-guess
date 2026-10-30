"""Build the photo set for each game mode.

For every Wikipedia page listed in scripts/people/<mode>.txt, this looks up the
page's main photo on Wikimedia Commons and the person's birth date on Wikidata,
then keeps the photo only if Commons records the exact day it was taken. The
person's age on that day is the answer players are guessing.

Output: site/data/<mode>.json. The game loads the photos straight from Commons.

Usage: pip install requests && python3 scripts/build_photos.py [--mode athletes] [--limit 50]
"""

import argparse
import html
import json
import re
import time
from pathlib import Path

import requests

ROOT = Path(__file__).resolve().parent.parent
PEOPLE_DIR = ROOT / "scripts" / "people"
SITE_DIR = ROOT / "site"
MODES = ["celebrities", "athletes"]

USER_AGENT = "AgeGuess/3.0 (https://github.com/reddoy/age-guess)"
WIKIPEDIA_API = "https://en.wikipedia.org/w/api.php"
COMMONS_API = "https://commons.wikimedia.org/w/api.php"
WIKIDATA_SPARQL = "https://query.wikidata.org/sparql"
THUMB_WIDTH = 500
BATCH = 50
DAY_PRECISION = 11
MIN_AGE = 10


session = requests.Session()
session.headers["User-Agent"] = USER_AGENT


def fetch(url, params=None):
    for attempt in range(5):
        response = session.get(url, params=params, timeout=60)
        if response.status_code == 429 or response.status_code >= 500:
            time.sleep(5 * 2**attempt)
            continue
        response.raise_for_status()
        return response.json()
    raise RuntimeError(f"Gave up on {url}")


def api(url, **params):
    return fetch(url, {**params, "action": "query", "format": "json", "formatversion": 2})


def chunks(items, size):
    for i in range(0, len(items), size):
        yield items[i : i + size]


def read_titles(mode):
    titles = []
    for line in (PEOPLE_DIR / f"{mode}.txt").read_text().splitlines():
        title = line.strip()
        if title and title not in titles:
            titles.append(title)
    return titles


def wikipedia_pages(titles):
    """Map each Wikipedia page to its Wikidata id and main (freely licensed) image."""
    pages = {}
    for batch in chunks(titles, BATCH):
        data = api(
            WIKIPEDIA_API,
            titles="|".join(batch),
            prop="pageimages|pageprops",
            piprop="name",
            ppprop="wikibase_item",
            redirects=1,
        )
        for page in data["query"]["pages"]:
            qid = page.get("pageprops", {}).get("wikibase_item")
            if qid and page.get("pageimage"):
                pages[qid] = {"title": page["title"], "image": page["pageimage"]}
    return pages


def birth_category_years(titles):
    """Birth year from each page's "<year> births" category on Wikipedia."""
    years = {}
    for batch in chunks(titles, BATCH):
        params = {"titles": "|".join(batch), "prop": "categories", "cllimit": "max"}
        while True:
            data = api(WIKIPEDIA_API, **params)
            for page in data["query"]["pages"]:
                for category in page.get("categories", []):
                    match = re.fullmatch(r"Category:(\d{4}) births", category["title"])
                    if match:
                        years[page["title"]] = int(match.group(1))
            if "continue" not in data:
                break
            params.update(data["continue"])
    return years


def birth_dates(qids):
    """Birth dates for the ids that are real people with a birth day on record."""
    births = {}
    for batch in chunks(qids, 200):
        values = " ".join(f"wd:{qid}" for qid in batch)
        query = f"""
            SELECT ?item ?birth ?precision WHERE {{
              VALUES ?item {{ {values} }}
              ?item wdt:P31 wd:Q5;
                    p:P569/psv:P569 [wikibase:timeValue ?birth; wikibase:timePrecision ?precision].
            }}"""
        data = fetch(WIKIDATA_SPARQL, {"query": query, "format": "json"})
        for row in data["results"]["bindings"]:
            qid = row["item"]["value"].rsplit("/", 1)[1]
            match = re.match(r"(\d{4})-(\d{2})-(\d{2})", row["birth"]["value"])
            if match and int(row["precision"]["value"]) == DAY_PRECISION:
                births.setdefault(qid, set()).add(tuple(map(int, match.groups())))
    # People with conflicting birth dates on record are skipped.
    return {qid: dates.pop() for qid, dates in births.items() if len(dates) == 1}


def strip_html(text):
    return html.unescape(re.sub(r"<[^>]+>", "", text)).strip()


def photo_day(raw):
    """The exact day a photo was taken, or None if Commons doesn't say."""
    if re.search(r"circa|\bca\.|\bc\.|before|after|between", raw, re.IGNORECASE):
        return None
    days = set(re.findall(r"\b(\d{4})-(\d{2})-(\d{2})\b", raw))
    if len(days) != 1:
        return None
    return tuple(map(int, days.pop()))


def commons_photos(files):
    """Thumbnail, capture date and credit for each Commons file."""
    photos = {}
    for batch in chunks(files, BATCH):
        data = api(
            COMMONS_API,
            titles="|".join(f"File:{name}" for name in batch),
            prop="imageinfo",
            iiprop="url|extmetadata",
            iiurlwidth=THUMB_WIDTH,
            iiextmetadatafilter="DateTimeOriginal|Artist|LicenseShortName",
        )
        for page in data["query"]["pages"]:
            info = (page.get("imageinfo") or [None])[0]
            if not info:
                continue
            meta = info.get("extmetadata", {})
            day = photo_day(meta.get("DateTimeOriginal", {}).get("value", ""))
            if not day:
                continue
            name = page["title"].removeprefix("File:").replace(" ", "_")
            photos[name] = {
                "day": day,
                "thumb": info["thumburl"].split("?")[0],
                "author": strip_html(meta.get("Artist", {}).get("value", "")) or "Unknown",
                "license": strip_html(meta.get("LicenseShortName", {}).get("value", "")),
                "source": info["descriptionurl"],
            }
    return photos


def age_on(birth, day):
    years = day[0] - birth[0]
    return years - 1 if (day[1], day[2]) < (birth[1], birth[2]) else years


def build(mode, limit):
    titles = read_titles(mode)[:limit]
    print(f"{mode}: {len(titles)} pages listed")

    pages = wikipedia_pages(titles)
    print(f"  {len(pages)} have a free main photo")

    births = birth_dates(list(pages))
    # Wikidata gets vandalized, so its birth year must match Wikipedia's too.
    category_years = birth_category_years([page["title"] for page in pages.values()])
    pages = {
        qid: page
        for qid, page in pages.items()
        if qid in births and births[qid][0] == category_years.get(page["title"])
    }
    print(f"  {len(pages)} are people with a known birthday")

    photos = commons_photos(sorted({page["image"] for page in pages.values()}))

    entries = []
    for qid, page in pages.items():
        photo = photos.get(page["image"].replace(" ", "_"))
        if not photo:
            continue
        age = age_on(births[qid], photo["day"])
        # Younger "ages" come from cameras with the wrong clock.
        if not MIN_AGE <= age <= 100:
            continue

        entries.append(
            {
                "name": page["title"],
                "age": age,
                "year": photo["day"][0],
                "photo": photo["thumb"],
                "credit": {
                    "author": photo["author"],
                    "license": photo["license"],
                    "source": photo["source"],
                },
            }
        )

    entries.sort(key=lambda entry: entry["name"])
    data_dir = SITE_DIR / "data"
    data_dir.mkdir(parents=True, exist_ok=True)
    (data_dir / f"{mode}.json").write_text(json.dumps(entries, indent=1, ensure_ascii=False) + "\n")

    print(f"  {len(entries)} photos have an exact date and made it in")


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--mode", choices=MODES, help="build one mode (default: all)")
    parser.add_argument("--limit", type=int, help="only use the first N pages (for testing)")
    args = parser.parse_args()
    for mode in [args.mode] if args.mode else MODES:
        build(mode, args.limit)


if __name__ == "__main__":
    main()
