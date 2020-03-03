import datetime
import time
from time import sleep

import firebase as firebase
import schedule as schedule
from selenium import webdriver
from bs4 import BeautifulSoup
import urllib.request
import json

from firebase import firebase



def webCrawl(foodId, browser):
    # browser.get('https://dining.purdue.edu/menus/item/6c883ba0-e283-4086-ab01-e181a6615435')
    url = 'https://dining.purdue.edu/menus/item/'+foodId
    browser.get(url)
    #sleep(4)
    elem = browser.page_source
    soup = BeautifulSoup(elem, 'html.parser')
    nutr_feature = soup.body.find('div', attrs={'class':'nutrition-feature-calories'})
    if nutr_feature is None:
        print("calories: "+'0')
        return 0
    else:
        calories = int(nutr_feature.span.text)
        print("calories: "+str(calories))
        return calories

'''def allergensOfItem(item):
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
    return retAllergens'''

def getWholeMenus():
    browser = webdriver.Chrome()
    courtNames = {'Ford', 'Wiley', 'Hillenbrand', 'Windsor','Earhart'}
    firebase_ = firebase.FirebaseApplication('https://lunchmate-9b46b.firebaseio.com/', None)
    result = firebase_.delete('/wholeMenus', None)
    print('delete: '+str(result))

    recommList = {}
    recommList[0] = []
    recommList[1] = []
    recommList[2] = []
    recommList[3] = []
    for courtName in courtNames:
        time = datetime.datetime.now()
        ftime = time.strftime("%m-%d-%Y")
        #url = "http://api.hfs.purdue.edu/menus/v2/locations/Ford/" + str(ftime)
        url = "http://api.hfs.purdue.edu/menus/v2/locations/"+courtName+'/'+str(ftime)
        print("\n\n\n"+url)
        page = urllib.request.urlopen(url)
        data = json.loads(page.read())
        formatted_json = json.dumps(data, indent=4)
        # print(formatted_json)
        meals = data['Meals']
        # print(len(meals))
        for i in range(len(meals)):
            meal = meals[i]
            print("whole meal: "+str(meal))
            print("meal name: "+str(meal['Name']))
            if(str(meal['Status']) == 'Closed'):
                continue
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
                    calories = webCrawl(foodId, browser)
                    #if calories is not 0:
                        #allergens = allergensOfItem(items[k])
                    items[k].update([('calories',calories)])

                    items[k].update([('calories',calories)])
                    if calories < 200:
                        recommList[0].append(items[k])
                    elif 200<calories < 300:
                        recommList[1].append(items[k])
                    elif 200<calories<500:
                        recommList[2].append(items[k])
                    elif 300<calories:
                        recommList[3].append(items[k])
        dbName = '/wholeMenus/'+courtName
        rcName = dbName+'/Recommendation'
        result = firebase_.post(dbName, data)
        result = firebase_.post(rcName, recommList)
    browser.quit()

def main():
    schedule.every().day.at("00:09").do(getWholeMenus)
    while 1:
        schedule.run_pending()
        time.sleep(1)

main()
