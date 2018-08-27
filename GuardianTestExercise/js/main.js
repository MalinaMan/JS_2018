(function () {
  "use strict";

  var $ = function(id) {
    return document.getElementById(id);
  }

  var news;
  const API_KEY = 'bbcec02b-3981-47d2-93ae-64af9c164117';

  $("header__refresh__button").addEventListener('click', loadNews);

  function addErrorMessageNode(parent, errorText) {
    let errorElem = document.createElement('h3');
    errorElem.className = 'error-message';
    errorElem.innerHTML = "Sorry, we couldn't find news for you. Please try again later.<br>" + errorText;
    return parent.appendChild(errorElem);
  }
  
  function loadNews() {
    
    const URL_10LAST_NEWS_API = 'http://content.guardianapis.com/search?api-key=' + API_KEY;
    let button = $("header__refresh__button");
    let wrapper = $('wrapper');

    while (wrapper.firstChild) {
      wrapper.removeChild(wrapper.firstChild);
    }

    let xhr = new XMLHttpRequest();

    xhr.open('GET', URL_10LAST_NEWS_API, true);
    xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    xhr.send();

    xhr.onreadystatechange = function() {
      if (this.readyState != 4) return;

      if (xhr.status != 200) {
        addErrorMessageNode(wrapper, "Error getting data = " + xhr.status + ': ' + xhr.statusText);
      } else {
        let data = JSON.parse(xhr.responseText);
        if (('response' in data) && (data.response.status==='ok')) {
          button.innerHTML = 'Refresh';
          button.disabled = false;
          news = data.response.results;
          processData(news);
        }
        else {
          addErrorMessageNode(wrapper, "Format error: no properties name 'response'");
        }
      }
    }

    button.innerHTML = 'loading...';
    button.disabled = true;
  }

  function getPostsTemplate(news) {
    return news.reduce((tmpl, unit) => {
      tmpl += `<li>${unit.webTitle}</li>`;
      return tmpl;
    }, '');
  }

  function processData(news)
  {
    if (!news) {
      return;
    }

    let oldList = $('listNews');
    
    let item = document.createElement('ul');
    item.innerHTML = getPostsTemplate(news);
    
    if (oldList) {
      $('wrapper').replaceChild(item, oldList);
    } else {
      $('wrapper').appendChild(item);
    }

    /*item.addEventListener('click', showDetailInfo, false);*/
  }

  function addChildLi(list, val)
  {
    let newLi = document.createElement('li');
    newLi.innerHTML = val;
    list.appendChild(newLi);
  }

}());