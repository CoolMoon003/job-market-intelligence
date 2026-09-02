import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin


HEADERS = {
    "User-Agent": "Mozilla/5.0"
}


def get_soup(url):
    response = requests.get(url, headers=HEADERS, timeout=20)
    response.raise_for_status()
    return BeautifulSoup(response.text, "lxml")


def clean_text(text):
    return " ".join(text.split()) if text else ""


def make_absolute_url(base_url, link):
    return urljoin(base_url, link)