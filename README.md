# Cyber Leet

A leetcode cyberpunk 2077 style interactive visualization demo.

Built with React.js, Three.js.

# To crawl the data from leetcode:

Simply run this python script.

```python
# modified by Muyang
# original code is found here : https://gcyml.github.io/2019/03/03/Python%E7%88%AC%E5%8F%96Leetcode%E9%A2%98%E7%9B%AE%E5%8F%8AAC%E4%BB%A3%E7%A0%81/

import requests
import json

session = requests.Session()
user_agent = r'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.157 Safari/537.36'

def get_problem_by_slug(slug):
    url = "https://leetcode.com/graphql"
    params = {'operationName': "getQuestionDetail",
              'variables': {'titleSlug': slug},
              'query': '''query getQuestionDetail($titleSlug: String!) {
            question(titleSlug: $titleSlug) {
                questionId
                questionFrontendId
                questionTitle
                questionTitleSlug
                content
                difficulty
                stats
                similarQuestions
                categoryTitle
                topicTags {
                        name
                        slug
                }
            }
        }'''
              }

    json_data = json.dumps(params).encode('utf8')

    headers = {'User-Agent': user_agent, 'Connection':
               'keep-alive', 'Content-Type': 'application/json',
               'Referer': 'https://leetcode.com/problems/' + slug}
    resp = session.post(url, data=json_data, headers=headers, timeout=10)
    content = resp.json()

    question = content['data']['question']
    return question


def get_problems():
    url = "https://leetcode.com/api/problems/all/"
    headers = {'User-Agent': user_agent, 'Connection': 'keep-alive'}
    resp = session.get(url, headers = headers, timeout = 10)
    question_list = json.loads(resp.content.decode('utf-8'))
    easy_set = list()
    medium_set = list()
    hard_set = list()
    all_set = list()
    questions = []
    for question in question_list['stat_status_pairs']:
        question_id = question['stat']['frontend_question_id']
        question_slug = question['stat']['question__title_slug']
        level = question['difficulty']['level']
        contents = get_problem_by_slug(question_slug)
        all_set.append({"id" : str(question_id), "name": question_slug, "difficulty": str(level), "content": contents})
        if level == 1:
            easy_set.append({"id" : str(question_id), "name": question_slug, "content": contents})
        elif level == 2:
            medium_set.append({"id" : str(question_id), "name": question_slug, "content": contents})
        else:
            hard_set.append({"id" : str(question_id), "name": question_slug, "content": contents})

    with open('cybergraph/src/data/easy.json', 'w') as easyfile:
        json.dump(easy_set, easyfile)
    with open('cybergraph/src/data/medium.json', 'w') as mediumfile:
        json.dump(medium_set, mediumfile)
    with open('cybergraph/src/data/hard.json', 'w') as hardfile:
        json.dump(hard_set, hardfile)
    with open('cybergraph/src/data/all.json', 'w') as allfile:
        json.dump(all_set, allfile)
    return easy_set, medium_set, hard_set, all_set
    return 


def get_problem_by_slug(slug):
    url = "https://leetcode.com/graphql"
    params = {'operationName': "getQuestionDetail",
              'variables': {'titleSlug': slug},
              'query': '''query getQuestionDetail($titleSlug: String!) {
            question(titleSlug: $titleSlug) {
                questionId
                questionFrontendId
                questionTitle
                questionTitleSlug
                content
                difficulty
                stats
                similarQuestions
                categoryTitle
                topicTags {
                        name
                        slug
                }
            }
        }'''
              }

    json_data = json.dumps(params).encode('utf8')

    headers = {'User-Agent': user_agent, 'Connection':
               'keep-alive', 'Content-Type': 'application/json',
               'Referer': 'https://leetcode.com/problems/' + slug}
    resp = session.post(url, data=json_data, headers=headers, timeout=10)
    content = resp.json()
    question = content['data']['question']
    return question

get_problems()

```

# Installation:

```bash
cd cyberleet
npm install
```

# Run:
```bash
cd cyberleet
npm start
```

