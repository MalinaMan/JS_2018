(function () {
  "use strict";

  const URL = 'http://content.guardianapis.com/search';
  const API_KEY = 'bbcec02b-3981-47d2-93ae-64af9c164117';
  const STATUS_SUCCESS = 'ok';

  $("#header__refresh__button").click(loadNews);
  $(".page_change").click(changePage);
  $("#cur_page_number").change(changePage);

  function addErrorMessageNode(parent, errorText) {
    let errorElem = document.createElement('h3');
    errorElem.className = 'error-message';
    errorElem.innerHTML = "Sorry, we couldn't find news for you. Please try again later.<br>" + errorText;
    return parent.appendChild(errorElem);
  }


  function validationRequest(data) {
    return (('response' in data) && (data.response.status === STATUS_SUCCESS));
  }


  function removeAllChild(parent) {
    while (parent.firstChild) {
      parent.removeChild(parent.firstChild);
    }
  }


  function sendAJAXrequest(url) {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    xhr.send();
    return xhr;
  }


  function actionInitPaginator(maxPages) {
    $('.paginator *').show();
    let elemCurPage = $('#cur_page_number');
    elemCurPage.val(1);
    elemCurPage.attr({'value': 1, 'max': maxPages});
    elemCurPage.next().text(`of ${maxPages} pages`);

    refreshAvailabilityButton(1, maxPages);
  }

  
  function loadNews() {
    
    const URL_NEWS_API = URL + '?api-key=' + API_KEY;
    let button = $("#header__refresh__button");
    let wrapper = document.getElementById('wrapper');

    removeAllChild(wrapper);

    let xhr = sendAJAXrequest(URL_NEWS_API);
    xhr.onreadystatechange = function() {
      if (this.readyState != 4) return;

      if (xhr.status != 200) {
        addErrorMessageNode(wrapper, "Error getting data = " + xhr.status + ': ' + xhr.statusText);
      } else {
        let data = JSON.parse(xhr.responseText);
        if (validationRequest(data)) {
          button.innerHTML = 'Refresh';
          button.disabled = false;
          actionInitPaginator(data.response.pages);

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

    let xhr = sendAJAXrequest(URL_NEWS_API);
    xhr.onreadystatechange = function() {
      if (this.readyState != 4) return;
      if (xhr.status !== 200) return;

      let data = JSON.parse(xhr.responseText);
      if (validationRequest(data) && addShortInfoBlock(elem.nextElementSibling, data.response.content)) {
        slidePanel(elem);
      }
    }

  }


  function loadNewsPage(page) {
    
    const URL_NEWS_API = `${URL}?page=${page}&api-key=${API_KEY}`;
    let wrapper = document.getElementById('wrapper');

    removeAllChild(wrapper);

    let xhr = sendAJAXrequest(URL_NEWS_API);
    xhr.onreadystatechange = function() {
      if (this.readyState != 4) return;

      if (xhr.status != 200) {
        addErrorMessageNode(wrapper, "Error getting data = " + xhr.status + ': ' + xhr.statusText);
      } else {
        let data = JSON.parse(xhr.responseText);
        if (validationRequest(data)) {
          let news = data.response.results;
          processData(news);
        }
        else {
          addErrorMessageNode(wrapper, "Format error: no properties name 'response'");
        }
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
      let shortText = bodyBlocks[0].bodyTextSummary;
      let elemShortText = document.createElement('p');
      elemShortText.innerText = shortText.slice(0, shortText.indexOf(' ', 300));
      elem.appendChild(elemShortText);

      let elemLinkNews = document.createElement('a');
      elemLinkNews.href = content.webUrl;
      elemLinkNews.appendChild(document.createTextNode('Read full news'));
      elemLinkNews.setAttribute('target', '_blank');
      return elem.appendChild(elemLinkNews);
    }

    return false;
  }


  function refreshAvailabilityButton(nextPage, maxPage) {
    let statePrev = (nextPage > 1);
    let stateNext = (nextPage < maxPage);
    $('#page_previous').attr('disabled', !statePrev);
    $('#page_next').attr('disabled', !stateNext);
  }


  function changePage(e) {
    let elemInputCurPage = $('#cur_page_number');
    let curPage = elemInputCurPage.val();
    let maxPage = +elemInputCurPage.attr('max');
    let nextPage = +curPage;

    let elemTarget = $(e.target);
    let targetId = elemTarget.attr('id');
    if (targetId === 'page_next') {
      if (nextPage === maxPage) {
        return;
      }
      nextPage++;
    } else if (targetId === 'page_previous') {
      if (nextPage === 1) {
        return;
      }
      nextPage--;
    } else if (targetId === 'cur_page_number') {
      if (nextPage < 1) nextPage = 1;
      else if (nextPage > maxPage) nextPage = maxPage;
    }

    elemInputCurPage.val(nextPage);
    refreshAvailabilityButton(nextPage, maxPage);
    loadNewsPage(nextPage);
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