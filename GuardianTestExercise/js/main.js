(function () {
  "use strict";

  const API_KEY = 'bbcec02b-3981-47d2-93ae-64af9c164117';
  const STATUS_SUCCESS = 'ok';

  $("#header__refresh__button").click(loadNews);


  function addErrorMessageNode(parent, errorText) {
    let errorElem = document.createElement('h3');
    errorElem.className = 'error-message';
    errorElem.innerHTML = "Sorry, we couldn't find news for you. Please try again later.<br>" + errorText;
    return parent.appendChild(errorElem);
  }


  function validationRequest(data) {
    return (('response' in data) && (data.response.status === STATUS_SUCCESS));
  }

  
  function loadNews() {
    
    const URL_NEWS_API = 'http://content.guardianapis.com/search?api-key=' + API_KEY;
    let button = $("#header__refresh__button");
    let wrapper = $('#wrapper');

    while (wrapper.firstChild) {
      wrapper.removeChild(wrapper.firstChild);
    }

    let xhr = new XMLHttpRequest();

    xhr.open('GET', URL_NEWS_API, true);
    xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    xhr.send();

    xhr.onreadystatechange = function() {
      if (this.readyState != 4) return;

      if (xhr.status != 200) {
        addErrorMessageNode(wrapper, "Error getting data = " + xhr.status + ': ' + xhr.statusText);
      } else {
        let data = JSON.parse(xhr.responseText);
        if (validationRequest(data)) {
          button.innerHTML = 'Refresh';
          button.disabled = false;
          let news = data.response.results;
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


  function loadBodyNews(elem) {
    
    let spanElem = getSpanNode(elem.children);
    if (!spanElem) {
      return;
    }
    const URL_NEWS_API = spanElem.textContent + '?show-blocks=body&api-key=' + API_KEY;

    let xhr = new XMLHttpRequest();
    xhr.open('GET', URL_NEWS_API, true);
    xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    xhr.send();

    xhr.onreadystatechange = function() {
      if (this.readyState != 4) return;
      if (xhr.status !== 200) {
        return;
      }

      let data = JSON.parse(xhr.responseText);
      if (validationRequest(data) && addShortInfoBlock(elem.nextElementSibling, data.response.content)) {
        slidePanel(elem);
      }
    }

  }


  function getPostsTemplate(news) {
    return news.reduce((tmpl, unit) => {
      tmpl += `<li>
          <div class='panel'>
            <div class='panel-title'>
              <a href='#'>${unit.webTitle}</a>
              <span>${unit.apiUrl}</span>
            </div>
            <div class='panel-info'></div>
          </div>
        </li>`;
      return tmpl;
    }, '');

  }


  function processData(news)
  {
    if (!news) {
      return;
    }

    let wrapper = $('#wrapper')[0];
    let oldList = $('.listNews');
    
    let item = document.createElement('ul');
    item.className = 'listNews';
    item.innerHTML = getPostsTemplate(news);
    
    if (!oldList.length) {
      wrapper.appendChild(item);
    } else {
      wrapper.replaceChild(item, oldList[0]);
    }
    $('.panel-title').click(expandUnitNews);

  }


  function getSpanNode(elem) {
    for (let i=0; i<elem.length; i++) {
      if (elem[i].tagName === 'SPAN') {
        return elem[i];
      }
    }
  }

  
  function addShortInfoBlock(elem, content) {
    let bodyBlocks = content.blocks.body;
    if (bodyBlocks.length) {
      let item = document.createElement('p');
      item.innerText = bodyBlocks[0].bodyTextSummary;
      elem.appendChild(item);
      return true;
    }

    return false;
  }

  function slidePanel(elem) {
    $(elem).toggleClass('in').next().slideToggle();
    $('.panel-title').not(elem).removeClass('in').next().slideUp();
  }

  function expandUnitNews() {
    let elemInfoBlock = this.nextElementSibling;
    if (elemInfoBlock && !elemInfoBlock.children.length) {
      loadBodyNews(this);
    } else {
      slidePanel(this);
    }
  }

}());