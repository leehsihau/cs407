import datetime
from time import sleep

import requests
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from bs4 import BeautifulSoup
import urllib.request
import xml.etree.ElementTree as ET
import json

browser = webdriver.Chrome()


def webCrawl(foodId):
    # browser.get('https://dining.purdue.edu/menus/item/6c883ba0-e283-4086-ab01-e181a6615435')
    url = 'https://dining.purdue.edu/menus/item/'+foodId
    browser.get(url)
    sleep(4)
    elem = browser.page_source
    soup = BeautifulSoup(elem, 'html.parser')
    nutr_feature = soup.body.find('div', attrs={'class':'nutrition-feature-calories'})
    if nutr_feature is None:
        print("calories: "+'0')
        return 0
    else:
        calories = str(nutr_feature).index('calories-quantity\">')+19
        print("calories: "+nutr_feature.span.text)
        return calories

def allergensOfItem(item):
    allergens = item['Allergens']
    retAllergens = []
    for i in range(len(allergens)):
        allergen = allergens[i]
        allergenName = allergen['Name']
       # print("allergy name: "+allergen['Name'])
       # print("contains allergy?  "+str(allergen['Value']))
        isAllergy = allergen['Value']
        if isAllergy:
            retAllergens.append(allergenName)
    print("all allergies: "+str(retAllergens))
    return retAllergens

def main():
    time = datetime.datetime.now()
    ftime = time.strftime("%m-%d-%Y")
    url = "http://api.hfs.purdue.edu/menus/v2/locations/Ford/" + str(ftime)
    page = urllib.request.urlopen(url)
    data = json.loads(page.read())
    formatted_json = json.dumps(data, indent=4)
    #print(formatted_json)
    meals = data['Meals']
    #print(len(meals))
    for i in range(len(meals)):
        meal = meals[i]
        print("meal name: "+str(meal['Name']))
        print(("start time: "+str(meal['Hours']['StartTime'])))
        stations = meal['Stations']
        for j in range(len(stations)):
            station = stations[j]
            print("station: "+station['Name'])
            items = station['Items']
            for k in range(len(items)):
                print("food name: "+str(items[k]['Name']))
                print("food ID: "+str(items[k]['ID']))
                foodId = str(items[k]['ID'])
                calories = webCrawl(foodId)
                if calories is not 0:
                    allergens = allergensOfItem(items[k])
    browser.quit()

main()